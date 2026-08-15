// client/src/components/home/QuestionCountSelector.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Check, Target } from 'lucide-react';

interface QuestionCountSelectorProps {
  value: number;
  onChange: (count: number) => void;
}

const OPTIONS = [
  {
    count: 10,
    label: 'Pulse',
    description: '2-4 min',
  },
  {
    count: 20,
    label: 'Signal',
    description: '5-8 min',
  },
  {
    count: 30,
    label: 'Full scan',
    description: '8-12 min',
    recommended: true,
  },
];

export default function QuestionCountSelector({ value, onChange }: QuestionCountSelectorProps) {
  return (
    <div className="w-full" role="radiogroup" aria-label="Assessment depth selector">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        {OPTIONS.map((option) => {
          const isSelected = value === option.count;

          return (
            <motion.button
              key={option.count}
              type="button"
              onClick={() => onChange(option.count)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label} assessment - ${option.count} questions`}
              className={`relative border text-left transition-all duration-200 ease-out font-sans ${
                isSelected
                  ? 'border-[#111111] bg-[#111111] text-white shadow-sm rounded-lg p-lg'
                  : 'border-border-light bg-[#f4f2ee] text-text-primary hover:bg-[#efeae3] hover:border-border-dark hover:shadow-sm rounded-lg p-lg'
              }`}
            >
              {option.recommended && (
                <div className="mb-sm flex items-center justify-end">
                  <span
                    className={`inline-flex items-center gap-1 border text-caption font-semibold px-md py-xs rounded-full ${
                      isSelected
                        ? 'border-[#d7d2ca] bg-[#f1efe9] text-[#111111]'
                        : 'border-[#d7d2ca] bg-[#f0efe9] text-[#111111]'
                    }`}
                  >
                    <Target className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-sm">
                <div>
                  <div className={`text-h2 font-semibold mb-xs ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                    {option.count}
                  </div>

                  <div className={`text-h4 font-semibold mb-xs ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                    {option.label}
                  </div>

                  <div className={`text-body-sm ${isSelected ? 'text-white/80' : 'text-text-tertiary'}`}>
                    {option.description}
                  </div>
                </div>

                <span
                  className={`mt-xs inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected
                      ? 'border-white bg-white text-[#111111]'
                      : 'border-border-dark bg-transparent text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}