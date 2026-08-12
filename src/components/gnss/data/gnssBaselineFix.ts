import type {
  GnssAmbiguityEvaluationStageId,
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
} from "../types";
import { fixedGnssScenario } from "./gnssOverview";

export const gnssBaselineFixCards = [
  {
    id: "rtcm-to-analysis",
    title: "RTCMは届いた。なぜまだFLOAT？",
    focus: "RTCM受信と整数アンビギュイティの固定を別の段階として捉える",
  },
  {
    id: "receiver-observation-comparison",
    title: "なぜ基準局AとP1の2地点を比較する？",
    focus: "同じ衛星を2受信機で観測し、2地点の違いに注目する",
  },
  {
    id: "double-difference",
    title: "なぜ、もう1機の衛星とも比べる？",
    focus: "2受信機・2衛星の差を組み合わせる二重差の基本を理解する",
  },
  {
    id: "float-state",
    title: "FLOATでは、何が分かっていて何が未確定？",
    focus: "FLOATにも基線・位置とアンビギュイティの推定解があると理解する",
  },
  {
    id: "ambiguity-candidate-evaluation",
    title: "どうやって整数候補を絞ってFIXする？",
    focus: "複数候補を観測全体との整合性から段階的に評価する",
  },
  {
    id: "three-dimensional-baseline",
    title: "FIXすると、基線はどう変わる？",
    focus: "固定した整数条件とAからP1への3次元基線を結び付ける",
  },
  {
    id: "fix-monitoring",
    title: "一度FIXしたら、そのままずっとFIX？",
    focus: "FIX後も観測と整合性監視が続き、FLOATへ戻る場合を理解する",
  },
  {
    id: "fix-and-result-acceptance",
    title: "FIXしているのに、成果が間違うことはある？",
    focus: "RTK固定解と成果採用の条件を分け、ミスFIXも確認する",
  },
  {
    id: "rtcm-to-fix-summary",
    title: "RTCM受信からFIXまでをつなげよう",
    focus: "第5章から第7章までをP1の位置へ至る1本の流れにまとめる",
  },
] as const;

export const gnssBaselineFixMapSteps = [
  { id: "rtcm-received", label: "RTCMがP1へ届いた", chapter: "第6章" },
  {
    id: "combine-observations",
    label: "基準局側情報 ＋ P1自身のGNSS観測",
    chapter: "第7章",
  },
  { id: "compare-receivers", label: "AとP1の観測を比較", chapter: "第7章" },
  { id: "double-difference", label: "2衛星・2受信機の差を見る", chapter: "第7章" },
  {
    id: "estimate-unknowns",
    label: "基線と整数アンビギュイティを推定",
    chapter: "第7章",
  },
  { id: "float", label: "FLOAT", chapter: "第7章" },
  { id: "evaluate-candidates", label: "整数候補を評価", chapter: "第7章" },
  { id: "fix-integers", label: "必要な整数を固定", chapter: "第7章" },
  { id: "fix", label: "FIX", chapter: "第7章" },
  { id: "baseline", label: "A → P1 の3次元基線", chapter: "第7章" },
  {
    id: "p1-position",
    label: "基準局Aの座標 ＋ 基線 → P1の位置",
    chapter: "第7章",
  },
  {
    id: "field-check",
    label: "成果採用前の現場点検",
    chapter: "第8章へ",
  },
] as const;

export const gnssBaselineReceiverComparison = [
  {
    id: "base-a",
    label: "基準局A",
    role: "位置が分かっている受信機",
    observation: "衛星G1の搬送波位相等を観測",
  },
  {
    id: "rover-p1",
    label: "移動局P1",
    role: "位置を求めたい受信機",
    observation: "対応する時刻に同じ衛星G1を観測",
  },
] as const;

export const gnssBaselineReceiverDifferenceEffects = [
  {
    id: "representative-cancellation",
    label: "相殺できる代表例",
    items: ["衛星時計に関する共通項など"],
    note: "同じ衛星を2受信機で比べることで共通項を差し引く",
  },
  {
    id: "spatial-correlation",
    label: "近距離なら差が小さくなりやすいもの",
    items: ["大気遅延", "軌道誤差等の空間的に相関する影響"],
    note: "完全に消えるとは限らない",
  },
  {
    id: "receiver-specific",
    label: "残るもの",
    items: ["マルチパス", "観測ノイズ", "地点固有の影響"],
    note: "現場ごと・受信機ごとの影響は別途残る",
  },
] as const;

export const gnssBaselineDoubleDifferenceSteps = [
  {
    id: "satellite-g1-difference",
    satellite: "衛星 G1",
    expression: "P1の観測 − Aの観測",
    result: "受信機間の差①",
  },
  {
    id: "satellite-g2-difference",
    satellite: "衛星 G2",
    expression: "P1の観測 − Aの観測",
    result: "受信機間の差②",
  },
] as const;

export const gnssBaselineDoubleDifferenceEffects = [
  {
    id: "clock-terms",
    label: "二重差で代表的に相殺",
    items: ["衛星時計に関する共通項", "受信機時計差"],
  },
  {
    id: "correlated-effects",
    label: "近距離で低減しやすい",
    items: ["大気遅延", "軌道誤差等の相関する影響"],
  },
  {
    id: "remaining-effects",
    label: "二重差後も残る",
    items: [
      "マルチパス",
      "観測ノイズ",
      "地点固有の影響",
      "整数アンビギュイティ",
    ],
  },
] as const;

export const gnssBaselineFloatEstimates = [
  { id: "ambiguity-1", label: "模式アンビギュイティ 1", value: 11.82 },
  { id: "ambiguity-2", label: "模式アンビギュイティ 2", value: 18.17 },
  { id: "ambiguity-3", label: "模式アンビギュイティ 3", value: 24.91 },
] as const;

export const gnssBaselineAmbiguityCandidates = [
  { id: "candidate-a", label: "候補A", values: [12, 18, 25] },
  { id: "candidate-b", label: "候補B", values: [12, 19, 25] },
  { id: "candidate-c", label: "候補C", values: [13, 18, 25] },
] as const;

export const gnssBaselineCandidateSchematicNote =
  "※教材用の模式例です。実際の受信機は、複数衛星・複数周波数・複数の観測量等を用いた専用解析で整数候補を探索・評価します。具体的なratio値・固定しきい値・探索アルゴリズムは再現していません。";

export const gnssBaselineCandidateEpochNote =
  "「次の観測を見る」は判断材料が増える様子を示す教材操作です。実際のRTKでは継続更新される観測等を利用しますが、条件によっては単一エポックで整数固定が成立する解析もあり、複数時刻の観測が必ず必要という意味ではありません。";

type GnssBaselineConsistency = "高" | "中" | "低";

interface GnssBaselineCandidateEvaluation {
  readonly candidateId: (typeof gnssBaselineAmbiguityCandidates)[number]["id"];
  readonly consistency: GnssBaselineConsistency;
  readonly marker: "◎" | "○" | "△";
  readonly reason: string;
}

export interface GnssBaselineAmbiguityEvaluationStage {
  readonly id: GnssAmbiguityEvaluationStageId;
  readonly stepLabel: string;
  readonly status: "FLOAT" | "FIX";
  readonly evaluations: readonly GnssBaselineCandidateEvaluation[];
  readonly conclusion: string;
  readonly nextAction: string;
}

export const gnssBaselineAmbiguityEvaluationStages = [
  {
    id: "initial",
    stepLabel: "判断材料 1 / 3",
    status: "FLOAT",
    evaluations: [
      {
        candidateId: "candidate-a",
        consistency: "高",
        marker: "◎",
        reason: "今見えている観測とはよく整合する",
      },
      {
        candidateId: "candidate-b",
        consistency: "高",
        marker: "◎",
        reason: "候補Aと同程度に観測へ整合する",
      },
      {
        candidateId: "candidate-c",
        consistency: "中",
        marker: "○",
        reason: "一部は整合するが差が見え始めている",
      },
    ],
    conclusion: "有力候補が複数あり、まだ十分に区別できない",
    nextAction: "FLOATを維持し、さらに判断材料を見る",
  },
  {
    id: "comparison",
    stepLabel: "判断材料 2 / 3",
    status: "FLOAT",
    evaluations: [
      {
        candidateId: "candidate-a",
        consistency: "中",
        marker: "○",
        reason: "追加された観測とのずれが大きくなった",
      },
      {
        candidateId: "candidate-b",
        consistency: "高",
        marker: "◎",
        reason: "追加された観測とも引き続きよく整合する",
      },
      {
        candidateId: "candidate-c",
        consistency: "低",
        marker: "△",
        reason: "観測全体との不整合が目立つ",
      },
    ],
    conclusion: "候補Bが最良だが、固定してよいかをさらに確認する",
    nextAction: "最良候補と固定してよい候補を区別し、FLOATを維持する",
  },
  {
    id: "fixed",
    stepLabel: "判断材料 3 / 3",
    status: "FIX",
    evaluations: [
      {
        candidateId: "candidate-a",
        consistency: "低",
        marker: "△",
        reason: "追加の判断材料を含めると整合しない",
      },
      {
        candidateId: "candidate-b",
        consistency: "高",
        marker: "◎",
        reason: "追加の判断材料でも一貫して整合する",
      },
      {
        candidateId: "candidate-c",
        consistency: "低",
        marker: "△",
        reason: "観測全体との不整合が続く",
      },
    ],
    conclusion: "候補Bを十分に確からしい固定解として採用する",
    nextAction: "必要な整数アンビギュイティを固定し、FIXへ進む",
  },
] as const satisfies readonly GnssBaselineAmbiguityEvaluationStage[];

export function getGnssBaselineAmbiguityEvaluationStage(
  stageId: string,
): GnssBaselineAmbiguityEvaluationStage | null {
  return (
    gnssBaselineAmbiguityEvaluationStages.find((stage) => stage.id === stageId) ??
    null
  );
}

export function getNextGnssBaselineAmbiguityEvaluationStageId(
  stageId: string,
): GnssAmbiguityEvaluationStageId | null {
  const stageIndex = gnssBaselineAmbiguityEvaluationStages.findIndex(
    (stage) => stage.id === stageId,
  );

  if (stageIndex < 0) {
    return null;
  }

  const nextStage = gnssBaselineAmbiguityEvaluationStages[stageIndex + 1];

  return nextStage?.id ?? null;
}

export const gnssBaselineFixScenario = fixedGnssScenario;

export const gnssBaselineResultConditions = [
  {
    id: "rtk-analysis",
    label: "RTK解析",
    items: ["整数アンビギュイティ", "A→P1の3次元基線"],
  },
  {
    id: "base-station",
    label: "基準局",
    items: ["基準局座標", "基準点との結び付け"],
  },
  {
    id: "survey-point",
    label: "観測点",
    items: ["アンテナ高", "求心", "測点との結び付け"],
  },
  {
    id: "result-conditions",
    label: "成果条件",
    items: ["測地系", "系番号", "座標の時点", "高さ基準"],
  },
] as const;

export const gnssBaselineDeviceDisplayRows = [
  {
    id: "communication",
    theory: "基準局側情報が届いているか",
    deviceExample: "Status / RTCM3",
    note: "Drogger-GPSの通信状況表示例",
  },
  {
    id: "age",
    theory: "基準局・移動局観測の時間差",
    deviceExample: "Age",
    note: "Drogger公式では観測データの時間差（秒）",
  },
  {
    id: "float",
    theory: "整数アンビギュイティ未固定",
    deviceExample: "FixMode：Float",
    note: "解なしではなくFLOAT解",
  },
  {
    id: "fixed",
    theory: "必要な整数を固定したRTK固定解",
    deviceExample: "FixMode：FIXED",
    note: "成果条件全体の合格表示ではない",
  },
] as const;

export const gnssBaselineExternalLinks = [
  {
    id: "rtk-rover-confirm",
    cardIds: [1, 4, 9],
    label: "RTK移動局の動作確認｜Drogger公式マニュアル",
    href: "https://www.bizstation.jp/ja/drogger/man/rtk_confirm.html",
  },
  {
    id: "relative-positioning-errors",
    cardIds: [2],
    label: "高精度 GNSSを学ぼう その2 誤差と測位方式｜Drogger公式ブログ",
    href: "https://drogger.hatenadiary.jp/entry/2023/06/02/095559",
  },
  {
    id: "processor-baseline",
    cardIds: [6],
    label: "Drogger Processor 基線解析｜Drogger公式マニュアル",
    href: "https://www.bizstation.jp/ja/drogger/man/drp_base_line_proc.html",
  },
  {
    id: "rtk-guide",
    cardIds: [7],
    label: "Drogger RTKガイド｜Drogger公式ブログ",
    href: "https://drogger.hatenadiary.jp/entry/RTK_GUIDE",
  },
  {
    id: "false-fix",
    cardIds: [8],
    label: "RTKとは？ スタティックとは？ 高精度 GNSSを学ぼう その3｜Drogger公式ブログ",
    href: "https://drogger.hatenadiary.jp/entry/2025/11/18/111838",
  },
  {
    id: "antenna-height",
    cardIds: [8],
    label: "アンテナ高｜Drogger公式マニュアル",
    href: "https://www.bizstation.jp/ja/drogger/man/antenna_height.html",
  },
  {
    id: "epoch-correction",
    cardIds: [8],
    label: "今期・元期と地殻変動補正｜Drogger公式マニュアル",
    href: "https://www.bizstation.jp/ja/drogger/man/smd.html",
  },
] as const;

export const gnssBaselineFixQuizQuestions = [
  {
    id: "rtcm-received-still-float",
    questionType: "仕組み理解",
    prompt:
      "Drogger-GPSで通信状況は正常で、RTCMも継続して受信しています。しかしFixModeはFloatです。最も適切な説明はどれですか？",
    options: [
      {
        id: "q01-rtcm-always-immediate-fix",
        label: "RTCMを受信していれば、本来必ず直ちにFIXする",
        incorrectReason:
          "RTCM受信正常だけでは、整数アンビギュイティの固定を保証しません。",
      },
      {
        id: "q01-communication-normal-ambiguity-float",
        label:
          "通信は正常でも、整数アンビギュイティをまだ固定できていない場合がある",
        incorrectReason: null,
      },
      {
        id: "q01-float-means-no-rtcm",
        label: "Floatなら基準局のRTCMは一切届いていない",
        incorrectReason: "RTCMを正常受信していてもFLOATはあり得ます。",
      },
      {
        id: "q01-float-means-wrong-base-coordinate",
        label: "Floatは基準局座標が必ず間違っていることを示す",
        incorrectReason:
          "基準局座標の誤りだけがFLOATの原因ではありません。また基準局座標が誤っていてもFIXする場合があります。",
      },
    ],
    correctOptionId: "q01-communication-normal-ambiguity-float",
    correctReason:
      "RTCM受信とFIX成立は別です。RTCMが届いた後、基準局側情報と移動局自身のGNSS観測を使って整数アンビギュイティを評価します。通信経路が正常でもFLOATのままの場合があります。",
    fieldCheck: "通信状況とFixModeを別々の状態として確認する。",
  },
  {
    id: "baseline-definition",
    questionType: "用語整理",
    prompt: "自前RTKでいう「基線」の説明として最も適切なのはどれですか？",
    options: [
      {
        id: "q02-horizontal-distance-only",
        label: "基準局とP1を結ぶ水平距離だけ",
        incorrectReason:
          "水平距離だけでは高さ方向を表せず、3次元の相対位置として不十分です。",
      },
      {
        id: "q02-distance-to-nearest-satellite",
        label: "基準局から最も近い衛星までの距離",
        incorrectReason: "衛星までの距離ではありません。",
      },
      {
        id: "q02-three-dimensional-relative-position",
        label: "基準局AからP1へのX・Y・高さを含む3次元の相対的な位置関係",
        incorrectReason: null,
      },
      {
        id: "q02-rtcm-communication-range",
        label: "基準局が送信するRTCMの通信距離",
        incorrectReason: "RTCMを伝送できる通信距離を意味する言葉ではありません。",
      },
    ],
    correctOptionId: "q02-three-dimensional-relative-position",
    correctReason:
      "基線は単なる距離ではなく、基準局と移動局の3次元の相対位置関係です。本教材では既存のX・Y・高さで模式化します。",
    fieldCheck: "基線の北・東・高さ成分を分けて確認する。",
  },
  {
    id: "double-difference-concept",
    questionType: "仕組み理解",
    prompt:
      "第7章で扱う「二重差」の基本イメージとして最も適切なのはどれですか？",
    options: [
      {
        id: "q03-two-receivers-two-satellites",
        label:
          "2受信機で同じ衛星の観測差を取り、さらに別衛星との観測差を組み合わせる",
        incorrectReason: null,
      },
      {
        id: "q03-average-p1-coordinate",
        label: "P1の同じ座標を2回平均する",
        incorrectReason: "反復観測の平均処理ではありません。",
      },
      {
        id: "q03-send-rtcm-twice",
        label: "RTCMを2回送信して誤りを確認する",
        incorrectReason: "通信回数を増やす処理ではありません。",
      },
      {
        id: "q03-double-coordinate-values",
        label: "基準局座標とP1座標をそれぞれ2倍する",
        incorrectReason: "座標値を2倍する処理ではありません。",
      },
    ],
    correctOptionId: "q03-two-receivers-two-satellites",
    correctReason:
      "二重差は、2受信機・2衛星の観測差を組み合わせる代表的な考え方です。時計等の共通項を相殺し、整数アンビギュイティを扱う相対測位へつなげます。",
    fieldCheck: "受信機2台と衛星2機の組合せを図で確認する。",
  },
  {
    id: "float-state-meaning",
    questionType: "用語整理",
    prompt: "FLOATの状態について最も適切なのはどれですか？",
    options: [
      {
        id: "q04-no-position-computation",
        label: "P1の位置について何も計算できていない",
        incorrectReason: "FLOATでも位置解・基線推定は存在します。",
      },
      {
        id: "q04-integers-already-fixed",
        label: "整数アンビギュイティを正しい整数として確定済み",
        incorrectReason: "それはFIXの説明です。",
      },
      {
        id: "q04-before-rtcm-only",
        label: "基準局からRTCMを受け取る前の状態だけを指す",
        incorrectReason:
          "RTCMを正常に受信している状態でもFLOATになる場合があります。",
      },
      {
        id: "q04-estimated-but-not-fixed",
        label:
          "基線やアンビギュイティは推定しているが、必要な整数をまだ固定解として採用できていない",
        incorrectReason: null,
      },
    ],
    correctOptionId: "q04-estimated-but-not-fixed",
    correctReason:
      "FLOATは解なしではありません。位置・基線やアンビギュイティの推定解はありますが、必要な整数アンビギュイティを固定解としてまだ採用できていない状態です。",
    fieldCheck: "Float表示を解なしと読み替えない。",
  },
  {
    id: "ambiguity-candidate-fixing",
    questionType: "仕組み理解",
    prompt: "FLOATからFIXへ進む考え方として最も適切なのはどれですか？",
    options: [
      {
        id: "q05-round-float-estimates",
        label: "FLOATの整数推定値を単純に四捨五入する",
        incorrectReason:
          "実数推定値を最も近い整数へ丸めるだけではありません。",
      },
      {
        id: "q05-evaluate-multiple-candidates",
        label:
          "複数の整数候補について観測全体との整合性を評価し、十分に確からしい候補を固定する",
        incorrectReason: null,
      },
      {
        id: "q05-fix-first-candidate-after-rtcm",
        label: "RTCMを1回受信した時点で最初の候補を固定する",
        incorrectReason: "RTCMを受信したこと自体は整数固定を意味しません。",
      },
      {
        id: "q05-use-one-nearest-satellite",
        label: "最も近い衛星1機だけから整数を決める",
        incorrectReason:
          "1衛星だけではなく、複数の観測を組み合わせて評価します。",
      },
    ],
    correctOptionId: "q05-evaluate-multiple-candidates",
    correctReason:
      "FIXは単純な丸め処理ではありません。複数の観測を利用して整数候補を比較し、十分に整合する固定解を採用します。",
    fieldCheck: "候補の優劣と固定判断を別の段階として確認する。",
  },
  {
    id: "fix-baseline-effect",
    questionType: "仕組み理解",
    prompt:
      "整数アンビギュイティをFIXできたときの説明として最も適切なのはどれですか？",
    options: [
      {
        id: "q06-correct-base-coordinate-automatically",
        label: "基準局Aの座標も自動的に正しい値へ修正される",
        incorrectReason:
          "FIXは基準局へ設定した座標の正しさを保証しません。",
      },
      {
        id: "q06-measure-antenna-height-automatically",
        label: "P1のアンテナ高が自動的に測定される",
        incorrectReason:
          "アンテナ高は別途正しく設定・確認する成果条件です。",
      },
      {
        id: "q06-high-precision-three-dimensional-baseline",
        label: "固定した整数条件を使って、A→P1の3次元基線を高精度に求められる",
        incorrectReason: null,
      },
      {
        id: "q06-align-coordinate-epochs-automatically",
        label: "座標の元期・今期も自動的に正しく統一される",
        incorrectReason:
          "元期・今期等の座標の時点はFIXとは別の確認事項です。",
      },
    ],
    correctOptionId: "q06-high-precision-three-dimensional-baseline",
    correctReason:
      "FIXでは必要な整数アンビギュイティを固定し、その条件を使って基準局と移動局の相対位置・基線を高精度に推定します。",
    fieldCheck: "FIXと基線、基準局座標を別々に確認する。",
  },
  {
    id: "fix-can-return-float",
    questionType: "品質管理",
    prompt: "一度FIXした後の説明として最も適切なのはどれですか？",
    options: [
      {
        id: "q07-continue-monitoring-and-return-float",
        label:
          "FIX後も観測は続き、信号追跡の中断などで固定解を維持できなくなればFLOATへ戻ることがある",
        incorrectReason: null,
      },
      {
        id: "q07-fix-until-power-off",
        label: "一度FIXすれば受信機の電源を切るまで必ずFIXが続く",
        incorrectReason: "FIXは永久状態ではありません。",
      },
      {
        id: "q07-float-always-hardware-failure",
        label: "FLOATへ戻った場合は必ず受信機故障である",
        incorrectReason:
          "観測条件の変化等でもFLOATへ戻ることがあり、故障と断定できません。",
      },
      {
        id: "q07-stop-observations-after-fix",
        label: "FIX後はGNSS衛星の観測を終了する",
        incorrectReason: "FIX後もGNSS観測は継続します。",
      },
    ],
    correctOptionId: "q07-continue-monitoring-and-return-float",
    correctReason:
      "FIX後も観測と解の監視は続きます。搬送波の追跡中断、観測条件の変化等により固定解を維持できない場合は、FLOAT等へ戻って再評価されることがあります。",
    fieldCheck: "FIX後も測位状態と観測環境の変化を確認する。",
  },
  {
    id: "fix-vs-result-acceptance",
    questionType: "総合問題",
    prompt:
      "P1がFIXになりました。成果として使用するときの判断として最も適切なのはどれですか？",
    options: [
      {
        id: "q08-fix-corrects-base-coordinate",
        label: "FIXなら基準局座標が間違っていても成果は自動補正される",
        incorrectReason:
          "基準局座標が誤っていれば、その影響がP1成果へ伝わる場合があります。",
      },
      {
        id: "q08-no-height-checks-needed",
        label: "FIXならアンテナ高や高さ基準は確認不要",
        incorrectReason:
          "アンテナ高や高さ基準はFIXとは別途確認する必要があります。",
      },
      {
        id: "q08-false-fix-impossible",
        label: "FIXなら誤った整数を固定する可能性はない",
        incorrectReason:
          "誤った整数候補を固定してしまうミスFIXの可能性はゼロではありません。",
      },
      {
        id: "q08-check-fix-and-result-conditions",
        label:
          "FIXを確認したうえで、基準局座標・アンテナ高・座標の時点・高さ基準・観測結果等も確認する",
        incorrectReason: null,
      },
    ],
    correctOptionId: "q08-check-fix-and-result-conditions",
    correctReason:
      "FIXはRTK固定解が得られたことを示しますが、基準局座標、アンテナ高、座標の時点、高さ基準、観測環境等の正しさまでは保証しません。またミスFIXの可能性もあるため、FIX表示と成果採用は別の工程です。",
    fieldCheck: "FIX表示に加えて成果採用条件を順に点検する。",
  },
] as const satisfies readonly GnssQuizQuestion[];

export function getGnssBaselineFixQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return (
    gnssBaselineFixQuizQuestions.find(
      (question) => question.id === questionId,
    ) ?? null
  );
}

export function getGnssBaselineFixQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssBaselineFixQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssBaselineFixQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssBaselineFixQuizQuestion(questionId);
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
