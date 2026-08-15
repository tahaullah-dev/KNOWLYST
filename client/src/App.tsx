// client/src/App.tsx
import { useState } from 'react';
import { AssessmentProvider } from './context/AssessmentContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import AssessmentView from './components/assessment/AssessmentView';
import ResultsDashboard from './components/results/ResultsDashboard';
import HistoryView from './components/results/HistoryView';
import { AssessmentResult } from './types';

type AppView = 'home' | 'assessment' | 'results' | 'history';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedHistoryResult, setSelectedHistoryResult] = useState<AssessmentResult | null>(null);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AssessmentProvider>
          <Layout 
            onBrandClick={() => {
              setSelectedHistoryResult(null);
              setCurrentView('home');
            }}
            onHistoryClick={() => {
              setSelectedHistoryResult(null);
              setCurrentView('history');
            }}
          >
          {currentView === 'home' && (
            <HomePage onStartAssessment={() => setCurrentView('assessment')} />
          )}
          {currentView === 'assessment' && (
            <AssessmentView onComplete={() => setCurrentView('results')} />
          )}
          {currentView === 'results' && (
            <ResultsDashboard
              initialResult={selectedHistoryResult}
              onRetake={() => {
                setSelectedHistoryResult(null);
                setCurrentView('home');
              }}
              onHome={() => {
                setSelectedHistoryResult(null);
                setCurrentView('home');
              }}
            />
          )}
          {currentView === 'history' && (
            <HistoryView
              onViewResult={(result) => {
                setSelectedHistoryResult(result);
                setCurrentView('results');
              }}
              onClose={() => setCurrentView('home')}
            />
          )}
        </Layout>
        </AssessmentProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;