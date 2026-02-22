/**
 * Agent Responsibility Matrix
 * 10-Agent System: Strategy -> Creative -> Growth
 * ชัดว่า Agent ไหนทำไร + Dependencies + Workflow Order
 */

export interface ResponsibilityMatrix {
  agentId: string;
  agentName: string;
  cluster: 'strategy' | 'creative' | 'growth';

  // หน้าที่หลัก
  primaryResponsibilities: string[];

  // อะไรที่ต้องอิง (Input from)
  dependsOn: {
    agentId: string;
    reason: string;
  }[];

  // ใครต้องอิง output นี้ (Output to)
  requiredBy: {
    agentId: string;
    reason: string;
  }[];

  // ฟังก์ชันที่ห้าม (Conflicts)
  conflictsWith: {
    agentId: string;
    reason: string;
  }[];

  // ลำดับที่ควรทำ (Phase)
  executionPhase: 1 | 2 | 3;

  // Input Format ที่ต้องการ
  requiredInputs: string[];

  // Output Format
  expectedOutputs: string[];

  // Success Criteria
  successCriteria: string[];
}

/**
 * WORKFLOW PHASES:
 * Phase 1: STRATEGY (ทำก่อน - วิเคราะห์ตลาด + วางตำแหน่ง + เข้าใจลูกค้า)
 * Phase 2: CREATIVE (ต่อมา - Visual + Voice + Story)
 * Phase 3: GROWTH (Execution - Content + Campaign + Automation + Analytics)
 */

export const responsibilityMatrices: ResponsibilityMatrix[] = [
  // ============= PHASE 1: STRATEGY =============
  {
    agentId: 'market-analyzer',
    agentName: 'Market Analyzer',
    cluster: 'strategy',
    primaryResponsibilities: [
      'Market Analysis',
      'SWOT Analysis',
      'Competitor Benchmarking',
      'Market Gap Identification',
      'Trend Analysis'
    ],
    dependsOn: [], // ไม่ต้องอิงใครเลย - First step
    requiredBy: [
      { agentId: 'positioning-strategist', reason: 'ต้องรู้ตำแหน่งในตลาดและโอกาส เพื่อวาง Brand Positioning' },
      { agentId: 'customer-insight-specialist', reason: 'ต้องรู้ Market Context เพื่อวิเคราะห์ Customer Journey' },
      { agentId: 'visual-strategist', reason: 'ต้องรู้ตลาดและคู่แข่ง เพื่อออกแบบ Visual System ที่โดดเด่น' },
      { agentId: 'content-creator', reason: 'ต้องรู้ Target Audience และเทรนด์ เพื่อสร้าง Content ที่ตรงจุด' }
    ],
    conflictsWith: [
      { agentId: 'analytics-master', reason: 'Market Analyzer = Forward Looking, Analytics Master = Measurement & Tracking' }
    ],
    executionPhase: 1,
    requiredInputs: [
      'Master Context (Product Info)',
      'Target Audience Profile',
      'Business Goals',
      'Market Data (Optional)'
    ],
    expectedOutputs: [
      'SWOT Analysis Report',
      'Competitor Benchmarking Report',
      'Market Opportunities & Gaps',
      'Risks & Threats Assessment',
      'Trend Insights'
    ],
    successCriteria: [
      'Data-backed analysis (ต้องมี sources)',
      'Actionable insights (ไม่ใช่ทั่วไป)',
      'Clear positioning opportunities identified',
      'Risk assessment included',
      'Competitor landscape mapped'
    ]
  },

  {
    agentId: 'positioning-strategist',
    agentName: 'Positioning Strategist',
    cluster: 'strategy',
    primaryResponsibilities: [
      'Brand Positioning',
      'Value Proposition Development',
      'Differentiation Strategy',
      'Brand Promise',
      'Positioning Statement'
    ],
    dependsOn: [
      { agentId: 'market-analyzer', reason: 'ต้องรู้ตำแหน่งตลาดและคู่แข่ง เพื่อวาง Positioning ที่แตกต่าง' }
    ],
    requiredBy: [
      { agentId: 'customer-insight-specialist', reason: 'ต้องรู้ Brand Positioning เพื่อกำหนด Persona และ KPI' },
      { agentId: 'visual-strategist', reason: 'ต้องรู้ Positioning เพื่อออกแบบ Visual ให้สอดคล้อง' },
      { agentId: 'brand-voice-architect', reason: 'ต้องรู้ Positioning เพื่อกำหนด Tone & Voice' },
      { agentId: 'automation-specialist', reason: 'ต้องรู้ Brand Strategy เพื่อตั้งค่า Workflow ที่เหมาะสม' }
    ],
    conflictsWith: [
      { agentId: 'market-analyzer', reason: 'Market Analyzer = วิเคราะห์, Positioning Strategist = กำหนดทิศทาง' }
    ],
    executionPhase: 1,
    requiredInputs: [
      'Market Analysis Output',
      'SWOT Analysis',
      'Competitor Landscape',
      'Business Goals',
      'Target Audience Profile'
    ],
    expectedOutputs: [
      'Brand Positioning Statement',
      'Value Proposition Canvas',
      'Differentiation Framework',
      'Brand Promise',
      'Competitive Positioning Map'
    ],
    successCriteria: [
      'Unique positioning (ไม่ซ้ำคู่แข่ง)',
      'Aligned with market opportunities',
      'Clear value proposition',
      'Defensible differentiation',
      'Emotionally resonant'
    ]
  },

  {
    agentId: 'customer-insight-specialist',
    agentName: 'Customer Insight Specialist',
    cluster: 'strategy',
    primaryResponsibilities: [
      'Customer Journey Mapping',
      'Persona Development',
      'KPI Definition',
      'Audience Segmentation',
      'Pain Point Analysis'
    ],
    dependsOn: [
      { agentId: 'market-analyzer', reason: 'ต้องรู้ Market Context และ Target Audience' },
      { agentId: 'positioning-strategist', reason: 'ต้องรู้ Brand Positioning เพื่อกำหนด Persona ที่สอดคล้อง' }
    ],
    requiredBy: [
      { agentId: 'campaign-planner', reason: 'ต้องรู้ Customer Journey เพื่อวาง Campaign Timeline' },
      { agentId: 'analytics-master', reason: 'ต้องรู้ KPI ที่กำหนดไว้ เพื่อสร้าง Measurement Framework' }
    ],
    conflictsWith: [
      { agentId: 'analytics-master', reason: 'Customer Insight = ก่อน Launch, Analytics Master = หลัง Launch' }
    ],
    executionPhase: 1,
    requiredInputs: [
      'Market Analysis Output',
      'Brand Positioning',
      'Target Audience Profile',
      'Business Goals',
      'Historical Customer Data (Optional)'
    ],
    expectedOutputs: [
      'Customer Journey Map',
      'Detailed Buyer Personas',
      'KPI Framework',
      'Audience Segmentation Report',
      'Pain Point & Motivation Analysis'
    ],
    successCriteria: [
      'Personas are data-grounded (ไม่ใช่เดา)',
      'Journey map covers all touchpoints',
      'KPIs are measurable and specific',
      'Segments are actionable',
      'Insights link to positioning'
    ]
  },

  // ============= PHASE 2: CREATIVE =============
  {
    agentId: 'visual-strategist',
    agentName: 'Visual Strategist',
    cluster: 'creative',
    primaryResponsibilities: [
      'Visual System Design',
      'Color Palette Strategy',
      'Typography System',
      'Logo & Corporate Identity',
      'Design Language'
    ],
    dependsOn: [
      { agentId: 'market-analyzer', reason: 'ต้องรู้ตลาดและคู่แข่ง เพื่อออกแบบ Visual ที่โดดเด่น' },
      { agentId: 'positioning-strategist', reason: 'ต้องรู้ Positioning เพื่อสะท้อนผ่าน Visual Identity' }
    ],
    requiredBy: [
      { agentId: 'brand-voice-architect', reason: 'ต้องรู้ Visual System เพื่อให้ Voice สอดคล้องกับ Visual' },
      { agentId: 'narrative-designer', reason: 'ต้องรู้ Visual Language เพื่อวาง Visual Direction ของ Story' }
    ],
    conflictsWith: [
      { agentId: 'narrative-designer', reason: 'Visual Strategist = Static Identity, Narrative Designer = Story & Motion' }
    ],
    executionPhase: 2,
    requiredInputs: [
      'Market Analysis',
      'Brand Positioning',
      'Target Audience Aesthetic Preferences',
      'Competitor Visual Analysis',
      'Brand Personality'
    ],
    expectedOutputs: [
      'Visual System Guidelines',
      'Color Palette & Psychology',
      'Typography System',
      'Logo & CI Design Direction',
      'Design Language & Mood Board'
    ],
    successCriteria: [
      'WCAG Accessible color contrast',
      'Visually distinctive from competitors',
      'Consistent with brand positioning',
      'Scalable across all platforms',
      'Clear design rationale'
    ]
  },

  {
    agentId: 'brand-voice-architect',
    agentName: 'Brand Voice Architect',
    cluster: 'creative',
    primaryResponsibilities: [
      'Tone & Voice Definition',
      'Communication Rules',
      'Brand Language Framework',
      'Do/Don\'t Guidelines',
      'Voice Consistency Standards'
    ],
    dependsOn: [
      { agentId: 'positioning-strategist', reason: 'ต้องรู้ Positioning เพื่อกำหนด Voice ที่สะท้อนแบรนด์' },
      { agentId: 'visual-strategist', reason: 'ต้องรู้ Visual Tone เพื่อให้ Voice สอดคล้องกับ Visual' }
    ],
    requiredBy: [
      { agentId: 'narrative-designer', reason: 'ต้องรู้ Voice เพื่อเขียน Story ที่สอดคล้อง' },
      { agentId: 'content-creator', reason: 'ต้องรู้ Voice เพื่อเขียน Caption และ Script ในโทนที่ถูกต้อง' }
    ],
    conflictsWith: [
      { agentId: 'content-creator', reason: 'Brand Voice Architect = กำหนดกฎ, Content Creator = ใช้กฎสร้างงาน' }
    ],
    executionPhase: 2,
    requiredInputs: [
      'Brand Positioning',
      'Visual System Guidelines',
      'Target Audience Profile',
      'Brand Personality',
      'Competitor Voice Analysis'
    ],
    expectedOutputs: [
      'Tone & Voice Guide',
      'Communication Rules Document',
      'Brand Language Framework',
      'Do/Don\'t Guidelines',
      'Voice Examples per Platform'
    ],
    successCriteria: [
      'Voice is unique and recognizable',
      'Rules are clear and actionable',
      'Covers all communication channels',
      'Aligned with visual identity',
      'Consistent across all contexts'
    ]
  },

  {
    agentId: 'narrative-designer',
    agentName: 'Narrative Designer',
    cluster: 'creative',
    primaryResponsibilities: [
      'Brand Story Development',
      'Hero\'s Journey Framework',
      'Video Concept & Direction',
      'Storytelling Strategy',
      'Narrative Arc Planning'
    ],
    dependsOn: [
      { agentId: 'brand-voice-architect', reason: 'ต้องรู้ Voice เพื่อเขียน Story ในโทนที่ถูกต้อง' },
      { agentId: 'visual-strategist', reason: 'ต้องรู้ Visual Language เพื่อวาง Visual Storytelling' }
    ],
    requiredBy: [
      { agentId: 'content-creator', reason: 'ต้องรู้ Story Framework เพื่อสร้าง Content ที่มี Narrative' }
    ],
    conflictsWith: [
      { agentId: 'content-creator', reason: 'Narrative Designer = วางโครงเรื่อง, Content Creator = เขียน Content จริง' },
      { agentId: 'visual-strategist', reason: 'Visual Strategist = Static Identity, Narrative Designer = Story & Motion' }
    ],
    executionPhase: 2,
    requiredInputs: [
      'Brand Voice Guide',
      'Visual System Guidelines',
      'Brand Positioning',
      'Target Audience Personas',
      'Campaign Themes'
    ],
    expectedOutputs: [
      'Brand Story Document',
      'Hero\'s Journey Framework',
      'Video Concept & Direction Plan',
      'Storytelling Templates',
      'Narrative Arc per Content Type'
    ],
    successCriteria: [
      'Story is emotionally compelling',
      'Aligned with brand voice',
      'Visual direction is actionable',
      'Hero\'s journey is complete',
      'Adaptable to multiple formats'
    ]
  },

  // ============= PHASE 3: GROWTH =============
  {
    agentId: 'content-creator',
    agentName: 'Content Creator',
    cluster: 'growth',
    primaryResponsibilities: [
      'Caption Strategy & Writing',
      'Video Script Development',
      'Dual-Mode Content (Caption + Video)',
      'CTA Strategy',
      'Platform-Specific Content Optimization'
    ],
    dependsOn: [
      { agentId: 'brand-voice-architect', reason: 'ต้องรู้ Voice เพื่อเขียนในโทนที่ถูกต้อง' },
      { agentId: 'narrative-designer', reason: 'ต้องรู้ Story Framework เพื่อสร้าง Content ที่มี Narrative' },
      { agentId: 'market-analyzer', reason: 'ต้องรู้ Target Audience และเทรนด์ เพื่อเขียน Content ที่ตรงจุด' }
    ],
    requiredBy: [
      { agentId: 'campaign-planner', reason: 'ต้องรู้ Content Style เพื่อวาง Campaign Calendar' }
    ],
    conflictsWith: [
      { agentId: 'brand-voice-architect', reason: 'Brand Voice Architect = กำหนดกฎ, Content Creator = ใช้กฎสร้างงาน' },
      { agentId: 'narrative-designer', reason: 'Narrative Designer = วางโครงเรื่อง, Content Creator = เขียน Content จริง' }
    ],
    executionPhase: 3,
    requiredInputs: [
      'Brand Voice Guide',
      'Narrative & Story Framework',
      'Market Analysis & Trends',
      'Target Audience Personas',
      'Platform Guidelines'
    ],
    expectedOutputs: [
      'Caption Strategy & Templates',
      'Video Script Outlines',
      'Dual-Mode Content Framework',
      'CTA Templates per Platform',
      'Content Style Guide'
    ],
    successCriteria: [
      'Voice is consistent with brand',
      'Dual-mode covers caption + video',
      'Platform-optimized',
      'Storytelling integrated',
      'CTAs are compelling and varied'
    ]
  },

  {
    agentId: 'campaign-planner',
    agentName: 'Campaign Planner',
    cluster: 'growth',
    primaryResponsibilities: [
      'Campaign Timeline Planning',
      'Milestone Definition',
      'Content Calendar',
      'Promotion Strategy',
      'Schedule Optimization'
    ],
    dependsOn: [
      { agentId: 'content-creator', reason: 'ต้องรู้ Content Style และ Format ก่อนวาง Calendar' },
      { agentId: 'customer-insight-specialist', reason: 'ต้องรู้ Customer Journey เพื่อวาง Campaign ให้ตรง Touchpoint' }
    ],
    requiredBy: [
      { agentId: 'automation-specialist', reason: 'ต้องรู้ Campaign Timeline ก่อน Automate Workflows' },
      { agentId: 'analytics-master', reason: 'ต้องรู้ Campaign Plan เพื่อกำหนด Measurement Points' }
    ],
    conflictsWith: [
      { agentId: 'content-creator', reason: 'Content Creator = สร้าง Content, Campaign Planner = วางแผนเวลา' }
    ],
    executionPhase: 3,
    requiredInputs: [
      'Content Strategy & Templates',
      'Customer Journey Map',
      'KPI Framework',
      'Business Goals',
      'Platform-Specific Requirements'
    ],
    expectedOutputs: [
      'Campaign Timeline (30/60/90 days)',
      'Milestone Definitions',
      'Content Calendar',
      'Content Mix Strategy',
      'Promotion & Posting Schedule'
    ],
    successCriteria: [
      'Timeline is realistic and actionable',
      'Milestones are measurable',
      'Balanced content mix',
      'Aligned with customer journey',
      'Execution-ready'
    ]
  },

  {
    agentId: 'automation-specialist',
    agentName: 'Automation Specialist',
    cluster: 'growth',
    primaryResponsibilities: [
      'TCA Workflow Design',
      'Tool Integration (Zapier, Mailchimp, CRM)',
      'Email Marketing Automation',
      'Social Media Scheduling',
      'Process Bottleneck Analysis'
    ],
    dependsOn: [
      { agentId: 'campaign-planner', reason: 'ต้องรู้ Campaign Timeline ก่อนตั้งค่า Automation' },
      { agentId: 'positioning-strategist', reason: 'ต้องรู้ Brand Strategy เพื่อตั้ง Workflow ที่เหมาะกับ Scale' }
    ],
    requiredBy: [],
    conflictsWith: [
      { agentId: 'campaign-planner', reason: 'Campaign Planner = วางแผน, Automation Specialist = ทำให้อัตโนมัติ' }
    ],
    executionPhase: 3,
    requiredInputs: [
      'Campaign Timeline & Calendar',
      'Brand Positioning & Strategy',
      'Current Tool Stack',
      'Repetitive Task List',
      'Team Capacity & Bottlenecks'
    ],
    expectedOutputs: [
      'TCA Workflow Configurations',
      'Tool Integration Setup',
      'Automation Documentation',
      'Scheduling Rules & Triggers',
      'Error Handling & Monitoring Plan'
    ],
    successCriteria: [
      'Workflows run without errors',
      'Scheduling is precise and reliable',
      'Error handling is robust',
      'Monitoring & alerts are configured',
      'Integration is documented'
    ]
  },

  {
    agentId: 'analytics-master',
    agentName: 'Analytics Master',
    cluster: 'growth',
    primaryResponsibilities: [
      'KPI Dashboard Design',
      'Measurement Framework',
      'Performance Tracking Setup',
      'ROI Analysis',
      'Reporting & Recommendations'
    ],
    dependsOn: [
      { agentId: 'campaign-planner', reason: 'ต้องรู้ Campaign Plan เพื่อกำหนด Measurement Points' },
      { agentId: 'customer-insight-specialist', reason: 'ต้องรู้ KPI Framework เพื่อสร้าง Dashboard ที่ครบ' }
    ],
    requiredBy: [],
    conflictsWith: [
      { agentId: 'customer-insight-specialist', reason: 'Customer Insight = ก่อน Launch กำหนด KPI, Analytics Master = หลัง Launch วัดผล' },
      { agentId: 'market-analyzer', reason: 'Market Analyzer = Forward Looking, Analytics Master = Performance Measurement' }
    ],
    executionPhase: 3,
    requiredInputs: [
      'Campaign Timeline & Milestones',
      'KPI Framework',
      'Customer Journey Map',
      'Business Goals',
      'Platform Analytics Access'
    ],
    expectedOutputs: [
      'KPI Dashboard Design',
      'Measurement Framework Document',
      'Tracking Setup Guide',
      'ROI Analysis Templates',
      'Reporting Schedule & Format'
    ],
    successCriteria: [
      'All KPIs are tracked and measurable',
      'Dashboard is actionable (ไม่ใช่แค่ vanity metrics)',
      'Measurement aligns with business goals',
      'Reporting cadence is defined',
      'Recommendations are data-driven'
    ]
  }
];

/**
 * Helper: Get Workflow Dependencies
 * แสดงลำดับการทำงานที่ถูกต้อง
 */
export function getWorkflowOrder(): string[][] {
  const phases: { [key: number]: string[] } = {};

  for (const matrix of responsibilityMatrices) {
    if (!phases[matrix.executionPhase]) {
      phases[matrix.executionPhase] = [];
    }
    phases[matrix.executionPhase].push(matrix.agentId);
  }

  return [
    phases[1] || [],
    phases[2] || [],
    phases[3] || []
  ];
}

/**
 * Helper: Validate Agent Dependencies
 * ตรวจว่า Input ครบหรือยัง
 */
export function validateDependencies(
  agentId: string,
  completedAgents: string[]
): { isReady: boolean; missingDependencies: string[] } {
  const matrix = responsibilityMatrices.find(m => m.agentId === agentId);
  if (!matrix) {
    return { isReady: false, missingDependencies: [agentId] };
  }

  const missingDependencies = matrix.dependsOn
    .map(d => d.agentId)
    .filter(d => !completedAgents.includes(d));

  return {
    isReady: missingDependencies.length === 0,
    missingDependencies
  };
}
