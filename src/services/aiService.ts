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
    const readiness = orchestratorEngine.checkReadiness(agent.id);
    if (!readiness.isReady) {
      const missing = readiness.missingDependencies.join(', ');
      const response: AIResponse = {
        agentId: 'orchestrator',
        agentName: 'Orchestrator',
        cluster: 'strategy',
        content: `⚠️ ยังไม่สามารถเริ่มงาน "${agent.name}" ได้ เนื่องจากขาดข้อมูลจาก: ${missing}\nกรุณาสั่งให้ระบุข้อมูลดังกล่าว หรือสลับไปใช้ Agent ที่เกี่ยวข้องก่อนค่ะ`,
        rawOutput: 'Dependency check failed',
        factCheckResult: { valid: false, violations: [missing], warnings: [], recommendations: [`Run ${missing} first`] },
        confidence: 0,
        timestamp: new Date().toISOString()
      };
      return response;
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
      content: this.formatResponse(agentResponse, legacyFactCheck),
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
      console.warn('[AIService] Claude API failed, using legacy fallback:', apiError.message);

      const fallbacks: Record<string, string> = {
        'market-analyzer': this.generateMarketAnalyzerResponse(userInput, context, dbContext),
        'positioning-strategist': this.generatePositioningStrategistResponse(userInput, context, dbContext),
        'customer-insight-specialist': this.generateCustomerInsightResponse(userInput, context, dbContext),
        'visual-strategist': this.generateVisualStrategistResponse(userInput, context, dbContext),
        'brand-voice-architect': this.generateBrandVoiceResponse(userInput, context, dbContext),
        'narrative-designer': this.generateNarrativeDesignerResponse(userInput, context, dbContext),
        'content-creator': this.generateContentCreatorResponse(userInput, context, dbContext),
        'campaign-planner': this.generateCampaignResponse(userInput, context, dbContext),
        'analytics-master': this.generateAnalyticsMasterResponse(userInput, context, dbContext)
      };

      const text = fallbacks[agent.id] || `ขยายความ: ${userInput} (โหมดจำลอง)`;
      return `[System Note: ระบบใช้โหมดจำลองเนื่องจาก API ขัดข้อง]\n\n${text}`;
    }
  }

  /**
   * Actual API Call to Claude
   */
  private async callClaudeAPI(
    agent: Agent,
    userInput: string,
    context: MasterContext,
    dbContext?: any
  ): Promise<string> {
    const model = (import.meta as any).env?.VITE_CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
    const contextMsg = this.buildContextMessage(agent, context, dbContext);

    const messages = [
      { role: 'user', content: `${contextMsg}\n\nUser Request: ${userInput}` }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      return data.content?.find((b: any) => b.type === 'text')?.text || 'No response';
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

  // --- Fallback Generators ---

  private generateMarketAnalyzerResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `📊 การวิเคราะห์ตลาดเบื้องต้นสำหรับ ${context.brandNameTh} ในกลุ่ม ${context.industry}...`;
  }

  private generatePositioningStrategistResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `🎯 กำหนดตำแหน่งแบรนด์ (Positioning) สำหรับ ${context.brandNameTh}...`;
  }

  private generateCustomerInsightResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `👥 วิเคราะห์ Customer Journey สำหรับ ${context.targetAudience}...`;
  }

  private generateVisualStrategistResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `🎨 วางโครงสร้าง Visual Identity ตาม Mood: ${context.visualStyle?.moodKeywords?.join(', ') || 'Professional'}`;
  }

  private generateBrandVoiceResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `🗣️ วางแนวทาง Voice & Tone: ${context.toneOfVoice}`;
  }

  private generateNarrativeDesignerResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `📚 การวางโครงเรื่อง (Brand Story) สำหรับ ${context.brandNameTh}`;
  }

  private generateContentCreatorResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `✨ ร่างคอนเทนต์สำหรับกลุ่มเป้าหมาย ${context.targetAudience}`;
  }

  private generateCampaignResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `📅 วางแผนแคมเปญ 30 วัน สำหรับ ${context.industry}`;
  }

  private generateAnalyticsMasterResponse(input: string, context: MasterContext, dbContext?: any): string {
    return `📊 ตัวชี้วัดประสิทธิภาพ (KPIs) สำหรับ ${context.brandNameTh}`;
  }

  private formatResponse(response: string, factCheck: FactCheckResult): string {
    let formatted = response;
    if (!factCheck.valid && factCheck.violations.length) {
      formatted += `\n\n⚠️ คำเตือน: ${factCheck.violations.join(', ')}`;
    }
    return formatted;
  }

  getConversationHistory(): AIResponse[] { return this.conversationHistory; }
  clearHistory(): void { this.conversationHistory = []; }
}

export const aiService = new AIService();
