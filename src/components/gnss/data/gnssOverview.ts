import type {
  GnssCoordinatePoint,
  GnssInformationFlowStep,
  GnssMethod,
  GnssPointDifference,
  GnssPositioningState,
  GnssQualityCheck,
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
  GnssRepresentativeCase,
  GnssWorkflowStep,
} from "../types";

export const gnssRepresentativeCase = {
  target: "一般の調査・測量",
  targetPoint: "P1",
  expectedResult: "平面位置 ＋ 高さ",
  practicalExamples:
    "GNSSは、電探やオーリスの探査位置、深浅測量の基準点・測量点、ドローンの基準点・検証点など、さまざまな現場で位置を記録・設定するために利用されます。この章では、それらを代表して一般の調査・測量で使用する新点P1の平面位置と高さを求めます。",
  resultUsageLabel: "一般の調査・測量点",
} as const satisfies GnssRepresentativeCase;

export const gnssWorkflowSteps = [
  {
    id: "planning",
    number: 1,
    title: "計画",
    fieldAction: "P1の用途、必要な成果、観測方式、点検方法を決める。",
    importantItems: ["必要精度", "座標・高さの基準", "現場条件"],
    laterLesson: "観測計画と方式選択",
  },
  {
    id: "verify-known-point",
    number: 2,
    title: "既知点Aを確認",
    fieldAction: "点名、既知座標、座標系、高さの基準、現地の保存状態を照合する。",
    importantItems: ["既知点成果", "座標系", "現地の点の同一性"],
    laterLesson: "座標・高さの基準と既知点確認",
  },
  {
    id: "install-base-station",
    number: 3,
    title: "基準局を設置",
    fieldAction: "既知点Aの上へ基準局アンテナを設置する。",
    importantItems: ["基準局座標", "アンテナ高", "上空視界"],
    laterLesson: "自前RTK「基準局をつくる」",
  },
  {
    id: "send-base-information",
    number: 4,
    title: "基準局側の情報を移動局へ送る",
    fieldAction: "基準局側で得た情報を、使用する通信経路で移動局へ届ける。",
    importantItems: ["情報の送り元", "通信経路", "接続状態"],
    laterLesson: "自前RTKの通信・補正情報",
  },
  {
    id: "move-rover-to-p1",
    number: 5,
    title: "移動局でP1へ移動",
    fieldAction: "移動局を新点P1へ据え、アンテナ高と周辺環境を確認する。",
    importantItems: ["点名P1", "移動局アンテナ高", "上空視界"],
    laterLesson: "移動局の据付と観測",
  },
  {
    id: "single-float-fix",
    number: 6,
    title: "SINGLE → FLOAT → FIX",
    fieldAction: "測位状態の変化を確認し、固定解が得られたことを記録する。",
    importantItems: ["測位状態", "観測条件", "状態の安定"],
    laterLesson: "GNSS観測原理とFIX",
  },
  {
    id: "record-p1",
    number: 7,
    title: "P1を記録",
    fieldAction: "P1の座標、高さ、点名、アンテナ高、観測状態を記録する。",
    importantItems: ["座標値", "点名・用途", "原観測記録"],
    laterLesson: "観測記録とデータ管理",
  },
  {
    id: "inspection",
    number: 8,
    title: "点検",
    fieldAction: "設定値、既知点確認、再観測などにより結果を点検する。",
    importantItems: ["設定値の照合", "既知点確認", "再観測"],
    laterLesson: "GNSS成果の品質管理",
  },
  {
    id: "confirm-result",
    number: 9,
    title: "成果確認",
    fieldAction: "点検結果と付帯情報を確認し、用途に使える成果か判断する。",
    importantItems: ["座標・高さの基準", "点検結果", "使用目的"],
    laterLesson: "成果整理と現場判断",
  },
] as const satisfies readonly GnssWorkflowStep[];

export const gnssInformationFlowSteps = [
  {
    id: "satellites",
    label: "GNSS衛星",
    description: "複数のGNSS衛星から、測位に使う信号を受信する。",
  },
  {
    id: "base-observation",
    label: "基準局の観測",
    description: "既知点Aに置いた基準局も、衛星からの信号を観測する。",
  },
  {
    id: "base-information",
    label: "基準局側の情報",
    description: "既知の基準局座標と観測をもとに、移動局で使う情報を用意する。",
  },
  {
    id: "communication",
    label: "通信",
    description: "基準局側の情報を、選んだ通信経路で移動局へ届ける。",
  },
  {
    id: "rover-observation",
    label: "移動局の観測 + 基準局側の情報",
    description: "P1の移動局自身の観測と、届いた基準局側の情報を組み合わせる。",
  },
  {
    id: "rtk-analysis",
    label: "RTK解析",
    description: "移動局で両方の情報を解析し、基準局との位置関係を求める。",
  },
  {
    id: "p1-position",
    label: "P1の位置",
    description: "基準局座標を基準として、P1の座標と高さを得る。",
  },
] as const satisfies readonly GnssInformationFlowStep[];

export const gnssMethods = [
  {
    id: "own-rtk",
    label: "自前基準局RTK",
    shortLabel: "自前RTK",
    fieldBaseStation: "必要",
    informationSource: "自分の基準局",
    communicationPath: "基準局 → 移動局",
    canMeasureP1: "できる",
    summary: "既知点Aに自分で基準局を設け、その情報をP1の移動局へ送る。",
    caution: "基準局座標、アンテナ高、通信設定を自分で確認する。",
    diagramSource: "既知点AのPパッケージ基準局",
    diagramPath: "基準局A → 移動局（基準局側の情報）",
  },
  {
    id: "network-rtk",
    label: "ネットワーク型RTK",
    shortLabel: "NRTK",
    fieldBaseStation: "不要",
    informationSource: "配信サービス",
    communicationPath: "インターネット",
    canMeasureP1: "できる",
    summary: "現場に自前基準局を置かず、配信サービスから情報を受け取る。",
    caution: "配信条件、接続、座標・高さの基準を確認する。",
    diagramSource: "ネットワーク型RTK配信サービス",
    diagramPath: "配信サービス → インターネット → 移動局",
  },
  {
    id: "clas",
    label: "CLAS",
    shortLabel: "CLAS",
    fieldBaseStation: "不要",
    informationSource: "みちびき",
    communicationPath: "衛星",
    canMeasureP1: "できる",
    summary: "CLAS対応受信機で、みちびきから送られる補強情報を受け取る。",
    caution: "ネットワーク型RTKを単にインターネットなしにした方式ではない。対応機器、上空視界、利用条件を確認する。",
    diagramSource: "みちびき（準天頂衛星）",
    diagramPath: "みちびき → 衛星経由 → 移動局",
  },
] as const satisfies readonly GnssMethod[];

export const gnssPositioningStates = [
  {
    id: "single",
    label: "SINGLE",
    summary: "単独測位の状態",
    fieldMeaning: "まだRTKの固定解ではありません。観測条件と情報受信を確認します。",
  },
  {
    id: "float",
    label: "FLOAT",
    summary: "RTKで固定解に至っていない状態",
    fieldMeaning: "解析は進んでいますが、P1の成果として確定する段階ではありません。",
  },
  {
    id: "fix",
    label: "FIX",
    summary: "RTKの固定解が得られた状態",
    fieldMeaning: "座標を記録できます。ただし設定と観測の点検は続きます。",
  },
] as const satisfies readonly GnssPositioningState[];

export const gnssQualityChecks = [
  {
    id: "base-coordinate",
    label: "基準局座標",
    reason: "点名、X・Y、座標系が既知点成果と一致するか確認する。",
  },
  {
    id: "base-antenna-height",
    label: "基準局アンテナ高",
    reason: "測定値、入力値、測定基準位置を照合する。",
  },
  {
    id: "rover-antenna-height",
    label: "移動局アンテナ高",
    reason: "P1での測定値と入力値を照合する。",
  },
  {
    id: "coordinate-system",
    label: "座標系",
    reason: "使用する測地系、平面直角座標系の系番号などを確認する。",
  },
  {
    id: "height-reference",
    label: "高さの種類・基準",
    reason: "標高、楕円体高など、成果に必要な高さと基準を確認する。",
  },
  {
    id: "point-name-purpose",
    label: "点名・用途",
    reason: "P1の点名と、この成果を使用する目的を記録する。",
  },
  {
    id: "known-point-or-reobservation",
    label: "既知点確認または再観測",
    reason: "独立した確認や再観測で、同じ結果が得られるか点検する。",
  },
  {
    id: "sky-view-environment",
    label: "上空視界・周辺環境",
    reason: "遮蔽や反射の影響が疑われる環境でなかったか記録する。",
  },
] as const satisfies readonly GnssQualityCheck[];

export const fixedGnssScenario = {
  knownPoint: {
    name: "A",
    x: 1000.0,
    y: 1000.0,
    elevation: 50.0,
  },
  baseStation: {
    label: "Pパッケージ基準局",
    equipment: "DG-RPO1RWS + u-blox ANN-MB-00",
    antennaHeight: 1.8,
  },
  newPoint: {
    name: "P1",
    x: 1012.345,
    y: 1008.765,
    elevation: 49.832,
  },
  rover: {
    label: "移動局",
    antennaHeight: 2.0,
  },
  offsetFromKnownPoint: {
    north: 12.345,
    east: 8.765,
    height: -0.168,
  },
} as const;

export const gnssQuizQuestions = [
  {
    id: "gnss-q01-base-coordinate",
    questionType: "仕組み理解",
    prompt:
      "既知点Aに基準局を設置し、P1でFIXした。しかし、基準局へ入力したX座標が実際の既知点座標より0.500 m大きかった。最も適切な説明はどれか。",
    options: [
      {
        id: "fix-auto-corrects-base",
        label: "FIXなので基準局座標の誤りは自動的に補正される。",
        incorrectReason:
          "FIXは解析上の固定解を示しますが、入力した基準局の絶対座標が正しいことまでは確認しません。",
      },
      {
        id: "result-inherits-base-error",
        label:
          "基準局とP1の相対関係を高精度に求めても、P1の成果座標は誤った基準局座標の影響を受ける。",
        incorrectReason: null,
      },
      {
        id: "elevation-only",
        label: "影響するのは標高だけで、X・Yには影響しない。",
        incorrectReason:
          "この条件は基準局のX座標の誤りなので、P1のX座標へ影響します。高さだけの問題ではありません。",
      },
      {
        id: "wrong-base-never-fixes",
        label: "基準局座標が誤っていれば必ずFLOATになり、FIXにはならない。",
        incorrectReason:
          "誤った絶対座標を設定していても、基準局と移動局の解析がFIXになる場合があります。",
      },
    ],
    correctOptionId: "result-inherits-base-error",
    correctReason:
      "FIXは基準局へ入力した絶対座標の正しさを保証しない。自前RTKでは基準局座標が成果座標の基準となるため、基準局座標の誤りはP1の成果へ影響する。",
    fieldCheck:
      "観測開始前と成果使用前に、基準局の点名、座標、座標系を既知点成果と照合する。",
  },
  {
    id: "gnss-q02-fix-quality",
    questionType: "品質管理",
    prompt:
      "P1がFIXした。成果として使用する前の行動として最も適切なのはどれか。",
    options: [
      {
        id: "use-immediately",
        label: "FIXなので、そのまま成果として確定する。",
        incorrectReason:
          "FIXだけでは、基準局座標、アンテナ高、座標・高さの基準などの設定誤りを発見できません。",
      },
      {
        id: "record-coordinate-only",
        label: "座標値だけ記録し、観測条件は残さない。",
        incorrectReason:
          "座標値だけでは観測条件や設定を追跡できず、後から成果を点検できません。",
      },
      {
        id: "verify-settings-and-observation",
        label:
          "基準局座標、基準局・移動局のアンテナ高、座標・高さの基準、既知点や再観測による点検を確認する。",
        incorrectReason: null,
      },
      {
        id: "satellite-count-only",
        label: "衛星数だけ確認すれば十分である。",
        incorrectReason:
          "衛星数は確認材料の一つですが、設定値、基準、点名、再観測などの確認を置き換えません。",
      },
    ],
    correctOptionId: "verify-settings-and-observation",
    correctReason:
      "FIXは重要な測位状態だが、設定値や座標基準、アンテナ高、観測記録などの誤りを保証するものではない。成果として使用する前に品質管理上の確認が必要である。",
    fieldCheck:
      "成果値とともに、基準局・移動局の設定、観測条件、点検結果を記録して照合する。",
  },
  {
    id: "gnss-q03-field-method",
    questionType: "方式選択",
    prompt:
      "山間部で携帯通信が不安定。ただし観測地点は比較的上空が開けている。現場に自前基準局を設置せずに高精度GNSS測位を行いたい。検討候補として最も適切なのはどれか。",
    options: [
      {
        id: "network-only-no-communication-check",
        label:
          "ネットワーク型RTKだけを使う。携帯通信状態は関係しない。",
        incorrectReason:
          "ネットワーク型RTKは通常インターネット経由の配信を利用するため、携帯通信状態の確認が必要です。",
      },
      {
        id: "consider-clas-and-conditions",
        label:
          "CLAS対応受信機による測位を候補にし、上空視界や必要精度などの現場条件も確認する。",
        incorrectReason: null,
      },
      {
        id: "single-equals-rtk",
        label: "単独測位はRTKと同じなので、そのまま置き換える。",
        incorrectReason:
          "SINGLEの単独測位とRTKの固定解は同じ測位状態ではなく、必要精度を確認せず置き換えられません。",
      },
      {
        id: "fix-ignores-method",
        label: "どの方式でもFIX表示が出れば条件の違いは考えなくてよい。",
        incorrectReason:
          "方式ごとに情報源、通信経路、利用条件が異なり、FIX後も成果の点検が必要です。",
      },
    ],
    correctOptionId: "consider-clas-and-conditions",
    correctReason:
      "携帯通信に依存しない高精度GNSS測位の候補としてCLASを検討できる。ただし、上空視界や必要精度、利用条件などを確認して方式を選択する必要がある。",
    fieldCheck:
      "携帯通信、上空視界、必要精度、対応機器、利用条件を現場計画で確認する。",
  },
] as const satisfies readonly GnssQuizQuestion[];

function hasFiniteCoordinates(point: GnssCoordinatePoint): boolean {
  return [point.x, point.y, point.elevation].every(Number.isFinite);
}

export function calculateGnssPointDifference(
  origin: GnssCoordinatePoint,
  target: GnssCoordinatePoint,
): GnssPointDifference | null {
  if (!hasFiniteCoordinates(origin) || !hasFiniteCoordinates(target)) {
    return null;
  }

  return {
    north: target.x - origin.x,
    east: target.y - origin.y,
    height: target.elevation - origin.elevation,
  };
}

export function getGnssWorkflowStep(
  stepId: string,
): GnssWorkflowStep | null {
  return gnssWorkflowSteps.find((step) => step.id === stepId) ?? null;
}

export function getGnssMethod(methodId: string): GnssMethod | null {
  return gnssMethods.find((method) => method.id === methodId) ?? null;
}

export function getGnssQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return gnssQuizQuestions.find((question) => question.id === questionId) ?? null;
}

export function getGnssQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssQuizQuestion(questionId);
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
