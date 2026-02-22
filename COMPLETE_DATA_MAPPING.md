# 🗺️ iDEAS365 Complete Data-to-Agent Mapping System

## 📋 Onboarding Form Fields → Agent Mapping Table

| # | Form Field | Data Type | Primary Agent(s) | Secondary Agents | Action/Output | Required? |
|---|-----------|-----------|-----------------|------------------|---------------|-----------|
| 1 | **Brand Name (TH/EN)** | string | ALL (7) | - | Watermark, file naming, document headers | ✅ YES |
| 2 | **Industry/Business Type** | enum | Market Analyst | Strategist, Campaign Planner | Market research, trend detection, audience segmentation | ✅ YES |
| 3 | **Core USP** | text | All Strategists & Caption | Design, Video (Art) | Business strategy, selling hook, visual narrative | ✅ YES |
| 4 | **Competitor URL/Names** | url/text | Market Analyst | Business Planner | Competitive analysis, SWOT mapping, pricing benchmark | ❌ OPTIONAL |
| 5 | **Tax ID & Address** | string | Business Planner | Automation Specialist | Auto-generate invoices, quotations, legal docs | ❌ OPTIONAL |
| 6 | **Primary Color (Hex)** | hex | Design Agent | ALL Studio, Automation | CSS/HTML styling, UI elements, brand consistency | ✅ YES |
| 7 | **Font Family** | select | Design Agent | Video (Art), Automation | Typography system, video text overlay, CSS rules | ✅ YES |
| 8 | **Mood Keywords (3x)** | string[] | Video (Art Focus) | ALL Studio, Caption | AI image/video generation prompts, visual direction | ✅ YES |
| 9 | **Words to Avoid** | string[] | ALL Studio & Agency | Caption Creator | Negative prompts, content filtering, guardrails | ❌ OPTIONAL |
| 10 | **Target Audience** | text | Campaign Planner | Market Analyst, Caption | Platform selection, image style, demographics | ✅ YES |
| 11 | **Tone of Voice** | enum | Caption Creator | ALL (7) | Word choice, emoji usage, formality level | ✅ YES |
| 12 | **Multilingual Level** | slider | Caption Creator | Video (Script) | Language mix ratio (TH/EN/JP/KR) | ✅ YES |
| 13 | **Brand Hashtags** | string[] | Social Partner | Campaign Planner | Auto-appending to captions, content tagging | ❌ OPTIONAL |

---

## 🧠 Agent-by-Agent Data Dependency Map

### **1️⃣ Market Analyst (Strategist)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,      // #1 - Identify in reports
  brandNameEn,      // #1 - English version
  industry,         // #2 - Market research context
  coreUSP,          // #3 - Business positioning
  competitors: {    // #4 - Competitive analysis
    urls: [],
    names: []
  }
}
```

**Outputs**:
- 📊 SWOT Analysis
- 💡 Market Gap Analysis
- 🔍 Competitor Benchmarking
- 📈 Growth Opportunities

**Uses Data For**:
```sql
SELECT insights FROM knowledge_base
WHERE industry = ${industry}
AND keyword IN (${coreUSP})
```

---

### **2️⃣ Business Planner (Strategist)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,
  industry,         // #2 - Cost baseline
  coreUSP,          // #3 - Value positioning
  taxId,            // #5 - Legal entity
  address,          // #5 - Billing address
  toneOfVoice       // #11 - Formal/casual pricing
}
```

**Outputs**:
- 💰 Pricing Strategy
- 📊 Cost Analysis
- 🧾 Invoice Templates (auto-fill)
- 💵 ROI Projections

**Database Operations**:
```sql
-- Save to invoices table
INSERT INTO invoices (brand_id, tax_id, address, created_at)
VALUES (${brandId}, ${taxId}, ${address}, NOW())

-- Generate quotation
SELECT template FROM quotation_templates
WHERE tone = ${toneOfVoice}
```

---

### **3️⃣ Insights Agent (Strategist)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,
  industry,         // #2 - KPI benchmarks
  targetAudience,   // #10 - Segment metrics
  coreUSP           // #3 - Value metrics
}
```

**Outputs**:
- 📈 KPI Dashboard
- 📊 Performance Analytics
- 🎯 Goal Recommendations
- 📉 Risk Assessment

**Data Fetching Pattern**:
```sql
SELECT kpis FROM analytics
WHERE brand_id = ${brandId}
AND category = ${industry}
ORDER BY date DESC LIMIT 30
```

---

### **4️⃣ Brand Builder (Studio)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,
  brandNameEn,
  industry,         // #2 - Industry style guide
  coreUSP,          // #3 - Brand essence
  primaryColor,     // #6 - Primary identity
  moodKeywords,     // #8 - Brand personality
  toneOfVoice,      // #11 - Voice guidelines
  targetAudience    // #10 - Audience persona
}
```

**Outputs**:
- 🎨 Brand Identity Guide
- 📝 Brand Voice Guidelines
- 🎭 Brand Personality Profile
- 💬 Tone Examples

**Creates**:
```sql
INSERT INTO brand_guidelines (brand_id, essence, mood, tone, guidelines_json)
VALUES (
  ${brandId},
  ${coreUSP},
  ${JSON.stringify(moodKeywords)},
  ${toneOfVoice},
  ${brandGuidelines}
)
```

---

### **5️⃣ Design Agent (Studio)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,
  industry,
  primaryColor,     // #6 - Color system
  fontFamily,       // #7 - Typography
  moodKeywords,     // #8 - Visual direction
  coreUSP,          // #3 - Design focus
  targetAudience,   // #10 - Aesthetic level
  wordsToAvoid      // #9 - Design constraints
}
```

**Outputs**:
- 🎨 Logo Design Concepts
- 🌈 Color Palette System
- 📝 Typography Rules
- 🖼️ Design System Components

**CSS Generation**:
```css
:root {
  --primary-color: ${primaryColor};
  --brand-font: ${fontFamily};
  --mood: ${moodKeywords[0]};
}
```

**Schema Storage**:
```sql
INSERT INTO design_systems (brand_id, color_hex, font_family, mood_keywords)
VALUES (${brandId}, ${primaryColor}, ${fontFamily}, ${moodKeywords})
```

---

### **6️⃣ Video Generator (Art Focus) (Studio)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,
  industry,
  coreUSP,          // #3 - Story narrative
  primaryColor,     // #6 - Color grading
  moodKeywords,     // #8 - Visual mood (CRITICAL)
  fontFamily,       // #7 - Text overlay
  wordsToAvoid,     // #9 - Negative prompts
  targetAudience    // #10 - Visual style
}
```

**Outputs**:
- 🎬 Video Concept & Storyboard
- 🎥 Visual Direction Guide
- 🎨 Scene Planning
- 📐 Production Specifications

**AI Generation Prompt**:
```javascript
const prompt = `
Create video concept for ${brandNameTh}
Mood: ${moodKeywords.join(', ')}
Color: ${primaryColor}
Font: ${fontFamily}
USP: ${coreUSP}
Target: ${targetAudience}
Avoid: ${wordsToAvoid.join(', ')}
Tone: ${toneOfVoice}
`;
```

---

### **7️⃣ Caption Creator (Agency)**

**Inputs from Onboarding**:
```javascript
{
  brandNameTh,
  industry,
  coreUSP,          // #3 - Selling hook
  moodKeywords,     // #8 - Emotional tone
  toneOfVoice,      // #11 - Word choice (CRITICAL)
  targetAudience,   // #10 - Language complexity
  multilingualLevel,// #12 - Language mix
  brandHashtags,    // #13 - Auto-append
  wordsToAvoid      // #9 - Content filtering
}
```

**Outputs**:
- 💬 6 Caption Styles (Emotional, Educational, Playful, Problem-Solution, Social Proof, CTA)
- 🌍 Multilingual Versions (TH/EN/JP/KR)
- #️⃣ Hashtag-included versions
- ✨ Emoji-enhanced captions

**Caption Generation Logic**:
```javascript
const styles = [
  { type: 'emotional', emoji: '💖', mood: moodKeywords[0] },
  { type: 'educational', emoji: '💡', usp: coreUSP },
  { type: 'playful', emoji: '🎉', tone: toneOfVoice },
  // ... more styles
];

const languages = {
  'th': multilingualLevel > 70 ? 1.0 : 0.3,  // Slider determines ratio
  'en': multilingualLevel > 50 ? 0.5 : 0.7,
  'jp': multilingualLevel > 80 ? 0.3 : 0,
};

// Auto-append hashtags
caption += '\n\n' + brandHashtags.join(' ');
```

**Database**:
```sql
INSERT INTO captions (brand_id, style, language, content, hashtags)
VALUES
  (${brandId}, 'emotional', 'th', ${caption_th}, ${brandHashtags}),
  (${brandId}, 'emotional', 'en', ${caption_en}, ${brandHashtags}),
  -- ... more records
```

---

### **8️⃣ Automation Specialist (NEW - Orchestrator)**

**Inputs from Onboarding** (Cross-Agent Aggregation):
```javascript
{
  // From Brand Builder
  brandGuidelines: { mood, tone, personality },

  // From Design Agent
  designSystem: { color, font, styling },

  // From Business Planner
  businessInfo: { taxId, address, pricing },

  // From Market Analyst
  marketData: { industry, competitors },

  // From Caption Creator
  contentVoice: { tone, language, hashtags }
}
```

**Outputs** (Automated Tools):
- 📋 Contact Forms (auto-styled + auto-routing)
- 🛒 Product Pages (auto-generated from design system)
- 💳 Purchase Buttons (auto-linked to billing)
- 📧 Email Templates (auto-branded)
- 📱 Mobile Landing Page (auto-responsive)

**Implementation**:
```javascript
// Form Builder
async function createContactForm(context) {
  return {
    styles: {
      backgroundColor: context.designSystem.color,
      fontFamily: context.designSystem.font,
      buttonColor: context.designSystem.color,
    },
    routing: {
      successMessage: context.contentVoice.tone === 'formal' ?
        'Thank you for your inquiry' : 'Thanks for reaching out! 🎉',
      billingEmail: context.businessInfo.taxId
    }
  }
}

// Auto-insert brand data
form.inputs = [
  { label: 'Your Name', placeholder: 'Enter your name' },
  { label: 'Email', type: 'email' },
  { label: 'Interest in: ' + context.coreUSP, type: 'text' }
];

form.footer = context.brandHashtags.join(' ');
```

**Database**:
```sql
INSERT INTO automated_tools (brand_id, tool_type, configuration, status)
VALUES
  (${brandId}, 'contact_form', ${formConfig}, 'active'),
  (${brandId}, 'landing_page', ${pageConfig}, 'active'),
  (${brandId}, 'email_template', ${emailConfig}, 'active')
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────┐
│     ONBOARDING FORM (User Input)        │
│  13 Fields → Neon PostgreSQL            │
└────────────────┬────────────────────────┘
                 ↓
        ┌────────────────┐
        │   Neon DB      │
        │  brands table  │
        │  (brand_id)    │
        └────────┬───────┘
                 ↓
        ╔════════════════════════════════╗
        ║    ORCHESTRATOR ENGINE         ║
        ║  Reads context from Neon       ║
        ║  Injects into Agent Prompts    ║
        ╚════════╤═══════════════════════╝
                 ↓
    ┌────────────┼─────────────────────┐
    ↓            ↓            ↓         ↓
  [Market]  [Business]  [Brand]    [Design]
  Analyst    Planner     Builder      Agent
    ↓            ↓            ↓         ↓
  [Insights]  [Video Art]  [Caption]  [Automation]
    ↓            ↓            ↓         ↓
    └────────────┼─────────────────────┘
                 ↓
        ┌────────────────┐
        │   Neon DB      │
        │  Update Tables │
        │  • conversations
        │  • messages
        │  • generated_content
        │  • design_assets
        │  • analytics
        └────────────────┘
                 ↓
        ┌────────────────┐
        │   User Gets    │
        │   RESULT       │
        └────────────────┘
```

---

## 💾 Neon Database Schema Mapping

### **Master Table: brands**
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  brand_name_th VARCHAR,        -- #1
  brand_name_en VARCHAR,        -- #1
  industry VARCHAR,             -- #2
  core_usp TEXT,                -- #3
  competitors JSONB,            -- #4
  tax_id VARCHAR,               -- #5
  address TEXT,                 -- #5
  primary_color VARCHAR,        -- #6
  font_family VARCHAR,          -- #7
  mood_keywords TEXT[],         -- #8
  words_to_avoid TEXT[],        -- #9
  target_audience TEXT,         -- #10
  tone_of_voice VARCHAR,        -- #11
  multilingual_level INT,       -- #12
  brand_hashtags TEXT[],        -- #13
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Agent Output Tables**
```sql
-- Market Analyst outputs
CREATE TABLE swot_analyses (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  strengths TEXT[],
  weaknesses TEXT[],
  opportunities TEXT[],
  threats TEXT[],
  generated_at TIMESTAMP
);

-- Caption Creator outputs
CREATE TABLE captions (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  style VARCHAR,  -- emotional, educational, playful, etc
  language VARCHAR,  -- th, en, jp, kr
  content TEXT,
  hashtags TEXT[],
  confidence FLOAT,
  created_at TIMESTAMP
);

-- Design Agent outputs
CREATE TABLE design_assets (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  asset_type VARCHAR,  -- logo, color_palette, typography
  asset_data JSONB,
  color_hex VARCHAR,
  font_family VARCHAR,
  created_at TIMESTAMP
);

-- Automation Specialist outputs
CREATE TABLE automated_tools (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  tool_type VARCHAR,  -- contact_form, landing_page, email_template
  configuration JSONB,
  status VARCHAR,
  created_at TIMESTAMP
);

-- Chat history
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  agent_id VARCHAR,
  user_message TEXT,
  agent_response TEXT,
  used_fields TEXT[],  -- which form fields were referenced
  created_at TIMESTAMP
);

-- Memory for learning
CREATE TABLE agent_learnings (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  agent_id VARCHAR,
  pattern_detected TEXT,
  confidence FLOAT,
  action_taken TEXT,
  created_at TIMESTAMP
);
```

---

## 🎯 Smart Lazy Execution Pattern

### **How Data Flows When User Clicks "Generate Caption"**

```
Step 1: Orchestrator Receives Command
  Input: "Generate 6-style caption for Instagram"

Step 2: Load Minimal Data from Neon
  SELECT brand_name_th, core_usp, tone_of_voice,
         multilingual_level, brand_hashtags
  FROM brands WHERE id = ${brandId}

Step 3: Inject into Caption Creator Prompt
  prompt = `
    Brand: ${brandNameTh}
    USP: ${coreUSP}
    Tone: ${toneOfVoice}
    Mix: ${multilingualLevel}% English
    Hashtags: ${brandHashtags.join(' ')}

    Generate 6 styles:
    1. Emotional Hook
    2. Educational
    3. Playful
    ... etc
  `

Step 4: Agent Generates Output
  caption = await captionCreator(prompt)

Step 5: Save to Neon (Async)
  INSERT INTO captions (brand_id, style, content, hashtags)
  VALUES (${brandId}, ${style}, ${content}, ${brandHashtags})

Step 6: Return to User Instantly
  Response sent BEFORE database write completes
```

---

## 🚀 Integration Checklist

### **Phase 1: Map Onboarding → Neon**
- [ ] Create `brands` table
- [ ] Save form data to Neon on onboarding complete
- [ ] Verify all 13 fields stored correctly

### **Phase 2: Connect Agents to Neon**
- [ ] Market Analyst reads `industry` field
- [ ] Caption Creator reads `tone_of_voice` + `multilingual_level`
- [ ] Design Agent reads `primary_color` + `font_family`
- [ ] Each agent writes outputs to specific table

### **Phase 3: Add Smart Lazy Loading**
- [ ] Query only needed fields per agent
- [ ] Use indexes on frequently filtered columns
- [ ] Cache frequently accessed data in Redis

### **Phase 4: Implement Automation Specialist**
- [ ] Cross-reference agent outputs
- [ ] Generate automated tools from combined data
- [ ] Store tool configurations in `automated_tools` table

### **Phase 5: Add Agent Learning**
- [ ] Log which fields each agent used
- [ ] Track successful patterns
- [ ] Allow agents to suggest field improvements

---

## 📊 Example: Complete Data Journey

```
USER ONBOARDS with:
├─ Brand Name: "Coffee Art Studio"
├─ Industry: "Cafe"
├─ USP: "Specialty coffee + artist workspace"
├─ Primary Color: #8B4513
├─ Mood Keywords: ["warm", "artistic", "cozy"]
├─ Tone of Voice: "casual"
├─ Target Audience: "Creatives, age 25-45"
└─ Hashtags: #CoffeeArt #SpecialtyCoffee

↓ SAVED TO NEON ↓

MARKET ANALYST uses: industry, coreUSP
  → Generates: SWOT in coffee market, competitor analysis
  → Saves to: swot_analyses table

DESIGN AGENT uses: primaryColor, fontFamily, moodKeywords
  → Generates: Color palette, logo concepts
  → Saves to: design_assets table

CAPTION CREATOR uses: toneOfVoice, moodKeywords, targetAudience
  → Generates: 6 styles × 4 languages with hashtags
  → Saves to: captions table

AUTOMATION SPECIALIST uses: ALL (aggregates)
  → Generates: Contact form (styled + routed)
  → Generates: Email template (branded)
  → Generates: Landing page (auto-responsive)
  → Saves to: automated_tools table

↓ FINAL OUTPUT ↓

USER SEES:
├─ SWOT Analysis (Market Analyst)
├─ Design System (Design Agent)
├─ 6 Caption Options (Caption Creator)
├─ Auto-generated Form (Automation Specialist)
└─ All branded with #CoffeeArt #SpecialtyCoffee
```

---

## 🔗 Files That Handle This Mapping

| File | Responsibility |
|------|-----------------|
| `backend/drizzle/schema.ts` | Define all 13+ tables |
| `backend/lib/state/db-state.ts` | Save/load brand data |
| `backend/lib/agent/orchestrator.ts` | Route & inject context |
| `backend/mcp-servers/[agent]/server.ts` | Each agent's Neon operations |
| `backend/lib/memory/memory-manager.ts` | Cross-agent learnings |
| `backend/lib/attachment/attachment-persistence.ts` | File metadata storage |
| `frontend/pages/onboarding.tsx` | Collect 13 form fields |
| `frontend/pages/dashboard.tsx` | Display mapped outputs |

---

**ทุกข้อมูลจากฟอร์ม → ไปสู่พนักงานที่เหมาะสม → สร้างผลลัพธ์เฉพาะ → บันทึก Neon → ใช้งาน!** ✨
