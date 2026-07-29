import type { TraverseCalculationResult } from "../calculations/traverse";
import type {
  CalculationStep,
  CalculationStepStatus,
} from "../types/traverse";
import { formatAngleDms } from "./formatAngle";

const STEP_TITLES = [
  "観測角",
  "角度閉合差",
  "角度補正",
  "方位角",
  "緯距・経距",
  "座標閉合差",
  "座標補正",
  "新点座標",
] as const;

function statusFor(
  index: number,
  currentStepIndex: number,
): CalculationStepStatus {
  if (index < currentStepIndex) {
    return "completed";
  }

  return index === currentStepIndex ? "current" : "pending";
}

function fixed(value: number, digits = 3): string {
  const normalized = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return normalized.toFixed(digits);
}

function signedAngle(value: number): string {
  if (Math.abs(value) < 1e-12) {
    return formatAngleDms(0, 1);
  }

  return `${value > 0 ? "+" : ""}${formatAngleDms(value, 1)}`;
}

function pendingSteps(currentStepIndex: number): CalculationStep[] {
  const descriptions = [
    "各測点で読んだ内角を、巡回順に確認します。",
    "観測内角和と理論内角和の差を求めます。",
    "角度閉合差を各観測角へ均等に配分します。",
    "A→P1の初期方位角から各辺の方位角を求めます。",
    "距離を北方向成分と東方向成分へ分解します。",
    "全成分を合計し、閉合しなかった量を求めます。",
    "閉合差を辺長に比例させて配分します。",
    "既知点Aから補正後成分を順次加算します。",
  ] as const;

  return STEP_TITLES.map((title, index) => ({
    id: `step-${index + 1}`,
    order: index + 1,
    title,
    description: descriptions[index]!,
    formula: "入力値を修正すると式と計算結果を確認できます。",
    result: "入力値を確認してください。",
    reason: "正しい観測値がそろってから計算を進めます。",
    commonMistake: "空欄や範囲外の数値をそのまま計算しないこと。",
    status: statusFor(index, currentStepIndex),
  }));
}

export function buildCalculationSteps(
  calculation: TraverseCalculationResult | null,
  currentStepIndex: number,
): CalculationStep[] {
  if (calculation === null) {
    return pendingSteps(currentStepIndex);
  }

  const {
    observation,
    angleAdjustment,
    azimuthsDegrees,
    increments,
    closure,
    adjustedIncrements,
    adjustedCoordinates,
  } = calculation;
  const pointCount = observation.points.length;
  const firstIncrement = increments[0]!;
  const firstAdjusted = adjustedIncrements[0]!;
  const secondPoint = observation.points[1]!;
  const secondAdjustedAngle =
    angleAdjustment.adjustedAnglesDegrees[1]!;
  const lastNewCoordinate = adjustedCoordinates[pointCount - 1]!;
  const correctionMode =
    calculation.angleAdjustmentMode === "whole-seconds"
      ? "1秒単位で、残差はAから観測順に配分"
      : "十進度の精度を保った均等配分";

  const entries: Omit<CalculationStep, "status">[] = [
    {
      id: "step-1",
      order: 1,
      title: STEP_TITLES[0],
      description: "AからBまで、巡回順に6つの観測内角を確認します。",
      formula: "Σβ = βA + βP1 + βP2 + βP3 + βP4 + βB",
      substitution: observation.angles
        .map((angle) => formatAngleDms(angle.angleDegrees, 1))
        .join(" + "),
      result: `観測内角和 = ${formatAngleDms(
        angleAdjustment.closure.observedSumDegrees,
        1,
      )}`,
      reason: "閉合差を求める前に、すべての観測角がそろっているか確かめます。",
      commonMistake: "測点の並びを飛ばしたり、外角を内角として入力すること。",
    },
    {
      id: "step-2",
      order: 2,
      title: STEP_TITLES[1],
      description: "観測内角和から六角形の理論内角和を引きます。",
      formula: "fβ = Σβi − (n − 2) × 180°",
      substitution: `${formatAngleDms(
        angleAdjustment.closure.observedSumDegrees,
        1,
      )} − (${pointCount} − 2) × 180°`,
      result: `fβ = ${signedAngle(
        angleAdjustment.closure.closureDegrees,
      )}`,
      reason: "観測角全体にどれだけのずれがあるかを把握します。",
      commonMistake: "理論内角和をn×180°としてしまうこと。",
    },
    {
      id: "step-3",
      order: 3,
      title: STEP_TITLES[2],
      description: `角度閉合差を均等補正します（${correctionMode}）。`,
      formula: "vβ = −fβ / n,  β'i = βi + vβi",
      substitution: `${signedAngle(
        -angleAdjustment.closure.closureDegrees,
      )} ÷ ${pointCount}`,
      result: observation.points
        .map(
          (point, index) =>
            `${point.name}: ${signedAngle(
              angleAdjustment.correctionsDegrees[index]!,
            )}`,
        )
        .join(" / "),
      reason: "補正後の内角和を理論内角和へ一致させます。",
      commonMistake: "閉合差と同じ符号で補正し、ずれを倍にしてしまうこと。",
    },
    {
      id: "step-4",
      order: 4,
      title: STEP_TITLES[3],
      description: "初期方位角A→P1から時計回りに各辺を計算します。",
      formula: "次辺の方位角 = 前辺の方位角 + 180° − 補正内角",
      substitution: `${formatAngleDms(
        azimuthsDegrees[0]!,
        1,
      )} + 180° − ${formatAngleDms(secondAdjustedAngle, 1)}`,
      result: `${observation.points[0]!.name}→${secondPoint.name}: ${formatAngleDms(
        azimuthsDegrees[0]!,
        1,
      )} / ${secondPoint.name}→${observation.points[2]!.name}: ${formatAngleDms(
        azimuthsDegrees[1]!,
        1,
      )} …`,
      reason: "距離をX・Y成分へ分解する方向を定めます。",
      commonMistake: "北0°・時計回りではなく、数学の東0°で計算すること。",
    },
    {
      id: "step-5",
      order: 5,
      title: STEP_TITLES[4],
      description: "各辺を北方向の緯距と東方向の経距へ分解します。",
      formula: "ΔX = S cos α,  ΔY = S sin α",
      substitution: `${fixed(firstIncrement.distance)} × cos ${formatAngleDms(
        firstIncrement.azimuthDegrees,
        1,
      )}, ${fixed(firstIncrement.distance)} × sin ${formatAngleDms(
        firstIncrement.azimuthDegrees,
        1,
      )}`,
      result: `${firstIncrement.fromPointId.toUpperCase()}→${firstIncrement.toPointId.toUpperCase()}: ΔX=${fixed(
        firstIncrement.deltaX,
      )} m, ΔY=${fixed(firstIncrement.deltaY)} m`,
      reason: "座標へ加算できるよう、斜距離を座標軸方向へ分けます。",
      commonMistake: "度をラジアンへ変換せず三角関数へ渡すこと。",
    },
    {
      id: "step-6",
      order: 6,
      title: STEP_TITLES[5],
      description: "緯距・経距の合計から座標の閉合差を求めます。",
      formula: "fx = ΣΔX,  fy = ΣΔY,  f = √(fx² + fy²)",
      substitution: `fx=${fixed(closure.fx)} m, fy=${fixed(
        closure.fy,
      )} m`,
      result: `f=${fixed(closure.linearClosure)} m / ${
        closure.closureRatio === null
          ? "完全閉合に近い"
          : `閉合比 1 / ${Math.round(closure.closureRatio).toLocaleString("ja-JP")}`
      }`,
      reason: "補正前の終点が既知点Aからどれだけ外れたかを数値化します。",
      commonMistake: "fxとfyの符号を消してから合計すること。",
    },
    {
      id: "step-7",
      order: 7,
      title: STEP_TITLES[6],
      description: "コンパス法で閉合差を各辺長に比例配分します。",
      formula: "cXi = −fx × Si / ΣS,  cYi = −fy × Si / ΣS",
      substitution: `cX₁ = −(${fixed(closure.fx)}) × ${fixed(
        firstAdjusted.distance,
      )} / ${fixed(closure.totalDistance)}`,
      result: `A→P1: cX=${fixed(
        firstAdjusted.correctionX,
        4,
      )} m, cY=${fixed(firstAdjusted.correctionY, 4)} m`,
      reason: "長い辺ほど誤差を受け持つという仮定で全体を閉合させます。",
      commonMistake: "各辺へ同じ補正量を配ること。",
    },
    {
      id: "step-8",
      order: 8,
      title: STEP_TITLES[7],
      description: "Aの既知座標から補正後成分を巡回順に加算します。",
      formula: "Xi+1 = Xi + ΔX'i,  Yi+1 = Yi + ΔY'i",
      substitution: `A (${fixed(
        observation.points[0]!.coordinate.x,
      )}, ${fixed(
        observation.points[0]!.coordinate.y,
      )}) から順次加算`,
      result: `${observation.points[pointCount - 1]!.name}: X=${fixed(
        lastNewCoordinate.x,
      )} m, Y=${fixed(lastNewCoordinate.y)} m（全点は結果表）`,
      reason: "補正済みの観測から各新点の最終座標を確定します。",
      commonMistake: "補正前のΔX・ΔYを座標へ加算すること。",
    },
  ];

  return entries.map((entry, index) => ({
    ...entry,
    status: statusFor(index, currentStepIndex),
  }));
}

export function toJapaneseCalculationError(error: unknown): string {
  if (error instanceof RangeError || error instanceof TypeError) {
    return "入力値または測点の並びを確認してください。計算を続行できません。";
  }

  return "計算中に問題が発生しました。サンプルへリセットして再度お試しください。";
}
