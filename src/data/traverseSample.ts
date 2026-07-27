import type {
  AngleObservation,
  SurveyPoint,
  TraverseLeg,
} from "../types/traverse";

export interface TraverseDisplaySample {
  readonly points: readonly SurveyPoint[];
  readonly legs: readonly TraverseLeg[];
  readonly angles: readonly AngleObservation[];
}

const toDecimalDegrees = (
  degrees: number,
  minutes: number,
  seconds: number,
): number => degrees + minutes / 60 + seconds / 3_600;

const points = [
  {
    id: "a",
    name: "A",
    coordinate: { x: 1_000, y: 1_000 },
    kind: "known",
    isFixed: true,
  },
  {
    id: "p1",
    name: "P1",
    coordinate: { x: 1_100, y: 1_100 },
    kind: "new",
    isFixed: false,
  },
  {
    id: "p2",
    name: "P2",
    coordinate: { x: 1_120, y: 1_240 },
    kind: "new",
    isFixed: false,
  },
  {
    id: "p3",
    name: "P3",
    coordinate: { x: 1_070, y: 1_380 },
    kind: "new",
    isFixed: false,
  },
  {
    id: "p4",
    name: "P4",
    coordinate: { x: 950, y: 1_320 },
    kind: "new",
    isFixed: false,
  },
  {
    id: "b",
    name: "B",
    coordinate: { x: 930, y: 1_140 },
    kind: "new",
    isFixed: true,
  },
] as const satisfies readonly SurveyPoint[];

const legs = [
  {
    id: "a-p1",
    fromPointId: "a",
    toPointId: "p1",
    distance: 141.438,
  },
  {
    id: "p1-p2",
    fromPointId: "p1",
    toPointId: "p2",
    distance: 141.409,
  },
  {
    id: "p2-p3",
    fromPointId: "p2",
    toPointId: "p3",
    distance: 148.676,
  },
  {
    id: "p3-p4",
    fromPointId: "p3",
    toPointId: "p4",
    distance: 134.146,
  },
  {
    id: "p4-b",
    fromPointId: "p4",
    toPointId: "b",
    distance: 181.125,
  },
  {
    id: "b-a",
    fromPointId: "b",
    toPointId: "a",
    distance: 156.514,
  },
] as const satisfies readonly TraverseLeg[];

/**
 * 幾何上の内角に数秒だけ観測誤差を加えた表示用データ。
 * 合計は720°00′12″で、六角形の理論内角和に対して+12″となる。
 */
const angles = [
  {
    id: "angle-a",
    pointId: "a",
    angleDegrees: toDecimalDegrees(71, 33, 57),
  },
  {
    id: "angle-p1",
    pointId: "p1",
    angleDegrees: toDecimalDegrees(143, 7, 46),
  },
  {
    id: "angle-p2",
    pointId: "p2",
    angleDegrees: toDecimalDegrees(152, 13, 2),
  },
  {
    id: "angle-p3",
    pointId: "p3",
    angleDegrees: toDecimalDegrees(83, 5, 21),
  },
  {
    id: "angle-p4",
    pointId: "p4",
    angleDegrees: toDecimalDegrees(122, 54, 24),
  },
  {
    id: "angle-b",
    pointId: "b",
    angleDegrees: toDecimalDegrees(147, 5, 42),
  },
] as const satisfies readonly AngleObservation[];

/**
 * Phase 2では静的な現場図だけに使用する。
 * 初期方位角の対象辺とB点の座標拘束は、仕様確認が必要なため含めない。
 */
export const traverseDisplaySample: TraverseDisplaySample = {
  points,
  legs,
  angles,
};
