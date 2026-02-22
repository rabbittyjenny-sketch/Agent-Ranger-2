# 🔗 Database + Agents Integration Guide

## Overview

**The Social Factory** system now has **full integration** between **Agents** and **Database**!

This guide explains:
1. ✅ How agents fetch brand knowledge from database
2. ✅ How agents receive smart, cluster-specific context
3. ✅ How agent learning gets recorded back to database

---

## 🏗️ Architecture Flow

### **Complete Data Flow (with Database)**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SENDS REQUEST                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              aiService.processMessage()                      │
│                                                              │
│  1. Route to appropriate agent                              │
│  2. Extract brandId from masterContext                      │
│  3. [NEW] Fetch brand context from database                │
│  4. Send to agent for response generation                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         databaseContextService.getAgentContext()             │
│                                                              │
│  ✨ Smart Lazy Distribution:                                │
│  • Query brands table in database (or localStorage)         │
│  • Filter data by agent cluster (strategist/creative/growth)│
│  • Return only relevant fields for agent type               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Agent Receives Context                          │
│                                                              │
│  Example for Strategy Cluster:                              │
│  {                                                           │
│    coreUSP: ["Artisan coffee", "Local sourcing"],          │
│    competitors: ["Starbucks", "Local cafes"],              │
│    businessModel: "B2C",                                   │
│    targetAudience: "Creative professionals, 25-45"         │
│  }                                                           │
│                                                              │
│  Agent uses this context + user input → generates response  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Agent Response + Fact Checking                     │
│                                                              │
│  1. Response is validated against brand rules               │
│  2. Extract actionable insights from response               │
│  3. [NEW] Record learning to database                       │
│  4. Return formatted response to user                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Save to Database (Non-blocking)                    │
│                                                              │
│  • messages table → Store user & agent messages             │
│  • agent_learnings table → Store agent insights             │
│                                                              │
│  Fields tracked:                                            │
│  - What data agent used (fieldsUsed[])                      │
│  - Confidence level                                         │
│  - Actionable insights                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              USER RECEIVES RESPONSE                          │
│         (+ database persistence achieved!)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 The Three Data Buckets (Smart Distribution)

### **Bucket 1: STRATEGIST_DATA** (for strategist cluster)
Agents: Market Analyst, Business Planner, Insights Agent

```typescript
{
  coreUSP: string[];              // ["Premium coffee", "Local sourcing"]
  businessModel: string;          // "B2C", "B2B", "Subscription"
  competitors: string[];          // ["Starbucks", "Local brands"]
  industry: string;               // "Cafe & Coffee Shop"
  targetAudience: string;         // "Creative professionals"
  toneOfVoice: string;           // "casual", "professional", "luxury"
}
```

**Use Cases:**
- Market Analyst: Analyzes USP vs competitors
- Business Planner: Plans using business model + target audience
- Insights Agent: Finds market opportunities using industry + competitors

---

### **Bucket 2: STUDIO_DATA** (for creative cluster)
Agents: Brand Builder, Design Agent, Video Generator (Art)

```typescript
{
  primaryColor: string;           // "#8B4513"
  secondaryColors: string[];      // ["#D4A574", "#6B5B5B"]
  fontFamily: string[];           // ["Montserrat", "Open Sans"]
  moodKeywords: string[];         // ["warm", "artistic", "cozy"]
  videoStyle: string;             // "cinematic", "fast-cut", "slow-paced"
  forbiddenElements: string[];    // ["corporate", "bright neon"]
  brandNameTh: string;            // "ร้านกาแฟศิลป์"
  coreUSP: string[];              // (cross-data)
  toneOfVoice: string;           // (cross-data)
}
```

**Use Cases:**
- Brand Builder: Creates consistent visual identity using colors + mood
- Design Agent: Generates logos/banners respecting brand constraints
- Video Generator (Art): Creates video art using mood + style + forbidden elements

---

### **Bucket 3: AGENCY_DATA** (for growth/agency cluster)
Agents: Caption Creator, Campaign Planner, Video Generator (Script), Automation Specialist

```typescript
{
  toneOfVoice: string;           // "casual", "luxury", "playful"
  targetAudience: string;         // Description of target audience
  targetPersona: string;          // Detailed persona (age, job, lifestyle)
  painPoints: string[];           // ["Time management", "Budget constraints"]
  forbiddenWords: string[];       // ["cheap", "discount", "sale"]
  multilingualLevel: string;      // "EN-only", "EN-TH mix", "TH-primary"
  automationLineOa: string;       // LINE OA ID for automation
  automationEmail: string;        // Email for notifications
  brandHashtags: string[];        // ["#artisancoffee", "#localfirst"]
  coreUSP: string[];              // (cross-data)
}
```

**Use Cases:**
- Caption Creator: Generates captions avoiding forbidden words, using tone
- Campaign Planner: Plans campaigns respecting audience + pain points
- Video Generator (Script): Writes scripts with proper tone + persona
- Automation Specialist: Automates using LINE OA + email configs

---

## 🔄 Data Flow: From Database to Agents

### **Step 1: Initialize Service**
```typescript
// In App.jsx or main initialization
const masterContext = loadFromOnboarding(); // User data from form
aiService.initialize(masterContext);
orchestratorEngine.setMasterContext(masterContext);
```

### **Step 2: User Sends Message**
```typescript
await aiService.processMessage({
  userInput: "วิเคราะห์ SWOT สำหรับแบรนด์ของฉัน",
  context: masterContext,
  brandId: "brand_123456" // Optional, uses masterContext if not provided
});
```

### **Step 3: aiService Processes**
```typescript
async processMessage(request: MessageRequest) {
  // Extract brandId (from request or masterContext)
  const brandId = request.brandId || masterContext.brandId;

  // ✨ NEW: Get database context
  const dbContext = await getAgentContext(brandId, agentCluster);

  // Generate response with database context
  const response = await generateAgentResponse(
    agent,
    userInput,
    masterContext,
    dbContext  // ← Database knowledge!
  );
}
```

### **Step 4: buildContextMessage Enriches**
```typescript
private buildContextMessage(agent: Agent, context: MasterContext, dbContext?: any) {
  // Build message from MasterContext
  let msg = `Brand: ${context.brandNameTh}\nUSP: ${context.coreUSP}`;

  // ✨ Enrich with database data
  if (dbContext?.competitors) {
    msg += `\nCompetitors: ${dbContext.competitors.join(", ")}`;
  }
  if (dbContext?.forbiddenElements) {
    msg += `\nForbidden Visual Elements: ${dbContext.forbiddenElements.join(", ")}`;
  }

  return msg;
}
```

### **Step 5: Claude API Receives Enhanced Context**
```typescript
// System Prompt + Brand Context + Database Knowledge + User Request
// ↓
// Claude generates informed response
// ↓
// Agent outputs intelligent, brand-aware answer
```

### **Step 6: Learning Gets Recorded**
```typescript
// After response is generated & validated
const insight = extractInsightFromResponse(agentId, userInput, response);
const fieldsUsed = databaseContextService.getFieldsUsedByAgent(agentId, dbContext);

// Save to database
await recordLearning(
  brandId,
  agentId,
  agentName,
  insight,              // What agent learned
  fieldsUsed,          // Which data was used
  confidence           // Confidence score
);
```

---

## 📝 Agent Learning Records

Every agent now records what it learns:

### **What Gets Saved to `agent_learnings` table:**

```typescript
{
  brandId: 1,
  agentId: "market-analyst",
  agentName: "Market Analyst",
  insight: "SWOT analysis completed for market evaluation",
  insightType: "Analysis",
  dataUsed: ["coreUSP", "competitors", "businessModel", "targetAudience"],
  confidence: 87,
  actionable: true,
  createdAt: "2025-02-21T12:34:56.789Z"
}
```

### **Benefits:**
1. **Track agent performance** - See which fields each agent uses
2. **Identify trends** - Discover which insights are most actionable
3. **Improve over time** - Use learnings to enhance future agents
4. **Audit trail** - Know exactly what data each agent accessed

---

## 🛠️ Code Integration Points

### **1. Database Context Service**
**File:** `src/services/databaseContextService.ts`

Key functions:
```typescript
// Get cluster-specific context
await getAgentContext(brandId: number, cluster: string)
→ Returns StrategistContext | CreativeContext | AgencyContext

// Record agent learning
await recordLearning(brandId, agentId, agentName, insight, fieldsUsed, confidence)

// Get fields used by agent
databaseContextService.getFieldsUsedByAgent(agentId, context)
→ Returns string[] of field names used
```

### **2. AI Service Updates**
**File:** `src/services/aiService.ts`

Changes:
- ✅ Imports `databaseContextService`, `getAgentContext`, `recordLearning`
- ✅ `processMessage()` now fetches database context
- ✅ `generateAgentResponse()` receives `dbContext` parameter
- ✅ `buildContextMessage()` enriches with database data
- ✅ All agent response methods receive `dbContext`
- ✅ Universal agent learning for ALL agents (not just SWOT)

### **3. Database Service (Existing)**
**File:** `src/services/databaseService.ts`

Already has:
- ✅ `saveBrand()` - Store brand data
- ✅ `getBrand()` - Retrieve brand data
- ✅ `saveMessage()` - Store chat messages
- ✅ `saveAgentLearning()` - Store agent insights
- ✅ Fallback to localStorage if DATABASE_URL not set

---

## 🚀 Flow Examples

### **Example 1: Market Analyst Gets Database Context**

**User Input:** "วิเคราะห์ SWOT"

**Database fetch:**
```typescript
dbContext = await getAgentContext(1, 'strategy')
// Returns:
{
  coreUSP: ["Artisan specialty coffee", "Eco-friendly sourcing"],
  competitors: ["Starbucks Thailand", "Aroma Thai", "Local cafes"],
  businessModel: "B2C",
  industry: "Cafe & Coffee Shop",
  targetAudience: "Creative professionals, 25-45 years old"
}
```

**Message to Claude:**
```
Brand Context for ร้านกาแฟศิลป์

## Basic Info
- Brand (TH): ร้านกาแฟศิลป์
- Brand (EN): Art Coffee Studio
- Industry: Cafe & Coffee Shop
- Core USP: Artisan specialty coffee, Eco-friendly sourcing

## Strategy Data
- Business Model: B2C
- Target Audience: Creative professionals, 25-45 years old
- Tone of Voice: casual
- Competitors: Starbucks Thailand, Aroma Thai, Local cafes  ← From DB!

User Request: วิเคราะห์ SWOT
```

**Learning recorded:**
```typescript
{
  agentId: "market-analyst",
  insight: "SWOT analysis completed for market evaluation",
  dataUsed: ["coreUSP", "competitors", "businessModel", "targetAudience"],
  confidence: 87
}
```

---

### **Example 2: Design Agent Gets Visual Constraints**

**User Input:** "สร้าง logo"

**Database fetch:**
```typescript
dbContext = await getAgentContext(1, 'creative')
// Returns:
{
  primaryColor: "#8B4513",
  secondaryColors: ["#D4A574", "#6B5B5B"],
  fontFamily: ["Montserrat", "Open Sans"],
  moodKeywords: ["warm", "artistic", "cozy"],
  forbiddenElements: ["corporate", "bright neon colors"],
  videoStyle: "cinematic"
}
```

**Message to Claude:**
```
Brand Context for ร้านกาแฟศิลป์

## Creative Data
- Primary Color: #8B4513 (Brown)
- Mood & Tone: warm, artistic, cozy
- Video Style: cinematic
- Secondary Colors: #D4A574, #6B5B5B  ← From DB!
- Forbidden Elements: corporate, bright neon colors  ← From DB!

User Request: สร้าง logo
```

**Design output** will naturally:
- Use brown as primary color
- Avoid corporate look
- Maintain warm, artistic feeling
- Use specified fonts

---

### **Example 3: Caption Creator Gets Tone & Forbidden Words**

**User Input:** "สร้าง caption Instagram"

**Database fetch:**
```typescript
dbContext = await getAgentContext(1, 'growth')
// Returns:
{
  toneOfVoice: "casual",
  targetPersona: "Creative freelancers, Instagram lovers",
  forbiddenWords: ["cheap", "discount", "sale", "affordable"],
  multilingualLevel: "EN-TH mix (70% TH, 30% EN)",
  brandHashtags: ["#artisancoffee", "#localfirst", "#craftedwithcare"]
}
```

**Message to Claude:**
```
Brand Context for ร้านกาแฟศิลป์

## Growth Data
- Target Persona: Creative freelancers, Instagram lovers
- Tone of Voice: casual
- Brand Hashtags: #artisancoffee, #localfirst, #craftedwithcare
- Forbidden Words: cheap, discount, sale, affordable  ← From DB!
- Multilingual Level: EN-TH mix (70% TH, 30% EN)  ← From DB!

User Request: สร้าง caption Instagram
```

**Caption output** will:
- Never use "cheap" or "discount" (maintains premium positioning)
- Mix Thai 70% + English 30%
- Use official brand hashtags
- Appeal to creative professionals
- Keep casual, friendly tone

---

## 🔒 Data Privacy & Safety

### **Smart Lazy Distribution:**
- Market Analyst NEVER gets forbidden words (not needed)
- Design Agent NEVER gets target persona details (not needed)
- Each agent gets ONLY what it needs
- Reduces surface area for errors

### **Fallback to localStorage:**
- If DATABASE_URL not configured → Uses localStorage
- All functions work identically
- Zero breaking changes
- Production-ready hybrid mode

### **Non-blocking Database Saves:**
- Agent responses return immediately
- Database saves happen in background
- No network latency delays user interaction
- Errors logged, don't crash the app

---

## 📈 Monitoring & Metrics

### **Track Agent Performance**
```typescript
// Query agent_learnings table
SELECT
  agent_id,
  agent_name,
  COUNT(*) as total_uses,
  AVG(confidence) as avg_confidence,
  SUM(CASE WHEN actionable THEN 1 ELSE 0 END) as actionable_insights,
  MAX(created_at) as last_used
FROM agent_learnings
GROUP BY agent_id, agent_name
ORDER BY total_uses DESC;
```

### **Track Data Usage**
```typescript
// Which brand fields are agents using?
SELECT
  agent_id,
  data_used,
  COUNT(*) as usage_count,
  AVG(confidence) as avg_confidence
FROM agent_learnings
WHERE data_used IS NOT NULL
GROUP BY agent_id, data_used
ORDER BY usage_count DESC;
```

---

## ✅ Checklist: What's Ready

- ✅ `databaseContextService.ts` created
- ✅ `aiService.ts` updated to use database context
- ✅ All agents receive cluster-specific data
- ✅ Universal agent learning system
- ✅ Field usage tracking
- ✅ Non-blocking database saves
- ✅ localStorage fallback works
- ✅ Smart lazy data distribution
- ✅ buildContextMessage enriched with DB data

---

## 🚀 Next Steps (Optional)

1. **Real Neon Connection** - Set DATABASE_URL env var to use Neon PostgreSQL
2. **Agent Performance Dashboard** - UI to see agent metrics
3. **Feedback Loop** - Use agent learnings to improve prompts
4. **Cross-Agent Knowledge** - Agents learn from each other's insights
5. **Advanced Routing** - Route based on agent performance history

---

## 📚 Files Modified

| File | Changes |
|------|---------|
| `src/services/databaseContextService.ts` | **NEW** - Core integration service |
| `src/services/aiService.ts` | Updated processMessage, agent context fetching |
| `src/services/databaseService.ts` | Existing (no changes needed) |
| `src/services/orchestratorEngine.ts` | Ready for future enhancement |

---

## 💡 Key Insights

1. **No Breaking Changes** - Everything backward compatible
2. **Scalable Design** - Works with localStorage or Neon
3. **Smart Distribution** - Only relevant data per agent
4. **Learning System** - Every agent contributes insights
5. **Production Ready** - Non-blocking, error-tolerant, fully async

---

**Status**: ✅ **READY FOR PRODUCTION**

All agents now have database knowledge integration! 🎉

---

**Last Updated**: 2025-02-21
**Author**: Claude Code
**Session**: `claude/code-analysis-review-VJelS`
