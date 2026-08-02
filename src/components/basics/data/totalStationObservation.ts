import {
  degreesToRadians,
  normalizeAzimuth,
} from "../../../calculations/angle";

export type SetupStepId =
  | "stabilize-tripod"
  | "rough-centering"
  | "mount-instrument"
  | "precise-centering"
  | "level-instrument"
  | "recheck-centering"
  | "adjust-diopter"
  | "remove-parallax"
  | "record-instrument-height"
  | "orient-with-backsight";

export interface SetupStepDefinition {
  readonly id: SetupStepId;
  readonly label: string;
  readonly reason: string;
}

export type SetupConditionId =
  | "normal"
  | "centering-offset"
  | "leveling-error"
  | "parallax"
  | "instrument-height-error"
  | "prism-height-error";

export interface SetupConditionDefinition {
  readonly id: SetupConditionId;
  readonly label: string;
  readonly incorrectState: string;
  readonly impact: string;
  readonly recheck: string;
  readonly decision: string;
  readonly tone: "normal" | "adjust" | "reobserve";
}

export type BacksightSelectionId = "correct" | "wrong" | "unset";

export interface BacksightSelectionDefinition {
  readonly id: BacksightSelectionId;
  readonly label: string;
  readonly pointName: string | null;
  readonly knownAzimuthDegrees: number | null;
  readonly explanation: string;
}

export type HeightInputScenarioId =
  | "correct"
  | "instrument-high"
  | "instrument-low"
  | "prism-high"
  | "prism-low";

export interface HeightInputScenarioDefinition {
  readonly id: HeightInputScenarioId;
  readonly label: string;
  readonly inputInstrumentHeight: number;
  readonly inputPrismHeight: number;
  readonly effectDirection: string;
}

export interface TsDerivedValues {
  readonly horizontalDistance: number;
  readonly lineOfSightHeightDifference: number;
  readonly pointHeightDifference: number;
}

export interface HeightInputImpact {
  readonly correctPointHeightDifference: number;
  readonly inputPointHeightDifference: number;
  readonly difference: number;
}

export type InspectionDecision =
  | "そのまま採用"
  | "条件を修正して再観測"
  | "観測記録を訂正して再計算"
  | "原因確認が必要";

export interface InspectionScenarioDefinition {
  readonly id: string;
  readonly label: string;
  readonly finding: string;
  readonly decision: InspectionDecision;
  readonly reason: string;
  readonly fieldAction: string;
}

export const totalStationConcepts = [
  {
    id: "centering-leveling",
    icon: "◎",
    title: "求心と整準",
    description:
      "求心はTSの鉛直軸を測点上へ合わせ、整準は鉛直軸を鉛直にします。一方を調整した後は、もう一方も再確認します。",
  },
  {
    id: "focus-parallax",
    icon: "◉",
    title: "視度調整と視差除去",
    description:
      "最初に接眼鏡で十字線を明瞭にし、次に目標へ合焦します。目を動かして十字線と目標がずれなければ視差を除去できています。",
  },
  {
    id: "heights",
    icon: "↕",
    title: "器械高とプリズム高",
    description:
      "器械高は測点からTSの基準位置まで、プリズム高は測点からプリズム中心までの高さです。測点間高低差の計算へ使います。",
  },
  {
    id: "orientation",
    icon: "N",
    title: "後視点による方向付け",
    description:
      "器械点から既知の後視点を視準し、既知方位角を基準方向として設定します。その後の水平角を方向へ結び付けます。",
  },
  {
    id: "direct-calculated",
    icon: "Σ",
    title: "直接観測値と計算値",
    description:
      "代表的な直接観測値は水平角・鉛直角・斜距離です。水平距離や高低差は、角度・距離・高さから計算します。",
  },
  {
    id: "inspection",
    icon: "✓",
    title: "点検観測と再観測",
    description:
      "後視方向や据付状態、記録を途中と終了時に点検し、異常の原因と影響範囲を確認して採用・再計算・再観測を判断します。",
  },
] as const;

export const totalStationSetupSteps = [
  {
    id: "stabilize-tripod",
    label: "三脚を安定して設置",
    reason:
      "脚先を確実に設置し、機器を載せても動きにくい土台を先に作ります。",
  },
  {
    id: "rough-centering",
    label: "測点上へ概略求心",
    reason:
      "三脚頭をおおむね水平にしながら、測点の上へ概略位置を合わせます。",
  },
  {
    id: "mount-instrument",
    label: "TSを取り付ける",
    reason:
      "三脚が安定し概略位置が整ってから、機器を確実に固定します。",
  },
  {
    id: "precise-centering",
    label: "精密求心",
    reason:
      "求心装置を使い、TSの鉛直軸を測点中心へ精密に合わせます。",
  },
  {
    id: "level-instrument",
    label: "整準",
    reason:
      "整準ねじなどを使い、機器の鉛直軸が鉛直になるように調整します。",
  },
  {
    id: "recheck-centering",
    label: "求心の再確認",
    reason:
      "整準操作で求心位置が動くことがあるため、測点中心との一致を再確認します。",
  },
  {
    id: "adjust-diopter",
    label: "接眼鏡の視度調整",
    reason:
      "明るい背景へ向け、目標ではなく十字線が明瞭に見えるよう先に調整します。",
  },
  {
    id: "remove-parallax",
    label: "目標物へ合焦し視差を除去",
    reason:
      "目標へ合焦した後、目を動かしても十字線と目標が相対移動しないことを確認します。",
  },
  {
    id: "record-instrument-height",
    label: "器械高を測定・記録",
    reason:
      "どの基準位置まで、どの単位で測ったかを確認して観測前に記録します。",
  },
  {
    id: "orient-with-backsight",
    label: "後視点を確認して方向付け",
    reason:
      "後視点名・座標・方位角を照合し、正しい基準方向を設定してから前視します。",
  },
] as const satisfies readonly SetupStepDefinition[];

export const initialSetupStepOrder: readonly SetupStepId[] = [
  "stabilize-tripod",
  "rough-centering",
  "mount-instrument",
  "level-instrument",
  "precise-centering",
  "recheck-centering",
  "adjust-diopter",
  "remove-parallax",
  "record-instrument-height",
  "orient-with-backsight",
];

export const setupConditions = [
  {
    id: "normal",
    label: "正常",
    incorrectState: "求心・整準・視差・高さ設定に、確認済みの異常はありません。",
    impact: "確認した条件の範囲では、通常の観測手順へ進めます。",
    recheck: "求心、整準、視差、高さ、後視方向を観測開始直前にもう一度確認します。",
    decision: "点検後に続行可能",
    tone: "normal",
  },
  {
    id: "centering-offset",
    label: "求心ずれ",
    incorrectState: "TSの鉛直軸が器械点の中心を通っていません。",
    impact:
      "観測の出発位置が測点と一致せず、方向や距離へ影響します。影響量は測線条件で変わるため、この教材では数値化しません。",
    recheck: "求心装置の見え方、測点中心、三脚と整準後の位置を確認します。",
    decision: "求心・整準をやり直して再観測",
    tone: "reobserve",
  },
  {
    id: "leveling-error",
    label: "整準不良",
    incorrectState: "TSの鉛直軸が鉛直になっていません。",
    impact:
      "水平角や鉛直角の基準が正しく保てないおそれがあります。影響量は機器・方向・角度で変わるため数値化しません。",
    recheck: "電子気泡または気泡管、整準ねじ、機器を回したときの状態を確認します。",
    decision: "整準・求心を再調整して再観測",
    tone: "reobserve",
  },
  {
    id: "parallax",
    label: "視差あり",
    incorrectState: "目を動かすと、十字線と目標が相対的に動いて見えます。",
    impact:
      "視準位置が観測者の目の位置で変わり、方向を安定して合わせられません。影響量は推測で数値化しません。",
    recheck: "接眼鏡の視度調整と目標への合焦を分けて行い、目を上下左右へ動かします。",
    decision: "視差を除去してから再視準・再観測",
    tone: "adjust",
  },
  {
    id: "instrument-height-error",
    label: "器械高の入力ミス",
    incorrectState: "測った器械高と、TSまたは野帳へ入力した値が一致していません。",
    impact:
      "教材用モデルでは、器械高を高く入力した分だけ測点間高低差が大きくなり、低く入力した分だけ小さくなります。",
    recheck: "器械点、測定位置、単位、読み値、入力欄、観測記録を照合します。",
    decision: "正しい値へ訂正し、必要な成果を再計算・点検",
    tone: "adjust",
  },
  {
    id: "prism-height-error",
    label: "プリズム高の入力ミス",
    incorrectState: "実際のプリズム高と、TSまたは野帳へ入力した値が一致していません。",
    impact:
      "教材用モデルでは、プリズム高を高く入力した分だけ測点間高低差が小さくなり、低く入力した分だけ大きくなります。",
    recheck: "前視点、ポール目盛、固定状態、単位、入力欄、観測記録を照合します。",
    decision: "正しい値へ訂正し、必要な成果を再計算・点検",
    tone: "adjust",
  },
] as const satisfies readonly SetupConditionDefinition[];

export const backsightLearningSample = {
  stationName: "O（器械点）",
  foresightName: "F1（前視点）",
  correctForesightAzimuthDegrees: 35,
  observedHorizontalAngleDegrees: 75,
  selections: [
    {
      id: "correct",
      label: "正しい後視点 B1",
      pointName: "B1",
      knownAzimuthDegrees: 320,
      explanation:
        "点名・座標を照合したB1を後視し、既知方位角320°を基準にします。",
    },
    {
      id: "wrong",
      label: "誤った後視点 B2",
      pointName: "B2",
      knownAzimuthDegrees: 300,
      explanation:
        "B1と取り違えた固定例です。基準方向が20°小さく、そのずれが前視方位角へ同じ向きで反映されます。",
    },
    {
      id: "unset",
      label: "後視点を設定していない",
      pointName: null,
      knownAzimuthDegrees: null,
      explanation:
        "基準方向が未設定なので、水平角を絶対的な前視方位角へ結び付けられません。",
    },
  ],
} as const satisfies {
  readonly stationName: string;
  readonly foresightName: string;
  readonly correctForesightAzimuthDegrees: number;
  readonly observedHorizontalAngleDegrees: number;
  readonly selections: readonly BacksightSelectionDefinition[];
};

export const tsObservationLearningDefaults = {
  horizontalAngleDegrees: 75,
  verticalAngleDegrees: 12,
  slopeDistance: 50,
  instrumentHeight: 1.5,
  prismHeight: 1.8,
  limits: {
    horizontalAngle: { min: 0, max: 359, step: 1 },
    verticalAngle: { min: -30, max: 30, step: 0.5 },
    slopeDistance: { min: 5, max: 150, step: 0.5 },
    instrumentHeight: { min: 0.8, max: 2.5, step: 0.01 },
    prismHeight: { min: 0.8, max: 3, step: 0.01 },
  },
} as const;

export const heightInputLearningModel = {
  correctInstrumentHeight: 1.5,
  correctPrismHeight: 1.8,
  lineOfSightHeightDifference: 2,
} as const;

export const heightInputScenarios = [
  {
    id: "correct",
    label: "正しい入力",
    inputInstrumentHeight: 1.5,
    inputPrismHeight: 1.8,
    effectDirection: "正しい測点間高低差と一致します。",
  },
  {
    id: "instrument-high",
    label: "器械高を高く入力",
    inputInstrumentHeight: 1.65,
    inputPrismHeight: 1.8,
    effectDirection: "器械高の過大入力分だけ、測点間高低差を大きく計算します。",
  },
  {
    id: "instrument-low",
    label: "器械高を低く入力",
    inputInstrumentHeight: 1.35,
    inputPrismHeight: 1.8,
    effectDirection: "器械高の過小入力分だけ、測点間高低差を小さく計算します。",
  },
  {
    id: "prism-high",
    label: "プリズム高を高く入力",
    inputInstrumentHeight: 1.5,
    inputPrismHeight: 1.95,
    effectDirection: "プリズム高の過大入力分だけ、測点間高低差を小さく計算します。",
  },
  {
    id: "prism-low",
    label: "プリズム高を低く入力",
    inputInstrumentHeight: 1.5,
    inputPrismHeight: 1.65,
    effectDirection: "プリズム高の過小入力分だけ、測点間高低差を大きく計算します。",
  },
] as const satisfies readonly HeightInputScenarioDefinition[];

export const observationChecklistItems = [
  { id: "tripod-stable", label: "三脚が安定している" },
  { id: "centered", label: "求心が合っている" },
  { id: "leveled", label: "整準されている" },
  { id: "centering-rechecked", label: "求心を再確認した" },
  { id: "parallax-removed", label: "視差を除去した" },
  { id: "instrument-height-recorded", label: "器械高を測定・記録した" },
  { id: "prism-height-checked", label: "プリズム高を確認した" },
  { id: "prism-constant-checked", label: "プリズム定数を確認した" },
  { id: "backsight-identity-checked", label: "後視点名と座標を確認した" },
  { id: "backsight-direction-checked", label: "後視方向を点検した" },
  { id: "conditions-recorded", label: "気象条件や観測条件を記録した" },
] as const;

export type ObservationChecklistItemId =
  (typeof observationChecklistItems)[number]["id"];

export const inspectionScenarios = [
  {
    id: "backsight-ok",
    label: "後視方向の再確認で問題なし",
    finding: "後視方向の再確認値と据付状態に異常が見つかりませんでした。",
    decision: "そのまま採用",
    reason: "観測条件と方向付けが維持されていることを点検できています。",
    fieldAction: "観測記録へ点検結果を残し、次の観測または成果確認へ進みます。",
  },
  {
    id: "backsight-shifted",
    label: "後視方向が初期値からずれた",
    finding: "観測途中の後視点検で、初期に設定した方向と一致しませんでした。",
    decision: "条件を修正して再観測",
    reason: "方向付けが変化した可能性があり、以後の方向全体へ影響します。",
    fieldAction: "据付・後視点・設定を確認し、影響を受けた観測範囲を再観測します。",
  },
  {
    id: "centering-found",
    label: "求心ずれを発見した",
    finding: "観測後の点検で、TSの鉛直軸が測点中心からずれていました。",
    decision: "条件を修正して再観測",
    reason: "器械点の位置条件が観測中に満たされていなかった可能性があります。",
    fieldAction: "求心と整準をやり直し、影響範囲を確認して再観測します。",
  },
  {
    id: "leveling-found",
    label: "整準不良を発見した",
    finding: "機器を回して点検すると、整準状態が維持されていませんでした。",
    decision: "条件を修正して再観測",
    reason: "角度の基準となる鉛直軸が正しく保たれていない可能性があります。",
    fieldAction: "整準と求心を再調整し、影響範囲を確認して再観測します。",
  },
  {
    id: "height-record-error",
    label: "器械高の記録違いを発見した",
    finding: "現地で測った器械高と観測記録の値が一致しませんでした。",
    decision: "観測記録を訂正して再計算",
    reason: "観測自体ではなく高さ入力が誤りで、正しい実測記録を確認できます。",
    fieldAction: "原記録と測定位置を照合して訂正し、高さ成果を再計算・点検します。",
  },
  {
    id: "distance-outlier",
    label: "観測値が他の反復値から大きく外れた",
    finding: "1つの観測値だけが、他の反復観測と明らかに異なる傾向を示しました。",
    decision: "原因確認が必要",
    reason: "許容値は作業規程や精度区分で異なり、値だけで機械的に棄却できません。",
    fieldAction: "視準、プリズム、設定、気象、記録を確認し、適用規程に従って再観測を判断します。",
  },
] as const satisfies readonly InspectionScenarioDefinition[];

const roundTo = (value: number, digits = 4): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const requireFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}は有限の数値で指定してください。`);
  }
};

export function moveSetupStep(
  order: readonly SetupStepId[],
  stepId: SetupStepId,
  direction: "up" | "down",
): readonly SetupStepId[] {
  const currentIndex = order.indexOf(stepId);

  if (currentIndex === -1) {
    throw new Error("移動する据付手順が現在の並びにありません。");
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= order.length) {
    return order;
  }

  const nextOrder = [...order];
  [nextOrder[currentIndex], nextOrder[targetIndex]] = [
    nextOrder[targetIndex]!,
    nextOrder[currentIndex]!,
  ];
  return nextOrder;
}

export function evaluateSetupOrder(order: readonly SetupStepId[]): {
  readonly isCorrect: boolean;
  readonly firstMismatchIndex: number | null;
  readonly message: string;
} {
  const correctOrder = totalStationSetupSteps.map((step) => step.id);
  const hasSameSteps =
    order.length === correctOrder.length &&
    new Set(order).size === correctOrder.length &&
    correctOrder.every((stepId) => order.includes(stepId));

  if (!hasSameSteps) {
    throw new Error("据付手順は定義済みの10項目を重複なく指定してください。");
  }

  const firstMismatchIndex = order.findIndex(
    (stepId, index) => stepId !== correctOrder[index],
  );

  if (firstMismatchIndex === -1) {
    return {
      isCorrect: true,
      firstMismatchIndex: null,
      message:
        "正しい順序です。求心と整準は相互に影響するため、整準後の求心再確認まで忘れずに行います。",
    };
  }

  const expectedStep = totalStationSetupSteps[firstMismatchIndex]!;
  const actualStep = totalStationSetupSteps.find(
    (step) => step.id === order[firstMismatchIndex],
  )!;

  return {
    isCorrect: false,
    firstMismatchIndex,
    message: `${firstMismatchIndex + 1}番目は「${expectedStep.label}」です。「${actualStep.label}」より先に行う理由：${expectedStep.reason}`,
  };
}

export function calculateForesightAzimuth(
  backsightAzimuthDegrees: number,
  clockwiseHorizontalAngleDegrees: number,
): number {
  requireFinite(backsightAzimuthDegrees, "後視方位角");
  requireFinite(clockwiseHorizontalAngleDegrees, "右回り水平角");

  if (
    clockwiseHorizontalAngleDegrees < 0 ||
    clockwiseHorizontalAngleDegrees >= 360
  ) {
    throw new Error("右回り水平角は0度以上360度未満で指定してください。");
  }

  return roundTo(
    normalizeAzimuth(
      backsightAzimuthDegrees + clockwiseHorizontalAngleDegrees,
    ),
    6,
  );
}

export function calculateSignedDirectionError(
  calculatedAzimuthDegrees: number,
  referenceAzimuthDegrees: number,
): number {
  requireFinite(calculatedAzimuthDegrees, "計算方位角");
  requireFinite(referenceAzimuthDegrees, "基準方位角");

  const unsignedDifference = normalizeAzimuth(
    calculatedAzimuthDegrees - referenceAzimuthDegrees,
  );
  return roundTo(
    unsignedDifference >= 180
      ? unsignedDifference - 360
      : unsignedDifference,
    6,
  );
}

export function calculatePointHeightDifference(
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

  return roundTo(
    instrumentHeight + lineOfSightHeightDifference - prismHeight,
  );
}

export function calculateTsDerivedValues(
  slopeDistance: number,
  verticalAngleDegrees: number,
  instrumentHeight: number,
  prismHeight: number,
): TsDerivedValues {
  requireFinite(slopeDistance, "斜距離");
  requireFinite(verticalAngleDegrees, "鉛直角");
  requireFinite(instrumentHeight, "器械高");
  requireFinite(prismHeight, "プリズム高");

  if (slopeDistance <= 0) {
    throw new Error("斜距離は0より大きい値で指定してください。");
  }

  if (verticalAngleDegrees < -45 || verticalAngleDegrees > 45) {
    throw new Error("鉛直角は学習用範囲の−45度以上45度以下で指定してください。");
  }

  if (
    instrumentHeight <= 0 ||
    instrumentHeight > 5 ||
    prismHeight <= 0 ||
    prismHeight > 5
  ) {
    throw new Error("器械高とプリズム高は0より大きく5m以下で指定してください。");
  }

  const verticalAngleRadians = degreesToRadians(verticalAngleDegrees);
  const horizontalDistance = roundTo(
    slopeDistance * Math.cos(verticalAngleRadians),
  );
  const lineOfSightHeightDifference = roundTo(
    slopeDistance * Math.sin(verticalAngleRadians),
  );

  return {
    horizontalDistance,
    lineOfSightHeightDifference,
    pointHeightDifference: calculatePointHeightDifference(
      instrumentHeight,
      lineOfSightHeightDifference,
      prismHeight,
    ),
  };
}

export function calculateHeightInputImpact(
  lineOfSightHeightDifference: number,
  correctInstrumentHeight: number,
  correctPrismHeight: number,
  inputInstrumentHeight: number,
  inputPrismHeight: number,
): HeightInputImpact {
  const correctPointHeightDifference = calculatePointHeightDifference(
    correctInstrumentHeight,
    lineOfSightHeightDifference,
    correctPrismHeight,
  );
  const inputPointHeightDifference = calculatePointHeightDifference(
    inputInstrumentHeight,
    lineOfSightHeightDifference,
    inputPrismHeight,
  );

  return {
    correctPointHeightDifference,
    inputPointHeightDifference,
    difference: roundTo(
      inputPointHeightDifference - correctPointHeightDifference,
    ),
  };
}
