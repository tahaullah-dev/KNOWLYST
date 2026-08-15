// client/src/components/results/AnswerReview.tsx
import React, { useState } from 'react';
import { AssessmentQuestion, UserAnswer } from '../../types';

interface AnswerReviewProps {
  questions: AssessmentQuestion[];
  answers: UserAnswer[];
}

export default function AnswerReview({ questions, answers }: AnswerReviewProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');
  
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  
  const filteredQuestions = questions.filter(question => {
    const answer = answerMap.get(question.id);
    if (filter === 'all') return true;
    if (filter === 'correct') return answer?.isCorrect;
    if (filter === 'incorrect') return answer && !answer.isCorrect && !answer.skipped;
    if (filter === 'skipped') return answer?.skipped;
    return true;
  });
  
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };
  
  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      foundation: 'bg-surface-inset text-text-secondary',
      intermediate: 'bg-surface-inset text-text-secondary',
      advanced: 'bg-surface-inset text-text-secondary',
      deep: 'bg-surface-inset text-text-secondary',
      verification: 'bg-surface-inset text-text-secondary',
    };
    return colors[difficulty] || 'bg-surface-inset text-text-secondary';
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-lg">
        <h2 className="text-h4 font-semibold text-text-primary">
          Answer Review
        </h2>
        
        <div className="flex gap-sm">
          {(['all', 'correct', 'incorrect', 'skipped'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-md py-xs rounded-sm text-body-xs font-medium transition-colors ${
                filter === filterType
                  ? 'bg-accent-primary text-white'
                  : 'bg-border-light text-text-secondary hover:bg-border-dark'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-md">
        {filteredQuestions.map((question, index) => {
          const answer = answerMap.get(question.id);
          const isExpanded = expandedQuestion === question.id;
          const isCorrect = answer?.isCorrect;
          const isSkipped = answer?.skipped;
          
          return (
            <div key={question.id} className="border border-border-light rounded-lg overflow-hidden">
              <button
                onClick={() => toggleQuestion(question.id)}
                className="w-full text-left p-lg hover:bg-surface-light transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-md mb-md">
                      <span className={`inline-flex items-center px-sm py-xs rounded-sm text-caption font-semibold border border-border-light ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-caption text-text-tertiary">
                        {question.concept}
                      </span>
                      <span className="text-caption text-text-tertiary">
                        {question.questionType}
                      </span>
                    </div>
                    <p className="text-body-sm font-medium text-text-primary">
                      {index + 1}. {question.question}
                    </p>
                  </div>
                  
                  <div className="ml-lg flex-shrink-0">
                    {isCorrect && (
                      <span className="inline-flex items-center px-sm py-xs rounded-sm text-caption font-semibold bg-state-success text-white">
                        Correct
                      </span>
                    )}
                    {!isCorrect && !isSkipped && (
                      <span className="inline-flex items-center px-sm py-xs rounded-sm text-caption font-semibold bg-state-error text-white">
                        Incorrect
                      </span>
                    )}
                    {isSkipped && (
                      <span className="inline-flex items-center px-sm py-xs rounded-sm text-caption font-semibold bg-state-warning text-white">
                        Skipped
                      </span>
                    )}
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t border-border-light p-lg bg-surface-inset">
                  <div className="space-y-lg">
                    <div>
                      <h4 className="text-body-sm font-semibold text-text-primary mb-md">Options:</h4>
                      <ul className="space-y-md">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer = answer?.selectedAnswer === optionIndex;
                          const isCorrectAnswer = question.correctAnswer === optionIndex;
                          
                          return (
                            <li
                              key={optionIndex}
                              className={`p-md rounded-lg border ${
                                isCorrectAnswer
                                  ? 'bg-white border-state-success'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'bg-white border-state-error'
                                  : 'bg-white border-border-light'
                              }`}
                            >
                              <div className="flex items-start">
                                <span className="flex-shrink-0 text-body-sm font-medium text-text-secondary">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="ml-md text-body-sm text-text-primary flex-1">
                                  {option}
                                </span>
                                {isCorrectAnswer && (
                                  <span className="ml-md text-caption font-medium text-state-success">
                                    ✓ Correct
                                  </span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="ml-md text-caption font-medium text-state-error">
                                    ✗ Your Answer
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-body-sm font-semibold text-text-primary mb-md">Explanation:</h4>
                      <p className="text-body-sm text-text-secondary">{question.explanation}</p>
                    </div>
                    
                    {question.metadata?.commonMisconceptions && (
                      <div>
                        <h4 className="text-body-sm font-semibold text-text-primary mb-md">
                          Common Misconceptions:
                        </h4>
                        <ul className="list-disc list-inside space-y-xs">
                          {question.metadata.commonMisconceptions.map((misconception, index) => (
                            <li key={index} className="text-body-sm text-text-secondary">
                              {misconception}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}