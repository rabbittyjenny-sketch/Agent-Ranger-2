/**
 * AI Service
 * Handles agent communication and response generation
 * Integrated with Database Service for data persistence
 */

import { Agent, getAgentById } from '../data/agents';
import { MasterContext } from '../data/intelligence';
import { orchestratorEngine, RoutingResult, FactCheckResult } from './orchestratorEngine';
import { databaseService, MessageRecord } from './databaseService';
import { databaseContextService, getAgentContext, recordLearning } from './databaseContextService';

export interface AIResponse {
  agentId: string;
  agentName: string;
  cluster: string;
  content: string;
  rawOutput: string;
  factCheckResult: FactCheckResult;
  confidence: number;
  timestamp: string;
}

export interface MessageRequest {
  userInput: string;
  brandId?: string;
  context?: MasterContext;
  forceAgent?: string; // Force specific agent
  attachments?: Array<{ name: string; type: string; size: number; data?: string }>;
}

class AIService {
  private conversationHistory: AIResponse[] = [];
  private masterContext: MasterContext | null = null;
  // Per-agent conversation history for multi-turn context
  private chatHistories: Map<string, Array<{ role: 'user' | 'assistant'; content: string }>> = new Map();

  /**
   * Initialize service with brand context
   */
  initialize(context: MasterContext): void {
    this.masterContext = context;
    orchestratorEngine.setMasterContext(context);
  }

  /**
   * Safely save to database without blocking the response flow
   */
  private async safeSave(operation: () => Promise<any>, label: string): Promise<void> {
    try {
      await operation();
    } catch (err) {
      console.warn(`[AI Service] Non-blocking DB save failed (${label}):`, err);
    }
  }

  /**
   * Process user message and generate response
   */
  async processMessage(request: MessageRequest): Promise<AIResponse> {
    console.log('[AIService] processMessage called', request);

    // 1. SET CONTEXT (Step 1: Analyze Intent)
    if (request.context && Object.keys(request.context).length > 0) {
      this.initialize(request.context);
    }

    if (!this.masterContext) {
      console.warn('[AI Service] Master Context not initialized. Using default fallback.');
      this.masterContext = {
        brandId: 'temp_guest',
        brandNameTh: 'ลูกค้าทั่วไป',
        brandNameEn: 'Guest Brand',
        industry: 'ธุรกิจทั่วไป',
        coreUSP: ['บริการคุณภาพ'],
        visualStyle: { primaryColor: '#5E9BEB', moodKeywords: ['professional'] },
        targetAudience: 'ผู้ใช้งานทั่วไป',
        toneOfVoice: 'professional',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isDefault: true
      } as any;
      orchestratorEngine.setMasterContext(this.masterContext as MasterContext);
    }

    const context = this.masterContext as MasterContext;
    const brandIdStr = request.brandId || context.brandId || '1';
    const numericBrandId = parseInt(String(brandIdStr)) || 1;

    // Save user message (non-blocking)
    const userMessage: MessageRecord = {
      brandId: numericBrandId,
      role: 'user',
      content: request.userInput,
      attachments: request.attachments?.map(f => ({ name: f.name, type: f.type, size: f.size })),
      createdAt: new Date()
    };
    this.safeSave(() => databaseService.saveMessage(userMessage), 'user message');

    // 2. ROUTE JOB (Step 2)
    let routingResult: RoutingResult;
    if (request.forceAgent) {
      const forcedAgent = getAgentById(request.forceAgent);
      if (forcedAgent) {
        routingResult = {
          primaryAgent: forcedAgent.id,
          secondaryAgents: [],
          confidence: 1.0,
          reasoning: `Forced to agent: ${forcedAgent.name}`,
          agent: forcedAgent,
          cluster: forcedAgent.cluster,
          validationRules: [],
          anticopycat: { needsDedup: false, skipAgents: [] }
        };
      } else {
        routingResult = orchestratorEngine.route(request.userInput);
      }
    } else {
      routingResult = orchestratorEngine.route(request.userInput);
    }

    if (!routingResult.agent) {
      console.error('[AIService] Routing failed - no agent found');
      throw new Error('Could not route to appropriate agent');
    }

    const agent = routingResult.agent!;
    console.log('[AIService] Routed to agent:', agent.name);

    // 3. CHECK READINESS (Step 3)
    // When user force-selects an agent (forceAgent), we skip hard blocking and
    // only show a soft advisory — the agent still runs and responds.
    // Hard blocking only applies to auto-routed requests without forceAgent.
    const readiness = orchestratorEngine.checkReadiness(agent.id);
    let workflowAdvisory = '';
    if (!readiness.isReady) {
      if (request.forceAgent) {
        // Soft warning: note recommended predecessors but proceed anyway
        const missing = readiness.missingDependencies.join(', ');
        workflowAdvisory = `\n\n---\n💡 **เคล็ดลับ:** สำหรับผลลัพธ์ที่ดีที่สุด แนะนำให้คุยกับ **${missing}** ก่อน เพื่อให้ฉันมีข้อมูลบริบทที่ครบถ้วน — แต่ฉันจะช่วยคุณได้เลยค่ะ!`;
        // Mark implied predecessors as completed so we don't block further
        readiness.missingDependencies.forEach(depId => orchestratorEngine.markAgentCompleted(depId));
      } else {
        // Auto-routed without forceAgent: hard block
        const missing = readiness.missingDependencies.join(', ');
        const response: AIResponse = {
          agentId: 'orchestrator',
          agentName: 'Orchestrator',
          cluster: 'strategy',
          content: `⚠️ ยังไม่สามารถเริ่มงาน "${agent.name}" ได้ เนื่องจากขาดข้อมูลจาก: ${missing}\nกรุณาสลับไปใช้ Ranger ที่เกี่ยวข้องก่อนค่ะ`,
          rawOutput: 'Dependency check failed',
          factCheckResult: { valid: false, violations: [missing], warnings: [], recommendations: [`Run ${missing} first`] },
          confidence: 0,
          timestamp: new Date().toISOString()
        };
        return response;
      }
    }

    // Fetch database context
    const dbContext = await getAgentContext(numericBrandId, agent.cluster);

    // 4. EXECUTE (Step 4)
    console.log('[AIService] Generating agent response...');
    let agentResponse = await this.generateAgentResponse(
      agent,
      request.userInput,
      context,
      dbContext
    );

    // 5. VALIDATE OUTPUT (Step 4 -> 5)
    // Try to parse JSON if structured output is expected
    let parsedOutput = agentResponse;
    try {
      if (agentResponse.trim().startsWith('{')) {
        parsedOutput = JSON.parse(agentResponse);
      }
    } catch (e) {
      console.warn('[AIService] Response is not valid JSON, validating as string');
    }

    let validationResult = orchestratorEngine.validate(agent.id, parsedOutput);

    // Smart Retry
    if (!validationResult.passed && !agentResponse.includes('[System Note:')) {
      console.log(`[AIService] Validation failed (Score: ${validationResult.score}). Retrying...`);
      agentResponse = await this.generateAgentResponse(
        agent,
        `${request.userInput}\n\n[System Note: ผลลัพธ์ก่อนหน้าไม่ผ่านเกณฑ์การตรวจสอบ กรุณาปรับปรุงดังนี้: ${validationResult.recommendations.join(', ')}]`,
        context,
        dbContext
      );
      validationResult = orchestratorEngine.validate(agent.id, agentResponse);
    }

    // 6. STORE & LEARN (Step 6)
    orchestratorEngine.markAgentCompleted(agent.id);

    const legacyFactCheck: FactCheckResult = {
      valid: validationResult.passed,
      violations: validationResult.issues.filter(i => i.severity === 'critical').map(i => i.message),
      warnings: validationResult.issues.filter(i => i.severity === 'warning').map(i => i.message),
      recommendations: validationResult.recommendations
    };

    const aiResponse: AIResponse = {
      agentId: agent.id,
      agentName: agent.name,
      cluster: agent.cluster,
      content: this.formatResponse(agentResponse, legacyFactCheck) + workflowAdvisory,
      rawOutput: agentResponse,
      factCheckResult: legacyFactCheck,
      confidence: routingResult.confidence,
      timestamp: new Date().toISOString()
    };

    // Save agent message (non-blocking)
    const agentMessage: MessageRecord = {
      brandId: numericBrandId,
      role: 'agent',
      agentId: agent.id,
      agentName: agent.name,
      content: aiResponse.content,
      confidence: routingResult.confidence,
      validationResults: legacyFactCheck as any,
      createdAt: new Date()
    };
    this.safeSave(() => databaseService.saveMessage(agentMessage), 'agent response');

    // Agent Learning (non-blocking)
    const insight = this.extractInsightFromResponse(agent.id, request.userInput, agentResponse);
    if (insight) {
      const fieldsUsed = dbContext
        ? databaseContextService.getFieldsUsedByAgent(agent.id, dbContext)
        : [];

      this.safeSave(
        () => recordLearning(
          numericBrandId,
          agent.id,
          agent.name,
          insight,
          fieldsUsed,
          routingResult.confidence
        ),
        'agent learning'
      );
    }

    this.conversationHistory.push(aiResponse);
    return aiResponse;
  }

  /**
   * Generate agent response via API or fallback
   */
  private async generateAgentResponse(
    agent: Agent,
    userInput: string,
    context: MasterContext,
    dbContext?: any
  ): Promise<string> {
    try {
      return await this.callClaudeAPI(agent, userInput, context, dbContext);
    } catch (apiError: any) {
      console.warn('[AIService] Claude API failed, using fallback:', apiError.message);
      const text = this.generateFallbackResponse(agent.id, userInput, context, dbContext);
      return `[System Note: ระบบใช้โหมดออฟไลน์ กรุณาตรวจสอบ API Key]\n\n${text}`;
    }
  }

  /**
   * Actual API Call to Claude — includes conversation history for multi-turn context
   */
  private async callClaudeAPI(
    agent: Agent,
    userInput: string,
    context: MasterContext,
    dbContext?: any
  ): Promise<string> {
    const model = (import.meta as any).env?.VITE_CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
    const contextMsg = this.buildContextMessage(agent, context, dbContext);

    // Get per-agent conversation history (last 10 turns max)
    const agentHistory = this.chatHistories.get(agent.id) || [];
    const recentHistory = agentHistory.slice(-10);

    // Build messages array: prior turns + new user message
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // First message includes brand context to ground the conversation
    if (recentHistory.length === 0) {
      messages.push({ role: 'user', content: `${contextMsg}\n\n---\nคำถาม: ${userInput}` });
    } else {
      // On subsequent messages, inject context only in first message of history
      const [first, ...rest] = recentHistory;
      messages.push({
        role: first.role,
        content: first.role === 'user' ? `${contextMsg}\n\n---\nคำถาม: ${first.content}` : first.content
      });
      messages.push(...rest);
      messages.push({ role: 'user', content: userInput });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Support user-provided API key stored in localStorage (UI settings)
    const userApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('socialFactory_anthropicKey') : null;
    const apiUrl = userApiKey ? 'https://api.anthropic.com/v1/messages' : '/api/anthropic/v1/messages';
    const apiHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userApiKey) {
      apiHeaders['x-api-key'] = userApiKey;
      apiHeaders['anthropic-version'] = '2023-06-01';
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: agent.systemPrompt,
          messages
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error (${response.status}): ${error}`);
      }

      const data = await response.json() as any;
      const assistantText = data.content?.find((b: any) => b.type === 'text')?.text || 'ไม่ได้รับคำตอบ';

      // Save to per-agent history for next turn
      const updatedHistory = [...agentHistory, { role: 'user' as const, content: userInput }, { role: 'assistant' as const, content: assistantText }];
      this.chatHistories.set(agent.id, updatedHistory.slice(-20)); // keep last 20 messages

      return assistantText;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Build smart context message
   */
  private buildContextMessage(agent: Agent, context: MasterContext, dbContext?: any): string {
    const usps = Array.isArray(context.coreUSP) ? context.coreUSP : [context.coreUSP];
    let msg = `# BRAND: ${context.brandNameTh} (${context.brandNameEn})
## FOUNDATION
- Industry: ${context.industry}
- Model: ${context.businessModel || 'B2C'}
- USP: ${usps.join(', ')}`;

    if (agent.cluster === 'strategy') {
      msg += `\n## STRATEGY\n- Audience: ${context.targetAudience}\n- Tone: ${context.toneOfVoice}`;
      const comps = context.competitors || dbContext?.competitors || [];
      if (comps.length) msg += `\n- Competitors: ${comps.join(', ')}`;
    } else if (agent.cluster === 'creative') {
      const vs = context.visualStyle || {};
      msg += `\n## VISUAL\n- Color: ${vs.primaryColor}\n- Mood: ${(vs.moodKeywords || []).join(', ')}`;
    } else if (agent.cluster === 'growth') {
      msg += `\n## GROWTH\n- Persona: ${context.targetPersona || context.targetAudience}\n- Tone: ${context.toneOfVoice}`;
    }

    msg += `\n\nRespond in Thai unless asked otherwise.`;
    return msg;
  }

  /**
   * Insight extraction logic
   */
  private extractInsightFromResponse(agentId: string, input: string, response: string): string | null {
    if (!response || response.length < 50) return null;
    const lowInput = input.toLowerCase();

    if (agentId === 'market-analyzer' && lowInput.includes('swot')) return 'SWOT Analysis insight recorded';
    if (agentId === 'content-creator') return 'Content strategy pattern identified';

    return `${agentId} processed: ${input.substring(0, 50)}...`;
  }

  // --- Fallback Generator (used when API is unavailable) ---

  private generateFallbackResponse(agentId: string, input: string, context: MasterContext, dbContext?: any): string {
    const brand = context.brandNameTh || 'แบรนด์ของคุณ';
    const industry = context.industry || 'ธุรกิจ';
    const usps = Array.isArray(context.coreUSP) ? context.coreUSP.join(', ') : (context.coreUSP || 'คุณภาพดี');
    const audience = context.targetAudience || 'กลุ่มเป้าหมาย';
    const tone = context.toneOfVoice || 'professional';
    const mood = context.visualStyle?.moodKeywords?.join(', ') || 'modern';

    const templates: Record<string, string> = {
      'market-analyzer': `📊 **การวิเคราะห์ตลาดสำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**สิ่งที่ควรวิเคราะห์:**\n- กลุ่มลูกค้าเป้าหมายใน ${industry} ที่กำลังมองหา: ${usps}\n- คู่แข่งในตลาด ${industry} และ Market Positioning ของพวกเขา\n- ช่องว่างตลาด (Market Gap) ที่ ${brand} สามารถเข้าถึงได้\n\n**ขั้นตอนถัดไป:**\n- ระบุ Top 3 คู่แข่งหลักและจุดแข็ง/จุดอ่อน\n- ทำ SWOT Analysis เทียบกับ USP ของ ${brand}: ${usps}\n- หา Opportunity Zone ที่ยังไม่มีใครครอง\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key เพื่อรับการวิเคราะห์เชิงลึกจริง`,

      'positioning-strategist': `🎯 **Brand Positioning สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**Framework การกำหนดตำแหน่ง:**\n- **Who:** ${audience}\n- **What:** ${usps}\n- **Why Us:** เหตุผลที่เลือก ${brand} แทนคู่แข่ง\n- **How:** วิธีสื่อสารคุณค่าให้ตรงกลุ่ม\n\n**Positioning Statement (ร่าง):**\n"สำหรับ ${audience} ที่ต้องการ [ความต้องการ], ${brand} คือตัวเลือกที่ [${usps}] เพราะ [หลักฐาน]"\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'customer-insight-specialist': `👥 **Customer Journey สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**Persona เบื้องต้น:**\n- **กลุ่มเป้าหมาย:** ${audience}\n- **Pain Points ที่ ${brand} แก้ได้:** ${usps}\n- **Emotion Arc:** Awareness → Interest → Consideration → Purchase → Loyalty\n\n**Customer Journey Stages:**\n1. **Awareness** — พบ ${brand} จากช่องทางไหน?\n2. **Consideration** — เปรียบเทียบอะไรก่อนตัดสินใจ?\n3. **Purchase** — Trigger ที่ทำให้ซื้อ\n4. **Loyalty** — เหตุผลที่กลับมาซ้ำ\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'visual-strategist': `🎨 **Visual Identity สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**Visual DNA:**\n- **Mood Keywords:** ${mood}\n- **Primary Color:** ${context.visualStyle?.primaryColor || '#5E9BEB'}\n- **ธุรกิจ:** ${industry}\n\n**แนวทาง Visual System:**\n- **Typography:** เลือก Font ที่สื่อถึง Mood "${mood}"\n- **Color Palette:** Primary + Secondary + Accent + Neutral\n- **Layout Style:** สอดคล้องกับ Tone "${tone}"\n- **Photography Style:** ภาพที่สื่อถึง ${usps}\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'brand-voice-architect': `🗣️ **Brand Voice & Tone สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**Voice Profile:**\n- **Tone:** ${tone}\n- **Mood:** ${mood}\n- **อุตสาหกรรม:** ${industry}\n\n**Tone Matrix:**\n| สถานการณ์ | Tone ที่ใช้ | ตัวอย่างประโยค |\n|-----------|-----------|---------------|\n| โพสต์ทั่วไป | ${tone} | [ประโยคสั้นตรงใจ] |\n| Crisis Response | Formal | [เป็นทางการ, รับผิดชอบ] |\n| Promotion | Enthusiastic | [กระตุ้นความสนใจ] |\n\n**Do's:** ใช้ภาษา${tone}, อ้างอิง USP: ${usps}\n**Don'ts:** หลีกเลี่ยงภาษาที่ขัดกับ Mood: ${mood}\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'narrative-designer': `📚 **Brand Story สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**Story Architecture (Hero's Journey):**\n1. **ต้นกำเนิด** — ${brand} เริ่มต้นจากปัญหาอะไร?\n2. **ความท้าทาย** — อุปสรรคที่เจอในวงการ ${industry}\n3. **จุดเปลี่ยน** — ${usps} คือคำตอบที่ค้นพบ\n4. **พลัง** — คุณค่าที่มอบให้ ${audience}\n5. **วิสัยทัศน์** — อนาคตที่ ${brand} กำลังสร้าง\n\n**Core Message:**\n"${brand} ช่วย ${audience} [แก้ปัญหา] ด้วย ${usps}"\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'content-creator': `✨ **Content Strategy สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**ตัวอย่าง Caption (ร่าง):**\n\n**Hook:** [จุดดึงดูด — ปัญหา/คำถาม/คำพูดที่โดนใจ ${audience}]\n**Body:** ${usps} ที่ทำให้ ${brand} แตกต่าง\n**CTA:** [Call-to-Action ตรง ${tone}]\n\n**Content Ideas ตาม ${industry}:**\n- Behind the Scenes: กระบวนการที่สะท้อน ${usps}\n- Testimonial: ประสบการณ์จริงของ ${audience}\n- Educational: ความรู้ที่เกี่ยวข้องกับ ${industry}\n- Trend: เชื่อมโยง Brand กับ Trend ปัจจุบัน\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'campaign-planner': `📅 **Campaign Planning สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**โครงสร้าง Campaign 30 วัน:**\n\n**สัปดาห์ 1-2 (Awareness):** แนะนำ ${brand} และ ${usps}\n**สัปดาห์ 3 (Engagement):** เนื้อหาเจาะ ${audience} + Interactive\n**สัปดาห์ 4 (Conversion):** Offer + CTA เพื่อ Action\n\n**KPI เป้าหมาย:**\n- Reach: เข้าถึง ${audience}\n- Engagement Rate: ≥ 3%\n- Conversion: ตาม Business Goal\n\n**Channels ที่แนะนำสำหรับ ${industry}:**\nInstagram, Facebook, TikTok, LINE OA\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'automation-specialist': `⚙️ **Automation Workflow สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**Trigger-Condition-Action (TCA) Map:**\n\n| Trigger | Condition | Action |\n|---------|-----------|--------|\n| สมัครรับข่าวสาร | New Subscriber | ส่ง Welcome Email |\n| ไม่ได้ซื้อ 30 วัน | Inactive Customer | ส่ง Re-engagement |\n| ซื้อสินค้า | Post-Purchase | ส่ง Thank You + Upsell |\n\n**Stack ที่แนะนำสำหรับ ${industry}:**\n- CRM: HubSpot / Zoho\n- Email: Mailchimp / Klaviyo\n- Chat: LINE OA / Manychat\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,

      'analytics-master': `📊 **KPI Dashboard สำหรับ ${brand}**\n\n**คำถามของคุณ:** ${input}\n\n**KPI Hierarchy สำหรับ ${industry}:**\n\n**Tier 1 (Business):** Revenue, Customer Acquisition Cost, LTV\n**Tier 2 (Marketing):** Reach, CPM, CTR, Conversion Rate\n**Tier 3 (Content):** Engagement Rate, Saves, Shares\n\n**วิธีวัดความสำเร็จของ ${brand}:**\n- USP "${usps}" → วัดผ่าน Customer Satisfaction Score\n- กลุ่ม ${audience} → วัด Retention Rate\n- ${industry} Benchmark → เปรียบเทียบ Industry Average\n\n**Dashboard ที่แนะนำ:** Google Analytics 4 + Meta Business Suite\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key`,
    };

    return templates[agentId] || `💬 ได้รับคำถาม: "${input}"\n\nแบรนด์: ${brand} | อุตสาหกรรม: ${industry}\nUSP: ${usps}\n\n⚠️ ระบบออฟไลน์ กรุณาตรวจสอบ API Key เพื่อรับคำตอบจริงจาก Claude AI`;
  }

  private formatResponse(response: string, factCheck: FactCheckResult): string {
    let formatted = response;
    if (!factCheck.valid && factCheck.violations.length) {
      formatted += `\n\n⚠️ คำเตือน: ${factCheck.violations.join(', ')}`;
    }
    return formatted;
  }

  getConversationHistory(): AIResponse[] { return this.conversationHistory; }
  clearHistory(): void {
    this.conversationHistory = [];
    this.chatHistories.clear();
  }
  clearAgentHistory(agentId: string): void {
    this.chatHistories.delete(agentId);
  }
}

export const aiService = new AIService();
