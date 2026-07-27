import { describe, expect, it } from "vitest";
import {
  adjustInteriorAnglesBySeconds,
  adjustInteriorAnglesEqually,
  calculateAngularClosure,
  calculateTheoreticalInteriorAngleSum,
  decimalDegreesToDms,
  degreesToRadians,
  dmsToDecimalDegrees,
  normalizeAzimuth,
} from "../calculations/angle";

describe("angle calculations", () => {
  it("converts degrees, minutes and seconds to decimal degrees", () => {
    const decimal = dmsToDecimalDegrees({
      sign: 1,
      degrees: 124,
      minutes: 35,
      seconds: 20,
    });

    expect(decimal).toBeCloseTo(124 + 35 / 60 + 20 / 3_600, 12);
  });

  it("round-trips a negative decimal degree value through DMS", () => {
    const source = -(12 + 20 / 60 + 44.4 / 3_600);
    const dms = decimalDegreesToDms(source, 1);

    expect(dms).toEqual({
      sign: -1,
      degrees: 12,
      minutes: 20,
      seconds: 44.4,
    });
    expect(dmsToDecimalDegrees(dms)).toBeCloseTo(source, 12);
  });

  it("normalizes azimuths to 0 degrees or greater and less than 360 degrees", () => {
    expect(normalizeAzimuth(-10)).toBe(350);
    expect(normalizeAzimuth(360)).toBe(0);
    expect(normalizeAzimuth(725)).toBe(5);
  });

  it("converts degrees to radians", () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 12);
  });

  it("calculates the theoretical interior angle sum", () => {
    expect(calculateTheoreticalInteriorAngleSum(3)).toBe(180);
    expect(calculateTheoreticalInteriorAngleSum(6)).toBe(720);
  });

  it("calculates the angular closure error", () => {
    const angles = [100, 110, 120, 130, 80 + 10 / 3_600];
    const result = calculateAngularClosure(angles);

    expect(result.observedSumDegrees).toBeCloseTo(540 + 10 / 3_600, 12);
    expect(result.theoreticalSumDegrees).toBe(540);
    expect(result.closureDegrees).toBeCloseTo(10 / 3_600, 12);
  });

  it("distributes the angular closure error equally without rounding", () => {
    const angles = [120 + 5 / 3_600, 120, 120, 120, 120, 120];
    const result = adjustInteriorAnglesEqually(angles);
    const expectedCorrection = -5 / 6 / 3_600;

    result.correctionsDegrees.forEach((correction) => {
      expect(correction).toBeCloseTo(expectedCorrection, 12);
    });
    expect(
      result.adjustedAnglesDegrees.reduce((total, angle) => total + angle, 0),
    ).toBeCloseTo(720, 12);
  });

  it("distributes whole-second residuals deterministically", () => {
    const angles = [120 + 5 / 3_600, 120, 120, 120, 120, 120];
    const result = adjustInteriorAnglesBySeconds(angles);
    const correctionsSeconds = result.correctionsDegrees.map(
      (correction) => Math.round(correction * 3_600),
    );

    expect(correctionsSeconds).toEqual([-1, -1, -1, -1, -1, 0]);
    expect(
      result.adjustedAnglesDegrees.reduce((total, angle) => total + angle, 0),
    ).toBeCloseTo(720, 12);
  });

  it("rejects an insufficient point count", () => {
    expect(() => calculateTheoreticalInteriorAngleSum(2)).toThrow(RangeError);
  });
});
