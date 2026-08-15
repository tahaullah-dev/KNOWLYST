// client/src/hooks/useAssessment.ts (updated)
import { useCallback } from 'react';
import { useAssessmentContext } from '../context/AssessmentContext';
import { UserAnswer, AssessmentQuestion, AssessmentResult } from '../types';

export function useAssessment() {
  const {
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
  } = useAssessmentContext();

  const getCurrentQuestion = useCallback((): AssessmentQuestion | null => {
    if (!assessment || currentQuestionIndex >= assessment.questions.length) {
      return null;
    }
    return assessment.questions[currentQuestionIndex];
  }, [assessment, currentQuestionIndex]);

  const goToNextQuestion = useCallback(() => {
    if (assessment && currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [assessment, currentQuestionIndex, setCurrentQuestionIndex]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (assessment && index >= 0 && index < assessment.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [assessment, setCurrentQuestionIndex]);

  const selectAnswer = useCallback((questionId: string, selectedAnswer: number) => {
    const question = assessment?.questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedAnswer === question.correctAnswer;
    
    setAnswer(questionId, {
      questionId,
      selectedAnswer,
      isCorrect,
      skipped: false,
    });
  }, [assessment, setAnswer]);

  const skipQuestion = useCallback((questionId: string) => {
    setAnswer(questionId, {
      questionId,
      selectedAnswer: null,
      isCorrect: false,
      skipped: true,
    });
  }, [setAnswer]);

  const getAnswerForQuestion = useCallback((questionId: string): UserAnswer | undefined => {
    return answers[questionId];
  }, [answers]);

  const getUnansweredCount = useCallback(() => {
    if (!assessment) return 0;
    return assessment.questions.filter(q => !answers[q.id] || answers[q.id].skipped).length;
  }, [assessment, answers]);

  return {
    assessment,
    currentResult,
    currentQuestionIndex,
    answers,
    getCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    selectAnswer,
    skipQuestion,
    getAnswerForQuestion,
    getUnansweredCount,
    getAssessmentProgress,
    setAssessment,
    setCurrentResult,
    clearAnswers,
    saveResult,
    loadHistory,
  };
}