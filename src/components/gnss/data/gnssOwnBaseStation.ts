import type {
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
} from "../types";
import { fixedGnssScenario } from "./gnssOverview";

export const gnssOwnBaseStationScenario = fixedGnssScenario;

export const gnssOwnBaseStationCards = [
  {
    id: "own-base-introduction",
    title: "自前RTKの基準局をつくる",
    focus: "第4章の基準局座標の影響から、その座標を用意する問いへ進む",
  },
  {
    id: "three-elements",
    title: "正しい基準局に必要なものは？",
    focus: "座標・アンテナ・GNSS観測環境の3要素を整理する",
  },
  {
    id: "coordinate-source",
    title: "基準局座標はどこから来る？",
    focus: "座標の4つの用意の仕方と成果への適合を比較する",
  },
  {
    id: "known-point-a",
    title: "既知点Aを使って基準局をつくる",
    focus: "既知点成果を確認してアンテナ設置へつなぐ",
  },
  {
    id: "no-known-point",
    title: "既知点がない場合は？",
    focus: "必要な成果に応じて基準局候補点Bの座標を考える",
  },
  {
    id: "antenna-connection",
    title: "アンテナを基準点と結び付ける",
    focus: "求心・アンテナ高・固定によって座標の点とアンテナを結ぶ",
  },
  {
    id: "installation-site",
    title: "基準局をどこに置く？",
    focus: "基準局側の上空視界・反射物・固定・安全を確認する",
  },
  {
    id: "pre-use-check",
    title: "基準局として使う前に確認",
    focus: "座標・設置・観測環境を8項目でまとめて確認する",
  },
  {
    id: "next-correction-delivery",
    title: "基準局の次は？",
    focus: "基準局側の情報を移動局へ届ける第6章へ接続する",
  },
] as const;

export const gnssOwnBaseStationOverviewFlow = [
  "基準局座標を決める",
  "その座標の点とアンテナを結び付ける",
  "GNSSを安定して観測できる場所へ設置する",
  "基準局として使う前に確認する",
  "次は基準局の情報を移動局へ届ける",
] as const;

export const gnssOwnBaseStationElements = [
  {
    id: "coordinate",
    numberLabel: "①",
    title: "基準となる座標",
    question: "どの座標を基準局へ与える？",
    linkedCards: "カード3・4・5",
  },
  {
    id: "antenna",
    numberLabel: "②",
    title: "現地のGNSSアンテナ",
    question: "その座標の点とアンテナをどう結び付ける？",
    linkedCards: "カード6",
  },
  {
    id: "environment",
    numberLabel: "③",
    title: "GNSS観測環境",
    question: "安定して観測できる場所か？",
    linkedCards: "カード7",
  },
] as const;

export const gnssOwnBaseCoordinateSources = [
  {
    id: "known-point",
    label: "既知点の成果を使う",
    shortLabel: "既知点",
    understanding:
      "すでに成果として与えられた座標を、条件を確認して利用する。",
  },
  {
    id: "survey-in",
    label: "サーベイイン等で受信機から位置を得る",
    shortLabel: "サーベイイン等",
    understanding:
      "受信機側で基準局位置を求める方法があるが、今回の成果に使用できるかは別途判断する。",
  },
  {
    id: "standalone",
    label: "単独測位で得た位置を使う",
    shortLabel: "単独測位",
    understanding:
      "GNSSだけでも位置は得られるが、必要な測量成果との整合を別途考える。",
  },
  {
    id: "static-survey",
    label: "スタティック等の測量で位置を決める",
    shortLabel: "スタティック等",
    understanding:
      "基準局となる点そのものを目的に適した測量で観測し、その位置を決める。",
  },
] as const;

export const gnssOwnBaseKnownPointFlow = [
  "既知点Aの成果を確認",
  "使用する点がAであることを確認",
  "Aへ基準局アンテナを設置",
  "Aの成果とアンテナ位置を結び付ける",
  "基準局として使用",
] as const;

export const gnssOwnBaseKnownPointResultChecks = [
  { id: "point-name", label: "点名" },
  { id: "horizontal-coordinate", label: "X・Y" },
  { id: "height-result", label: "高さに関する成果" },
  { id: "datum", label: "測地系" },
  { id: "coordinate-epoch", label: "座標の時点" },
] as const;

export const gnssOwnBaseNoKnownPointFlow = [
  "既知点がない",
  "必要な成果を考える",
  "基準局候補点Bの座標を適切な方法で決める",
  "確定した座標を基準局座標として使用する",
] as const;

export const gnssOwnBaseNoKnownPointBranches = [
  {
    id: "local-relative",
    title: "現場内での相対的な位置関係を扱う",
    result:
      "目的によっては、仮の基準座標・ローカルな基準で相対関係を扱える場合がある。",
  },
  {
    id: "national-coordinate",
    title: "既存の国家座標・測量成果へ整合させたい",
    result:
      "基準局候補点Bの位置を、目的に適した測量によって決める必要がある。",
  },
] as const;

export const gnssOwnBaseAntennaChecks = [
  {
    id: "correct-point",
    label: "使用する点の位置へ正しく設置する",
  },
  { id: "centering", label: "求心する" },
  {
    id: "antenna-height",
    label: "アンテナ高を測定・記録する",
  },
  { id: "secure-fixing", label: "アンテナを確実に固定する" },
  {
    id: "no-movement",
    label: "観測中に動かない状態にする",
  },
] as const;

export const gnssOwnBaseSiteChecks = [
  { id: "open-sky", label: "上空ができるだけ開けている" },
  {
    id: "avoid-reflectors",
    label: "建物・壁・金属物等の反射しやすい物の近くを避ける",
  },
  {
    id: "stable-fixing",
    label: "アンテナを安定して固定できる",
  },
  {
    id: "protected-from-movement",
    label: "観測中に人や車両等で動かされにくい",
  },
  { id: "safe-continuous-use", label: "安全に継続して設置できる" },
] as const;

export const gnssOwnBaseSiteExamples = [
  {
    id: "good",
    marker: "○",
    title: "比較的良い例",
    items: [
      "上空が開けている",
      "アンテナが安定",
      "周囲に大きな反射物が少ない",
    ],
  },
  {
    id: "caution",
    marker: "△",
    title: "注意が必要な例",
    items: [
      "建物の壁の近く",
      "樹木等で上空が遮られる",
      "アンテナが動かされやすい",
    ],
  },
] as const;

export const gnssOwnBasePreUseChecks = [
  {
    id: "point",
    item: "使用する点",
    reason: "意図した基準点を使っていることを確認する",
  },
  {
    id: "coordinate",
    item: "基準局座標",
    reason: "P1成果の基準になる",
  },
  {
    id: "coordinate-source",
    item: "座標の出どころ",
    reason: "その座標を今回の成果基準として使えるか判断するため",
  },
  {
    id: "datum-and-epoch",
    item: "測地系・座標の時点",
    reason: "異なる基準・時点を混同しないため",
  },
  {
    id: "centering",
    item: "求心",
    reason: "地上の点とアンテナ位置を結び付けるため",
  },
  {
    id: "antenna-height",
    item: "アンテナ高",
    reason: "アンテナ位置と地上の点を結び付けるため",
  },
  {
    id: "fixing",
    item: "固定状態",
    reason: "観測中に基準局が動かないようにするため",
  },
  {
    id: "environment",
    item: "上空視界・周辺環境",
    reason: "良好なGNSS観測を行うため",
  },
] as const;

export const gnssOwnBaseNextChapterFlow = [
  "基準局の準備ができた",
  "基準局はGNSSを観測している",
  "移動局P1は基準局側の情報をまだ受け取っていない",
  "その情報をどうやって届ける？",
  "第6章 自前RTK② 補正情報を届ける",
] as const;

export const gnssOwnBaseStationQuizQuestions = [
  {
    id: "gnss-own-base-station-q01-coordinate-basis",
    questionType: "仕組み理解",
    prompt:
      "自前RTKで基準局Aを設置した。基準局座標について最も適切な説明はどれか。",
    options: [
      {
        id: "q01-fix-corrects-coordinate",
        label: "RTKがFIXすれば、基準局座標は自動的に正しい値へ修正される。",
        incorrectReason:
          "FIXは相対測位の固定解を示しますが、基準局へ設定した座標の根拠や正しさを自動修正するものではありません。",
      },
      {
        id: "q01-coordinate-basis-needs-source",
        label:
          "基準局座標はP1成果の基準になるため、その座標の根拠を確認する必要がある。",
        incorrectReason: null,
      },
      {
        id: "q01-coordinate-for-communication-only",
        label: "基準局座標は通信にだけ使われ、P1成果には影響しない。",
        incorrectReason:
          "基準局座標はAからP1までの位置の差を成果座標へ結び付ける土台であり、P1成果へ影響します。",
      },
      {
        id: "q01-approximate-coordinate-is-enough",
        label: "基準局座標はおおよその値でよく、アンテナ高だけ正しければよい。",
        incorrectReason:
          "アンテナ高だけでなく、基準局座標そのものと、その座標の出どころを確認する必要があります。",
      },
    ],
    correctOptionId: "q01-coordinate-basis-needs-source",
    correctReason:
      "自前RTKでは、基準局からP1までの位置の差を基準局座標へ結び付けてP1成果を求めるため、基準局座標が成果の土台になる。その座標がどこから得られたものかを確認する必要がある。",
    fieldCheck: "基準局座標の出典、測地系、座標の時点、設定値を照合する。",
  },
  {
    id: "gnss-own-base-station-q02-known-point",
    questionType: "品質管理",
    prompt:
      "既知点Aの成果を使って基準局を設置する場合、最も適切な行動はどれか。",
    options: [
      {
        id: "q02-check-point-name-only",
        label: "点名だけ確認して設置する。",
        incorrectReason:
          "同名や取り違えを避けるだけでなく、座標、高さ、測地系、座標の時点等も確認する必要があります。",
      },
      {
        id: "q02-check-horizontal-only",
        label: "X・Yだけ分かればよく、高さや座標の時点は確認しない。",
        incorrectReason:
          "平面座標だけでなく、高さに関する成果や座標の時点も成果条件として確認します。",
      },
      {
        id: "q02-check-complete-result",
        label:
          "点名、座標、高さに関する成果、測地系、座標の時点などを確認してから設置する。",
        incorrectReason: null,
      },
      {
        id: "q02-prioritize-receiver-position",
        label:
          "GNSS受信機が表示した現在位置を、既知点Aの成果より無条件に優先する。",
        incorrectReason:
          "受信機が位置を表示したことと、既知点成果と同等の根拠を持つことは別です。",
      },
    ],
    correctOptionId: "q02-check-complete-result",
    correctReason:
      "既知点成果を基準局の基準として利用する場合は、座標値だけでなく、その成果がどの点・測地系・時点等のものか確認する必要がある。",
    fieldCheck: "成果資料と現地の点を照合し、使用条件を確認する。",
  },
  {
    id: "gnss-own-base-station-q03-no-known-point",
    questionType: "総合問題",
    prompt:
      "基準局を置きたい場所の近くに利用できる既知点がない。最も適切な考え方はどれか。",
    options: [
      {
        id: "q03-decide-coordinate-for-required-result",
        label:
          "必要とする成果に応じて、基準局候補点の座標をどのように決めるか検討する。",
        incorrectReason: null,
      },
      {
        id: "q03-own-rtk-is-impossible",
        label: "既知点がなければ自前RTKは一切使用できない。",
        incorrectReason:
          "目的によっては、仮の基準座標やローカルな基準で相対位置を扱える場合があります。",
      },
      {
        id: "q03-receiver-creates-national-coordinate",
        label: "受信機を置けば、自動的に国家座標へ整合した基準局になる。",
        incorrectReason:
          "受信機から位置が得られても、その座標が国家座標等へ適切に整合しているとは限りません。",
      },
      {
        id: "q03-rover-fix-removes-base-need",
        label: "移動局がFIXすれば、基準局座標を決める必要はない。",
        incorrectReason:
          "FIXは基準局座標の出どころや絶対座標の正しさを保証しません。",
      },
    ],
    correctOptionId: "q03-decide-coordinate-for-required-result",
    correctReason:
      "既知点がない場合でも、目的によってはローカルな基準で相対位置を扱える場合がある。一方、国家座標等へ整合した成果が必要なら、基準局候補点の位置を目的に適した方法で決める必要がある。",
    fieldCheck: "必要な成果がローカルな相対関係か、既存成果への整合かを確認する。",
  },
  {
    id: "gnss-own-base-station-q04-coordinate-source",
    questionType: "仕組み理解",
    prompt:
      "基準局受信機の機能によって基準局位置の座標が得られた。最も適切なのはどれか。",
    options: [
      {
        id: "q04-always-equals-known-result",
        label: "表示された時点で、既知点成果と必ず同等と考える。",
        incorrectReason:
          "表示された座標と、既知点成果の根拠・基準・時点が同等とは限りません。",
      },
      {
        id: "q04-long-observation-always-correct",
        label: "長時間観測すれば、どのような目的でも必ず正しい成果になる。",
        incorrectReason:
          "観測時間だけで、すべての用途に必要な成果基準への適合が自動的に決まるわけではありません。",
      },
      {
        id: "q04-fix-removes-source-check",
        label: "RTKがFIXすれば、その座標の由来は確認しなくてよい。",
        incorrectReason:
          "FIXと、基準局座標の出どころ・成果への適合は別に確認します。",
      },
      {
        id: "q04-check-source-and-purpose",
        label:
          "その座標がどのように得られたものかを確認し、必要とする成果に使用できるか判断する。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "q04-check-source-and-purpose",
    correctReason:
      "座標値が表示されたことと、その座標が今回必要な成果基準として適切であることは別である。座標の出どころと利用目的を確認する必要がある。",
    fieldCheck: "受信機で得た座標の作成方法と、成果の用途・基準を確認する。",
  },
  {
    id: "gnss-own-base-station-q05-antenna-installation",
    questionType: "品質管理",
    prompt:
      "既知点Aの座標を基準局座標として使用する。重要な設置条件はどれか。",
    options: [
      {
        id: "q05-nearby-is-enough",
        label: "アンテナが既知点Aから数m以内ならよい。",
        incorrectReason:
          "既知点Aの成果を使うなら、数m以内ではなく、その点とアンテナ位置を正しく結び付けます。",
      },
      {
        id: "q05-connect-and-measure-height",
        label:
          "アンテナ位置を既知点Aと正しく結び付け、アンテナ高を測定・記録する。",
        incorrectReason: null,
      },
      {
        id: "q05-fix-removes-centering",
        label: "FIXになれば求心は不要である。",
        incorrectReason:
          "FIXしても地上の点とアンテナ位置のずれは自動的に取り除かれません。",
      },
      {
        id: "q05-rover-height-only",
        label: "アンテナ高は移動局だけ測ればよい。",
        incorrectReason:
          "基準局側でも、座標が示す地上の点とアンテナ位置を結ぶためにアンテナ高を扱います。",
      },
    ],
    correctOptionId: "q05-connect-and-measure-height",
    correctReason:
      "既知点Aの成果を使うなら、その地上の点と実際のGNSSアンテナ位置を正しく結び付ける必要があり、求心やアンテナ高の扱いが重要になる。",
    fieldCheck: "点上への設置、求心、アンテナ高、固定状態を確認する。",
  },
  {
    id: "gnss-own-base-station-q06-site-condition",
    questionType: "品質管理",
    prompt:
      "自前RTKの基準局を設置する場所として、より適切なのはどれか。",
    options: [
      {
        id: "q06-wall-and-unstable",
        label: "建物の壁のすぐ横で、アンテナが動きやすい場所。",
        incorrectReason:
          "反射物の近くで固定も不安定なため、良好で継続的なGNSS観測に適しません。",
      },
      {
        id: "q06-obstructed-but-near",
        label: "樹木に囲まれているが、既知点に近いことだけを優先した場所。",
        incorrectReason:
          "既知点との関係だけでなく、上空視界や周辺の反射・遮蔽も確認する必要があります。",
      },
      {
        id: "q06-open-stable-safe",
        label:
          "上空ができるだけ開け、アンテナを安定して固定でき、観測中に動かされにくい場所。",
        incorrectReason: null,
      },
      {
        id: "q06-rover-visibility-only",
        label:
          "移動局から見えやすければ、GNSS観測環境は考慮しなくてよい。",
        incorrectReason:
          "移動局からの見え方だけでなく、基準局側の上空視界、反射物、固定状態、安全性を確認します。",
      },
    ],
    correctOptionId: "q06-open-stable-safe",
    correctReason:
      "基準局側でも安定したGNSS観測が必要であり、上空視界、周辺の反射物、固定状態、安全性等を確認する必要がある。",
    fieldCheck: "上空視界、反射物、固定状態、人・車両、安全性を確認する。",
  },
  {
    id: "gnss-own-base-station-q07-final-check",
    questionType: "品質管理",
    prompt:
      "基準局アンテナを設置した。基準局として使用する前の確認として最も適切なのはどれか。",
    options: [
      {
        id: "q07-check-coordinate-installation-environment",
        label:
          "基準局座標の根拠、座標基準、アンテナ設置・高さ、固定状態、観測環境を確認する。",
        incorrectReason: null,
      },
      {
        id: "q07-power-is-enough",
        label: "電源が入ればそのまま使用する。",
        incorrectReason:
          "電源だけでは、成果の基準となる座標・設置・観測環境の確認が不足します。",
      },
      {
        id: "q07-satellite-count-only",
        label: "衛星数だけ確認する。",
        incorrectReason:
          "衛星数だけでなく、座標の根拠、求心、アンテナ高、固定状態、周辺環境も確認します。",
      },
      {
        id: "q07-check-after-rover-fix",
        label: "移動局がFIXした後で基準局設定を確認する。",
        incorrectReason:
          "P1成果の土台になるため、基準局として使う前に確認します。",
      },
    ],
    correctOptionId: "q07-check-coordinate-installation-environment",
    correctReason:
      "基準局はP1成果の基準となるため、座標だけでなく、座標の根拠、現地設置、アンテナ高、観測環境等を使用前に確認する必要がある。",
    fieldCheck: "使用前確認表の8項目を記録と照合する。",
  },
  {
    id: "gnss-own-base-station-q08-next-correction-delivery",
    questionType: "総合問題",
    prompt:
      "正しい座標と設置条件を確認し、基準局の準備ができた。自前RTKでP1を観測するため、次に理解する必要があることはどれか。",
    options: [
      {
        id: "q08-restart-plane-coordinate",
        label: "平面直角座標の系番号を最初から学び直す。",
        incorrectReason:
          "座標基準の確認は必要ですが、次の工程は準備した基準局の情報を移動局へ届けることです。",
      },
      {
        id: "q08-restart-observation-principle",
        label: "擬似距離と搬送波位相を最初から学び直す。",
        incorrectReason:
          "観測原理は既習であり、次は基準局側の情報形式と通信経路へ進みます。",
      },
      {
        id: "q08-perform-network-adjustment-first",
        label: "スタティック測量の網平均計算を先に行う。",
        incorrectReason:
          "第5章では基準局そのものの準備までを扱い、次章はリアルタイムに情報を届ける仕組みです。",
      },
      {
        id: "q08-deliver-base-information",
        label:
          "基準局側の情報を、どのような情報形式・経路で移動局へ届けるか。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "q08-deliver-base-information",
    correctReason:
      "基準局そのものの準備ができた後、自前RTKを成立させるには、基準局側の情報を移動局へ届ける仕組みが必要になる。これは第6章で扱う。",
    fieldCheck: "次章でRTCM、Ntrip、Caster、通信経路の役割を確認する。",
  },
] as const satisfies readonly GnssQuizQuestion[];

export function getGnssOwnBaseStationQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return (
    gnssOwnBaseStationQuizQuestions.find(
      (question) => question.id === questionId,
    ) ?? null
  );
}

export function getGnssOwnBaseStationQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssOwnBaseStationQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssOwnBaseStationQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssOwnBaseStationQuizQuestion(questionId);
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
