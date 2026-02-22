/**
 * Agent Routing & Job Classification System
 * Smart distribution + Anti-copycat + Confidence scoring
 */

export interface JobRequest {
  intent: string;
  keywords: string[];
  masterContext: any;
  previousOutputs?: {
    agentId: string;
    output: any;
    timestamp: Date;
  }[];
}

export interface RoutingDecision {
  primaryAgent: string;
  secondaryAgents: string[];
  confidence: number; // 0-1
  reasoning: string;
  validationRules: string[];
  anticopycat: {
    needsDedup: boolean;
    skipAgents: string[];
  };
}

/**
 * Job Classification Keywords → Agent Mapping
 * ใช้สำหรับ Intent Recognition
 */
export const jobClassification = {
  // Strategy Team Keywords
  MARKET_ANALYSIS: {
    agents: ['market-analyzer'],
    keywords: [
      'market',
      'competitor',
      'swot',
      'gap',
      'opportunity',
      'analysis',
      'research',
      'trend',
      'customer',
      'behavior'
    ],
    mustNotOverlapWith: ['positioning-strategist', 'customer-insight-specialist']
  },

  POSITIONING_STRATEGY: {
    agents: ['positioning-strategist'],
    keywords: [
      'positioning',
      'usp',
      'value',
      'pricing',
      'cost',
      'budget',
      'roi',
      'value proposition',
      'differentiation',
      'competitive advantage'
    ],
    mustNotOverlapWith: ['market-analyzer', 'customer-insight-specialist']
  },

  CUSTOMER_INSIGHTS: {
    agents: ['customer-insight-specialist'],
    keywords: [
      'customer',
      'journey',
      'persona',
      'kpi',
      'analytics',
      'performance',
      'insights',
      'data',
      'tracking',
      'monitoring'
    ],
    mustNotOverlapWith: ['market-analyzer', 'positioning-strategist']
  },

  // Creative Team Keywords
  VISUAL_DESIGN: {
    agents: ['visual-strategist'],
    keywords: [
      'design',
      'visual',
      'color',
      'typography',
      'logo',
      'ui',
      'ux',
      'layout',
      'aesthetic',
      'artwork',
      'icon',
      'image'
    ],
    mustNotOverlapWith: ['brand-voice-architect', 'narrative-designer']
  },

  BRAND_VOICE: {
    agents: ['brand-voice-architect'],
    keywords: [
      'tone',
      'voice',
      'brand',
      'personality',
      'mood',
      'communication',
      'identity',
      'value proposition',
      'emotion',
      'connection'
    ],
    mustNotOverlapWith: ['visual-strategist', 'narrative-designer']
  },

  NARRATIVE_STORY: {
    agents: ['narrative-designer'],
    keywords: [
      'story',
      'narrative',
      'origin',
      'values',
      'emotion',
      'video',
      'theme',
      'storyboard',
      'cinematography',
      'composition'
    ],
    mustNotOverlapWith: ['visual-strategist', 'brand-voice-architect']
  },

  // Growth Team Keywords
  CONTENT_STRATEGY: {
    agents: ['content-creator'],
    keywords: [
      'caption',
      'copy',
      'content',
      'hook',
      'cta',
      'script',
      'video',
      'scene',
      'production',
      'copywriting',
      'engagement'
    ],
    mustNotOverlapWith: ['campaign-planner']
  },

  CAMPAIGN_PLANNING: {
    agents: ['campaign-planner'],
    keywords: [
      'campaign',
      'calendar',
      'content schedule',
      '30 days',
      'promotion',
      'trend',
      'schedule',
      'planning'
    ],
    mustNotOverlapWith: ['content-creator']
  },

  AUTOMATION_SETUP: {
    agents: ['automation-specialist'],
    keywords: [
      'automation',
      'workflow',
      'schedule',
      'email',
      'crm',
      'batch',
      'posting',
      'integration',
      'zapier',
      'mailchimp',
      'process',
      'trigger',
      'bottleneck'
    ],
    mustNotOverlapWith: ['campaign-planner']
  },

  ANALYTICS_MEASUREMENT: {
    agents: ['analytics-master'],
    keywords: [
      'kpi',
      'analytics',
      'metrics',
      'dashboard',
      'performance',
      'tracking',
      'report',
      'measurement',
      'data'
    ],
    mustNotOverlapWith: ['customer-insight-specialist']
  }
};

/**
 * Smart Routing Logic
 * ใช้สำหรับหา Agent ที่เหมาะสม
 */
export function findBestRoute(request: JobRequest): RoutingDecision {
  const matches: {
    jobType: string;
    agents: string[];
    score: number;
    keywords: string[];
  }[] = [];

  // Score each job type
  for (const [jobType, config] of Object.entries(jobClassification)) {
    const matchedKeywords = request.keywords.filter(k =>
      config.keywords.some(jk => jk.toLowerCase().includes(k.toLowerCase()))
    );

    if (matchedKeywords.length > 0) {
      const score = matchedKeywords.length / config.keywords.length;
      matches.push({
        jobType,
        agents: config.agents,
        score,
        keywords: matchedKeywords
      });
    }
  }

  // Sort by score
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return {
      primaryAgent: 'orchestrator',
      secondaryAgents: [],
      confidence: 0,
      reasoning: 'ไม่พบ Agent ที่เหมาะสม - ต้องการข้อมูลเพิ่มเติม',
      validationRules: ['ask_for_clarification'],
      anticopycat: {
        needsDedup: false,
        skipAgents: []
      }
    };
  }

  const topMatch = matches[0];
  const primaryAgent = topMatch.agents[0];
  const secondaryAgents = matches
    .slice(1, 3)
    .flatMap(m => m.agents)
    .filter(a => a !== primaryAgent);

  // Anti-copycat: find agents that should NOT work
  const config = jobClassification[topMatch.jobType as keyof typeof jobClassification];
  const skipAgents = config.mustNotOverlapWith || [];

  return {
    primaryAgent,
    secondaryAgents: Array.from(new Set(secondaryAgents)), // Dedup
    confidence: Math.min(1, topMatch.score),
    reasoning: `ตรงกับ "${topMatch.jobType}" - Keywords: ${topMatch.keywords.join(', ')}`,
    validationRules: [
      'check_output_format',
      'verify_consistency',
      'validate_constraints'
    ],
    anticopycat: {
      needsDedup: skipAgents.length > 0,
      skipAgents
    }
  };
}

/**
 * Quick Output Validation (Lightweight version)
 * Use validation-rules.ts for comprehensive validation
 * This is for quick routing checks only
 */
export interface OutputValidation {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  confidence: number;
}

export function validateAgentOutput(
  agentId: string,
  output: any
): OutputValidation {
  const issues: string[] = [];
  const warnings: string[] = [];
  let confidence = 1.0;

  // Basic checks only
  if (!output || typeof output !== 'object') {
    issues.push(`Output ต้องเป็น Object - ได้รับ ${typeof output}`);
    return { isValid: false, issues, warnings, confidence: 0 };
  }

  // Check required fields
  const requiredFields = ['task', 'result', 'reasoning'];
  const missingFields = requiredFields.filter(f => !output[f]);

  if (missingFields.length > 0) {
    issues.push(`ขาดฟิลด์: ${missingFields.join(', ')}`);
    confidence -= missingFields.length * 0.15;
  }

  return {
    isValid: issues.length === 0 && confidence > 0.5,
    issues,
    warnings,
    confidence: Math.max(0, confidence)
  };
}

/**
 * Duplicate Job Detection
 * หลีกเลี่ยงการให้หลาย agents ทำงานเดียวกัน
 */
export function detectDuplicateWork(
  currentRequest: JobRequest,
  previousOutputs?: JobRequest['previousOutputs']
): { isDuplicate: boolean; duplicateAgents: string[] } {
  if (!previousOutputs || previousOutputs.length === 0) {
    return { isDuplicate: false, duplicateAgents: [] };
  }

  const duplicateAgents: string[] = [];
  const currentKeywords = new Set(currentRequest.keywords.map(k => k.toLowerCase()));

  for (const prevOutput of previousOutputs) {
    // ถ้า Intent เหมือน + Keywords ซ้อน > 50% = Duplicate
    if (prevOutput.output?.intent === currentRequest.intent) {
      duplicateAgents.push(prevOutput.agentId);
    }
  }

  return {
    isDuplicate: duplicateAgents.length > 0,
    duplicateAgents
  };
}

/**
 * Get Agent Responsibilities (สำหรับ Reference)
 */
export const agentResponsibilities: {
  [key: string]: {
    primary: string[];
    canCollaborate: string[];
    cannotDo: string[];
  };
} = {
  'market-analyzer': {
    primary: ['SWOT Analysis', 'Competitor Analysis', 'Market Gap Identification'],
    canCollaborate: ['positioning-strategist', 'customer-insight-specialist'],
    cannotDo: [
      'Positioning Strategy',
      'Design',
      'Content Creation',
      'Automation'
    ]
  },
  'positioning-strategist': {
    primary: ['Positioning Strategy', 'USP Development', 'Pricing Strategy'],
    canCollaborate: ['market-analyzer', 'customer-insight-specialist'],
    cannotDo: [
      'Market Analysis',
      'Design',
      'Content Creation',
      'Automation'
    ]
  },
  'customer-insight-specialist': {
    primary: ['Customer Journey Mapping', 'Persona Development', 'Performance Analysis'],
    canCollaborate: ['market-analyzer', 'positioning-strategist', 'analytics-master'],
    cannotDo: ['Design', 'Content Creation', 'Script Writing', 'Automation']
  },
  'visual-strategist': {
    primary: ['Visual Design', 'Logo Design', 'UI/UX Design'],
    canCollaborate: ['brand-voice-architect', 'narrative-designer'],
    cannotDo: [
      'Positioning Strategy',
      'Market Analysis',
      'Content Writing',
      'Automation'
    ]
  },
  'brand-voice-architect': {
    primary: ['Brand Voice', 'Tone of Voice', 'Communication Guidelines'],
    canCollaborate: ['visual-strategist', 'content-creator'],
    cannotDo: [
      'Positioning Strategy',
      'Market Analysis',
      'Visual Design',
      'Automation'
    ]
  },
  'narrative-designer': {
    primary: ['Brand Story', 'Narrative Strategy', 'Video Theme Direction'],
    canCollaborate: ['visual-strategist', 'brand-voice-architect', 'content-creator'],
    cannotDo: [
      'Caption Writing',
      'Positioning Strategy',
      'Market Analysis',
      'Automation'
    ]
  },
  'content-creator': {
    primary: ['Caption Strategy', 'Copywriting Framework', 'Script Planning', 'Video Production Flow'],
    canCollaborate: ['brand-voice-architect', 'narrative-designer', 'campaign-planner'],
    cannotDo: [
      'Visual Design',
      'Positioning Strategy',
      'Market Analysis',
      'Automation'
    ]
  },
  'campaign-planner': {
    primary: ['Content Calendar', 'Campaign Strategy', 'Trend Integration'],
    canCollaborate: ['content-creator', 'analytics-master', 'automation-specialist'],
    cannotDo: [
      'Design',
      'Positioning Strategy',
      'Market Analysis',
      'Video Creation'
    ]
  },
  'automation-specialist': {
    primary: [
      'Workflow Automation',
      'Content Scheduling',
      'Make.com Integration'
    ],
    canCollaborate: ['campaign-planner', 'analytics-master'],
    cannotDo: [
      'Design',
      'Content Writing',
      'Positioning Strategy',
      'Market Analysis',
      'Brand Strategy'
    ]
  },
  'analytics-master': {
    primary: ['KPI Tracking', 'Dashboard Design', 'Performance Reporting'],
    canCollaborate: ['customer-insight-specialist', 'campaign-planner', 'automation-specialist'],
    cannotDo: [
      'Design',
      'Content Writing',
      'Market Analysis',
      'Brand Strategy',
      'Automation'
    ]
  }
};
