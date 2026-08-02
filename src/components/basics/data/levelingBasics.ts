export type LevelingCalculationMethod =
  | "instrument-height"
  | "height-difference";

export interface LevelingSetupInput {
  readonly id: string;
  readonly stationLabel: string;
  readonly backsightPoint: string;
  readonly foresightPoint: string;
  readonly backsight: number;
  readonly foresight: number;
}

export interface LevelingSetupResult extends LevelingSetupInput {
  readonly backsightPointElevation: number;
  readonly instrumentHeight: number;
  readonly heightDifference: number;
  readonly foresightPointElevation: number;
}

export interface LevelingRunSummary {
  readonly setups: readonly LevelingSetupResult[];
  readonly backsightTotal: number;
  readonly foresightTotal: number;
  readonly observedHeightDifference: number;
  readonly calculatedEndElevation: number;
  readonly closingError: number;
}

export interface LevelingRouteSample {
  readonly id: "consistent" | "small-misclosure";
  readonly label: string;
  readonly description: string;
  readonly startPoint: string;
  readonly endPoint: string;
  readonly knownStartElevation: number;
  readonly knownEndElevation: number;
  readonly outbound: readonly LevelingSetupInput[];
  readonly return: readonly LevelingSetupInput[];
}

export type StaffConditionId = "vertical" | "tilted";

export interface StaffConditionDefinition {
  readonly id: StaffConditionId;
  readonly label: string;
  readonly state: string;
  readonly impact: string;
  readonly fieldCheck: string;
}

export type SightDistanceCaseId = "balanced" | "biased";

export interface SightDistanceCaseDefinition {
  readonly id: SightDistanceCaseId;
  readonly label: string;
  readonly backsightDistance: number;
  readonly foresightDistance: number;
  readonly assessment: string;
  readonly explanation: string;
}

export type LevelConditionId =
  | "normal"
  | "bubble-out"
  | "compensator-unstable"
  | "parallax";

export interface LevelConditionDefinition {
  readonly id: LevelConditionId;
  readonly label: string;
  readonly incorrectState: string;
  readonly impact: string;
  readonly fieldCheck: string;
  readonly decision: string;
  readonly tone: "normal" | "adjust" | "reobserve";
}

export const levelingConcepts = [
  {
    id: "level-and-staff",
    icon: "─",
    title: "レベルと標尺",
    description:
      "レベルは水平な視準線を作り、標尺はその視準線から地面上の点までの鉛直な読みを与えます。地面の高さを直接測るのではありません。",
  },
  {
    id: "benchmark",
    icon: "BM",
    title: "BM（Benchmark、水準点）",
    description:
      "標高が既知で、高さの基準として使う点です。BMと水準点は別種類ではなく、BMはBenchmark（水準点）を意味します。",
  },
  {
    id: "backsight-foresight",
    icon: "BS",
    title: "後視と前視",
    description:
      "後視は器械高を求めるための読み、前視は新点や転点の標高を求めるための読みです。位置の前後ではなく、その据付での計算上の役割で決まります。",
  },
  {
    id: "instrument-height-difference",
    icon: "HI",
    title: "器械高と高低差",
    description:
      "水準測量の器械高は水平な視準線の標高です。後視−前視で高低差を求めても、器械高を経由しても同じ新点標高になります。",
  },
  {
    id: "turning-point",
    icon: "TP",
    title: "転点（TP）",
    description:
      "レベルを移動するとき、前の据付で求めた標高を次の据付へ引き継ぐ点です。前視を完了するまで標尺を動かしません。",
  },
  {
    id: "closure",
    icon: "↔",
    title: "往路・復路と閉合",
    description:
      "既知標高点へ到達した結果や往復の高低差を照合し、閉合差から観測の整合を点検します。許容値は作業規程と路線条件で確認します。",
  },
] as const;

export const levelingWorkflow = [
  "既知標高点を確認",
  "後視を読む",
  "器械高を求める",
  "前視を読む",
  "新点へ標高をつなぐ",
  "閉合差を点検",
] as const;

export const levelingInputDefaults = {
  benchmarkElevation: 100,
  backsight: 1.25,
  foresight: 0.875,
  limits: {
    benchmarkElevation: { min: 95, max: 105, step: 0.1 },
    staffReading: { min: 0.1, max: 3.5, step: 0.005 },
  },
} as const;

export const turningPointExamples = {
  withoutTurningPoint: [
    {
      id: "single-setup",
      stationLabel: "据付1",
      backsightPoint: "BM",
      foresightPoint: "新点P",
      backsight: 1.345,
      foresight: 0.965,
    },
  ],
  withTurningPoint: [
    {
      id: "to-tp1",
      stationLabel: "据付1",
      backsightPoint: "BM",
      foresightPoint: "TP1",
      backsight: 1.345,
      foresight: 1.015,
    },
    {
      id: "from-tp1",
      stationLabel: "据付2",
      backsightPoint: "TP1",
      foresightPoint: "新点P",
      backsight: 1.28,
      foresight: 0.93,
    },
  ],
  startElevation: 100,
} as const;

// BM-A=100.000m、BM-B=101.250mを固定した教材例。
// consistentは往路+1.250m、復路-1.250mで、各閉合差と往復閉合差が0。
// small-misclosureは往路+1.254m、復路-1.252mで、往路+0.004m、
// 復路-0.002m、往復+0.002mになるよう式と読定値を整合させている。
export const levelingRouteSamples = [
  {
    id: "consistent",
    label: "整合する観測例",
    description:
      "往路と復路が既知標高差に一致する固定例です。観測高低差の符号が往復で反対になります。",
    startPoint: "BM-A",
    endPoint: "BM-B",
    knownStartElevation: 100,
    knownEndElevation: 101.25,
    outbound: [
      {
        id: "consistent-out-1",
        stationLabel: "往路 据付1",
        backsightPoint: "BM-A",
        foresightPoint: "TP1",
        backsight: 1.245,
        foresight: 0.986,
      },
      {
        id: "consistent-out-2",
        stationLabel: "往路 据付2",
        backsightPoint: "TP1",
        foresightPoint: "BM-B",
        backsight: 1.382,
        foresight: 0.391,
      },
    ],
    return: [
      {
        id: "consistent-return-1",
        stationLabel: "復路 据付1",
        backsightPoint: "BM-B",
        foresightPoint: "TP2",
        backsight: 0.876,
        foresight: 1.315,
      },
      {
        id: "consistent-return-2",
        stationLabel: "復路 据付2",
        backsightPoint: "TP2",
        foresightPoint: "BM-A",
        backsight: 1.104,
        foresight: 1.915,
      },
    ],
  },
  {
    id: "small-misclosure",
    label: "小さな閉合差を含む観測例",
    description:
      "式の整合を保ったまま、往路と復路に異なる小さな閉合差を持たせた固定例です。小さいだけで採用可とは判断しません。",
    startPoint: "BM-A",
    endPoint: "BM-B",
    knownStartElevation: 100,
    knownEndElevation: 101.25,
    outbound: [
      {
        id: "misclosure-out-1",
        stationLabel: "往路 据付1",
        backsightPoint: "BM-A",
        foresightPoint: "TP1",
        backsight: 1.245,
        foresight: 0.986,
      },
      {
        id: "misclosure-out-2",
        stationLabel: "往路 据付2",
        backsightPoint: "TP1",
        foresightPoint: "BM-B",
        backsight: 1.382,
        foresight: 0.387,
      },
    ],
    return: [
      {
        id: "misclosure-return-1",
        stationLabel: "復路 据付1",
        backsightPoint: "BM-B",
        foresightPoint: "TP2",
        backsight: 0.876,
        foresight: 1.315,
      },
      {
        id: "misclosure-return-2",
        stationLabel: "復路 据付2",
        backsightPoint: "TP2",
        foresightPoint: "BM-A",
        backsight: 1.104,
        foresight: 1.917,
      },
    ],
  },
] as const satisfies readonly LevelingRouteSample[];

export const staffConditions = [
  {
    id: "vertical",
    label: "標尺が鉛直",
    state: "標尺の目盛方向が鉛直で、標尺底面を測点へ確実に置いています。",
    impact: "水平な視準線から測点までの読みを、鉛直方向の距離として確認できます。",
    fieldCheck:
      "円形気泡などを確認し、必要に応じて標尺を前後へゆっくり振って最小読定値を確認します。",
  },
  {
    id: "tilted",
    label: "標尺が傾いている",
    state: "標尺が鉛直から傾き、目盛に沿った視準線までの長さが鉛直距離より長くなりやすい状態です。",
    impact:
      "読みが大きくなる方向の誤差が生じやすくなります。影響量は傾き方向・角度・視準条件で変わるため数値化しません。",
    fieldCheck:
      "標尺気泡と足元を確認し、前後に振る場合は最小値を読みます。標尺を動かす前に前視観測を完了します。",
  },
] as const satisfies readonly StaffConditionDefinition[];

export const sightDistanceCases = [
  {
    id: "balanced",
    label: "距離がほぼ等しい状態",
    backsightDistance: 32,
    foresightDistance: 31,
    assessment: "後視距離と前視距離がほぼそろっています。",
    explanation:
      "視準距離をそろえると、視準線のわずかな誤差などが後視と前視で相殺されやすくなります。",
  },
  {
    id: "biased",
    label: "距離差が大きい状態",
    backsightDistance: 18,
    foresightDistance: 55,
    assessment: "後視距離と前視距離に大きな偏りがあります。",
    explanation:
      "視準線の誤差などが相殺されにくくなるため、可能なら据付位置を見直します。距離差から標高誤差を推測計算しません。",
  },
] as const satisfies readonly SightDistanceCaseDefinition[];

export const levelConditions = [
  {
    id: "normal",
    label: "正常",
    incorrectState: "気泡、自動補正機構、合焦、視差に確認済みの異常はありません。",
    impact: "機器の点検方法に従った確認後、標尺読定へ進めます。",
    fieldCheck: "気泡、自動補正の安定、十字線、標尺像を観測直前に再確認します。",
    decision: "点検後に続行可能",
    tone: "normal",
  },
  {
    id: "bubble-out",
    label: "気泡ずれ・補正範囲外",
    incorrectState: "機器が十分に整準されず、気泡がずれているか自動補正範囲を外れています。",
    impact:
      "水平な視準線を正しく作れないおそれがあります。補正範囲は機種で異なるため固定値を示しません。",
    fieldCheck: "三脚と整準ねじで再整準し、機種の表示・取扱説明書で補正可能状態を確認します。",
    decision: "再整準してから再観測",
    tone: "reobserve",
  },
  {
    id: "compensator-unstable",
    label: "自動補正が不安定",
    incorrectState: "振動や設置状態などにより、自動補正機構が安定していません。",
    impact: "視準線が安定せず、読定値が一定しないおそれがあります。",
    fieldCheck: "三脚、地盤、振動、機器表示を確認し、機構が安定するまで待って再点検します。",
    decision: "原因を除き、安定確認後に再観測",
    tone: "adjust",
  },
  {
    id: "parallax",
    label: "視差が残っている",
    incorrectState: "目を動かすと、十字線と標尺像が相対的にずれて見えます。",
    impact: "観測者の目の位置によって標尺の読定位置が変わるおそれがあります。",
    fieldCheck:
      "先に接眼鏡で十字線を明瞭にする視度調整を行い、次に標尺像へ合焦し、目を動かしてずれがないことを確認します。",
    decision: "視差を除去してから再読定",
    tone: "adjust",
  },
] as const satisfies readonly LevelConditionDefinition[];

const roundTo = (value: number, digits = 6): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const requireFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}は有限の数値で指定してください。`);
  }
};

const requirePositiveReading = (value: number, label: string): void => {
  requireFinite(value, label);

  if (value <= 0) {
    throw new Error(`${label}は0より大きい標尺読定値で指定してください。`);
  }
};

export function calculateInstrumentHeight(
  knownPointElevation: number,
  backsight: number,
): number {
  requireFinite(knownPointElevation, "既知点標高");
  requirePositiveReading(backsight, "後視");
  return roundTo(knownPointElevation + backsight);
}

export function calculateElevationByInstrumentHeight(
  instrumentHeight: number,
  foresight: number,
): number {
  requireFinite(instrumentHeight, "器械高");
  requirePositiveReading(foresight, "前視");
  return roundTo(instrumentHeight - foresight);
}

export function calculateLevelingHeightDifference(
  backsight: number,
  foresight: number,
): number {
  requirePositiveReading(backsight, "後視");
  requirePositiveReading(foresight, "前視");
  return roundTo(backsight - foresight);
}

export function calculateElevationByHeightDifference(
  knownPointElevation: number,
  heightDifference: number,
): number {
  requireFinite(knownPointElevation, "既知点標高");
  requireFinite(heightDifference, "高低差");
  return roundTo(knownPointElevation + heightDifference);
}

export function calculateSingleLevelingSetup(
  knownPointElevation: number,
  backsight: number,
  foresight: number,
): {
  readonly instrumentHeight: number;
  readonly heightDifference: number;
  readonly elevationByInstrumentHeight: number;
  readonly elevationByHeightDifference: number;
} {
  const instrumentHeight = calculateInstrumentHeight(
    knownPointElevation,
    backsight,
  );
  const heightDifference = calculateLevelingHeightDifference(
    backsight,
    foresight,
  );

  return {
    instrumentHeight,
    heightDifference,
    elevationByInstrumentHeight: calculateElevationByInstrumentHeight(
      instrumentHeight,
      foresight,
    ),
    elevationByHeightDifference: calculateElevationByHeightDifference(
      knownPointElevation,
      heightDifference,
    ),
  };
}

export function calculateSequentialLeveling(
  startElevation: number,
  setups: readonly LevelingSetupInput[],
): readonly LevelingSetupResult[] {
  requireFinite(startElevation, "始点標高");

  if (setups.length === 0) {
    throw new Error("水準路線には1つ以上の据付を指定してください。");
  }

  let currentElevation = startElevation;

  return setups.map((setup) => {
    const result = calculateSingleLevelingSetup(
      currentElevation,
      setup.backsight,
      setup.foresight,
    );
    const setupResult: LevelingSetupResult = {
      ...setup,
      backsightPointElevation: roundTo(currentElevation),
      instrumentHeight: result.instrumentHeight,
      heightDifference: result.heightDifference,
      foresightPointElevation: result.elevationByInstrumentHeight,
    };
    currentElevation = setupResult.foresightPointElevation;
    return setupResult;
  });
}

export function calculateObservedHeightDifference(
  backsights: readonly number[],
  foresights: readonly number[],
): {
  readonly backsightTotal: number;
  readonly foresightTotal: number;
  readonly observedHeightDifference: number;
} {
  if (
    backsights.length === 0 ||
    backsights.length !== foresights.length
  ) {
    throw new Error("後視と前視は同じ据付数で1組以上指定してください。");
  }

  backsights.forEach((value) => requirePositiveReading(value, "後視"));
  foresights.forEach((value) => requirePositiveReading(value, "前視"));

  const backsightTotal = roundTo(
    backsights.reduce((total, value) => total + value, 0),
  );
  const foresightTotal = roundTo(
    foresights.reduce((total, value) => total + value, 0),
  );

  return {
    backsightTotal,
    foresightTotal,
    observedHeightDifference: roundTo(backsightTotal - foresightTotal),
  };
}

export function calculateLevelingEndElevation(
  startElevation: number,
  observedHeightDifference: number,
): number {
  requireFinite(startElevation, "始点標高");
  requireFinite(observedHeightDifference, "観測高低差");
  return roundTo(startElevation + observedHeightDifference);
}

export function calculateLevelingClosingError(
  calculatedEndElevation: number,
  knownEndElevation: number,
): number {
  requireFinite(calculatedEndElevation, "終点計算標高");
  requireFinite(knownEndElevation, "終点既知標高");
  return roundTo(calculatedEndElevation - knownEndElevation);
}

export function calculateRoundTripClosingError(
  outboundObservedHeightDifference: number,
  returnObservedHeightDifference: number,
): number {
  requireFinite(outboundObservedHeightDifference, "往路の観測高低差");
  requireFinite(returnObservedHeightDifference, "復路の観測高低差");
  return roundTo(
    outboundObservedHeightDifference + returnObservedHeightDifference,
  );
}

export function summarizeLevelingRun(
  startElevation: number,
  knownEndElevation: number,
  setups: readonly LevelingSetupInput[],
): LevelingRunSummary {
  const setupResults = calculateSequentialLeveling(startElevation, setups);
  const totals = calculateObservedHeightDifference(
    setupResults.map((setup) => setup.backsight),
    setupResults.map((setup) => setup.foresight),
  );
  const calculatedEndElevation = calculateLevelingEndElevation(
    startElevation,
    totals.observedHeightDifference,
  );

  return {
    setups: setupResults,
    ...totals,
    calculatedEndElevation,
    closingError: calculateLevelingClosingError(
      calculatedEndElevation,
      knownEndElevation,
    ),
  };
}

export function calculateSightDistanceDifference(
  backsightDistance: number,
  foresightDistance: number,
): number {
  requireFinite(backsightDistance, "後視距離");
  requireFinite(foresightDistance, "前視距離");

  if (backsightDistance <= 0 || foresightDistance <= 0) {
    throw new Error("後視距離と前視距離は0より大きい値で指定してください。");
  }

  return roundTo(Math.abs(backsightDistance - foresightDistance));
}
