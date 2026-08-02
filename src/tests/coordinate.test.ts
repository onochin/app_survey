import { describe, expect, it } from "vitest";
import type { TraverseLeg } from "../types/traverse";
import {
  calculateCoordinateInverse,
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

  it("calculates inverse azimuths for cardinal directions and every quadrant", () => {
    const from = { x: 1_000, y: 500 };
    const cases = [
      { deltaX: 10, deltaY: 0, azimuth: 0 },
      { deltaX: 10, deltaY: 10, azimuth: 45 },
      { deltaX: 0, deltaY: 10, azimuth: 90 },
      { deltaX: -10, deltaY: 10, azimuth: 135 },
      { deltaX: -10, deltaY: 0, azimuth: 180 },
      { deltaX: -10, deltaY: -10, azimuth: 225 },
      { deltaX: 0, deltaY: -10, azimuth: 270 },
      { deltaX: 10, deltaY: -10, azimuth: 315 },
    ] as const;

    for (const testCase of cases) {
      const result = calculateCoordinateInverse(from, {
        x: from.x + testCase.deltaX,
        y: from.y + testCase.deltaY,
      });

      expect(result.deltaX).toBe(testCase.deltaX);
      expect(result.deltaY).toBe(testCase.deltaY);
      expect(result.distance).toBeCloseTo(
        Math.hypot(testCase.deltaX, testCase.deltaY),
        12,
      );
      expect(result.azimuthDegrees).toBeCloseTo(testCase.azimuth, 12);
    }
  });

  it("round-trips forward coordinate increments through the inverse calculation", () => {
    const start = { x: 2_000.25, y: -350.75 };

    for (const azimuth of [0, 45, 123.456, 270, 315, -45, 725]) {
      const increment = calculateCoordinateIncrement(
        createLeg(0, 73.25),
        azimuth,
      );
      const inverse = calculateCoordinateInverse(start, {
        x: start.x + increment.deltaX,
        y: start.y + increment.deltaY,
      });

      expect(inverse.distance).toBeCloseTo(73.25, 10);
      expect(inverse.azimuthDegrees).toBeCloseTo(
        increment.azimuthDegrees,
        10,
      );
      expect(inverse.azimuthDegrees).toBeGreaterThanOrEqual(0);
      expect(inverse.azimuthDegrees).toBeLessThan(360);
    }
  });

  it("returns distance zero and no azimuth for coincident points", () => {
    expect(
      calculateCoordinateInverse(
        { x: 1_000, y: 500 },
        { x: 1_000, y: 500 },
      ),
    ).toEqual({
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      azimuthDegrees: null,
    });
  });

  it("rejects non-positive or non-finite distances and non-finite coordinates", () => {
    expect(() =>
      calculateCoordinateIncrement(createLeg(0, 0), 0),
    ).toThrow(RangeError);
    expect(() =>
      calculateCoordinateIncrement(createLeg(0, -1), 0),
    ).toThrow(RangeError);
    expect(() =>
      calculateCoordinateIncrement(createLeg(0, Number.NaN), 0),
    ).toThrow(RangeError);
    expect(() =>
      calculateCoordinateIncrement(createLeg(0), Number.POSITIVE_INFINITY),
    ).toThrow(TypeError);
    expect(() =>
      calculateCoordinateInverse(
        { x: Number.NaN, y: 0 },
        { x: 1, y: 1 },
      ),
    ).toThrow(TypeError);
  });
});
