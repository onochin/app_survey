import { describe, expect, it } from "vitest";
import { gnssOverviewLesson } from "../components/gnss/gnssCourse";
import {
  calculateGnssPointDifference,
  evaluateGnssQuizAnswer,
  fixedGnssScenario,
  getGnssMethod,
  getGnssQuizOptionLetter,
  getGnssQuizQuestion,
  getGnssWorkflowStep,
  gnssInformationFlowSteps,
  gnssMethods,
  gnssPositioningStates,
  gnssQualityChecks,
  gnssQuizQuestions,
  gnssRepresentativeCase,
  gnssWorkflowSteps,
} from "../components/gnss/data/gnssOverview";

describe("GNSS測量 Phase 1 第1章", () => {
  it("安定した章ID、章番号、タイトル、到達目標、用語、注意事項を持つ", () => {
    expect(gnssOverviewLesson).toMatchObject({
      id: "gnss-overview",
      number: 1,
      title: "GNSS測量の全体像",
      learningGoal:
        "GNSS測量で、衛星・基準局・移動局・補正情報・解析・成果がどのようにつながっているか、大まかな流れを説明できる。",
    });
    expect(gnssOverviewLesson.terms).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(gnssOverviewLesson.cautions.length).toBeGreaterThan(0);
  });

  it("既知点A、基準局、P1、移動局の固定教材値を保持する", () => {
    expect(fixedGnssScenario.knownPoint).toEqual({
      name: "A",
      x: 1000,
      y: 1000,
      elevation: 50,
    });
    expect(fixedGnssScenario.baseStation).toMatchObject({
      equipment: "DG-RPO1RWS + u-blox ANN-MB-00",
      antennaHeight: 1.8,
    });
    expect(fixedGnssScenario.newPoint).toEqual({
      name: "P1",
      x: 1012.345,
      y: 1008.765,
      elevation: 49.832,
    });
    expect(fixedGnssScenario.rover.antennaHeight).toBe(2);
  });

  it("AからP1への北・東・高さの差を丸めず計算する", () => {
    const difference = calculateGnssPointDifference(
      fixedGnssScenario.knownPoint,
      fixedGnssScenario.newPoint,
    );

    expect(difference?.north).toBeCloseTo(12.345, 12);
    expect(difference?.east).toBeCloseTo(8.765, 12);
    expect(difference?.height).toBeCloseTo(-0.168, 12);
    expect(fixedGnssScenario.offsetFromKnownPoint).toEqual({
      north: 12.345,
      east: 8.765,
      height: -0.168,
    });
  });

  it("一般の調査・測量を代表ケースとし、実務例と求める成果を持つ", () => {
    expect(gnssRepresentativeCase).toMatchObject({
      target: "一般の調査・測量",
      targetPoint: "P1",
      expectedResult: "平面位置 ＋ 高さ",
      resultUsageLabel: "一般の調査・測量点",
    });
    for (const example of [
      "電探",
      "オーリス",
      "深浅測量",
      "ドローン",
      "一般の調査・測量",
    ]) {
      expect(gnssRepresentativeCase.practicalExamples).toContain(example);
    }
  });

  it("現場フロー9工程を指定順の安定IDで持つ", () => {
    expect(gnssWorkflowSteps.map((step) => step.id)).toEqual([
      "planning",
      "verify-known-point",
      "install-base-station",
      "send-base-information",
      "move-rover-to-p1",
      "single-float-fix",
      "record-p1",
      "inspection",
      "confirm-result",
    ]);
    expect(gnssWorkflowSteps.map((step) => step.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it("自前RTK、ネットワーク型RTK、CLASの3方式を比較する", () => {
    expect(gnssMethods.map((method) => method.id)).toEqual([
      "own-rtk",
      "network-rtk",
      "clas",
    ]);
    expect(gnssMethods.map((method) => method.fieldBaseStation)).toEqual([
      "必要",
      "不要",
      "不要",
    ]);
    expect(gnssMethods.map((method) => method.communicationPath)).toEqual([
      "基準局 → 移動局",
      "インターネット",
      "衛星",
    ]);
  });

  it("情報の7段階、測位3状態、品質管理8項目を持つ", () => {
    expect(gnssInformationFlowSteps).toHaveLength(7);
    expect(gnssPositioningStates.map((state) => state.label)).toEqual([
      "SINGLE",
      "FLOAT",
      "FIX",
    ]);
    expect(gnssQualityChecks).toHaveLength(8);
  });

  it("3問を一意な問題ID・選択肢IDと正答1件で定義する", () => {
    const questionIds = gnssQuizQuestions.map((question) => question.id);

    expect(gnssQuizQuestions).toHaveLength(3);
    expect(questionIds).toEqual([
      "gnss-q01-base-coordinate",
      "gnss-q02-fix-quality",
      "gnss-q03-field-method",
    ]);
    expect(new Set(questionIds).size).toBe(questionIds.length);
    expect(gnssQuizQuestions.map((question) => question.correctOptionId)).toEqual([
      "result-inherits-base-error",
      "verify-settings-and-observation",
      "consider-clas-and-conditions",
    ]);
    expect(gnssQuizQuestions.map((question) => question.options.map((option) => option.id))).toEqual([
      [
        "fix-auto-corrects-base",
        "result-inherits-base-error",
        "elevation-only",
        "wrong-base-never-fixes",
      ],
      [
        "use-immediately",
        "record-coordinate-only",
        "verify-settings-and-observation",
        "satellite-count-only",
      ],
      [
        "network-only-no-communication-check",
        "consider-clas-and-conditions",
        "single-equals-rtk",
        "fix-ignores-method",
      ],
    ]);

    for (const question of gnssQuizQuestions) {
      const optionIds = question.options.map((option) => option.id);
      const correctOptions = question.options.filter(
        (option) => option.id === question.correctOptionId,
      );

      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(correctOptions).toHaveLength(1);
      expect(question.correctReason.trim()).not.toBe("");
      expect(correctOptions[0]?.incorrectReason).toBeNull();

      for (const option of question.options) {
        if (option.id !== question.correctOptionId) {
          expect(option.incorrectReason?.trim()).not.toBe("");
        }
      }
    }
  });

  it("正答文字を問題データからB・C・Bとして導出する", () => {
    expect(
      gnssQuizQuestions.map((question) =>
        getGnssQuizOptionLetter(question.id, question.correctOptionId),
      ),
    ).toEqual(["B", "C", "B"]);
  });

  it("正答と誤答をUIに依存せず個別理由付きで判定する", () => {
    expect(
      evaluateGnssQuizAnswer(
        "gnss-q01-base-coordinate",
        "result-inherits-base-error",
      ),
    ).toMatchObject({
      isCorrect: true,
      correctOptionId: "result-inherits-base-error",
      selectedAnswerReason: null,
    });

    const incorrectEvaluation = evaluateGnssQuizAnswer(
      "gnss-q01-base-coordinate",
      "fix-auto-corrects-base",
    );
    expect(incorrectEvaluation).toMatchObject({
      isCorrect: false,
      correctOptionId: "result-inherits-base-error",
    });
    expect(incorrectEvaluation?.selectedAnswerReason).toContain(
      "絶対座標が正しいことまでは確認しません",
    );
  });

  it("未知IDと非有限座標を安全に扱う", () => {
    expect(getGnssWorkflowStep("unknown-step")).toBeNull();
    expect(getGnssMethod("unknown-method")).toBeNull();
    expect(getGnssQuizQuestion("unknown-question")).toBeNull();
    expect(
      getGnssQuizOptionLetter("unknown-question", "unknown-option"),
    ).toBeNull();
    expect(
      getGnssQuizOptionLetter(
        "gnss-q01-base-coordinate",
        "unknown-option",
      ),
    ).toBeNull();
    expect(
      evaluateGnssQuizAnswer(
        "gnss-q01-base-coordinate",
        "unknown-option",
      ),
    ).toBeNull();
    expect(evaluateGnssQuizAnswer("unknown-question", "unknown-option")).toBeNull();
    expect(
      calculateGnssPointDifference(
        { x: Number.NaN, y: 0, elevation: 0 },
        { x: 1, y: 1, elevation: 1 },
      ),
    ).toBeNull();
    expect(
      calculateGnssPointDifference(
        { x: 0, y: 0, elevation: 0 },
        { x: Number.POSITIVE_INFINITY, y: 1, elevation: 1 },
      ),
    ).toBeNull();
  });
});
