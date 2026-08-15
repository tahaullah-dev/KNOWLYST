// server/src/validators/questionValidator.ts
import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(10).max(1000),  // Increased from 500 to 1000
  options: z.array(z.string().min(1).max(500)).length(4),  // Increased option length
  correctAnswer: z.number().int().min(0).max(3).or(
    z.string().regex(/^[0-3]$/).transform(Number)
  ),
  difficulty: z.enum(['foundation', 'intermediate', 'advanced', 'deep', 'verification'])
    .transform(d => d === 'verification' ? 'deep' : d),  // Auto-convert verification to deep
  topic: z.string().min(1).max(100),
  concept: z.string().min(1).max(100),  // Increased from 50 to 100
  questionType: z.enum([
    'conceptual',
    'code_reasoning',
    'scenario',
    'debugging',
    'output_prediction',
    'comparison',
    'application',
  ]),
  explanation: z.string().min(10).max(2000),  // Increased explanation length
  metadata: z.object({
    learningObjectives: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    commonMisconceptions: z.array(z.string()).optional(),
  }).optional(),
});

export const assessmentResponseSchema = z.object({
  questions: z.array(questionSchema),
});

export function validateQuestions(questions: any[], expectedCount: number, topic: string): {
  isValid: boolean;
  errors: string[];
  questions?: any[];
} {
  const errors: string[] = [];
  
  if (!Array.isArray(questions)) {
    return { isValid: false, errors: ['Questions must be an array'] };
  }
  
  if (questions.length !== expectedCount) {
    errors.push(`Expected ${expectedCount} questions, got ${questions.length}`);
  }
  
  const ids = new Set<string>();
  const questionsContent = new Set<string>();
  const fixedQuestions: any[] = [];
  
  questions.forEach((q, index) => {
    const fixed = { ...q };
    
    // Fix correctAnswer type
    if (typeof fixed.correctAnswer === 'string') {
      fixed.correctAnswer = parseInt(fixed.correctAnswer, 10);
    }
    if (fixed.correctAnswer === undefined || fixed.correctAnswer === null || isNaN(fixed.correctAnswer)) {
      fixed.correctAnswer = 0;
    }
    
    // Fix difficulty: convert "verification" to "deep"
    if (fixed.difficulty === 'verification') {
      fixed.difficulty = 'deep';
    }
    
    // Ensure unique ID
    if (!fixed.id || fixed.id === '') {
      fixed.id = `question-${index + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    
    // Truncate question if too long
    if (fixed.question && fixed.question.length > 1000) {
      fixed.question = fixed.question.substring(0, 997) + '...';
    }
    
    // Ensure topic is set
    if (!fixed.topic) {
      fixed.topic = topic;
    }
    
    // Ensure concept is set
    if (!fixed.concept || fixed.concept === '') {
      fixed.concept = 'General Concept';
    }
    
    // Ensure explanation is adequate
    if (!fixed.explanation || fixed.explanation.length < 10) {
      const correctOption = fixed.options?.[fixed.correctAnswer] || 'the correct option';
      fixed.explanation = `The correct answer is option ${String.fromCharCode(65 + fixed.correctAnswer)}: "${correctOption}". This tests understanding of ${fixed.concept}.`;
    }
    
    // Ensure options exist and have 4 items
    if (!Array.isArray(fixed.options) || fixed.options.length !== 4) {
      fixed.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    
    // Ensure questionType is valid
    const validTypes = ['conceptual', 'code_reasoning', 'scenario', 'debugging', 'output_prediction', 'comparison', 'application'];
    if (!validTypes.includes(fixed.questionType)) {
      fixed.questionType = 'conceptual';
    }
    
    // Validate the fixed question
    const result = questionSchema.safeParse(fixed);
    if (!result.success) {
      errors.push(`Question ${index + 1} validation failed: ${result.error.message}`);
      return;
    }
    
    // Check duplicate IDs
    if (ids.has(fixed.id)) {
      errors.push(`Duplicate question ID: ${fixed.id}`);
    }
    ids.add(fixed.id);
    
    // Check duplicate content
    const normalizedQuestion = fixed.question.toLowerCase().trim();
    if (questionsContent.has(normalizedQuestion)) {
      errors.push(`Duplicate question content: "${fixed.question.substring(0, 50)}..."`);
    }
    questionsContent.add(normalizedQuestion);
    
    // Check options uniqueness
    const uniqueOptions = new Set(fixed.options.map((opt: string) => opt.toLowerCase().trim()));
    if (uniqueOptions.size !== fixed.options.length) {
      errors.push(`Question ${index + 1} has duplicate options`);
    }
    
    fixedQuestions.push(fixed);
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    questions: errors.length === 0 ? fixedQuestions : undefined,
  };
}