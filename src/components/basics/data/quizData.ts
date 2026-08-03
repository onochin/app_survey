import type { BasicsLessonId } from "../basicsCourse";
import {
  fieldDecisionOptions,
  fieldDecisionScenarios,
} from "./fieldWorkflow";
import { inspectionDecisionScenarios } from "./observationError";
import { inspectionScenarios } from "./totalStationObservation";

export type BasicsQuizQuestionType = "基礎確認" | "現場判断";

export interface BasicsQuizOption {
  readonly id: string;
  readonly label: string;
  readonly incorrectReason: string | null;
}

export interface BasicsQuizQuestion {
  readonly id: string;
  readonly lessonId: BasicsLessonId;
  readonly prompt: string;
  readonly options: readonly BasicsQuizOption[];
  readonly correctOptionId: string;
  readonly correctReason: string;
  readonly fieldCheck: string;
  readonly questionType: BasicsQuizQuestionType;
  readonly sourceScenarioId: string | null;
}

export interface BasicsQuizAnswerEvaluation {
  readonly questionId: string;
  readonly selectedOptionId: string;
  readonly selectedOptionLabel: string;
  readonly correctOptionId: string;
  readonly correctOptionLabel: string;
  readonly isCorrect: boolean;
  readonly selectedAnswerReason: string;
  readonly correctReason: string;
  readonly fieldCheck: string;
}

const findScenario = <T extends { readonly id: string }>(
  scenarios: readonly T[],
  scenarioId: string,
): T => {
  const scenario = scenarios.find((candidate) => candidate.id === scenarioId);

  if (!scenario) {
    throw new Error(`確認問題が参照する固定シナリオ「${scenarioId}」がありません。`);
  }

  return scenario;
};

const backsightShiftScenario = findScenario(
  inspectionScenarios,
  "backsight-shifted",
);
const largeResidualScenario = findScenario(
  inspectionDecisionScenarios,
  "within-large-residual",
);
const fieldAdoptScenario = findScenario(
  fieldDecisionScenarios,
  "checks-complete",
);
const fieldRecalculateScenario = findScenario(
  fieldDecisionScenarios,
  "transcription-error",
);
const fieldRemeasureScenario = findScenario(
  fieldDecisionScenarios,
  "wrong-backsight",
);

const fieldDecisionLabel = (decisionId: string): string => {
  const decision = fieldDecisionOptions.find(
    (candidate) => candidate.id === decisionId,
  );

  if (!decision) {
    throw new Error(`確認問題が参照する現場判断「${decisionId}」がありません。`);
  }

  return decision.label;
};

export const basicsQuizQuestions = [
  {
    id: "basics-q01-survey-purpose",
    lessonId: "point-and-position",
    prompt:
      "新しい基準点の位置を求めたいとき、最初に整理する考え方として適切なのはどれですか。",
    options: [
      {
        id: "select-from-result",
        label: "求める成果から、必要な観測と測量方法を選ぶ",
        incorrectReason: null,
      },
      {
        id: "select-newest-instrument",
        label: "最も新しい機器を先に選び、成果は観測後に決める",
        incorrectReason:
          "機器は目的を達成する手段です。求める成果を決めずに機器だけを先に選ぶと、必要な観測や点検を整理できません。",
      },
      {
        id: "treat-new-as-known",
        label: "新点は設置した時点で既知点として扱う",
        incorrectReason:
          "新点は、測量によって位置や高さを求める点です。設置しただけでは、既知の成果を持つ点にはなりません。",
      },
      {
        id: "skip-inspection",
        label: "数値が得られれば、点検をせず成果にする",
        incorrectReason:
          "測量は観測だけで終わらず、計算・点検を経て成果へつなげます。数値が表示されたことだけでは成果にできません。",
      },
    ],
    correctOptionId: "select-from-result",
    correctReason:
      "第1章では「求める成果 → 必要な観測 → 測量方法と機器」の順で整理します。目的を先に決めることで、使う既知点、観測対象、点検方法を選べます。",
    fieldCheck:
      "作業目的、必要な成果、既知点の役割、現地観測から成果作成までの流れを作業前に確認します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q02-coordinate-reference",
    lessonId: "distance-and-direction",
    prompt:
      "2つの平面直角座標を比較するとき、X・Yの数値と一緒に確認すべきものはどれですか。",
    options: [
      {
        id: "coordinate-system-zone",
        label: "座標系と平面直角座標系の系番号",
        incorrectReason: null,
      },
      {
        id: "numbers-only",
        label: "X・Yの数値だけ",
        incorrectReason:
          "同じ数値でも、座標系や原点・系番号が異なれば表す位置が同じとは限りません。数値だけでは比較できません。",
      },
      {
        id: "geoid-only",
        label: "ジオイド高だけ",
        incorrectReason:
          "ジオイド高は楕円体高と標高を結ぶ高さの情報です。平面直角座標の比較には座標系と系番号の確認が必要です。",
      },
      {
        id: "instrument-color",
        label: "観測機器の外観色",
        incorrectReason:
          "機器の外観色は座標値の基準を示しません。成果に記された座標系、系番号、単位を照合します。",
      },
    ],
    correctOptionId: "coordinate-system-zone",
    correctReason:
      "平面直角座標は座標系、原点、系番号と一組で意味を持ちます。本教材ではXを北方向、Yを東方向として扱います。",
    fieldCheck:
      "点名、座標系、系番号、X・Yの単位と符号を成果表や既知点資料で照合します。高さは楕円体高か標高かも別に確認します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q03-horizontal-distance",
    lessonId: "height-difference",
    prompt:
      "教材の固定例で、斜距離50.000 m、高低差+30.000 mのとき、水平距離はいくらですか。",
    options: [
      {
        id: "horizontal-40",
        label: "40.000 m",
        incorrectReason: null,
      },
      {
        id: "slope-50",
        label: "50.000 m",
        incorrectReason:
          "50.000 mは機器が直接観測する斜距離です。高低差があるため、そのまま水平距離にはなりません。",
      },
      {
        id: "difference-20",
        label: "20.000 m",
        incorrectReason:
          "斜距離から高低差を単純に引く計算ではありません。直角三角形の二乗関係を使います。",
      },
      {
        id: "sum-80",
        label: "80.000 m",
        incorrectReason:
          "斜距離と高低差を加えても水平距離にはなりません。斜距離は直角三角形の斜辺です。",
      },
    ],
    correctOptionId: "horizontal-40",
    correctReason:
      "水平距離＝√（斜距離²−高低差²）なので、√（50²−30²）＝√1600＝40.000 mです。計算途中は丸めません。",
    fieldCheck:
      "機器が直接測る値、表示モード、傾斜、プリズム定数、気象条件と、成果に使う距離を区別して記録します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q04-clockwise-horizontal-angle",
    lessonId: "error-and-equipment",
    prompt:
      "後視方向の方位角が320°、前視方向の方位角が40°のとき、右回り水平角はいくらですか。",
    options: [
      {
        id: "clockwise-80",
        label: "80°",
        incorrectReason: null,
      },
      {
        id: "counterclockwise-280",
        label: "280°",
        incorrectReason:
          "280°は同じ2方向を左回りに測った角です。問題は後視から前視までの右回り水平角を尋ねています。",
      },
      {
        id: "foresight-40",
        label: "40°",
        incorrectReason:
          "40°は前視方向そのものの方位角です。水平角は後視方向を基準にした2方向間の角です。",
      },
      {
        id: "backsight-320",
        label: "320°",
        incorrectReason:
          "320°は後視方向そのものの方位角です。前視方向との差を0°以上360°未満へ正規化します。",
      },
    ],
    correctOptionId: "clockwise-80",
    correctReason:
      "右回り水平角＝前視方位角−後視方位角を正規化するため、40°−320°＝−280°を360°へ正規化して80°です。",
    fieldCheck:
      "方位角か水平角か、基準方向はどこか、右回りか左回りかを観測手簿と機器設定で確認します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q05-ts-direct-observation",
    lessonId: "total-station-observation",
    prompt:
      "第5章のTS教材で、代表的な直接観測値の組合せはどれですか。",
    options: [
      {
        id: "angles-slope-distance",
        label: "水平角・鉛直角・斜距離",
        incorrectReason: null,
      },
      {
        id: "horizontal-height-coordinate",
        label: "水平距離・測点間高低差・新点座標",
        incorrectReason:
          "これらは角度、斜距離、高さ、既知点などから求める計算値です。TSの代表的な直接観測値とは区別します。",
      },
      {
        id: "instrument-prism-height-only",
        label: "器械高・プリズム高だけ",
        incorrectReason:
          "器械高とプリズム高は現場で測定・入力する重要な値ですが、TSによる角度・距離の代表的な直接観測値の組合せではありません。",
      },
      {
        id: "result-table-only",
        label: "成果表の座標値だけ",
        incorrectReason:
          "成果表の座標値は観測、計算、点検を経た成果値です。直接観測値とは段階が異なります。",
      },
    ],
    correctOptionId: "angles-slope-distance",
    correctReason:
      "第5章では、TSが代表的に水平角・鉛直角・斜距離を直接観測し、それらと器械高・プリズム高から水平距離や高低差を計算します。",
    fieldCheck:
      "求心、整準、視差、器械高、プリズム高、プリズム定数、後視点と方向付けを観測前に照合します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q05-field-backsight-shift",
    lessonId: "total-station-observation",
    prompt: `${backsightShiftScenario.label}。${backsightShiftScenario.finding} この場合の対応として適切なのはどれですか。`,
    options: [
      {
        id: "continue-adopt",
        label: "そのまま採用する",
        incorrectReason:
          "後視方向の変化は以後の方向全体へ影響する可能性があります。原因と影響範囲が未確認のまま採用できません。",
      },
      {
        id: "adjust-reobserve",
        label: backsightShiftScenario.decision,
        incorrectReason: null,
      },
      {
        id: "recalculate-only",
        label: "観測条件を直さず計算だけをやり直す",
        incorrectReason:
          "方向付けが観測中に変化した可能性は、計算のやり直しだけでは解消できません。条件を確認し、影響した観測を再観測します。",
      },
      {
        id: "average-directions",
        label: "初期方向と点検方向を平均して採用する",
        incorrectReason:
          "方向が変化した原因と時点を確認せず平均しても、正しい基準方向には戻りません。異常を平均へ吸収しないでください。",
      },
    ],
    correctOptionId: "adjust-reobserve",
    correctReason: backsightShiftScenario.reason,
    fieldCheck: backsightShiftScenario.fieldAction,
    questionType: "現場判断",
    sourceScenarioId: backsightShiftScenario.id,
  },
  {
    id: "basics-q06-leveling-elevation",
    lessonId: "leveling-basics",
    prompt:
      "BM標高100.000 m、後視1.250 m、前視0.875 mの固定例で、新点標高はいくらですか。",
    options: [
      {
        id: "elevation-100-375",
        label: "100.375 m",
        incorrectReason: null,
      },
      {
        id: "instrument-height-101-250",
        label: "101.250 m",
        incorrectReason:
          "101.250 mはBM標高へ後視を加えた器械高です。新点標高は、そこから前視を引いて求めます。",
      },
      {
        id: "elevation-99-625",
        label: "99.625 m",
        incorrectReason:
          "後視と前視の符号を逆にしています。高低差は後視−前視なので、この例では+0.375 mです。",
      },
      {
        id: "sum-102-125",
        label: "102.125 m",
        incorrectReason:
          "器械高へ前視を加えてはいけません。水平な視準線の高さから前視を引いて新点標高を求めます。",
      },
    ],
    correctOptionId: "elevation-100-375",
    correctReason:
      "器械高＝100.000＋1.250＝101.250 m、新点標高＝101.250−0.875＝100.375 mです。高低差方式でも100.000＋（1.250−0.875）で一致します。",
    fieldCheck:
      "後視と前視の点名・役割、標尺の鉛直、視差、気泡・自動補正、転点標尺の保持を確認します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q07-systematic-error",
    lessonId: "observation-error",
    prompt:
      "観測値全体が教材用基準値より約+0.020 mだけ同じ方向へ偏る固定例について、適切な説明はどれですか。",
    options: [
      {
        id: "bias-remains",
        label: "回数を増やして平均しても、一定方向の偏りは残る",
        incorrectReason: null,
      },
      {
        id: "mean-removes-all",
        label: "平均すれば系統的な偏りは必ず0になる",
        incorrectReason:
          "同じ方向の偏りを持つ値を平均しても、その偏りは残ります。平均だけでは系統誤差を解決できません。",
      },
      {
        id: "small-scatter-accurate",
        label: "ばらつきが小さければ必ず正確である",
        incorrectReason:
          "ばらつきの小ささは精密さを示しますが、基準値から偏っていれば正確とはいえません。正確さと精密さを区別します。",
      },
      {
        id: "discard-reference",
        label: "基準値との比較はせず、観測値だけを見る",
        incorrectReason:
          "系統的な偏りは観測値同士だけでは見落とす場合があります。既知値・点検値、設定、定数、高さを照合します。",
      },
    ],
    correctOptionId: "bias-remains",
    correctReason:
      "系統誤差は一定方向へ偏るため、反復回数を増やして平均しても偏りが残ります。機器設定、定数、高さ、補正条件などの原因確認が必要です。",
    fieldCheck:
      "平均・残差・標本標準偏差だけでなく、既知値との比較、原記録、機器設定、定数、高さ、単位、点名も確認します。",
    questionType: "基礎確認",
    sourceScenarioId: "systematic",
  },
  {
    id: "basics-q07-field-large-residual",
    lessonId: "observation-error",
    prompt: `${largeResidualScenario.label}。${largeResidualScenario.finding} この固定例で適切な判断はどれですか。`,
    options: [
      {
        id: "adopt-by-closure-only",
        label: "閉合差だけを見て採用候補とする",
        incorrectReason:
          "閉合差が教材用仮定値以内でも、大きな残差は粗大誤差や相殺の可能性を示します。閉合差だけでは判断できません。",
      },
      {
        id: "correct-record-only",
        label: "原因を確認せず記録だけを数値上そろえる",
        incorrectReason:
          "原記録を根拠なく書き換えると観測の追跡性を失います。点名、単位、読定、入力と観測条件から原因を確認します。",
      },
      {
        id: "check-settings-only",
        label: "観測値を確認せず設定画面だけを見る",
        incorrectReason:
          "設定確認だけでは単発の読違い・入力ミス・点の取り違えを特定できません。原記録と反復値も照合します。",
      },
      {
        id: "investigate-reobserve",
        label: largeResidualScenario.recommendedDecision,
        incorrectReason: null,
      },
      {
        id: "universal-tolerance",
        label: "0.010 mをすべての現場の共通許容値として採用する",
        incorrectReason:
          "0.010 mはこの固定シナリオの教材用仮定値です。実務の許容値は測量方法、精度区分、路線長、作業規程で異なります。",
      },
    ],
    correctOptionId: "investigate-reobserve",
    correctReason: largeResidualScenario.reason,
    fieldCheck: `${largeResidualScenario.warningSigns.join("、")}を確認し、実務では適用する作業規程と観測条件に基づいて判断します。`,
    questionType: "現場判断",
    sourceScenarioId: largeResidualScenario.id,
  },
  {
    id: "basics-q08-coordinate-increment",
    lessonId: "coordinate-calculation",
    prompt:
      "固定サンプルで、A（X=1000.000 m、Y=500.000 m）からΔX=+30.000 m、ΔY=+40.000 m進んだ新点Bはどれですか。",
    options: [
      {
        id: "point-1030-540",
        label: "B（X=1030.000 m、Y=540.000 m）",
        incorrectReason: null,
      },
      {
        id: "point-1040-530",
        label: "B（X=1040.000 m、Y=530.000 m）",
        incorrectReason:
          "ΔXとΔYを入れ替えています。本教材ではXが北方向、Yが東方向で、ΔXは緯距、ΔYは経距です。",
      },
      {
        id: "point-970-460",
        label: "B（X=970.000 m、Y=460.000 m）",
        incorrectReason:
          "正の座標増分を既知点から引いています。新点座標は既知点座標へ各増分を加えます。",
      },
      {
        id: "point-1000-550",
        label: "B（X=1000.000 m、Y=550.000 m）",
        incorrectReason:
          "距離50 mだけをYへ加えており、方位角によるX・Y成分への分解を反映していません。",
      },
    ],
    correctOptionId: "point-1030-540",
    correctReason:
      "XB＝XA＋ΔX＝1000＋30＝1030 m、YB＝YA＋ΔY＝500＋40＝540 mです。距離は50 m、方位角は約53.130°へ逆算できます。",
    fieldCheck:
      "X北・Y東、北0°・時計回り、座標系・系番号、度とラジアン、計算途中で丸めていないことを確認します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q09-value-kind",
    lessonId: "field-workflow",
    prompt:
      "観測値と既知点・補正条件から計算し、点検と採用を経て成果表へ載せる値はどれですか。",
    options: [
      {
        id: "observed-value",
        label: "観測値",
        incorrectReason:
          "観測値は機器や観測者が直接得て原記録へ残す値です。点検・採用を経た成果表の値とは段階が異なります。",
      },
      {
        id: "calculated-value",
        label: "計算値",
        incorrectReason:
          "計算値は観測値と条件から求める途中値・点検値です。計算できただけで自動的に成果値にはなりません。",
      },
      {
        id: "result-value",
        label: "成果値",
        incorrectReason: null,
      },
      {
        id: "overwritten-raw-value",
        label: "原記録を上書きした値",
        incorrectReason:
          "原記録と生データは計算値や成果値で上書きせず、再計算できる対応関係を保って保存します。",
      },
    ],
    correctOptionId: "result-value",
    correctReason:
      "成果値は、計算値の点検と採用を経て、点名、座標系、高さの基準、単位、検査情報とともに成果表へ示す値です。",
    fieldCheck:
      "観測手簿・生データ、計算簿、検算・検査、成果表を相互に追跡でき、原記録が保全されていることを確認します。",
    questionType: "基礎確認",
    sourceScenarioId: null,
  },
  {
    id: "basics-q09-field-safety-plan",
    lessonId: "field-workflow",
    prompt:
      "踏査で立入条件と危険箇所を十分に確認できていないまま、観測開始時刻になりました。適切な判断はどれですか。",
    options: [
      {
        id: "start-on-time",
        label: "時刻を優先し、確認せず観測を始める",
        incorrectReason:
          "立入条件や危険箇所が未確認のまま開始すると、現場条件に応じた安全対策と作業計画を適用できません。",
      },
      {
        id: "confirm-before-start",
        label: "観測開始前に条件を確認し、現場の安全計画に従って判断する",
        incorrectReason: null,
      },
      {
        id: "use-universal-number",
        label: "教材内で共通の安全数値を決めて機械的に続行する",
        incorrectReason:
          "作業継続条件は現場、天候、交通、地形、適用規程などで異なります。根拠のない共通数値で判断しません。",
      },
      {
        id: "record-after-work",
        label: "観測終了後に危険箇所を記録すればよい",
        incorrectReason:
          "安全条件は作業前に確認し、必要な対策と中止・変更判断へ反映します。終了後の記録だけでは事故を予防できません。",
      },
    ],
    correctOptionId: "confirm-before-start",
    correctReason:
      "天候、視通、立入条件、交通、地形などの危険は観測前に確認し、現場ごとの安全計画と適用条件に従って作業開始・変更・中止を判断します。",
    fieldCheck:
      "踏査結果、立入許可、連絡体制、危険箇所、天候・視通、現場固有の安全計画を作業開始前に確認します。",
    questionType: "現場判断",
    sourceScenarioId: null,
  },
  {
    id: "basics-q09-field-adopt",
    lessonId: "field-workflow",
    prompt: `${fieldAdoptScenario.label}。${fieldAdoptScenario.finding} この固定例の判断はどれですか。`,
    options: [
      {
        id: "adopt",
        label: fieldDecisionLabel("adopt"),
        incorrectReason: null,
      },
      {
        id: "recalculate",
        label: fieldDecisionLabel("recalculate"),
        incorrectReason:
          "この固定例では訂正すべき転記・入力・計算誤りが見つかっていません。根拠なく計算を変えません。",
      },
      {
        id: "remeasure",
        label: fieldDecisionLabel("remeasure"),
        incorrectReason:
          "この固定例では観測条件や点の同一性に未解決の異常がありません。確認済みの記録と点検結果に基づき採用へ進めます。",
      },
    ],
    correctOptionId: fieldAdoptScenario.recommendedDecisionId,
    correctReason: fieldAdoptScenario.reason,
    fieldCheck: fieldAdoptScenario.nextAction,
    questionType: "現場判断",
    sourceScenarioId: fieldAdoptScenario.id,
  },
  {
    id: "basics-q09-field-recalculate",
    lessonId: "field-workflow",
    prompt: `${fieldRecalculateScenario.label}。${fieldRecalculateScenario.finding} この固定例の判断はどれですか。`,
    options: [
      {
        id: "adopt",
        label: fieldDecisionLabel("adopt"),
        incorrectReason:
          "転記または計算式の誤りが成果へ残るため、そのまま採用できません。正しい原記録から修正します。",
      },
      {
        id: "recalculate",
        label: fieldDecisionLabel("recalculate"),
        incorrectReason: null,
      },
      {
        id: "remeasure",
        label: fieldDecisionLabel("remeasure"),
        incorrectReason:
          "正しい原観測値と条件が残り、観測自体の異常は示されていません。まず原記録から計算過程を修正できます。",
      },
    ],
    correctOptionId: fieldRecalculateScenario.recommendedDecisionId,
    correctReason: fieldRecalculateScenario.reason,
    fieldCheck: fieldRecalculateScenario.nextAction,
    questionType: "現場判断",
    sourceScenarioId: fieldRecalculateScenario.id,
  },
  {
    id: "basics-q09-field-remeasure",
    lessonId: "field-workflow",
    prompt: `${fieldRemeasureScenario.label}。${fieldRemeasureScenario.finding} この固定例の判断はどれですか。`,
    options: [
      {
        id: "adopt",
        label: fieldDecisionLabel("adopt"),
        incorrectReason:
          "誤った後視点で得た原観測は、正しい基準方向を持ちません。未解決のまま成果へ採用できません。",
      },
      {
        id: "recalculate",
        label: fieldDecisionLabel("recalculate"),
        incorrectReason:
          "方向付けの前提が観測時点で成立していないため、計算だけでは正しい原観測へ置き換えられません。",
      },
      {
        id: "remeasure",
        label: fieldDecisionLabel("remeasure"),
        incorrectReason: null,
      },
    ],
    correctOptionId: fieldRemeasureScenario.recommendedDecisionId,
    correctReason: fieldRemeasureScenario.reason,
    fieldCheck: fieldRemeasureScenario.nextAction,
    questionType: "現場判断",
    sourceScenarioId: fieldRemeasureScenario.id,
  },
] as const satisfies readonly BasicsQuizQuestion[];

export function getBasicsQuizQuestionsForLesson(
  lessonId: string,
): readonly BasicsQuizQuestion[] {
  return basicsQuizQuestions.filter(
    (question) => question.lessonId === lessonId,
  );
}

export function evaluateBasicsQuizAnswer(
  questionId: string,
  optionId: string,
): BasicsQuizAnswerEvaluation | null {
  const question = basicsQuizQuestions.find(
    (candidate) => candidate.id === questionId,
  );

  if (!question) {
    return null;
  }

  const selectedOption = question.options.find(
    (option) => option.id === optionId,
  );
  const correctOption = question.options.find(
    (option) => option.id === question.correctOptionId,
  );

  if (!selectedOption || !correctOption) {
    return null;
  }

  const isCorrect = selectedOption.id === correctOption.id;
  const selectedAnswerReason = isCorrect
    ? question.correctReason
    : selectedOption.incorrectReason;

  if (!selectedAnswerReason) {
    return null;
  }

  return {
    questionId: question.id,
    selectedOptionId: selectedOption.id,
    selectedOptionLabel: selectedOption.label,
    correctOptionId: correctOption.id,
    correctOptionLabel: correctOption.label,
    isCorrect,
    selectedAnswerReason,
    correctReason: question.correctReason,
    fieldCheck: question.fieldCheck,
  };
}
