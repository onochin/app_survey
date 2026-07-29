import { describe, expect, it } from "vitest";
import {
  calculateAdjustedCoordinateClosure,
} from "../calculations/adjustment";
import { calculateTraverse } from "../calculations/traverse";
import { traverseSample } from "../data/traverseSample";

describe("complete traverse calculation", () => {
  it("calculates all Phase 3 results from the sample", () => {
    const result = calculateTraverse(traverseSample);

    expect(result.angleAdjustmentMode).toBe("whole-seconds");
    expect(
      result.angleAdjustment.closure.closureDegrees * 3_600,
    ).toBeCloseTo(12, 8);
    result.angleAdjustment.correctionsDegrees.forEach((correction) => {
      expect(correction * 3_600).toBeCloseTo(-2, 8);
    });
    expect(result.azimuthsDegrees[0]).toBeCloseTo(45, 12);
    expect(result.increments).toHaveLength(6);
    expect(result.adjustedIncrements).toHaveLength(6);
  });

  it("closes after compass-rule adjustment and returns to A", () => {
    const result = calculateTraverse(traverseSample);
    const adjustedClosure = calculateAdjustedCoordinateClosure(
      result.adjustedIncrements,
    );
    const finalCoordinate = result.adjustedCoordinates.at(-1);

    expect(adjustedClosure.fx).toBeCloseTo(0, 10);
    expect(adjustedClosure.fy).toBeCloseTo(0, 10);
    expect(finalCoordinate?.pointId).toBe("a");
    expect(finalCoordinate?.x).toBeCloseTo(1_000, 10);
    expect(finalCoordinate?.y).toBeCloseTo(1_000, 10);
  });

  it("keeps the unadjusted endpoint equal to the coordinate closure", () => {
    const result = calculateTraverse(traverseSample);
    const unadjustedEnd = result.unadjustedCoordinates.at(-1)!;

    expect(unadjustedEnd.x - 1_000).toBeCloseTo(
      result.closure.fx,
      10,
    );
    expect(unadjustedEnd.y - 1_000).toBeCloseTo(
      result.closure.fy,
      10,
    );
  });

  it("falls back to unrounded decimal-degree correction", () => {
    const observation = {
      ...traverseSample,
      angles: traverseSample.angles.map((angle, index) =>
        index === 0
          ? {
              ...angle,
              angleDegrees: angle.angleDegrees + 0.1 / 3_600,
            }
          : angle,
      ),
    };
    const result = calculateTraverse(observation);

    expect(result.angleAdjustmentMode).toBe("decimal-degrees");
    expect(
      result.angleAdjustment.adjustedAnglesDegrees.reduce(
        (total, angle) => total + angle,
        0,
      ),
    ).toBeCloseTo(720, 10);
  });

  it("rejects a traverse with a broken leg order", () => {
    const observation = {
      ...traverseSample,
      legs: traverseSample.legs.map((leg, index) =>
        index === 0
          ? { ...leg, toPointId: "p2" }
          : leg,
      ),
    };

    expect(() => calculateTraverse(observation)).toThrow(RangeError);
  });
});
