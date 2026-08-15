// client/src/components/results/KnowledgeLevelCard.tsx (updated)
import React from 'react';
import { KnowledgeLevel, KnowledgeAnalysis } from '../../types';
import Card from '../common/Card';

interface KnowledgeLevelCardProps {
  analysis: KnowledgeAnalysis;
  score: number;
  totalQuestions: number;
}

export default function KnowledgeLevelCard({ 
  analysis, 
  score, 
  totalQuestions 
}: KnowledgeLevelCardProps) {
  const { knowledgeLevel, knowledgeScore, confidence } = analysis;
  
  const levelConfig: Record<KnowledgeLevel, { bg: string; text: string; color: string; emoji: string }> = {
    beginner: { bg: 'bg-surface-light', text: 'text-text-primary', color: 'text-state-info', emoji: '◆' },
    elementary: { bg: 'bg-surface-light', text: 'text-text-primary', color: 'text-state-info', emoji: '◇' },
    intermediate: { bg: 'bg-surface-light', text: 'text-text-primary', color: 'text-accent-primary', emoji: '◆' },
    advanced: { bg: 'bg-surface-light', text: 'text-text-primary', color: 'text-state-success', emoji: '◈' },
    expert: { bg: 'bg-surface-light', text: 'text-text-primary', color: 'text-accent-primary', emoji: '●' },
  };

  const confidenceConfig = (confidence: number) => {
    if (confidence >= 80) return { color: 'text-state-success', bg: 'bg-state-success' };
    if (confidence >= 60) return { color: 'text-state-warning', bg: 'bg-state-warning' };
    if (confidence >= 40) return { color: 'text-state-warning', bg: 'bg-state-warning' };
    return { color: 'text-state-error', bg: 'bg-state-error' };
  };

  const config = levelConfig[knowledgeLevel];
  const confConfig = confidenceConfig(confidence);

  return (
    <Card className={`p-3xl text-center ${config.bg} border-2 border-border-light`}>
      {/* Knowledge Level Display */}
      <div className="mb-2xl">
        <div className="text-h2 mb-lg">{config.emoji}</div>
        <div className={`inline-flex items-center rounded-lg px-lg py-md font-semibold text-h4 ${config.text}`}>
          <span className={`${config.color}`}>
            {knowledgeLevel.charAt(0).toUpperCase() + knowledgeLevel.slice(1)}
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-3xl">
        <div className="text-h1 font-serif font-medium text-text-primary mb-sm">
          {score} / {totalQuestions}
        </div>
        <p className="text-body text-text-secondary">
          Assessment Score ({Math.round((score / totalQuestions) * 100)}%)
        </p>
      </div>

      {/* Knowledge Score Bar */}
      <div className="mb-2xl">
        <div className="flex justify-between items-center mb-md">
          <span className="text-label text-text-secondary font-semibold">
            Knowledge Score
          </span>
          <span className="text-h4 text-text-primary font-semibold">
            {knowledgeScore} / 100
          </span>
        </div>
        <div className="relative h-2 bg-border-light rounded-small overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-700"
            style={{ width: `${knowledgeScore}%` }}
          />
        </div>
      </div>

      {/* Confidence Level */}
      <div>
        <div className="flex justify-between items-center mb-md">
          <span className="text-label text-text-secondary font-semibold">
            Assessment Confidence
          </span>
          <span className={`text-label font-semibold ${confConfig.color}`}>
            {confidence}%
          </span>
        </div>
        <div className="relative h-2 bg-border-light rounded-small overflow-hidden mb-md">
          <div
            className={`h-full transition-all duration-700 ${
              confidence >= 80 ? 'bg-state-success' :
              confidence >= 60 ? 'bg-state-warning' :
              confidence >= 40 ? 'bg-state-warning' : 'bg-state-error'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <p className="text-body-sm text-text-secondary font-medium">
          {confidence >= 80 ? 'High confidence • Reliable estimate' :
           confidence >= 60 ? 'Moderate confidence • Generally reliable' :
           confidence >= 40 ? 'Limited confidence • More questions may help' :
           'Low confidence • Need more evidence'}
        </p>
      </div>
    </Card>
  );
}