// client/src/utils/validation.ts
import { AssessmentQuestion, UserAnswer } from '../types';

export function validateAssessmentData(
  questions: AssessmentQuestion[],
  answers: UserAnswer[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!questions || questions.length === 0) {
    errors.push('No questions provided');
    return { isValid: false, errors };
  }
  
  if (!answers || answers.length === 0) {
    errors.push('No answers provided');
    return { isValid: false, errors };
  }
  
  // Check that all answers correspond to questions
  const questionIds = new Set(questions.map(q => q.id));
  const answerQuestionIds = new Set(answers.map(a => a.questionId));
  
  const missingAnswers = questions.filter(q => !answerQuestionIds.has(q.id));
  if (missingAnswers.length > 0) {
    errors.push(`${missingAnswers.length} questions have no corresponding answer`);
  }
  
  const invalidAnswers = answers.filter(a => !questionIds.has(a.questionId));
  if (invalidAnswers.length > 0) {
    errors.push(`${invalidAnswers.length} answers reference non-existent questions`);
  }
  
  // Check for duplicate answers
  const answerIds = answers.map(a => a.questionId);
  const uniqueAnswerIds = new Set(answerIds);
  if (answerIds.length !== uniqueAnswerIds.size) {
    errors.push('Duplicate answers found');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeTopicInput(topic: string): string {
  // Remove any HTML tags
  const noHtml = topic.replace(/<[^>]*>/g, '');
  
  // Remove any markdown formatting
  const noMarkdown = noHtml.replace(/[*_`#\[\]()]/g, '');
  
  // Remove excessive whitespace
  const trimmed = noMarkdown.trim().replace(/\s+/g, ' ');
  
  // Remove any prompt injection attempts
  const injectionPatterns = [
    'ignore previous instructions',
    'system prompt',
    'you are now',
    'pretend to be',
    'override',
    'disregard',
    'new instructions',
  ];
  
  let sanitized = trimmed;
  injectionPatterns.forEach(pattern => {
    const regex = new RegExp(pattern, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized.trim();
}

export function validateUserAnswer(
  answer: UserAnswer,
  question: AssessmentQuestion
): boolean {
  if (!answer || !question) return false;
  
  if (answer.questionId !== question.id) return false;
  
  if (answer.skipped) return true;
  
  if (answer.selectedAnswer === null || answer.selectedAnswer === undefined) {
    return false;
  }
  
  if (answer.selectedAnswer < 0 || answer.selectedAnswer >= question.options.length) {
    return false;
  }
  
  return true;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatScore(score: number, total: number): string {
  return `${score} / ${total}`;
}