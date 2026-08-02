import {
  decimalDegreesToDms,
  dmsToDecimalDegrees,
  normalizeAzimuth,
} from "../../../calculations/angle";
import type { DmsAngle } from "../../../types/traverse";

export type HorizontalRotation = "clockwise" | "counterclockwise";
export type DmsOperation = "add" | "subtract";

export interface AngleDefinition {
  readonly description: string;
  readonly icon: string;
  readonly id: string;
  readonly title: string;
}

export interface DirectionOption {
  readonly azimuthDegrees: number;
  readonly id: string;
  readonly label: string;
  readonly pointLabel: string;
}

export interface DmsExercise {
  readonly id: string;
  readonly left: DmsAngle;
  readonly operation: DmsOperation;
  readonly right: DmsAngle;
  readonly steps: readonly string[];
  readonly title: string;
}

export interface DmsOperationResult {
  readonly normalizedDecimalDegrees: number;
  readonly normalizedDms: DmsAngle;
  readonly rawDecimalDegrees: number;
  readonly rawDms: DmsAngle;
}

export const angleDefinitions = [
  {
    id: "azimuth",
    icon: "N→",
    title: "方位角",
    description:
      "北を0°として、方向線まで時計回りに測る角。方向そのものを表します。",
  },
  {
    id: "horizontal-angle",
    icon: "∠",
    title: "水平角",
    description:
      "後視方向などの基準方向から、前視方向まで水平面内で測る角です。",
  },
  {
    id: "interior-angle",
    icon: "内",
    title: "内角",
    description:
      "多角形の内側にある2辺の角。巡回方向と、どちら側の角かを確認します。",
  },
  {
    id: "exterior-angle",
    icon: "外",
    title: "外角",
    description:
      "辺を延長した方向との角。定義や回転方向により扱いが変わります。",
  },
  {
    id: "rotation",
    icon: "↻",
    title: "右回り角・左回り角",
    description:
      "同じ2方向でも、時計回りと反時計回りでは角度が異なります。",
  },
  {
    id: "sights",
    icon: "B/F",
    title: "後視・前視",
    description:
      "後視は基準方向、前視は観測方向。点の時間的な前後を表す語ではありません。",
  },
  {
    id: "vertical-angle",
    icon: "V",
    title: "鉛直角",
    description:
      "水平線を0°とし、上向きを正、下向きを負とする角度規約で扱います。",
  },
  {
    id: "zenith-angle",
    icon: "Z",
    title: "天頂角",
    description:
      "真上の天頂方向を0°とする角。同じ視準線でも鉛直角とは数値が異なります。",
  },
] as const satisfies readonly AngleDefinition[];

export const directionOptions = [
  {
    id: "northwest",
    pointLabel: "B1",
    label: "北西の点 B1",
    azimuthDegrees: 320,
  },
  {
    id: "northeast",
    pointLabel: "F1",
    label: "北東の点 F1",
    azimuthDegrees: 40,
  },
  {
    id: "southeast",
    pointLabel: "F2",
    label: "南東の点 F2",
    azimuthDegrees: 135,
  },
  {
    id: "southwest",
    pointLabel: "B2",
    label: "南西の点 B2",
    azimuthDegrees: 225,
  },
] as const satisfies readonly DirectionOption[];

export const dmsExercises = [
  {
    id: "carry",
    title: "加算：秒と分の繰上げ",
    operation: "add",
    left: { sign: 1, degrees: 12, minutes: 34, seconds: 50 },
    right: { sign: 1, degrees: 5, minutes: 26, seconds: 25 },
    steps: [
      "秒：50″ + 25″ = 75″ → 1′繰り上げて15″",
      "分：34′ + 26′ + 1′ = 61′ → 1°繰り上げて1′",
      "度：12° + 5° + 1° = 18°",
    ],
  },
  {
    id: "borrow",
    title: "減算：秒と分の繰下げ",
    operation: "subtract",
    left: { sign: 1, degrees: 42, minutes: 10, seconds: 15 },
    right: { sign: 1, degrees: 18, minutes: 45, seconds: 50 },
    steps: [
      "42°10′15″ → 41°70′15″（1°を60′へ繰下げ）",
      "41°70′15″ → 41°69′75″（1′を60″へ繰下げ）",
      "41°69′75″ − 18°45′50″ = 23°24′25″",
    ],
  },
  {
    id: "wrap-positive",
    title: "境界：360°以上を正規化",
    operation: "add",
    left: { sign: 1, degrees: 359, minutes: 59, seconds: 50 },
    right: { sign: 1, degrees: 0, minutes: 0, seconds: 20 },
    steps: [
      "359°59′50″ + 0°00′20″ = 360°00′10″",
      "方位角は0°以上360°未満へ正規化する",
      "360°00′10″ → 0°00′10″",
    ],
  },
  {
    id: "wrap-negative",
    title: "境界：負の角度を正規化",
    operation: "subtract",
    left: { sign: 1, degrees: 0, minutes: 0, seconds: 10 },
    right: { sign: 1, degrees: 0, minutes: 0, seconds: 20 },
    steps: [
      "0°00′10″ − 0°00′20″ = −0°00′10″",
      "負の方位角へ360°を加えて正規化する",
      "−0°00′10″ → 359°59′50″",
    ],
  },
] as const satisfies readonly DmsExercise[];

export function calculateHorizontalAngle(
  backSightAzimuthDegrees: number,
  foreSightAzimuthDegrees: number,
  rotation: HorizontalRotation,
): number {
  return rotation === "clockwise"
    ? normalizeAzimuth(foreSightAzimuthDegrees - backSightAzimuthDegrees)
    : normalizeAzimuth(backSightAzimuthDegrees - foreSightAzimuthDegrees);
}

export function calculateExteriorAngle(interiorAngleDegrees: number): number {
  if (
    !Number.isFinite(interiorAngleDegrees) ||
    interiorAngleDegrees <= 0 ||
    interiorAngleDegrees >= 360
  ) {
    throw new RangeError("内角は0度より大きく360度未満で指定してください。");
  }

  return 360 - interiorAngleDegrees;
}

export function calculateDmsOperation(
  left: DmsAngle,
  right: DmsAngle,
  operation: DmsOperation,
): DmsOperationResult {
  const leftDecimalDegrees = dmsToDecimalDegrees(left);
  const rightDecimalDegrees = dmsToDecimalDegrees(right);
  const rawDecimalDegrees =
    operation === "add"
      ? leftDecimalDegrees + rightDecimalDegrees
      : leftDecimalDegrees - rightDecimalDegrees;
  const normalizedDecimalDegrees = normalizeAzimuth(rawDecimalDegrees);

  return {
    rawDecimalDegrees,
    rawDms: decimalDegreesToDms(rawDecimalDegrees, 0),
    normalizedDecimalDegrees,
    normalizedDms: decimalDegreesToDms(normalizedDecimalDegrees, 0),
  };
}

export function calculateVerticalAngleFromZenith(
  zenithAngleDegrees: number,
): number {
  if (
    !Number.isFinite(zenithAngleDegrees) ||
    zenithAngleDegrees < 0 ||
    zenithAngleDegrees > 180
  ) {
    throw new RangeError("天頂角は0度以上180度以下で指定してください。");
  }

  return 90 - zenithAngleDegrees;
}
