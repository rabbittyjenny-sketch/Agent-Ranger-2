# 📊 Data Architecture & Storage System

## 🏗️ ข้อมูลจัดการอย่างไร (Current Implementation)

### **Level 1: Browser Storage (Frontend)**
```
localStorage (Browser)
│
├─ Key: 'socialFactory_masterContext'
│  └─ Value: {
│     brandId: "brand_123456789",
│     brandNameTh: "ร้านกาแฟ",
│     brandNameEn: "Coffee Shop",
│     industry: "Cafe",
│     coreUSP: "Specialty coffee",
│     visualStyle: { primaryColor, moodKeywords[] },
│     targetAudience: "...",
│     toneOfVoice: "casual",
│     createdAt: ISO string,
│     lastUpdated: ISO string
│   }
│
└─ Persistence: ✅ Survives browser refresh
   Storage Limit: 5-10 MB per origin
   Access: Synchronous (fast)
```

---

## 📋 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                          │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND COMPONENTS (React)                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐      │
│  │ Onboarding │→ │  App.jsx     │→ │   AgentsGrid   │      │
│  │ (Collects) │  │ (State Mgmt) │  │  (Chat UI)     │      │
│  └────────────┘  └──────────────┘  └────────────────┘      │
│                          ↓                                    │
│                  [masterContext]                             │
│                   React State                                │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│          SERVICES (Business Logic)                           │
│  ┌──────────────────┐  ┌──────────────────────────────┐     │
│  │ orchestrator     │→ │ aiService                    │     │
│  │ Engine.ts        │  │ (Agent responses)            │     │
│  │ • Routing        │  │ • Market Analyst             │     │
│  │ • Intent         │  │ • Caption Creator            │     │
│  │ • Fact Check     │  │ • Campaign Planner           │     │
│  └──────────────────┘  │ • Design Agent               │     │
│                        │ • Video Generator            │     │
│                        └──────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│               DATA LAYER (Storage)                           │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ BROWSER localStorage                                  │   │
│  │ ├─ masterContext (Brand Data)                        │   │
│  │ └─ UI State (if needed)                              │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Data Mapping Structure

### **1. Master Context (Brand Data)**

**Collected during Onboarding**:
```javascript
MasterContext = {
  brandId:         string        // Unique ID: "brand_timestamp"
  brandNameTh:     string        // "ร้านกาแฟอาร์ต"
  brandNameEn:     string        // "Art Coffee Studio"
  industry:        string        // "Cafe & Coffee Shop"
  coreUSP:         string        // "Premium specialty coffee..."
  visualStyle: {
    primaryColor:  string        // "#8B4513"
    moodKeywords:  string[]      // ["warm", "artistic", "cozy"]
  }
  targetAudience:  string        // "Creative professionals, age 25-45"
  toneOfVoice:     enum          // "casual|formal|playful|professional|luxury"
  createdAt:       ISO datetime
  lastUpdated:     ISO datetime
}
```

**Location**: `localStorage.getItem('socialFactory_masterContext')`

---

### **2. Agent Definitions (Static Data)**

**Location**: `src/data/agents.ts`

```javascript
Agent = {
  id:               string        // "market-analyst"
  name:             string        // "Market Analyst"
  nameEn:           string        // English name
  cluster:          enum          // "strategist|studio|agency"
  emoji:            string        // "📊"
  color:            hex color     // "#FF6B6B"
  description:      string        // Thai description
  descriptionTh:    string        // Thai version
  capabilities:     string[]      // ["SWOT Analysis", "Market Gap", ...]
  keywords:         string[]      // ["SWOT", "competitor", "market"]
  businessFunctions: string[]     // ["วิเคราะห์สภาพแข่งขัน", ...]
  systemPrompt:     string        // Agent constraints & rules
}
```

**Map of All Agents**:
```
The Strategist (3 agents)
├─ market-analyst
├─ business-planner
└─ insights-agent

The Studio (3 agents)
├─ brand-builder
├─ design-agent
└─ video-generator-art

The Agency (3 agents)
├─ caption-creator
├─ campaign-planner
└─ video-generator-script
```

---

### **3. Message History (Chat Data)**

**Currently**: Stored in React State

```javascript
Message = {
  id:          number           // Date.now()
  role:        "user"|"agent"
  content:     string           // Message text
  agentName:   string           // "Market Analyst"
  confidence:  number           // 0-100
  attachments: {
    name:      string           // "image.png"
    type:      string           // "image/png"
    size:      number           // bytes
    data:      string           // DataURL base64
  }[]
  timestamp:   ISO datetime
}
```

**Storage**: React `useState([])` → Lost on page refresh (unless saved to localStorage)

---

### **4. Mock Data (Testing)**

**Location**: `src/data/mockData.ts`

```javascript
mockConversations: [
  {
    id: "conv_001",
    brandId: "coffee-shop-01",
    timestamp: ISO,
    messages: [
      { role: "user", content: "..." },
      { role: "agent", agentId: "...", content: "..." }
    ]
  }
]

mockDashboardData: {
  kpis: { totalReach, engagement, conversionRate },
  recentActivity: [],
  topPerformingContent: []
}

routingTestCases: [
  { input: "...", expectedCluster: "...", expectedAgent: "..." }
]
```

---

## 🔄 Data Flow in Chat

```
User Types Question
        ↓
[Text Input] → handleSendMessage()
        ↓
Add to messages[] (React state)
        ↓
Call aiService.processMessage({
  userInput: string,
  context: masterContext,      ← Reads from localStorage
  forceAgent: agentId
})
        ↓
orchestratorEngine.route()
├─ Intent Recognition
├─ Smart Routing
└─ Fact Checking
        ↓
Agent generates response
├─ Uses context data (brand info)
├─ Uses agent template
└─ Validates with fact checker
        ↓
Return AIResponse {
  agentId, agentName, content,
  factCheckResult, confidence
}
        ↓
Add agent message to messages[]
        ↓
Display in Chat UI
        ↓
[User sees response]
```

---

## 💾 Current Storage Methods

### **1. Browser localStorage** ✅
**Used for**: Master Context (Brand Data)
```javascript
// SAVE
localStorage.setItem('socialFactory_masterContext',
  JSON.stringify(context))

// LOAD
const saved = localStorage.getItem('socialFactory_masterContext')
const context = JSON.parse(saved)
```

**Pros**:
- ✅ Persistent (survives refresh)
- ✅ Simple (no backend needed)
- ✅ Fast (synchronous)
- ✅ Good for prototype

**Cons**:
- ❌ Limited to 5-10 MB
- ❌ Single-device only
- ❌ No multi-user support
- ❌ Not sharable across browsers

### **2. React State** ✅
**Used for**: Chat messages, UI state
```javascript
const [messages, setMessages] = useState([])
const [attachedFiles, setAttachedFiles] = useState([])
```

**Pros**:
- ✅ Real-time updates
- ✅ Fast re-renders
- ✅ Memory efficient

**Cons**:
- ❌ Lost on page refresh
- ❌ Not persistent

### **3. In-Memory (No persistence)** ✅
**Used for**: Agent definitions, routing keywords
```javascript
// agents.ts - Static data
export const strategistAgents: Agent[] = [...]
export const studioAgents: Agent[] = [...]
export const agencyAgents: Agent[] = [...]
```

**Pros**:
- ✅ Bundled with app (no requests)
- ✅ Zero latency

**Cons**:
- ❌ No persistence
- ❌ Can't update without rebuild

---

## 🎯 Data Mapping Examples

### **Example 1: Chat Message with Agent**
```javascript
// User sends question
Input: "วิเคราะห์ SWOT"

// Maps to
{
  userInput: "วิเคราะห์ SWOT",
  context: {
    brandNameTh: "ร้านกาแฟ",
    industry: "Cafe",
    coreUSP: "Premium specialty coffee",
    visualStyle: { moodKeywords: ["warm", "artistic"] },
    targetAudience: "Creatives, age 25-45",
    toneOfVoice: "casual"
  },
  forceAgent: "market-analyst"
}

// Agent generates
{
  agentId: "market-analyst",
  agentName: "Market Analyst",
  content: "📊 SWOT Analysis สำหรับ ร้านกาแฟ\n\n🔥 Strengths:...",
  factCheckResult: { valid: true, warnings: [] },
  confidence: 87
}

// Displays in chat
{
  role: "agent",
  agentName: "Market Analyst",
  content: "📊 SWOT Analysis...",
  confidence: 87
}
```

### **Example 2: File Attachment**
```javascript
// User attaches image
File: "menu.png" (150 KB)

// Converted to
{
  name: "menu.png",
  type: "image/png",
  size: 150000,
  data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEU..."
}

// Stored in messages
{
  role: "user",
  content: "วิเคราะห์เมนูนี้",
  attachments: [
    { name: "menu.png", type: "image/png", size: 150000 }
  ]
}
```

### **Example 3: Routing Map**
```javascript
// Input keyword detection
keywords = ["SWOT", "competitor", "market"]

// Maps to clusters
if (keywords.includes("SWOT")) → cluster = "strategist"
if (keywords.includes("logo")) → cluster = "studio"
if (keywords.includes("caption")) → cluster = "agency"

// Maps to specific agent
for each agent in cluster:
  score += match_count(agent.keywords, input_keywords)
best_agent = agent with highest score
```

---

## 📈 Scaling Path (For Future)

### **Current** (Prototype)
```
Browser localStorage → Single Device
```

### **Phase 2** (Production)
```
Browser localStorage → Backend Database (Neon PostgreSQL)
                    → Cloud Storage (File attachments)
```

### **Phase 3** (Enterprise)
```
Frontend → API Server → PostgreSQL
                     → Redis Cache
                     → S3/Cloud Storage
                     → Analytics DB
```

---

## 🔐 Data Security Considerations

### **Current**:
✅ Brand Data Isolation (by brandId)
✅ Anti-Copycat Detection (Levenshtein)
✅ Fact Check Validation (USP grounding)
✅ No external API calls (local processing)

### **Missing** (For Production):
❌ User Authentication
❌ Data Encryption
❌ Access Control (multi-user)
❌ Audit Logging
❌ Backup/Recovery
❌ GDPR Compliance

---

## 📋 Data Types Summary

| Data Type | Storage | Persistence | Scale | Access |
|-----------|---------|-------------|-------|--------|
| **Brand Context** | localStorage | ✅ Persistent | 1 brand | Sync |
| **Chat Messages** | React State | ❌ Lost on refresh | ∞ | Sync |
| **Attachments** | DataURL (RAM) | ❌ Session only | 100 MB | Sync |
| **Agents** | In-Memory | ✅ Bundled | 9 fixed | Sync |
| **Routing Map** | In-Memory | ✅ Bundled | Dynamic | Sync |
| **Mock Data** | In-Memory | ✅ Bundled | Fixed | Sync |

---

## 🎯 How to Upgrade to Real Database

If you want to move to **Neon PostgreSQL** (recommended for production):

### **Setup Required**:
1. Create Neon project at neon.tech
2. Create tables:
   ```sql
   CREATE TABLE brands (
     id UUID PRIMARY KEY,
     name_th VARCHAR,
     name_en VARCHAR,
     industry VARCHAR,
     core_usp TEXT,
     primary_color VARCHAR,
     mood_keywords TEXT[],
     target_audience TEXT,
     tone_of_voice VARCHAR,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );

   CREATE TABLE messages (
     id UUID PRIMARY KEY,
     brand_id UUID REFERENCES brands(id),
     user_id UUID,
     role VARCHAR (user|agent),
     content TEXT,
     agent_id VARCHAR,
     agent_name VARCHAR,
     confidence FLOAT,
     created_at TIMESTAMP
   );

   CREATE TABLE attachments (
     id UUID PRIMARY KEY,
     message_id UUID REFERENCES messages(id),
     file_name VARCHAR,
     file_type VARCHAR,
     file_size INT,
     file_url VARCHAR,
     created_at TIMESTAMP
   );
   ```

3. Update aiService to use API:
   ```javascript
   // Instead of localStorage
   const response = await fetch('/api/brands', {
     method: 'POST',
     body: JSON.stringify(context)
   })
   ```

4. Add API server (Node.js + Express recommended)

---

## 🚀 Summary

**Currently**: ✅ Fully functional prototype
- Browser localStorage for brand data
- React state for chat/UI
- In-memory agents & routes
- All processing local (no backend)

**Ready for**: ✅ Single-user testing
- One brand at a time
- One device at a time
- No persistence across sessions

**Next Step**: 📈 Add database when scaling to production
- Multiple brands
- Multi-user support
- Data persistence
- Cloud backup

---

**Questions about data? Let me know! ค่ะ** 😊
