import { describe, expect, it } from "vitest";
import type {
  CoordinateIncrement,
  SurveyPoint,
} from "../types/traverse";
import {
  applyCompassRule,
  calculateAdjustedCoordinateClosure,
} from "../calculations/adjustment";
import { accumulateAdjustedCoordinates } from "../calculations/coordinate";

const increments: CoordinateIncrement[] = [
  {
    legId: "L1",
    fromPointId: "A",
    toPointId: "P1",
    distance: 100,
    azimuthDegrees: 0,
    deltaX: 100,
    deltaY: 0,
  },
  {
    legId: "L2",
    fromPointId: "P1",
    toPointId: "P2",
    distance: 100,
    azimuthDegrees: 90,
    deltaX: 0,
    deltaY: 100,
  },
  {
    legId: "L3",
    fromPointId: "P2",
    toPointId: "P3",
    distance: 100,
    azimuthDegrees: 180,
    deltaX: -99,
    deltaY: 0,
  },
  {
    legId: "L4",
    fromPointId: "P3",
    toPointId: "A",
    distance: 100,
    azimuthDegrees: 270,
    deltaX: 0,
    deltaY: -100.5,
  },
];

describe("compass rule adjustment", () => {
  it("distributes fx and fy in proportion to each leg length", () => {
    const adjusted = applyCompassRule(increments);

    adjusted.forEach((increment) => {
      expect(increment.correctionX).toBeCloseTo(-0.25, 12);
      expect(increment.correctionY).toBeCloseTo(0.125, 12);
    });
  });

  it("closes after applying coordinate corrections", () => {
    const adjusted = applyCompassRule(increments);
    const closure = calculateAdjustedCoordinateClosure(adjusted);

    expect(closure.fx).toBeCloseTo(0, 12);
    expect(closure.fy).toBeCloseTo(0, 12);
    expect(closure.linearClosure).toBeLessThanOrEqual(1e-10);
    expect(closure.isNearlyClosed).toBe(true);
    expect(closure.closureRatio).toBeNull();
  });

  it("accumulates adjusted coordinates from the known start point", () => {
    const startPoint: SurveyPoint = {
      id: "A",
      name: "A",
      coordinate: { x: 1_000, y: 1_000 },
      kind: "known",
      isFixed: true,
    };
    const coordinates = accumulateAdjustedCoordinates(
      startPoint,
      applyCompassRule(increments),
    );

    expect(coordinates).toHaveLength(5);
    expect(coordinates[0]).toMatchObject({
      pointId: "A",
      x: 1_000,
      y: 1_000,
      sourceLegId: null,
    });
    expect(coordinates.at(-1)?.pointId).toBe("A");
    expect(coordinates.at(-1)?.x).toBeCloseTo(1_000, 12);
    expect(coordinates.at(-1)?.y).toBeCloseTo(1_000, 12);
  });
});
