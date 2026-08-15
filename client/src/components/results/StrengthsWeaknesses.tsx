// client/src/components/results/StrengthsWeaknesses.tsx
import React from 'react';
import Card from '../common/Card';

interface StrengthsWeaknessesProps {
  strengths: string[];
  weaknesses: string[];
}

export default function StrengthsWeaknesses({ 
  strengths, 
  weaknesses 
}: StrengthsWeaknessesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2xl">
      {/* Strengths */}
      <Card className="p-2xl border-l-4 border-state-success">
        <h3 className="text-h4 text-text-primary font-semibold mb-lg flex items-center">
          <span className="w-5 h-5 text-state-success mr-md">✓</span>
          Strong Areas
        </h3>
        
        {strengths.length > 0 ? (
          <ul className="space-y-md">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-state-success text-white mr-md mt-xs flex-shrink-0">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-body text-text-secondary leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-text-tertiary">
            No significant strengths identified in this assessment.
          </p>
        )}
      </Card>
      
      {/* Weaknesses */}
      <Card className="p-2xl border-l-4 border-state-error">
        <h3 className="text-h4 text-text-primary font-semibold mb-lg flex items-center">
          <span className="w-5 h-5 text-state-error mr-md">→</span>
          Areas to Improve
        </h3>
        
        {weaknesses.length > 0 ? (
          <ul className="space-y-md">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-state-error text-white mr-md mt-xs flex-shrink-0">
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-body text-text-secondary leading-relaxed">{weakness}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body-sm text-text-tertiary">
            No significant areas for improvement identified.
          </p>
        )}
      </Card>
    </div>
  );
}