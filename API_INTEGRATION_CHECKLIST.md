# 🔌 API Integration Checklist - Social Factory

**Status**: ⚠️ PARTIALLY IMPLEMENTED - Mock data used, Real APIs pending

---

## 1️⃣ CRITICAL - Must Implement First

### A. Claude API (Anthropic) - MOCKED
**Priority**: 🔴 **CRITICAL**
**Impact**: Core AI response generation won't work without this

| Item | Detail |
|------|--------|
| **File** | `src/services/videoGeneratorService.ts` (lines 50-54, 141-158) |
| **Current Status** | ❌ Mock function returns hardcoded Thai text |
| **What's Needed** | Real Claude API integration |
| **Environment Variable** | `VITE_CLAUDE_API_KEY` or `ANTHROPIC_API_KEY` |
| **Package** | `@anthropic-sdk/sdk` or `node-fetch` |
| **Cost** | Pay-per-token (Claude API pricing) |

**Code Location to Fix**:
```typescript
// src/services/videoGeneratorService.ts
// Line 100-135: generateScriptWithClaude() - Currently returns mock data
// Line 145-158: videoGeneratorService.generateVideoContent() - Calls mock

// Should call real API like:
import Anthropic from "@anthropic-sdk/sdk";
const client = new Anthropic({
  apiKey: process.env.VITE_CLAUDE_API_KEY
});

const response = await client.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  system: "You are a video script writer...",
  messages: [{ role: "user", content: userPrompt }]
});
```

**Action Items**:
- [ ] Install `@anthropic-sdk/sdk`
- [ ] Add `VITE_CLAUDE_API_KEY` to `.env`
- [ ] Replace mock function in `videoGeneratorService.ts`
- [ ] Test with real brand data

---

### B. Neon PostgreSQL - FALLBACK ONLY
**Priority**: 🔴 **CRITICAL**
**Impact**: Data won't persist; currently using localStorage

| Item | Detail |
|------|--------|
| **File** | `src/services/databaseService.ts` (line 173) |
| **Current Status** | ⚠️ Configured but not connected; fallback to localStorage |
| **What's Needed** | Real PostgreSQL connection via Drizzle ORM |
| **Environment Variable** | `VITE_DATABASE_URL` |
| **Example URL** | `postgresql://user:password@host/dbname?sslmode=require` |
| **Storage Limit** | localStorage = 5-10MB max per browser |

**Code Location to Fix**:
```typescript
// src/services/databaseService.ts
// Line 173-180: Currently checks if DATABASE_URL exists
// If not, falls back to localStorage

// All methods (saveMessage, saveCaption, etc.) have TODO comments
// Lines 196-309: All database save methods need real implementation
```

**Action Items**:
- [ ] Set up Neon PostgreSQL database
- [ ] Add connection string to `.env` as `VITE_DATABASE_URL`
- [ ] Uncomment and implement Drizzle ORM calls in all save methods
- [ ] Remove localStorage fallback once tested
- [ ] Test data persistence

---

## 2️⃣ HIGH PRIORITY - Content Generation

### A. Google Sheets API - MOCKED
**Priority**: 🟠 **HIGH**
**Impact**: Content templates & logs not syncing

| Item | Detail |
|------|--------|
| **File** | `src/services/googleSheetsService.ts` (lines 45-46, 63+) |
| **Current Status** | ❌ Mock data only; console.log instead of real sync |
| **What's Needed** | Real Google Sheets API v3 integration |
| **Environment Variables** | `GOOGLE_SHEETS_ID`, `GOOGLE_SHEETS_API_KEY` |
| **Package** | `googleapis` or `google-auth-library` |
| **Sheet IDs Used** | 71977369 (hardcoded for content log) |

**Functions That Are Mocked**:
- `getContentLogEntries()` (line 63) → Returns hardcoded array
- `getPromptTemplate()` (line 104) → Returns mock template
- `saveProductionLogEntry()` (line 132) → Logs to console only
- `syncWithSheets()` (line 181) → No actual sync

**Code Location to Fix**:
```typescript
// src/services/googleSheetsService.ts
// All methods need real implementation
// Example: Replace getContentLogEntries() mock with:

const { google } = require('googleapis');
const sheets = google.sheets({ version: 'v4', auth: authClient });

async getContentLogEntries() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: this.sheetId,
    range: 'Content_Log!A:Z',
  });
  return response.data.values;
}
```

**Action Items**:
- [ ] Create Google Cloud project
- [ ] Enable Google Sheets API
- [ ] Create service account and get API key
- [ ] Add `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY` to `.env`
- [ ] Install `googleapis` package
- [ ] Implement real API calls in all methods
- [ ] Test read/write operations

---

### B. YouTube API - MOCKED
**Priority**: 🟠 **HIGH**
**Impact**: Can't upload videos; only generates fake URLs

| Item | Detail |
|------|--------|
| **File** | `src/services/videoGeneratorService.ts` (lines 203-204) |
| **Current Status** | ❌ Mock YouTube URL generation `youtu.be/{randomId}` |
| **What's Needed** | Real YouTube Data API v3 integration |
| **Environment Variable** | `VITE_YOUTUBE_API_KEY` |
| **Authentication** | OAuth2 for user's YouTube channel |
| **Package** | `googleapis` |
| **Cost** | Free API quota (100 units/day) |

**Code Location to Fix**:
```typescript
// src/services/videoGeneratorService.ts
// Line 189-212: uploadToYouTube() - Currently returns mock URL
// Needs real implementation with:

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

const response = await youtube.videos.insert({
  part: 'snippet,status',
  requestBody: {
    snippet: { title, description, tags },
    status: { privacyStatus: 'public' }
  },
  media: { body: videoFileStream }
});
```

**Action Items**:
- [ ] Set up YouTube Data API in Google Cloud Console
- [ ] Add `VITE_YOUTUBE_API_KEY` to `.env`
- [ ] Configure OAuth2 for user authentication
- [ ] Implement real upload method
- [ ] Test video upload to YouTube

---

## 3️⃣ MEDIUM PRIORITY - Integrations Ready

### A. Make.com Webhooks - ✅ READY
**Priority**: 🟢 **READY**
**Status**: ✅ Functional webhook implementation

| Item | Detail |
|------|--------|
| **File** | `src/services/automationService.ts` (lines 289-350) |
| **Current Status** | ✅ Webhook caller is implemented with retry logic |
| **What's Needed** | Test with real Make.com workflows |
| **Webhook URLs** | Hardcoded (should move to `.env`) |
| **Retry Logic** | ✅ Exponential backoff (5s, 10s, 20s) |
| **Timeout** | 10 seconds |

**Webhook Endpoints** (Currently Hardcoded):
```
1. Content Factory:
   https://hook.us2.make.com/3kcyu1ygkc8fjv19193apv8oxfhd1c6h

2. Caption Factory:
   https://hook.us2.make.com/e7yel6e6t3ouyf8sv3dbni25nap685tf
```

**Action Items**:
- [ ] Move webhook URLs to `.env` variables:
  ```
  VITE_MAKE_COM_CONTENT_WEBHOOK=https://hook.us2.make.com/...
  VITE_MAKE_COM_CAPTION_WEBHOOK=https://hook.us2.make.com/...
  ```
- [ ] Test webhook calls with actual Make.com workflows
- [ ] Add error monitoring/logging
- [ ] Verify payload format matches Make.com expectations

---

### B. LINE Messaging API - NOT IMPLEMENTED
**Priority**: 🟡 **MEDIUM**
**Status**: ❌ Schema exists, no implementation

| Item | Detail |
|------|--------|
| **File** | `src/db/schema.ts` (lines 200-219), `src/services/lineService.ts` (not created) |
| **Current Status** | ❌ Database table exists but no API integration |
| **What's Needed** | LINE webhook receiver & message sender |
| **Environment Variables** | `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET`, `LINE_ACCESS_TOKEN` |
| **Package** | `@line/bot-sdk` |

**Database Fields Stored**:
- `lineUserId` - User ID from LINE
- `displayName` - User's display name
- `lineProfileImage` - Profile picture URL

**Action Items** (Optional MVP):
- [ ] Skip for MVP - Can implement later
- [ ] Set up LINE Business account
- [ ] Get Channel ID, Secret, Access Token
- [ ] Create webhook receiver endpoint
- [ ] Install `@line/bot-sdk`
- [ ] Implement message handler

---

## 4️⃣ NOT IMPLEMENTED - Nice-to-Have

### ElevenLabs Text-to-Speech
**Priority**: 🟡 **NICE-TO-HAVE**
**Status**: ❌ Not integrated

**Potential Usage**:
- Add voiceover to video content
- Text-to-speech for captions

**Action Items** (Skip for MVP):
- [ ] Not needed for basic functionality
- [ ] Can add later for audio/video features

---

## 5️⃣ IMAGE/ASSET ISSUES TO FIX

### Logo Path Issue
**File**: `src/App.jsx` (line 139)
**Problem**: `/ideas365-logo.png` path may not resolve in Vite

**Current**:
```jsx
<img src="/ideas365-logo.png" alt="iDEAS365" />
```

**Fix**:
```jsx
import logo from '/ideas365-logo.png';
// Then use:
<img src={logo} alt="iDEAS365" />
```

**Action Items**:
- [ ] Check if `/ideas365-logo.png` exists in `/public` folder
- [ ] Fix import if not found
- [ ] Test logo displays correctly

---

## 6️⃣ ENVIRONMENT VARIABLES - Complete List

Create `.env` file with all required variables:

```bash
# ========== CRITICAL ==========

# Claude API (for AI response generation)
VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# PostgreSQL Database (for data persistence)
VITE_DATABASE_URL=postgresql://user:password@db.neon.tech:5432/dbname?sslmode=require

# ========== HIGH PRIORITY ==========

# Google Sheets (for content templates & logs)
GOOGLE_SHEETS_ID=1aBcDeFgHiJkLmNoPqRsTuVwXyZ
GOOGLE_SHEETS_API_KEY=AIzaSyA_xx_xxxxxxxxxxxxxxxxxxxxx

# YouTube (for video publishing)
VITE_YOUTUBE_API_KEY=AIzaSyA_xx_xxxxxxxxxxxxxxxxxxxxx

# ========== MEDIUM PRIORITY ==========

# Make.com Webhooks (for automations)
VITE_MAKE_COM_CONTENT_WEBHOOK=https://hook.us2.make.com/xxxxxx
VITE_MAKE_COM_CAPTION_WEBHOOK=https://hook.us2.make.com/yyyyyy

# ========== OPTIONAL ==========

# LINE Messaging API (not needed for MVP)
# LINE_CHANNEL_ID=xxxxxx
# LINE_CHANNEL_SECRET=xxxxxx
# LINE_ACCESS_TOKEN=xxxxxx
```

---

## 7️⃣ IMPLEMENTATION ORDER

### Phase 1: MUST DO (Days 1-3)
1. **Claude API** ← Start here
   - Install package
   - Get API key
   - Replace mock function
   - Test generation

2. **Neon PostgreSQL**
   - Set up database
   - Get connection string
   - Uncomment Drizzle code
   - Remove localStorage fallback

### Phase 2: IMPORTANT (Days 4-5)
3. **Google Sheets API**
   - Set up Google Cloud project
   - Implement sync functions
   - Test read/write

4. **YouTube API**
   - Get API key
   - Implement upload
   - Test video publishing

### Phase 3: NICE-TO-HAVE (Later)
5. **ElevenLabs** (skip if time limited)
6. **LINE Integration** (skip for MVP)

---

## 8️⃣ TESTING CHECKLIST

After implementing each API:

- [ ] **Claude API**: Can generate video scripts
- [ ] **PostgreSQL**: Messages persist after refresh
- [ ] **Google Sheets**: Content log syncs correctly
- [ ] **YouTube**: Videos publish successfully
- [ ] **Make.com**: Webhooks trigger automation
- [ ] **Logo**: Displays without broken image icon
- [ ] **Browser Console**: No API key errors or undefined variables

---

## 9️⃣ SECURITY NOTES

⚠️ **IMPORTANT**:

1. **Never commit `.env` file** to GitHub
2. **Use `.env.local` for local development**
3. **Store API keys securely** (never in source code)
4. **Rotate YouTube/Google tokens** if leaked
5. **Move Make.com URLs** from code to environment variables

---

## 🔟 QUICK REFERENCE

| Service | What to Do | Time | Difficulty |
|---------|-----------|------|------------|
| Claude API | Integrate real API calls | 2-3 hrs | Medium |
| PostgreSQL | Connect & test database | 2-3 hrs | Medium |
| Google Sheets | Implement sync methods | 2-3 hrs | Medium |
| YouTube | Add upload functionality | 3-4 hrs | Hard |
| Make.com | Move URLs to `.env` | 30 min | Easy |
| LINE | Setup webhook receiver | 2-3 hrs | Hard |
| ElevenLabs | Skip for MVP | - | - |
| Logo Fix | Check path & update import | 15 min | Easy |

---

## Questions?

**คำแนะนำ**:
- เริ่มด้วย Claude API ก่อน (critical)
- จากนั้น PostgreSQL (persistence)
- จากนั้น Google Sheets (templates)
- ทำขึ้นไป... ตามลำดับความสำคัญ

ทำอันไหนก่อน คิดให้ดี แล้วเอากลับมาเรียน ผมช่วยแก้ไฟล์ได้ค่ะ
