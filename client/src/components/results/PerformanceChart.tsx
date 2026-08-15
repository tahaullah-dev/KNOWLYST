// client/src/components/results/PerformanceChart.tsx
import React from 'react';
import { DifficultyPerformance } from '../../types';

interface PerformanceChartProps {
  difficultyPerformance: DifficultyPerformance;
  topicPerformance: Record<string, number>;
}

export default function PerformanceChart({ 
  difficultyPerformance, 
  topicPerformance 
}: PerformanceChartProps) {
  const difficultyLabels = [
    { key: 'foundation', label: 'Foundation', color: 'bg-state-info' },
    { key: 'intermediate', label: 'Intermediate', color: 'bg-state-warning' },
    { key: 'advanced', label: 'Advanced', color: 'bg-accent-primary' },
    { key: 'deep', label: 'Deep Knowledge', color: 'bg-state-success' },
  ];

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div className="w-full">
      <h2 className="text-h4 font-semibold text-text-primary mb-2xl">
        Performance by Difficulty
      </h2>
      
      <div className="space-y-lg">
        {difficultyLabels.map(({ key, label, color }) => {
          const value = difficultyPerformance[key as keyof DifficultyPerformance];
          
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-md">
                <span className="text-body-sm font-medium text-text-primary">{label}</span>
                <span className="text-body-sm font-semibold text-text-secondary">
                  {formatPercentage(value)}
                </span>
              </div>
              <div className="relative h-2 bg-border-light rounded-small overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-500`}
                  style={{ width: formatPercentage(value) }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {Object.keys(topicPerformance).length > 0 && (
        <div className="mt-2xl">
          <h3 className="text-body-sm font-semibold text-text-primary mb-lg">
            Performance by Topic
          </h3>
          <div className="space-y-md">
            {Object.entries(topicPerformance)
              .sort((a, b) => b[1] - a[1])
              .map(([topic, performance]) => (
                <div key={topic} className="flex items-center gap-lg">
                  <span className="text-body-sm text-text-secondary w-1/3 truncate">
                    {topic}
                  </span>
                  <div className="flex-1">
                    <div className="relative h-xs bg-border-light rounded-small overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          performance >= 0.7 ? 'bg-state-success' :
                          performance >= 0.4 ? 'bg-state-warning' : 'bg-state-error'
                        }`}
                        style={{ width: `${Math.round(performance * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-body-sm font-medium text-text-primary w-12 text-right">
                    {Math.round(performance * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}