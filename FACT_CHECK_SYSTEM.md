# Fact Check & Data Guard System

**ระบบรักษาความมั่นใจของ iDEAS365**
> Making iDEAS365 "Quietly Confident" - น่าเชื่อถือในระดับมืออาชีพ (Professional Grade)

---

## 📋 Overview

The system implements **6 core validation rules** to ensure:
- ✅ Brand data isolation (no cross-brand leakage)
- ✅ Anti-copycat protection (plagiarism prevention)
- ✅ Fact checking (no hallucination)
- ✅ USP grounding (brand consistency)
- ✅ Reference validation (source attribution)
- ✅ Consistency checks (tone & mood alignment)

---

## 🏗️ Architecture

```
Request Flow:
┌─────────────────────────────────────────┐
│ User Input → Route to Agent             │
├─────────────────────────────────────────┤
│ Agent generates response                 │
├─────────────────────────────────────────┤
│ THE GUARD (Orchestrator + DataGuardian) │
│ ├─ 1️⃣ Isolation Check                   │
│ ├─ 2️⃣ Anti-Copycat Check                │
│ ├─ 3️⃣ Fact Check (No Hallucination)     │
│ ├─ 4️⃣ USP Grounding                     │
│ ├─ 5️⃣ Reference Validation              │
│ └─ 6️⃣ Consistency Check                 │
├─────────────────────────────────────────┤
│ ✅ PASS → Send to User                  │
│ ⚠️ WARNING → Ask for Clarification      │
│ ❌ BLOCKED → Reject & Suggest Fix       │
└─────────────────────────────────────────┘
```

---

## 🛡️ The 6 Guards (Validation Rules)

### 1️⃣ **Isolation Guard**
**Purpose**: Brand Data Protection
```
Rule: ห้ามแชร์ข้อมูลข้าม brand_id โดยเด็ดขาด
```

**What it checks:**
- ✅ Content belongs to correct brand_id
- ✅ No references to other brands
- ✅ Cache is properly isolated

**Examples that FAIL:**
```
❌ "Let's use the same tagline from Competitor X"
❌ "Clone the visual style from Brand Y"
❌ "Access competitor data for analysis"
```

**How to fix:**
```
✅ Use only this brand's data and context
✅ Ask for original approach tailored to this brand
✅ Suggest: "I can create an original strategy for your brand instead"
```

---

### 2️⃣ **Anti-Copycat Guard**
**Purpose**: Plagiarism Prevention & IP Protection
```
Rule: ห้ามใช้แคปชั่นหรือสโลแกน 100% - ต้อง Rephrase ให้เข้ากับ Brand Voice
```

**Thresholds:**
- `> 90% similarity` → ❌ BLOCKED (must rephrase)
- `70-90% similarity` → ⚠️ WARNING (consider rephrase)
- `< 70% similarity` → ✅ PASSED (unique enough)

**Examples:**
```
❌ Original:  "Where Coffee Dreams Come True"
❌ Plagiarized: "Where Coffee Dreams Come True" (100% match)

✅ Rephrase v1: "Brewing Dreams, One Cup at a Time"
✅ Rephrase v2: "Your Coffee Fantasy, Perfectly Crafted"
```

**How it works:**
1. Calculates similarity score using Levenshtein distance
2. Checks for artist name protection (no "Picasso style" - use "Cubist" instead)
3. Recommends Brand Voice adjustments

---

### 3️⃣ **Fact Check Guard**
**Purpose**: Prevent Hallucination (No Fake Data)
```
Rule: ถ้าไม่แน่ใจต้องบอกทันทีว่า "ประมาณการ" - ห้ามแสดงตัวเลขปลอม
```

**Detects hallucination patterns:**
```
🔴 HIGH RISK (Auto-detect):
   • "23% increase in sales"
   • "$5.2M revenue"

🟡 MEDIUM RISK (Flag for review):
   • "Study shows that..."
   • "According to research..."
   • "Data reveals..."
```

**Fix examples:**
```
❌ "Studies show 73% of customers prefer..."
✅ "Estimated 73% of customers prefer..."
✅ "According to our analysis, approximately 73% prefer..."
```

---

### 4️⃣ **USP Grounding Guard**
**Purpose**: Brand Consistency
```
Rule: ทุกคำกล่าวอ้างต้องสอดคล้องกับ Core USP ของแบรนด์
```

**What it checks:**
1. No contradictions with brand USP
2. Content reflects brand's key differentiators
3. Tone matches brand positioning

**Example - Coffee Shop:**
```
Brand USP: "Premium specialty coffee with artist workspace"

❌ FAILS: "Our cheap budget coffee is popular"
❌ FAILS: "Perfect for business meetings in a corporate setting"

✅ PASSES: "Craft your espresso while connecting with creative minds"
✅ PASSES: "Where specialty coffee meets artistic inspiration"
```

---

### 5️⃣ **Reference Validation Guard**
**Purpose**: Source Attribution
```
Rule: เมื่ออ้างอิงเทรนด์ ต้องระบุแหล่งที่มาคร่าวๆ เพื่อให้ผู้ใช้นำไปรีเช็ค
```

**Requirements:**
- Data claims need citations
- Trends need sources
- Statistics need attribution

**Good practices:**
```
✅ "Trending on TikTok today"
✅ "According to recent market data, approximately 60% of..."
✅ "[Source: Industry Report 2024]"
✅ "Based on our customer survey conducted last month"
```

**Auto-flags when:**
- Contains percentage changes without source
- Contains dollar amounts without attribution
- Mentions research/study but no citation

---

### 6️⃣ **Consistency Check Guard**
**Purpose**: Brand Voice & Mood Alignment
```
Rule: ตรวจทานความสอดคล้องกับ Brand Voice และ Mood Keywords
```

**Checks:**
1. **Tone Alignment**
   ```
   formal tone ≠ "lol", "omg", "haha"
   playful tone ≠ "furthermore", "thus", "however"
   professional tone ≠ "yo", "dude", "bro"
   ```

2. **Mood Keywords**
   - Brand mood: ["warm", "artistic", "cozy", "creative", "sophisticated"]
   - Content must reflect these moods

**Example:**
```
Brand: Art Coffee Studio
Mood: warm, artistic, cozy, creative, sophisticated
Tone: casual

❌ "Our coffee is the fastest in the city - no time to relax!"
✅ "Savor hand-crafted specialty coffee in our creative sanctuary"
```

---

## 📊 Guard Report Structure

```typescript
interface DataGuardReport {
  timestamp: string;
  checks: {
    isolation: ValidationResult;      // Pass/Fail
    antiCopycat: ValidationResult;     // Similarity %
    factCheck: ValidationResult;        // Hallucination detected?
    uspGrounding: ValidationResult;     // Brand consistent?
    referenceValidation: ValidationResult;  // Sources cited?
    consistency: ValidationResult;      // Tone & mood aligned?
  };
  overallStatus: 'passed' | 'warning' | 'blocked';
  recommendations: string[];           // How to fix
}
```

---

## 🔄 Usage in Your Code

### Basic Usage - Validate Output

```typescript
import { orchestratorEngine } from '@/services/orchestratorEngine';

// When AI generates a response, validate it:
const agentResponse = "Our premium coffee is the cheapest...";

const validationResult = await orchestratorEngine.validateOutputWithGuard(
  agentResponse,
  'caption_001',  // content ID
  {
    originalContent: previousCaption,
    references: ['TikTok Trend Analysis']
  }
);

// Check result
if (validationResult.valid) {
  console.log('✅ Response approved');
} else {
  console.log('❌ Issues found:');
  validationResult.violations.forEach(v => console.log(v));
  console.log('💡 Suggestions:');
  validationResult.recommendations.forEach(r => console.log(r));
}

// Show guard report if available
if (validationResult.dataGuardReport) {
  const report = orchestratorEngine.generateDataGuardReport(
    validationResult.dataGuardReport
  );
  console.log(report);
}
```

### In Message Processing

```typescript
async function processAgentMessage(userInput: string) {
  // 1. Route to agent
  const routingResult = orchestratorEngine.route(userInput);

  // 2. Agent generates response
  const agentResponse = await agent.process(userInput);

  // 3. THE GUARD validates
  const validation = await orchestratorEngine.validateOutputWithGuard(
    agentResponse,
    undefined,
    { originalContent: userInput }
  );

  // 4. Decision
  if (!validation.valid) {
    return {
      status: 'needs_revision',
      message: 'The response has some issues that need fixing:',
      issues: validation.violations,
      suggestions: validation.recommendations,
      report: validation.dataGuardReport
    };
  }

  return {
    status: 'approved',
    content: agentResponse,
    confidence: 95,
    validatedAt: new Date().toISOString()
  };
}
```

---

## 🎯 Best Practices for Content Creation

### Before Sending Output:
```
✅ DO:
  • Run through all 6 guards
  • Cite sources for data claims
  • Rephrase existing content by 30%+
  • Keep brand USP in focus
  • Match brand tone & mood
  • Isolate brand data

❌ DON'T:
  • Copy competitor taglines
  • State opinions as facts
  • Use specific artist names
  • Ignore brand tone
  • Mix data from different brands
  • Make unsourced claims
```

### Content Quality Checklist:
```
Guard                 | Status | Notes
─────────────────────────────────────────
Isolation             | ✅     | Brand data only
Anti-Copycat          | ✅     | 45% similarity (unique)
Fact Check            | ✅     | All claims sourced
USP Grounding         | ✅     | Highlights "premium specialty"
Reference Validation  | ✅     | "Approx." used for estimates
Consistency           | ✅     | Tone: casual, Mood: warm/artistic
─────────────────────────────────────────
Overall              | ✅ PASS | Ready to use
```

---

## 📈 Guard Performance Metrics

```typescript
// Hypothetical monitoring
interface GuardMetrics {
  totalValidations: 1245;
  passRate: 0.78;           // 78% pass on first try
  warningRate: 0.15;        // 15% need revision
  blockRate: 0.07;          // 7% completely rejected
  averageIssuesPerBlock: 2.3;
  mostCommonIssue: 'hallucination' (45%);
}
```

---

## 🚨 Common Rejection Patterns

### Pattern 1: Hallucinated Data
```
❌ "Our customers are 95% satisfied" [no source]
✅ "Our customer feedback suggests high satisfaction"
   + Add actual survey data
```

### Pattern 2: Copycat Captions
```
❌ "Let's modify Competitor X's tagline"
✅ "Create a unique tagline highlighting our [USP]"
```

### Pattern 3: Tone Mismatch
```
Brand Tone: Professional
❌ "OMG, our product is literally fire, dude!"
✅ "Our innovative solution delivers proven results"
```

### Pattern 4: Brand Contradiction
```
Brand: Eco-friendly
❌ "Packaged in convenient plastic containers"
✅ "Eco-conscious packaging from sustainable materials"
```

---

## 🔐 Security Features

### Multi-Layer Protection:
1. **Brand Isolation**
   - Each brand has isolated namespace
   - Cross-brand access detected and blocked

2. **Content Integrity**
   - Similarity checking prevents plagiarism
   - Tone analysis ensures brand voice

3. **Data Reliability**
   - Hallucination detection
   - Source tracking
   - Consistency validation

4. **Audit Trail**
   - Every validation logged
   - Report generation for compliance
   - Timestamp tracking

---

## 📝 Guard Report Example

```
📋 Data Guard Report - 2024-02-20T14:32:10Z
Status: WARNING

🔍 Checks Performed:
✅ ห้ามแชร์ข้อมูลข้าม brand_id โดยเด็ดขาด
   └─ Brand ID: coffee-shop-01

✅ ป้องกันการเลียนแบบ Rephrase อย่างแท้จริง
   └─ Similarity: 68% (PASS - unique enough)

❌ ห้ามบอกเท็จ ถ้าไม่แน่ใจต้องระบุ "ประมาณการ"
   └─ Potential hallucination: "23% customer increase"

✅ ทุกคำกล่าวอ้างต้องสอดคล้องกับ Core USP
   └─ USP: Premium specialty coffee with artist workspace

⚠️ ต้องระบุแหล่งที่มาเมื่ออ้างอิงข้อมูล
   └─ Found claims without sources

✅ ตรวจทานความสอดคล้องกับ Brand Voice & Mood Keywords
   └─ Tone: casual, Mood: warm, artistic, cozy, creative

💡 Recommendations:
   • [Fact Check] ให้เพิ่มคำว่า "ประมาณการ" หรือ "อ้างอิง" ข้อมูล: HIGH: "23% customer increase"
   • [Reference Validation] ให้เพิ่มแหล่งที่มาเช่น "อ้างอิงจากเทรนด์ TikTok วันนี้"
```

---

## ✨ Impact on iDEAS365

### Before Guard System:
- ❌ Risk of brand data leakage
- ❌ Potential plagiarism issues
- ❌ Unverified claims damaging credibility
- ❌ Inconsistent brand voice
- ❌ No audit trail

### After Guard System:
- ✅ Trusted, professional-grade system
- ✅ Compliance-ready with audit logs
- ✅ Brand consistency guaranteed
- ✅ Data integrity protected
- ✅ "Quietly Confident" positioning

---

## 🎓 For Agents Using This System

All agents must:
1. ✅ Pass all 6 guards before returning response
2. ✅ Include guard report in response metadata
3. ✅ Follow recommendations from failed checks
4. ✅ Log all validations for audit

---

## 📚 Related Files

- `dataGuardService.ts` - Core validation implementation
- `orchestratorEngine.ts` - Integration point
- `intelligence.ts` - System rules definitions
- `agents.ts` - Agent guidelines

---

**Summary**: This system makes iDEAS365 a **trusted partner** for professional brand building, not just an AI tool. Trust is earned through consistency, accuracy, and reliability. ✨

