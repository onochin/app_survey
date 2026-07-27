import type {
  ClosureResult,
  CoordinateIncrement,
} from "../types/traverse";

export type ClosureComponent = Pick<
  CoordinateIncrement,
  "distance" | "deltaX" | "deltaY"
>;

function assertClosureComponent(
  component: ClosureComponent,
  index: number,
): void {
  if (!Number.isFinite(component.distance) || component.distance <= 0) {
    throw new RangeError(
      `increments[${index}].distance must be a finite number greater than 0.`,
    );
  }

  if (
    !Number.isFinite(component.deltaX) ||
    !Number.isFinite(component.deltaY)
  ) {
    throw new TypeError(
      `increments[${index}] must contain finite coordinate increments.`,
    );
  }
}

export function calculateCoordinateClosure(
  increments: readonly ClosureComponent[],
  nearlyClosedTolerance = 1e-10,
): ClosureResult {
  if (increments.length === 0) {
    throw new RangeError("At least one coordinate increment is required.");
  }

  if (
    !Number.isFinite(nearlyClosedTolerance) ||
    nearlyClosedTolerance < 0
  ) {
    throw new RangeError(
      "nearlyClosedTolerance must be a finite non-negative number.",
    );
  }

  increments.forEach(assertClosureComponent);

  const totalDistance = increments.reduce(
    (total, increment) => total + increment.distance,
    0,
  );
  const fx = increments.reduce(
    (total, increment) => total + increment.deltaX,
    0,
  );
  const fy = increments.reduce(
    (total, increment) => total + increment.deltaY,
    0,
  );
  const linearClosure = Math.hypot(fx, fy);
  const isNearlyClosed = linearClosure <= nearlyClosedTolerance;

  return {
    fx,
    fy,
    linearClosure,
    totalDistance,
    closureRatio: isNearlyClosed ? null : totalDistance / linearClosure,
    isNearlyClosed,
  };
}
