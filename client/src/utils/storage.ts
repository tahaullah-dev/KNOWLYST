// client/src/utils/storage.ts
import { AssessmentResult, AssessmentHistoryItem } from '../types';

// Storage adapter interface
export interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
  clear(): Promise<void>;
}

// LocalStorage implementation
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;
  
  constructor(prefix: string = 'ai-assessment:') {
    this.prefix = prefix;
  }
  
  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  async save(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.getFullKey(key), serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some old assessments.');
      }
      throw new Error('Failed to save data to storage.');
    }
  }
  
  async load(key: string): Promise<any> {
    try {
      const serialized = localStorage.getItem(this.getFullKey(key));
      if (serialized === null) {
        return null;
      }
      return JSON.parse(serialized);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Corrupted data
        console.error('Corrupted data in storage:', error);
        await this.delete(key);
        return null;
      }
      throw new Error('Failed to load data from storage.');
    }
  }
  
  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getFullKey(key));
    } catch (error) {
      throw new Error('Failed to delete data from storage.');
    }
  }
  
  async list(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      throw new Error('Failed to list storage keys.');
    }
  }
  
  async clear(): Promise<void> {
    try {
      const keys = await this.list();
      keys.forEach(key => {
        localStorage.removeItem(this.getFullKey(key));
      });
    } catch (error) {
      throw new Error('Failed to clear storage.');
    }
  }
}

// History specific storage service
export class AssessmentHistoryStorage {
  private adapter: StorageAdapter;
  private historyKey = 'history';
  private maxItems = 50; // Maximum number of history items to keep
  
  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }
  
  async saveResult(result: AssessmentResult): Promise<void> {
    try {
      // Get existing history
      const history = await this.getHistory();
      
      // Create history item
      const historyItem: AssessmentHistoryItem = {
        id: this.generateId(),
        topic: result.topic,
        questionCount: result.questionCount,
        score: result.score,
        percentage: result.percentage,
        knowledgeLevel: result.analysis.knowledgeLevel,
        confidence: result.analysis.confidence,
        difficultyPerformance: result.analysis.difficultyPerformance,
        completedAt: result.completedAt,
        result,
      };
      
      // Add new item to beginning
      history.unshift(historyItem);
      
      // Limit history size
      if (history.length > this.maxItems) {
        history.splice(this.maxItems);
      }
      
      // Save updated history
      await this.adapter.save(this.historyKey, history);
    } catch (error) {
      console.error('Failed to save assessment result:', error);
      throw error;
    }
  }
  
  async getHistory(): Promise<AssessmentHistoryItem[]> {
    try {
      const history = await this.adapter.load(this.historyKey);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }
  
  async getHistoryItem(id: string): Promise<AssessmentHistoryItem | null> {
    try {
      const history = await this.getHistory();
      return history.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Failed to load history item:', error);
      return null;
    }
  }
  
  async deleteHistoryItem(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await this.adapter.save(this.historyKey, updatedHistory);
    } catch (error) {
      console.error('Failed to delete history item:', error);
      throw error;
    }
  }
  
  async clearHistory(): Promise<void> {
    try {
      await this.adapter.delete(this.historyKey);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }
  
  private generateId(): string {
    return `assessment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Singleton instance
export const storageAdapter = new LocalStorageAdapter();
export const historyStorage = new AssessmentHistoryStorage(storageAdapter);