# Quick Setup Checklist ✅

Get your Video Generator running in 5 steps.

---

## Step 1: Configure Google Sheets 📊

### Create Your Spreadsheet

1. Create a new Google Sheet or use existing one
2. Create 3 sheets:

**Sheet 1: Content_Log**
```
Columns:
A | Main_Category     (e.g., "Product", "Tutorial")
B | Timestamp_In      (auto-filled by system)
C | User_Email        (shop owner email)
D | Category          (e.g., "Short Clip Video")
E | Post_Format       (e.g., "Product Highlight")
F | Item_ID           (unique ID: prod_123)
G | Raw_Text          (product description)
H | Platform          (YouTube, TikTok, Instagram)
I | Status            (pending, completed, failed)
```

**Sheet 2: Production_Log**
```
Columns:
A | Timestamp_Out     (when generated)
B | Main_Category     (category)
C | User_Email        (who requested)
D | Category          (Short Clip Video, etc.)
E | Final_Script      (AI-generated script)
F | Video_Result_URL  (https://youtu.be/...)
```

**Sheet 3: Prompt_Library**
```
Columns:
A | Template_ID       (template_001)
B | Category          (Short Clip Video)
C | Instruction_Prompt (how to write the script)
D | Tone_Style        (Engaging, Educational)
E | Examples          (format examples)
```

### Get Sheet IDs

- Open your spreadsheet
- URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit...`
- Copy the `{SHEET_ID}` for each sheet
- Note the **gid** parameter for each sheet tab

---

## Step 2: Setup Environment Variables 🔑

### Create/Update `.env` file

```env
# Google Sheets
GOOGLE_SHEETS_ID=<your-main-spreadsheet-id>
GOOGLE_SHEETS_API_KEY=<your-google-api-key>
GOOGLE_SHEETS_CONTENT_LOG_ID=71977369
GOOGLE_SHEETS_PRODUCTION_LOG_ID=<production-sheet-id>
GOOGLE_SHEETS_PROMPT_LIBRARY_ID=<template-sheet-id>

# Claude API
CLAUDE_API_KEY=sk-ant-<your-anthropic-key>

# YouTube (optional, for production)
YOUTUBE_API_KEY=<your-youtube-api-key>
YOUTUBE_OAUTH_CLIENT_ID=<your-oauth-client-id>

# Make.com (optional, for video upload)
MAKECOM_WEBHOOK_URL=<your-make-webhook-for-youtube-upload>

# Database
DATABASE_URL=postgresql://user:password@host:5432/socialfactory
```

---

## Step 3: Initialize Services ⚙️

### In Your App Startup

```typescript
// app.ts or main.ts
import { videoGeneratorService } from '@/services/videoGeneratorService';
import { automationService } from '@/services/automationService';

async function initializeApp() {
  // Initialize video generator
  console.log('📹 Initializing Video Generator...');
  await videoGeneratorService.initialize();

  // Optional: Setup automated generation
  console.log('⏰ Setting up automation...');
  await automationService.setupVideoGeneratorAutomation(
    '0 9 * * *',  // 9 AM daily
    'YouTube'     // Platform
  );

  console.log('✅ Ready to generate videos!');
}

// Call on app startup
initializeApp().catch(console.error);
```

---

## Step 4: Test Generation 🧪

### Manual Test

```typescript
import { videoGeneratorService } from '@/services/videoGeneratorService';

async function testVideoGeneration() {
  const testContent = {
    mainCategory: 'Test',
    userEmail: 'test@example.com',
    category: 'Short Clip Video',
    postFormat: 'Test',
    itemId: 'test_001',
    rawText: 'This is a test product. High quality, affordable, eco-friendly.',
    platform: 'YouTube',
    status: 'pending'
  };

  console.log('🎬 Generating test video...');
  const result = await videoGeneratorService.generateVideoContent(testContent);

  console.log('✅ Generation complete!');
  console.log('Script:', result.finalScript.finalScript);
  console.log('URL:', result.videoUrl);
  console.log('Platform:', result.platform);
}

testVideoGeneration().catch(console.error);
```

**Expected output:**
```
🎬 Generating test video...
✅ Generation complete!
Script: ว่าแต่คุณรู้หรือเปล่า...
URL: https://youtu.be/AbCdEfGhIjK
Platform: YouTube
```

---

## Step 5: Monitor & Optimize 📈

### Check Execution Logs

```typescript
import { automationService } from '@/services/automationService';

// View execution history
const logs = automationService.getExecutionLogs('video-generator-YouTube');
logs.forEach(log => {
  console.log(`
    ⏰ ${log.timestamp}
    Status: ${log.status}
    Videos Generated: ${log.itemsProcessed}
    Failed: ${log.itemsFailed}
    Duration: ${log.executionTimeMs}ms
  `);
});
```

### Check Database Logs

```typescript
import { databaseService } from '@/services/databaseService';

// Get recent productions
const history = await databaseService.getVideoProductionLogs('shop@example.com', 10);
history.forEach(log => {
  console.log(`${log.contentId}: ${log.status} - ${log.videoUrl}`);
});

// Get pending tasks
const pending = await databaseService.getPendingVideoTasks();
console.log(`${pending.length} videos waiting to be generated`);
```

---

## Troubleshooting 🔧

### ❌ "GOOGLE_SHEETS_API_KEY not set"
```bash
# Solution: Add to .env file
GOOGLE_SHEETS_API_KEY=<your-key>
GOOGLE_SHEETS_ID=<your-sheet-id>
```

### ❌ "No pending content found"
```
Solution:
1. Check Content_Log sheet exists and has rows
2. Verify column H (Platform) = "YouTube"
3. Verify column I (Status) = "pending"
4. Check google sheets service initialized correctly
```

### ❌ "Claude API error"
```bash
# Solution: Verify API key
CLAUDE_API_KEY=sk-ant-<your-actual-key>

# Test connection:
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY"
```

### ❌ "Video URL is mock/fake"
```
Expected during development!

For production:
1. Setup YouTube API credentials
2. Replace mockClaudeApiCall() with real API
3. Replace generateVideoUrl() with YouTube upload
4. Or use Make.com webhook for automation
```

### ❌ "Automation not running"
```typescript
// Check config
const config = automationService.getConfig();
console.log(config.videoGeneratorEnabled); // Should be true

// Restart automation
automationService.stopAll();
await automationService.setupVideoGeneratorAutomation('0 9 * * *', 'YouTube');
```

---

## Sample Data for Testing

### Add to Content_Log:

| Main_Category | User_Email | Category | Item_ID | Raw_Text | Platform | Status |
|---|---|---|---|---|---|---|
| Products | shop@example.com | Short Clip Video | prod_coffee_001 | Premium organic coffee beans. Fair trade. Delicious taste. Fresh roasted daily. | YouTube | pending |
| Products | shop@example.com | Short Clip Video | prod_tea_001 | Organic green tea. Antioxidants. Smooth flavor. Perfect for daily wellness. | YouTube | pending |
| Tips | shop@example.com | Short Clip Video | tip_brewing_001 | How to brew perfect tea: 1) Heat water to 80°C 2) Steep for 3 minutes 3) Enjoy! | YouTube | pending |

Then run generation:

```typescript
const results = await videoGeneratorService.processPendingContent('YouTube');
console.log(`Generated ${results.length} videos!`);
```

---

## Production Checklist

Before going live, complete:

- [ ] ✅ Google Sheets configured with all 3 sheets
- [ ] ✅ API keys set in .env (Claude, YouTube, Google)
- [ ] ✅ Local database configured (or localStorage fallback)
- [ ] ✅ Test generation successful
- [ ] ✅ Automation scheduled and tested
- [ ] ✅ Error handling in place
- [ ] ✅ Logging/monitoring setup
- [ ] ✅ YouTube API upload working (not mocked)
- [ ] ✅ E-commerce integration configured
- [ ] ✅ Database backups configured

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `await videoGeneratorService.initialize()` | Start the service |
| `await videoGeneratorService.generateVideoContent(entry)` | Generate one video |
| `await videoGeneratorService.processPendingContent('YouTube')` | Generate all YouTube videos |
| `await automationService.setupVideoGeneratorAutomation('0 9 * * *')` | Schedule daily at 9 AM |
| `automationService.getExecutionLogs('video-generator-YouTube')` | View automation history |
| `await databaseService.getVideoProductionLogs()` | Get production history |
| `automationService.stopAll()` | Stop all automations |

---

## Next Steps

1. **Day 1**: Setup Google Sheets + Environment
2. **Day 2**: Test manual generation
3. **Day 3**: Setup automation + monitoring
4. **Day 4**: E-commerce integration
5. **Day 5**: Production deployment

**Questions?** Check:
- `VIDEO_GENERATOR_GUIDE.md` - Detailed documentation
- `INTEGRATION_EXAMPLES.md` - Code examples
- This file - Setup steps

---

## Support Matrix

| Issue | Document | Section |
|-------|----------|---------|
| How to setup? | SETUP.md | All |
| How to use? | GUIDE.md | Usage Examples |
| How to integrate? | EXAMPLES.md | All |
| Architecture? | GUIDE.md | System Architecture |
| API endpoints? | EXAMPLES.md | Section 5 |
| Error handling? | EXAMPLES.md | Section 7 |
| Troubleshooting? | SETUP.md | Troubleshooting |

---

**Ready to create viral videos? Let's go! 🚀**
