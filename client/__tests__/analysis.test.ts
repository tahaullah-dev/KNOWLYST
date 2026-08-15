// client/src/services/__tests__/analysis.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateKnowledgeAnalysis,
  calculateKnowledgeScore,
  determineKnowledgeLevel,
  calculateConfidence,
} from '../analysis';
import { Assessment, UserAnswer, KnowledgeLevel } from '../../types';

describe('Knowledge Analysis Engine', () => {
  const createMockAssessment = (): Assessment => ({
    topic: 'React.js',
    questionCount: 30,
    questions: [
      // Foundation questions (6)
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `foundation-${i}`,
        question: `Foundation question ${i}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        difficulty: 'foundation' as const,
        topic: 'React.js',
        concept: `Concept ${i}`,
        questionType: 'conceptual' as const,
        explanation: 'This is a foundation question explanation',
      })),
      // Intermediate questions (8)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `intermediate-${i}`,
        question: `Intermediate question ${i}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        difficulty: 'intermediate' as const,
        topic: 'React.js',
        concept: `Concept ${i + 6}`,
        questionType: 'scenario' as const,
        explanation: 'This is an intermediate question explanation',
      })),
      // Advanced questions (8)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `advanced-${i}`,
        question: `Advanced question ${i}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        difficulty: 'advanced' as const,
        topic: 'React.js',
        concept: `Concept ${i + 14}`,
        questionType: 'code_reasoning' as const,
        explanation: 'This is an advanced question explanation',
      })),
      // Deep questions (6)
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `deep-${i}`,
        question: `Deep question ${i}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        difficulty: 'deep' as const,
        topic: 'React.js',
        concept: `Concept ${i + 22}`,
        questionType: 'debugging' as const,
        explanation: 'This is a deep question explanation',
      })),
      // Verification questions (2)
      ...Array.from({ length: 2 }, (_, i) => ({
        id: `verification-${i}`,
        question: `Verification question ${i}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        difficulty: 'verification' as const,
        topic: 'React.js',
        concept: `Concept ${i + 28}`,
        questionType: 'conceptual' as const,
        explanation: 'This is a verification question explanation',
      })),
    ],
  });

  const createAnswers = (assessment: Assessment, pattern: Record<string, boolean>): UserAnswer[] => {
    return assessment.questions.map((question, index) => {
      const isCorrect = pattern[question.difficulty] ?? false;
      return {
        questionId: question.id,
        selectedAnswer: isCorrect ? question.correctAnswer : (question.correctAnswer + 1) % 4,
        isCorrect,
        skipped: false,
      };
    });
  };

  it('should distinguish between different knowledge patterns with same score', () => {
    const assessment = createMockAssessment();

    // User A: Strong foundation, weak deep knowledge
    const userAPattern = {
      foundation: true,
      intermediate: true,
      advanced: true,
      deep: false,
      verification: true,
    };
    const userAAnswers = createAnswers(assessment, userAPattern);
    const userAAnalysis = calculateKnowledgeAnalysis(assessment, userAAnswers);

    // User B: Weaker foundation, strong deep knowledge
    const userBPattern = {
      foundation: true,
      intermediate: false,
      advanced: true,
      deep: true,
      verification: false,
    };
    const userBAnswers = createAnswers(assessment, userBPattern);
    const userBAnalysis = calculateKnowledgeAnalysis(assessment, userBAnswers);

    // Both should have similar scores but different knowledge levels
    expect(userAAnalysis.overallAccuracy).toBeCloseTo(userBAnalysis.overallAccuracy, 1);
    expect(userAAnalysis.knowledgeLevel).not.toBe(userBAnalysis.knowledgeLevel);
  });

  it('should calculate all-correct answers as expert level', () => {
    const assessment = createMockAssessment();
    const answers = assessment.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer,
      isCorrect: true,
      skipped: false,
    }));

    const analysis = calculateKnowledgeAnalysis(assessment, answers);
    expect(analysis.knowledgeLevel).toBe('expert');
    expect(analysis.knowledgeScore).toBeGreaterThanOrEqual(80);
    expect(analysis.confidence).toBeGreaterThanOrEqual(80);
  });

  it('should calculate all-incorrect answers as beginner level', () => {
    const assessment = createMockAssessment();
    const answers = assessment.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: (q.correctAnswer + 1) % 4,
      isCorrect: false,
      skipped: false,
    }));

    const analysis = calculateKnowledgeAnalysis(assessment, answers);
    expect(analysis.knowledgeLevel).toBe('beginner');
    expect(analysis.knowledgeScore).toBeLessThan(20);
  });

  it('should adjust confidence based on question count', () => {
    const assessment30 = createMockAssessment();
    const assessment10 = { ...assessment30, questionCount: 10, questions: assessment30.questions.slice(0, 10) };

    const answers30 = assessment30.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer,
      isCorrect: true,
      skipped: false,
    }));

    const answers10 = assessment10.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: q.correctAnswer,
      isCorrect: true,
      skipped: false,
    }));

    const analysis30 = calculateKnowledgeAnalysis(assessment30, answers30);
    const analysis10 = calculateKnowledgeAnalysis(assessment10, answers10);

    expect(analysis30.confidence).toBeGreaterThan(analysis10.confidence);
  });

  it('should identify strengths and weaknesses correctly', () => {
    const assessment = createMockAssessment();
    const answers = assessment.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: q.difficulty === 'foundation' ? q.correctAnswer : (q.correctAnswer + 1) % 4,
      isCorrect: q.difficulty === 'foundation',
      skipped: false,
    }));

    const analysis = calculateKnowledgeAnalysis(assessment, answers);

    expect(analysis.strengths.length).toBeGreaterThan(0);
    expect(analysis.weaknesses.length).toBeGreaterThan(0);
  });
});