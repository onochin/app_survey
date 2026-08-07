export type GnssLessonId = "gnss-overview";

export interface GnssLessonMetadata {
  readonly id: GnssLessonId;
  readonly number: 1;
  readonly title: string;
  readonly description: string;
  readonly learningGoal: string;
  readonly terms: readonly string[];
  readonly cautions: readonly string[];
}

export type GnssPurposeId =
  | "electromagnetic-survey-point"
  | "auris-survey-position"
  | "bathymetric-survey-point"
  | "drone-control-point"
  | "general-survey-point";

export interface GnssPurpose {
  readonly id: GnssPurposeId;
  readonly label: string;
  readonly objective: string;
  readonly targetPoint: string;
  readonly expectedResult: string;
  readonly resultUsage: string;
  readonly resultUsageLabel: string;
}

export interface GnssWorkflowStep {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly fieldAction: string;
  readonly importantItems: readonly string[];
  readonly laterLesson: string;
}

export type GnssMethodId = "own-rtk" | "network-rtk" | "clas";

export interface GnssMethod {
  readonly id: GnssMethodId;
  readonly label: string;
  readonly shortLabel: string;
  readonly fieldBaseStation: string;
  readonly informationSource: string;
  readonly communicationPath: string;
  readonly canMeasureP1: string;
  readonly summary: string;
  readonly caution: string;
  readonly diagramSource: string;
  readonly diagramPath: string;
}

export type GnssPositioningStateId = "single" | "float" | "fix";

export interface GnssPositioningState {
  readonly id: GnssPositioningStateId;
  readonly label: "SINGLE" | "FLOAT" | "FIX";
  readonly summary: string;
  readonly fieldMeaning: string;
}

export interface GnssInformationFlowStep {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface GnssQualityCheck {
  readonly id: string;
  readonly label: string;
  readonly reason: string;
}

export type GnssQuizQuestionType =
  | "仕組み理解"
  | "品質管理"
  | "方式選択";

export interface GnssQuizOption {
  readonly id: string;
  readonly label: string;
  readonly incorrectReason: string | null;
}

export interface GnssQuizQuestion {
  readonly id: string;
  readonly questionType: GnssQuizQuestionType;
  readonly prompt: string;
  readonly options: readonly GnssQuizOption[];
  readonly correctOptionId: string;
  readonly correctReason: string;
  readonly fieldCheck: string;
}

export interface GnssQuizAnswerEvaluation {
  readonly questionId: string;
  readonly selectedOptionId: string;
  readonly selectedOptionLabel: string;
  readonly correctOptionId: string;
  readonly correctOptionLabel: string;
  readonly isCorrect: boolean;
  readonly selectedAnswerReason: string | null;
  readonly correctReason: string;
  readonly fieldCheck: string;
}

export interface GnssCoordinatePoint {
  readonly x: number;
  readonly y: number;
  readonly elevation: number;
}

export interface GnssPointDifference {
  readonly north: number;
  readonly east: number;
  readonly height: number;
}
