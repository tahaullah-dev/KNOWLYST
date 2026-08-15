import React, { useState } from 'react';
import { useAssessmentHistory } from '../../hooks/useLocalStorage';
import { AssessmentResult, KnowledgeLevel } from '../../types';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import Card from '../common/Card';

interface HistoryViewProps {
  onViewResult: (result: AssessmentResult) => void;
  onClose: () => void;
}

export default function HistoryView({ onViewResult, onClose }: HistoryViewProps) {
  const { history, isLoading, error, deleteHistoryItem, clearHistory, reloadHistory } = useAssessmentHistory();
  const [confirmClear, setConfirmClear] = useState(false);

  const levelColors: Record<KnowledgeLevel, string> = {
    beginner: 'bg-surface-light text-text-secondary',
    elementary: 'bg-surface-light text-text-secondary',
    intermediate: 'bg-surface-light text-text-secondary',
    advanced: 'bg-surface-light text-text-secondary',
    expert: 'bg-surface-light text-text-secondary',
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this assessment from history?')) {
      await deleteHistoryItem(id);
    }
  };

  const handleClearAll = async () => {
    setConfirmClear(true);
  };

  const confirmClearAll = async () => {
    await clearHistory();
    setConfirmClear(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-3xl">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load history"
        message={error.message}
        onRetry={reloadHistory}
      />
    );
  }

  return (
    <Card className="p-2xl">
      <div className="mb-lg flex flex-col gap-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-h4 font-semibold text-text-primary">
            Assessment History
          </h2>
          <p className="text-body-sm text-text-secondary">
            {history.length} completed {history.length === 1 ? 'assessment' : 'assessments'}
          </p>
        </div>

        <div className="flex flex-wrap gap-md">
          {history.length > 0 && (
            <Button
              variant="secondary"
              size="small"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-3xl text-center">
          <div className="mb-lg text-h1">◇</div>
          <h3 className="mb-md text-h4 font-semibold text-text-primary">
            No assessments yet
          </h3>
          <p className="text-body text-text-secondary">
            Complete your first assessment to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-md">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border-light p-lg transition-colors hover:bg-surface-light"
            >
              <div className="flex flex-col gap-lg sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-md flex flex-wrap items-center gap-md">
                    <h3 className="min-w-0 break-words text-body-sm font-semibold text-text-primary">
                      {item.topic}
                    </h3>
                    <span className={`inline-flex items-center rounded-sm border border-border-light px-md py-xs text-caption font-semibold ${levelColors[item.knowledgeLevel]}`}>
                      {item.knowledgeLevel}
                    </span>
                  </div>

                  <div className="mb-md flex flex-wrap items-center gap-lg text-body-xs text-text-secondary">
                    <span>{item.score}/{item.questionCount} correct</span>
                    <span>{Math.round(item.percentage)}%</span>
                    <span>Confidence: {item.confidence}%</span>
                  </div>

                  <div className="text-caption text-text-tertiary">
                    {formatDate(item.completedAt)}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-md sm:ml-lg">
                  <button
                    onClick={() => onViewResult(item.result)}
                    className="text-body-sm font-medium text-accent-primary underline-offset-4 hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-body-sm font-medium text-state-error underline-offset-4 hover:text-opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-state-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmClear && (
        <div className="fixed inset-0 bg-text-primary bg-opacity-20 flex items-center justify-center p-lg z-50">
          <Card className="max-w-md w-full p-2xl sm:p-3xl">
            <h3 className="text-h3 font-serif font-medium text-text-primary mb-md">
              Clear All History?
            </h3>
            <p className="text-body text-text-secondary mb-lg">
              This will permanently delete all {history.length} assessment records from your browser.
            </p>
            <div className="flex gap-lg justify-end">
              <Button
                variant="secondary"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmClearAll}
              >
                Clear All
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}