import { describe, expect, it } from "vitest";
import { traverseSample } from "../data/traverseSample";
import {
  buildObservationFromDrafts,
  createObservationDrafts,
  validateObservationDrafts,
} from "../utils/observationInput";

describe("observation input", () => {
  it("creates valid decimal-degree drafts from the sample", () => {
    const drafts = createObservationDrafts(traverseSample);
    const validation = validateObservationDrafts(
      traverseSample,
      drafts,
    );

    expect(validation.isValid).toBe(true);
    expect(drafts.initialAzimuth).toBe("45");
    expect(drafts.distancesByLegId["a-p1"]).toBe("141.438");
  });

  it("returns Japanese messages for invalid fields", () => {
    const source = createObservationDrafts(traverseSample);
    const drafts = {
      ...source,
      initialAzimuth: "360",
      anglesByPointId: {
        ...source.anglesByPointId,
        p1: "",
      },
      distancesByLegId: {
        ...source.distancesByLegId,
        "p1-p2": "0",
      },
    };
    const validation = validateObservationDrafts(
      traverseSample,
      drafts,
    );

    expect(validation.isValid).toBe(false);
    expect(validation.initialAzimuthError).toContain(
      "0°以上360°未満",
    );
    expect(validation.angleErrorsByPointId.p1).toContain("数値");
    expect(validation.distanceErrorsByLegId["p1-p2"]).toContain(
      "0より大きい",
    );
  });

  it("builds an observation without changing the theoretical points", () => {
    const source = createObservationDrafts(traverseSample);
    const drafts = {
      ...source,
      initialAzimuth: "46.25",
      anglesByPointId: {
        ...source.anglesByPointId,
        p2: "152.25",
      },
      distancesByLegId: {
        ...source.distancesByLegId,
        "a-p1": "142.5",
      },
    };
    const movedPoints = traverseSample.points.map((point) =>
      point.id === "p3"
        ? {
            ...point,
            coordinate: {
              x: point.coordinate.x + 5,
              y: point.coordinate.y - 5,
            },
          }
        : point,
    );
    const observation = buildObservationFromDrafts(
      traverseSample,
      movedPoints,
      drafts,
    );

    expect(observation.initialAzimuthDegrees).toBe(46.25);
    expect(observation.angles[2]?.angleDegrees).toBe(152.25);
    expect(observation.legs[0]?.distance).toBe(142.5);
    expect(observation.points[3]?.coordinate).toEqual({
      x: 1_075,
      y: 1_375,
    });
    expect(traverseSample.points[3]?.coordinate).toEqual({
      x: 1_070,
      y: 1_380,
    });
  });
});
