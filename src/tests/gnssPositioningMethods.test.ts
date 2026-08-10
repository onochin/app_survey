import { describe, expect, it } from "vitest";
import {
  gnssCoordinateHeightLesson,
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
  gnssPositioningMethodsLesson,
} from "../components/gnss/gnssCourse";
import { gnssQuizQuestions } from "../components/gnss/data/gnssOverview";
import { gnssObservationsQuizQuestions } from "../components/gnss/data/gnssObservations";
import { gnssCoordinateHeightQuizQuestions } from "../components/gnss/data/gnssCoordinateHeight";
import {
  calculateOwnBaseRtkPointX,
  evaluateGnssPositioningConditions,
  evaluateGnssPositioningMethodsQuizAnswer,
  getGnssPositioningMethodsQuizOptionLetter,
  getGnssPositioningMethodsQuizQuestion,
  getGnssPositioningPreset,
  getOwnBaseRtkCoordinateCase,
  gnssConditionDefinitions,
  gnssOwnAndNetworkRtkComparison,
  gnssPositioningMethodCards,
  gnssPositioningMethods,
  gnssPositioningMethodsQuizQuestions,
  gnssPositioningPresets,
  isGnssPositioningConditions,
  ownBaseRtkCoordinateExample,
} from "../components/gnss/data/gnssPositioningMethods";

describe("GNSS測量 Phase 4 第4章", () => {
  it("第1章～第3章を維持し、第4章だけを利用可能な章へ追加する", () => {
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
      learningGoal:
        "GNSSの主な測位方式について、基準となる情報の得方や観測方法の違いを比較し、現場条件に応じて方式を選ぶ考え方を説明できる。",
    });
    expect(gnssLessons.map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
    ]);
    expect(gnssLessons).toHaveLength(4);
    expect(gnssLessons.every((lesson) => lesson.number <= 4)).toBe(true);
    expect(gnssQuizQuestions).toHaveLength(3);
    expect(gnssObservationsQuizQuestions).toHaveLength(7);
    expect(gnssCoordinateHeightQuizQuestions).toHaveLength(8);
  });

  it("9カードを安定IDと指定順で定義する", () => {
    expect(gnssPositioningMethodCards.map((card) => card.id)).toEqual([
      "positioning-comparison",
      "information-source",
      "single-and-dgnss",
      "own-base-rtk",
      "network-rtk",
      "clas",
      "static",
      "six-methods",
      "field-selection",
    ]);
    expect(gnssPositioningMethodCards.map((card) => card.title)).toEqual([
      "GNSS測位方式を比較する",
      "位置を求めるとき、何の情報を使う？",
      "単独測位からDGNSSへ",
      "自前基準局RTKとは？",
      "ネットワーク型RTKとは？",
      "CLASとは？",
      "スタティック測量とは？",
      "同じP1を6方式で測る",
      "現場条件から測位方式を選ぶ",
    ]);
    expect(gnssPositioningMethodCards).toHaveLength(9);
  });

  it("6方式を情報源・基準局・経路・結果時期とともに定義する", () => {
    expect(gnssPositioningMethods.map((method) => method.id)).toEqual([
      "single",
      "dgnss",
      "own-base-rtk",
      "network-rtk",
      "clas",
      "static",
    ]);

    for (const method of gnssPositioningMethods) {
      expect(method.externalInformation.trim()).not.toBe("");
      expect(method.fieldBaseStation.trim()).not.toBe("");
      expect(method.informationPath.trim()).not.toBe("");
      expect(method.resultTiming.trim()).not.toBe("");
    }

    expect(gnssOwnAndNetworkRtkComparison.map((row) => row.item)).toEqual([
      "現場基準局",
      "情報の送り元",
      "主な通信経路",
      "移動局",
      "リアルタイム",
      "成果確認",
    ]);
  });

  it("基準局Xと相対XからP1.Xを求め、0.500mの成果差でもFIXを維持する", () => {
    expect(ownBaseRtkCoordinateExample.relativeX).toBe(12.345);
    expect(ownBaseRtkCoordinateExample.cases).toEqual([
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
    ]);
    expect(calculateOwnBaseRtkPointX(1000, 12.345)).toBeCloseTo(
      1012.345,
      12,
    );
    expect(calculateOwnBaseRtkPointX(1000.5, 12.345)).toBeCloseTo(
      1012.845,
      12,
    );
    expect(1012.845 - 1012.345).toBeCloseTo(0.5, 12);
    expect(
      ownBaseRtkCoordinateExample.cases.every(
        (coordinateCase) => coordinateCase.fixState === "FIX",
      ),
    ).toBe(true);
    expect(calculateOwnBaseRtkPointX(Number.NaN, 12.345)).toBeNull();
    expect(
      calculateOwnBaseRtkPointX(1000, Number.POSITIVE_INFINITY),
    ).toBeNull();
    expect(getOwnBaseRtkCoordinateCase("unknown")).toBeNull();
  });

  it("6条件と5プリセットを定義し、各ケースの主候補を返す", () => {
    expect(gnssConditionDefinitions.map((condition) => condition.id)).toEqual([
      "requiredAccuracy",
      "resultTiming",
      "mobileConnection",
      "fieldBaseAvailability",
      "knownPointAvailability",
      "skyView",
    ]);
    expect(gnssPositioningPresets.map((preset) => preset.id)).toEqual([
      "general-good-network",
      "mountain-no-mobile",
      "own-base-available",
      "control-point-static",
      "rough-position",
    ]);
    expect(gnssPositioningPresets).toHaveLength(5);

    for (const preset of gnssPositioningPresets) {
      const evaluation = evaluateGnssPositioningConditions(preset.conditions);
      expect(isGnssPositioningConditions(preset.conditions)).toBe(true);
      expect(
        evaluation.candidates.map((candidate) => candidate.methodId),
      ).toContain(preset.primaryCandidateId);
      expect(
        evaluation.candidates.every((candidate) =>
          candidate.reasons.every((reason) => reason.trim().length > 0),
        ),
      ).toBe(true);
    }

    expect(getGnssPositioningPreset("unknown")).toBeNull();
  });

  it("通信良好から圏外へ変えるとNRTKからCLASへ候補理由が変わる", () => {
    const generalPreset = getGnssPositioningPreset("general-good-network");
    expect(generalPreset).not.toBeNull();

    const onlineEvaluation = evaluateGnssPositioningConditions(
      generalPreset?.conditions,
    );
    const offlineEvaluation = evaluateGnssPositioningConditions({
      ...generalPreset?.conditions,
      mobileConnection: "unavailable",
    });

    expect(
      onlineEvaluation.candidates.map((candidate) => candidate.methodId),
    ).toEqual(["network-rtk"]);
    expect(
      offlineEvaluation.candidates.map((candidate) => candidate.methodId),
    ).toEqual(["clas"]);
    expect(offlineEvaluation.considerations.join(" ")).toContain(
      "ネットワーク型RTK",
    );
    expect(offlineEvaluation.considerations.join(" ")).toContain(
      "基準局を設置できる条件なら候補",
    );
  });

  it("上空視界が厳しい場合と不正条件を安全な確認表示へ送る", () => {
    const skyEvaluation = evaluateGnssPositioningConditions({
      requiredAccuracy: "high",
      resultTiming: "realtime",
      mobileConnection: "unavailable",
      fieldBaseAvailability: "unavailable",
      knownPointAvailability: "none-nearby",
      skyView: "difficult",
    });
    expect(skyEvaluation.candidates).toEqual([]);
    expect(skyEvaluation.warning).toBe(
      "GNSS方式を選ぶ前に、GNSS観測条件そのものを確認してください。",
    );
    expect(skyEvaluation.considerations.join(" ")).toContain("衛星遮蔽");
    expect(skyEvaluation.needsAdditionalCheck).toBe(true);

    const fallback = evaluateGnssPositioningConditions({
      requiredAccuracy: "unknown",
    });
    expect(fallback.warning).toBe("追加条件の確認が必要です。");
    expect(fallback.candidates.length).toBeGreaterThan(1);
    expect(
      fallback.candidates.every((candidate) => candidate.label !== "undefined"),
    ).toBe(true);
    expect(isGnssPositioningConditions(null)).toBe(false);
  });

  it("確認問題8問を安定IDとA～D各2問の正答位置で定義する", () => {
    expect(
      gnssPositioningMethodsQuizQuestions.map((question) => question.id),
    ).toEqual([
      "gnss-positioning-methods-q01-single-dgnss",
      "gnss-positioning-methods-q02-own-base-rtk",
      "gnss-positioning-methods-q03-network-rtk",
      "gnss-positioning-methods-q04-clas",
      "gnss-positioning-methods-q05-static",
      "gnss-positioning-methods-q06-comparison",
      "gnss-positioning-methods-q07-field-no-mobile",
      "gnss-positioning-methods-q08-method-selection",
    ]);
    const correctLetters = gnssPositioningMethodsQuizQuestions.map((question) =>
      getGnssPositioningMethodsQuizOptionLetter(
        question.id,
        question.correctOptionId,
      ),
    );
    expect(correctLetters).toEqual(["A", "C", "D", "B", "A", "C", "D", "B"]);
    expect(
      Object.fromEntries(
        ["A", "B", "C", "D"].map((letter) => [
          letter,
          correctLetters.filter((current) => current === letter).length,
        ]),
      ),
    ).toEqual({ A: 2, B: 2, C: 2, D: 2 });
  });

  it("全問題のIDと選択肢IDを一意にし、全誤答へ固有理由を持たせる", () => {
    expect(gnssPositioningMethodsQuizQuestions).toHaveLength(8);
    expect(
      new Set(gnssPositioningMethodsQuizQuestions.map((question) => question.id))
        .size,
    ).toBe(8);
    const allOptionIds = gnssPositioningMethodsQuizQuestions.flatMap(
      (question) => question.options.map((option) => option.id),
    );
    expect(new Set(allOptionIds).size).toBe(allOptionIds.length);

    for (const question of gnssPositioningMethodsQuizQuestions) {
      const optionIds = question.options.map((option) => option.id);
      expect(question.options).toHaveLength(4);
      expect(new Set(optionIds).size).toBe(4);
      expect(optionIds).toContain(question.correctOptionId);
      expect(question.correctOptionId).not.toMatch(/^[A-D]$/);
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        const evaluation = evaluateGnssPositioningMethodsQuizAnswer(
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
    expect(getGnssPositioningMethodsQuizQuestion("unknown")).toBeNull();
    expect(
      getGnssPositioningMethodsQuizOptionLetter("unknown", "unknown"),
    ).toBeNull();
    expect(
      getGnssPositioningMethodsQuizOptionLetter(
        "gnss-positioning-methods-q01-single-dgnss",
        "unknown",
      ),
    ).toBeNull();
    expect(
      evaluateGnssPositioningMethodsQuizAnswer("unknown", "unknown"),
    ).toBeNull();
    expect(
      evaluateGnssPositioningMethodsQuizAnswer(
        "gnss-positioning-methods-q01-single-dgnss",
        "unknown",
      ),
    ).toBeNull();
  });
});
