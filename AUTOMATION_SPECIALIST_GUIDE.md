# ⚙️ Automation Specialist Agent - Complete Guide

## 🎯 Overview

**Automation Specialist** (Agent #9) เป็นเอเจนต์ที่จัดการการทำงานอัตโนมัติของระบบ:

- 📤 **Content Factory Automation** - สร้างคอนเทนต์อัตโนมัติ
- 📝 **Caption Factory Automation** - สร้างแคปชั่นอัตโนมัติ
- 📅 **Posting Schedule** - โพสต์ไปยัง Social Media ตามตารางเวลา
- 🔌 **Make.com Integration** - เชื่อมต่อกับ Make.com workflows
- 📊 **Monitoring & Logging** - ติดตามสถานะการทำงานทั้งหมด

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Automation Specialist                      │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Content Factory  │  │ Caption Factory  │  │ Posting Schedule │
│  Automation      │  │  Automation      │  │  Automation      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌─────────────────────────────────────────────────────┐
   │         automationService.ts                        │
   │  - Cron scheduling                                  │
   │  - Webhook integration                              │
   │  - Retry logic & error handling                     │
   │  - Execution logging                                │
   └─────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   ┌──────────────────┐  ┌──────────────────┐
   │  Make.com        │  │   Neon Database  │
   │  Webhooks        │  │   (Logging)      │
   └──────────────────┘  └──────────────────┘
```

---

## 🚀 How to Use Automation Specialist

### **In Chat Interface:**

```
User: "Schedule content factory automation"

Automation Specialist:
⚙️ Automation Setup สำหรับ [Brand Name]

🎯 Automation Features Available:
1️⃣ Content Factory Automation
   ...
2️⃣ Caption Factory Automation
   ...
3️⃣ Posting Schedule
   ...

[Setup instructions and cron examples]
```

### **Supported Commands:**

| Command | Purpose |
|---------|---------|
| `schedule content factory` | Auto-process content submissions |
| `schedule caption factory` | Auto-generate captions from images |
| `posting schedule` | Auto-post to social media |
| `make.com setup` | Configure webhook integration |
| `automation status` | Check current automations |
| `stop automations` | Disable all automations |

---

## ⏰ Cron Expression Guide

**Format:** `minute hour day month weekday`

### Common Examples:

```
"0 9 * * *"       # Every day at 9:00 AM
"0 */6 * * *"     # Every 6 hours (0, 6, 12, 18 o'clock)
"0 9 * * 1-5"     # Weekdays (Mon-Fri) at 9:00 AM
"0 17 * * *"      # Every day at 5:00 PM
"0 9 * * 0"       # Sundays at 9:00 AM
"30 2 * * *"      # Every day at 2:30 AM
"0 9 1 * *"       # 1st day of every month at 9:00 AM
"0 */4 * * *"     # Every 4 hours
```

### Cron Syntax:

| Field | Range | Example |
|-------|-------|---------|
| Minute | 0-59 | `0`, `30`, `*/15` |
| Hour | 0-23 | `9`, `17`, `*/6` |
| Day | 1-31 | `1`, `15`, `*` |
| Month | 1-12 | `1`, `12`, `*` |
| Weekday | 0-6 (0=Sun) | `1`, `1-5`, `*` |

---

## 🔌 Make.com Integration

### **Your Webhook URLs:**

#### Content Factory Webhook:
```
https://hook.us2.make.com/3kcyu1ygkc8fjv19193apv8oxfhd1c6h
```

**Purpose:** Auto-process content submissions
**Triggers:** Daily at 9:00 AM by default

**Expected Payload:**
```json
{
  "brand_id": 1,
  "user_email": "creator@example.com",
  "category": "knowledge",        // or "sales"
  "platform": "TikTok",           // TikTok, Facebook, Instagram, YouTube
  "post_format": "Short Clip Video", // Photo, Info Graphic, etc.
  "item_id": "card-001",          // For knowledge content
  "raw_text": "Content description here...",
  "file_asset": "/uploads/image.jpg",
  "mime_type": "image/jpeg"
}
```

#### Caption Factory Webhook:
```
https://hook.us2.make.com/e7yel6e6t3ouyf8sv3dbni25nap685tf
```

**Purpose:** Auto-generate captions from images
**Triggers:** Every 6 hours by default

**Expected Payload:**
```json
{
  "brand_id": 1,
  "line_user_id": "U1234567890abc",
  "display_name": "John Doe",
  "image_data": "data:image/jpeg;base64,...",
  "mime_type": "image/jpeg",
  "mood": "VIBRANT",              // VIBRANT, CALM, FUN, LUXURY, AESTHETIC
  "user_words": "Modern, Fresh",
  "multilingual_level": 50        // 0-100 percentage
}
```

---

## 🛠️ Automation Service API

### **Setup Content Factory Automation:**

```typescript
import { automationService } from './services/automationService';

// Schedule Content Factory to run every day at 9 AM
await automationService.setupContentFactoryAutomation(
  brandId: 1,
  cronExpression: "0 9 * * *"
);
```

### **Setup Caption Factory Automation:**

```typescript
// Schedule Caption Factory to run every 6 hours
await automationService.setupCaptionFactoryAutomation(
  brandId: 1,
  cronExpression: "0 */6 * * *"
);
```

### **Send to Webhook:**

```typescript
const success = await automationService.sendToWebhook(
  webhookUrl: "https://hook.us2.make.com/...",
  payload: {
    user_email: "creator@example.com",
    category: "knowledge",
    platform: "TikTok",
    ...
  },
  submissionType: "content_factory"
);
```

### **Get Execution History:**

```typescript
const logs = automationService.getExecutionHistory(
  scheduleId: "content-factory-1",
  limit: 50
);
```

### **Check Status:**

```typescript
const status = automationService.getStatus();
console.log(status);
// Output:
// {
//   contentFactoryEnabled: true,
//   captionFactoryEnabled: true,
//   postingScheduleEnabled: true,
//   activeSchedules: 2,
//   config: { ... }
// }
```

### **Stop All Automations:**

```typescript
automationService.stopAll();
```

---

## 📊 Execution Logging

All automation executions are logged with:

- **Timestamp** - When the automation ran
- **Status** - 'success', 'failed', or 'skipped'
- **Items Processed** - How many items were handled
- **Items Failed** - How many failed
- **Execution Time** - How long it took (ms)
- **Error Details** - If something went wrong

**Storage:**
- In-memory during session
- Persisted to `automation_schedules` table in Neon (when connected)

---

## ⚡ Error Handling & Retry Logic

### Automatic Retry Strategy:

```typescript
{
  autoRetryFailures: true,    // Enable auto-retry
  maxRetries: 3,              // Max 3 attempts
  retryDelayMs: 5000,         // Initial delay: 5 seconds
  // Retry delays: 5s → 10s → 20s (exponential backoff)
}
```

### Webhook Timeout:

```typescript
{
  webhookTimeoutMs: 10000  // 10 second timeout per request
}
```

### Batch Processing:

```typescript
{
  batchSize: 100  // Process max 100 items per cycle
}
```

---

## 📋 Database Integration

When **Neon PostgreSQL** is connected, automations will:

1. **Read pending submissions** from:
   - `content_factory_submissions` (status = 'draft')
   - `caption_factory_submissions` (status = 'draft')

2. **Log all webhooks** to:
   - `makecom_integration_logs`

3. **Track schedules** in:
   - `automation_schedules`

4. **Record execution history** as:
   - Array of ExecutionLog objects

### Sample SQL Query:

```sql
-- View recent automation executions
SELECT
  automation_name,
  status,
  items_processed,
  processing_time_ms,
  last_run_at,
  next_run_at
FROM automation_schedules
ORDER BY last_run_at DESC;

-- Check webhook failures
SELECT
  submission_type,
  status,
  response_status,
  error_message,
  created_at
FROM makecom_integration_logs
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## 🎯 Best Practices

### 1. **Schedule Timing**
- ✅ Content Factory: 9 AM (daily) - Morning fresh content
- ✅ Caption Factory: 6-hourly - Keeps captions fresh
- ✅ Posting: Varies by platform (peak hours)

### 2. **Batch Size**
- ✅ Keep batch size ≤ 100 items
- ✅ Increase if timeouts occur
- ❌ Never exceed 500 items per cycle

### 3. **Monitoring**
- ✅ Check execution logs weekly
- ✅ Monitor Make.com webhook responses
- ✅ Set up alerts for failures

### 4. **Retry Strategy**
- ✅ Auto-retry on transient failures
- ✅ Manual retry for persistent failures
- ✅ Check error logs for root cause

### 5. **Maintenance**
- ✅ Test webhooks before scheduling
- ✅ Verify Make.com URLs are active
- ✅ Review execution logs monthly

---

## 🔍 Troubleshooting

### Problem: Webhook timeout

**Solution:**
```typescript
automationService.updateConfig({
  webhookTimeoutMs: 15000  // Increase to 15 seconds
});
```

### Problem: High failure rate

**Solutions:**
1. Check Make.com webhook is active
2. Verify payload format matches expected schema
3. Check internet connection
4. Increase retry delay:
   ```typescript
   automationService.updateConfig({
     retryDelayMs: 10000  // 10 seconds initial
   });
   ```

### Problem: Automation not triggering

**Solutions:**
1. Verify cron expression syntax
2. Check system time/timezone
3. Ensure server is running
4. Check browser console for errors

### Problem: Memory usage increasing

**Solution:**
Execution logs are kept in memory. Limit history:
```typescript
// Only keep last 100 logs
const recentLogs = automationService.getExecutionHistory(
  scheduleId,
  limit: 100
);
```

---

## 📈 Scaling & Performance

### Current Limits:

| Metric | Limit | Note |
|--------|-------|------|
| Batch Size | 100 items | Per execution cycle |
| Webhook Timeout | 10 seconds | Per request |
| Retry Attempts | 3 | Before giving up |
| Active Schedules | Unlimited | But use 2-5 recommended |
| Execution Log Memory | ~10MB | For 10,000 logs |

### If You Need Higher Throughput:

1. **Increase batch size** (test for timeouts)
2. **Add more schedules** (run every 3 hours instead of 6)
3. **Use Make.com Pro** (higher limits)
4. **Implement queue system** (Redis/Bull for better scaling)

---

## ✅ Integration Checklist

- [ ] Neon PostgreSQL connected
- [ ] Database tables created
- [ ] Make.com webhooks tested
- [ ] Content Factory automation scheduled
- [ ] Caption Factory automation scheduled
- [ ] Execution logs being recorded
- [ ] Error notifications set up
- [ ] Team trained on monitoring

---

## 🚀 Next Steps

1. **Setup Neon** - Connect database for persistence
2. **Configure Schedules** - Set up your automation times
3. **Test Webhooks** - Verify Make.com integration
4. **Monitor Execution** - Check logs weekly
5. **Optimize Settings** - Adjust batch sizes and timeouts

---

**Status**: ⚙️ Automation Specialist Agent Ready
**Build**: ✅ Integrated with aiService
**Database**: 📊 Ready for Neon
**Make.com**: 🔌 Webhooks configured
**Monitoring**: 📈 Execution logging enabled

---

## 📞 Support

For issues:
1. Check execution logs: `automationService.getExecutionHistory()`
2. Review Make.com dashboard
3. Check Neon database logs
4. See troubleshooting section above

