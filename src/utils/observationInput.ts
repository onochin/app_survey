import type {
  SurveyPoint,
  TraverseObservation,
} from "../types/traverse";

export interface ObservationDrafts {
  readonly initialAzimuth: string;
  readonly anglesByPointId: Readonly<Record<string, string>>;
  readonly distancesByLegId: Readonly<Record<string, string>>;
}

export interface ObservationInputValidation {
  readonly isValid: boolean;
  readonly initialAzimuthError: string | null;
  readonly angleErrorsByPointId: Readonly<Record<string, string>>;
  readonly distanceErrorsByLegId: Readonly<Record<string, string>>;
}

function parseDraft(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function createObservationDrafts(
  observation: TraverseObservation,
): ObservationDrafts {
  return {
    initialAzimuth: String(observation.initialAzimuthDegrees),
    anglesByPointId: Object.fromEntries(
      observation.angles.map((angle) => [
        angle.pointId,
        String(angle.angleDegrees),
      ]),
    ),
    distancesByLegId: Object.fromEntries(
      observation.legs.map((leg) => [leg.id, String(leg.distance)]),
    ),
  };
}

export function validateObservationDrafts(
  observation: TraverseObservation,
  drafts: ObservationDrafts,
): ObservationInputValidation {
  const angleErrorsByPointId: Record<string, string> = {};
  const distanceErrorsByLegId: Record<string, string> = {};
  const initialAzimuth = parseDraft(drafts.initialAzimuth);
  let initialAzimuthError: string | null = null;

  if (initialAzimuth === null) {
    initialAzimuthError = "初期方位角を数値で入力してください。";
  } else if (initialAzimuth < 0 || initialAzimuth >= 360) {
    initialAzimuthError =
      "初期方位角は0°以上360°未満で入力してください。";
  }

  observation.angles.forEach((angle) => {
    const parsed = parseDraft(drafts.anglesByPointId[angle.pointId] ?? "");

    if (parsed === null) {
      angleErrorsByPointId[angle.pointId] =
        "観測内角を数値で入力してください。";
    } else if (parsed <= 0 || parsed >= 360) {
      angleErrorsByPointId[angle.pointId] =
        "観測内角は0°より大きく360°未満で入力してください。";
    }
  });

  observation.legs.forEach((leg) => {
    const parsed = parseDraft(drafts.distancesByLegId[leg.id] ?? "");

    if (parsed === null) {
      distanceErrorsByLegId[leg.id] =
        "観測距離を数値で入力してください。";
    } else if (parsed <= 0) {
      distanceErrorsByLegId[leg.id] =
        "観測距離は0より大きい値で入力してください。";
    }
  });

  return {
    isValid:
      initialAzimuthError === null &&
      Object.keys(angleErrorsByPointId).length === 0 &&
      Object.keys(distanceErrorsByLegId).length === 0,
    initialAzimuthError,
    angleErrorsByPointId,
    distanceErrorsByLegId,
  };
}

export function buildObservationFromDrafts(
  template: TraverseObservation,
  points: readonly SurveyPoint[],
  drafts: ObservationDrafts,
): TraverseObservation {
  const validation = validateObservationDrafts(template, drafts);

  if (!validation.isValid) {
    throw new RangeError("Observation drafts are invalid.");
  }

  return {
    ...template,
    points,
    initialAzimuthDegrees: Number(drafts.initialAzimuth),
    angles: template.angles.map((angle) => ({
      ...angle,
      angleDegrees: Number(drafts.anglesByPointId[angle.pointId]),
    })),
    legs: template.legs.map((leg) => ({
      ...leg,
      distance: Number(drafts.distancesByLegId[leg.id]),
    })),
  };
}
