import type {
  AngleObservation,
  SurveyCoordinate,
  SurveyPoint,
  TraverseLeg,
} from "../types/traverse";
import { normalizeAzimuth } from "./angle";

export interface SvgCoordinate {
  readonly x: number;
  readonly y: number;
}

export interface SvgPlotBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface SurveySvgTransform {
  readonly minNorth: number;
  readonly maxNorth: number;
  readonly minEast: number;
  readonly maxEast: number;
  readonly scale: number;
  readonly originX: number;
  readonly originY: number;
  readonly bounds: SvgPlotBounds;
}

export interface TheoreticalTraverseGeometry {
  readonly points: readonly SurveyPoint[];
  readonly legs: readonly TraverseLeg[];
  readonly angles: readonly AngleObservation[];
}

interface ClientRectSize {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function assertCoordinate(
  coordinate: SurveyCoordinate,
  name: string,
): void {
  assertFinite(coordinate.x, `${name}.x`);
  assertFinite(coordinate.y, `${name}.y`);
}

const INTERSECTION_EPSILON = 1e-9;

function crossProduct(
  start: SurveyCoordinate,
  end: SurveyCoordinate,
  point: SurveyCoordinate,
): number {
  return (
    (end.x - start.x) * (point.y - start.y) -
    (end.y - start.y) * (point.x - start.x)
  );
}

function isPointOnSegment(
  point: SurveyCoordinate,
  start: SurveyCoordinate,
  end: SurveyCoordinate,
): boolean {
  return (
    Math.abs(crossProduct(start, end, point)) <=
      INTERSECTION_EPSILON &&
    point.x >= Math.min(start.x, end.x) - INTERSECTION_EPSILON &&
    point.x <= Math.max(start.x, end.x) + INTERSECTION_EPSILON &&
    point.y >= Math.min(start.y, end.y) - INTERSECTION_EPSILON &&
    point.y <= Math.max(start.y, end.y) + INTERSECTION_EPSILON
  );
}

function segmentsIntersect(
  firstStart: SurveyCoordinate,
  firstEnd: SurveyCoordinate,
  secondStart: SurveyCoordinate,
  secondEnd: SurveyCoordinate,
): boolean {
  const firstToSecondStart = crossProduct(
    firstStart,
    firstEnd,
    secondStart,
  );
  const firstToSecondEnd = crossProduct(
    firstStart,
    firstEnd,
    secondEnd,
  );
  const secondToFirstStart = crossProduct(
    secondStart,
    secondEnd,
    firstStart,
  );
  const secondToFirstEnd = crossProduct(
    secondStart,
    secondEnd,
    firstEnd,
  );

  if (
    ((firstToSecondStart > INTERSECTION_EPSILON &&
      firstToSecondEnd < -INTERSECTION_EPSILON) ||
      (firstToSecondStart < -INTERSECTION_EPSILON &&
        firstToSecondEnd > INTERSECTION_EPSILON)) &&
    ((secondToFirstStart > INTERSECTION_EPSILON &&
      secondToFirstEnd < -INTERSECTION_EPSILON) ||
      (secondToFirstStart < -INTERSECTION_EPSILON &&
        secondToFirstEnd > INTERSECTION_EPSILON))
  ) {
    return true;
  }

  return (
    isPointOnSegment(secondStart, firstStart, firstEnd) ||
    isPointOnSegment(secondEnd, firstStart, firstEnd) ||
    isPointOnSegment(firstStart, secondStart, secondEnd) ||
    isPointOnSegment(firstEnd, secondStart, secondEnd)
  );
}

/**
 * 閉合多角形の隣接しない辺同士が交差しているかを判定する。
 * 隣接辺が共有する端点は交差として扱わない。
 */
export function hasSelfIntersectingEdges(
  points: readonly Pick<SurveyPoint, "coordinate">[],
): boolean {
  if (points.length < 4) {
    return false;
  }

  points.forEach((point, index) => {
    assertCoordinate(point.coordinate, `points[${index}].coordinate`);
  });

  for (let firstIndex = 0; firstIndex < points.length; firstIndex += 1) {
    const firstEndIndex = (firstIndex + 1) % points.length;
    const firstStart = points[firstIndex]!.coordinate;
    const firstEnd = points[firstEndIndex]!.coordinate;

    for (
      let secondIndex = firstIndex + 1;
      secondIndex < points.length;
      secondIndex += 1
    ) {
      const secondEndIndex = (secondIndex + 1) % points.length;
      const sharesEndpoint =
        firstIndex === secondIndex ||
        firstIndex === secondEndIndex ||
        firstEndIndex === secondIndex ||
        firstEndIndex === secondEndIndex;

      if (sharesEndpoint) {
        continue;
      }

      if (
        segmentsIntersect(
          firstStart,
          firstEnd,
          points[secondIndex]!.coordinate,
          points[secondEndIndex]!.coordinate,
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export function calculateSurveyDistance(
  from: SurveyCoordinate,
  to: SurveyCoordinate,
): number {
  assertCoordinate(from, "from");
  assertCoordinate(to, "to");

  return Math.hypot(to.x - from.x, to.y - from.y);
}

export function calculateSurveyAzimuth(
  from: SurveyCoordinate,
  to: SurveyCoordinate,
): number {
  const distance = calculateSurveyDistance(from, to);

  if (distance === 0) {
    throw new RangeError("An azimuth cannot be calculated for coincident points.");
  }

  const deltaNorth = to.x - from.x;
  const deltaEast = to.y - from.y;

  return normalizeAzimuth(
    (Math.atan2(deltaEast, deltaNorth) * 180) / Math.PI,
  );
}

/**
 * 時計回りの巡回順に並ぶ3点から、中央点の内角を求める。
 */
export function calculateClockwiseInteriorAngle(
  previous: SurveyCoordinate,
  current: SurveyCoordinate,
  next: SurveyCoordinate,
): number {
  const incomingAzimuth = calculateSurveyAzimuth(previous, current);
  const outgoingAzimuth = calculateSurveyAzimuth(current, next);
  const angle = normalizeAzimuth(
    incomingAzimuth + 180 - outgoingAzimuth,
  );

  if (angle === 0) {
    throw new RangeError("The interior angle is zero.");
  }

  return angle;
}

export function calculateTheoreticalTraverseGeometry(
  points: readonly SurveyPoint[],
  legTemplate: readonly TraverseLeg[],
  angleTemplate: readonly AngleObservation[],
): TheoreticalTraverseGeometry {
  if (points.length < 3) {
    throw new RangeError("At least three survey points are required.");
  }

  if (
    legTemplate.length !== points.length ||
    angleTemplate.length !== points.length
  ) {
    throw new RangeError(
      "Points, leg templates and angle templates must have equal lengths.",
    );
  }

  points.forEach((point, index) => {
    assertCoordinate(point.coordinate, `points[${index}].coordinate`);
  });

  const legs = points.map((point, index) => {
    const next = points[(index + 1) % points.length]!;
    const template = legTemplate[index]!;

    if (
      template.fromPointId !== point.id ||
      template.toPointId !== next.id
    ) {
      throw new RangeError(`Leg order is invalid at index ${index}.`);
    }

    const distance = calculateSurveyDistance(
      point.coordinate,
      next.coordinate,
    );

    if (distance === 0) {
      throw new RangeError("Survey points must not overlap.");
    }

    return {
      ...template,
      distance,
    };
  });

  const angles = points.map((point, index) => {
    const previous = points[
      (index - 1 + points.length) % points.length
    ]!;
    const next = points[(index + 1) % points.length]!;
    const template = angleTemplate[index]!;

    if (template.pointId !== point.id) {
      throw new RangeError(`Angle order is invalid at index ${index}.`);
    }

    return {
      ...template,
      angleDegrees: calculateClockwiseInteriorAngle(
        previous.coordinate,
        point.coordinate,
        next.coordinate,
      ),
    };
  });

  return {
    points,
    legs,
    angles,
  };
}

export function createSurveySvgTransform(
  points: readonly SurveyPoint[],
  bounds: SvgPlotBounds,
): SurveySvgTransform {
  if (points.length === 0) {
    throw new RangeError("At least one survey point is required.");
  }

  const plotWidth = bounds.right - bounds.left;
  const plotHeight = bounds.bottom - bounds.top;

  if (
    !Number.isFinite(plotWidth) ||
    !Number.isFinite(plotHeight) ||
    plotWidth <= 0 ||
    plotHeight <= 0
  ) {
    throw new RangeError("SVG plot bounds must have positive dimensions.");
  }

  points.forEach((point, index) => {
    assertCoordinate(point.coordinate, `points[${index}].coordinate`);
  });

  const northValues = points.map((point) => point.coordinate.x);
  const eastValues = points.map((point) => point.coordinate.y);
  const minNorth = Math.min(...northValues);
  const maxNorth = Math.max(...northValues);
  const minEast = Math.min(...eastValues);
  const maxEast = Math.max(...eastValues);
  const northSpan = Math.max(maxNorth - minNorth, 1);
  const eastSpan = Math.max(maxEast - minEast, 1);
  const scale = Math.min(plotWidth / eastSpan, plotHeight / northSpan);
  const drawingWidth = eastSpan * scale;
  const drawingHeight = northSpan * scale;

  return {
    minNorth,
    maxNorth,
    minEast,
    maxEast,
    scale,
    originX: bounds.left + (plotWidth - drawingWidth) / 2,
    originY: bounds.top + (plotHeight - drawingHeight) / 2,
    bounds,
  };
}

export function surveyToSvgCoordinate(
  coordinate: SurveyCoordinate,
  transform: SurveySvgTransform,
): SvgCoordinate {
  assertCoordinate(coordinate, "coordinate");

  return {
    x:
      transform.originX +
      (coordinate.y - transform.minEast) * transform.scale,
    y:
      transform.originY +
      (transform.maxNorth - coordinate.x) * transform.scale,
  };
}

export function svgToSurveyCoordinate(
  coordinate: SvgCoordinate,
  transform: SurveySvgTransform,
): SurveyCoordinate {
  assertFinite(coordinate.x, "coordinate.x");
  assertFinite(coordinate.y, "coordinate.y");

  if (!Number.isFinite(transform.scale) || transform.scale <= 0) {
    throw new RangeError("SVG transform scale must be positive.");
  }

  return {
    x:
      transform.maxNorth -
      (coordinate.y - transform.originY) / transform.scale,
    y:
      transform.minEast +
      (coordinate.x - transform.originX) / transform.scale,
  };
}

export function clampSvgCoordinate(
  coordinate: SvgCoordinate,
  bounds: SvgPlotBounds,
): SvgCoordinate {
  assertFinite(coordinate.x, "coordinate.x");
  assertFinite(coordinate.y, "coordinate.y");

  return {
    x: Math.min(Math.max(coordinate.x, bounds.left), bounds.right),
    y: Math.min(Math.max(coordinate.y, bounds.top), bounds.bottom),
  };
}

export function clientToSvgCoordinate(
  client: SvgCoordinate,
  rect: ClientRectSize,
  viewBoxWidth: number,
  viewBoxHeight: number,
): SvgCoordinate {
  assertFinite(client.x, "client.x");
  assertFinite(client.y, "client.y");

  if (
    !Number.isFinite(rect.width) ||
    !Number.isFinite(rect.height) ||
    rect.width <= 0 ||
    rect.height <= 0 ||
    !Number.isFinite(viewBoxWidth) ||
    !Number.isFinite(viewBoxHeight) ||
    viewBoxWidth <= 0 ||
    viewBoxHeight <= 0
  ) {
    throw new RangeError("SVG display dimensions must be positive.");
  }

  return {
    x: ((client.x - rect.left) / rect.width) * viewBoxWidth,
    y: ((client.y - rect.top) / rect.height) * viewBoxHeight,
  };
}
