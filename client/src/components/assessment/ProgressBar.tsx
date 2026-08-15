// client/src/components/assessment/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  answeredCount: number;
}

export default function ProgressBar({ current, total, answeredCount }: ProgressBarProps) {
  const progressPercentage = ((current + 1) / total) * 100;
  const answeredPercentage = (answeredCount / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-md">
        <span className="text-body-sm font-medium text-text-primary">
          Question {current + 1} of {total}
        </span>
        <span className="text-body-sm text-text-secondary">
          {answeredCount} answered
        </span>
      </div>

      {/* Progress bar using design tokens */}
      <div className="progress-bar mb-lg">
        <div
          className="progress-bar-fill bg-accent-primary"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

    </div>
  );
}