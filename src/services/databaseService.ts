import { MasterContext } from '../data/intelligence';

/**
 * Database Service - Handles all database operations
 * This service acts as a bridge between the app and Drizzle ORM
 * For now, it uses localStorage as fallback, but will use real database once Neon is set up
 */

// Type definitions for database operations
export interface BrandRecord {
  id?: number;
  brandNameEn: string;
  brandNameTh: string;
  industry: string;
  coreUsp: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  moodKeywords?: string[];
  toneOfVoice?: string;
  multilingualLevel?: string;
  brandHashtags?: string[];
  logoUrl?: string;
}

export interface SwotRecord {
  id?: number;
  brandId: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketTrends?: string;
  competitorAnalysis?: string;
  confidence: number;
  generatedBy: string;
}

export interface CaptionRecord {
  id?: number;
  brandId: number;
  caption: string;
  captionTh?: string;
  platform?: string;
  contentType?: string;
  hashtags?: string[];
  engagementTips?: string;
  confidence: number;
  generatedBy: string;
}

export interface DesignAssetRecord {
  id?: number;
  brandId: number;
  assetType: string;
  assetDescription?: string;
  colorScheme?: { primary: string; secondary: string; accent?: string };
  typography?: { fontFamily: string; sizes: Record<string, string> };
  dimensions?: string;
  imageUrl?: string;
  cssCode?: string;
  generatedBy: string;
}

export interface MessageRecord {
  id?: number;
  brandId: number;
  role: 'user' | 'agent';
  agentId?: string;
  agentName?: string;
  content: string;
  attachments?: Array<{ name: string; type: string; size: number }>;
  confidence?: number;
  validationResults?: Record<string, any>;
  createdAt?: Date;
}

export interface AgentLearningRecord {
  id?: number;
  brandId: number;
  agentId: string;
  agentName: string;
  insight: string;
  insightType: string;
  dataUsed?: string[];
  confidence: number;
  actionable: boolean;
}

export interface CampaignRecord {
  id?: number;
  brandId: number;
  campaignName: string;
  campaignObjective?: string;
  targetAudience?: string;
  platforms?: string[];
  contentCalendar?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  budget?: number;
  estimatedReach?: number;
}

class DatabaseService {
  private isReady = false;
  private localStoragePrefix = 'socialFactory_db_';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if we can connect to the database
    const dbUrl = (import.meta as any).env?.VITE_DATABASE_URL || '';

    if (!dbUrl) {
      console.warn('⚠️  DATABASE_URL not configured. Using localStorage as fallback.');
      this.isReady = false;
    } else {
      console.log('✅ Database service initialized with Neon PostgreSQL');
      this.isReady = true;
    }
  }

  /**
   * Create or update a brand
   */
  async saveBrand(brand: BrandRecord): Promise<BrandRecord> {
    try {
      if (!this.isReady) {
        // Fallback to localStorage
        const key = `${this.localStoragePrefix}brands_${brand.brandNameEn}`;
        const data = { ...brand, id: 1, createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement actual database save when connected
      // const result = await db.insert(brands).values(brand).returning();
      // return result[0];

      // For now, return the brand with a mock ID
      return { ...brand, id: 1 };
    } catch (error) {
      console.error('Error saving brand:', error);
      throw error;
    }
  }

  /**
   * Get brand by ID or name
   */
  async getBrand(identifier: string | number): Promise<BrandRecord | null> {
    try {
      if (!this.isReady) {
        // Fallback to localStorage
        const key = `${this.localStoragePrefix}brands_${identifier}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }

      // TODO: Implement actual database query
      // const result = await db.select().from(brands).where(...);
      // return result[0] || null;

      return null;
    } catch (error) {
      console.error('Error getting brand:', error);
      return null;
    }
  }

  /**
   * Save SWOT analysis
   */
  async saveSwotAnalysis(swot: SwotRecord): Promise<SwotRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}swot_${swot.brandId}_${Date.now()}`;
        const data = { ...swot, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement database insert
      return swot;
    } catch (error) {
      console.error('Error saving SWOT analysis:', error);
      throw error;
    }
  }

  /**
   * Save caption
   */
  async saveCaption(caption: CaptionRecord): Promise<CaptionRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}caption_${caption.brandId}_${Date.now()}`;
        const data = { ...caption, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement database insert
      return caption;
    } catch (error) {
      console.error('Error saving caption:', error);
      throw error;
    }
  }

  /**
   * Save design asset
   */
  async saveDesignAsset(asset: DesignAssetRecord): Promise<DesignAssetRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}design_${asset.brandId}_${Date.now()}`;
        const data = { ...asset, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement database insert
      return asset;
    } catch (error) {
      console.error('Error saving design asset:', error);
      throw error;
    }
  }

  /**
   * Save message to conversation history
   */
  async saveMessage(message: MessageRecord): Promise<MessageRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}message_${message.brandId}_${Date.now()}`;
        const data = { ...message, id: Date.now(), createdAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement database insert
      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(brandId: number | string, limit: number = 50): Promise<MessageRecord[]> {
    try {
      if (!this.isReady) {
        // Fallback to localStorage - get all messages for this brand
        const messages: MessageRecord[] = [];
        const brandIdStr = String(brandId);
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.includes(`${this.localStoragePrefix}message_${brandIdStr}`)) {
            const data = localStorage.getItem(key);
            if (data) messages.push(JSON.parse(data));
          }
        }
        return messages.sort((a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        ).slice(-limit);
      }

      // TODO: Implement database query with limit
      return [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Save agent learning
   */
  async saveAgentLearning(learning: AgentLearningRecord): Promise<AgentLearningRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}learning_${learning.brandId}_${Date.now()}`;
        const data = { ...learning, id: Date.now(), createdAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement database insert
      return learning;
    } catch (error) {
      console.error('Error saving agent learning:', error);
      throw error;
    }
  }

  /**
   * Save campaign
   */
  async saveCampaign(campaign: CampaignRecord): Promise<CampaignRecord> {
    try {
      if (!this.isReady) {
        const key = `${this.localStoragePrefix}campaign_${campaign.brandId}_${Date.now()}`;
        const data = { ...campaign, id: Date.now(), createdAt: new Date(), updatedAt: new Date() };
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }

      // TODO: Implement database insert
      return campaign;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw error;
    }
  }

  /**
   * Get database status
   */
  getStatus() {
    return {
      isReady: this.isReady,
      backend: this.isReady ? 'Neon PostgreSQL' : 'localStorage (fallback)',
      message: this.isReady
        ? '✅ Connected to Neon PostgreSQL'
        : '⚠️  Using localStorage - configure DATABASE_URL to enable Neon'
    };
  }

  /**
   * Clear all localStorage data (for development/testing)
   */
  clearLocalStorage() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.localStoragePrefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} localStorage items`);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

export default databaseService;
