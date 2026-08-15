// client/src/components/assessment/AssessmentView.tsx (Phase 5 - Redesigned)
import React, { useState } from 'react';
import { useAssessment } from '../../hooks/useAssessment';
import { useKnowledgeAnalysis } from '../../hooks/useKnowledgeAnalysis';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Card from '../common/Card';
import PageHeader from '../common/PageHeader';

interface AssessmentViewProps {
  onComplete: () => void;
}

export default function AssessmentView({ onComplete }: AssessmentViewProps) {
  const {
    assessment,
    currentQuestionIndex,
    getCurrentQuestion,
    goToNextQuestion,
    goToPreviousQuestion,
    goToQuestion,
    selectAnswer,
    skipQuestion,
    getAnswerForQuestion,
    getUnansweredCount,
    getAssessmentProgress,
    answers,
    setCurrentResult,
    saveResult,
  } = useAssessment();

  const { analyzeAssessment } = useKnowledgeAnalysis();
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionNavigator, setShowQuestionNavigator] = useState(false);

  const currentQuestion = getCurrentQuestion();
  const progress = getAssessmentProgress();
  const unansweredCount = getUnansweredCount();

  if (!assessment || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-h2 text-secondary-900 font-bold mb-md">
          No Assessment Loaded
        </h2>
        <p className="text-body text-secondary-600">
          Please start an assessment from the home page.
        </p>
      </div>
    );
  }

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    selectAnswer(questionId, answerIndex);
  };

  const handleSkipQuestion = (questionId: string) => {
    skipQuestion(questionId);
    if (currentQuestionIndex < assessment.questions.length - 1) {
      goToNextQuestion();
    }
  };

  const handleSubmit = () => {
    setSubmissionError(undefined);

    if (unansweredCount > 0) {
      setShowSubmitConfirmation(true);
    } else {
      void submitAssessment();
    }
  };

  const submitAssessment = async () => {
    if (isSubmitting) return;

    setSubmissionError(undefined);
    setIsSubmitting(true);
    setShowSubmitConfirmation(false);

    try {
      // Ensure every assessment question has a corresponding answer record.
      const completeAnswerList = assessment.questions.map(question => {
        const existing = answers[question.id];
        if (existing) {
          return existing;
        }

        return {
          questionId: question.id,
          selectedAnswer: null,
          isCorrect: false,
          skipped: true,
        };
      });

      // Analyze the assessment results.
      const result = analyzeAssessment(assessment, completeAnswerList);

      // Set the current result for immediate display in the results dashboard.
      setCurrentResult(result);

      // Persist result before navigating.
      await saveResult(result);

      // Navigate to results only after a successful save.
      onComplete();
    } catch (error) {
      console.error('Assessment submission failed:', error);

      const message = error instanceof Error
        ? error.message
        : 'Failed to submit assessment. Please try again.';

      setSubmissionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const userAnswer = getAnswerForQuestion(currentQuestion.id);

  return (
    <div className="page-container">
      <div className="page-narrow">
        {/* Page Header with Breadcrumbs */}
        <PageHeader
          title={`${assessment.topic} Assessment`}
          subtitle={`Question ${currentQuestionIndex + 1} of ${assessment.questions.length}`}
          breadcrumbs={[
            { label: 'Home', onClick: undefined },
            { label: assessment.topic, onClick: undefined },
            { label: `Question ${currentQuestionIndex + 1}`, onClick: undefined },
          ]}
        />

        {/* Progress Bar */}
        <Card className="mb-3xl p-lg">
          <ProgressBar
            current={currentQuestionIndex}
            total={assessment.questions.length}
            answeredCount={progress.answered}
          />
        </Card>

        {/* Submission Error Alert */}
        {submissionError && (
          <Alert
            type="error"
            title="Submission Failed"
            message={submissionError}
            action={{
              label: 'Try Again',
              onClick: () => void submitAssessment(),
            }}
            className="mb-3xl"
          />
        )}

        {/* Question Card - Main Content */}
        <div className="mb-3xl">
          <QuestionCard
            question={currentQuestion}
            userAnswer={userAnswer}
            onSelectAnswer={handleSelectAnswer}
            onSkipQuestion={handleSkipQuestion}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mb-3xl flex flex-col sm:flex-row gap-lg justify-between">
          <Button
            variant="secondary"
            onClick={goToPreviousQuestion}
            disabled={isFirstQuestion}
            size="medium"
          >
            ← Previous Question
          </Button>

          <div className="flex gap-lg">
            <Button
              variant="ghost"
              onClick={() => setShowQuestionNavigator(!showQuestionNavigator)}
              size="medium"
            >
              {showQuestionNavigator ? 'Hide Navigator' : 'Show Navigator'}
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Submitting..."
                disabled={isSubmitting}
                size="medium"
              >
                Submit Assessment →
              </Button>
            ) : (
              <Button
                onClick={goToNextQuestion}
                size="medium"
              >
                Next Question →
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator - Collapsible */}
        {showQuestionNavigator && (
          <Card className="mb-3xl p-2xl">
            <h3 className="text-h4 text-text-primary font-semibold mb-2xl">
              Question Navigator
            </h3>

            {/* Question Status Grid */}
            <div className="mb-2xl">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-sm">
                {assessment.questions.map((question, index) => {
                  const answer = getAnswerForQuestion(question.id);
                  const isAnswered = answer && !answer.skipped;
                  const isSkipped = answer && answer.skipped;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      onClick={() => {
                        goToQuestion(index);
                        setShowQuestionNavigator(false);
                      }}
                      className={`
                        h-10 rounded-md text-body-sm font-semibold transition-all
                        ${isCurrent
                          ? 'bg-accent-primary text-white'
                          : isAnswered
                          ? 'bg-state-success text-white hover:opacity-90'
                          : isSkipped
                          ? 'bg-state-warning text-white hover:opacity-90'
                          : 'bg-border-light text-text-primary hover:bg-border-dark'
                        }
                      `}
                      aria-label={`Question ${index + 1}${isAnswered ? ' answered' : isSkipped ? ' skipped' : ''}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-md pt-lg border-t border-border-light">
              <div className="flex items-center gap-sm">
                <div className="w-4 h-4 rounded-sm bg-accent-primary"></div>
                <span className="text-body-sm text-text-secondary">Current</span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-4 h-4 rounded-sm bg-state-success"></div>
                <span className="text-body-sm text-text-secondary">Answered</span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-4 h-4 rounded-sm bg-state-warning"></div>
                <span className="text-body-sm text-text-secondary">Skipped</span>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-4 h-4 rounded-sm bg-border-light border border-border-dark"></div>
                <span className="text-body-sm text-text-secondary">Not Started</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirmation && (
        <div className="fixed inset-0 bg-text-primary bg-opacity-20 flex items-center justify-center p-lg z-50">
          <Card className="max-w-md w-full p-2xl sm:p-3xl">
            <h3 className="text-h3 font-serif font-medium text-text-primary mb-md">
              Submit Assessment?
            </h3>
            <p className="text-body text-text-secondary mb-lg">
              You have <strong>{unansweredCount}</strong> unanswered {unansweredCount === 1 ? 'question' : 'questions'}. These will be marked as incorrect.
            </p>

            <div className="flex flex-col sm:flex-row gap-lg justify-end pt-lg border-t border-border-light">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitConfirmation(false)}
              >
                Continue Assessment
              </Button>
              <Button
                variant="primary"
                onClick={() => void submitAssessment()}
                loading={isSubmitting}
                loadingText="Submitting..."
                disabled={isSubmitting}
              >
                Submit Anyway
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}