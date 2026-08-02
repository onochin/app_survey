import type {
  AdjustedCoordinate,
  AdjustedCoordinateIncrement,
  CoordinateIncrement,
  SurveyCoordinate,
  SurveyPoint,
  TraverseLeg,
} from "../types/traverse";
import { degreesToRadians, normalizeAzimuth } from "./angle";
import {
  calculateSurveyAzimuth,
  calculateSurveyDistance,
} from "./geometry";

export interface CoordinateInverseResult {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly distance: number;
  readonly azimuthDegrees: number | null;
}

function assertPositiveDistance(distance: number, name: string): void {
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new RangeError(`${name} must be a finite number greater than 0.`);
  }
}

export function calculateCoordinateIncrement(
  leg: TraverseLeg,
  azimuthDegrees: number,
): CoordinateIncrement {
  assertPositiveDistance(leg.distance, "leg.distance");

  const normalizedAzimuth = normalizeAzimuth(azimuthDegrees);
  const azimuthRadians = degreesToRadians(normalizedAzimuth);

  return {
    legId: leg.id,
    fromPointId: leg.fromPointId,
    toPointId: leg.toPointId,
    distance: leg.distance,
    azimuthDegrees: normalizedAzimuth,
    deltaX: leg.distance * Math.cos(azimuthRadians),
    deltaY: leg.distance * Math.sin(azimuthRadians),
  };
}

export function calculateCoordinateIncrements(
  legs: readonly TraverseLeg[],
  azimuthsDegrees: readonly number[],
): CoordinateIncrement[] {
  if (legs.length === 0) {
    throw new RangeError("At least one traverse leg is required.");
  }

  if (legs.length !== azimuthsDegrees.length) {
    throw new RangeError(
      "The number of traverse legs and azimuths must match.",
    );
  }

  return legs.map((leg, index) =>
    calculateCoordinateIncrement(leg, azimuthsDegrees[index]!),
  );
}

export function calculateCoordinateInverse(
  from: SurveyCoordinate,
  to: SurveyCoordinate,
): CoordinateInverseResult {
  const distance = calculateSurveyDistance(from, to);
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  return {
    deltaX,
    deltaY,
    distance,
    azimuthDegrees:
      distance === 0 ? null : calculateSurveyAzimuth(from, to),
  };
}

export function accumulateAdjustedCoordinates(
  startPoint: Pick<SurveyPoint, "id" | "coordinate">,
  increments: readonly AdjustedCoordinateIncrement[],
): AdjustedCoordinate[] {
  if (increments.length === 0) {
    throw new RangeError("At least one adjusted increment is required.");
  }

  if (
    !Number.isFinite(startPoint.coordinate.x) ||
    !Number.isFinite(startPoint.coordinate.y)
  ) {
    throw new TypeError("The start coordinate must contain finite numbers.");
  }

  const coordinates: AdjustedCoordinate[] = [
    {
      pointId: startPoint.id,
      x: startPoint.coordinate.x,
      y: startPoint.coordinate.y,
      sourceLegId: null,
    },
  ];

  let currentPointId = startPoint.id;
  let currentX = startPoint.coordinate.x;
  let currentY = startPoint.coordinate.y;

  increments.forEach((increment) => {
    if (increment.fromPointId !== currentPointId) {
      throw new RangeError(
        `Traverse legs are not contiguous at leg ${increment.legId}.`,
      );
    }

    if (
      !Number.isFinite(increment.adjustedDeltaX) ||
      !Number.isFinite(increment.adjustedDeltaY)
    ) {
      throw new TypeError(
        `Adjusted increments for leg ${increment.legId} must be finite.`,
      );
    }

    currentX += increment.adjustedDeltaX;
    currentY += increment.adjustedDeltaY;
    currentPointId = increment.toPointId;

    coordinates.push({
      pointId: currentPointId,
      x: currentX,
      y: currentY,
      sourceLegId: increment.legId,
    });
  });

  return coordinates;
}
