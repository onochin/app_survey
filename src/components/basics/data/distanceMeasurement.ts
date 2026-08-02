export type DistanceMethodId = "tape" | "laser" | "total-station";

export interface DistanceMethodDefinition {
  readonly id: DistanceMethodId;
  readonly label: string;
  readonly shortLabel: string;
  readonly directValue: string;
  readonly bestFor: string;
  readonly fieldChecks: readonly string[];
  readonly corrections: readonly string[];
  readonly resultDistance: string;
  readonly conversionNeed: string;
}

export interface DistanceObservationSummary {
  readonly count: number;
  readonly mean: number;
  readonly maximum: number;
  readonly minimum: number;
  readonly range: number;
}

export const distanceTypeDefinitions = [
  {
    id: "horizontal",
    icon: "↔",
    title: "水平距離",
    description:
      "2点を水平面へ投影したときの距離です。平面図や座標計算など、成果で使う距離の基本になります。",
  },
  {
    id: "slope",
    icon: "╱",
    title: "斜距離",
    description:
      "高低差のある2点を直線で結んだ距離です。TSは、まずプリズムまでの斜距離を観測します。",
  },
  {
    id: "height-difference",
    icon: "↕",
    title: "高低差",
    description:
      "2点の高さの差です。上向きを正、下向きを負として表し、水平距離と斜距離を結び付けます。",
  },
] as const;

export const distanceMethods = [
  {
    id: "tape",
    label: "巻尺",
    shortLabel: "目盛を読む",
    directValue: "巻尺に沿った距離",
    bestFor: "短い距離を直接確認する場面や、機器設置時の補助測定",
    fieldChecks: [
      "両端が正しい測点に合っているか",
      "巻尺が水平か、斜面に沿っているか",
      "温度、張力、たるみ、目盛の単位",
    ],
    corrections: [
      "傾斜して測った距離の水平距離への換算",
      "必要な精度に応じた温度・張力などの補正条件確認",
    ],
    resultDistance: "目的に応じて補正・水平化した距離",
    conversionNeed:
      "巻尺の読みをそのまま成果にせず、傾斜や測定条件を確認して使用する距離を決めます。",
  },
  {
    id: "laser",
    label: "レーザー距離計",
    shortLabel: "光で直線距離",
    directValue: "照射点までの直線距離",
    bestFor: "手の届きにくい対象や、短～中距離を素早く確認する場面",
    fieldChecks: [
      "照射点が目的の位置に当たっているか",
      "直線距離・水平距離など表示モードは何か",
      "反射面、障害物、気象条件が測定に適するか",
    ],
    corrections: [
      "傾斜補正機能を使う場合は機種の測定モードを確認",
      "機器が指定する気象・反射条件の確認",
    ],
    resultDistance: "用途と表示モードを確認した距離",
    conversionNeed:
      "表示値が直線距離か水平距離かを確認し、成果が求める距離へそろえます。",
  },
  {
    id: "total-station",
    label: "TS",
    shortLabel: "斜距離を観測",
    directValue: "プリズムまでの斜距離",
    bestFor: "測点間の距離と方向を観測し、座標や高低差へつなげる場面",
    fieldChecks: [
      "使用するプリズムとプリズム定数の組合せ",
      "機器・プリズムの求心と高さ",
      "温度・気圧など、機器が求める気象条件",
    ],
    corrections: [
      "プリズム定数と気象条件の設定",
      "斜距離から水平距離・高低差への計算",
    ],
    resultDistance: "計算・補正後の水平距離と高低差",
    conversionNeed:
      "TSが直接観測する斜距離を、成果に必要な水平距離や高低差へ計算します。",
  },
] as const satisfies readonly DistanceMethodDefinition[];

export const distanceErrorFactors = [
  {
    id: "slope",
    title: "傾斜",
    affects: "斜面に沿う距離は、同じ2点の水平距離より長くなります。",
    fieldAction:
      "測った方向と高低差を記録し、成果では必要に応じて水平距離へ換算します。",
  },
  {
    id: "prism-constant",
    title: "プリズム定数",
    affects:
      "機器の設定と実際のプリズムが合わないと、距離へ一定方向のずれが加わります。",
    fieldAction:
      "機器とプリズムの組合せを照合し、取扱説明書に従って設定します。",
  },
  {
    id: "tape-temperature",
    title: "巻尺の温度",
    affects:
      "巻尺は温度で長さがわずかに変わるため、目盛の読みと実距離に差が生じます。",
    fieldAction:
      "気温と巻尺の標準条件を記録し、必要な精度に応じて所定の補正を確認します。",
  },
  {
    id: "tape-tension",
    title: "巻尺の張力",
    affects:
      "引く力やたるみが変わると、巻尺の伸び方と測線の形が変わります。",
    fieldAction:
      "所定の張力と支持方法を確認し、同じ条件で測ります。",
  },
  {
    id: "weather",
    title: "気象条件",
    affects:
      "光で測る距離は、温度や気圧などによる光の伝わり方の影響を受けます。",
    fieldAction:
      "機器が指定する気象項目を観測・入力し、設定値を観測記録へ残します。",
  },
] as const;

export const distanceObservationSamples = [
  50.002,
  49.998,
  50.001,
  50.004,
  49.999,
] as const;

export const distanceScaleOptions = [500, 1000, 2500] as const;

export type DistanceScaleDenominator =
  (typeof distanceScaleOptions)[number];

export const prismLearningModel = {
  trueDistance: 50,
  correctConstant: -30,
  settingOptions: [-30, 0, 30],
  initialSetting: 0,
} as const;

export const scaleLearningSample = {
  fieldDistance: 25,
  unit: "m",
} as const;

const roundTo = (value: number, digits: number): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const requireFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}は有限の数値で指定してください。`);
  }
};

export function calculateSlopeDistance(
  horizontalDistance: number,
  heightDifference: number,
): number {
  requireFinite(horizontalDistance, "水平距離");
  requireFinite(heightDifference, "高低差");

  if (horizontalDistance < 0) {
    throw new Error("水平距離は0以上で指定してください。");
  }

  return roundTo(Math.hypot(horizontalDistance, heightDifference), 4);
}

export function calculateHorizontalDistance(
  slopeDistance: number,
  heightDifference: number,
): number {
  requireFinite(slopeDistance, "斜距離");
  requireFinite(heightDifference, "高低差");

  if (slopeDistance <= 0) {
    throw new Error("斜距離は0より大きい値で指定してください。");
  }

  if (Math.abs(heightDifference) > slopeDistance) {
    throw new Error("高低差の絶対値は斜距離以下で指定してください。");
  }

  const squaredHorizontalDistance = Math.max(
    0,
    slopeDistance ** 2 - heightDifference ** 2,
  );
  return roundTo(Math.sqrt(squaredHorizontalDistance), 4);
}

export function calculatePrismConstantResult(
  trueDistance: number,
  correctConstant: number,
  configuredConstant: number,
): {
  readonly settingError: number;
  readonly displayedDistance: number;
} {
  requireFinite(trueDistance, "真の距離");
  requireFinite(correctConstant, "正しいプリズム定数");
  requireFinite(configuredConstant, "設定したプリズム定数");

  if (trueDistance <= 0) {
    throw new Error("真の距離は0より大きい値で指定してください。");
  }

  const settingError = roundTo(configuredConstant - correctConstant, 4);
  return {
    settingError,
    displayedDistance: roundTo(trueDistance + settingError / 1000, 4),
  };
}

export function summarizeDistanceObservations(
  observations: readonly number[],
): DistanceObservationSummary {
  if (observations.length === 0) {
    throw new Error("1回以上の観測値を指定してください。");
  }

  for (const observation of observations) {
    requireFinite(observation, "観測値");
  }

  const maximum = Math.max(...observations);
  const minimum = Math.min(...observations);
  const mean =
    observations.reduce((total, observation) => total + observation, 0) /
    observations.length;

  return {
    count: observations.length,
    mean: roundTo(mean, 4),
    maximum: roundTo(maximum, 4),
    minimum: roundTo(minimum, 4),
    range: roundTo(maximum - minimum, 4),
  };
}

export function calculateMapDistanceMillimeters(
  fieldDistanceMeters: number,
  scaleDenominator: number,
): number {
  requireFinite(fieldDistanceMeters, "現地距離");
  requireFinite(scaleDenominator, "縮尺分母");

  if (fieldDistanceMeters < 0) {
    throw new Error("現地距離は0以上で指定してください。");
  }

  if (scaleDenominator <= 0) {
    throw new Error("縮尺分母は0より大きい値で指定してください。");
  }

  return roundTo(
    (fieldDistanceMeters * 1000) / scaleDenominator,
    4,
  );
}
