// client/src/components/assessment/AnswerOptions.tsx (updated)
import React from 'react';

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

export default function AnswerOptions({ 
  options, 
  selectedAnswer, 
  onSelect,
  disabled = false 
}: AnswerOptionsProps) {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-md">
      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            disabled={disabled}
            className={`
              w-full min-w-0 rounded-lg border-2 p-lg text-left transition-all sm:p-xl
              ${isSelected
                ? 'border-accent-primary bg-white'
                : 'border-border-light bg-white hover:border-border-dark'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary
            `}
            aria-pressed={isSelected}
            role="radio"
            aria-checked={isSelected}
          >
            <div className="flex min-w-0 items-start gap-lg">
              <span className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-body font-bold
                ${isSelected
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-light text-text-secondary'
                }
              `}>
                {optionLabels[index]}
              </span>

              <span className="min-w-0 flex-1 break-words text-body text-text-primary leading-relaxed">
                {option}
              </span>

              {isSelected && (
                <svg className="mt-xs h-6 w-6 shrink-0 text-accent-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}