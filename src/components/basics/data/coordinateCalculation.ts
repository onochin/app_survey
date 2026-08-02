import {
  calculateCoordinateClosure,
  type ClosureComponent,
} from "../../../calculations/closure";
import {
  accumulateAdjustedCoordinates,
  calculateCoordinateIncrement,
  calculateCoordinateIncrements,
} from "../../../calculations/coordinate";
import { normalizeAzimuth } from "../../../calculations/angle";
import type {
  AdjustedCoordinateIncrement,
  CoordinateIncrement,
  SurveyCoordinate,
  TraverseLeg,
} from "../../../types/traverse";

export interface ForwardCoordinateResult {
  readonly startPoint: SurveyCoordinate;
  readonly newPoint: SurveyCoordinate;
  readonly distance: number;
  readonly azimuthDegrees: number;
  readonly deltaX: number;
  readonly deltaY: number;
}

export interface DirectionPreset {
  readonly id:
    | "north"
    | "north-east"
    | "east"
    | "south-east"
    | "south"
    | "south-west"
    | "west"
    | "north-west"
    | "same";
  readonly label: string;
  readonly deltaX: number;
  readonly deltaY: number;
}

export interface ClosureBridgeLeg {
  readonly id: string;
  readonly fromPointId: string;
  readonly toPointId: string;
  readonly distance: number;
  readonly azimuthDegrees: number;
  readonly deltaX: number;
  readonly deltaY: number;
}

function toAdjustedIncrement(
  increment: CoordinateIncrement,
): AdjustedCoordinateIncrement {
  return {
    legId: increment.legId,
    fromPointId: increment.fromPointId,
    toPointId: increment.toPointId,
    distance: increment.distance,
    azimuthDegrees: increment.azimuthDegrees,
    originalDeltaX: increment.deltaX,
    originalDeltaY: increment.deltaY,
    correctionX: 0,
    correctionY: 0,
    adjustedDeltaX: increment.deltaX,
    adjustedDeltaY: increment.deltaY,
  };
}

export function calculateForwardCoordinate(
  startPoint: SurveyCoordinate,
  distance: number,
  azimuthDegrees: number,
): ForwardCoordinateResult {
  const increment = calculateCoordinateIncrement(
    {
      id: "coordinate-learning-leg",
      fromPointId: "A",
      toPointId: "B",
      distance,
    },
    azimuthDegrees,
  );
  const coordinates = accumulateAdjustedCoordinates(
    { id: "A", coordinate: startPoint },
    [toAdjustedIncrement(increment)],
  );
  const newPoint = coordinates[1]!;

  return {
    startPoint: { ...startPoint },
    newPoint: { x: newPoint.x, y: newPoint.y },
    distance: increment.distance,
    azimuthDegrees: increment.azimuthDegrees,
    deltaX: increment.deltaX,
    deltaY: increment.deltaY,
  };
}

export function describeSurveyDirection(
  azimuthDegrees: number | null,
): string {
  if (azimuthDegrees === null) {
    return "同一点（方向なし）";
  }

  const directions = [
    "北",
    "北東",
    "東",
    "南東",
    "南",
    "南西",
    "西",
    "北西",
  ] as const;
  const normalizedAzimuth = normalizeAzimuth(azimuthDegrees);
  const directionIndex = Math.floor((normalizedAzimuth + 22.5) / 45) % 8;

  return directions[directionIndex]!;
}

export const coordinateCalculationConcepts = [
  {
    id: "coordinate-difference",
    icon: "ΔXY",
    title: "座標差と座標増分",
    description:
      "点Aから点Bへの変化量をΔX＝XB−XA、ΔY＝YB−YAで表します。Xは北方向、Yは東方向です。",
  },
  {
    id: "distance-azimuth",
    icon: "S・α",
    title: "距離と方位角",
    description:
      "距離Sは2点間の長さ、方位角αは北を0度として時計回りに測る方向です。",
  },
  {
    id: "latitude-departure",
    icon: "緯・経",
    title: "緯距と経距",
    description:
      "本教材ではX方向の座標増分ΔXを緯距、Y方向の座標増分ΔYを経距として扱います。",
  },
  {
    id: "forward-inverse",
    icon: "順⇄逆",
    title: "正計算と逆計算",
    description:
      "正計算は距離・方位角から新点座標を求め、逆計算は2点の座標から距離・方位角を求めます。",
  },
  {
    id: "known-new",
    icon: "A→B",
    title: "既知点から新点へ",
    description:
      "既知点Aへ座標増分を加えると新点Bの座標になります。複数辺では終点を次の始点として順次加算します。",
  },
  {
    id: "closure",
    icon: "ΣΔ",
    title: "閉合差と閉合トラバース",
    description:
      "閉じるべき測量でΣΔX、ΣΔYが0にならず、計算終点と始点に残る差が座標の閉合差です。",
  },
] as const;

export const coordinateCalculationWorkflow = [
  "既知点Aを確認",
  "距離・方位角を観測",
  "X・Y成分へ分解",
  "新点Bへ加算",
  "複数辺を累積",
  "閉合差を点検",
] as const;

export const inverseDirectionPresets = [
  { id: "north", label: "北", deltaX: 40, deltaY: 0 },
  { id: "north-east", label: "北東", deltaX: 30, deltaY: 40 },
  { id: "east", label: "東", deltaX: 0, deltaY: 40 },
  { id: "south-east", label: "南東", deltaX: -30, deltaY: 40 },
  { id: "south", label: "南", deltaX: -40, deltaY: 0 },
  { id: "south-west", label: "南西", deltaX: -30, deltaY: -40 },
  { id: "west", label: "西", deltaX: 0, deltaY: -40 },
  { id: "north-west", label: "北西", deltaX: 30, deltaY: -40 },
  { id: "same", label: "同一点", deltaX: 0, deltaY: 0 },
] as const satisfies readonly DirectionPreset[];

export const coordinateComparisonSample = {
  startPoint: { x: 1_000, y: 500 },
  distance: 50,
  azimuthDegrees: 53.13010235415598,
} as const;

const closureLegInputs = [
  {
    leg: {
      id: "L1",
      fromPointId: "A",
      toPointId: "P1",
      distance: 100,
    },
    azimuthDegrees: 0,
  },
  {
    leg: {
      id: "L2",
      fromPointId: "P1",
      toPointId: "P2",
      distance: 100,
    },
    azimuthDegrees: 90,
  },
  {
    leg: {
      id: "L3",
      fromPointId: "P2",
      toPointId: "P3",
      distance: 99.8,
    },
    azimuthDegrees: 180,
  },
  {
    leg: {
      id: "L4",
      fromPointId: "P3",
      toPointId: "A-calculated",
      distance: 99.6,
    },
    azimuthDegrees: 270,
  },
] as const satisfies readonly {
  readonly leg: TraverseLeg;
  readonly azimuthDegrees: number;
}[];

const closureIncrements = calculateCoordinateIncrements(
  closureLegInputs.map((item) => item.leg),
  closureLegInputs.map((item) => item.azimuthDegrees),
);
const closureStartPoint = { x: 1_000, y: 500 } as const;
const closureCoordinates = accumulateAdjustedCoordinates(
  { id: "A", coordinate: closureStartPoint },
  closureIncrements.map(toAdjustedIncrement),
);
const closureResult = calculateCoordinateClosure(
  closureIncrements satisfies readonly ClosureComponent[],
);

export const closureBridgeSample = {
  startPoint: closureStartPoint,
  legs: closureIncrements.map<ClosureBridgeLeg>((increment) => ({
    id: increment.legId,
    fromPointId: increment.fromPointId,
    toPointId: increment.toPointId,
    distance: increment.distance,
    azimuthDegrees: increment.azimuthDegrees,
    deltaX: increment.deltaX,
    deltaY: increment.deltaY,
  })),
  coordinates: closureCoordinates,
  closure: closureResult,
} as const;
