# 🧠 Agent Learning Evolution System

## Overview

**Agent Learning Evolution** = System ที่บันทึก + วิเคราะห์ + ใช้ประโยชน์จากการเรียนรู้ของ Agents

### Goal
ไม่เพียง agents ทำงาน แต่ **agents เรียนรู้ + พัฒนาตัวเอง** จากประสบการณ์ทั้งหมด!

---

## 📊 What Gets Recorded

### **Level 1: Basic Learning** (ตอนนี้มี)
```typescript
{
  agentId: "market-analyst",
  timestamp: "2025-02-21T12:34:56Z",
  insight: "SWOT analysis completed for market evaluation",
  dataUsed: ["coreUSP", "competitors", "businessModel"],
  confidence: 87,
  actionable: true
}
```

### **Level 2: Advanced Learning** (รอสร้าง)
```typescript
{
  agentId: "market-analyst",
  timestamp: "2025-02-21T12:34:56Z",

  // ← Level 1
  insight: "SWOT analysis completed",
  dataUsed: ["coreUSP", "competitors"],
  confidence: 87,

  // ← Level 2: Knowledge Evolution
  patternRecognized: {
    type: "market_saturation",
    description: "Market is highly competitive with low differentiation",
    frequency: 3,  // Occurred 3 times in last 7 days
    avgConfidence: 0.89
  },

  // ← Trend Analysis
  trendObservation: {
    field: "competitors",
    trend: "increasing",
    count: 5 // competitors grew from 3 to 5
  },

  // ← Recommendation
  recommendation: {
    agentId: "business-planner",
    suggestion: "Consider premium positioning to differentiate",
    reasoning: "Market saturation detected - need unique value",
    targetConfidence: 0.75
  },

  // ← Quality Metrics
  qualityMetrics: {
    userSatisfaction: null,  // Awaiting feedback
    factAccuracy: 0.95,
    uniqueness: 0.88
  }
}
```

---

## 🎓 How Learning Works

### **Step 1: Record Learning**
```typescript
// After agent generates response
await recordLearning(
  brandId,
  agentId: "market-analyst",
  insight: "Market analysis completed...",
  dataUsed: ["coreUSP", "competitors", ...],
  confidence: 87
);
```

### **Step 2: Analyze Patterns**
```typescript
// Run weekly analysis job
async analyzeAgentPatterns(agentId: string) {
  // Find recurring patterns in last 30 days
  const recentLearnings = await db
    .select()
    .from(agentLearnings)
    .where(
      and(
        eq(schema.agentLearnings.agentId, agentId),
        gte(schema.agentLearnings.createdAt, subtractDays(new Date(), 30))
      )
    );

  // Analyze data usage patterns
  const dataUsageFrequency = analyzeDataUsage(recentLearnings);
  // [{field: "coreUSP", usage: 28}, {field: "competitors", usage: 25}]

  // Identify trends
  const trends = identifyTrends(recentLearnings);
  // [{field: "confidence", trend: "increasing", change: +5%}]

  // Find correlations
  const correlations = findCorrelations(recentLearnings);
  // [{"high_confidence" ↔ "uses_competitors": 0.87}]

  return { dataUsageFrequency, trends, correlations };
}
```

### **Step 3: Generate Recommendations**
```typescript
// Based on patterns, suggest improvements
async generateAgentRecommendations(agentId: string) {
  const patterns = await analyzeAgentPatterns(agentId);

  return {
    // Recommendation 1: Data Priority
    dataPriority: {
      recommendation: "Focus on 'competitors' field - 95% correlation with high confidence",
      rationale: "Your confidence scores correlate strongly with competitor data"
    },

    // Recommendation 2: Cross-Agent Coordination
    collaboration: {
      recommendation: "When market-analyst detects saturation, notify business-planner",
      rationale: "Pattern: Market saturation → Need for premium positioning"
    },

    // Recommendation 3: Performance Optimization
    optimization: {
      recommendation: "Response time improved from 2.3s to 1.8s after using filtered data",
      rationale: "Smart data loading reduced processing overhead"
    },

    // Recommendation 4: Knowledge Update
    knowledgeUpdate: {
      recommendation: "Consider adding 'alternative_products' to competitors analysis",
      rationale: "Indirect competitors frequently overlooked in current analysis"
    }
  };
}
```

### **Step 4: Apply Learnings**
```typescript
// Feed learnings back into system
async applyAgentLearnings() {
  const allRecommendations = await Promise.all(
    agents.map(agent => generateAgentRecommendations(agent.id))
  );

  // Update system prompts (optional - manual approval needed)
  // Update routing rules (increase weight for effective agents)
  // Update data distribution (prioritize frequently-used fields)
  // Create cross-agent workflows (based on discovered patterns)

  return {
    promptUpdates: [],
    routingUpdates: [],
    workflowUpdates: []
  };
}
```

---

## 📈 Learning Metrics Tracked

### **Per Agent**
| Metric | Measures | Use Case |
|--------|----------|----------|
| **Data Efficiency** | Which fields actually needed? | Optimize data transmission |
| **Confidence Trends** | Is agent improving? | Detect performance drift |
| **Pattern Frequency** | What insights repeat? | Identify systematic patterns |
| **Cross-Agent Triggers** | When do agents trigger others? | Optimize routing |
| **Response Latency** | How fast is agent? | Detect bottlenecks |
| **User Feedback** | Was output helpful? | Calibrate confidence scoring |

### **Cross-Agent**
| Metric | Measures | Use Case |
|--------|----------|----------|
| **Data Flow** | Market-analyst → Business-planner | Validate coordination |
| **Pattern Correlation** | Do agents agree on insights? | Detect conflicts |
| **Handoff Success** | Does output pass quality gates? | Improve handoff protocols |
| **Knowledge Sharing** | Can agents learn from each other? | Build team intelligence |

### **Brand-Level**
| Metric | Measures | Use Case |
|--------|----------|----------|
| **Market Insights** | What patterns emerge for this brand? | Predictive recommendations |
| **Opportunity Identification** | What gaps agents found? | Strategic recommendations |
| **Risk Detection** | What threats identified? | Early warning system |

---

## 🔄 Evolution Cycle

```
┌─────────────────────────────────────────────────────────┐
│              AGENT LEARNING CYCLE                        │
└─────────────────────────────────────────────────────────┘

WEEK 1-2: OBSERVATION
  ├─ Record every insight
  ├─ Track data usage
  ├─ Monitor confidence
  └─ Collect user feedback

WEEK 3: ANALYSIS
  ├─ Find patterns in observations
  ├─ Identify high-performing data fields
  ├─ Detect correlations
  └─ Generate recommendations

WEEK 4: IMPROVEMENT
  ├─ Update system prompts (if needed)
  ├─ Adjust routing weights
  ├─ Optimize data distribution
  ├─ Create new workflows
  └─ Share learnings across agents

ONGOING: APPLICATION
  ├─ Apply learnings in new tasks
  ├─ Monitor effectiveness
  ├─ Refine based on results
  └─ Repeat cycle
```

---

## 🎯 Example: Market Analyst Evolution

### **Week 1-2: Learning Phase**
```typescript
// Market Analyst processes 15 requests
recordLearning("market-analyst", "SWOT analysis completed", {
  dataUsed: ["coreUSP", "competitors", "industry", "businessModel"],
  confidence: 87,
  // User feedback: "Very useful - helped identify 2 new opportunities"
});

recordLearning("market-analyst", "Gap identification complete", {
  dataUsed: ["coreUSP", "competitors"],  // ← Didn't use industry this time
  confidence: 92,  // Higher confidence with less data!
  // User feedback: "Excellent - very focused"
});

recordLearning("market-analyst", "Market research completed", {
  dataUsed: ["competitors", "industry", "targetAudience"],
  confidence: 78,  // Lower confidence
  // User feedback: "OK but felt generic"
});

// ... 12 more learnings
```

### **Week 3: Pattern Analysis**
```typescript
// Analysis reveals:
{
  dataUsageFrequency: {
    "competitors": 15,    // Used in ALL 15 tasks
    "coreUSP": 14,
    "industry": 8,        // Less frequently used
    "businessModel": 5,
    "targetAudience": 4
  },

  confidenceCorrelation: {
    "competitors": 0.89,  // Strong correlation
    "coreUSP": 0.85,
    "industry": 0.62,     // Weak correlation
    "businessModel": 0.71,
    "targetAudience": 0.58
  },

  recommendation: {
    title: "Data Priority Discovered",
    insight: "Market-analyst performs best with competitors + coreUSP",
    action: "Prioritize these fields in database fetching",
    expectedImprovement: "15-20% faster response, 5% higher confidence"
  }
}
```

### **Week 4: Improvement**
```typescript
// Apply learning
✅ Update database fetching:
   OLD: Fetch all strategy_data fields
   NEW: Fetch competitors + coreUSP first, load others async

✅ Update system prompt:
   "When analyzing market, focus on direct competitors and unique selling points"

✅ Update confidence baseline:
   OLD: Base confidence 75
   NEW: Base confidence 80 (agent proved reliable with core data)

✅ Create cross-agent workflow:
   IF market-analyst.confidence > 85
   AND market-analyst.dataUsed includes "competitors"
   THEN route to business-planner with market insights
```

### **Next Weeks: Continuous Improvement**
```typescript
// Month 2:
+ Market-analyst confidence increased from 82 → 88
+ Response time decreased from 2.1s → 1.4s
+ User satisfaction increased from 4.1/5 → 4.6/5

// Month 3:
+ Discovered pattern: Market saturation → Need premium positioning
+ Auto-triggered business-planner for pricing strategy
+ Created specialized prompt: "When competitors > 5, suggest differentiation"
```

---

## 🛠️ Implementation Steps (Future)

### **Phase 1: Basic Learning** ✅ DONE
```
✅ recordLearning() function
✅ Track dataUsed, confidence, insight
✅ Store in agent_learnings table
```

### **Phase 2: Pattern Analysis** 🔄 TODO
```
□ analyzeAgentPatterns() function
□ Calculate data usage frequency
□ Identify confidence trends
□ Find field correlations
```

### **Phase 3: Recommendations** 🔄 TODO
```
□ generateAgentRecommendations() function
□ Cross-agent pattern matching
□ Workflow suggestions
□ Prompt improvement recommendations
```

### **Phase 4: Auto-Application** 🔄 TODO
```
□ Update system prompts based on patterns
□ Adjust routing weights
□ Create dynamic workflows
□ A/B test improvements
```

### **Phase 5: Knowledge Sharing** 🔄 TODO
```
□ Agent-to-agent learning transfer
□ Collective intelligence dashboard
□ Brand-specific insight templates
□ Predictive capabilities
```

---

## 📊 Querying Agent Learnings

### **What did Market-Analyst learn this week?**
```sql
SELECT
  insight,
  data_used,
  confidence,
  created_at
FROM agent_learnings
WHERE agent_id = 'market-analyst'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### **Which fields matter most for each agent?**
```sql
SELECT
  agent_id,
  jsonb_array_elements(data_used)::text as field,
  COUNT(*) as usage_count,
  AVG(confidence) as avg_confidence
FROM agent_learnings
GROUP BY agent_id, field
ORDER BY agent_id, usage_count DESC;
```

### **Are agents improving over time?**
```sql
SELECT
  agent_id,
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as tasks_completed,
  AVG(confidence) as avg_confidence,
  SUM(CASE WHEN actionable THEN 1 ELSE 0 END) as actionable_insights
FROM agent_learnings
GROUP BY agent_id, week
ORDER BY agent_id, week DESC;
```

### **Which agent pairs work well together?**
```sql
-- Find agents that appear in successful cross-agent scenarios
SELECT
  l1.agent_id,
  l2.agent_id,
  COUNT(*) as co_occurrence,
  AVG(l1.confidence) as avg_confidence
FROM agent_learnings l1
JOIN agent_learnings l2
  ON l1.brand_id = l2.brand_id
  AND DATE(l1.created_at) = DATE(l2.created_at)
  AND l1.agent_id < l2.agent_id
WHERE l1.confidence > 80 AND l2.confidence > 80
GROUP BY l1.agent_id, l2.agent_id
ORDER BY co_occurrence DESC;
```

---

## 🔒 Privacy in Learning

**Important:** Agent learnings must respect data privacy:

```typescript
// ✅ DO: Store insights without PII
{
  insight: "Market saturation detected in premium coffee segment",
  dataUsed: ["coreUSP", "competitors"],
  // ✅ No brand name, no customer data, no sensitive info
}

// ❌ DON'T: Store identifiable information
{
  insight: "Starbucks has 15 stores vs Coffee Studio's 3",
  // ❌ Too specific - could identify the brand
}
```

---

## 🚀 Benefits

### **For Agents**
- 📈 Continuously improve based on performance data
- 🎯 Discover which data matters most
- 🤝 Learn from other agents' success patterns
- 💡 Adapt prompts based on real-world performance

### **For Users**
- ⚡ Faster responses (optimized data usage)
- 📊 More accurate insights (proven field correlations)
- 🎯 Better recommendations (learned patterns)
- 📈 Improved quality over time

### **For Business**
- 🔍 Understand how agents work
- 📊 Identify market opportunities via agent learnings
- 🛡️ Early risk detection via pattern analysis
- 💰 ROI measurement via learning metrics

---

## 📋 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Record learnings | ✅ DONE | All agents now record insights |
| Track data usage | ✅ DONE | Field dependency tracking |
| Store in database | ✅ DONE | agent_learnings table ready |
| Pattern analysis | 🔄 TODO | Analyze correlations, trends |
| Recommendations | 🔄 TODO | Auto-generate improvement ideas |
| Auto-application | 🔄 TODO | Apply learnings to system |
| Knowledge sharing | 🔄 TODO | Cross-agent learning transfer |

---

## Next Steps

1. **Build Pattern Analysis Engine** (Week 1-2)
   - Calculate data usage frequency
   - Find confidence trends
   - Detect field correlations

2. **Create Recommendation System** (Week 3-4)
   - Generate improvement suggestions
   - Validate cross-agent patterns
   - Create workflow recommendations

3. **Implement Auto-Improvement** (Week 5-6)
   - Update system prompts safely
   - Adjust routing weights
   - Create dynamic workflows

4. **Launch Dashboard** (Week 7-8)
   - Visualize agent performance
   - Show learning trends
   - Export insights

---

**Status**: ✅ **Foundation Ready** - Recording system is live!
Next phase: **Pattern Analysis & Auto-Improvement**

---

**Last Updated**: 2025-02-21
**Related Files**:
- `src/services/databaseContextService.ts` - Learning recording
- `DATABASE_AGENTS_INTEGRATION_GUIDE.md` - Integration reference
