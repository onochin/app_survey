export type GnssLessonId =
  | "gnss-overview"
  | "gnss-observations"
  | "gnss-coordinate-height"
  | "gnss-positioning-methods"
  | "gnss-own-base-station"
  | "gnss-correction-delivery"
  | "gnss-baseline-fix";

export interface GnssLessonMetadata {
  readonly id: GnssLessonId;
  readonly number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  readonly title: string;
  readonly description: string;
  readonly learningGoal: string;
  readonly terms: readonly string[];
  readonly cautions: readonly string[];
}

export interface GnssRepresentativeCase {
  readonly target: string;
  readonly targetPoint: string;
  readonly expectedResult: string;
  readonly practicalExamples: string;
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
  | "方式選択"
  | "用語整理"
  | "総合問題";

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

export type GnssObservationWorldId = "ideal" | "real";

export type GnssObservationKindId = "code" | "carrier";

export type GnssFrequencyId = "l1" | "l2" | "l5";

export type GnssFrequencySelectionId =
  | "l1-only"
  | "l1-l2"
  | "l1-l5"
  | "l1-l2-l5";

export interface GnssFrequencyBand {
  readonly id: GnssFrequencyId;
  readonly label: "L1" | "L2" | "L5";
  readonly megahertz: number;
}

export interface GnssFrequencySelection {
  readonly id: GnssFrequencySelectionId;
  readonly label: string;
  readonly frequencyIds: readonly GnssFrequencyId[];
}

export type GnssSystemId =
  | "gps"
  | "glonass"
  | "galileo"
  | "beidou"
  | "qzss";

export type GnssObservationEnvironmentId = "open" | "mountain-forest";

export type GnssSatelliteGeometryId = "biased" | "distributed";

export interface GnssSystemDefinition {
  readonly id: GnssSystemId;
  readonly label: string;
  readonly shortLabel: string;
  readonly coverage: "global" | "regional";
  readonly countryOrRegion: string;
  readonly description: string;
  readonly serviceStartLabel: string;
  readonly openSatelliteCount: number;
  readonly obstructedSatelliteCount: number;
  readonly note: string;
}

export interface GnssSystemSelectionSummary {
  readonly systemCount: number;
  readonly satelliteCount: number;
  readonly mode: "GNSS未選択" | "single GNSS" | "multi GNSS";
}

export interface GnssCarrierPhaseExample {
  readonly integerWavelengths: number;
  readonly fractionalWavelengths: number;
  readonly totalWavelengths: number;
}

export type GnssCorrectionFreshnessId = "fresh" | "delayed" | "stopped";

export type GnssAmbiguityEvaluationStageId =
  | "initial"
  | "comparison"
  | "fixed";

export type GnssCorrectionDiagnosticCaseId =
  | "no-rtcm-output"
  | "wrong-mountpoint"
  | "stale-rtcm"
  | "direct-link-receive-failure"
  | "rtcm-ok-float";
