  // client/src/components/home/HomePage.tsx
  import React, { useState } from 'react';
  import { motion } from 'motion/react';
  import { ArrowRight, BrainCircuit, Gauge, Target, Activity, BarChart3 } from 'lucide-react';
  import TopicInput from './TopicInput';
  import QuestionCountSelector from './QuestionCountSelector';
  import Button from '../common/Button';
  import Alert from '../common/Alert';
  import LoadingOverlay from '../common/LoadingOverlay';
  import { generateAssessment } from '../../services/api';
  import { useAssessment } from '../../hooks/useAssessment';

  interface HomePageProps {
    onStartAssessment: () => void;
  }

  export default function HomePage({ onStartAssessment }: HomePageProps) {
    const [topic, setTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(30);
    const [topicError, setTopicError] = useState<string>();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string>();
    const [loadingStage, setLoadingStage] = useState(0);
    const { setAssessment } = useAssessment();

    const loadingStages = [
      'Analyzing topic structure...',
      'Generating question bank...',
      'Calibrating difficulty levels...',
      'Preparing assessment...',
    ];

    const validateTopic = (): boolean => {
      if (!topic.trim()) {
        setTopicError('Enter a topic');
        return false;
      }
      if (topic.trim().length < 3) {
        setTopicError('Topic must be at least 3 characters');
        return false;
      }
      if (topic.trim().length > 100) {
        setTopicError('Topic must be less than 100 characters');
        return false;
      }
      setTopicError(undefined);
      return true;
    };

    const handleStartAssessment = async () => {
      if (!validateTopic()) return;

      setIsGenerating(true);
      setGenerationError(undefined);
      setLoadingStage(0);

      const stageTimer = setInterval(() => {
        setLoadingStage((prev) => Math.min(prev + 1, loadingStages.length - 1));
      }, 2500);

      try {
        const response = await generateAssessment({
          topic: topic.trim(),
          questionCount,
        });

        clearInterval(stageTimer);

        setAssessment({
          topic: response.assessment.topic,
          questionCount: response.assessment.questionCount,
          questions: response.questions,
        });

        onStartAssessment();
      } catch (error) {
        clearInterval(stageTimer);
        console.error('Failed to generate assessment:', error);

        let errorMessage = 'Unable to generate assessment. Please try again.';

        if (error instanceof Error) {
          if (error.message.includes('Invalid Gemini API key')) {
            errorMessage = 'API key invalid. Check your configuration.';
          } else if (error.message.includes('rate limit')) {
            errorMessage = 'Rate limited. Please wait and try again.';
          } else if (error.message.includes('timed out')) {
            errorMessage = 'Request timed out. Please try again.';
          } else if (error.message.includes('Network error')) {
            errorMessage = 'Network error. Check your connection.';
          } else {
            errorMessage = error.message;
          }
        }

        setGenerationError(errorMessage);
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="page-container min-h-screen flex flex-col">
        <div className="flex-1 page-narrow py-2xl sm:py-3xl lg:py-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3xl lg:gap-4xl mb-4xl items-stretch">
            <motion.div
              className="lg:col-span-5 lg:pr-2xl flex"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <div className="flex w-full max-w-[620px] min-w-0 flex-col gap-xl rounded-[1.5rem] border border-border-light bg-[#f4f1ea] px-xl py-2xl shadow-[inset_0_1px_0_rgba(26,26,26,0.02)] lg:self-start">
                <div className="mb-0 min-w-0">
                  <div className="mb-md text-overline text-accent-primary tracking-[0.2em] uppercase">
                    KNOWLYST
                  </div>
                  <h1 className="m-0 max-w-[440px] text-text-primary">
                    <span className="block">Know the</span>
                    <span className="block text-accent-primary">unknown.</span>
                  </h1>
                  <p className="mt-lg max-w-xl text-body text-text-secondary leading-relaxed">
                    KNOWLYST turns a subject into a precise, adaptive assessment. No vanity scores. Just the useful edges: what holds, what slips, and what to learn next.
                  </p>
                </div>

                <div className="mb-0 grid grid-cols-1 gap-md sm:grid-cols-3">
                  <div className="flex min-w-0 flex-col items-start">
                    <div className="mb-sm inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8e5de] text-text-primary transition-all duration-200">
                      <Target className="h-5 w-5" />
                    </div>
                    <p className="mb-xs text-h4 font-semibold text-text-primary">Adaptive</p>
                    <p className="text-body-xs text-text-secondary leading-tight">Questions adapt to your ability</p>
                  </div>

                  <div className="flex min-w-0 flex-col items-start">
                    <div className="mb-sm inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8e5de] text-text-primary transition-all duration-200">
                      <Activity className="h-5 w-5" />
                    </div>
                    <p className="mb-xs text-h4 font-semibold text-text-primary">Precise</p>
                    <p className="text-body-xs text-text-secondary leading-tight">Measures real understanding</p>
                  </div>

                  <div className="flex min-w-0 flex-col items-start">
                    <div className="mb-sm inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8e5de] text-text-primary transition-all duration-200">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <p className="mb-xs text-h4 font-semibold text-text-primary">Actionable</p>
                    <p className="text-body-xs text-text-secondary leading-tight">Insights you can act on</p>
                  </div>
                </div>

                <div className="border-t border-b border-border-light py-lg mt-0">
                  <div className="grid grid-cols-2 gap-xl">
                    <div>
                      <span className="text-overline text-text-tertiary block mb-sm">01 / Method</span>
                      <p className="text-body-sm text-text-primary font-semibold">Adaptive difficulty</p>
                    </div>
                    <div>
                      <span className="text-overline text-text-tertiary block mb-sm">02 / Output</span>
                      <p className="text-body-sm text-text-primary font-semibold">Concept-level signal</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="lg:col-span-7 flex"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
            >
              <div className="bg-white border border-border-light p-2xl sm:p-3xl rounded-lg shadow-[0_10px_30px_rgba(26,26,26,0.04)]">
                <div className="space-y-2xl">
                  <div className="flex items-center justify-between border-b border-border-light pb-lg">
                    <div className="flex items-center gap-sm">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-border-light bg-surface-light text-text-primary" aria-hidden="true">
                        <Gauge className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-overline text-text-tertiary">Start a session</span>
                    </div>
                  </div>

                  <h2 className="text-h1 font-serif font-medium text-text-primary leading-tight">
                    Set the coordinates.
                  </h2>

                  <div>
                    <TopicInput
                      value={topic}
                      onChange={setTopic}
                      error={topicError}
                    />
                  </div>

                  <div>
                    <label className="form-label">Assessment depth</label>
                    <QuestionCountSelector
                      value={questionCount}
                      onChange={setQuestionCount}
                    />
                  </div>

                  {generationError && (
                    <Alert
                      type="error"
                      title="Assessment failed"
                      message={generationError}
                      onDismiss={() => setGenerationError(undefined)}
                    />
                  )}

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }}>
                    <Button
                      onClick={handleStartAssessment}
                      loading={isGenerating}
                      loadingText="Preparing..."
                      fullWidth
                      size="large"
                      variant="primary"
                    >
                      <span className="inline-flex items-center gap-sm">
                        Begin assessment
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </motion.div>

                  <div className="text-center pt-lg border-t border-border-light">
                    <p className="text-body-xs text-text-tertiary font-mono tracking-[0.12em] uppercase">
                      Private by default • No busywork
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Information grid section */}
          <div className="border-t border-border-light pt-3xl mb-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2xl sm:gap-0">
              <div className="sm:pr-3xl">
                <span className="text-overline text-text-tertiary block mb-md">How it works</span>
                <h3 className="text-h4 font-semibold text-text-primary mb-lg">
                  Set the coordinates.
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  Specify your subject. The assessment tool adapts to your answers, probing deeper as you demonstrate knowledge.
                </p>
              </div>

              <div className="sm:border-l sm:border-border-light sm:px-3xl">
                <span className="text-overline text-text-tertiary block mb-md">Mechanism</span>
                <h3 className="text-h4 font-semibold text-text-primary mb-lg">
                  Answer precisely.
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  Multiple choice questions calibrated to your skill level. Each response informs the next, building a picture of your true understanding.
                </p>
              </div>

              <div className="sm:border-l sm:border-border-light sm:pl-3xl">
                <span className="text-overline text-text-tertiary block mb-md">Outcome</span>
                <h3 className="text-h4 font-semibold text-text-primary mb-lg">
                  Know your level.
                </h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  Detailed analysis reveals your knowledge level, areas of strength, and the most valuable topics for growth.
                </p>
              </div>
            </div>
          </div>

          {/* Features section - Asymmetric */}
          <div className="border-t border-border-light pt-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3xl pt-3xl">
            {[
              {
                icon: Gauge,
                label: 'Feature',
                title: 'Adaptive depth',
                text: 'Questions adapt to your responses. Answer correctly? We probe deeper. Struggle? We explore foundations. The assessment calibrates its difficulty in real time, measuring your actual knowledge ceiling.',
              },
              {
                icon: BrainCircuit,
                label: 'Feature',
                title: 'Concept-level signal',
                text: 'Understand where you stand across multiple dimensions. Not just a score—insights into your mastery of core concepts, difficulty ranges you control, and gaps worth closing.',
              },
            ].map(({ icon: Icon, label, title, text }, index) => (
              <motion.div
                key={title}
                className="group rounded-xl border border-border-light bg-white/60 p-xl transition-all duration-300 hover:-translate-y-1 hover:border-border-dark hover:shadow-[0_12px_28px_rgba(26,26,26,0.06)]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + index * 0.08, ease: 'easeOut' }}
              >
                <div className="mb-lg inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-light bg-surface-light text-text-primary transition-all duration-300 group-hover:scale-105 group-hover:bg-[#f2eee8]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-overline text-accent-primary block mb-md">{label}</span>
                <h4 className="text-h3 font-semibold text-text-primary mb-lg">{title}</h4>
                <p className="text-body text-text-secondary leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <LoadingOverlay
            message="Preparing your assessment"
            stages={loadingStages}
            currentStage={loadingStage}
          />
        )}
      </div>
    );
  }