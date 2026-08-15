// server/src/validators/inputValidator.ts
import { z } from 'zod';

export const assessmentRequestSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(100, 'Topic must be less than 100 characters')
    .refine(
      (topic) => !/[<>{}[\]]/.test(topic),
      'Topic contains invalid characters'
    )
    .refine(
      (topic) => {
        // Block obvious prompt injection attempts
        const injectionPatterns = [
          'ignore previous',
          'system prompt',
          'you are now',
          'pretend to be',
          'override',
          'disregard',
          'ignore above',
          'new instructions',
          'your instructions',
        ];
        return !injectionPatterns.some(pattern => 
          topic.toLowerCase().includes(pattern)
        );
      },
      'Please provide a valid topic'
    ),
  questionCount: z.number()
    .int()
    .refine(
      (count) => [10, 20, 30].includes(count),
      'Question count must be 10, 20, or 30'
    ),
});

export function validateAssessmentRequest(data: any) {
  const result = assessmentRequestSchema.safeParse(data);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }
  
  return {
    isValid: true,
    data: result.data,
  };
}