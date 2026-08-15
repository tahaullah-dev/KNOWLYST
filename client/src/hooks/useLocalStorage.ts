// client/src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';
import { AssessmentHistoryItem } from '../types';
import { historyStorage, storageAdapter } from '../utils/storage';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = await storageAdapter.load(key);
        if (storedValue !== null) {
          setValue(storedValue);
        }
      } catch (err) {
        console.error(`Failed to load ${key}:`, err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage whenever it changes
  const updateValue = useCallback(async (newValue: T) => {
    setValue(newValue);
    try {
      await storageAdapter.save(key, newValue);
      setError(null);
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
      setError(err as Error);
    }
  }, [key]);

  const removeValue = useCallback(async () => {
    try {
      await storageAdapter.delete(key);
      setValue(initialValue);
      setError(null);
    } catch (err) {
      console.error(`Failed to delete ${key}:`, err);
      setError(err as Error);
    }
  }, [key, initialValue]);

  return { value, setValue: updateValue, removeValue, isLoading, error };
}

// Specialized hook for assessment history
export function useAssessmentHistory() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await historyStorage.getHistory();
      setHistory(items);
      setError(null);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addHistoryItem = useCallback(async (item: AssessmentHistoryItem) => {
    try {
      await historyStorage.saveResult(item.result);
      await loadHistory();
    } catch (err) {
      console.error('Failed to add history item:', err);
      setError(err as Error);
    }
  }, [loadHistory]);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      await historyStorage.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      setError(err as Error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await historyStorage.clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError(err as Error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    isLoading,
    error,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    reloadHistory: loadHistory,
  };
}