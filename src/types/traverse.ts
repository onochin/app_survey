export type SurveyPointKind = "known" | "new";

export interface SurveyCoordinate {
  readonly x: number;
  readonly y: number;
}

export interface SurveyPoint {
  readonly id: string;
  readonly name: string;
  readonly coordinate: SurveyCoordinate;
  readonly kind: SurveyPointKind;
  readonly isFixed: boolean;
}

export interface TraverseLeg {
  readonly id: string;
  readonly fromPointId: string;
  readonly toPointId: string;
  readonly distance: number;
}

export interface AngleObservation {
  readonly id: string;
  readonly pointId: string;
  readonly angleDegrees: number;
}

/**
 * points、legs、angles は、閉合多角形をたどる順序で格納する。
 * angles[i] は points[i] における内角を表す。
 */
export interface TraverseObservation {
  readonly points: readonly SurveyPoint[];
  readonly legs: readonly TraverseLeg[];
  readonly angles: readonly AngleObservation[];
  readonly initialAzimuthDegrees: number;
  readonly startPointId: string;
}

export interface DmsAngle {
  readonly sign: 1 | -1;
  readonly degrees: number;
  readonly minutes: number;
  readonly seconds: number;
}

export interface AngularClosureResult {
  readonly observedSumDegrees: number;
  readonly theoreticalSumDegrees: number;
  readonly closureDegrees: number;
}

export interface AngleAdjustmentResult {
  readonly closure: AngularClosureResult;
  readonly observedAnglesDegrees: readonly number[];
  readonly correctionsDegrees: readonly number[];
  readonly adjustedAnglesDegrees: readonly number[];
}

export interface CoordinateIncrement {
  readonly legId: string;
  readonly fromPointId: string;
  readonly toPointId: string;
  readonly distance: number;
  readonly azimuthDegrees: number;
  readonly deltaX: number;
  readonly deltaY: number;
}

export interface ClosureResult {
  readonly fx: number;
  readonly fy: number;
  readonly linearClosure: number;
  readonly totalDistance: number;
  readonly closureRatio: number | null;
  readonly isNearlyClosed: boolean;
}

export interface AdjustedCoordinateIncrement {
  readonly legId: string;
  readonly fromPointId: string;
  readonly toPointId: string;
  readonly distance: number;
  readonly azimuthDegrees: number;
  readonly originalDeltaX: number;
  readonly originalDeltaY: number;
  readonly correctionX: number;
  readonly correctionY: number;
  readonly adjustedDeltaX: number;
  readonly adjustedDeltaY: number;
}

export interface AdjustedCoordinate {
  readonly pointId: string;
  readonly x: number;
  readonly y: number;
  readonly sourceLegId: string | null;
}

export type CalculationStepStatus =
  | "pending"
  | "current"
  | "completed"
  | "error";

export interface CalculationStep {
  readonly id: string;
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly formula: string;
  readonly substitution?: string;
  readonly result?: string;
  readonly reason: string;
  readonly commonMistake: string;
  readonly status: CalculationStepStatus;
}
