// client/src/components/results/ResultsDashboard.tsx (Phase 6 - Redesigned)
import React, { useEffect, useMemo, useState } from 'react';
import { useAssessment } from '../../hooks/useAssessment';
import { AssessmentResult } from '../../types';
import KnowledgeLevelCard from './KnowledgeLevelCard';
import PerformanceChart from './PerformanceChart';
import StrengthsWeaknesses from './StrengthsWeaknesses';
import AnswerReview from './AnswerReview';
import HistoryView from './HistoryView';
import Button from '../common/Button';
import Card from '../common/Card';
import PageHeader from '../common/PageHeader';
import SectionHeader from '../common/SectionHeader';

interface ResultsDashboardProps {
  onRetake: () => void;
  onHome?: () => void;
  initialResult?: AssessmentResult | null;
}

export default function ResultsDashboard({ onRetake, onHome, initialResult = null }: ResultsDashboardProps) {
  const { assessment, currentResult } = useAssessment();
  const [showReview, setShowReview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingHistoryResult, setViewingHistoryResult] = useState<AssessmentResult | null>(initialResult ?? null);

  useEffect(() => {
    setViewingHistoryResult(initialResult ?? null);
  }, [initialResult]);

  const displayedResult = useMemo(() => {
    return viewingHistoryResult ?? currentResult;
  }, [viewingHistoryResult, currentResult]);
  
  if (!displayedResult) {
    return (
      <div className="page-container flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-h1 font-serif font-medium text-text-primary mb-md">
            No Results Available
          </h2>
          <p className="text-body text-text-secondary mb-3xl">
            Complete an assessment to see your results.
          </p>
          <Button onClick={onRetake} size="large">
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }
  
  const analysis = displayedResult.analysis;
  const correctCount = displayedResult.score;
  const totalQuestions = displayedResult.questionCount;
  const isViewingHistoricalResult = viewingHistoryResult !== null;

  const answerReviewQuestions = isViewingHistoricalResult ? [] : (assessment?.questions ?? []);
  const answerReviewAnswers = displayedResult.answers;
  
  const handleViewHistoryResult = (result: AssessmentResult) => {
    setViewingHistoryResult(result);
    setShowHistory(false);
  };

  const handleClearHistory = () => {
    setViewingHistoryResult(null);
  };
  
  return (
    <div className="page-container">
      <div className="page-narrow">
        {/* Page Header */}
        <PageHeader
          title={displayedResult.topic}
          subtitle={`Assessment Results • Completed ${new Date(displayedResult.completedAt).toLocaleDateString()}`}
          breadcrumbs={[
            { label: 'Home', onClick: onHome },
            { label: displayedResult.topic, onClick: undefined },
            { label: 'Results', onClick: undefined },
          ]}
        />

        {/* Historical Result Badge */}
        {isViewingHistoricalResult && (
          <div className="mb-3xl p-lg bg-white border-l-4 border-state-info rounded-lg">
            <p className="text-body-sm text-state-info">
              <strong>Viewing Historical Result:</strong> This is a past assessment. Recent assessment data is shown above.
              <button
                onClick={handleClearHistory}
                className="ml-lg text-state-info hover:text-opacity-80 font-semibold underline"
              >
                View Current Results
              </button>
            </p>
          </div>
        )}

        {/* PRIMARY: Knowledge Level Card - Prominent */}
        <div className="mb-4xl">
          <KnowledgeLevelCard
            analysis={analysis}
            score={correctCount}
            totalQuestions={totalQuestions}
          />
        </div>

        {/* SECONDARY: Performance Visualizations */}
        <div className="mb-4xl">
          <SectionHeader
            title="Performance Analysis"
            description="Your performance across different difficulty levels and topics"
          />
          <Card className="p-2xl sm:p-3xl">
            <PerformanceChart
              difficultyPerformance={analysis.difficultyPerformance}
              topicPerformance={analysis.topicPerformance}
            />
          </Card>
        </div>

        {/* Key Insights: Strengths & Weaknesses */}
        <div className="mb-4xl">
          <SectionHeader
            title="Key Insights"
            description="Areas where you excel and opportunities for growth"
          />
          <StrengthsWeaknesses
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
          />
        </div>

        {/* Summary & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl mb-4xl">
          {/* Knowledge Summary */}
          <Card className="p-2xl">
            <h3 className="text-h4 text-text-primary font-semibold mb-lg">
              Assessment Summary
            </h3>
            <p className="text-body text-text-secondary leading-relaxed">
              {analysis.summary}
            </p>
          </Card>

          {/* Next Steps */}
          <Card className="p-2xl bg-surface-light border border-border-light">
            <h3 className="text-h4 text-text-primary font-semibold mb-lg">
              Recommended Next Steps
            </h3>
            <ol className="space-y-md">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex gap-lg">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-sm bg-accent-primary text-white text-body font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-body text-text-secondary">{recommendation}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Optional Sections: Review & History */}
        <div className="mb-4xl space-y-2xl">
          {/* Answer Review Section */}
          {!isViewingHistoricalResult && (
            <div>
              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full text-left p-lg bg-surface-light border border-border-light rounded-lg hover:bg-surface-inset transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-h4 text-text-primary font-semibold">
                    {showReview ? '▼' : '▶'} Review Your Answers
                  </h3>
                  <span className="text-body-sm text-text-secondary">
                    {showReview ? 'Hide' : 'Show'} detailed answer explanations
                  </span>
                </div>
              </button>
              {showReview && (
                <div className="mt-lg">
                  <AnswerReview
                    questions={answerReviewQuestions}
                    answers={answerReviewAnswers}
                  />
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full text-left p-lg bg-surface-light border border-border-light rounded-lg hover:bg-surface-inset transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-h4 text-text-primary font-semibold">
                  {showHistory ? '▼' : '▶'} Assessment History
                </h3>
                <span className="text-body-sm text-text-secondary">
                  {showHistory ? 'Hide' : 'Show'} past assessment results
                </span>
              </div>
            </button>
            {showHistory && (
              <div className="mt-lg">
                <HistoryView
                  onViewResult={handleViewHistoryResult}
                  onClose={() => setShowHistory(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-lg justify-center py-3xl border-t border-border-light">
          <Button
            variant="secondary"
            onClick={onHome || onRetake}
            size="medium"
          >
            ← Back Home
          </Button>
          <Button
            onClick={onRetake}
            size="medium"
          >
            Take New Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}