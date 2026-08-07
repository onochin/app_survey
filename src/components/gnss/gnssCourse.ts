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

export const gnssLessons = [
  gnssOverviewLesson,
  gnssObservationsLesson,
] as const;
