# Quick Test Guide: iDEAS365 3-Cluster System
## Test ระบบจริงใน 15 นาที (ASAP)

---

## 🚀 Pre-Test Setup

### 1. Initialize System
```typescript
import { orchestratorEngine } from '@/services/orchestratorEngine';
import { databaseService } from '@/services/databaseService';
import { videoGeneratorService } from '@/services/videoGeneratorService';

// Initialize
await videoGeneratorService.initialize();
console.log('✅ System initialized');
```

### 2. Load Test Brand Context
```typescript
const testBrand = {
  brandId: 'test-brand-001',
  brandNameTh: 'คาเฟ่อาร์ต',
  brandNameEn: 'Art Coffee Studio',
  industry: 'Cafe & Coffee Shop',
  coreUSP: 'Premium specialty coffee with artist workspace',
  visualStyle: {
    primaryColor: '#8B4513',
    moodKeywords: ['warm', 'artistic', 'cozy', 'creative', 'sophisticated']
  },
  targetAudience: 'Creative professionals, artists, students (25-45 years)',
  toneOfVoice: 'casual'
};

orchestratorEngine.setMasterContext(testBrand);
console.log('✅ Brand context loaded');
```

---

## 🎯 Test The Strategist Cluster (5 min)

### Test 1: Market Analysis
```
INPUT: "วิเคราะห์ SWOT ร้านกาแฟ"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['strategist']
  ✓ Agent Match: Market Analyst
  ✓ Confidence: > 80%

TEST CODE:
─────────────────────────────────────────
const result1 = orchestratorEngine.route("วิเคราะห์ SWOT ร้านกาแฟ");
console.log(`Agent: ${result1.agent.name}`);
console.log(`Cluster: ${result1.cluster}`);
console.log(`Confidence: ${result1.confidence}%`);

EXPECTED OUTPUT:
  Agent: Market Analyst
  Cluster: strategist
  Confidence: 90%
─────────────────────────────────────────
```

### Test 2: Pricing Strategy
```
INPUT: "จะตั้งราคากาแฟเท่าไหร่ดี?"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['strategist']
  ✓ Agent Match: Business Planner
  ✓ Confidence: > 85%

TEST CODE:
─────────────────────────────────────────
const result2 = orchestratorEngine.route("จะตั้งราคากาแฟเท่าไหร่ดี?");
console.log(`Agent: ${result2.agent.name}`);
console.log(`Reason: ${result2.reason}`);

EXPECTED OUTPUT:
  Agent: Business Planner
  Reason: Matched with Agent: Business Planner (keywords found)
─────────────────────────────────────────
```

### Test 3: KPI Analysis
```
INPUT: "ทำไมยอดขายลดลง 30%? ควรทำอะไร?"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['strategist']
  ✓ Agent Match: Insights Agent
  ✓ Confidence: > 80%

TEST CODE:
─────────────────────────────────────────
const result3 = orchestratorEngine.route("ทำไมยอดขายลดลง 30%?");
console.log(`Agent: ${result3.agent.name}`);

EXPECTED OUTPUT:
  Agent: Insights Agent
─────────────────────────────────────────
```

---

## 🎨 Test The Studio Cluster (5 min)

### Test 4: Brand Identity
```
INPUT: "Brand Identity มีอะไรบ้าง?"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['studio']
  ✓ Agent Match: Brand Builder
  ✓ Confidence: > 85%

TEST CODE:
─────────────────────────────────────────
const result4 = orchestratorEngine.route("Brand Identity มีอะไรบ้าง?");
console.log(`Agent: ${result4.agent.name}`);
console.log(`Cluster: ${result4.cluster}`);

EXPECTED OUTPUT:
  Agent: Brand Builder
  Cluster: studio
─────────────────────────────────────────
```

### Test 5: Design Request
```
INPUT: "ออกแบบโลโก้ร้านกาแฟที่ดูมีค่า"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['studio']
  ✓ Agent Match: Design Agent
  ✓ Confidence: > 90%

TEST CODE:
─────────────────────────────────────────
const result5 = orchestratorEngine.route("ออกแบบโลโก้");
console.log(`Agent: ${result5.agent.name}`);

EXPECTED OUTPUT:
  Agent: Design Agent
─────────────────────────────────────────
```

### Test 6: Color Palette
```
INPUT: "สีแบรนด์เราควรเป็นอะไร?"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['studio']
  ✓ Agent Match: Design Agent or Brand Builder
  ✓ Confidence: > 80%

TEST CODE:
─────────────────────────────────────────
const result6 = orchestratorEngine.route("Color Palette สำหรับแบรนด์อาหาร");
console.log(`Agent: ${result6.agent.name}`);

EXPECTED OUTPUT:
  Agent: Design Agent (or Brand Builder)
─────────────────────────────────────────
```

---

## 🚀 Test The Agency Cluster (5 min)

### Test 7: Caption Creation
```
INPUT: "ช่วยคิดแคปชั่นโดนๆ"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['agency']
  ✓ Agent Match: Caption Creator
  ✓ Confidence: > 90%

TEST CODE:
─────────────────────────────────────────
const result7 = orchestratorEngine.route("ช่วยคิดแคปชั่นโดนๆ");
console.log(`Agent: ${result7.agent.name}`);
console.log(`Cluster: ${result7.cluster}`);

EXPECTED OUTPUT:
  Agent: Caption Creator
  Cluster: agency
─────────────────────────────────────────
```

### Test 8: Campaign Planning
```
INPUT: "วางแผน Content 30 วัน"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['agency']
  ✓ Agent Match: Campaign Planner
  ✓ Confidence: > 85%

TEST CODE:
─────────────────────────────────────────
const result8 = orchestratorEngine.route("วางแผน Content Calendar 1 เดือน");
console.log(`Agent: ${result8.agent.name}`);

EXPECTED OUTPUT:
  Agent: Campaign Planner
─────────────────────────────────────────
```

### Test 9: Video Script
```
INPUT: "ทำคลิปตามเทรนด์ TikTok วันนี้"

EXPECTED ROUTING:
  ✓ Intent Recognition: ['agency']
  ✓ Agent Match: Video Generator (Script)
  ✓ Confidence: > 85%

TEST CODE:
─────────────────────────────────────────
const result9 = orchestratorEngine.route("ทำคลิปตามเทรนด์ TikTok");
console.log(`Agent: ${result9.agent.name}`);

EXPECTED OUTPUT:
  Agent: Video Generator (Script)
─────────────────────────────────────────
```

---

## 🛡️ Test Data Guard (3 min)

### Test 10: Fact Check Validation
```
TEST INPUT:
  Agent Output: "ยอดขายเพิ่มขึ้น 85% เมื่อเดือนที่แล้ว"
  (No source provided)

EXPECTED: ⚠️ WARNING - Hallucination detected

TEST CODE:
─────────────────────────────────────────
const testOutput = "ยอดขายเพิ่มขึ้น 85% เมื่อเดือนที่แล้ว";
const validation = await orchestratorEngine.validateOutputWithGuard(
  testOutput,
  'test_caption_001',
  { references: [] }
);

console.log('Valid:', validation.valid);
console.log('Violations:', validation.violations);
console.log('Recommendations:', validation.recommendations);

EXPECTED OUTPUT:
  Valid: false
  Violations: ["⚠️ ตรวจพบการอ้างอิงข้อมูลที่อาจไม่แน่นอน"]
  Recommendations: ["✓ เพิ่มคำว่า 'ประมาณการ' หรือ 'อ้างอิง'"]
─────────────────────────────────────────
```

### Test 11: Anti-Copycat Check
```
TEST INPUT:
  Original: "Where Dreams Come True"
  New: "Where Dreams Come True" (100% match)

EXPECTED: ❌ BLOCKED - Too similar

TEST CODE:
─────────────────────────────────────────
const antiCopyResult = orchestratorEngine.antiCopycatCheck(
  "Where Dreams Come True",
  "Where Dreams Come True"
);

console.log('Valid:', antiCopyResult.valid);
console.log('Violations:', antiCopyResult.violations);

EXPECTED OUTPUT:
  Valid: false
  Violations: ["❌ ข้อความใหม่มีความคล้ายคลึงกับต้นฉบับ > 90%"]
─────────────────────────────────────────
```

### Test 12: USP Consistency Check
```
TEST INPUT:
  Brand USP: "Premium specialty coffee with artist workspace"
  Output: "ราคาแบบ Budget Coffee - ราคาถูกที่สุด"

EXPECTED: ❌ BLOCKED - Contradicts USP

TEST CODE:
─────────────────────────────────────────
const uspResult = await orchestratorEngine.validateOutputWithGuard(
  "ราคาแบบ Budget Coffee - ราคาถูกที่สุด",
  undefined,
  {}
);

console.log('Valid:', uspResult.valid);
console.log('Warnings:', uspResult.warnings);

EXPECTED OUTPUT:
  Valid: false
  Warnings: ["⚠️ ผลลัพธ์อาจไม่ตรงกับ USP ของแบรนด์"]
─────────────────────────────────────────
```

---

## 🔄 Test Cross-Agent Coordination (3 min)

### Test 13: Multi-Cluster Request
```
INPUT: "ออกแบบโลโก้ + วิเคราะห์ตลาด"

EXPECTED:
  ✓ Intent Recognition: ['studio', 'strategist']
  ✓ Agent 1: Design Agent (studio)
  ✓ Agent 2: Market Analyst (strategist)
  ✓ Auto-coordination: Design uses Market insights

TEST CODE:
─────────────────────────────────────────
const multiResult = orchestratorEngine.recognizeIntent(
  "ออกแบบโลโก้ + วิเคราะห์ตลาด"
);

console.log('Intents:', multiResult);

EXPECTED OUTPUT:
  Intents: ['studio', 'strategist']
─────────────────────────────────────────
```

---

## 📊 Test Summary Checklist

```
ROUTING & INTENT RECOGNITION:
  ✓ Test 1: Market Analyst routing (SWOT)
  ✓ Test 2: Business Planner routing (pricing)
  ✓ Test 3: Insights Agent routing (KPI)
  ✓ Test 4: Brand Builder routing (identity)
  ✓ Test 5: Design Agent routing (logo)
  ✓ Test 6: Design Agent routing (colors)
  ✓ Test 7: Caption Creator routing
  ✓ Test 8: Campaign Planner routing
  ✓ Test 9: Video Generator routing

DATA GUARD VALIDATION:
  ✓ Test 10: Fact Check detection
  ✓ Test 11: Anti-Copycat check
  ✓ Test 12: USP Consistency check

CROSS-AGENT COORDINATION:
  ✓ Test 13: Multi-cluster handling

TOTAL: 13 tests
EXPECTED TIME: 15 minutes
SUCCESS RATE: 100% (all tests should pass)
```

---

## 🎯 Expected Results

### Successful Test Run Output:
```
✅ Test 1: Market Analyst - PASSED (confidence: 90%)
✅ Test 2: Business Planner - PASSED (confidence: 85%)
✅ Test 3: Insights Agent - PASSED (confidence: 80%)
✅ Test 4: Brand Builder - PASSED (confidence: 85%)
✅ Test 5: Design Agent - PASSED (confidence: 90%)
✅ Test 6: Design Agent - PASSED (confidence: 80%)
✅ Test 7: Caption Creator - PASSED (confidence: 90%)
✅ Test 8: Campaign Planner - PASSED (confidence: 85%)
✅ Test 9: Video Generator (Script) - PASSED (confidence: 85%)
✅ Test 10: Fact Check - BLOCKED (as expected)
✅ Test 11: Anti-Copycat - BLOCKED (as expected)
✅ Test 12: USP Consistency - BLOCKED (as expected)
✅ Test 13: Multi-Cluster - PASSED (both clusters detected)

═════════════════════════════════════════
13/13 TESTS PASSED ✅
System Status: PROFESSIONAL-GRADE READY
═════════════════════════════════════════
```

---

## 💡 Troubleshooting

### If Test Fails:
```
1. Check Master Context is loaded
   → orchestratorEngine.getMasterContext()

2. Check routing keywords in intelligence.ts
   → Look for routingKeywords.strategist/studio/agency

3. Check agent definitions
   → getAllAgents() should return 11 agents

4. Check Data Guard Service
   → dataGuardian.validateContent() should return report

5. Check Orchestrator Engine
   → orchestratorEngine.route() should match keywords
```

---

## 🚀 Next: Production Deployment

After tests pass:
1. ✅ Add Dashboard Navigation (3 cluster buttons)
2. ✅ Create Onboarding Flow (Master Context collection)
3. ✅ Setup Database persistence (Neon PostgreSQL)
4. ✅ Enable Analytics & Logging
5. ✅ Deploy to production

**Status**: Ready for ASAP Testing ✨
