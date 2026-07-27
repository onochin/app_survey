import { describe, expect, it } from "vitest";
import {
  calculateAzimuthClosureError,
  calculateClosedTraverseAzimuths,
  calculateNextAzimuth,
} from "../calculations/azimuth";

describe("azimuth calculations", () => {
  it("calculates the next clockwise traverse azimuth", () => {
    expect(calculateNextAzimuth(30, 120)).toBe(90);
    expect(calculateNextAzimuth(350, 100)).toBe(70);
  });

  it("calculates and normalizes every leg azimuth", () => {
    const azimuths = calculateClosedTraverseAzimuths(
      30,
      [120, 120, 120, 120, 120, 120],
    );

    expect(azimuths).toEqual([30, 90, 150, 210, 270, 330]);
  });

  it("returns zero azimuth closure error for corrected interior angles", () => {
    expect(
      calculateAzimuthClosureError(
        30,
        [120, 120, 120, 120, 120, 120],
      ),
    ).toBeCloseTo(0, 12);
  });
});
