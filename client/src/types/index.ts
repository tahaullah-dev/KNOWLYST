export type Difficulty = 'foundation' | 'intermediate' | 'advanced' | 'deep' | 'verification';

export type QuestionType =
	| 'conceptual'
	| 'code_reasoning'
	| 'scenario'
	| 'debugging'
	| 'output_prediction'
	| 'comparison'
	| 'application';

export interface AssessmentQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	difficulty: Difficulty;
	topic: string;
	concept: string;
	questionType: QuestionType;
	explanation: string;
	metadata?: {
		learningObjectives?: string[];
		prerequisites?: string[];
		commonMisconceptions?: string[];
	};
}

export interface Assessment {
	topic: string;
	questionCount: number;
	questions: AssessmentQuestion[];
}

export interface AssessmentRequest {
	topic: string;
	questionCount: number;
}

export interface AssessmentResponse {
	assessment: {
		topic: string;
		questionCount: number;
	};
	questions: AssessmentQuestion[];
}

export interface UserAnswer {
	questionId: string;
	selectedAnswer: number | null;
	isCorrect: boolean;
	skipped: boolean;
}

export interface AssessmentResult {
	topic: string;
	questionCount: number;
	score: number;
	percentage: number;
	answers: UserAnswer[];
	analysis: KnowledgeAnalysis;
	completedAt: string;
}

export type KnowledgeLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export interface DifficultyPerformance {
	foundation: number;
	intermediate: number;
	advanced: number;
	deep: number;
}

export interface KnowledgeAnalysis {
	overallAccuracy: number;
	difficultyPerformance: DifficultyPerformance;
	topicPerformance: Record<string, number>;
	questionTypePerformance: Record<string, number>;
	knowledgeLevel: KnowledgeLevel;
	knowledgeScore: number;
	confidence: number;
	strengths: string[];
	weaknesses: string[];
	recommendations: string[];
	summary: string;
}

export interface AssessmentHistoryItem {
	id: string;
	topic: string;
	questionCount: number;
	score: number;
	percentage: number;
	knowledgeLevel: KnowledgeLevel;
	confidence: number;
	difficultyPerformance: DifficultyPerformance;
	completedAt: string;
	result: AssessmentResult;
}
