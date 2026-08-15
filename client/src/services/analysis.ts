// client/src/services/analysis.ts
import { 
  Assessment, 
  UserAnswer, 
  KnowledgeAnalysis,
  KnowledgeLevel,
  DifficultyPerformance,
  AssessmentQuestion
} from '../types';

interface PerformanceSignals {
  overallAccuracy: number;
  difficultyPerformance: DifficultyPerformance;
  topicPerformance: Record<string, number>;
  questionTypePerformance: Record<string, number>;
  consistencyScore: number;
  deepPerformance: number;
  topicCoverage: number;
  difficultyBalance: number;
  verificationMatch: number;
}

export function calculateKnowledgeAnalysis(
  assessment: Assessment,
  answers: UserAnswer[]
): KnowledgeAnalysis {
  const signals = calculatePerformanceSignals(assessment, answers);
  
  // Calculate knowledge score (0-100)
  const knowledgeScore = calculateKnowledgeScore(signals);
  
  // Determine knowledge level
  const knowledgeLevel = determineKnowledgeLevel(knowledgeScore, signals);
  
  // Calculate confidence
  const confidence = calculateConfidence(signals, assessment.questionCount);
  
  // Identify strengths and weaknesses
  const { strengths, weaknesses } = identifyStrengthsAndWeaknesses(signals);
  
  // Generate recommendations
  const recommendations = generateRecommendations(weaknesses, signals);
  
  // Generate summary
  const summary = generateSummary(knowledgeLevel, knowledgeScore, signals);
  
  return {
    overallAccuracy: signals.overallAccuracy,
    difficultyPerformance: signals.difficultyPerformance,
    topicPerformance: signals.topicPerformance,
    questionTypePerformance: signals.questionTypePerformance,
    knowledgeLevel,
    knowledgeScore,
    confidence,
    strengths,
    weaknesses,
    recommendations,
    summary,
  };
}

function calculatePerformanceSignals(
  assessment: Assessment,
  answers: UserAnswer[]
): PerformanceSignals {
  const questions = assessment.questions;
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  
  // Calculate overall accuracy
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const overallAccuracy = correctAnswers / questions.length;
  
  // Calculate difficulty performance
  const difficultyPerformance = calculateDifficultyPerformance(questions, answerMap);
  
  // Calculate topic performance
  const topicPerformance = calculateTopicPerformance(questions, answerMap);
  
  // Calculate question type performance
  const questionTypePerformance = calculateQuestionTypePerformance(questions, answerMap);
  
  // Calculate consistency score (how consistent performance is across difficulties)
  const consistencyScore = calculateConsistencyScore(difficultyPerformance);
  
  // Calculate deep performance (performance on advanced + deep questions)
  const deepPerformance = (difficultyPerformance.advanced + difficultyPerformance.deep) / 2;
  
  // Calculate topic coverage (percentage of concepts adequately tested)
  const topicCoverage = calculateTopicCoverage(topicPerformance);
  
  // Calculate difficulty balance (how well distributed the assessment is)
  const difficultyBalance = calculateDifficultyBalance(difficultyPerformance);
  
  // Calculate verification match (how well verification questions match overall pattern)
  const verificationMatch = calculateVerificationMatch(questions, answerMap, overallAccuracy);
  
  return {
    overallAccuracy,
    difficultyPerformance,
    topicPerformance,
    questionTypePerformance,
    consistencyScore,
    deepPerformance,
    topicCoverage,
    difficultyBalance,
    verificationMatch,
  };
}

function calculateDifficultyPerformance(
  questions: AssessmentQuestion[],
  answerMap: Map<string, UserAnswer>
): DifficultyPerformance {
  const performance: Record<string, { correct: number; total: number }> = {
    foundation: { correct: 0, total: 0 },
    intermediate: { correct: 0, total: 0 },
    advanced: { correct: 0, total: 0 },
    deep: { correct: 0, total: 0 },
  };
  
  questions.forEach(question => {
    if (question.difficulty === 'verification') return; // Handle separately
    
    const answer = answerMap.get(question.id);
    if (answer && !answer.skipped) {
      performance[question.difficulty].total++;
      if (answer.isCorrect) {
        performance[question.difficulty].correct++;
      }
    }
  });
  
  return {
    foundation: performance.foundation.total > 0 
      ? performance.foundation.correct / performance.foundation.total 
      : 0,
    intermediate: performance.intermediate.total > 0 
      ? performance.intermediate.correct / performance.intermediate.total 
      : 0,
    advanced: performance.advanced.total > 0 
      ? performance.advanced.correct / performance.advanced.total 
      : 0,
    deep: performance.deep.total > 0 
      ? performance.deep.correct / performance.deep.total 
      : 0,
  };
}

function calculateTopicPerformance(
  questions: AssessmentQuestion[],
  answerMap: Map<string, UserAnswer>
): Record<string, number> {
  const topicStats: Record<string, { correct: number; total: number }> = {};
  
  questions.forEach(question => {
    if (!topicStats[question.concept]) {
      topicStats[question.concept] = { correct: 0, total: 0 };
    }
    
    const answer = answerMap.get(question.id);
    if (answer && !answer.skipped) {
      topicStats[question.concept].total++;
      if (answer.isCorrect) {
        topicStats[question.concept].correct++;
      }
    }
  });
  
  const topicPerformance: Record<string, number> = {};
  Object.entries(topicStats).forEach(([topic, stats]) => {
    topicPerformance[topic] = stats.total > 0 ? stats.correct / stats.total : 0;
  });
  
  return topicPerformance;
}

function calculateQuestionTypePerformance(
  questions: AssessmentQuestion[],
  answerMap: Map<string, UserAnswer>
): Record<string, number> {
  const typeStats: Record<string, { correct: number; total: number }> = {};
  
  questions.forEach(question => {
    if (!typeStats[question.questionType]) {
      typeStats[question.questionType] = { correct: 0, total: 0 };
    }
    
    const answer = answerMap.get(question.id);
    if (answer && !answer.skipped) {
      typeStats[question.questionType].total++;
      if (answer.isCorrect) {
        typeStats[question.questionType].correct++;
      }
    }
  });
  
  const typePerformance: Record<string, number> = {};
  Object.entries(typeStats).forEach(([type, stats]) => {
    typePerformance[type] = stats.total > 0 ? stats.correct / stats.total : 0;
  });
  
  return typePerformance;
}

function calculateConsistencyScore(difficultyPerformance: DifficultyPerformance): number {
  const performances = [
    difficultyPerformance.foundation,
    difficultyPerformance.intermediate,
    difficultyPerformance.advanced,
    difficultyPerformance.deep,
  ].filter(p => p > 0);
  
  if (performances.length < 2) return 1; // Not enough data, assume consistent
  
  const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
  const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert standard deviation to consistency score (0-1)
  // Lower std dev = higher consistency
  return Math.max(0, 1 - stdDev * 2);
}

function calculateTopicCoverage(topicPerformance: Record<string, number>): number {
  const topics = Object.keys(topicPerformance);
  if (topics.length === 0) return 0;
  
  // Topics with adequate performance data (not all zero)
  const topicsWithData = topics.filter(topic => topicPerformance[topic] > 0);
  return topicsWithData.length / topics.length;
}

function calculateDifficultyBalance(difficultyPerformance: DifficultyPerformance): number {
  const difficulties = [
    difficultyPerformance.foundation,
    difficultyPerformance.intermediate,
    difficultyPerformance.advanced,
    difficultyPerformance.deep,
  ];
  
  const difficultiesWithData = difficulties.filter(d => d > 0);
  if (difficultiesWithData.length === 0) return 0;
  
  return difficultiesWithData.length / difficulties.length;
}

function calculateVerificationMatch(
  questions: AssessmentQuestion[],
  answerMap: Map<string, UserAnswer>,
  overallAccuracy: number
): number {
  const verificationQuestions = questions.filter(q => q.difficulty === 'verification');
  
  if (verificationQuestions.length === 0) return 1; // No verification questions, assume match
  
  let correctVerification = 0;
  let totalVerification = 0;
  
  verificationQuestions.forEach(question => {
    const answer = answerMap.get(question.id);
    if (answer && !answer.skipped) {
      totalVerification++;
      if (answer.isCorrect) {
        correctVerification++;
      }
    }
  });
  
  if (totalVerification === 0) return 1;
  
  const verificationAccuracy = correctVerification / totalVerification;
  const matchScore = 1 - Math.abs(verificationAccuracy - overallAccuracy);
  
  return Math.max(0, matchScore);
}

function calculateKnowledgeScore(signals: PerformanceSignals): number {
  // Weighted scoring model
  const weightedScore = 
    signals.overallAccuracy * 0.25 +
    calculateDifficultyDepthScore(signals.difficultyPerformance) * 0.35 +
    signals.topicCoverage * 0.20 +
    signals.consistencyScore * 0.10 +
    signals.deepPerformance * 0.10;
  
  return Math.round(weightedScore * 100);
}

function calculateDifficultyDepthScore(difficultyPerformance: DifficultyPerformance): number {
  // Weight higher difficulties more heavily
  const weights = {
    foundation: 1,
    intermediate: 2,
    advanced: 3,
    deep: 4,
  };
  
  const totalWeight = 
    weights.foundation + weights.intermediate + weights.advanced + weights.deep;
  
  const weightedPerformance = 
    difficultyPerformance.foundation * weights.foundation +
    difficultyPerformance.intermediate * weights.intermediate +
    difficultyPerformance.advanced * weights.advanced +
    difficultyPerformance.deep * weights.deep;
  
  return weightedPerformance / totalWeight;
}

function determineKnowledgeLevel(
  knowledgeScore: number,
  signals: PerformanceSignals
): KnowledgeLevel {
  let level: KnowledgeLevel;
  
  if (knowledgeScore >= 80) {
    level = 'expert';
  } else if (knowledgeScore >= 60) {
    level = 'advanced';
  } else if (knowledgeScore >= 40) {
    level = 'intermediate';
  } else if (knowledgeScore >= 20) {
    level = 'elementary';
  } else {
    level = 'beginner';
  }
  
  // Adjust based on specific patterns
  const { difficultyPerformance, deepPerformance } = signals;
  
  // If deep performance is very poor but overall is high, cap at advanced
  if (level === 'expert' && deepPerformance < 0.3) {
    level = 'advanced';
  }
  
  // If foundation is poor but advanced is good (inconsistent profile)
  if (difficultyPerformance.foundation < 0.5 && 
      difficultyPerformance.advanced > 0.7) {
    // Reduce confidence but keep level
    return level;
  }
  
  // If advanced and deep are excellent but foundation is moderate
  if (difficultyPerformance.advanced > 0.8 && 
      difficultyPerformance.deep > 0.8 && 
      difficultyPerformance.foundation >= 0.6) {
    if (level === 'intermediate') level = 'advanced';
    if (level === 'advanced') level = 'expert';
  }
  
  return level;
}

function calculateConfidence(
  signals: PerformanceSignals,
  questionCount: number
): number {
  const baseFromCount = Math.min(questionCount / 30, 1);
  const coverageScore = (signals.topicCoverage + signals.difficultyBalance) / 2;
  const reliabilityScore = (signals.consistencyScore + signals.verificationMatch) / 2;
  
  const confidence = (
    baseFromCount * 0.35 +
    coverageScore * 0.35 +
    reliabilityScore * 0.30
  ) * 100;
  
  return Math.round(Math.min(100, Math.max(0, confidence)));
}

function identifyStrengthsAndWeaknesses(signals: PerformanceSignals): {
  strengths: string[];
  weaknesses: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Analyze topic performance
  const topics = Object.entries(signals.topicPerformance);
  const topicsWithData = topics.filter(([_, performance]) => performance > 0);
  
  // Sort by performance
  const sortedTopics = topicsWithData.sort((a, b) => b[1] - a[1]);
  
  // Strong topics (top 30% or performance > 80%)
  sortedTopics.forEach(([topic, performance]) => {
    if (performance >= 0.8) {
      strengths.push(topic);
    }
  });
  
  // Weak topics (bottom 30% or performance < 50%)
  sortedTopics.reverse().forEach(([topic, performance]) => {
    if (performance < 0.5) {
      weaknesses.push(topic);
    }
  });
  
  // Limit to top 5 each
  return {
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
  };
}

function generateRecommendations(
  weaknesses: string[],
  signals: PerformanceSignals
): string[] {
  const recommendations: string[] = [];
  
  // Add recommendations based on weak topics
  weaknesses.forEach(topic => {
    recommendations.push(`Review ${topic} fundamentals and practice with real-world examples`);
  });
  
  // Add recommendations based on difficulty gaps
  const { difficultyPerformance } = signals;
  if (difficultyPerformance.deep < 0.5) {
    recommendations.push('Focus on advanced concepts and deep understanding rather than surface-level knowledge');
  }
  if (difficultyPerformance.foundation < 0.6) {
    recommendations.push('Build a stronger foundation by reviewing basic concepts first');
  }
  
  // Add general recommendations if few specific ones
  if (recommendations.length === 0) {
    recommendations.push('Continue practicing with increasingly complex problems');
    recommendations.push('Explore edge cases and advanced scenarios in this topic');
  }
  
  // Limit to top 5
  return recommendations.slice(0, 5);
}

function generateSummary(
  level: KnowledgeLevel,
  score: number,
  signals: PerformanceSignals
): string {
  const { overallAccuracy, difficultyPerformance, topicCoverage } = signals;
  
  let summary = '';
  
  // Level description
  const levelDescriptions: Record<KnowledgeLevel, string> = {
    beginner: 'You are at the beginning of your learning journey',
    elementary: 'You have basic familiarity with some concepts',
    intermediate: 'You demonstrate a moderate understanding of the subject',
    advanced: 'You show strong knowledge with some gaps in advanced areas',
    expert: 'You demonstrate comprehensive and deep understanding',
  };
  
  summary += `${levelDescriptions[level]}. `;
  
  // Performance description
  if (overallAccuracy >= 0.8) {
    summary += 'Your overall performance was excellent, ';
  } else if (overallAccuracy >= 0.6) {
    summary += 'Your overall performance was good, ';
  } else if (overallAccuracy >= 0.4) {
    summary += 'Your overall performance was moderate, ';
  } else {
    summary += 'Your overall performance indicates significant room for growth, ';
  }
  
  // Difficulty pattern description
  if (difficultyPerformance.deep > difficultyPerformance.foundation) {
    summary += 'with particularly strong performance on advanced concepts. ';
  } else if (difficultyPerformance.foundation > difficultyPerformance.deep) {
    summary += 'with better performance on foundational concepts than advanced ones. ';
  } else {
    summary += 'with consistent performance across difficulty levels. ';
  }
  
  // Coverage description
  if (topicCoverage >= 0.7) {
    summary += 'You demonstrated understanding across multiple aspects of the subject.';
  } else {
    summary += 'Your knowledge appears concentrated in specific areas.';
  }
  
  return summary;
}

// Export helper functions for testing
export {
  calculatePerformanceSignals,
  calculateDifficultyPerformance,
  calculateTopicPerformance,
  calculateQuestionTypePerformance,
  calculateConsistencyScore,
  calculateKnowledgeScore,
  determineKnowledgeLevel,
  calculateConfidence,
  identifyStrengthsAndWeaknesses,
  generateRecommendations,
};