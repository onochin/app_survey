export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
}

export type AccuracyPrecisionPatternId =
  | "accurate-precise"
  | "accurate-imprecise"
  | "precise-inaccurate"
  | "inaccurate-imprecise";

export interface AccuracyPrecisionPattern {
  readonly id: AccuracyPrecisionPatternId;
  readonly label: string;
  readonly accuracy: string;
  readonly precision: string;
  readonly explanation: string;
  readonly likelyCause: string;
  readonly referencePosition: ScatterPoint;
  readonly observations: readonly ScatterPoint[];
}

export interface ScatterSummary {
  readonly center: ScatterPoint;
  readonly biasFromReference: number;
  readonly rootMeanSquareSpread: number;
}

export interface ObservationRangeSummary {
  readonly maximum: number;
  readonly minimum: number;
  readonly range: number;
}

export interface ObservationStatistics extends ObservationRangeSummary {
  readonly count: number;
  readonly mean: number;
  readonly residuals: readonly number[];
  readonly squaredResiduals: readonly number[];
  readonly residualSum: number;
  readonly residualSquareSum: number;
  readonly sampleStandardDeviation: number | null;
}

export type ErrorScenarioId =
  | "near-zero"
  | "random"
  | "systematic"
  | "gross"
  | "systematic-random";

export interface ErrorScenarioDefinition {
  readonly id: ErrorScenarioId;
  readonly label: string;
  readonly referenceValue: number;
  readonly observations: readonly number[];
  readonly pattern: string;
  readonly repetitionEffect: string;
  readonly causes: readonly string[];
  readonly inspection: string;
  readonly response: string;
}

export type HeightInputScenarioId =
  | "normal"
  | "gnss-high"
  | "gnss-low"
  | "instrument-high"
  | "instrument-low"
  | "prism-high"
  | "prism-low"
  | "one-time-error";

interface HeightInputScenarioBase {
  readonly id: HeightInputScenarioId;
  readonly label: string;
  readonly classification: string;
  readonly explanation: string;
  readonly recordsToCheck: readonly string[];
}

export interface GnssHeightInputScenario extends HeightInputScenarioBase {
  readonly model: "gnss";
  readonly antennaReferenceHeight: number;
  readonly correctAntennaHeight: number;
  readonly inputAntennaHeight: number;
}

export interface TsHeightInputScenario extends HeightInputScenarioBase {
  readonly model: "ts";
  readonly lineOfSightHeightDifference: number;
  readonly correctInstrumentHeight: number;
  readonly correctPrismHeight: number;
  readonly inputInstrumentHeight: number;
  readonly inputPrismHeight: number;
}

export type HeightInputScenario =
  | GnssHeightInputScenario
  | TsHeightInputScenario;

export interface HeightInputRow {
  readonly label: string;
  readonly correctValue: number;
  readonly inputValue: number;
  readonly inputDifference: number;
}

export interface HeightInputImpact {
  readonly modelLabel: string;
  readonly resultLabel: string;
  readonly inputs: readonly HeightInputRow[];
  readonly correctResult: number;
  readonly inputResult: number;
  readonly resultDifference: number;
  readonly direction: "正方向" | "負方向" | "差なし";
}

export type InspectionDecision =
  | "採用候補とする"
  | "記録を訂正して再計算する"
  | "条件・設定を確認する"
  | "原因を確認して再観測する"
  | "直ちに採用しない";

export type InspectionDecisionScenarioId =
  | "within-clear"
  | "outside-tolerance"
  | "within-large-residual"
  | "small-systematic"
  | "height-record-error"
  | "unit-or-point-mixup";

export interface InspectionDecisionScenario {
  readonly id: InspectionDecisionScenarioId;
  readonly label: string;
  readonly closingError: number;
  readonly educationalTolerance: number;
  readonly isEducationalTolerance: true;
  readonly finding: string;
  readonly warningSigns: readonly string[];
  readonly recommendedDecision: InspectionDecision;
  readonly reason: string;
}

export const observationErrorConcepts = [
  {
    id: "truth-reference-observation",
    icon: "基",
    title: "真値・基準値・観測値",
    description:
      "真値は理論上の正しい値ですが、実務では通常完全には分かりません。既知値や点検値を基準値として、機器や観測者が得た観測値と比較します。",
  },
  {
    id: "error-residual",
    icon: "差",
    title: "誤差と残差",
    description:
      "誤差は観測値と真値または教材用基準値との差、残差は個々の観測値と平均値などの代表値との差です。比較する相手が異なります。",
  },
  {
    id: "accuracy-precision",
    icon: "的",
    title: "正確さと精密さ",
    description:
      "正確さは観測結果の中心が基準値へ近いか、精密さは観測結果どうしがまとまっているかを表します。両者は別々に確認します。",
  },
  {
    id: "error-types",
    icon: "種",
    title: "偶然・系統・粗大誤差",
    description:
      "偶然誤差は正負や大きさが一定でないばらつき、系統誤差は一定方向や規則的な偏り、粗大誤差は読み違い・入力ミスなどの大きな異常です。",
  },
  {
    id: "statistics",
    icon: "s",
    title: "平均・範囲・標本標準偏差",
    description:
      "平均値は代表値、最大最小差と標本標準偏差はばらつきを見る指標です。標準偏差が小さくても、全体が偏っていれば正確とは限りません。",
  },
  {
    id: "closure-tolerance",
    icon: "検",
    title: "閉合差・許容値・点検",
    description:
      "閉合差は閉じるべき観測や既知点で一致しなかった差です。許容値だけで決めず、記録、残差、設定、既知値との比較も点検します。",
  },
] as const;

export const accuracyPrecisionPatterns = [
  {
    id: "accurate-precise",
    label: "正確で精密",
    accuracy: "観測点の中心が教材用基準位置に近い",
    precision: "観測点どうしが狭い範囲にまとまる",
    explanation:
      "中心の偏りも広がりも小さい教材例です。点検済みの機器と手順で、安定した条件の観測を反復した状態を表します。",
    likelyCause:
      "据付・設定・点名を確認し、同じ条件で安定して観測できている可能性があります。",
    referencePosition: { x: 0, y: 0 },
    observations: [
      { x: -0.5, y: 0.3 },
      { x: 0.4, y: 0.4 },
      { x: 0.2, y: -0.5 },
      { x: -0.3, y: -0.4 },
      { x: 0.5, y: 0 },
      { x: -0.2, y: 0.2 },
    ],
  },
  {
    id: "accurate-imprecise",
    label: "正確だが不精密",
    accuracy: "広がりの中心は教材用基準位置に近い",
    precision: "個々の観測点は広く散らばる",
    explanation:
      "正負のばらつきが大きくても、固定例全体の中心は基準位置の近くにあります。平均だけで個々の観測品質を隠さないことが大切です。",
    likelyCause:
      "視準の揺れ、標尺・プリズムの保持、気象条件、観測者の読定などが安定していない可能性があります。",
    referencePosition: { x: 0, y: 0 },
    observations: [
      { x: -6, y: 0 },
      { x: 6, y: 0 },
      { x: 0, y: -6 },
      { x: 0, y: 6 },
      { x: -4, y: 4 },
      { x: 4, y: -4 },
    ],
  },
  {
    id: "precise-inaccurate",
    label: "精密だが不正確",
    accuracy: "観測点の中心が教材用基準位置から偏る",
    precision: "観測点どうしは狭い範囲にまとまる",
    explanation:
      "反復値はよくそろっていますが、中心が基準位置から外れています。小さな標準偏差だけでは正しさを保証できません。",
    likelyCause:
      "機器定数、後視方向、高さ入力、補正条件などに一定方向の設定誤りがある可能性があります。",
    referencePosition: { x: 0, y: 0 },
    observations: [
      { x: 5.5, y: 4.5 },
      { x: 6.2, y: 4.8 },
      { x: 5.8, y: 5.4 },
      { x: 6.4, y: 5.2 },
      { x: 5.7, y: 5 },
      { x: 6.1, y: 4.6 },
    ],
  },
  {
    id: "inaccurate-imprecise",
    label: "不正確で不精密",
    accuracy: "観測点の中心が教材用基準位置から偏る",
    precision: "観測点どうしも広く散らばる",
    explanation:
      "中心の偏りと大きな広がりが同時にある教材例です。平均だけを採用せず、設定と観測条件の両方を調べます。",
    likelyCause:
      "一定方向の設定誤りに、視準・保持・気象などの不安定な条件が重なっている可能性があります。",
    referencePosition: { x: 0, y: 0 },
    observations: [
      { x: 2, y: 7 },
      { x: 9, y: 5 },
      { x: 7, y: -1 },
      { x: 3, y: 1 },
      { x: 10, y: 9 },
      { x: 5, y: 4 },
    ],
  },
] as const satisfies readonly AccuracyPrecisionPattern[];

export const repeatedObservationSample = {
  referenceValue: 50,
  unit: "m",
  observations: [
    50.004,
    49.998,
    50.002,
    50.006,
    49.997,
    50.001,
    50.005,
    49.999,
  ],
  minimumCount: 2,
  maximumCount: 8,
  initialCount: 4,
  systematicBiasExample: 0.02,
} as const;

export const errorScenarios = [
  {
    id: "near-zero",
    label: "誤差なしに近い教材例",
    referenceValue: 100,
    observations: [100, 100.001, 99.999, 100, 100.001, 99.999],
    pattern: "教材用基準値の近くで、ばらつきも小さい固定例です。",
    repetitionEffect:
      "反復して同じ傾向を確認できますが、実務で真値が完全に分かったことにはなりません。",
    causes: ["点検済みの機器", "安定した観測条件", "正しい点名・単位・設定"],
    inspection: "既知値、機器設定、原記録を照合します。",
    response: "点検結果を記録し、適用する精度条件と照らして採用を判断します。",
  },
  {
    id: "random",
    label: "偶然誤差",
    referenceValue: 100,
    observations: [99.992, 100.008, 99.997, 100.004, 99.995, 100.006],
    pattern: "誤差の大きさや正負が一定でなく、基準値の両側へばらつきます。",
    repetitionEffect:
      "反復観測でばらつきを確認でき、平均により影響が小さくなる場合がありますが、完全になくなるとは限りません。",
    causes: ["視準や読定の小さな揺れ", "プリズム・標尺の保持", "短時間の気象変化"],
    inspection: "反復値、残差、最大最小差、観測条件を確認します。",
    response: "必要な回数を観測し、作業規程に従って統計量と原記録を点検します。",
  },
  {
    id: "systematic",
    label: "系統誤差",
    referenceValue: 100,
    observations: [100.02, 100.021, 100.019, 100.02, 100.022, 100.018],
    pattern: "観測値全体が教材用基準値より約+0.020 mだけ同じ方向へ偏ります。",
    repetitionEffect:
      "観測回数を増やして平均しても、一定方向の偏りは残ります。平均だけでは発見できない場合があります。",
    causes: ["機器定数や補正条件の誤り", "高さ・単位の一定した入力誤り", "基準方向のずれ"],
    inspection: "既知値との比較、機器設定、定数、高さ、補正条件を照合します。",
    response: "原因と影響範囲を特定し、設定修正後の再計算または再観測を行います。",
  },
  {
    id: "gross",
    label: "粗大誤差",
    referenceValue: 100,
    observations: [100.001, 99.999, 100, 100.052, 100.002, 99.998],
    pattern: "4回目だけが通常のばらつきから大きく外れる固定例です。",
    repetitionEffect:
      "回数を増やして平均へ吸収するのではなく、異常値の原因と原記録を確認します。",
    causes: ["読み違い・入力ミス", "点の取り違え", "高さ・単位の記録ミス"],
    inspection: "観測時刻、点名、単位、野帳、機器ログ、前後の反復値を照合します。",
    response: "原因を確認し、必要に応じて記録訂正、再計算、再観測を行います。",
  },
  {
    id: "systematic-random",
    label: "系統誤差と偶然誤差",
    referenceValue: 100,
    observations: [100.014, 100.027, 100.019, 100.03, 100.017, 100.025],
    pattern: "正負が一定でないばらつきに、正方向の偏りが重なる固定例です。",
    repetitionEffect:
      "平均で偶然的な影響が小さくなる場合があっても、系統的な偏りは残ります。",
    causes: ["一定した設定誤り", "視準・保持の揺れ", "変化する観測条件"],
    inspection: "ばらつきの統計量と、既知値に対する平均の偏りを両方確認します。",
    response: "設定・補正条件を修正し、安定した条件で必要な観測をやり直します。",
  },
] as const satisfies readonly ErrorScenarioDefinition[];

export const heightInputScenarios = [
  {
    id: "normal",
    label: "正常",
    model: "gnss",
    antennaReferenceHeight: 101.8,
    correctAntennaHeight: 1.8,
    inputAntennaHeight: 1.8,
    classification: "入力差なし",
    explanation: "正しいアンテナ高を入力し、教材用の正しい成果高と一致します。",
    recordsToCheck: ["アンテナ高の測定位置", "入力単位", "点名と観測時刻"],
  },
  {
    id: "gnss-high",
    label: "GNSSアンテナ高を高く入力",
    model: "gnss",
    antennaReferenceHeight: 101.8,
    correctAntennaHeight: 1.8,
    inputAntennaHeight: 1.95,
    classification: "継続して使えば系統的な偏り",
    explanation: "アンテナ高を0.150 m高く入力するため、地上点の成果高は0.150 m低くなります。",
    recordsToCheck: ["アンテナ高の実測値", "測定位置", "斜高・鉛直高の区別", "入力単位"],
  },
  {
    id: "gnss-low",
    label: "GNSSアンテナ高を低く入力",
    model: "gnss",
    antennaReferenceHeight: 101.8,
    correctAntennaHeight: 1.8,
    inputAntennaHeight: 1.65,
    classification: "継続して使えば系統的な偏り",
    explanation: "アンテナ高を0.150 m低く入力するため、地上点の成果高は0.150 m高くなります。",
    recordsToCheck: ["アンテナ高の実測値", "測定位置", "斜高・鉛直高の区別", "入力単位"],
  },
  {
    id: "instrument-high",
    label: "TS器械高を高く入力",
    model: "ts",
    lineOfSightHeightDifference: 2,
    correctInstrumentHeight: 1.5,
    correctPrismHeight: 1.8,
    inputInstrumentHeight: 1.65,
    inputPrismHeight: 1.8,
    classification: "継続して使えば系統的な偏り",
    explanation: "器械高の過大入力分だけ、測点間高低差を正方向へずらします。",
    recordsToCheck: ["器械高の実測値", "測定位置", "観測手簿の器械点", "入力単位"],
  },
  {
    id: "instrument-low",
    label: "TS器械高を低く入力",
    model: "ts",
    lineOfSightHeightDifference: 2,
    correctInstrumentHeight: 1.5,
    correctPrismHeight: 1.8,
    inputInstrumentHeight: 1.35,
    inputPrismHeight: 1.8,
    classification: "継続して使えば系統的な偏り",
    explanation: "器械高の過小入力分だけ、測点間高低差を負方向へずらします。",
    recordsToCheck: ["器械高の実測値", "測定位置", "観測手簿の器械点", "入力単位"],
  },
  {
    id: "prism-high",
    label: "プリズム高を高く入力",
    model: "ts",
    lineOfSightHeightDifference: 2,
    correctInstrumentHeight: 1.5,
    correctPrismHeight: 1.8,
    inputInstrumentHeight: 1.5,
    inputPrismHeight: 1.95,
    classification: "継続して使えば系統的な偏り",
    explanation: "プリズム高の過大入力分だけ、測点間高低差を負方向へずらします。",
    recordsToCheck: ["プリズム高の実測値", "ポール目盛", "前視点名", "入力単位"],
  },
  {
    id: "prism-low",
    label: "プリズム高を低く入力",
    model: "ts",
    lineOfSightHeightDifference: 2,
    correctInstrumentHeight: 1.5,
    correctPrismHeight: 1.8,
    inputInstrumentHeight: 1.5,
    inputPrismHeight: 1.65,
    classification: "継続して使えば系統的な偏り",
    explanation: "プリズム高の過小入力分だけ、測点間高低差を正方向へずらします。",
    recordsToCheck: ["プリズム高の実測値", "ポール目盛", "前視点名", "入力単位"],
  },
  {
    id: "one-time-error",
    label: "高さの1回だけの入力間違い",
    model: "gnss",
    antennaReferenceHeight: 101.8,
    correctAntennaHeight: 1.8,
    inputAntennaHeight: 2.8,
    classification: "単発の粗大誤差",
    explanation: "1回だけアンテナ高を1.000 m取り違えた固定例です。平均へ吸収せず原因確認が必要です。",
    recordsToCheck: ["該当時刻の野帳", "アンテナ高の再測値", "単位", "点名", "機器ログ"],
  },
] as const satisfies readonly HeightInputScenario[];

export const propagationLearningDefaults = {
  standardDeviationA: 3,
  standardDeviationB: 4,
  minimum: 0,
  maximum: 10,
  step: 0.5,
  unit: "mm",
} as const;

export const inspectionDecisionOptions = [
  "採用候補とする",
  "記録を訂正して再計算する",
  "条件・設定を確認する",
  "原因を確認して再観測する",
  "直ちに採用しない",
] as const satisfies readonly InspectionDecision[];

export const inspectionDecisionScenarios = [
  {
    id: "within-clear",
    label: "許容値以内・残差にも大きな異常なし",
    closingError: 0.004,
    educationalTolerance: 0.01,
    isEducationalTolerance: true,
    finding: "閉合差は教材用仮定値以内で、固定例の残差と記録にも大きな異常がありません。",
    warningSigns: ["実務の許容値と観測記録は別途確認する"],
    recommendedDecision: "採用候補とする",
    reason: "この固定例では複数の点検に大きな異常がないため候補にできます。ただし最終判断は作業規程によります。",
  },
  {
    id: "outside-tolerance",
    label: "閉合差が教材用許容値を超える",
    closingError: -0.014,
    educationalTolerance: 0.01,
    isEducationalTolerance: true,
    finding: "閉合差の絶対値0.014 mが教材用仮定値0.010 mを超えています。",
    warningSigns: ["閉合差が許容範囲外", "観測または計算条件の異常が未特定"],
    recommendedDecision: "原因を確認して再観測する",
    reason: "原記録と計算を点検し、原因と影響範囲を確認して必要な観測をやり直します。",
  },
  {
    id: "within-large-residual",
    label: "許容値以内だが大きな残差が1つある",
    closingError: 0.006,
    educationalTolerance: 0.01,
    isEducationalTolerance: true,
    finding: "閉合差は仮定値以内ですが、1観測だけ他と大きく異なる残差があります。",
    warningSigns: ["粗大誤差の可能性", "異常値が別の誤差と相殺された可能性"],
    recommendedDecision: "原因を確認して再観測する",
    reason: "許容値以内だけで採用せず、点名・単位・読定・入力を確認して必要なら再観測します。",
  },
  {
    id: "small-systematic",
    label: "閉合差は小さいが系統誤差が疑われる",
    closingError: 0.002,
    educationalTolerance: 0.01,
    isEducationalTolerance: true,
    finding: "閉合差は小さい一方、既知値との比較で一定方向の偏りが続いています。",
    warningSigns: ["機器定数・高さ・補正条件の偏り", "平均後も残る基準値との差"],
    recommendedDecision: "条件・設定を確認する",
    reason: "閉合差だけでは系統誤差を検出できないため、設定、定数、高さ、補正条件を照合します。",
  },
  {
    id: "height-record-error",
    label: "高さの記録ミスが見つかった",
    closingError: 0.007,
    educationalTolerance: 0.01,
    isEducationalTolerance: true,
    finding: "原記録の正しい高さを確認でき、計算へ入力した高さとの不一致が見つかりました。",
    warningSigns: ["成果計算へ誤った高さを使用", "影響する観測範囲の再確認が必要"],
    recommendedDecision: "記録を訂正して再計算する",
    reason: "確認できた原記録に基づいて入力を訂正し、影響する成果を再計算・再点検します。",
  },
  {
    id: "unit-or-point-mixup",
    label: "単位または点名の取り違えが疑われる",
    closingError: -0.003,
    educationalTolerance: 0.01,
    isEducationalTolerance: true,
    finding: "閉合差は小さいものの、単位または観測点名が一致しない記録があります。",
    warningSigns: ["別点の値を混ぜた可能性", "m・mmなど単位を取り違えた可能性"],
    recommendedDecision: "直ちに採用しない",
    reason: "対象点と単位が確定するまで成果へ使用せず、原記録を確認して再計算・再観測を判断します。",
  },
] as const satisfies readonly InspectionDecisionScenario[];

const requireFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}は有限の数値で指定してください。`);
  }
};

const requireFiniteObservations = (
  observations: readonly number[],
): void => {
  if (observations.length === 0) {
    throw new Error("1回以上の観測値を指定してください。");
  }

  observations.forEach((observation) =>
    requireFinite(observation, "観測値"),
  );
};

export function calculateMean(observations: readonly number[]): number {
  requireFiniteObservations(observations);
  return (
    observations.reduce((total, observation) => total + observation, 0) /
    observations.length
  );
}

export function calculateResiduals(
  observations: readonly number[],
): readonly number[] {
  const mean = calculateMean(observations);
  return observations.map((observation) => observation - mean);
}

export function calculateObservationRange(
  observations: readonly number[],
): ObservationRangeSummary {
  requireFiniteObservations(observations);
  const maximum = Math.max(...observations);
  const minimum = Math.min(...observations);

  return {
    maximum,
    minimum,
    range: maximum - minimum,
  };
}

export function calculateResidualSquareSum(
  observations: readonly number[],
): number {
  return calculateResiduals(observations).reduce(
    (total, residual) => total + residual ** 2,
    0,
  );
}

export function calculateSampleStandardDeviation(
  observations: readonly number[],
): number | null {
  requireFiniteObservations(observations);

  if (observations.length < 2) {
    return null;
  }

  return Math.sqrt(
    calculateResidualSquareSum(observations) /
      (observations.length - 1),
  );
}

export function calculateObservationStatistics(
  observations: readonly number[],
): ObservationStatistics {
  const mean = calculateMean(observations);
  const residuals = observations.map((observation) => observation - mean);
  const squaredResiduals = residuals.map((residual) => residual ** 2);
  const rangeSummary = calculateObservationRange(observations);
  const residualSquareSum = squaredResiduals.reduce(
    (total, squaredResidual) => total + squaredResidual,
    0,
  );

  return {
    count: observations.length,
    mean,
    ...rangeSummary,
    residuals,
    squaredResiduals,
    residualSum: residuals.reduce((total, residual) => total + residual, 0),
    residualSquareSum,
    sampleStandardDeviation:
      observations.length < 2
        ? null
        : Math.sqrt(residualSquareSum / (observations.length - 1)),
  };
}

export function calculateBiasFromReference(
  observations: readonly number[],
  referenceValue: number,
): number {
  requireFinite(referenceValue, "教材用基準値");
  return calculateMean(observations) - referenceValue;
}

export function calculateScatterSummary(
  observations: readonly ScatterPoint[],
  referencePosition: ScatterPoint,
): ScatterSummary {
  if (observations.length === 0) {
    throw new Error("1点以上の散布図観測点を指定してください。");
  }

  requireFinite(referencePosition.x, "教材用基準位置X");
  requireFinite(referencePosition.y, "教材用基準位置Y");
  observations.forEach((point) => {
    requireFinite(point.x, "観測点X");
    requireFinite(point.y, "観測点Y");
  });

  const center = {
    x: observations.reduce((total, point) => total + point.x, 0) /
      observations.length,
    y: observations.reduce((total, point) => total + point.y, 0) /
      observations.length,
  };
  const rootMeanSquareSpread = Math.sqrt(
    observations.reduce(
      (total, point) =>
        total + (point.x - center.x) ** 2 + (point.y - center.y) ** 2,
      0,
    ) / observations.length,
  );

  return {
    center,
    biasFromReference: Math.hypot(
      center.x - referencePosition.x,
      center.y - referencePosition.y,
    ),
    rootMeanSquareSpread,
  };
}

export function applySystematicBias(
  observations: readonly number[],
  systematicBias: number,
): readonly number[] {
  requireFiniteObservations(observations);
  requireFinite(systematicBias, "系統的な偏り");
  return observations.map((observation) => observation + systematicBias);
}

export function applyGrossError(
  observations: readonly number[],
  observationIndex: number,
  grossError: number,
): readonly number[] {
  requireFiniteObservations(observations);
  requireFinite(grossError, "粗大誤差");

  if (
    !Number.isInteger(observationIndex) ||
    observationIndex < 0 ||
    observationIndex >= observations.length
  ) {
    throw new Error("粗大誤差を適用する観測番号が範囲外です。");
  }

  return observations.map((observation, index) =>
    index === observationIndex ? observation + grossError : observation,
  );
}

export function calculateGnssGroundHeight(
  antennaReferenceHeight: number,
  antennaHeight: number,
): number {
  requireFinite(antennaReferenceHeight, "アンテナ基準点の高さ");
  requireFinite(antennaHeight, "アンテナ高");

  if (antennaHeight <= 0) {
    throw new Error("アンテナ高は0より大きい値で指定してください。");
  }

  return antennaReferenceHeight - antennaHeight;
}

export function calculateTsPointHeightDifference(
  instrumentHeight: number,
  lineOfSightHeightDifference: number,
  prismHeight: number,
): number {
  requireFinite(instrumentHeight, "器械高");
  requireFinite(lineOfSightHeightDifference, "視準線上の高低差");
  requireFinite(prismHeight, "プリズム高");

  if (instrumentHeight <= 0 || prismHeight <= 0) {
    throw new Error("器械高とプリズム高は0より大きい値で指定してください。");
  }

  return instrumentHeight + lineOfSightHeightDifference - prismHeight;
}

export function calculateHeightInputImpact(
  scenario: HeightInputScenario,
): HeightInputImpact {
  if (scenario.model === "gnss") {
    const correctResult = calculateGnssGroundHeight(
      scenario.antennaReferenceHeight,
      scenario.correctAntennaHeight,
    );
    const inputResult = calculateGnssGroundHeight(
      scenario.antennaReferenceHeight,
      scenario.inputAntennaHeight,
    );
    const resultDifference = inputResult - correctResult;

    return {
      modelLabel: "GNSSアンテナ高の教材用簡略モデル",
      resultLabel: "地上点の高さ",
      inputs: [
        {
          label: "アンテナ高",
          correctValue: scenario.correctAntennaHeight,
          inputValue: scenario.inputAntennaHeight,
          inputDifference:
            scenario.inputAntennaHeight - scenario.correctAntennaHeight,
        },
      ],
      correctResult,
      inputResult,
      resultDifference,
      direction:
        resultDifference > 0
          ? "正方向"
          : resultDifference < 0
            ? "負方向"
            : "差なし",
    };
  }

  const correctResult = calculateTsPointHeightDifference(
    scenario.correctInstrumentHeight,
    scenario.lineOfSightHeightDifference,
    scenario.correctPrismHeight,
  );
  const inputResult = calculateTsPointHeightDifference(
    scenario.inputInstrumentHeight,
    scenario.lineOfSightHeightDifference,
    scenario.inputPrismHeight,
  );
  const resultDifference = inputResult - correctResult;

  return {
    modelLabel: "TS器械高・プリズム高の教材用モデル",
    resultLabel: "測点間高低差",
    inputs: [
      {
        label: "器械高",
        correctValue: scenario.correctInstrumentHeight,
        inputValue: scenario.inputInstrumentHeight,
        inputDifference:
          scenario.inputInstrumentHeight - scenario.correctInstrumentHeight,
      },
      {
        label: "プリズム高",
        correctValue: scenario.correctPrismHeight,
        inputValue: scenario.inputPrismHeight,
        inputDifference: scenario.inputPrismHeight - scenario.correctPrismHeight,
      },
    ],
    correctResult,
    inputResult,
    resultDifference,
    direction:
      resultDifference > 0
        ? "正方向"
        : resultDifference < 0
          ? "負方向"
          : "差なし",
  };
}

export function combineIndependentStandardDeviations(
  standardDeviationA: number,
  standardDeviationB: number,
): number {
  requireFinite(standardDeviationA, "観測量Aの標準偏差");
  requireFinite(standardDeviationB, "観測量Bの標準偏差");

  if (standardDeviationA < 0 || standardDeviationB < 0) {
    throw new Error("標準偏差は0以上で指定してください。");
  }

  return Math.hypot(standardDeviationA, standardDeviationB);
}

export function evaluateClosingError(
  closingError: number,
  tolerance: number,
): {
  readonly absoluteClosingError: number;
  readonly tolerance: number;
  readonly withinTolerance: boolean;
} {
  requireFinite(closingError, "閉合差");
  requireFinite(tolerance, "許容値");

  if (tolerance < 0) {
    throw new Error("許容値は0以上で指定してください。");
  }

  return {
    absoluteClosingError: Math.abs(closingError),
    tolerance,
    withinTolerance: Math.abs(closingError) <= tolerance,
  };
}

export function getRecommendedInspectionDecision(
  scenarioId: InspectionDecisionScenarioId,
): {
  readonly decision: InspectionDecision;
  readonly reason: string;
} {
  const scenario = inspectionDecisionScenarios.find(
    (item) => item.id === scenarioId,
  );

  if (!scenario) {
    throw new Error("指定した教材用判断シナリオが見つかりません。");
  }

  return {
    decision: scenario.recommendedDecision,
    reason: scenario.reason,
  };
}
