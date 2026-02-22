# 📋 Brand Knowledge Template - Usage Guide
## iDEAS365 Multi-Tenant System

**Version**: 1.0
**Status**: ✅ Ready for Onboarding
**Last Updated**: 2026-02-20

---

## 🎯 Overview

**Brand Knowledge Template** คือระบบเก็บข้อมูลแบรนด์ที่แบ่งเป็น **3 Buckets** เพื่อให้ Orchestrator สามารถส่งข้อมูลถูกทีถูก Agent ได้อย่างแม่นยำ

### 💡 ข้อดี
- ✅ **Input Once** - ลูกค้าเหนื่อยกรอกข้อมูลแค่ครั้งเดียว
- ✅ **Use Everywhere** - Orchestrator ใช้ข้อมูลนี้ส่งต่อให้ agents ตลอด
- ✅ **Smart Lazy** - ไม่ขอข้อมูลซ้ำซ้อน เฉพาะที่จำเป็น
- ✅ **Data Security** - ข้อมูลแยกตาม brand_id เข้มงวด
- ✅ **Ready for Scale** - Multi-tenant architecture พร้อม 100 แบรนด์พร้อมกัน

---

## 📊 3-Bucket Architecture

### **Bucket 1: Strategist Data** (สำหรับ The Strategist Cluster)

```json
{
  "strategist_data": {
    "brand_name": "ชื่อแบรนด์ (ไทย)",
    "brand_name_en": "Brand Name (English)",
    "industry": "ประเภทธุรกิจ (เช่น Cafe, Fashion, Food Delivery)",
    "business_model": "B2B, B2C, Subscription, Hybrid",
    "core_usp": [
      "จุดเด่น #1 (เช่น Premium specialty coffee)",
      "จุดเด่น #2 (เช่น Artist workspace community)",
      "จุดเด่น #3 (Optional)"
    ],
    "competitors": [
      "ชื่อคู่แข่ง A",
      "ชื่อคู่แข่ง B"
    ],
    "legal_info": {
      "tax_id": "เลขประจำตัวผู้เสียภาษี (ถ้ามี)",
      "company_address": "ที่อยู่สำหรับออกเอกสาร"
    }
  }
}
```

**ใช้โดย Agents:**
- 📊 **Market Analyst** - วิเคราะห์ SWOT, แข่งขัน, market gap
- 💰 **Business Planner** - คำนวณต้นทุน, ราคา, งบประมาณ, ใบเสร็จ
- 📈 **Insights Agent** - ติดตาม KPI, ประเมินประสิทธิภาพ

**Example:**
```json
{
  "strategist_data": {
    "brand_name": "คาเฟ่อาร์ต",
    "brand_name_en": "Art Coffee Studio",
    "industry": "Cafe & Coffee Shop",
    "business_model": "B2C",
    "core_usp": [
      "Premium specialty coffee with artist workspace",
      "Community-driven creative space",
      "Freshly roasted beans daily"
    ],
    "competitors": ["Artemis Cafe", "3HT Coffee"],
    "legal_info": {
      "tax_id": "1234567890123",
      "company_address": "123 Sukhumvit Road, Bangkok"
    }
  }
}
```

---

### **Bucket 2: Studio Data** (สำหรับ The Studio Cluster)

```json
{
  "studio_data": {
    "visual_identity": {
      "primary_color": "#8B4513",
      "secondary_colors": ["#D2B48C", "#654321"],
      "font_family": ["Playfair Display", "Lato"],
      "mood_and_tone": ["Warm", "Artistic", "Cozy", "Creative", "Sophisticated"]
    },
    "brand_assets": {
      "logo_url": "https://cdn.example.com/logo.png",
      "video_style": "Cinematic, slow-paced, warm lighting",
      "forbidden_elements": [
        "Plastic cups (eco-friendly brand)",
        "Overly cartoonish styles",
        "Neon colors (contrary to warm mood)"
      ]
    }
  }
}
```

**ใช้โดย Agents:**
- 🎨 **Brand Builder** - สร้าง Brand Identity, Mood & Tone
- ✏️ **Design Agent** - ออกแบบ Logo, CI, Landing Page, Accessible design
- 🎬 **Video Gen (Art)** - ออกแบบ Theme วิดีโอ, Visual Narrative

**Example:**
```json
{
  "studio_data": {
    "visual_identity": {
      "primary_color": "#8B4513",
      "secondary_colors": ["#D2B48C", "#654321"],
      "font_family": ["Playfair Display", "Lato"],
      "mood_and_tone": ["Warm", "Artistic", "Cozy", "Creative", "Sophisticated"]
    },
    "brand_assets": {
      "logo_url": "https://cdn.ideas365.com/artcoffee-logo.png",
      "video_style": "Cinematic, slow-paced, warm lighting, focus on latte art",
      "forbidden_elements": [
        "Plastic cups",
        "Bright neon colors",
        "Overly cartoonish animation"
      ]
    }
  }
}
```

---

### **Bucket 3: Agency Data** (สำหรับ The Agency Cluster)

```json
{
  "agency_data": {
    "target_audience": {
      "persona": "Creative professionals, artists, students (25-45 years old)",
      "pain_points": [
        "Need quiet workspace for creative work",
        "Seek community with like-minded creatives",
        "Want quality coffee while working"
      ]
    },
    "communication": {
      "tone_of_voice": "Casual but respectful, friendly, inspirational",
      "language_level": "Thai with occasional English terms (level 3/5)",
      "forbidden_words": [
        "Commercial",
        "Corporate jargon",
        "Overly formal language"
      ],
      "signature_hashtags": ["#ArtCoffeeStudio", "#CreativeSpace", "#CommunityFirst"]
    },
    "automation_needs": {
      "line_oa": "@artcoffeestudio",
      "email_notification": "admin@artcoffee.com"
    }
  }
}
```

**ใช้โดย Agents:**
- 📝 **Caption Creator** - เขียนแคปชั่น 6 สไตล์ × 4 ภาษา
- 📅 **Campaign Planner** - วางแผน Content 30 วัน, Growth Strategy
- 🎥 **Video Gen (Script)** - เขียนสคริปต์, Production direction
- ⚙️ **Automation Specialist** - จัดโพสต์อัตโนมัติ, Webhook setup

**Example:**
```json
{
  "agency_data": {
    "target_audience": {
      "persona": "Creative professionals (25-45y), artists, design students, coffee enthusiasts",
      "pain_points": [
        "Need quiet workspace for focused creative work",
        "Looking for community with like-minded creatives",
        "Want quality specialty coffee while working",
        "Tired of impersonal chain cafes"
      ]
    },
    "communication": {
      "tone_of_voice": "Casual but respectful, friendly, inspirational, community-focused",
      "language_level": "Thai with occasional English design terms (level 3/5 - เน้นความเท่)",
      "forbidden_words": [
        "Commercial",
        "Corporate jargon",
        "Overly formal Thai language (ครับ/คะ too much)"
      ],
      "signature_hashtags": ["#ArtCoffeeStudio", "#CreativeSpace", "#CommunityFirst", "#ArtistsGather"]
    },
    "automation_needs": {
      "line_oa": "@artcoffeestudio",
      "email_notification": "marketing@artcoffee.com"
    }
  }
}
```

---

## 🚀 How Orchestrator Uses This Data

### **Scenario 1: User asks for SWOT Analysis**
```
User: "วิเคราะห์ SWOT ร้านกาแฟของฉัน"

Orchestrator:
1. Recognize Intent → Strategist Cluster
2. Find Best Agent → Market Analyst
3. Pull Data → strategist_data bucket
4. Send Context:
   {
     "agent": "market-analyst",
     "brand_context": {
       "brand_name": "Art Coffee Studio",
       "industry": "Cafe & Coffee Shop",
       "core_usp": ["Premium specialty coffee", "Artist workspace"],
       "competitors": ["Artemis Cafe", "3HT Coffee"]
     },
     "task": "Analyze SWOT based on USP and competitors"
   }
5. Market Analyst → Generate SWOT
6. Verification Layer → Check facts, consistency
7. Return to User
```

---

### **Scenario 2: User asks for Caption Design**
```
User: "ช่วยเขียนแคปชั่นตามสไตล์ 6 แบบ"

Orchestrator:
1. Recognize Intent → Agency Cluster
2. Find Best Agent → Caption Creator
3. Pull Data → agency_data bucket (+ core_usp from strategist_data)
4. Send Context:
   {
     "agent": "caption-creator",
     "brand_context": {
       "tone_of_voice": "Casual but respectful",
       "language_level": 3,
       "forbidden_words": ["Corporate jargon"],
       "signature_hashtags": ["#ArtCoffeeStudio"],
       "target_persona": "Creative professionals (25-45y)"
     },
     "cross_data": {
       "core_usp": ["Premium specialty coffee", "Artist workspace community"]
     },
     "task": "Write 6 different caption styles + 4 languages"
   }
5. Caption Creator → Generate Captions
6. Verification Layer → Check plagiarism, tone, USP integration
7. Return to User
```

---

### **Scenario 3: User asks for Video Theme Design**
```
User: "ออกแบบ Theme วิดีโอ ตามแนวแบรนด์"

Orchestrator:
1. Recognize Intent → Studio Cluster
2. Find Best Agent → Video Gen (Art)
3. Pull Data → studio_data bucket
4. Send Context:
   {
     "agent": "video-generator-art",
     "brand_context": {
       "primary_color": "#8B4513",
       "mood_and_tone": ["Warm", "Artistic", "Cozy"],
       "video_style": "Cinematic, slow-paced",
       "forbidden_elements": ["Plastic cups", "Neon colors"]
     },
     "cross_data": {
       "core_usp": ["Premium specialty coffee"],
       "brand_name": "Art Coffee Studio"
     },
     "task": "Design video theme with mood keywords, no artist mimicking"
   }
5. Video Gen (Art) → Generate Theme
6. Verification Layer → Check art style protection, mood alignment
7. Return to User
```

---

## 🔐 Data Security & Privacy Rules

### ✅ **MUST DO:**
1. **Brand Isolation** - ทุกข้อมูลต้องเก็บแยกตาม `brand_id`
2. **API Security** - ทุกการเรียก API ต้องมี `brand_id` ใน header
3. **Cache TTL** - Cache ต้องมี time-to-live (เช่น 30 นาที)
4. **Anonymous Learning** - ลบชื่อแบรนด์ + PII ก่อนใช้เรียนรู้
5. **Audit Log** - บันทึกการเข้าถึงข้อมูลแต่ละแบรนด์

### ❌ **NEVER DO:**
- ❌ ส่งข้อมูลแบรนด์ A ไปให้แบรนด์ B
- ❌ เก็บ API keys ในโค้ด
- ❌ Log ข้อมูล PII โดยสมบูรณ์
- ❌ แชร์ Master Context ข้ามหลายผู้ใช้
- ❌ Cache ข้อมูลโดยไม่มี brand_id

---

## 📝 Onboarding Questionnaire

### **Part A: One-Time Setup** (เก็บถาวร)

**ส่วนที่ 1: ข้อมูลพื้นฐาน**
```
1. ชื่อแบรนด์ (ไทย): ________________
2. Brand Name (English): ________________
3. ประเภทธุรกิจ: ________________
4. จุดเด่น (Core USP) - 2-3 ข้อ:
   - ________________________
   - ________________________
5. คู่แข่ง (ถ้ามี):
   - ________________________
6. Tax ID (ถ้ามี): ________________
7. Company Address: ________________
```

**ส่วนที่ 2: ลักษณะสายตา**
```
1. สีหลัก (Hex): ________ (เช่น #8B4513)
2. สีรองลงมา (Hex - optional): ________, ________
3. ฟอนต์ (ชื่อ): ________________
4. Mood & Tone (3-5 คำ): ____________________
5. คำต้องห้าม / สิ่งห้ามมีในภาพ:
   - ________________________
   - ________________________
```

**ส่วนที่ 3: กลุ่มเป้าหมาย**
```
1. ลูกค้าคือใครบ้าง (persona): ________________
2. ปัญหาที่พวกเขาเจอ:
   - ________________________
   - ________________________
3. โทนเสียงในการคุย: ________________
4. ระดับความเท่ (1-5): ___
5. Hashtags ประจำแบรนด์:
   - #______
   - #______
6. LINE OA (ถ้ามี): ________________
7. Email สำหรับแจ้งเตือน: ________________
```

---

## 🎯 Implementation Roadmap

### **Phase 1: Data Collection** ✅ DONE
- [x] Brand Knowledge Template schema created
- [x] System rules enhanced (6 rules)
- [x] Agent system prompts upgraded

### **Phase 2: Frontend Integration** ⏳ NEXT
- [ ] Create Onboarding Form (index.html)
- [ ] Add field validation
- [ ] Create "save to database" handler

### **Phase 3: Backend Storage** ⏳ NEXT
- [ ] Create `brand_knowledge` table in Neon DB
- [ ] Implement save/fetch API endpoints
- [ ] Add brand_id enforcement in queries

### **Phase 4: Orchestrator Distribution** ⏳ NEXT
- [ ] Orchestrator fetches Brand Knowledge Template
- [ ] Distribute data to agents based on cluster
- [ ] Cross-cluster data sharing when needed

### **Phase 5: Verification & QA** ⏳ NEXT
- [ ] Test with sample data (Art Coffee Studio)
- [ ] Verify data flow across clusters
- [ ] Test verification layer
- [ ] Load testing (multiple brands)

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│            ONBOARDING FORM (User Input)             │
│  Part A: Strategist | Part B: Studio | Part C: Agency│
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Brand Knowledge Template   │
        │  (3-Bucket Structure)       │
        │  - strategist_data          │
        │  - studio_data              │
        │  - agency_data              │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Neon Database Storage      │
        │  (brand_id scoped)          │
        │  Cache: Redis (30 min TTL)  │
        └─────────────┬───────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │    Orchestrator Engine      │
        │  (Intent Recognition)       │
        │  (Smart Routing)            │
        │  (Data Distribution)        │
        └──┬──────────┬──────────┬────┘
           │          │          │
           ▼          ▼          ▼
    ┌─────────────┐ ┌──────────┐ ┌─────────────┐
    │The Strategist│ │The Studio│ │The Agency   │
    │(Budget Data) │ │(Visual)  │ │(Tone+USP)   │
    └─────────────┘ └──────────┘ └─────────────┘
           │          │          │
           ▼          ▼          ▼
    [Agents Process] → [Verification Layer]
                            │
                            ▼
                    [Quality Gate Check]
                    (Isolation, Anti-Copycat,
                     Fact Check, Consistency)
                            │
                            ▼
                    [Return to User]
```

---

## ✅ Quality Assurance Checklist

- [ ] All brand_id checks are in place
- [ ] Cache invalidation works properly
- [ ] Cross-cluster data sharing doesn't leak secrets
- [ ] Verification layer catches inconsistencies
- [ ] Error handling graceful (no crashes)
- [ ] Performance acceptable (< 2s response time)
- [ ] Multi-brand isolation verified
- [ ] Audit logs recording data access

---

## 🚨 Common Pitfalls & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Agent receiving wrong data | Missing brand_id in context | Always include brand_id in pull requests |
| Data leaked between brands | Insufficient isolation checks | Implement brand_id validation at query level |
| Cache returning stale data | No TTL or invalidation | Set TTL to 30 min, invalidate on update |
| Slow responses | Fetching all agents' data | Use lazy loading, fetch only needed bucket |
| Inconsistent verification | Rules not applied uniformly | Run verification before every response |
| Cross-cluster info missing | Orchestrator not pulling related data | Enable cross-bucket queries (with brand_id check) |

---

## 📞 Support & Debugging

### **Q: User data ดูไม่ถูกต้อง**
1. Check brand_id in database
2. Verify cache TTL not expired
3. Check Orchestrator pull logic

### **Q: Agents ได้ข้อมูลไม่ครบ**
1. Verify task-specific prompts triggered
2. Check if Part B data collected
3. Ensure cross-cluster queries working

### **Q: Performance slow**
1. Check Redis cache hit rate
2. Verify query optimization
3. Monitor database connections

---

**Version**: 1.0
**Last Updated**: 2026-02-20
**Next Review**: After Phase 2 (Frontend Integration)
