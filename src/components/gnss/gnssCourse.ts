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

export const gnssLessons = [gnssOverviewLesson] as const;
