import type {
  GnssCarrierPhaseExample,
  GnssFrequencyBand,
  GnssFrequencyId,
  GnssFrequencySelection,
  GnssObservationEnvironmentId,
  GnssQuizAnswerEvaluation,
  GnssQuizQuestion,
  GnssSystemDefinition,
  GnssSystemId,
  GnssSystemSelectionSummary,
} from "../types";

export const GNSS_SIGNAL_SPEED_KM_PER_SECOND = 300_000;
export const GNSS_L1_WAVELENGTH_CM = 19;
export const GNSS_DEFAULT_TRAVEL_TIME_MS = 70;
export const GNSS_GEOMETRIC_DISTANCE_KM = 21_000;
export const GNSS_FRACTIONAL_PHASE = 0.35;
export const GNSS_CLOCK_OFFSET_EXAMPLE_MICROSECONDS = 1;
export const GNSS_CLOCK_OFFSET_EXAMPLE_DISTANCE_METERS =
  GNSS_SIGNAL_SPEED_KM_PER_SECOND *
  GNSS_CLOCK_OFFSET_EXAMPLE_MICROSECONDS *
  0.001;
export const GNSS_PSEUDORANGE_EXAMPLE_KM =
  GNSS_GEOMETRIC_DISTANCE_KM +
  GNSS_CLOCK_OFFSET_EXAMPLE_DISTANCE_METERS / 1000;
export const GNSS_MODELED_INTEGER_WAVELENGTHS = 12;

export const gnssSatelliteSignalFlow = [
  "GNSS衛星",
  "測位用の信号を継続的に送信",
  "GNSS受信機",
  "受信した信号を観測して位置を計算",
] as const;

export const gnssObservationConceptFlow = [
  "衛星",
  "信号",
  "コード観測・搬送波観測",
  "擬似距離・搬送波位相",
  "複数周波数",
  "複数GNSS",
  "位置計算",
] as const;

export const gnssPseudorangeInfluences = [
  {
    id: "receiver-clock",
    label: "受信機時計のずれ",
    description: "受信機側の時刻のずれが、距離に相当する値へ影響する。",
  },
  {
    id: "satellite-clock",
    label: "衛星時計に関する誤差・補正",
    description: "衛星側の時計情報と、その補正を利用する。",
  },
  {
    id: "ionosphere",
    label: "電離層",
    description: "電離層を通る信号の影響は、周波数などの条件で変わる。",
  },
  {
    id: "troposphere",
    label: "対流圏",
    description: "大気の状態や衛星の方向などにより影響が変わる。",
  },
  {
    id: "satellite-orbit",
    label: "衛星軌道に関する誤差",
    description: "計算に用いる衛星位置の情報にも誤差が含まれ得る。",
  },
  {
    id: "multipath",
    label: "マルチパス",
    description: "建物や地面などで反射した信号が受信へ影響する。",
  },
  {
    id: "observation-noise",
    label: "観測ノイズ",
    description: "受信・追尾に伴うばらつきなどが観測量へ含まれる。",
  },
] as const;

export const gnssObservationComparisonRows = [
  {
    item: "観測",
    code: "コードの到達タイミング",
    carrier: "搬送波の位相",
  },
  {
    item: "距離の考え方",
    code: "到達時間から距離に相当する値",
    carrier: "波長を細かな物差しとして利用",
  },
  {
    item: "長所",
    code: "距離全体を把握しやすい",
    carrier: "非常に細かな変化を観測できる",
  },
  {
    item: "主な難しさ",
    code: "時計・大気等の影響",
    carrier: "整数波長数が最初は不明",
  },
  {
    item: "高精度測量",
    code: "基本的な観測量",
    carrier: "特に重要",
  },
] as const;

export const gnssFrequencyBands = [
  { id: "l1", label: "L1", megahertz: 1575.42 },
  { id: "l2", label: "L2", megahertz: 1227.6 },
  { id: "l5", label: "L5", megahertz: 1176.45 },
] as const satisfies readonly GnssFrequencyBand[];

export const gnssFrequencySelections = [
  {
    id: "l1-only",
    label: "L1のみ",
    frequencyIds: ["l1"],
  },
  {
    id: "l1-l2",
    label: "L1 + L2",
    frequencyIds: ["l1", "l2"],
  },
  {
    id: "l1-l5",
    label: "L1 + L5",
    frequencyIds: ["l1", "l5"],
  },
  {
    id: "l1-l2-l5",
    label: "L1 + L2 + L5",
    frequencyIds: ["l1", "l2", "l5"],
  },
] as const satisfies readonly GnssFrequencySelection[];

export const gnssFrequencyCharacteristics = [
  {
    id: "l2",
    label: "L2",
    description:
      "測量など、従来から高精度な2周波GNSSで利用されてきた周波数。L1と組み合わせた2周波観測は、高精度測位で長く利用されてきました。",
  },
  {
    id: "l5",
    label: "L5",
    description:
      "L2より新しい民生向け信号。高い送信電力と広い帯域を持ち、高い性能・信頼性が求められる用途を意識して設計されています。",
  },
] as const;

export const gnssIntegerWavelengthCandidates = [10, 11, 12, 13] as const;

export const gnssIntegerResolutionFlow = [
  {
    id: "observe-multiple-satellites",
    label: "複数衛星を観測",
    description: "異なる方向の複数衛星から観測量を得る。",
  },
  {
    id: "rough-position-from-code",
    label: "擬似距離などから概略位置を求める",
    description: "コード観測等で距離全体のおおよその関係をつかむ。",
  },
  {
    id: "compare-carrier-phase",
    label: "搬送波位相を比較・解析",
    description: "細かな位相と、衛星・受信機間の観測関係を比較する。",
  },
  {
    id: "narrow-integer-candidates",
    label: "整数波長数の候補を絞る",
    description: "観測結果に合わない整数候補を除いていく。",
  },
  {
    id: "float",
    label: "FLOAT",
    description:
      "整数アンビギュイティを整数としてまだ確定できていない状態",
  },
  {
    id: "check-consistency",
    label: "複数の観測結果の整合性を確認",
    description: "候補を使った結果が観測全体と整合するか確認する。",
  },
  {
    id: "fix",
    label: "FIX",
    description:
      "整数アンビギュイティを整数値として固定解にできた状態",
  },
] as const;

export const gnssFourSatelliteClarification = {
  reason:
    "基本的な3次元単独測位で4機以上の衛星を使う主な理由は、X・Y・Zと受信機時計ずれの4未知量を求めるためです。",
  notMeaning:
    "「4機あれば整数アンビギュイティが決定できる」という意味ではありません。",
} as const;

export const gnssGlobalSystemDefinitions = [
  {
    id: "gps",
    label: "GPS",
    shortLabel: "G",
    coverage: "global",
    countryOrRegion: "アメリカ",
    description: "全球衛星測位システム",
    serviceStartLabel: "1993年",
    openSatelliteCount: 6,
    obstructedSatelliteCount: 3,
    note: "アメリカの全球衛星測位システム。",
  },
  {
    id: "glonass",
    label: "GLONASS",
    shortLabel: "R",
    coverage: "global",
    countryOrRegion: "ロシア",
    description: "全球衛星測位システム",
    serviceStartLabel: "1995年",
    openSatelliteCount: 5,
    obstructedSatelliteCount: 2,
    note: "ロシアの全球衛星測位システム。",
  },
  {
    id: "galileo",
    label: "Galileo",
    shortLabel: "E",
    coverage: "global",
    countryOrRegion: "EU",
    description: "全球衛星測位システム",
    serviceStartLabel: "2016年",
    openSatelliteCount: 5,
    obstructedSatelliteCount: 2,
    note: "EUの全球衛星測位システム。",
  },
  {
    id: "beidou",
    label: "BeiDou",
    shortLabel: "C",
    coverage: "global",
    countryOrRegion: "中国",
    description: "全球衛星測位システム",
    serviceStartLabel: "2020年（BDS-3）",
    openSatelliteCount: 4,
    obstructedSatelliteCount: 2,
    note: "中国の全球衛星測位システム。",
  },
] as const satisfies readonly GnssSystemDefinition[];

export const gnssQzssSystemDefinition = {
  id: "qzss",
  label: "QZSS（みちびき）",
  shortLabel: "Q",
  coverage: "regional",
  countryOrRegion: "日本",
  description: "日本の地域衛星測位システム",
  serviceStartLabel: "2018年",
  openSatelliteCount: 2,
  obstructedSatelliteCount: 1,
  note: "日本の地域衛星測位システム。2018年にサービス開始。",
} as const satisfies GnssSystemDefinition;

export const gnssSystemDefinitions = [
  ...gnssGlobalSystemDefinitions,
  gnssQzssSystemDefinition,
] as const satisfies readonly GnssSystemDefinition[];

export const gnssSystemStartYearCaution =
  "開始年は、初期運用・正式サービス・現在の全球システム開始などを理解するための目安です。";

export const gnssNavicNote =
  "インドには地域衛星測位システムNavICがあります。GPSのような全球型ではなく、インドとその周辺地域を主なサービス範囲とする地域型の衛星測位システムです。";

export const gnssObservationsQuizQuestions = [
  {
    id: "gnss-observations-q01-receiver-observation",
    questionType: "仕組み理解",
    prompt: "GNSS受信機が位置を求める仕組みとして最も適切なのはどれか。",
    options: [
      {
        id: "receive-own-coordinates",
        label: "衛星から受信機自身のX・Y・Z座標を直接受け取る。",
        incorrectReason:
          "衛星から受信機自身の完成した座標が届くのではありません。受信機が信号の観測量等を用いて位置を計算します。",
      },
      {
        id: "observe-radio-and-compute-position",
        label:
          "衛星から届く電波を観測し、距離に関係する情報等から位置を計算する。",
        incorrectReason: null,
      },
      {
        id: "receive-coordinate-from-control-station",
        label: "最寄りの電子基準点から常に自分の座標を受け取る。",
        incorrectReason:
          "電子基準点等の情報を利用する方式はありますが、受信機自身の座標を常に直接受け取る仕組みではありません。",
      },
      {
        id: "map-only-position",
        label: "地図データだけから現在位置を計算する。",
        incorrectReason:
          "地図は結果の表示などに利用できますが、GNSSの位置計算は衛星信号の観測を基礎にします。",
      },
    ],
    correctOptionId: "observe-radio-and-compute-position",
    correctReason:
      "GNSS受信機は、衛星から届くコードや搬送波などの電波を観測し、衛星軌道・時刻等に関する情報も利用して位置を計算する。",
    fieldCheck:
      "受信機の座標表示だけでなく、どの衛星・信号・観測条件を利用した結果か確認する。",
  },
  {
    id: "gnss-observations-q02-pseudorange",
    questionType: "仕組み理解",
    prompt:
      "コードの到達時間から求める値を「真の距離」ではなく「擬似距離」と呼ぶ理由として最も適切なのはどれか。",
    options: [
      {
        id: "moving-satellite-no-distance",
        label: "GNSS衛星が移動しているから距離という言葉を使えない。",
        incorrectReason:
          "衛星が移動することだけが擬似距離という名称の理由ではありません。時計や大気など複数の影響を含みます。",
      },
      {
        id: "only-one-satellite",
        label: "1機の衛星しか利用できないから。",
        incorrectReason:
          "擬似距離は複数衛星を利用するときにも得られる観測量であり、衛星数が1機だから仮の値になるのではありません。",
      },
      {
        id: "includes-clock-atmosphere-effects",
        label:
          "時計ずれや大気等の影響を含み、真の幾何学的距離そのものとは限らない。",
        incorrectReason: null,
      },
      {
        id: "code-always-temporary",
        label: "搬送波を利用していない値はすべて仮の値だから。",
        incorrectReason:
          "コード観測は基本的な観測量です。搬送波を使わないことを理由に価値のない仮の値としているわけではありません。",
      },
    ],
    correctOptionId: "includes-clock-atmosphere-effects",
    correctReason:
      "コード観測から得る擬似距離には、受信機・衛星時計、大気、軌道、マルチパス、観測ノイズ等の影響が含まれ、幾何学的距離そのものとは限らない。",
    fieldCheck:
      "擬似距離を偽物と捉えず、どの誤差要因や補正が観測へ関係するか確認する。",
  },
  {
    id: "gnss-observations-q03-carrier-phase",
    questionType: "仕組み理解",
    prompt: "搬送波位相の説明として最も適切なのはどれか。",
    options: [
      {
        id: "position-within-carrier-cycle",
        label: "搬送波の1周期の中で、波がどの位置にあるかを表す観測量。",
        incorrectReason: null,
      },
      {
        id: "code-arrival-time-only",
        label: "コードが送信されてから届くまでの時刻だけを表す。",
        incorrectReason:
          "これはコードの到達タイミングに近い説明であり、搬送波の1周期内の位置を表す説明ではありません。",
      },
      {
        id: "transmitted-point-coordinate",
        label: "衛星から送信された測点座標。",
        incorrectReason:
          "搬送波位相は座標そのものではなく、繰り返す搬送波の細かな位相を観測する量です。",
      },
      {
        id: "available-satellite-count",
        label: "利用できる衛星数を表す値。",
        incorrectReason:
          "衛星数は観測状況の別の指標であり、搬送波位相の定義ではありません。",
      },
    ],
    correctOptionId: "position-within-carrier-cycle",
    correctReason:
      "搬送波位相は、繰り返す搬送波の1周期内でどこにあるかを細かく観測する量であり、短い波長を精密な物差しとして利用できる。",
    fieldCheck:
      "位相の細かさと、距離全体の整数波長数が最初は未知であることを分けて確認する。",
  },
  {
    id: "gnss-observations-q04-integer-ambiguity",
    questionType: "仕組み理解",
    prompt:
      "搬送波位相だけでは観測開始時に衛星までの距離全体がすぐ決まらない主な理由はどれか。",
    options: [
      {
        id: "wavelength-changes-every-second",
        label: "搬送波の波長が毎秒大きく変化するから。",
        incorrectReason:
          "本章で扱う主な難しさは、波長が毎秒大きく変わることではなく、開始時の整数波長数が未知なことです。",
      },
      {
        id: "satellite-count-unknown",
        label: "衛星数そのものが分からないから。",
        incorrectReason:
          "利用衛星数は追尾情報から把握できます。ここで未知なのは各信号経路に関係する整数波長数です。",
      },
      {
        id: "carrier-cannot-be-received",
        label: "搬送波では電波を受信できないから。",
        incorrectReason:
          "受信機は搬送波を追尾して位相を観測できます。受信不能だから距離全体が分からないわけではありません。",
      },
      {
        id: "integer-wavelength-count-unknown",
        label:
          "1周期内の位相は観測できても、整数で何波長あるかが最初は分からないから。",
        incorrectReason: null,
      },
    ],
    correctOptionId: "integer-wavelength-count-unknown",
    correctReason:
      "1周期内の細かな位相は分かっても、観測開始時に衛星との間へ整数で何波長あるかは未知である。この未知量が整数値バイアス（整数アンビギュイティ）につながり、FLOATから正しく決定できた状態がFIXへの入口となる。",
    fieldCheck:
      "FIX表示だけで成果を確定せず、基準局座標、アンテナ高、座標系、マルチパス等も確認する。",
  },
  {
    id: "gnss-observations-q05-multi-frequency",
    questionType: "用語整理",
    prompt:
      "同じ1機のGPS衛星からL1とL2を同時に観測している。この状態として最も適切なのはどれか。",
    options: [
      {
        id: "multi-gnss",
        label: "複数GNSS。",
        incorrectReason:
          "GPSという同じ衛星測位システム、同じ衛星を観測しているため、複数GNSSではありません。",
      },
      {
        id: "dual-frequency",
        label: "2周波観測。",
        incorrectReason: null,
      },
      {
        id: "two-satellites",
        label: "2衛星観測。",
        incorrectReason:
          "L1とL2は同じ1機の衛星から届く異なる周波数の信号で、衛星が2機になったわけではありません。",
      },
      {
        id: "network-rtk",
        label: "ネットワーク型RTK。",
        incorrectReason:
          "周波数を2種類観測することだけでは、補正情報の配信方式であるネットワーク型RTKを意味しません。",
      },
    ],
    correctOptionId: "dual-frequency",
    correctReason:
      "同じ衛星からL1とL2という2種類の周波数を観測しているので2周波観測である。衛星数は1機、衛星系はGPSの1系統である。",
    fieldCheck:
      "衛星数、衛星測位システム数、追尾している周波数・信号数を別々に記録して確認する。",
  },
  {
    id: "gnss-observations-q06-multi-gnss",
    questionType: "用語整理",
    prompt:
      "GPS・QZSS・Galileoを利用しているが、それぞれで1種類の周波数帯だけを利用している。この状態として最も適切なのはどれか。",
    options: [
      {
        id: "triple-frequency",
        label: "3周波観測。",
        incorrectReason:
          "衛星測位システムが3種類であることと、周波数が3種類であることは同じではありません。",
      },
      {
        id: "three-satellites-only",
        label: "3衛星だけの観測。",
        incorrectReason:
          "GPS・QZSS・Galileoは衛星系の名称であり、各衛星系に複数の衛星が含まれ得ます。衛星数を3機と断定できません。",
      },
      {
        id: "multi-gnss-single-frequency",
        label: "マルチGNSS・1周波観測。",
        incorrectReason: null,
      },
      {
        id: "gps-only",
        label: "GPSのみの観測。",
        incorrectReason:
          "QZSSとGalileoも利用しているためGPSのみではなく、複数の衛星測位システムを利用しています。",
      },
    ],
    correctOptionId: "multi-gnss-single-frequency",
    correctReason:
      "GPS・QZSS・Galileoという複数の衛星測位システムを利用しているのでマルチGNSSであり、各系で利用する周波数帯が1種類なら1周波観測として整理できる。",
    fieldCheck:
      "衛星系によって信号名称が異なる点に注意し、利用衛星系と周波数・信号を分けて確認する。",
  },
  {
    id: "gnss-observations-q07-signal-combination",
    questionType: "総合問題",
    prompt:
      "受信機がGPSとQZSSを利用し、それぞれでL1とL2の信号を追尾して、コード観測と搬送波観測を行っている。最も適切な説明はどれか。",
    options: [
      {
        id: "multi-gnss-dual-frequency-observables",
        label:
          "マルチGNSS・2周波観測で、擬似距離や搬送波位相等の観測量を利用している。",
        incorrectReason: null,
      },
      {
        id: "single-gnss-single-frequency-direct-coordinate",
        label:
          "1つのGNSSを利用した1周波観測で、座標を直接受信している。",
        incorrectReason:
          "GPSとQZSSの2つの衛星系、L1とL2の2周波を利用しており、座標そのものを直接受信しているわけではありません。",
      },
      {
        id: "exactly-two-satellites",
        label: "衛星は2機しか利用していない。",
        incorrectReason:
          "GPSとQZSSは衛星系の数であり、実際に利用する衛星数が合計2機とは限りません。",
      },
      {
        id: "l1-code-l2-carrier-fixed",
        label: "L1が擬似距離、L2が搬送波位相として固定されている。",
        incorrectReason:
          "L1とL2のそれぞれでコード観測と搬送波観測を行えます。周波数と観測量を1対1に固定してはいけません。",
      },
    ],
    correctOptionId: "multi-gnss-dual-frequency-observables",
    correctReason:
      "GPSとQZSSを利用するのでマルチGNSS、L1とL2を利用するので2周波観測である。各周波数の信号からコード観測と搬送波観測を行い、擬似距離や搬送波位相等を位置計算に利用する。",
    fieldCheck:
      "衛星系、衛星数、周波数・信号、コード/搬送波という観測方法、得られる観測量を順に分けて整理する。",
  },
] as const satisfies readonly GnssQuizQuestion[];

export function calculateSignalDistanceKm(
  travelTimeMilliseconds: number,
): number | null {
  if (!Number.isFinite(travelTimeMilliseconds) || travelTimeMilliseconds < 0) {
    return null;
  }

  return (
    GNSS_SIGNAL_SPEED_KM_PER_SECOND *
    (travelTimeMilliseconds / 1000)
  );
}

export function calculateClockOffsetDistanceMeters(
  clockOffsetMicroseconds: number,
): number | null {
  if (!Number.isFinite(clockOffsetMicroseconds)) {
    return null;
  }

  return GNSS_SIGNAL_SPEED_KM_PER_SECOND * clockOffsetMicroseconds * 0.001;
}

export function calculateWavelengthRatio(
  movementCentimeters: number,
  wavelengthCentimeters = GNSS_L1_WAVELENGTH_CM,
): number | null {
  if (
    !Number.isFinite(movementCentimeters) ||
    movementCentimeters < 0 ||
    !Number.isFinite(wavelengthCentimeters) ||
    wavelengthCentimeters <= 0
  ) {
    return null;
  }

  return movementCentimeters / wavelengthCentimeters;
}

export function createCarrierPhaseExample(
  integerWavelengths: number,
  fractionalWavelengths = GNSS_FRACTIONAL_PHASE,
): GnssCarrierPhaseExample | null {
  if (
    !Number.isInteger(integerWavelengths) ||
    integerWavelengths < 0 ||
    !Number.isFinite(fractionalWavelengths) ||
    fractionalWavelengths < 0 ||
    fractionalWavelengths >= 1
  ) {
    return null;
  }

  return {
    integerWavelengths,
    fractionalWavelengths,
    totalWavelengths: integerWavelengths + fractionalWavelengths,
  };
}

export function getGnssFrequencySelection(
  selectionId: string,
): GnssFrequencySelection | null {
  return (
    gnssFrequencySelections.find((selection) => selection.id === selectionId) ??
    null
  );
}

export function countGnssFrequencies(
  frequencyIds: readonly string[],
): number | null {
  if (frequencyIds.length === 0) {
    return null;
  }

  const knownFrequencyIds = new Set<string>(
    gnssFrequencyBands.map((frequency) => frequency.id),
  );

  if (frequencyIds.some((frequencyId) => !knownFrequencyIds.has(frequencyId))) {
    return null;
  }

  return new Set(frequencyIds).size;
}

export function getGnssFrequencyBand(
  frequencyId: string,
): GnssFrequencyBand | null {
  return (
    gnssFrequencyBands.find((frequency) => frequency.id === frequencyId) ?? null
  );
}

export function getGnssSystemDefinition(
  systemId: string,
): GnssSystemDefinition | null {
  return gnssSystemDefinitions.find((system) => system.id === systemId) ?? null;
}

export function summarizeGnssSystemSelection(
  systemIds: readonly string[],
  environmentId: GnssObservationEnvironmentId,
): GnssSystemSelectionSummary | null {
  if (environmentId !== "open" && environmentId !== "mountain-forest") {
    return null;
  }

  const uniqueSystemIds = [...new Set(systemIds)];
  const systems = uniqueSystemIds.map(getGnssSystemDefinition);

  if (systems.some((system) => system === null)) {
    return null;
  }

  const validSystems = systems.filter(
    (system): system is GnssSystemDefinition => system !== null,
  );
  const satelliteCount = validSystems.reduce(
    (total, system) =>
      total +
      (environmentId === "open"
        ? system.openSatelliteCount
        : system.obstructedSatelliteCount),
    0,
  );

  return {
    systemCount: validSystems.length,
    satelliteCount,
    mode:
      validSystems.length === 0
        ? "GNSS未選択"
        : validSystems.length === 1
          ? "single GNSS"
          : "multi GNSS",
  };
}

export function getGnssObservationsQuizQuestion(
  questionId: string,
): GnssQuizQuestion | null {
  return (
    gnssObservationsQuizQuestions.find(
      (question) => question.id === questionId,
    ) ?? null
  );
}

export function getGnssObservationsQuizOptionLetter(
  questionId: string,
  optionId: string,
): string | null {
  const question = getGnssObservationsQuizQuestion(questionId);
  const optionIndex = question?.options.findIndex(
    (option) => option.id === optionId,
  );

  if (optionIndex === undefined || optionIndex < 0) {
    return null;
  }

  return String.fromCharCode(65 + optionIndex);
}

export function evaluateGnssObservationsQuizAnswer(
  questionId: string,
  optionId: string,
): GnssQuizAnswerEvaluation | null {
  const question = getGnssObservationsQuizQuestion(questionId);
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

export function isGnssSystemId(systemId: string): systemId is GnssSystemId {
  return getGnssSystemDefinition(systemId) !== null;
}

export function isGnssFrequencyId(
  frequencyId: string,
): frequencyId is GnssFrequencyId {
  return getGnssFrequencyBand(frequencyId) !== null;
}
