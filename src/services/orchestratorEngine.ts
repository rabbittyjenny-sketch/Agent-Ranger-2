/**
 * Orchestrator Engine
 * Smart Routing, Intent Recognition, Fact Checking & Data Guard
 */

import { Agent, getAllAgents, getAgentById, getAgentsByCluster } from '../data/agents';
import { MasterContext, routingKeywords, factCheckValidators, systemCoreRules, TaskSpecificPrompt, getTaskPrompts } from '../data/intelligence';
import { dataGuardian, DataGuardReport } from './dataGuardService';
import { findBestRoute, RoutingDecision, JobRequest, validateAgentOutput as quickValidate } from '../data/agent-routing';
import { responsibilityMatrices, validateDependencies, getWorkflowOrder } from '../data/agent-responsibilities';
import { validateAgentOutput } from '../data/validation-rules';
import type { ValidationResult } from '../data/validation-rules';

export interface RoutingResult extends RoutingDecision {
  agent: Agent | null;
  cluster: string;
}

export interface FactCheckResult {
  valid: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
  dataGuardReport?: DataGuardReport;
}

export type { ValidationResult };

export class OrchestratorEngine {
  private masterContext: MasterContext | null = null;
  private agentTaskData: Map<string, Record<string, any>> = new Map();
  private agentFirstUseTracked: Set<string> = new Set();
  private completedAgents: string[] = [];

  /**
   * Initialize with Master Context (Brand Data)
   */
  setMasterContext(context: MasterContext): void {
    this.masterContext = context;
  }

  getMasterContext(): MasterContext | null {
    return this.masterContext;
  }

  /**
   * Check dependencies for an agent
   * Step 3 of 6-Step Workflow
   */
  checkReadiness(agentId: string): { isReady: boolean; missingDependencies: string[] } {
    return validateDependencies(agentId, this.completedAgents);
  }

  /**
   * Track completed agents for dependency management
   */
  markAgentCompleted(agentId: string): void {
    if (!this.completedAgents.includes(agentId)) {
      this.completedAgents.push(agentId);
    }
  }

  // ========================================
  // Part B: Task-Specific Data Collection
  // ========================================

  /**
   * Check if an agent needs task-specific data (Part B) before first use
   */
  needsTaskSpecificData(agentId: string): boolean {
    if (this.agentFirstUseTracked.has(agentId)) return false;
    const prompts = getTaskPrompts(agentId);
    return !!prompts;
  }

  /**
   * Get the task-specific questions for an agent
   */
  getTaskSpecificQuestions(agentId: string): TaskSpecificPrompt | undefined {
    return getTaskPrompts(agentId);
  }

  /**
   * Store task-specific data collected from the user (Part B)
   */
  setTaskSpecificData(agentId: string, data: Record<string, any>): void {
    this.agentTaskData.set(agentId, data);
    this.agentFirstUseTracked.add(agentId);
  }

  /**
   * Get stored task-specific data for an agent
   */
  getTaskSpecificData(agentId: string): Record<string, any> | undefined {
    return this.agentTaskData.get(agentId);
  }

  /**
   * Build complete context for an agent (Part A + Part B combined)
   * With Smart Lazy Data Distribution: Send only relevant data based on agent cluster
   */
  buildAgentContext(agentId: string): { masterContext: MasterContext | null; taskData: Record<string, any> | undefined } {
    // Get agent details to determine which cluster
    const agent = getAgentById(agentId);
    const cluster = agent?.cluster;

    // Smart Lazy: Filter context based on cluster
    let contextToSend = this.masterContext;
    if (contextToSend && cluster) {
      contextToSend = this.getContextByCluster(contextToSend, cluster);
    }

    return {
      masterContext: contextToSend,
      taskData: this.agentTaskData.get(agentId)
    };
  }

  /**
   * Smart Lazy Data Distribution
   * Filter MasterContext based on agent cluster - send only relevant buckets
   * + Allow cross-data access when needed (e.g., Agency gets USP from Strategist)
   */
  private getContextByCluster(context: MasterContext, cluster: string): MasterContext {
    const baseContext = {
      // Always include identification
      brandId: context.brandId,
      brandNameTh: context.brandNameTh,
      brandNameEn: context.brandNameEn,
      industry: context.industry,
      createdAt: context.createdAt,
      lastUpdated: context.lastUpdated,

      // Default empty values to prevent undefined
      coreUSP: context.coreUSP || [],
      visualStyle: context.visualStyle,
      toneOfVoice: context.toneOfVoice || 'professional' as const,
    };

    switch (cluster) {
      case 'strategy':
        // The Strategy Team: Full strategy_data + analytics fields
        return {
          ...baseContext,
          coreUSP: context.coreUSP,
          businessModel: context.businessModel,
          competitors: context.competitors,
          legalInfo: context.legalInfo,
          // Useful for analysis
          targetAudience: context.targetAudience,
          visualStyle: context.visualStyle,
          toneOfVoice: context.toneOfVoice,
        };

      case 'creative':
        // The Creative Team: Visual identity + creative_data
        return {
          ...baseContext,
          coreUSP: context.coreUSP, // For USP visual integration
          visualStyle: context.visualStyle, // Full visual system
          targetAudience: context.targetAudience, // For design context
          targetPersona: context.targetPersona, // For user-centric design
          toneOfVoice: context.toneOfVoice, // For brand voice alignment
        };

      case 'growth':
        // The Agency: Audience + communication + cross-data (USP for sales hook)
        return {
          ...baseContext,
          coreUSP: context.coreUSP, // CROSS-DATA: For caption sales hook
          targetAudience: context.targetAudience,
          targetPersona: context.targetPersona,
          painPoints: context.painPoints,
          toneOfVoice: context.toneOfVoice,
          forbiddenWords: context.forbiddenWords,
          brandHashtags: context.brandHashtags,
          automationNeeds: context.automationNeeds,
          // Useful for content strategy
          businessModel: context.businessModel,
        };

      default:
        // Default: Return full context if cluster unknown
        return context;
    }
  }

  // ========================================
  // Anti-Copycat & IP Protection Rules
  // ========================================

  /**
   * Rule 1: Brand Data Isolation
   * Enforces strict brand_id scoping for all data access
   */
  enforceBrandIsolation(requestedBrandId: string): { allowed: boolean; reason: string } {
    if (!this.masterContext) {
      return { allowed: false, reason: 'No brand context loaded' };
    }
    if (this.masterContext.brandId !== requestedBrandId) {
      return {
        allowed: false,
        reason: `Access denied: Cannot access data for brand "${requestedBrandId}". Current session is scoped to "${this.masterContext.brandId}".`
      };
    }
    return { allowed: true, reason: 'Brand isolation check passed' };
  }

  /**
   * Rule 2: Non-Plagiarism & Trademark Check
   * Ensures AI output is original and doesn't violate trademarks
   */
  checkPlagiarismAndTrademark(content: string): { passed: boolean; issues: string[] } {
    const issues: string[] = [];

    // Known trademark patterns (expandable)
    const trademarkPatterns = [
      /just do it/gi,
      /think different/gi,
      /i'm lovin' it/gi,
      /because you're worth it/gi,
      /impossible is nothing/gi,
      /open happiness/gi,
      /taste the rainbow/gi,
      /have it your way/gi,
      /finger lickin' good/gi,
      /the happiest place on earth/gi
    ];

    for (const pattern of trademarkPatterns) {
      if (pattern.test(content)) {
        issues.push(`Trademark violation detected: "${content.match(pattern)?.[0]}". Must rephrase using brand's own voice.`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  /**
   * Rule 3: Art Style Protection
   * Prevents mimicking real artists - uses mood keywords instead
   */
  checkArtStyleProtection(prompt: string): { passed: boolean; suggestion: string } {
    const protectedArtists = [
      'picasso', 'van gogh', 'monet', 'warhol', 'banksy', 'kaws',
      'basquiat', 'hirst', 'kusama', 'murakami', 'ai weiwei',
      'frida kahlo', 'salvador dali', 'rembrandt', 'klimt',
      'hokusai', 'pollock', 'rothko', 'lichtenstein'
    ];

    const promptLower = prompt.toLowerCase();
    const foundArtist = protectedArtists.find(artist => promptLower.includes(artist));

    if (foundArtist) {
      const moodKeywords = this.masterContext?.visualStyle?.moodKeywords || ['modern', 'creative'];
      return {
        passed: false,
        suggestion: `Cannot mimic "${foundArtist}" style. Use brand mood keywords instead: "${moodKeywords.join(', ')}". Example: Replace "Picasso style" with "${moodKeywords[0]} and abstract composition".`
      };
    }

    return { passed: true, suggestion: '' };
  }

  /**
   * Run all IP protection checks on content
   */
  runIPProtectionChecks(content: string): {
    isolation: { allowed: boolean; reason: string };
    plagiarism: { passed: boolean; issues: string[] };
    artStyle: { passed: boolean; suggestion: string };
    overallPassed: boolean;
  } {
    const isolation = this.masterContext
      ? this.enforceBrandIsolation(this.masterContext.brandId)
      : { allowed: false, reason: 'No context' };
    const plagiarism = this.checkPlagiarismAndTrademark(content);
    const artStyle = this.checkArtStyleProtection(content);

    return {
      isolation,
      plagiarism,
      artStyle,
      overallPassed: isolation.allowed && plagiarism.passed && artStyle.passed
    };
  }

  /**
   * Intent Recognition - วิเคราะห์เจตนา
   * Returns which cluster(s) the user is asking about
   */
  recognizeIntent(userInput: string): string[] {
    const input = userInput.toLowerCase();
    const clusters: string[] = [];

    // Check for strategy keywords
    const strategyKeywords = routingKeywords.strategy;
    if (strategyKeywords.some(keyword => input.includes(keyword))) {
      clusters.push('strategy');
    }

    // Check for creative keywords
    const creativeKeywords = routingKeywords.creative;
    if (creativeKeywords.some(keyword => input.includes(keyword))) {
      clusters.push('creative');
    }

    // Check for growth keywords
    const growthKeywords = routingKeywords.growth;
    if (growthKeywords.some(keyword => input.includes(keyword))) {
      clusters.push('growth');
    }

    return clusters.length > 0 ? clusters : ['strategy']; // Default to strategy
  }

  /**
   * Smart Routing - ส่งงานไป Agent ที่เหมาะสม
   * Step 2 of 6-Step Workflow
   */
  route(userInput: string): RoutingResult {
    // extract keywords from input
    const keywords = userInput.split(/\s+/).filter(w => w.length > 2);

    const jobRequest: JobRequest = {
      intent: userInput,
      keywords,
      masterContext: this.masterContext
    };

    const decision = findBestRoute(jobRequest);
    const agent = getAgentById(decision.primaryAgent);

    return {
      ...decision,
      agent: agent || null,
      cluster: agent?.cluster || 'strategy'
    };
  }

  /**
   * Comprehensive Output Validation (REFACTORED)
   * Step 5 of 6-Step Workflow
   */
  validate(agentId: string, output: any): ValidationResult {
    return validateAgentOutput(agentId, output, this.masterContext);
  }

  /**
   * Legacy Fact Check (Mapped to new Validation Layer)
   */
  factCheck(output: any): { valid: boolean; violations: string[]; warnings: string[]; recommendations: string[] } {
    // Identify agent if possible from content (this is a fallback)
    const validation = validateAgentOutput('orchestrator', output, this.masterContext);

    return {
      valid: validation.passed,
      violations: validation.issues.filter(i => i.severity === 'critical').map(i => i.message),
      warnings: validation.issues.filter(i => i.severity === 'warning').map(i => i.message),
      recommendations: validation.recommendations
    };
  }

  /**
   * Isolation Check - ตรวจสอบ Brand Data Isolation
   */
  checkIsolation(brandId: string): boolean {
    if (!this.masterContext) return false;
    return this.masterContext.brandId === brandId;
  }

  /**
   * Anti-Copycat Check - ป้องกันการเลียนแบบ
   */
  antiCopycatCheck(originalText: string, newText: string): FactCheckResult {
    const result: FactCheckResult = {
      valid: true,
      violations: [],
      warnings: [],
      recommendations: []
    };

    const similarity = this.calculateSimilarity(originalText, newText);

    if (similarity > 0.9) {
      result.valid = false;
      result.violations.push('❌ ข้อความใหม่มีความคล้ายคลึงกับต้นฉบับ > 90% (Plagiarism Risk)');
      result.recommendations.push('✓ ให้ Rephrase ข้อความให้เข้ากับ Brand Voice มากขึ้น');
    } else if (similarity > 0.7) {
      result.warnings.push('⚠️ ความคล้ายคลึง > 70% - อาจจำเป็นปรับปรุง');
      result.recommendations.push('✓ พิจารณา Rephrase บางส่วน');
    }

    return result;
  }

  /**
   * Cross-Agent Logic Helper
   * Allows agents to fetch relevant data from other clusters
   */
  getCrossAgentContext(currentAgentId: string, dataType: 'brand' | 'tone' | 'visuals'): any {
    if (!this.masterContext) return null;

    const agent = getAgentById(currentAgentId);
    if (!agent) return null;

    switch (dataType) {
      case 'brand':
        return {
          brandName: this.masterContext.brandNameTh,
          brandNameEn: this.masterContext.brandNameEn,
          coreUSP: this.masterContext.coreUSP
        };
      case 'tone':
        return {
          toneOfVoice: this.masterContext.toneOfVoice,
          moodKeywords: this.masterContext.visualStyle.moodKeywords
        };
      case 'visuals':
        return {
          primaryColor: this.masterContext.visualStyle.primaryColor,
          moodKeywords: this.masterContext.visualStyle.moodKeywords
        };
      default:
        return null;
    }
  }

  /**
   * Helper: Check for hallucination indicators
   */
  private hasHallucinationIndicators(text: string): boolean {
    const hallucIndicators = [
      'ตามรายงาน', 'ตามข้อมูล', 'พบว่า', 'วิจัย',
      'report', 'research', 'study', 'found', 'data shows'
    ];

    return hallucIndicators.some(indicator => text.toLowerCase().includes(indicator));
  }

  /**
   * Helper: Check consistency with USP
   */
  private isConsistentWithUSP(text: string): boolean {
    if (!this.masterContext) return true;

    const uspArray = Array.isArray(this.masterContext.coreUSP) ? this.masterContext.coreUSP : [this.masterContext.coreUSP];
    const usp = uspArray.join(' ').toLowerCase();
    const textLower = text.toLowerCase();

    // Simple check: if USP mentions "eco" and text mentions "plastic", it's inconsistent
    const ecoIndicators = ['eco', 'sustainable', 'green', 'organic', 'natural'];
    const plasticIndicators = ['plastic', 'disposable', 'artificial'];

    const hasEco = ecoIndicators.some(ind => usp.includes(ind));
    const hasPlastic = plasticIndicators.some(ind => textLower.includes(ind));

    if (hasEco && hasPlastic) return false;

    return true;
  }

  /**
   * Helper: Calculate text similarity (Levenshtein-based)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const s1 = text1.toLowerCase();
    const s2 = text2.toLowerCase();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Helper: Levenshtein distance for similarity calculation
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let k = 0; k <= s1.length; k++) costs[k] = k;

    let minCost = 0;
    let maxCost = 0;

    for (let i = 1; i <= s2.length; i++) {
      minCost = i;
      maxCost = i - 1;

      for (let j = 1; j <= s1.length; j++) {
        const newCost = Math.min(
          maxCost + 1,
          costs[j] + 1,
          costs[j - 1] + (s1.charAt(j - 1) === s2.charAt(i - 1) ? 0 : 1)
        );
        costs[j - 1] = maxCost;
        maxCost = newCost;
      }

      costs[s1.length] = maxCost;
    }

    return maxCost;
  }

  /**
   * Generate System Summary
   */
  generateSystemSummary(): string {
    if (!this.masterContext) {
      return '❌ ไม่พบ Master Context - โปรดทำการ Onboarding ก่อน';
    }

    const taskDataCount = this.agentTaskData.size;

    return `
✅ Orchestrator Status: READY
📍 Brand: ${this.masterContext.brandNameTh} (${this.masterContext.brandNameEn})
🎯 USP: ${this.masterContext.coreUSP}
🎨 Tone: ${this.masterContext.toneOfVoice}
👥 Target: ${this.masterContext.targetAudience}

Agents Ready:
  📊 The Strategist: Market Analyst, Business Planner, Insights Agent
  🎨 The Studio: Brand Builder, Design Agent, Video Generator (Art)
  🚀 The Agency: Caption Creator, Campaign Planner, Video Generator (Script)

Onboarding Data:
  ✅ Part A: Brand Foundation (Complete)
  📋 Part B: Task-Specific Data (${taskDataCount} agents configured)

System Rules Active (Layer 1 - Orchestrator):
  🔒 Rule 1: Brand Data Isolation (ห้ามแชร์ข้อมูลข้าม brand_id)
  🛡️ Rule 2: Non-Plagiarism & Trademark Protection (ห้ามคัดลอก + ห้ามละเมิดเครื่องหมายการค้า)
  🎨 Rule 3: Art Style Protection (ห้ามเลียนแบบศิลปิน ใช้ Mood Keywords แทน)
  ✅ 6-Layer Data Guard: Isolation → Anti-Copycat → Fact Check → USP → Reference → Consistency

IP Protection Policy:
  "ห้ามใช้ความลับทางการค้าจากแบรนด์อื่น ผลลัพธ์ทุกอย่างต้อง Customize ตาม brand_knowledge"
    `;
  }
}

// Export singleton instance
export const orchestratorEngine = new OrchestratorEngine();
