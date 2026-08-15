import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAssessmentBlueprint, buildUserPrompt } from './promptBuilder.js';
import { validateQuestions } from '../validators/questionValidator.js';
import { AssessmentGenerator, detectAssessmentDuplicates } from './assessmentGenerator.js';

describe('Assessment generation blueprint', () => {
  it('creates a batch plan for 30-question assessments with concept allocation', () => {
    const blueprint = createAssessmentBlueprint('React', 30);

    assert.equal(blueprint.totalQuestions, 30);
    assert.equal(blueprint.batches.length, 3);
    assert.deepEqual(blueprint.batches.map(batch => batch.questionCount), [10, 10, 10]);
    assert.equal(blueprint.batches.every(batch => batch.concepts.length > 0), true);
    assert.equal(blueprint.batches.every(batch => batch.questionTypes.length > 0), true);
  });

  it('scales stage and batch allocation for custom assessment sizes', () => {
    const blueprint = createAssessmentBlueprint('React', 40);

    assert.equal(blueprint.totalQuestions, 40);
    assert.equal(blueprint.batches.length, 4);
    assert.equal(blueprint.batches.reduce((total, batch) => total + batch.questionCount, 0), 40);
    assert.equal(blueprint.stages.reduce((total, stage) => total + stage.questionCount, 0), 40);
    assert.equal(blueprint.stages.every(stage => stage.questionCount > 0), true);
  });

  it('adds batch-specific concept guidance to prompts', () => {
    const blueprint = createAssessmentBlueprint('React', 30);
    const prompt = buildUserPrompt('React', blueprint, blueprint.batches[0]);

    assert.match(prompt, /Batch Design/i);
    assert.match(prompt, /questionType/i);
    assert.match(prompt, /Required concepts/i);
  });
});

describe('Assessment generation for small question sets', () => {
  it('returns the expected assessment payload for 10-question assessments', async () => {
    const generator = new AssessmentGenerator() as any;
    let overrideCount: number | undefined;

    generator.generateBatchForBlueprint = async (_topic: string, _blueprint: any, batch: any, _existingQuestions: any[], count?: number) => {
      overrideCount = typeof count === 'number' ? count : batch.questionCount;
      const length = overrideCount ?? 0;

      return Array.from({ length }, (_, index) => ({
        id: `q${index + 1}`,
        question: `Question ${index + 1} about the topic`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        difficulty: 'foundation',
        topic: 'React',
        concept: 'core fundamentals',
        questionType: 'conceptual',
        explanation: 'This is a valid explanation for the answer.',
      }));
    };

    const result = await generator.generateSingleBatch('React', 10, createAssessmentBlueprint('React', 10));

    assert.equal(result.assessment.topic, 'React');
    assert.equal(result.assessment.questionCount, 10);
    assert.equal(result.questions.length, 10);
    assert.equal(overrideCount, 10);
  });
});

describe('Assessment duplicate detection', () => {
  it('rejects near-duplicate question stems while preserving distinct concept checks', () => {
    const questions = [
      {
        id: 'q1',
        question: 'Which React hook is used to manage state in a function component?',
        options: ['useEffect', 'useState', 'useMemo', 'useCallback'],
        correctAnswer: 1,
        difficulty: 'foundation',
        topic: 'React',
        concept: 'State management',
        questionType: 'conceptual',
        explanation: 'useState is the hook used to store local state in function components.',
      },
      {
        id: 'q2',
        question: 'Which hook should you use to manage local state inside a function component?',
        options: ['useState', 'useReducer', 'useEffect', 'useContext'],
        correctAnswer: 0,
        difficulty: 'foundation',
        topic: 'React',
        concept: 'State management',
        questionType: 'conceptual',
        explanation: 'useState is the standard way to manage local state in function components.',
      },
      {
        id: 'q3',
        question: 'When should you use useMemo instead of recomputing a value on every render?',
        options: ['To memoize a derived value', 'To trigger an effect', 'To manage local state', 'To read context'],
        correctAnswer: 0,
        difficulty: 'intermediate',
        topic: 'React',
        concept: 'Memoization',
        questionType: 'application',
        explanation: 'useMemo helps avoid repeated expensive work when the dependencies do not change.',
      },
    ];

    const result = detectAssessmentDuplicates(questions, 'React');
    assert.ok(result.rejectedIds.includes('q2'));
    assert.ok(!result.rejectedIds.includes('q3'));
  });

  it('keeps valid questions when the validator accepts them', () => {
    const questions = [
      {
        id: 'q1',
        question: 'Which pattern keeps a value stable across renders when dependencies do not change?',
        options: ['useEffect', 'useRef', 'useMemo', 'useLayoutEffect'],
        correctAnswer: 2,
        difficulty: 'intermediate',
        topic: 'React',
        concept: 'Memoization',
        questionType: 'application',
        explanation: 'useMemo caches a computed value until its dependencies change.',
      },
    ];

    const validation = validateQuestions(questions, 1, 'React');
    assert.equal(validation.isValid, true);
  });
});
