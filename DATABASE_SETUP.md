# 🗄️ Database Setup Guide - Social Factory with Neon PostgreSQL

## Overview

The Social Factory AI system now includes full database integration with **Neon PostgreSQL**, a serverless PostgreSQL solution. This guide helps you set up and configure the database to enable persistent data storage for all agent operations.

## Architecture

### Current Architecture
- **Frontend Storage**: localStorage (in-memory)
- **Database Service**: Drizzle ORM wrapper (databaseService.ts)
- **Fallback**: Automatic localStorage fallback when DATABASE_URL is not configured
- **Tables**: 9 interconnected tables for complete brand management

### When DATABASE_URL is Configured
All data flows through to Neon PostgreSQL:
- User messages → messages table
- Agent responses → messages table
- SWOT analyses → swot_analyses table
- Captions → captions table
- Design assets → design_assets table
- Video tasks → video_tasks table
- Campaign schedules → campaign_schedules table
- Agent learnings → agent_learnings table
- Automation configs → automated_tools table

## Database Schema

### 1. **brands** Table
Stores core brand information from Onboarding

```sql
brands (
  id SERIAL PRIMARY KEY,
  brand_name_en VARCHAR(255) NOT NULL,
  brand_name_th VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  core_usp TEXT NOT NULL,
  target_audience TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  font_family VARCHAR(255),
  mood_keywords JSONB,  -- ["modern", "bold", "minimalist"]
  tone_of_voice VARCHAR(255),
  multilingual_level VARCHAR(50),
  brand_hashtags JSONB,  -- ["#modern", "#minimal", ...]
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 2. **messages** Table
Conversation history - user input & agent responses

```sql
messages (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  role VARCHAR(20) NOT NULL,  -- 'user' or 'agent'
  agent_id VARCHAR(100),  -- e.g., 'market-analyst'
  agent_name VARCHAR(255),
  content TEXT NOT NULL,
  attachments JSONB,  -- File metadata
  confidence INTEGER,  -- 0-100
  validation_results JSONB,  -- Fact-check results
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 3. **swot_analyses** Table
Market analysis output from Market Analyst

```sql
swot_analyses (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  strengths JSONB,  -- ["strength1", "strength2", ...]
  weaknesses JSONB,
  opportunities JSONB,
  threats JSONB,
  market_trends TEXT,
  competitor_analysis TEXT,
  confidence INTEGER,
  generated_by VARCHAR(100),  -- Agent name
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 4. **captions** Table
Generated social media captions from Caption Creator

```sql
captions (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  caption TEXT NOT NULL,
  caption_th TEXT,  -- Thai version
  platform VARCHAR(50),  -- Instagram, TikTok, Facebook
  content_type VARCHAR(100),
  hashtags JSONB,
  engagement_tips TEXT,
  confidence INTEGER,
  generated_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 5. **design_assets** Table
Design outputs from Design Agent

```sql
design_assets (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  asset_type VARCHAR(100),  -- Logo, Banner, Social Card
  asset_description TEXT,
  color_scheme JSONB,  -- {primary, secondary, accent}
  typography JSONB,  -- {fontFamily, sizes}
  dimensions VARCHAR(50),  -- "1200x630"
  image_url TEXT,
  css_code TEXT,
  generated_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 6. **video_tasks** Table
Video generation outputs

```sql
video_tasks (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  task_type VARCHAR(100),  -- 'art' or 'script'
  video_title VARCHAR(255),
  script_content TEXT,
  art_prompt TEXT,
  platform VARCHAR(50),
  duration VARCHAR(20),  -- "15s", "60s"
  status VARCHAR(50),  -- pending, processing, completed, failed
  video_url TEXT,
  generated_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 7. **campaign_schedules** Table
Campaign planning from Campaign Planner

```sql
campaign_schedules (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  campaign_name VARCHAR(255) NOT NULL,
  campaign_objective TEXT,
  target_audience TEXT,
  platforms JSONB,  -- ["Instagram", "TikTok", ...]
  content_calendar JSONB,  -- Scheduled posts
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50),  -- draft, scheduled, active, completed
  budget INTEGER,  -- In cents or base units
  estimated_reach INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 8. **automated_tools** Table
Automation configurations from Automation Specialist

```sql
automated_tools (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  tool_name VARCHAR(255) NOT NULL,
  tool_type VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  configuration JSONB,
  schedule_frequency VARCHAR(50),  -- Daily, Weekly, Monthly
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  automation_script TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 9. **agent_learnings** Table
Agent insights and improvements

```sql
agent_learnings (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  agent_id VARCHAR(100) NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  insight TEXT NOT NULL,
  insight_type VARCHAR(100),  -- Trend, Recommendation, Warning
  data_used JSONB,  -- Field names used for analysis
  confidence INTEGER,
  actionable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Setup Instructions

### Step 1: Get Neon PostgreSQL Connection String

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the Connection String (looks like):
```
postgresql://neondb_owner:npg_xxxxx@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy .env.example
cp .env.example .env.local

# Edit .env.local and add your Neon connection string
DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# For frontend (Vite)
VITE_DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Step 3: Generate Database Migrations

```bash
npm run db:generate
```

This creates migration files in `src/db/migrations/`

### Step 4: Push Schema to Neon

```bash
npm run db:push
```

This creates all tables in your Neon database automatically.

### Step 5: Verify Database Connection

Open browser console and run:

```javascript
// Check database status
import { databaseService } from './services/databaseService.js'
console.log(databaseService.getStatus())

// Should output:
// {
//   isReady: true,
//   backend: "Neon PostgreSQL",
//   message: "✅ Connected to Neon PostgreSQL"
// }
```

## Database Service API

### Available Methods

#### Save Brand
```typescript
await databaseService.saveBrand({
  brandNameEn: "Coffee Studio",
  brandNameTh: "ร้านกาแฟศิลป์",
  industry: "F&B",
  coreUsp: "Artisan coffee with art"
})
```

#### Save SWOT Analysis
```typescript
await databaseService.saveSwotAnalysis({
  brandId: 1,
  strengths: ["Unique blend", "Local sourcing"],
  weaknesses: ["Small budget", "Limited staff"],
  opportunities: ["Online delivery", "Catering"],
  threats: ["Big chains", "Economic downturn"],
  confidence: 85,
  generatedBy: "market-analyst"
})
```

#### Save Caption
```typescript
await databaseService.saveCaption({
  brandId: 1,
  caption: "Experience the art of coffee...",
  captionTh: "สัมผัสศิลป์กาแฟ...",
  platform: "Instagram",
  confidence: 90,
  generatedBy: "caption-creator"
})
```

#### Save Message
```typescript
await databaseService.saveMessage({
  brandId: 1,
  role: "user",
  content: "Tell me about my market"
})
```

#### Get Conversation History
```typescript
const messages = await databaseService.getConversationHistory(
  brandId: 1,
  limit: 50
)
```

#### Save Agent Learning
```typescript
await databaseService.saveAgentLearning({
  brandId: 1,
  agentId: "market-analyst",
  agentName: "Market Analyst",
  insight: "Market shows growth potential",
  insightType: "Recommendation",
  dataUsed: ["industry", "targetAudience"],
  confidence: 85,
  actionable: true
})
```

## Fallback Mechanism

If `DATABASE_URL` is not configured:

1. **Status**: `databaseService.getStatus()` returns:
   ```json
   {
     "isReady": false,
     "backend": "localStorage (fallback)",
     "message": "⚠️  Using localStorage - configure DATABASE_URL to enable Neon"
   }
   ```

2. **Data Storage**: All data is stored in `localStorage` with prefix `socialFactory_db_`
3. **No Data Loss**: When you configure DATABASE_URL later, you can migrate localStorage data to Neon

### For Development

Use localStorage fallback by not setting DATABASE_URL. The system will work fine for testing.

When ready for production:
1. Set DATABASE_URL environment variable
2. Run migrations with `npm run db:push`
3. System automatically switches to Neon

## Data Flow Diagram

```
User Input
    ↓
AgentsGrid (Chat Interface)
    ↓
aiService.processMessage()
    ↓
┌─────────────────────────────┐
│  databaseService            │
└─────────────────────────────┘
    ↓
┌──────────────┬──────────────┐
│              │              │
v              v              v
localStorage   OR    Neon PostgreSQL
(Fallback)         (Production)
```

## Monitoring Database

### Using Drizzle Studio (Web UI)

```bash
npm run db:studio
```

Opens web interface at `http://localhost:3000` where you can:
- View all tables and data
- Execute SQL queries
- Monitor database size
- Test database connections

### SQL Queries

Check database status:

```sql
-- All brands
SELECT * FROM brands;

-- Conversation history for specific brand
SELECT * FROM messages WHERE brand_id = 1 ORDER BY created_at DESC;

-- Recent SWOT analyses
SELECT * FROM swot_analyses ORDER BY created_at DESC LIMIT 10;

-- All captions generated
SELECT * FROM captions ORDER BY created_at DESC;

-- Agent performance
SELECT agent_id, agent_name, COUNT(*) as message_count, AVG(confidence) as avg_confidence
FROM messages
WHERE role = 'agent'
GROUP BY agent_id, agent_name;
```

## Troubleshooting

### "DATABASE_URL is not set"
- Solution: Create `.env.local` with your Neon connection string

### "Connection timeout"
- Check if Neon IP whitelist includes your machine
- Verify connection string is correct
- Test in Neon console first

### "SSL certificate error"
- Ensure `?sslmode=require` is in connection string
- Update PostgreSQL client if needed

### Data not saving
- Check browser console for errors
- Verify databaseService.getStatus() shows `isReady: true`
- Check localStorage fallback is working (use browser DevTools)

## Next Steps

1. ✅ Database schema created
2. ✅ Database service integrated
3. ✅ Fallback mechanism in place
4. 📋 TODO: Configure Neon PostgreSQL connection
5. 📋 TODO: Push schema to production database
6. 📋 TODO: Monitor database usage and optimize

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [SQL Cheat Sheet](https://www.postgresql.org/docs/current/sql.html)

---

**Status**: ✅ Database architecture complete - Ready for Neon configuration
**Build Size**: 282.04 KB (85.40 KB gzipped)
**Last Updated**: 2025-02-20
