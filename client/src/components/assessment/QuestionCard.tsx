// client/src/components/assessment/QuestionCard.tsx (updated)
import React from 'react';
import { AssessmentQuestion, UserAnswer } from '../../types';
import Card from '../common/Card';
import AnswerOptions from './AnswerOptions';
import Button from '../common/Button';

interface QuestionCardProps {
  question: AssessmentQuestion;
  userAnswer?: UserAnswer;
  onSelectAnswer: (questionId: string, answerIndex: number) => void;
  onSkipQuestion: (questionId: string) => void;
}

export default function QuestionCard({ 
  question, 
  userAnswer, 
  onSelectAnswer,
  onSkipQuestion 
}: QuestionCardProps) {
  return (
    <Card className="p-2xl sm:p-3xl">
      {/* Question Header */}
      <div className="mb-2xl">
        {/* Difficulty Badge and Type */}
        <div className="flex flex-wrap gap-md mb-lg">
          <span className="inline-flex items-center rounded-sm bg-surface-inset px-md py-xs text-label text-text-secondary font-semibold border border-border-light">
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
          <span className="inline-flex items-center rounded-sm bg-surface-inset px-md py-xs text-label text-text-secondary border border-border-light">
            {question.topic}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-h2 font-serif font-medium text-text-primary leading-relaxed mb-lg">
          {question.question}
        </h2>

        {/* Code Block if Present */}
        {question.questionType === 'code_reasoning' && question.question.includes('```') && (
          <div className="bg-surface-inset border border-border-light rounded-lg p-lg mb-lg overflow-x-auto">
            <pre className="text-body-xs font-mono text-text-primary">
              <code>{question.question.split('```')[1]?.trim()}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="mb-2xl">
        <h3 className="text-h4 font-sans font-semibold text-text-primary mb-lg">
          Answer options
        </h3>
        <AnswerOptions
          options={question.options}
          selectedAnswer={userAnswer?.selectedAnswer ?? null}
          onSelect={(index) => onSelectAnswer(question.id, index)}
        />
      </div>

      {/* Skip Button */}
      <div className="flex justify-end pt-lg border-t border-border-light">
        <Button
          variant="ghost"
          onClick={() => onSkipQuestion(question.id)}
          size="small"
        >
          Skip this question
        </Button>
      </div>
    </Card>
  );
}