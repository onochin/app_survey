import type {
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
} from "../types";

export type GnssPositioningMethodId =
  | "single"
  | "dgnss"
  | "own-base-rtk"
  | "network-rtk"
  | "clas"
  | "static";

export interface GnssPositioningMethodComparison {
  readonly id: GnssPositioningMethodId;
  readonly label: string;
  readonly shortDescription: string;
  readonly externalInformation: string;
  readonly fieldBaseStation: string;
  readonly approach: string;
  readonly informationPath: string;
  readonly resultTiming: string;
}

export type GnssRequiredAccuracyId = "overview" | "high";
export type GnssResultTimingId = "realtime" | "post-processing";
export type GnssMobileConnectionId = "good" | "unavailable";
export type GnssFieldBaseAvailabilityId = "available" | "unavailable";
export type GnssKnownPointAvailabilityId = "available" | "none-nearby";
export type GnssSkyViewId = "good" | "difficult";

export interface GnssPositioningConditions {
  readonly requiredAccuracy: GnssRequiredAccuracyId;
  readonly resultTiming: GnssResultTimingId;
  readonly mobileConnection: GnssMobileConnectionId;
  readonly fieldBaseAvailability: GnssFieldBaseAvailabilityId;
  readonly knownPointAvailability: GnssKnownPointAvailabilityId;
  readonly skyView: GnssSkyViewId;
}

export interface GnssPositioningCandidate {
  readonly methodId: GnssPositioningMethodId;
  readonly label: string;
  readonly reasons: readonly string[];
}

export interface GnssPositioningEvaluation {
  readonly candidates: readonly GnssPositioningCandidate[];
  readonly considerations: readonly string[];
  readonly warning: string | null;
  readonly needsAdditionalCheck: boolean;
}

export interface GnssPositioningPreset {
  readonly id: string;
  readonly label: string;
  readonly objective: string;
  readonly conditions: GnssPositioningConditions;
  readonly primaryCandidateId: GnssPositioningMethodId;
}

export const gnssPositioningMethodCards = [
  {
    id: "positioning-comparison",
    title: "GNSS測位方式を比較する",
    focus: "方式名ではなく、基準情報・解析・結果の時期を比較する",
  },
  {
    id: "information-source",
    title: "位置を求めるとき、何の情報を使う？",
    focus: "P1自身・外部情報・複数地点観測の3分類",
  },
  {
    id: "single-and-dgnss",
    title: "単独測位からDGNSSへ",
    focus: "外部補正情報を使わない場合と既知位置の基準局を利用する場合",
  },
  {
    id: "own-base-rtk",
    title: "自前基準局RTKとは？",
    focus: "基線と基準局座標がP1成果の土台になること",
  },
  {
    id: "network-rtk",
    title: "ネットワーク型RTKとは？",
    focus: "現場基準局と配信側の仕組みの違い",
  },
  {
    id: "clas",
    title: "CLASとは？",
    focus: "ネットワーク型RTKと異なる補強情報の経路",
  },
  {
    id: "static",
    title: "スタティック測量とは？",
    focus: "一定時間の同時観測と後処理",
  },
  {
    id: "six-methods",
    title: "同じP1を6方式で測る",
    focus: "6方式を同じ軸で横断比較する",
  },
  {
    id: "field-selection",
    title: "現場条件から測位方式を選ぶ",
    focus: "条件に応じて検討候補と理由が変わること",
  },
] as const;

export const gnssPositioningInformationGroups = [
  {
    id: "own-observation",
    categoryLabel: "① P1自身のGNSS観測を中心に求める",
    representative: "単独測位",
    precisionTrend: "概略位置～m級",
    resultLabel: "P1の位置を求める",
    processLabel: null,
  },
  {
    id: "external-information",
    categoryLabel: "② 外部の基準・補正・補強情報も利用する",
    representative: "DGNSS・自前RTK・ネットワーク型RTK・CLAS",
    precisionTrend: "方式によりm級～cm級",
    resultLabel: "P1の位置を求める",
    processLabel: null,
  },
  {
    id: "post-processing",
    categoryLabel: "③ 複数地点のGNSS観測を保存して後処理する",
    representative: "スタティック",
    precisionTrend: "高精度な測量に利用",
    resultLabel: "P1の位置を求める",
    processLabel: "後処理",
  },
] as const;

export const gnssSingleAndDgnssExplanation = {
  single: {
    definition:
      "基準局や補正サービスからの外部補正情報を使わず、衛星から受信した信号や航法情報を使って受信機自身で位置を求める。",
    receiverProcessing:
      "衛星時計や大気の影響などについても受信機内部で補正・推定を行うが、誤差を完全に取り除けるわけではありません。",
    misconception: "単独測位 ≠ 何も補正していない測位",
    familiarExamples: "一般的なスマートフォン、iPhone、Garmin等のGNSSウォッチ",
    capabilityNote:
      "2周波やマルチGNSSに対応した高性能な受信機でも、外部のRTK補正等を使っていなければ、それだけでRTKやcm級測位になるわけではありません。",
  },
  dgnss: {
    definition:
      "既知位置の基準局で得られた補正情報を利用し、単独測位に残る誤差の影響をさらに小さくする。",
    processingNote:
      "基準局Aの座標差をそのままP1から引く単純処理ではなく、既知位置の基準局のGNSS観測から得られる補正情報を利用します。",
    baseStationNote:
      "DGNSSにも基準局はある。ただし、その基準局を利用者自身が現場に設置するとは限りません。",
    baseStationDistinction: "基準局が必要 ≠ 利用者が自分で現場基準局を設置",
  },
  fixTerms: [
    {
      term: "3D fix / GNSS fix",
      meaning: "位置解が得られたことを示す一般的な表現として使われる場合がある",
    },
    {
      term: "RTK FIX",
      meaning: "整数アンビギュイティを固定したRTK固定解",
    },
  ],
} as const;

export const gnssOwnBaseRtkFlow = [
  "基準局AのGNSS観測 ＋ 移動局P1のGNSS観測",
  "2地点の観測を比較",
  "AからP1までの位置の差を求める",
  "基準局Aの既知座標 ＋ AからP1までの位置の差",
  "P1の成果座標",
] as const;

export const gnssNetworkRtkFlow = [
  "電子基準点網など",
  "配信側の処理",
  "RTK用の情報",
  "インターネット",
  "移動局P1",
] as const;

export const gnssClasFlow = [
  "電子基準点等",
  "CLAS補強情報を生成",
  "みちびき",
  "L6D",
  "CLAS対応受信機 P1",
] as const;

export const gnssNetworkAndClasSignalComparison = [
  {
    item: "GNSS観測",
    networkRtk: "L1 / L2 / L5等",
    clas: "L1 / L2 / L5等",
  },
  {
    item: "外部情報",
    networkRtk: "RTK用の情報",
    clas: "CLAS補強情報",
  },
  {
    item: "主な届け方",
    networkRtk: "インターネット",
    clas: "みちびきL6D",
  },
] as const;

export const gnssPositioningMethods = [
  {
    id: "single",
    label: "単独測位",
    shortDescription:
      "基準局や補正サービスからの外部補正情報を使わず位置を求める",
    externalInformation: "外部補正情報は使用しない",
    fieldBaseStation: "不要",
    approach: "衛星信号や航法情報を使い、受信機自身で位置を求める",
    informationPath: "GNSS衛星 → P1",
    resultTiming: "リアルタイム",
  },
  {
    id: "dgnss",
    label: "DGNSS",
    shortDescription: "既知位置の基準局で得られた補正情報を利用する",
    externalInformation: "既知位置の基準局で作った補正情報",
    fieldBaseStation: "必須ではない",
    approach:
      "基準局で分かったGNSS測位のずれを、観測点P1の位置改善に利用する",
    informationPath: "既知位置の基準局 → 補正情報 → P1",
    resultTiming: "主にリアルタイム",
  },
  {
    id: "own-base-rtk",
    label: "自前基準局RTK",
    shortDescription: "自分で現場基準局を設置する",
    externalInformation: "自分の基準局の観測情報",
    fieldBaseStation: "必要",
    approach: "AからP1までの3次元の位置の差を既知座標へ加える",
    informationPath: "基準局 → 移動局",
    resultTiming: "リアルタイム",
  },
  {
    id: "network-rtk",
    label: "ネットワーク型RTK",
    shortDescription: "配信サービス側が作るRTK用の情報を利用する",
    externalInformation: "配信サービス側が作るRTK用の情報",
    fieldBaseStation: "不要",
    approach: "電子基準点網などの観測データを配信側で処理して利用する",
    informationPath: "配信サービス → Internet → P1",
    resultTiming: "リアルタイム",
  },
  {
    id: "clas",
    label: "CLAS",
    shortDescription: "みちびきから補強情報を受ける",
    externalInformation: "CLAS補強情報",
    fieldBaseStation: "不要",
    approach: "GNSSを観測し、みちびきL6Dから補強情報を受けて利用する",
    informationPath: "CLAS補強情報 → みちびきL6D → P1",
    resultTiming: "リアルタイム",
  },
  {
    id: "static",
    label: "スタティック",
    shortDescription: "一定時間観測して後から解析する",
    externalInformation: "複数地点のGNSS観測",
    fieldBaseStation: "基準側観測点が必要",
    approach: "複数地点の観測データを保存し、後処理で基線解析する",
    informationPath: "各受信機で保存 → 後処理",
    resultTiming: "後処理",
  },
] as const satisfies readonly GnssPositioningMethodComparison[];

export const ownBaseRtkCoordinateExample = {
  relativeX: 12.345,
  cases: [
    {
      id: "correct",
      label: "正しい基準局座標",
      baseX: 1000,
      p1X: 1012.345,
      fixState: "FIX",
    },
    {
      id: "offset",
      label: "基準局Xを +0.500 m 誤入力",
      baseX: 1000.5,
      p1X: 1012.845,
      fixState: "FIX",
    },
  ],
} as const;

export type OwnBaseRtkCoordinateCaseId =
  (typeof ownBaseRtkCoordinateExample.cases)[number]["id"];

export function calculateOwnBaseRtkPointX(
  baseX: number,
  relativeX: number,
): number | null {
  if (!Number.isFinite(baseX) || !Number.isFinite(relativeX)) {
    return null;
  }

  return baseX + relativeX;
}

export function getOwnBaseRtkCoordinateCase(
  caseId: string,
): (typeof ownBaseRtkCoordinateExample.cases)[number] | null {
  return (
    ownBaseRtkCoordinateExample.cases.find(
      (coordinateCase) => coordinateCase.id === caseId,
    ) ?? null
  );
}

export const gnssOwnAndNetworkRtkComparison = [
  {
    item: "現場基準局",
    ownBase: "利用者が設置する",
    network: "利用者は設置しない",
  },
  {
    item: "情報の送り元",
    ownBase: "自分の現場基準局",
    network: "電子基準点網などの観測データを利用する配信側",
  },
  {
    item: "主な通信経路",
    ownBase: "基準局 → 移動局",
    network: "RTK用の情報 → Internet → 移動局",
  },
  {
    item: "移動局",
    ownBase: "P1で基準局情報を利用",
    network: "P1で配信情報を利用",
  },
  {
    item: "リアルタイム",
    ownBase: "行う",
    network: "行う",
  },
  {
    item: "成果確認",
    ownBase: "基準局座標・高さ・再観測等を確認",
    network: "座標系・高さ・既知点確認等を確認",
  },
] as const;

export const gnssConditionDefinitions = [
  {
    id: "requiredAccuracy",
    label: "必要な位置精度",
    options: [
      { id: "overview", label: "概略" },
      { id: "high", label: "高精度" },
    ],
  },
  {
    id: "resultTiming",
    label: "結果が必要な時期",
    options: [
      { id: "realtime", label: "現場ですぐ" },
      { id: "post-processing", label: "後処理でもよい" },
    ],
  },
  {
    id: "mobileConnection",
    label: "携帯通信",
    options: [
      { id: "good", label: "良好" },
      { id: "unavailable", label: "不安定・圏外" },
    ],
  },
  {
    id: "fieldBaseAvailability",
    label: "現場基準局",
    options: [
      { id: "available", label: "設置できる" },
      { id: "unavailable", label: "設置しない・できない" },
    ],
  },
  {
    id: "knownPointAvailability",
    label: "既知点",
    options: [
      { id: "available", label: "利用できる" },
      { id: "none-nearby", label: "現場付近にはない" },
    ],
  },
  {
    id: "skyView",
    label: "上空視界",
    options: [
      { id: "good", label: "良好" },
      { id: "difficult", label: "厳しい" },
    ],
  },
] as const;

export const gnssPositioningPresets = [
  {
    id: "general-good-network",
    label: "一般現場・通信良好",
    objective: "高精度なP1を現場ですぐ取得",
    conditions: {
      requiredAccuracy: "high",
      resultTiming: "realtime",
      mobileConnection: "good",
      fieldBaseAvailability: "unavailable",
      knownPointAvailability: "none-nearby",
      skyView: "good",
    },
    primaryCandidateId: "network-rtk",
  },
  {
    id: "mountain-no-mobile",
    label: "山間部・携帯圏外",
    objective: "高精度なP1を現場ですぐ取得",
    conditions: {
      requiredAccuracy: "high",
      resultTiming: "realtime",
      mobileConnection: "unavailable",
      fieldBaseAvailability: "unavailable",
      knownPointAvailability: "none-nearby",
      skyView: "good",
    },
    primaryCandidateId: "clas",
  },
  {
    id: "own-base-available",
    label: "既知点あり・基準局設置可能",
    objective: "複数の調査点を高精度でリアルタイム測位",
    conditions: {
      requiredAccuracy: "high",
      resultTiming: "realtime",
      mobileConnection: "unavailable",
      fieldBaseAvailability: "available",
      knownPointAvailability: "available",
      skyView: "good",
    },
    primaryCandidateId: "own-base-rtk",
  },
  {
    id: "control-point-static",
    label: "高精度な基準点を作る",
    objective: "今後の測量の基準となる高精度な点",
    conditions: {
      requiredAccuracy: "high",
      resultTiming: "post-processing",
      mobileConnection: "unavailable",
      fieldBaseAvailability: "available",
      knownPointAvailability: "available",
      skyView: "good",
    },
    primaryCandidateId: "static",
  },
  {
    id: "rough-position",
    label: "概略位置だけ必要",
    objective: "補正・補強情報を使わず概略位置を得る",
    conditions: {
      requiredAccuracy: "overview",
      resultTiming: "realtime",
      mobileConnection: "unavailable",
      fieldBaseAvailability: "unavailable",
      knownPointAvailability: "none-nearby",
      skyView: "good",
    },
    primaryCandidateId: "single",
  },
] as const satisfies readonly GnssPositioningPreset[];

export function getGnssPositioningPreset(
  presetId: string,
): GnssPositioningPreset | null {
  return (
    gnssPositioningPresets.find((preset) => preset.id === presetId) ?? null
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
): value is T {
  return typeof value === "string" && options.includes(value as T);
}

export function isGnssPositioningConditions(
  value: unknown,
): value is GnssPositioningConditions {
  return (
    isRecord(value) &&
    isOneOf(value.requiredAccuracy, ["overview", "high"] as const) &&
    isOneOf(value.resultTiming, ["realtime", "post-processing"] as const) &&
    isOneOf(value.mobileConnection, ["good", "unavailable"] as const) &&
    isOneOf(value.fieldBaseAvailability, ["available", "unavailable"] as const) &&
    isOneOf(value.knownPointAvailability, ["available", "none-nearby"] as const) &&
    isOneOf(value.skyView, ["good", "difficult"] as const)
  );
}

function createCandidate(
  methodId: GnssPositioningMethodId,
  reasons: readonly string[],
): GnssPositioningCandidate {
  const method = gnssPositioningMethods.find(
    (positioningMethod) => positioningMethod.id === methodId,
  );

  return {
    methodId,
    label: method?.label ?? "追加条件の確認が必要",
    reasons,
  };
}

export function evaluateGnssPositioningConditions(
  value: unknown,
): GnssPositioningEvaluation {
  if (!isGnssPositioningConditions(value)) {
    return {
      candidates: [
        createCandidate("single", ["必要精度や成果用途を確認してから適否を判断します。"]),
        createCandidate("dgnss", ["利用できる補正情報と必要精度の確認が必要です。"]),
      ],
      considerations: [
        "通信、既知点、基準局設置、上空視界、観測時間を追加確認してください。",
      ],
      warning: "追加条件の確認が必要です。",
      needsAdditionalCheck: true,
    };
  }

  if (value.skyView === "difficult") {
    return {
      candidates: [],
      considerations: [
        "衛星遮蔽とマルチパスの可能性を確認します。",
        "観測地点の変更、再測、補助測量を含めて検討します。",
        "上空視界が厳しいだけで、CLASなど特定方式へ決めません。",
      ],
      warning:
        "GNSS方式を選ぶ前に、GNSS観測条件そのものを確認してください。",
      needsAdditionalCheck: true,
    };
  }

  if (value.requiredAccuracy === "overview") {
    return {
      candidates: [
        createCandidate("single", [
          "概略位置が目的で、基準・補正・補強情報を必須条件としていません。",
          "高精度方式の準備を増やす前に、目的に必要な精度を確認できます。",
        ]),
      ],
      considerations: [
        "成果用途が変わり高精度が必要になれば、別方式を再検討します。",
      ],
      warning: null,
      needsAdditionalCheck: false,
    };
  }

  if (value.resultTiming === "post-processing") {
    return {
      candidates: [
        createCandidate("static", [
          "現場ですぐ座標を得る必要がありません。",
          "複数地点で一定時間観測し、保存データを後から基線解析できます。",
        ]),
      ],
      considerations: [
        "同時観測できる基準側観測点、観測計画、成果用途を確認します。",
      ],
      warning: null,
      needsAdditionalCheck: false,
    };
  }

  const candidates: GnssPositioningCandidate[] = [];

  if (
    value.fieldBaseAvailability === "available" &&
    value.knownPointAvailability === "available"
  ) {
    candidates.push(
      createCandidate("own-base-rtk", [
        "利用できる既知点へ自前基準局を設置できます。",
        "基準局・移動局と情報経路を自分で管理できます。",
        "構成によっては携帯インターネットに依存しない運用も検討できます。",
      ]),
    );
  }

  if (value.mobileConnection === "good") {
    candidates.push(
      createCandidate("network-rtk", [
        "インターネット経由で配信側の基準情報を受けられます。",
        "利用者が現場基準局を設置しなくてもリアルタイム測位を検討できます。",
      ]),
    );
  } else {
    candidates.push(
      createCandidate("clas", [
        "携帯インターネットに依存せず、みちびきL6Dから補強情報を受けます。",
        "CLAS対応受信機、上空視界、必要精度を別途確認します。",
      ]),
    );
  }

  const considerations =
    value.mobileConnection === "good"
      ? [
          "ネットワーク型RTKでも、座標系、高さ、既知点確認、上空視界等の点検が必要です。",
        ]
      : [
          "ネットワーク型RTK：携帯通信経路を再確認します。",
          value.fieldBaseAvailability === "available"
            ? "自前基準局RTK：既知点と基準局座標を確認できれば候補です。"
            : "自前基準局RTK：基準局を設置できる条件なら候補です。",
        ];

  return {
    candidates,
    considerations,
    warning: null,
    needsAdditionalCheck: candidates.length > 1,
  };
}

export const gnssPositioningSelectionFlow = [
  "何を求めたい？",
  "必要な精度は？",
  "リアルタイムで必要？",
  "基準・補正・補強情報をどう得る？",
] as const;

export const gnssPositioningMethodsQuizQuestions = [
  {
    id: "gnss-positioning-methods-q01-single-dgnss",
    questionType: "仕組み理解",
    prompt: "単独測位とDGNSSの違いとして、最も適切なのはどれか。",
    options: [
      {
        id: "single-no-correction-dgnss-reference-correction",
        label:
          "単独測位は基準局や補正サービスからの外部補正情報を使わず、DGNSSは既知位置の基準局で得た補正情報を利用する。",
        incorrectReason: null,
      },
      {
        id: "single-carrier-dgnss-code-only",
        label: "単独測位は搬送波位相だけを使い、DGNSSはコードだけを使う。",
        incorrectReason:
          "単独測位とDGNSSの違いを『コードか搬送波か』だけで分けるものではありません。",
      },
      {
        id: "dgnss-always-user-base",
        label: "DGNSSでは必ず自分で現場基準局を設置する。",
        incorrectReason:
          "DGNSSにはさまざまな提供形態があり、必ず利用者自身が現場基準局を設置するとは限りません。",
      },
      {
        id: "single-one-satellite-only",
        label: "単独測位ではGNSS衛星を1機しか利用できない。",
        incorrectReason: "単独測位でも複数衛星を利用して位置を求めます。",
      },
    ],
    correctOptionId: "single-no-correction-dgnss-reference-correction",
    correctReason:
      "単独測位では基準局や補正サービスからの外部補正情報を使わず、受信機内部で補正・推定しながら位置を求めます。DGNSSでは既知位置の基準局で得られた補正情報を利用し、単独測位に残る誤差の影響をさらに小さくします。",
    fieldCheck: "利用中の方式が、どの基準・補正情報を使っているか確認します。",
  },
  {
    id: "gnss-positioning-methods-q02-own-base-rtk",
    questionType: "品質管理",
    prompt:
      "自前基準局RTKで基準局AからP1までの相対的な位置関係を高精度に求めたが、基準局Aへ入力したX座標が実際より0.500 m大きかった。最も適切な説明はどれか。",
    options: [
      {
        id: "fix-removes-base-error",
        label: "FIXしていれば0.500 mの誤りは自動的に取り除かれる。",
        incorrectReason:
          "FIXは入力した基準局座標そのものの正しさを保証しません。",
      },
      {
        id: "base-coordinate-does-not-affect-p1",
        label: "基準局座標は基線解析には使われないのでP1には影響しない。",
        incorrectReason:
          "基準局座標はP1の最終成果を位置基準へ結び付けるうえで重要です。",
      },
      {
        id: "p1-inherits-base-coordinate-error",
        label: "P1の成果座標も誤った基準局座標の影響を受ける。",
        incorrectReason: null,
      },
      {
        id: "wrong-base-always-single",
        label: "基準局座標が誤っている場合は必ずSINGLEになる。",
        incorrectReason:
          "誤った基準局座標を設定していてもFIXする場合があります。",
      },
    ],
    correctOptionId: "p1-inherits-base-coordinate-error",
    correctReason:
      "RTKで基準局と移動局の相対的な位置関係を高精度に求めても、その結果を基準局の既知座標へ結び付けてP1成果を求めます。基準局座標が0.500 mずれていれば、P1成果もその影響を受けます。",
    fieldCheck: "基準局座標の出典、座標系、入力値をFIXとは別に照合します。",
  },
  {
    id: "gnss-positioning-methods-q03-network-rtk",
    questionType: "仕組み理解",
    prompt: "ネットワーク型RTKについて最も適切なのはどれか。",
    options: [
      {
        id: "network-uses-no-reference-observation",
        label: "基準となるGNSS観測を一切利用しないRTKである。",
        incorrectReason:
          "電子基準点網などの基準となるGNSS観測を利用した配信側の仕組みを使います。",
      },
      {
        id: "network-is-clas-l6d",
        label: "移動局がみちびきL6DからCLAS補強情報だけを受けて測位する。",
        incorrectReason: "それはCLASの情報経路で、ネットワーク型RTKとは異なります。",
      },
      {
        id: "network-always-user-base",
        label: "現場で必ず利用者自身が基準局を設置する。",
        incorrectReason:
          "利用者自身が現場基準局を置く代わりに、配信側の仕組みを利用します。",
      },
      {
        id: "network-service-internet-reference",
        label:
          "電子基準点網などを利用した配信サービスから、主にインターネット経由で必要な情報を受けてRTK測位する。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "network-service-internet-reference",
    correctReason:
      "ネットワーク型RTKでは、電子基準点網などのリアルタイム観測データを配信側で処理し、作られたRTK用の情報を主にインターネット経由で受けます。",
    fieldCheck: "配信サービス、通信経路、座標系、高さ、既知点確認を点検します。",
  },
  {
    id: "gnss-positioning-methods-q04-clas",
    questionType: "仕組み理解",
    prompt:
      "CLASとネットワーク型RTKの違いについて、最も適切なのはどれか。",
    options: [
      {
        id: "clas-no-augmentation",
        label: "CLASは単独測位なので補強情報を利用しない。",
        incorrectReason: "CLASはみちびきL6Dから補強情報を受信して利用します。",
      },
      {
        id: "clas-l6d-different-delivery",
        label:
          "CLASでは、みちびきのL6D信号から補強情報を受けるため、ネットワーク型RTKとは情報の届け方や仕組みが異なる。",
        incorrectReason: null,
      },
      {
        id: "clas-qzss-only-positioning",
        label: "CLASではみちびきだけを使って位置を求める。",
        incorrectReason:
          "CLAS補強情報をみちびきから受けることと、みちびきだけで測位することは別です。",
      },
      {
        id: "clas-network-without-internet",
        label: "CLASはネットワーク型RTKからインターネット通信だけを取り除いた方式である。",
        incorrectReason:
          "情報生成・配信・受信の仕組みが異なり、単なる通信経路の置換ではありません。",
      },
    ],
    correctOptionId: "clas-l6d-different-delivery",
    correctReason:
      "ネットワーク型RTKとCLASはどちらもL1/L2/L5等でGNSSを観測します。CLASは、生成された補強情報をみちびきL6Dで対応受信機へ届けるため、インターネットを主経路とするネットワーク型RTKとは外部情報の届け方と仕組みが異なります。",
    fieldCheck: "対応受信機、L6D受信、上空視界、必要精度を確認します。",
  },
  {
    id: "gnss-positioning-methods-q05-static",
    questionType: "仕組み理解",
    prompt: "スタティック測量の作業の流れとして最も適切なのはどれか。",
    options: [
      {
        id: "static-simultaneous-observation-postprocess",
        label:
          "複数地点で一定時間GNSS観測を行い、観測データを保存して後から基線解析する。",
        incorrectReason: null,
      },
      {
        id: "static-save-fix-only",
        label: "移動局でFIXするまで待ち、そのFIX座標だけを保存する。",
        incorrectReason:
          "スタティックはRTKのFIX座標だけを保存する流れではなく、一定時間の観測データを後処理します。",
      },
      {
        id: "static-finish-with-l6d",
        label: "みちびきL6Dから補強情報を受ければ観測終了となる。",
        incorrectReason: "L6DによるCLAS補強情報の受信はスタティックの作業手順ではありません。",
      },
      {
        id: "static-one-receiver-seconds",
        label: "1台の受信機で数秒観測すれば必ず高精度な基準点になる。",
        incorrectReason:
          "必要な観測点、同時観測、観測時間、解析条件を確認する必要があります。",
      },
    ],
    correctOptionId: "static-simultaneous-observation-postprocess",
    correctReason:
      "スタティックでは複数地点で一定時間GNSS観測を行い、コード観測や搬送波位相等を保存して後から基線解析します。",
    fieldCheck: "同時観測計画、保存データ、基準側観測点、後処理条件を確認します。",
  },
  {
    id: "gnss-positioning-methods-q06-comparison",
    questionType: "用語整理",
    prompt:
      "次の説明のうち、測位方式と情報の入手方法の組み合わせが正しいものはどれか。",
    options: [
      {
        id: "own-rtk-from-l6d",
        label: "自前RTK ― みちびきL6Dから補強情報を受ける。",
        incorrectReason: "みちびきL6DからCLAS補強情報を受けるのはCLASです。",
      },
      {
        id: "clas-from-own-base",
        label: "CLAS ― 自分で設置した基準局から補正情報を送る。",
        incorrectReason: "自分で設置した基準局を利用するのは自前基準局RTKです。",
      },
      {
        id: "network-from-service-internet",
        label: "ネットワーク型RTK ― 配信サービスからインターネット経由で情報を受ける。",
        incorrectReason: null,
      },
      {
        id: "static-float-to-fix-end",
        label: "スタティック ― 現場でFLOATからFIXへ変わった時点で作業を終了する。",
        incorrectReason:
          "スタティックは一定時間の観測データを保存し、後から基線解析する方式です。",
      },
    ],
    correctOptionId: "network-from-service-internet",
    correctReason:
      "ネットワーク型RTKでは、電子基準点網などの観測データを利用して配信サービス側が作ったRTK用の情報を、主にインターネット経由で受けます。",
    fieldCheck: "方式名だけでなく、情報源・経路・解析時期を対応付けます。",
  },
  {
    id: "gnss-positioning-methods-q07-field-no-mobile",
    questionType: "方式選択",
    prompt:
      "山間部で携帯通信は圏外である。上空視界は比較的良好で、高精度なP1を現場で求めたい。自分で基準局を設置する予定はない。まず検討する候補として最も適切なのはどれか。",
    options: [
      {
        id: "network-only-no-mobile-needed",
        label: "ネットワーク型RTKだけを使用する。携帯通信は必要ない。",
        incorrectReason:
          "ネットワーク型RTKの主な情報経路にはインターネット通信が必要です。",
      },
      {
        id: "single-always-centimeter",
        label: "単独測位なら必ずセンチメータ級になる。",
        incorrectReason: "単独測位を選べば必ず高精度になるわけではありません。",
      },
      {
        id: "only-static-possible",
        label: "スタティック以外のGNSS方式は使用できない。",
        incorrectReason:
          "携帯圏外でもCLASや、基準局を設置できる条件なら自前RTKなどを検討できます。",
      },
      {
        id: "consider-clas-and-conditions",
        label:
          "CLASを候補とし、対応受信機・上空視界・必要精度などの条件も確認する。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "consider-clas-and-conditions",
    correctReason:
      "CLASは携帯インターネットに依存せず補強情報を受けられるため候補になります。ただし対応受信機、上空視界、必要精度等の確認が必要です。",
    fieldCheck: "圏外かどうかに加え、L6D受信環境と要求精度を確認します。",
  },
  {
    id: "gnss-positioning-methods-q08-method-selection",
    questionType: "総合問題",
    prompt:
      "今後の測量の基準となる高精度な点を求めたい。現場ですぐ座標を得る必要はなく、複数地点で一定時間の観測ができる。方式選択として最も適切なのはどれか。",
    options: [
      {
        id: "no-gnss-without-realtime",
        label: "リアルタイムでないためGNSSは使用できない。",
        incorrectReason: "GNSSには観測データを保存して後処理する方式があります。",
      },
      {
        id: "consider-static-postprocess",
        label: "後処理による基線解析ができるスタティック測量を候補として検討する。",
        incorrectReason: null,
      },
      {
        id: "always-network-rtk",
        label: "必ずネットワーク型RTKを選ぶ。",
        incorrectReason:
          "リアルタイムが不要で一定時間の同時観測ができる条件では、スタティックも有力な候補です。",
      },
      {
        id: "newest-method-no-conditions",
        label: "最も新しい方式を選べば現場条件を確認する必要はない。",
        incorrectReason:
          "方式の新旧ではなく、必要精度、成果用途、通信、観測時間等を総合確認します。",
      },
    ],
    correctOptionId: "consider-static-postprocess",
    correctReason:
      "現場ですぐ結果が不要で、複数地点で一定時間観測できるため、保存した観測データを後処理で基線解析するスタティックを候補として検討できます。",
    fieldCheck: "成果用途、同時観測計画、基準側観測点、解析条件を確認します。",
  },
] as const satisfies readonly GnssQuizQuestion[];

export function getGnssPositioningMethodsQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return (
    gnssPositioningMethodsQuizQuestions.find(
      (question) => question.id === questionId,
    ) ?? null
  );
}

export function getGnssPositioningMethodsQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssPositioningMethodsQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssPositioningMethodsQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssPositioningMethodsQuizQuestion(questionId);
  const selectedOption = question?.options.find(
    (option) => option.id === optionId,
  );
  const correctOption = question?.options.find(
    (option) => option.id === question.correctOptionId,
  );

  if (!question || !selectedOption || !correctOption) {
    return null;
  }

  return {
    questionId,
    selectedOptionId: selectedOption.id,
    selectedOptionLabel: selectedOption.label,
    correctOptionId: correctOption.id,
    correctOptionLabel: correctOption.label,
    isCorrect: selectedOption.id === correctOption.id,
    selectedAnswerReason: selectedOption.incorrectReason,
    correctReason: question.correctReason,
    fieldCheck: question.fieldCheck,
  };
}
