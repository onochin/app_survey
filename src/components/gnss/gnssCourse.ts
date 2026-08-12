import type { GnssLessonMetadata } from "./types";

export const gnssOverviewLesson = {
  id: "gnss-overview",
  number: 1,
  title: "GNSS測量の全体像",
  description:
    "既知点Aの自前基準局と移動局で新点P1を観測し、点検して成果へつなぐ流れを学ぶ。",
  learningGoal:
    "GNSS測量で、衛星・基準局・移動局・補正情報・解析・成果がどのようにつながっているか、大まかな流れを説明できる。",
  terms: [
    "GNSS",
    "GNSS衛星",
    "既知点",
    "新点",
    "測量点",
    "基準局",
    "移動局",
    "補正情報",
    "RTK",
    "ネットワーク型RTK",
    "CLAS",
    "SINGLE",
    "FLOAT",
    "FIX",
    "観測",
    "点検",
    "成果",
  ],
  cautions: [
    "FIXしていることと、成果が正しいことは同じではありません。",
    "基準局座標と基準局・移動局のアンテナ高を確認します。",
    "座標系と、高さの種類・基準を確認します。",
    "GNSSでは上空視界や周辺環境も重要です。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssObservationsLesson = {
  id: "gnss-observations",
  number: 2,
  title: "GNSSは何を観測しているのか",
  description:
    "衛星から届く電波を、コード観測と搬送波観測として捉え、距離に関係する観測量から位置を計算する流れを学ぶ。",
  learningGoal:
    "GNSS受信機が衛星から座標そのものを受け取るのではなく、電波を観測して衛星までの距離に関係する情報を求め、その観測から位置を計算していることを説明できる。",
  terms: [
    "コード",
    "擬似距離",
    "搬送波",
    "搬送波位相",
    "波長",
    "周波数",
    "L1 / L2 / L5",
    "複数周波数",
    "複数GNSS",
    "整数波長数",
    "整数値バイアス",
    "整数アンビギュイティ",
  ],
  cautions: [
    "衛星から受信機自身の完成した座標が直接届くわけではありません。",
    "L1が擬似距離、L2が搬送波位相という対応ではありません。",
    "複数周波数と複数GNSS、衛星数と信号数を区別します。",
    "FIXは成果座標や設定条件の正しさまで保証しません。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssCoordinateHeightLesson = {
  id: "gnss-coordinate-height",
  number: 3,
  title: "GNSSの座標と高さ",
  description:
    "GNSSで得た3次元位置を、地心直交座標、緯度・経度・楕円体高、平面直角座標、標高へつなげて学ぶ。",
  learningGoal:
    "GNSSで求めた3次元位置が、緯度・経度・楕円体高、平面直角座標、標高へどのようにつながるかを説明し、成果を使用するときに確認すべき測地系・系番号・座標の時点・高さ基準を判断できる。",
  terms: [
    "地心直交座標",
    "緯度・経度",
    "楕円体高",
    "平面直角座標",
    "JGD2024",
    "GRS80",
    "WGS84",
    "元期・今期",
    "ジオイド",
    "標高",
    "アンテナ高",
  ],
  cautions: [
    "地心直交座標Xc・Yc・Zcと平面直角座標X・Yを混同しません。",
    "JGD2024という名称だけで、すべての座標の元期が2024年とは判断できません。",
    "楕円体高と標高は基準面が異なります。",
    "FIXは測地系・系番号・座標の時点・高さ基準・アンテナ高の正しさまで保証しません。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssPositioningMethodsLesson = {
  id: "gnss-positioning-methods",
  number: 4,
  title: "GNSS測位方式を比較する",
  description:
    "単独測位、DGNSS、自前基準局RTK、ネットワーク型RTK、CLAS、スタティックを、情報源・観測方法・結果の時期から比較する。",
  learningGoal:
    "GNSSの主な測位方式について、基準となる情報の得方や観測方法の違いを比較し、現場条件に応じて方式を選ぶ考え方を説明できる。",
  terms: [
    "単独測位",
    "DGNSS",
    "自前基準局RTK",
    "ネットワーク型RTK",
    "CLAS",
    "スタティック",
    "基線",
    "補正情報",
    "補強情報",
    "L6D",
    "同時観測",
    "後処理",
  ],
  cautions: [
    "衛星測位システムと測位方式は別の分類です。",
    "現場側の受信機が1台でも、外部の基準・補強情報を利用する方式があります。",
    "FIXは基準局へ入力した座標の正しさまで保証しません。",
    "6方式は精度による単純な上位・下位のランキングではありません。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssOwnBaseStationLesson = {
  id: "gnss-own-base-station",
  number: 5,
  title: "自前RTK① 基準局をつくる",
  description:
    "基準局座標の出どころを確認し、その座標が示す点とGNSSアンテナを結び付け、安定して観測できる基準局を準備する。",
  learningGoal:
    "自前RTKの基準局について、基準となる座標をどのように用意するかを考え、その座標とGNSSアンテナを正しく結び付け、安定してGNSS観測できる基準局を準備する流れを説明できる。",
  terms: [
    "自前基準局",
    "基準局座標",
    "既知点",
    "基準点",
    "サーベイイン",
    "単独測位",
    "スタティック",
    "求心",
    "アンテナ高",
    "測地系",
    "座標の時点",
    "上空視界",
    "マルチパス",
  ],
  cautions: [
    "GNSS受信機を置いただけで、測量成果の基準として適切な基準局が自動的に完成するとは限りません。",
    "座標値だけでなく、その座標がどこから得られ、今回の成果基準として適切かを確認します。",
    "相対的な位置関係の精度と、国家座標等への整合は別に確認します。",
    "基準局側でも、求心・アンテナ高・固定状態・GNSS観測環境を確認します。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssCorrectionDeliveryLesson = {
  id: "gnss-correction-delivery",
  number: 6,
  title: "自前RTK② 補正情報を届ける",
  description:
    "基準局側の情報がRTCMとして表され、Ntripやその他の通信経路を通って移動局へ継続して届く仕組みを学ぶ。",
  learningGoal:
    "自前RTKで、基準局側の情報がRTCMとしてどのように表され、Ntripやその他の通信経路を通って移動局へ届くかを説明し、RTCM・Ntrip・Caster・Mountpointの役割を区別できる。また、RTCMが正常に届かない場合に、情報経路を順番に確認できる。",
  terms: [
    "RTCM",
    "RTCMメッセージ",
    "RTCMストリーム",
    "Ntrip",
    "Ntrip Server",
    "Ntrip Caster",
    "Ntrip Client",
    "Mountpoint",
    "Host",
    "Port",
    "IPネットワーク",
    "通信経路",
    "RTCM更新",
    "RTCMの鮮度",
  ],
  cautions: [
    "RTCMは情報の形式、NtripはIPネットワーク上で届ける仕組みです。",
    "MountpointはRTCM番号や物理的な据付点ではなく、ストリームの識別名です。",
    "通信接続中でも、新しいRTCMが継続して届いているとは限りません。",
    "RTCM受信とFIX成立は同じではありません。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssBaselineFixLesson = {
  id: "gnss-baseline-fix",
  number: 7,
  title: "自前RTK③ 基線解析とFIX",
  description:
    "基準局Aと移動局P1のGNSS観測を比較し、二重差、FLOAT、整数候補評価、FIX、3次元基線のつながりを学ぶ。",
  learningGoal:
    "基準局Aと移動局P1のGNSS観測を比較することで、なぜ共通する誤差の影響を相殺・低減しながら3次元の相対位置「基線」を求められるのかを理解し、搬送波位相の整数アンビギュイティがFLOATからFIXへ進む意味を説明できる。",
  terms: [
    "基線",
    "相対位置",
    "搬送波位相",
    "整数アンビギュイティ",
    "FLOAT",
    "FIX",
    "受信機間の観測差",
    "二重差",
    "整数候補",
    "固定解",
    "サイクルスリップ",
    "ミスFIX",
  ],
  cautions: [
    "RTCMが正常に届いていることと、FIXが成立したことは別の段階です。",
    "二重差でも、すべての誤差や整数アンビギュイティが消えるわけではありません。",
    "FLOATにも位置・基線とアンビギュイティの推定解があります。",
    "FIXは成果条件全体の正しさを保証するものではありません。",
  ],
} as const satisfies GnssLessonMetadata;

export const gnssLessons = [
  gnssOverviewLesson,
  gnssObservationsLesson,
  gnssCoordinateHeightLesson,
  gnssPositioningMethodsLesson,
  gnssOwnBaseStationLesson,
  gnssCorrectionDeliveryLesson,
  gnssBaselineFixLesson,
] as const;
