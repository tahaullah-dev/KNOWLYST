// client/src/hooks/useKnowledgeAnalysis.ts (updated)
import { useCallback } from 'react';
import { 
  Assessment, 
  UserAnswer, 
  AssessmentResult,
} from '../types';
import { calculateKnowledgeAnalysis } from '../services/analysis';
import { validateAssessmentData } from '../utils/validation';

export function useKnowledgeAnalysis() {
  const analyzeAssessment = useCallback((
    assessment: Assessment,
    answers: UserAnswer[]
  ): AssessmentResult => {
    // Validate input data
    const validation = validateAssessmentData(assessment.questions, answers);
    if (!validation.isValid) {
      console.error('Invalid assessment data:', validation.errors);
      throw new Error('Invalid assessment data');
    }
    
    // Calculate score
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = assessment.questions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    // Perform knowledge analysis
    const analysis = calculateKnowledgeAnalysis(assessment, answers);
    
    return {
      topic: assessment.topic,
      questionCount: totalQuestions,
      score: correctAnswers,
      percentage,
      answers,
      analysis,
      completedAt: new Date().toISOString(),
    };
  }, []);

  return { analyzeAssessment };
}