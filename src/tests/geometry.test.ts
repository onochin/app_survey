import { describe, expect, it } from "vitest";
import {
  calculateSurveyAzimuth,
  calculateTheoreticalTraverseGeometry,
  clampSvgCoordinate,
  clientToSvgCoordinate,
  createSurveySvgTransform,
  hasSelfIntersectingEdges,
  surveyToSvgCoordinate,
  svgToSurveyCoordinate,
} from "../calculations/geometry";
import { traverseSample } from "../data/traverseSample";
import {
  CLOSURE_VECTOR_DISPLAY_MULTIPLIER,
  createClosureVectorPlot,
} from "../utils/closureVector";

const bounds = {
  left: 92,
  right: 724,
  top: 74,
  bottom: 414,
} as const;

describe("traverse geometry", () => {
  it("calculates theoretical distances and clockwise interior angles", () => {
    const geometry = calculateTheoreticalTraverseGeometry(
      traverseSample.points,
      traverseSample.legs,
      traverseSample.angles,
    );
    const angleSum = geometry.angles.reduce(
      (total, angle) => total + angle.angleDegrees,
      0,
    );

    expect(geometry.legs[0]?.distance).toBeCloseTo(
      Math.hypot(100, 100),
      12,
    );
    expect(geometry.angles[0]?.angleDegrees).toBeCloseTo(
      71.565051177,
      8,
    );
    expect(angleSum).toBeCloseTo(720, 10);
    expect(
      calculateSurveyAzimuth(
        traverseSample.points[0]!.coordinate,
        traverseSample.points[1]!.coordinate,
      ),
    ).toBeCloseTo(45, 12);
  });

  it("updates theoretical geometry without changing observed values", () => {
    const movedPoints = traverseSample.points.map((point) =>
      point.id === "p1"
        ? {
            ...point,
            coordinate: {
              x: point.coordinate.x + 10,
              y: point.coordinate.y,
            },
          }
        : point,
    );
    const geometry = calculateTheoreticalTraverseGeometry(
      movedPoints,
      traverseSample.legs,
      traverseSample.angles,
    );

    expect(geometry.legs[0]?.distance).not.toBeCloseTo(
      traverseSample.legs[0]!.distance,
      3,
    );
    expect(traverseSample.legs[0]?.distance).toBe(141.438);
    expect(traverseSample.angles[1]?.angleDegrees).toBeCloseTo(
      143 + 7 / 60 + 46 / 3_600,
      12,
    );
  });

  it("round-trips survey and SVG coordinates", () => {
    const transform = createSurveySvgTransform(
      traverseSample.points,
      bounds,
    );

    traverseSample.points.forEach((point) => {
      const restored = svgToSurveyCoordinate(
        surveyToSvgCoordinate(point.coordinate, transform),
        transform,
      );

      expect(restored.x).toBeCloseTo(point.coordinate.x, 12);
      expect(restored.y).toBeCloseTo(point.coordinate.y, 12);
    });
  });

  it("converts client coordinates and clamps them to the plot", () => {
    const svg = clientToSvgCoordinate(
      { x: 500, y: 300 },
      { left: 100, top: 50, width: 800, height: 400 },
      800,
      400,
    );

    expect(svg).toEqual({ x: 400, y: 250 });
    expect(
      clampSvgCoordinate({ x: 900, y: 20 }, bounds),
    ).toEqual({ x: 724, y: 74 });
  });

  it("rejects an SVG conversion with zero display size", () => {
    expect(() =>
      clientToSvgCoordinate(
        { x: 0, y: 0 },
        { left: 0, top: 0, width: 0, height: 100 },
        900,
        500,
      ),
    ).toThrow(RangeError);
  });

  it("detects crossed non-adjacent traverse edges", () => {
    const simplePolygon = [
      { coordinate: { x: 0, y: 0 } },
      { coordinate: { x: 2, y: 0 } },
      { coordinate: { x: 2, y: 2 } },
      { coordinate: { x: 0, y: 2 } },
    ];
    const crossedPolygon = [
      simplePolygon[0]!,
      simplePolygon[2]!,
      simplePolygon[1]!,
      simplePolygon[3]!,
    ];

    expect(hasSelfIntersectingEdges(simplePolygon)).toBe(false);
    expect(hasSelfIntersectingEdges(crossedPolygon)).toBe(true);
  });

  it("maps north and east closure components into a 100x SVG vector", () => {
    const plot = createClosureVectorPlot({
      fx: 0.01,
      fy: 0.02,
      linearClosure: Math.hypot(0.01, 0.02),
    });

    expect(CLOSURE_VECTOR_DISPLAY_MULTIPLIER).toBe(100);
    expect(plot.calculated.x).toBeGreaterThan(plot.target.x);
    expect(plot.calculated.y).toBeLessThan(plot.target.y);
    expect(plot.fxEnd.x).toBe(plot.target.x);
    expect(plot.fyEnd.y).toBe(plot.target.y);
    expect(plot.isAutoFitted).toBe(false);
  });

  it("auto-fits only an unusually large closure vector", () => {
    const plot = createClosureVectorPlot({
      fx: 10,
      fy: -10,
      linearClosure: Math.hypot(10, -10),
    });

    expect(plot.isAutoFitted).toBe(true);
    expect(plot.fitRatio).toBeGreaterThan(0);
    expect(plot.fitRatio).toBeLessThan(1);
  });
});
