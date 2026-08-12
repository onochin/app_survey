import { describe, expect, it } from "vitest";
import {
  gnssCoordinateHeightLesson,
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
  gnssOwnBaseStationLesson,
  gnssPositioningMethodsLesson,
} from "../components/gnss/gnssCourse";
import { gnssCoordinateHeightQuizQuestions } from "../components/gnss/data/gnssCoordinateHeight";
import { gnssObservationsQuizQuestions } from "../components/gnss/data/gnssObservations";
import { fixedGnssScenario, gnssQuizQuestions } from "../components/gnss/data/gnssOverview";
import {
  evaluateGnssOwnBaseStationQuizAnswer,
  getGnssOwnBaseStationQuizOptionLetter,
  getGnssOwnBaseStationQuizQuestion,
  gnssOwnBaseAntennaChecks,
  gnssOwnBaseCoordinateSources,
  gnssOwnBaseKnownPointFlow,
  gnssOwnBaseKnownPointResultChecks,
  gnssOwnBaseNextChapterFlow,
  gnssOwnBaseNoKnownPointBranches,
  gnssOwnBaseNoKnownPointFlow,
  gnssOwnBasePreUseChecks,
  gnssOwnBaseSiteChecks,
  gnssOwnBaseSiteExamples,
  gnssOwnBaseStationCards,
  gnssOwnBaseStationElements,
  gnssOwnBaseStationOverviewFlow,
  gnssOwnBaseStationQuizQuestions,
  gnssOwnBaseStationScenario,
} from "../components/gnss/data/gnssOwnBaseStation";
import { gnssPositioningMethodsQuizQuestions } from "../components/gnss/data/gnssPositioningMethods";

describe("GNSS測量 Phase 5 第5章", () => {
  it("第1章～第5章の定義を維持する", () => {
    expect(gnssOverviewLesson).toMatchObject({
      id: "gnss-overview",
      number: 1,
      title: "GNSS測量の全体像",
    });
    expect(gnssObservationsLesson).toMatchObject({
      id: "gnss-observations",
      number: 2,
      title: "GNSSは何を観測しているのか",
    });
    expect(gnssCoordinateHeightLesson).toMatchObject({
      id: "gnss-coordinate-height",
      number: 3,
      title: "GNSSの座標と高さ",
    });
    expect(gnssPositioningMethodsLesson).toMatchObject({
      id: "gnss-positioning-methods",
      number: 4,
      title: "GNSS測位方式を比較する",
    });
    expect(gnssOwnBaseStationLesson).toMatchObject({
      id: "gnss-own-base-station",
      number: 5,
      title: "自前RTK① 基準局をつくる",
      learningGoal:
        "自前RTKの基準局について、基準となる座標をどのように用意するかを考え、その座標とGNSSアンテナを正しく結び付け、安定してGNSS観測できる基準局を準備する流れを説明できる。",
    });
    expect(gnssLessons.slice(0, 5).map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
      "gnss-own-base-station",
    ]);
    expect(gnssLessons).toHaveLength(7);
    expect(gnssLessons.slice(0, 5).every((lesson) => lesson.number <= 5)).toBe(
      true,
    );
    expect(gnssQuizQuestions).toHaveLength(3);
    expect(gnssObservationsQuizQuestions).toHaveLength(7);
    expect(gnssCoordinateHeightQuizQuestions).toHaveLength(8);
    expect(gnssPositioningMethodsQuizQuestions).toHaveLength(8);
  });

  it("9カードを安定IDと指定順で定義する", () => {
    expect(gnssOwnBaseStationCards.map((card) => card.id)).toEqual([
      "own-base-introduction",
      "three-elements",
      "coordinate-source",
      "known-point-a",
      "no-known-point",
      "antenna-connection",
      "installation-site",
      "pre-use-check",
      "next-correction-delivery",
    ]);
    expect(gnssOwnBaseStationCards.map((card) => card.title)).toEqual([
      "自前RTKの基準局をつくる",
      "正しい基準局に必要なものは？",
      "基準局座標はどこから来る？",
      "既知点Aを使って基準局をつくる",
      "既知点がない場合は？",
      "アンテナを基準点と結び付ける",
      "基準局をどこに置く？",
      "基準局として使う前に確認",
      "基準局の次は？",
    ]);
    expect(gnssOwnBaseStationCards).toHaveLength(9);
    expect(gnssOwnBaseStationOverviewFlow).toEqual([
      "基準局座標を決める",
      "その座標の点とアンテナを結び付ける",
      "GNSSを安定して観測できる場所へ設置する",
      "基準局として使う前に確認する",
      "次は基準局の情報を移動局へ届ける",
    ]);
  });

  it("カード2の座標・アンテナ・観測環境とカード3の4入口を定義する", () => {
    expect(gnssOwnBaseStationElements.map((element) => element.id)).toEqual([
      "coordinate",
      "antenna",
      "environment",
    ]);
    expect(
      gnssOwnBaseStationElements.map((element) => element.title),
    ).toEqual([
      "基準となる座標",
      "現地のGNSSアンテナ",
      "GNSS観測環境",
    ]);
    expect(gnssOwnBaseCoordinateSources.map((source) => source.id)).toEqual([
      "known-point",
      "survey-in",
      "standalone",
      "static-survey",
    ]);
    expect(
      gnssOwnBaseCoordinateSources.map((source) => source.shortLabel),
    ).toEqual(["既知点", "サーベイイン等", "単独測位", "スタティック等"]);
    expect(
      gnssOwnBaseCoordinateSources.find((source) => source.id === "survey-in")
        ?.understanding,
    ).toContain("成果に使用できるかは別途判断");
    expect(
      gnssOwnBaseCoordinateSources.find((source) => source.id === "standalone")
        ?.understanding,
    ).toContain("測量成果との整合");
  });

  it("既知点Aとアンテナ高は第1章の固定教材データを参照する", () => {
    expect(gnssOwnBaseStationScenario).toBe(fixedGnssScenario);
    expect(gnssOwnBaseStationScenario.knownPoint).toEqual({
      name: "A",
      x: 1000,
      y: 1000,
      elevation: 50,
    });
    expect(gnssOwnBaseStationScenario.baseStation.antennaHeight).toBe(1.8);
    expect(gnssOwnBaseStationScenario.baseStation.equipment).toBe(
      "DG-RPO1RWS + u-blox ANN-MB-00",
    );
    expect(gnssOwnBaseKnownPointResultChecks.map((check) => check.id)).toEqual([
      "point-name",
      "horizontal-coordinate",
      "height-result",
      "datum",
      "coordinate-epoch",
    ]);
    expect(gnssOwnBaseKnownPointFlow).toHaveLength(5);
  });

  it("既知点がない場合を成果目的で分岐し、具体解析を先行しない", () => {
    expect(gnssOwnBaseNoKnownPointBranches.map((branch) => branch.id)).toEqual([
      "local-relative",
      "national-coordinate",
    ]);
    expect(gnssOwnBaseNoKnownPointBranches[0].result).toContain(
      "ローカルな基準",
    );
    expect(gnssOwnBaseNoKnownPointBranches[1].result).toContain(
      "目的に適した測量",
    );
    expect(gnssOwnBaseNoKnownPointFlow).toEqual([
      "既知点がない",
      "必要な成果を考える",
      "基準局候補点Bの座標を適切な方法で決める",
      "確定した座標を基準局座標として使用する",
    ]);
  });

  it("求心・アンテナ高・固定と基準局側の観測環境を定義する", () => {
    expect(gnssOwnBaseAntennaChecks.map((check) => check.id)).toEqual([
      "correct-point",
      "centering",
      "antenna-height",
      "secure-fixing",
      "no-movement",
    ]);
    expect(gnssOwnBaseSiteChecks.map((check) => check.id)).toEqual([
      "open-sky",
      "avoid-reflectors",
      "stable-fixing",
      "protected-from-movement",
      "safe-continuous-use",
    ]);
    expect(gnssOwnBaseSiteExamples.map((example) => example.marker)).toEqual([
      "○",
      "△",
    ]);
    expect(gnssOwnBaseSiteExamples[0].items).toContain("上空が開けている");
    expect(gnssOwnBaseSiteExamples[1].items).toContain("建物の壁の近く");
  });

  it("使用前8項目と第6章への接続を定義する", () => {
    expect(gnssOwnBasePreUseChecks.map((check) => check.item)).toEqual([
      "使用する点",
      "基準局座標",
      "座標の出どころ",
      "測地系・座標の時点",
      "求心",
      "アンテナ高",
      "固定状態",
      "上空視界・周辺環境",
    ]);
    expect(gnssOwnBasePreUseChecks).toHaveLength(8);
    expect(gnssOwnBaseNextChapterFlow).toEqual([
      "基準局の準備ができた",
      "基準局はGNSSを観測している",
      "移動局P1は基準局側の情報をまだ受け取っていない",
      "その情報をどうやって届ける？",
      "第6章 自前RTK② 補正情報を届ける",
    ]);
  });

  it("確認問題8問を安定IDとB/C/A/D/B/C/A/Dの正答位置で定義する", () => {
    expect(gnssOwnBaseStationQuizQuestions.map((question) => question.id)).toEqual([
      "gnss-own-base-station-q01-coordinate-basis",
      "gnss-own-base-station-q02-known-point",
      "gnss-own-base-station-q03-no-known-point",
      "gnss-own-base-station-q04-coordinate-source",
      "gnss-own-base-station-q05-antenna-installation",
      "gnss-own-base-station-q06-site-condition",
      "gnss-own-base-station-q07-final-check",
      "gnss-own-base-station-q08-next-correction-delivery",
    ]);
    const correctLetters = gnssOwnBaseStationQuizQuestions.map((question) =>
      getGnssOwnBaseStationQuizOptionLetter(
        question.id,
        question.correctOptionId,
      ),
    );
    expect(correctLetters).toEqual(["B", "C", "A", "D", "B", "C", "A", "D"]);
    expect(
      Object.fromEntries(
        ["A", "B", "C", "D"].map((letter) => [
          letter,
          correctLetters.filter((current) => current === letter).length,
        ]),
      ),
    ).toEqual({ A: 2, B: 2, C: 2, D: 2 });
  });

  it("全32選択肢を評価し、全誤答へ固有理由を持たせる", () => {
    expect(gnssOwnBaseStationQuizQuestions).toHaveLength(8);
    expect(
      new Set(gnssOwnBaseStationQuizQuestions.map((question) => question.id))
        .size,
    ).toBe(8);
    const allOptionIds = gnssOwnBaseStationQuizQuestions.flatMap((question) =>
      question.options.map((option) => option.id),
    );
    expect(new Set(allOptionIds).size).toBe(32);

    for (const question of gnssOwnBaseStationQuizQuestions) {
      const optionIds = question.options.map((option) => option.id);
      expect(question.options).toHaveLength(4);
      expect(new Set(optionIds).size).toBe(4);
      expect(optionIds).toContain(question.correctOptionId);
      expect(question.correctOptionId).not.toMatch(/^[A-D]$/);
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        const evaluation = evaluateGnssOwnBaseStationQuizAnswer(
          question.id,
          option.id,
        );
        expect(evaluation?.correctOptionId).toBe(question.correctOptionId);
        expect(evaluation?.correctReason).toBe(question.correctReason);

        if (option.id === question.correctOptionId) {
          expect(option.incorrectReason).toBeNull();
          expect(evaluation).toMatchObject({
            isCorrect: true,
            selectedAnswerReason: null,
          });
        } else {
          expect(option.incorrectReason?.trim()).not.toBe("");
          expect(evaluation).toMatchObject({
            isCorrect: false,
            selectedAnswerReason: option.incorrectReason,
          });
        }
      }
    }
  });

  it("未知問題ID・未知選択肢IDを異常表示へ送らず拒否する", () => {
    expect(getGnssOwnBaseStationQuizQuestion("unknown")).toBeNull();
    expect(
      getGnssOwnBaseStationQuizOptionLetter("unknown", "unknown"),
    ).toBeNull();
    expect(
      getGnssOwnBaseStationQuizOptionLetter(
        "gnss-own-base-station-q01-coordinate-basis",
        "unknown",
      ),
    ).toBeNull();
    expect(
      evaluateGnssOwnBaseStationQuizAnswer("unknown", "unknown"),
    ).toBeNull();
    expect(
      evaluateGnssOwnBaseStationQuizAnswer(
        "gnss-own-base-station-q01-coordinate-basis",
        "unknown",
      ),
    ).toBeNull();
  });
});
