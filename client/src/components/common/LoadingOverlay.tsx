// client/src/components/common/LoadingOverlay.tsx
import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  stages?: string[];
  currentStage?: number;
}

export default function LoadingOverlay({ 
  message = 'Loading...', 
  stages = [],
  currentStage = -1 
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-surface-paper bg-opacity-95 flex items-center justify-center z-50">
      <div className="max-w-md w-full px-lg">
        <div className="text-center">
          {/* Inline spinner */}
          <div className="flex justify-center mb-2xl">
            <div className="spinner"></div>
          </div>
          
          <h3 className="text-h3 font-serif font-medium text-text-primary mb-lg">
            {message}
          </h3>
          
          {stages.length > 0 && (
            <div className="mt-2xl space-y-md">
              {stages.map((stage, index) => {
                const isComplete = currentStage > index;
                const isCurrent = currentStage === index;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-md transition-colors ${
                      isComplete ? 'text-state-success' : 
                      isCurrent ? 'text-accent-primary' : 'text-text-tertiary'
                    }`}
                  >
                    <span className="flex-shrink-0 h-5 w-5">
                      {isComplete ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="spinner w-5 h-5"></div>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <circle cx="10" cy="10" r="1" />
                        </svg>
                      )}
                    </span>
                    <span className="text-body-sm font-medium">{stage}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}