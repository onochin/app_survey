import type {
  AdjustedCoordinateIncrement,
  ClosureResult,
  CoordinateIncrement,
} from "../types/traverse";
import { calculateCoordinateClosure } from "./closure";

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function applyCompassRule(
  increments: readonly CoordinateIncrement[],
): AdjustedCoordinateIncrement[] {
  const closure = calculateCoordinateClosure(increments);

  const adjusted = increments.map((increment) => {
    const lengthRatio = increment.distance / closure.totalDistance;
    const correctionX = -closure.fx * lengthRatio;
    const correctionY = -closure.fy * lengthRatio;

    return {
      legId: increment.legId,
      fromPointId: increment.fromPointId,
      toPointId: increment.toPointId,
      distance: increment.distance,
      azimuthDegrees: increment.azimuthDegrees,
      originalDeltaX: increment.deltaX,
      originalDeltaY: increment.deltaY,
      correctionX,
      correctionY,
      adjustedDeltaX: increment.deltaX + correctionX,
      adjustedDeltaY: increment.deltaY + correctionY,
    };
  });

  // 浮動小数点演算だけに由来する最終残差を最後の辺へ加える。
  const correctionResidualX =
    -closure.fx - sum(adjusted.map(({ correctionX }) => correctionX));
  const correctionResidualY =
    -closure.fy - sum(adjusted.map(({ correctionY }) => correctionY));
  const lastIndex = adjusted.length - 1;
  const last = adjusted[lastIndex]!;

  adjusted[lastIndex] = {
    ...last,
    correctionX: last.correctionX + correctionResidualX,
    correctionY: last.correctionY + correctionResidualY,
    adjustedDeltaX: last.adjustedDeltaX + correctionResidualX,
    adjustedDeltaY: last.adjustedDeltaY + correctionResidualY,
  };

  return adjusted;
}

export function calculateAdjustedCoordinateClosure(
  adjustedIncrements: readonly AdjustedCoordinateIncrement[],
  nearlyClosedTolerance = 1e-10,
): ClosureResult {
  return calculateCoordinateClosure(
    adjustedIncrements.map((increment) => ({
      distance: increment.distance,
      deltaX: increment.adjustedDeltaX,
      deltaY: increment.adjustedDeltaY,
    })),
    nearlyClosedTolerance,
  );
}
