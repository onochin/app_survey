import { describe, expect, it } from "vitest";
import type { TraverseLeg } from "../types/traverse";
import {
  calculateCoordinateIncrement,
  calculateCoordinateIncrements,
} from "../calculations/coordinate";
import { calculateCoordinateClosure } from "../calculations/closure";

function createLeg(index: number, distance = 100): TraverseLeg {
  return {
    id: `L${index}`,
    fromPointId: `P${index}`,
    toPointId: `P${index + 1}`,
    distance,
  };
}

describe("coordinate calculations", () => {
  it("calculates northing and easting increments from survey azimuths", () => {
    const north = calculateCoordinateIncrement(createLeg(0), 0);
    const east = calculateCoordinateIncrement(createLeg(1), 90);
    const south = calculateCoordinateIncrement(createLeg(2), 180);
    const west = calculateCoordinateIncrement(createLeg(3), 270);

    expect(north.deltaX).toBeCloseTo(100, 12);
    expect(north.deltaY).toBeCloseTo(0, 12);
    expect(east.deltaX).toBeCloseTo(0, 12);
    expect(east.deltaY).toBeCloseTo(100, 12);
    expect(south.deltaX).toBeCloseTo(-100, 12);
    expect(south.deltaY).toBeCloseTo(0, 12);
    expect(west.deltaX).toBeCloseTo(0, 12);
    expect(west.deltaY).toBeCloseTo(-100, 12);
  });

  it("calculates a nearly perfect coordinate closure without dividing by zero", () => {
    const legs = [createLeg(0), createLeg(1), createLeg(2), createLeg(3)];
    const increments = calculateCoordinateIncrements(
      legs,
      [0, 90, 180, 270],
    );
    const closure = calculateCoordinateClosure(increments);

    expect(closure.fx).toBeCloseTo(0, 10);
    expect(closure.fy).toBeCloseTo(0, 10);
    expect(closure.linearClosure).toBeLessThanOrEqual(1e-10);
    expect(closure.isNearlyClosed).toBe(true);
    expect(closure.closureRatio).toBeNull();
  });

  it("calculates fx, fy, the combined closure and closure ratio", () => {
    const increments = [
      {
        distance: 100,
        deltaX: 100,
        deltaY: 0,
      },
      {
        distance: 100,
        deltaX: 0,
        deltaY: 100,
      },
      {
        distance: 100,
        deltaX: -99,
        deltaY: 0,
      },
      {
        distance: 100,
        deltaX: 0,
        deltaY: -100.5,
      },
    ];
    const closure = calculateCoordinateClosure(increments);

    expect(closure.fx).toBeCloseTo(1, 12);
    expect(closure.fy).toBeCloseTo(-0.5, 12);
    expect(closure.linearClosure).toBeCloseTo(Math.hypot(1, -0.5), 12);
    expect(closure.closureRatio).toBeCloseTo(
      400 / Math.hypot(1, -0.5),
      12,
    );
  });

  it("rejects a non-positive distance", () => {
    expect(() =>
      calculateCoordinateIncrement(createLeg(0, 0), 0),
    ).toThrow(RangeError);
  });
});
