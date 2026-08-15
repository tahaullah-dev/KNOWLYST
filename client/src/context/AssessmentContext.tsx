// client/src/context/AssessmentContext.tsx (updated)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Assessment, UserAnswer, AssessmentResult } from '../types';
import { historyStorage } from '../utils/storage';

interface AssessmentContextType {
  assessment: Assessment | null;
  currentResult: AssessmentResult | null;
  currentQuestionIndex: number;
  answers: Record<string, UserAnswer>;
  setAssessment: (assessment: Assessment) => void;
  setCurrentResult: (result: AssessmentResult | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: UserAnswer) => void;
  clearAnswers: () => void;
  getAssessmentProgress: () => { answered: number; total: number; skipped: number };
  saveResult: (result: AssessmentResult) => Promise<void>;
  loadHistory: () => Promise<any[]>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});

  // Reset state when assessment changes
  useEffect(() => {
    if (assessment) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCurrentResult(null);
    }
  }, [assessment]);

  const setAnswer = useCallback((questionId: string, answer: UserAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const clearAnswers = useCallback(() => {
    setAnswers({});
  }, []);

  const getAssessmentProgress = useCallback(() => {
    if (!assessment) return { answered: 0, total: 0, skipped: 0 };
    
    const total = assessment.questions.length;
    const answered = Object.values(answers).filter(a => !a.skipped).length;
    const skipped = Object.values(answers).filter(a => a.skipped).length;
    
    return { answered, total, skipped };
  }, [assessment, answers]);

  const saveResult = useCallback(async (result: AssessmentResult) => {
    try {
      await historyStorage.saveResult(result);
      console.log('Assessment result saved successfully');
    } catch (error) {
      console.error('Failed to save assessment result:', error);
      throw error;
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      return await historyStorage.getHistory();
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }, []);

  return (
    <AssessmentContext.Provider
      value={{
        assessment,
        currentResult,
        currentQuestionIndex,
        answers,
        setAssessment,
        setCurrentResult,
        setCurrentQuestionIndex,
        setAnswer,
        clearAnswers,
        getAssessmentProgress,
        saveResult,
        loadHistory,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessmentContext() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessmentContext must be used within AssessmentProvider');
  }
  return context;
}