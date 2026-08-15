// server/src/services/assessmentGenerator.ts
import { geminiClient } from './geminiClient.js';
import {
  buildDynamicConceptBank,
  buildSystemPrompt,
  buildUserPrompt,
  createAssessmentBlueprint,
  type AssessmentBlueprint,
  type BatchBlueprint,
} from './promptBuilder.js';
import { validateQuestions } from '../validators/questionValidator.js';
import { AppError } from '../middleware/errorHandler.js';

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','else','for','with','without','into','over','under','from','to','of','on','in','at','by','is','are','was','were','be','been','being','this','that','these','those','it','its','their','there','which','who','whom','what','when','why','how','should','can','could','would','will','do','does','did','as','use','uses','used','using','about','between','than','more','most','very','each','any','all','not','no','yes','one','two','three','four','five','six','seven','eight','nine','ten'
]);

export function detectAssessmentDuplicates(questions: any[], _topic: string): { rejectedIds: string[]; validQuestions: any[]; rejectedEntries: Array<{ id: string; batchId?: string }> } {
  const validQuestions: any[] = [];
  const rejectedIds = new Set<string>();
  const rejectedEntries: Array<{ id: string; batchId?: string }> = [];

  const normalize = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !STOPWORDS.has(token))
      .join(' ')
      .trim();
  };

  const similarity = (left: string, right: string) => {
    if (!left || !right) return 0;
    const leftTokens = new Set(left.split(' '));
    const rightTokens = new Set(right.split(' '));
    const overlap = [...leftTokens].filter(token => rightTokens.has(token)).length;
    const union = new Set([...leftTokens, ...rightTokens]).size || 1;
    return overlap / union;
  };

  for (let i = 0; i < questions.length; i++) {
    const current = questions[i];
    const currentId = current?.id || `generated-${i}`;
    const currentQuestion = normalize(current?.question || '');
    const currentConcept = normalize(current?.concept || '');

    let isDuplicate = false;

    for (let j = 0; j < i; j++) {
      const previous = questions[j];
      const previousId = previous?.id || `generated-${j}`;
      const previousQuestion = normalize(previous?.question || '');
      const previousConcept = normalize(previous?.concept || '');

      const exactMatch = currentQuestion && currentQuestion === previousQuestion;
      const sameConcept = currentConcept && currentConcept === previousConcept;
      const sharedSimilarity = similarity(currentQuestion, previousQuestion);
      const sameConceptAndHighOverlap = sameConcept && sharedSimilarity >= 0.4;
      const nearDuplicate = sharedSimilarity >= 0.8 && currentQuestion.length > 20 && previousQuestion.length > 20;

      if (exactMatch || sameConceptAndHighOverlap || nearDuplicate) {
        rejectedIds.add(currentId);
        rejectedEntries.push({ id: currentId, batchId: current?.__batchId || 'batch-1' });
        isDuplicate = true;
        console.warn(`Duplicate or near-duplicate question rejected: ${currentId} vs ${previousId}`);
        break;
      }
    }

    if (!isDuplicate) {
      validQuestions.push(current);
    }
  }

  return {
    rejectedIds: [...rejectedIds],
    validQuestions,
    rejectedEntries,
  };
}

export class AssessmentGenerator {
  async generateAssessment(topic: string, questionCount: number) {
    const blueprint = createAssessmentBlueprint(topic, questionCount);

    if (questionCount < 20) {
      return this.generateSingleBatch(topic, questionCount, blueprint);
    }

    return this.generateParallelAssessment(topic, questionCount, blueprint);
  }

  private async generateParallelAssessment(topic: string, questionCount: number, blueprint: AssessmentBlueprint) {
    const concurrency = Math.min(3, Math.max(1, blueprint.batches.length));
    console.log(`Generating ${questionCount} questions in ${blueprint.batches.length} batches with concurrency ${concurrency}`);

    const results = await this.runWithConcurrency(
      blueprint.batches,
      async (batch) => this.generateBatchForBlueprint(topic, blueprint, batch),
      concurrency,
    );

    let allQuestions = results.flat().map((question: any, index: number) => ({
      ...question,
      __batchId: question.__batchId || `batch-${Math.floor(index / 10) + 1}`,
    }));

    allQuestions = this.orderQuestionsByBlueprint(allQuestions, blueprint);
    allQuestions = allQuestions.map((question: any, index: number) => ({
      ...question,
      id: `q${index + 1}`,
    }));

    let finalQuestions = allQuestions;
    const maxRegenerationRounds = 2;

    for (let attempt = 0; attempt < maxRegenerationRounds; attempt++) {
      const duplicateCheck = detectAssessmentDuplicates(finalQuestions, topic);
      const validQuestions = duplicateCheck.validQuestions;

      if (duplicateCheck.rejectedIds.length === 0) {
        const validation = validateQuestions(validQuestions, questionCount, topic);
        if (validation.isValid && validation.questions) {
          return {
            assessment: { topic, questionCount },
            questions: validation.questions,
          };
        }
      }

      const replacementQuestions = await this.regenerateRejectedQuestions(topic, blueprint, validQuestions, duplicateCheck.rejectedEntries, questionCount);
      finalQuestions = [...validQuestions, ...replacementQuestions].slice(0, questionCount);

      if (finalQuestions.length === questionCount) {
        const validation = validateQuestions(finalQuestions, questionCount, topic);
        if (validation.isValid && validation.questions) {
          return {
            assessment: { topic, questionCount },
            questions: validation.questions,
          };
        }
      }
    }

    const finalValidation = validateQuestions(finalQuestions, questionCount, topic);
    if (!finalValidation.isValid || !finalValidation.questions) {
      throw new AppError(502, `Unable to generate a valid final ${questionCount}-question assessment`);
    }

    return {
      assessment: { topic, questionCount },
      questions: finalValidation.questions,
    };
  }

  private async regenerateRejectedQuestions(
    topic: string,
    blueprint: AssessmentBlueprint,
    validQuestions: any[],
    rejectedEntries: Array<{ id: string; batchId?: string }>,
    expectedCount: number,
  ): Promise<any[]> {
    if (!rejectedEntries.length) {
      return [];
    }

    const rejectedByBatch = new Map<string, number>();
    for (const entry of rejectedEntries) {
      const batchId = entry.batchId || 'batch-1';
      rejectedByBatch.set(batchId, (rejectedByBatch.get(batchId) || 0) + 1);
    }

    const replacements: any[] = [];
    for (const batch of blueprint.batches) {
      const missing = rejectedByBatch.get(batch.id) || 0;
      if (missing <= 0) continue;

      const existingForBatch = validQuestions.filter((question) => (question.__batchId || 'batch-1') === batch.id);
      const replacementBatch = await this.generateBatchForBlueprint(topic, blueprint, batch, existingForBatch, missing);
      replacements.push(...replacementBatch);
    }

    return replacements.slice(0, Math.max(0, expectedCount - validQuestions.length));
  }

  private orderQuestionsByBlueprint(questions: any[], blueprint: AssessmentBlueprint): any[] {
    const order = new Map<string, number>();
    blueprint.batches.forEach((batch, index) => {
      order.set(batch.id, index);
    });

    return [...questions].sort((left, right) => {
      const leftBatch = left.__batchId || 'batch-1';
      const rightBatch = right.__batchId || 'batch-1';
      const leftIndex = order.get(leftBatch) ?? 0;
      const rightIndex = order.get(rightBatch) ?? 0;
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
      return (left.id || '').localeCompare(right.id || '');
    });
  }

  private async runWithConcurrency<T>(items: T[], worker: (item: T) => Promise<any>, concurrency: number): Promise<any[]> {
    const results: any[] = [];
    let index = 0;

    const launchNext = async () => {
      while (index < items.length) {
        const currentIndex = index++;
        results[currentIndex] = await worker(items[currentIndex]);
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => launchNext());
    await Promise.all(workers);
    return results;
  }

  private async generateBatchForBlueprint(
    topic: string,
    blueprint: AssessmentBlueprint,
    batch: BatchBlueprint,
    existingQuestions: any[] = [],
    overrideCount?: number,
  ): Promise<any[]> {
    const systemPrompt = buildSystemPrompt();
    const targetCount = overrideCount ?? batch.questionCount;
    const userPrompt = buildUserPrompt(topic, blueprint, batch, existingQuestions);

    let questions: any[] = [];
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\n📦 Batch ${batch.id}: attempt ${attempts}/${maxAttempts} targeting ${targetCount} questions`);

      try {
        const response = await geminiClient.generateWithRetry([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ]);

        const parsedResponse = this.extractAndParseJSON(response);
        if (!parsedResponse) {
          continue;
        }

        const extractedQuestions = parsedResponse.questions || parsedResponse.assessment?.questions;
        if (!Array.isArray(extractedQuestions)) {
          continue;
        }

        const validation = validateQuestions(extractedQuestions, targetCount, topic);
        if (validation.isValid && validation.questions) {
          questions = validation.questions.map((q: any, index: number) => ({
            ...q,
            id: q.id || `q${batch.startIndex + index}`,
            __batchId: batch.id,
          }));
          return questions;
        }

        const fixedQuestions = this.attemptQuestionFix(extractedQuestions, validation.errors);
        const revalidation = validateQuestions(fixedQuestions, targetCount, topic);
        if (revalidation.isValid && revalidation.questions) {
          questions = revalidation.questions.map((q: any, index: number) => ({
            ...q,
            id: q.id || `q${batch.startIndex + index}`,
            __batchId: batch.id,
          }));
          return questions;
        }
      } catch (error) {
        console.error(`Batch ${batch.id} attempt ${attempts} failed:`, error);
        if (attempts >= maxAttempts) {
          break;
        }
      }
    }

    throw new AppError(502, `Unable to generate valid ${targetCount} questions for batch ${batch.id}`);
  }

  private async generateSingleBatch(topic: string, questionCount: number, blueprint?: AssessmentBlueprint): Promise<{ assessment: { topic: string; questionCount: number }; questions: any[] }> {
    const effectiveBlueprint = blueprint ?? createAssessmentBlueprint(topic, questionCount);

    const batch = {
      id: 'batch-1',
      difficulty: 'foundation',
      questionCount,
      questionTypes: ['conceptual', 'application'],
      concepts: buildDynamicConceptBank(topic, 'foundation'),
      startIndex: 1,
      endIndex: questionCount,
    } satisfies BatchBlueprint;

    const questions = await this.generateBatchForBlueprint(topic, effectiveBlueprint, batch, [], questionCount);

    const validation = validateQuestions(questions, questionCount, topic);
    if (!validation.isValid || !validation.questions) {
      throw new AppError(502, `Unable to generate a valid final ${questionCount}-question assessment`);
    }

    return {
      assessment: { topic, questionCount },
      questions: validation.questions,
    };
  }

  private extractAndParseJSON(response: string): any | null {
    if (!response || typeof response !== 'string') {
      return null;
    }

    try {
      return JSON.parse(response);
    } catch (e) {
      // continue
    }

    try {
      const cleaned = response
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (e) {
      // continue
    }

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ''));
      }
    } catch (e) {
      // continue
    }

    try {
      const questionsMatch = response.match(/"questions"\s*:\s*\[[\s\S]*?\]/);
      if (questionsMatch) {
        return JSON.parse(`{${questionsMatch[0]}}`.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''));
      }
    } catch (e) {
      // continue
    }

    console.error('All JSON parsing strategies failed');
    console.error('Response preview:', response.substring(0, 300));
    return null;
  }

  private attemptQuestionFix(questions: any[], _errors: string[]): any[] {
    return questions.map((q, index) => {
      const fixed = { ...q };

      if (!fixed.id || fixed.id === '') {
        fixed.id = `question-${index + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }

      if (typeof fixed.correctAnswer === 'string') {
        fixed.correctAnswer = parseInt(fixed.correctAnswer, 10);
      }
      if (fixed.correctAnswer === undefined || fixed.correctAnswer === null || isNaN(fixed.correctAnswer)) {
        fixed.correctAnswer = 0;
      }

      if (fixed.difficulty === 'verification') {
        fixed.difficulty = 'deep';
      }

      if (!fixed.topic) {
        fixed.topic = 'General';
      }

      if (!fixed.concept || fixed.concept === '') {
        fixed.concept = 'General Concept';
      }

      if (!fixed.explanation || fixed.explanation.length < 10) {
        const correctOption = fixed.options?.[fixed.correctAnswer] || 'the correct option';
        fixed.explanation = `The correct answer is ${correctOption}.`;
      }

      if (!Array.isArray(fixed.options) || fixed.options.length !== 4) {
        fixed.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      }

      const validTypes = ['conceptual', 'code_reasoning', 'scenario', 'debugging', 'output_prediction', 'comparison', 'application'];
      if (!validTypes.includes(fixed.questionType)) {
        fixed.questionType = 'conceptual';
      }

      return fixed;
    });
  }
}

export const assessmentGenerator = new AssessmentGenerator();