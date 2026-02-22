# Video Generator Integration Examples

Quick-start examples for integrating the Video Generator into your workflows.

---

## 1. Basic Usage

### Initialize and Generate Single Video

```typescript
import { videoGeneratorService } from '@/services/videoGeneratorService';

async function createVideoScript() {
  // Step 1: Initialize
  await videoGeneratorService.initialize();

  // Step 2: Create content entry (normally from Google Sheets)
  const contentEntry = {
    mainCategory: 'Product Marketing',
    userEmail: 'shop@example.com',
    category: 'Short Clip Video',
    postFormat: 'Product Highlight',
    itemId: 'prod_12345',
    rawText: 'This is our new organic coffee beans. Premium quality, fair trade, delicious taste.',
    platform: 'YouTube',
    status: 'pending'
  };

  // Step 3: Generate video
  const result = await videoGeneratorService.generateVideoContent(contentEntry);

  // Step 4: Use the result
  console.log('Generated Script:', result.finalScript.finalScript);
  console.log('YouTube URL:', result.videoUrl);
  console.log('Platform:', result.platform);
}

// Run
createVideoScript().catch(console.error);
```

---

## 2. Batch Processing

### Process Multiple Content Entries

```typescript
import { videoGeneratorService } from '@/services/videoGeneratorService';

async function generateAllPendingVideos() {
  // Initialize
  await videoGeneratorService.initialize();

  // Process YouTube platform only
  const results = await videoGeneratorService.processPendingContent('YouTube');

  // Handle results
  const successful = results.filter(r => r.status === 'completed');
  const failed = results.filter(r => r.status === 'failed');

  console.log(`✅ Generated ${successful.length} videos`);
  console.log(`❌ Failed ${failed.length} videos`);

  // Print URLs
  successful.forEach(result => {
    console.log(`${result.contentId}: ${result.videoUrl}`);
  });
}

generateAllPendingVideos().catch(console.error);
```

---

## 3. Automated Scheduling

### Setup Daily Automation

```typescript
import { automationService } from '@/services/automationService';
import { videoGeneratorService } from '@/services/videoGeneratorService';

async function setupDailyVideoGeneration() {
  // Initialize video generator
  await videoGeneratorService.initialize();

  // Setup automation: Run at 9 AM daily for YouTube
  await automationService.setupVideoGeneratorAutomation(
    '0 9 * * *',  // 9:00 AM every day
    'YouTube'     // YouTube platform
  );

  console.log('✅ Video generation scheduled daily at 9 AM');

  // Optional: Setup for other platforms
  await automationService.setupVideoGeneratorAutomation(
    '0 14 * * *', // 2:00 PM
    'TikTok'
  );
}

setupDailyVideoGeneration().catch(console.error);
```

---

## 4. API Integration with E-Commerce

### Connect to Shop Database

```typescript
// This would be in your e-commerce backend/API

import { videoGeneratorService } from '@/services/videoGeneratorService';
import { googleSheetsService } from '@/services/googleSheetsService';

// When a new product is added to shop
async function onNewProductAdded(product: Product) {
  // Step 1: Write to Google Sheets Content_Log
  const contentEntry = {
    mainCategory: product.category,
    userEmail: 'shop@example.com',
    category: 'Short Clip Video',
    postFormat: 'Product Launch',
    itemId: product.id,
    rawText: product.description, // Product description
    platform: 'YouTube', // Default platform
    status: 'pending'
  };

  // Step 2: Save to Content_Log
  await googleSheetsService.saveProductionLogEntry({
    timestampOut: new Date().toISOString(),
    mainCategory: product.category,
    userEmail: 'shop@example.com',
    category: 'Short Clip Video',
    finalScript: '', // Will be filled by generator
    videoResultUrl: '', // Will be filled after upload
    status: 'pending'
  });

  // Step 3: Trigger generation (could be manual or auto)
  const result = await videoGeneratorService.generateVideoContent(contentEntry);

  // Step 4: Update product with video URL
  await updateProduct(product.id, {
    videoUrl: result.videoUrl,
    videoScript: result.finalScript.finalScript
  });

  console.log(`Created video for ${product.name}: ${result.videoUrl}`);
}
```

---

## 5. Manual Trigger via API Endpoint

### Express.js Example

```typescript
import express from 'express';
import { videoGeneratorService } from '@/services/videoGeneratorService';

const app = express();

// POST /api/videos/generate
app.post('/api/videos/generate', async (req, res) => {
  try {
    const { contentId, rawText, platform } = req.body;

    // Validate
    if (!contentId || !rawText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate
    const result = await videoGeneratorService.generateVideoContent({
      mainCategory: 'API Request',
      userEmail: req.user?.email || 'api@system.com',
      category: 'Short Clip Video',
      postFormat: 'Manual',
      itemId: contentId,
      rawText,
      platform: platform || 'YouTube',
      status: 'pending'
    });

    // Return result
    res.json({
      success: true,
      contentId: result.contentId,
      videoUrl: result.videoUrl,
      finalScript: result.finalScript.finalScript
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Generation failed'
    });
  }
});

// GET /api/videos/history/:email
app.get('/api/videos/history/:email', async (req, res) => {
  try {
    const history = await videoGeneratorService.getGenerationHistory(
      req.params.email
    );

    res.json({
      success: true,
      count: history.length,
      videos: history
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});
```

---

## 6. Database Tracking

### Monitor Generation Progress

```typescript
import { databaseService } from '@/services/databaseService';

async function checkGenerationStatus(contentId: string) {
  // Get all production logs
  const logs = await databaseService.getVideoProductionLogs();

  // Find this content
  const log = logs.find(l => l.contentId === contentId);

  if (!log) {
    console.log('Not found');
    return;
  }

  console.log(`
    Content: ${log.contentId}
    Status: ${log.status}
    URL: ${log.videoUrl}
    Created: ${log.createdAt}
    Completed: ${log.completedAt}
    Duration: ${log.processingTimeMs}ms
  `);
}

// Get all pending tasks
async function getPendingTasks() {
  const tasks = await databaseService.getPendingVideoTasks();
  console.log(`${tasks.length} videos waiting to be generated`);
  tasks.forEach(task => {
    console.log(`- ${task.contentId}: ${task.rawText.substring(0, 50)}...`);
  });
}

// Check execution logs
async function checkAutomationLogs() {
  const logs = automationService.getExecutionLogs('video-generator-YouTube');
  logs.slice(-5).forEach(log => {
    console.log(`
      ${log.timestamp}
      Status: ${log.status}
      Generated: ${log.itemsProcessed}
      Failed: ${log.itemsFailed}
      Time: ${log.executionTimeMs}ms
    `);
  });
}
```

---

## 7. Error Handling

### Graceful Error Handling

```typescript
import { videoGeneratorService } from '@/services/videoGeneratorService';
import { databaseService } from '@/services/databaseService';

async function generateWithErrorHandling(contentEntry) {
  try {
    // Log start
    await databaseService.saveVideoProductionLog({
      contentId: contentEntry.itemId,
      userEmail: contentEntry.userEmail,
      rawText: contentEntry.rawText,
      finalScript: '',
      generatedBy: 'VideoGeneratorService',
      platform: contentEntry.platform,
      videoUrl: '',
      status: 'processing'
    });

    // Generate
    const result = await videoGeneratorService.generateVideoContent(contentEntry);

    // Log success
    if (result.status === 'completed') {
      await databaseService.updateVideoProductionStatus(
        contentEntry.itemId,
        'completed',
        result.videoUrl
      );
    }

    return result;
  } catch (error) {
    // Log error
    await databaseService.updateVideoProductionStatus(
      contentEntry.itemId,
      'failed',
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );

    // Re-throw or handle
    throw error;
  }
}
```

---

## 8. Customizing Prompt Templates

### Create Custom Templates

```typescript
// In your app, you can extend prompt templates

const customTemplate = {
  templateId: 'template_ecommerce_product',
  category: 'E-Commerce Product',
  instructionPrompt: `
You are a social media expert creating short product videos.

Create a 15-30 second video script for this product:

**Product**: {{productName}}
**Description**: {{description}}
**Target Audience**: {{audience}}

Requirements:
1. Hook (first 2 seconds): Grab attention with a question or surprising fact
2. Problem: What pain point does this solve?
3. Solution: How your product solves it
4. Call-to-Action: "Check the link in bio" or "Click for more"

Format as:
- Hook: ...
- Problem: ...
- Solution: ...
- CTA: ...
- Full Script: (complete script combining all)
  `,
  toneStyle: 'Energetic, Authentic, Relatable',
  examples: [
    '🎯 Hook: Do you struggle with...?',
    '💡 Problem: Most people face...',
    '✨ Solution: Our product solves it by...',
    '🔗 CTA: Link in bio!'
  ]
};

// Use custom template
const customPrompt = customTemplate.instructionPrompt
  .replace('{{productName}}', product.name)
  .replace('{{description}}', product.description)
  .replace('{{audience}}', product.targetAudience);
```

---

## 9. Multi-Language Support

### Generate Thai + English

```typescript
async function generateMultiLanguage(product) {
  // Generate Thai version
  const thaiScript = await videoGeneratorService.generateVideoContent({
    ...product,
    rawText: `${product.name_th}. ${product.description_th}`,
    itemId: `${product.id}_th`
  });

  // Generate English version
  const enScript = await videoGeneratorService.generateVideoContent({
    ...product,
    rawText: `${product.name_en}. ${product.description_en}`,
    itemId: `${product.id}_en`
  });

  return {
    thai: {
      script: thaiScript.finalScript.finalScript,
      url: thaiScript.videoUrl
    },
    english: {
      script: enScript.finalScript.finalScript,
      url: enScript.videoUrl
    }
  };
}
```

---

## 10. Webhook Integration

### Receive Updates from Make.com

```typescript
// After video is generated and uploaded to YouTube

app.post('/webhooks/video-generated', async (req, res) => {
  const { contentId, videoUrl, finalScript, platform } = req.body;

  try {
    // Update database
    await databaseService.updateVideoProductionStatus(
      contentId,
      'completed',
      videoUrl
    );

    // Update Google Sheets Production_Log
    await googleSheetsService.saveProductionLogEntry({
      timestampOut: new Date().toISOString(),
      mainCategory: 'Webhook',
      userEmail: 'system@automate.com',
      category: 'Short Clip Video',
      finalScript,
      videoResultUrl: videoUrl,
      status: 'completed'
    });

    // Notify shop system
    await notifyShop({
      productId: contentId,
      videoUrl,
      platform
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function notifyShop(videoData) {
  // Send to your shop's API or webhook
  // Update product page with video
  // Send notification to shop owner
  // etc.
}
```

---

## Summary of Integration Paths

| Method | Use Case | Complexity |
|--------|----------|-----------|
| **Manual API Call** | One-off videos | Low |
| **Scheduled Automation** | Daily generation | Medium |
| **E-Commerce Integration** | Auto-generate on product add | Medium |
| **Webhook Integration** | Real-time updates | High |
| **Batch Processing** | Multiple platform upload | Low |

Choose the path that fits your business model! 🚀
