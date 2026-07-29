import type {
  AdjustedCoordinate,
  AdjustedCoordinateIncrement,
  AngleAdjustmentResult,
  ClosureResult,
  CoordinateIncrement,
  TraverseObservation,
} from "../types/traverse";
import {
  adjustInteriorAnglesBySeconds,
  adjustInteriorAnglesEqually,
} from "./angle";
import { applyCompassRule } from "./adjustment";
import { calculateClosedTraverseAzimuths } from "./azimuth";
import { calculateCoordinateClosure } from "./closure";
import {
  accumulateAdjustedCoordinates,
  calculateCoordinateIncrements,
} from "./coordinate";

export type AngleAdjustmentMode = "whole-seconds" | "decimal-degrees";

export interface TraverseCalculationResult {
  readonly observation: TraverseObservation;
  readonly angleAdjustment: AngleAdjustmentResult;
  readonly angleAdjustmentMode: AngleAdjustmentMode;
  readonly azimuthsDegrees: readonly number[];
  readonly increments: readonly CoordinateIncrement[];
  readonly closure: ClosureResult;
  readonly adjustedIncrements: readonly AdjustedCoordinateIncrement[];
  readonly unadjustedCoordinates: readonly AdjustedCoordinate[];
  readonly adjustedCoordinates: readonly AdjustedCoordinate[];
}

function validateObservationStructure(
  observation: TraverseObservation,
): void {
  const pointCount = observation.points.length;

  if (pointCount < 3) {
    throw new RangeError("A closed traverse requires at least three points.");
  }

  if (
    observation.legs.length !== pointCount ||
    observation.angles.length !== pointCount
  ) {
    throw new RangeError(
      "Points, legs and angle observations must have equal lengths.",
    );
  }

  if (observation.points[0]?.id !== observation.startPointId) {
    throw new RangeError("The first point must be the start point.");
  }

  if (!Number.isFinite(observation.initialAzimuthDegrees)) {
    throw new TypeError("The initial azimuth must be finite.");
  }

  observation.points.forEach((point, index) => {
    const next = observation.points[(index + 1) % pointCount]!;
    const leg = observation.legs[index]!;
    const angle = observation.angles[index]!;

    if (
      leg.fromPointId !== point.id ||
      leg.toPointId !== next.id ||
      angle.pointId !== point.id
    ) {
      throw new RangeError(`Traverse order is invalid at index ${index}.`);
    }
  });
}

function adjustAngles(
  anglesDegrees: readonly number[],
): {
  readonly result: AngleAdjustmentResult;
  readonly mode: AngleAdjustmentMode;
} {
  try {
    return {
      result: adjustInteriorAnglesBySeconds(anglesDegrees),
      mode: "whole-seconds",
    };
  } catch (error) {
    if (
      error instanceof RangeError &&
      error.message.includes("cannot be represented")
    ) {
      return {
        result: adjustInteriorAnglesEqually(anglesDegrees),
        mode: "decimal-degrees",
      };
    }

    throw error;
  }
}

function accumulateUnadjustedCoordinates(
  observation: TraverseObservation,
  increments: readonly CoordinateIncrement[],
): AdjustedCoordinate[] {
  const startPoint = observation.points.find(
    (point) => point.id === observation.startPointId,
  );

  if (startPoint === undefined) {
    throw new RangeError("The start point was not found.");
  }

  let currentPointId = startPoint.id;
  let x = startPoint.coordinate.x;
  let y = startPoint.coordinate.y;
  const coordinates: AdjustedCoordinate[] = [
    {
      pointId: startPoint.id,
      x,
      y,
      sourceLegId: null,
    },
  ];

  increments.forEach((increment) => {
    if (increment.fromPointId !== currentPointId) {
      throw new RangeError(
        `Traverse legs are not contiguous at leg ${increment.legId}.`,
      );
    }

    x += increment.deltaX;
    y += increment.deltaY;
    currentPointId = increment.toPointId;
    coordinates.push({
      pointId: currentPointId,
      x,
      y,
      sourceLegId: increment.legId,
    });
  });

  return coordinates;
}

export function calculateTraverse(
  observation: TraverseObservation,
): TraverseCalculationResult {
  validateObservationStructure(observation);

  const adjustedAngles = adjustAngles(
    observation.angles.map((angle) => angle.angleDegrees),
  );
  const azimuthsDegrees = calculateClosedTraverseAzimuths(
    observation.initialAzimuthDegrees,
    adjustedAngles.result.adjustedAnglesDegrees,
  );
  const increments = calculateCoordinateIncrements(
    observation.legs,
    azimuthsDegrees,
  );
  const closure = calculateCoordinateClosure(increments);
  const adjustedIncrements = applyCompassRule(increments);
  const startPoint = observation.points[0]!;
  const unadjustedCoordinates = accumulateUnadjustedCoordinates(
    observation,
    increments,
  );
  const adjustedCoordinates = accumulateAdjustedCoordinates(
    startPoint,
    adjustedIncrements,
  );

  return {
    observation,
    angleAdjustment: adjustedAngles.result,
    angleAdjustmentMode: adjustedAngles.mode,
    azimuthsDegrees,
    increments,
    closure,
    adjustedIncrements,
    unadjustedCoordinates,
    adjustedCoordinates,
  };
}
