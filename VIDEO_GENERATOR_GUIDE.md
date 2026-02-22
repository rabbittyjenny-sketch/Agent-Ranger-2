# Video Generator System Guide

**Purpose**: Automate creation of short-form video clips for e-commerce/shop use with YouTube distribution

---

## System Architecture

```
Google Sheets (Data Source)
    ↓
    ├─ Content_Log (Input - raw content, category, platform)
    ├─ Prompt_Library (Templates - instructions, tone, examples)
    └─ Production_Log (Output - final scripts, YouTube URLs)

    ↓

VideoGeneratorService (Orchestration)
    ├─ Read from Content_Log
    ├─ Get Prompt_Library template
    ├─ Claude API (Script Generation)
    ├─ YouTube Upload (Video Generation)
    └─ Write to Production_Log

    ↓

Local Database (Tracking/Logging)
    ├─ VideoProductionLog (Operation tracking)
    └─ Automation Schedule (Cron-based execution)
```

---

## Services Overview

### 1. **googleSheetsService.ts**

Handles all Google Sheets operations.

#### Key Methods:

```typescript
// Get pending content entries
getContentLogEntries(): ContentLogEntry[]

// Get entries by platform (YouTube, TikTok, etc.)
getPendingEntriesByPlatform(platform: string): ContentLogEntry[]

// Get prompt template for category
getPromptTemplate(category: string): PromptTemplate

// Save result to Production_Log
saveProductionLogEntry(entry: ProductionLogEntry): Promise<void>

// Sync with Google Sheets
syncWithSheets(): Promise<{ contentLogged: number; productionLogged: number }>
```

#### Content_Log Schema:

```typescript
interface ContentLogEntry {
  mainCategory: string;           // e.g., "วิทยาศาสตร์", "Hello"
  timestampIn: string;            // When created
  userEmail: string;              // Content creator
  category: string;               // 'Short Clip Video', etc.
  postFormat: string;             // 'The Lovers', 'Strength', etc.
  itemId: string;                 // Unique ID
  rawText: string;                // Content to convert (Thai/English)
  platform: string;               // 'YouTube', 'TikTok', 'Instagram'
  status: string;                 // 'pending', 'completed', 'failed'
}
```

#### Prompt_Library Schema:

```typescript
interface PromptTemplate {
  templateId: string;
  category: string;
  instructionPrompt: string;      // Claude will use this
  toneStyle: string;              // 'Engaging, Educational, Viral-worthy'
  examples?: string[];            // Format examples
}
```

#### Production_Log Schema:

```typescript
interface ProductionLogEntry {
  timestampOut: string;           // When generated
  mainCategory: string;
  userEmail: string;
  category: string;
  finalScript: string;            // Generated script from Claude
  videoResultUrl: string;         // YouTube URL
  status: string;                 // 'completed', 'failed'
}
```

---

### 2. **videoGeneratorService.ts**

Main orchestration service for video generation.

#### Key Methods:

```typescript
// Main entry point - process single content entry
generateVideoContent(contentEntry: ContentLogEntry): Promise<VideoGenerationResult>

// Process all pending content
processPendingContent(platform?: string): Promise<VideoGenerationResult[]>

// Get generation history
getGenerationHistory(userEmail?: string): Promise<VideoGenerationResult[]>

// Initialize service
initialize(): Promise<void>
```

#### Flow for Single Content:

```
1. Read ContentLogEntry from Google Sheets
   ├─ main_category, user_email, raw_text, platform, etc.

2. Get Prompt_Library template
   ├─ Find template matching entry.category
   ├─ Extract: instructionPrompt, toneStyle

3. Call Claude API
   ├─ systemPrompt: Template instruction + tone
   ├─ userPrompt: Raw content + request format
   ├─ Response: { hook, keyPoints, cta, fullScript }

4. Generate/Upload Video
   ├─ Currently returns mock YouTube URL
   ├─ Production: Call YouTube API or Make.com

5. Save to Production_Log
   ├─ timestampOut, finalScript, videoResultUrl

6. Update status in Content_Log
   ├─ Set status to 'completed'

7. Save to local database
   ├─ VideoProductionLog for tracking
```

#### Generated Script Format:

```typescript
interface GeneratedScript {
  finalScript: string;    // Complete, ready-to-use script
  hooks: string[];        // Opening attention-grabbers
  keyPoints: string[];    // 3-5 main messages
  cta: string;           // Call-to-action
  tone: string;          // Tone/style used
}
```

#### Result Format:

```typescript
interface VideoGenerationResult {
  contentId: string;                    // Item ID
  finalScript: GeneratedScript;         // Generated content
  videoUrl: string;                     // YouTube/TikTok link
  platform: string;                     // 'YouTube', 'TikTok'
  status: 'completed' | 'failed';
  timestamp: string;                    // When generated
}
```

---

### 3. **databaseService.ts** (Enhanced)

Added methods to track video production operations.

#### New Interfaces:

```typescript
interface VideoProductionLog {
  contentId: string;      // Item ID from Content_Log
  userEmail: string;
  rawText: string;
  finalScript: string;
  generatedBy: string;    // e.g., 'VideoGeneratorService'
  platform: string;
  videoUrl: string;       // YouTube URL
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  processingTimeMs?: number;
  createdAt?: Date;
  completedAt?: Date;
}
```

#### New Methods:

```typescript
// Save production log
saveVideoProductionLog(log: VideoProductionLog): Promise<VideoProductionLog>

// Get logs by user
getVideoProductionLogs(userEmail?: string, limit?: number): Promise<VideoProductionLog[]>

// Get pending tasks
getPendingVideoTasks(): Promise<VideoProductionLog[]>

// Update task status
updateVideoProductionStatus(
  contentId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  videoUrl?: string,
  errorMessage?: string
): Promise<void>
```

---

### 4. **automationService.ts** (Enhanced)

Added video generator automation scheduling.

#### New Config:

```typescript
interface AutomationConfig {
  videoGeneratorEnabled: boolean;  // Enable/disable video generation
  // ... other configs
}
```

#### New Method:

```typescript
// Setup video generation automation
setupVideoGeneratorAutomation(
  cronExpression: string,  // e.g., "0 9 * * *" (9 AM daily)
  platform?: string        // Optional: filter by platform
): Promise<void>
```

#### Example Usage:

```typescript
// Generate videos every morning at 9 AM for YouTube
await automationService.setupVideoGeneratorAutomation('0 9 * * *', 'YouTube');

// Generate all platforms every 6 hours
await automationService.setupVideoGeneratorAutomation('0 */6 * * *');

// Check execution logs
const executionLogs = automationService.getExecutionLogs('video-generator-YouTube');
```

---

## Usage Examples

### Manual Generation

```typescript
import { videoGeneratorService } from '@/services/videoGeneratorService';

// Initialize
await videoGeneratorService.initialize();

// Generate single video
const result = await videoGeneratorService.generateVideoContent({
  mainCategory: 'วิทยาศาสตร์',
  userEmail: 'user@shop.com',
  category: 'Short Clip Video',
  rawText: 'เนื้อหาวิทยาศาสตร์ที่น่าสนใจ',
  platform: 'YouTube',
  itemId: 'item_001',
  status: 'pending',
  // ...
});

console.log('YouTube URL:', result.videoUrl);
// Output: https://youtu.be/AbCdEfGhIjK
```

### Automated Scheduling

```typescript
import { automationService } from '@/services/automationService';

// Setup automation
await automationService.setupVideoGeneratorAutomation(
  '0 9 * * *',    // 9 AM daily
  'YouTube'       // YouTube platform only
);

// System will automatically:
// 1. Check Content_Log for pending entries
// 2. Generate videos using Claude
// 3. Upload to YouTube
// 4. Update Production_Log with results
// 5. Log execution details
```

### Batch Processing

```typescript
// Process all pending content for a platform
const results = await videoGeneratorService.processPendingContent('YouTube');

// Get user's generation history
const history = await videoGeneratorService.getGenerationHistory('user@shop.com');
```

---

## Google Sheets Setup

### Required Sheets:

1. **Content_Log** (Sheet ID: 71977369)
   - Columns: A-I
   - Rows: Content entries to process

2. **Production_Log** (Sheet ID: TBD)
   - Columns: A-F
   - Rows: Generated videos (populated by system)

3. **Prompt_Library** (Sheet ID: TBD)
   - Columns: A-E
   - Rows: Templates for each category

### Configuration:

```typescript
// In environment variables or config:
GOOGLE_SHEETS_ID=<your-sheet-id>
GOOGLE_SHEETS_API_KEY=<your-api-key>

// Initialize with sheet IDs:
googleSheetsService.initialize(
  71977369,   // Content_Log
  <prod-id>,  // Production_Log
  <template-id>  // Prompt_Library
);
```

---

## Claude API Integration

Currently mocked with simulated responses. For production:

```typescript
// In videoGeneratorService.ts, replace mockClaudeApiCall with:
private async generateScriptWithClaude(
  rawText: string,
  promptTemplate: PromptTemplate
): Promise<GeneratedScript> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: promptTemplate.instructionPrompt,
      messages: [{
        role: 'user',
        content: `Create a video script for:\n${rawText}`
      }]
    })
  });

  const data = await response.json();
  // Parse and return GeneratedScript
}
```

---

## YouTube API Integration

Currently mocked - returns random video IDs. For production:

```typescript
// In videoGeneratorService.ts:
private async generateVideoUrl(
  contentEntry: ContentLogEntry,
  generatedScript: GeneratedScript
): Promise<string> {
  // 1. Generate video file from script
  // 2. Upload to YouTube using Google YouTube API
  // 3. Return video URL: https://youtu.be/<videoId>

  // OR use Make.com webhook for upload automation
  await this.sendToMakecomWebhook({
    script: generatedScript.finalScript,
    title: contentEntry.itemId,
    platform: contentEntry.platform
  });
}
```

---

## Data Flow Diagram

```
Timeline: Content_Log → Processing → Production_Log

[9:00 AM]
Content_Log (pending):
├─ item_001: "เนื้อหาวิทยาศาสตร์..."
├─ item_002: "สรุปสินค้า..."
└─ item_003: "วิธีการใช้..."

         ↓ VideoGeneratorService

[9:05 AM - Processing]
├─ item_001 → Claude API → "ว่าแต่คุณรู้หรือเปล่า..."
├─ item_002 → Claude API → "สินค้านี้ช่วย..."
└─ item_003 → Claude API → "ขั้นตอน 1-2-3..."

         ↓ Upload to YouTube

[9:10 AM]
Production_Log (completed):
├─ item_001: https://youtu.be/AbCdEfGhIjK
├─ item_002: https://youtu.be/LmNoPqRsTuV
└─ item_003: https://youtu.be/WxYzAbCdEfG
```

---

## Troubleshooting

### Issue: "No content entries found"
- **Check**: Content_Log has entries with status='pending'
- **Check**: Google Sheets connection is configured
- **Fix**: Update GOOGLE_SHEETS_ID and API key

### Issue: "Claude API call failed"
- **Check**: CLAUDE_API_KEY is set
- **Check**: API quota not exceeded
- **Fix**: Verify API credentials in .env

### Issue: "YouTube upload failed"
- **Check**: YouTube API credentials
- **Check**: Brand has YouTube channel linked
- **Fix**: Configure YouTube OAuth in Make.com or API

### Issue: "Automation not running"
- **Check**: `videoGeneratorEnabled: true` in config
- **Check**: Cron expression syntax (e.g., "0 9 * * *")
- **Fix**: Restart automation service

---

## Monitoring & Logs

### Check Execution History:

```typescript
const logs = automationService.getExecutionLogs('video-generator-YouTube');
logs.forEach(log => {
  console.log(`
    Time: ${log.timestamp}
    Status: ${log.status}
    Items: ${log.itemsProcessed}
    Time: ${log.executionTimeMs}ms
  `);
});
```

### View Production Logs:

```typescript
const history = await databaseService.getVideoProductionLogs('user@shop.com');
history.forEach(log => {
  console.log(`
    ${log.contentId}: ${log.videoUrl}
    Status: ${log.status}
    Time: ${log.processingTimeMs}ms
  `);
});
```

---

## Next Steps

1. **Configure Google Sheets**
   - Set GOOGLE_SHEETS_ID in environment
   - Create Production_Log and Prompt_Library sheets
   - Add initial templates

2. **Setup Claude API**
   - Get API key from Anthropic
   - Test generateScriptWithClaude() method

3. **Configure YouTube Integration**
   - Setup YouTube API credentials
   - Or configure Make.com webhook

4. **Schedule Automation**
   - Start with: `"0 9 * * *"` (9 AM daily)
   - Monitor execution logs
   - Adjust as needed

5. **E-Commerce Integration**
   - Link shop platform to Content_Log
   - Automatically submit content for generation
   - Display YouTube links on product pages

---

## Summary

**What it does:**
- Reads product/content descriptions from Google Sheets
- Generates engaging video scripts using Claude AI
- Uploads videos to YouTube
- Tracks everything in Production_Log

**For your shop:**
- Turn product descriptions into viral-worthy video scripts
- Get ready-to-share YouTube links
- Automate the entire process with scheduling
- No manual video editing needed (scripts + templates)

**Next**: Connect to your product database and start generating!
