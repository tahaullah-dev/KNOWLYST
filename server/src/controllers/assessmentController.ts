// server/src/controllers/assessmentController.ts
import { Request, Response, NextFunction } from 'express';
import { validateAssessmentRequest } from '../validators/inputValidator.js';
import { assessmentGenerator } from '../services/assessmentGenerator.js';
import { AppError } from '../middleware/errorHandler.js';

export const assessmentController = {
  async generateAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate input
      const validation = validateAssessmentRequest(req.body);
      
      if (!validation.isValid) {
        throw new AppError(400, 'Invalid assessment request', true);
      }
      
      const { topic, questionCount } = validation.data!;
      
      console.log(`Generating assessment: "${topic}" with ${questionCount} questions`);
      
      // Generate assessment
      const result = await assessmentGenerator.generateAssessment(topic, questionCount);

      const generatedCount = Array.isArray(result)
        ? result.length
        : result.questions.length;

      console.log(`Successfully generated ${generatedCount} questions`);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};