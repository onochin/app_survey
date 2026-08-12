import { describe, expect, it } from "vitest";
import {
  gnssBaselineFixLesson,
  gnssCoordinateHeightLesson,
  gnssCorrectionDeliveryLesson,
  gnssLessons,
  gnssObservationsLesson,
  gnssOverviewLesson,
  gnssOwnBaseStationLesson,
  gnssPositioningMethodsLesson,
} from "../components/gnss/gnssCourse";
import {
  evaluateGnssBaselineFixQuizAnswer,
  getGnssBaselineAmbiguityEvaluationStage,
  getGnssBaselineFixQuizOptionLetter,
  getGnssBaselineFixQuizQuestion,
  getNextGnssBaselineAmbiguityEvaluationStageId,
  gnssBaselineAmbiguityCandidates,
  gnssBaselineAmbiguityEvaluationStages,
  gnssBaselineCandidateEpochNote,
  gnssBaselineCandidateSchematicNote,
  gnssBaselineDeviceDisplayRows,
  gnssBaselineDoubleDifferenceEffects,
  gnssBaselineDoubleDifferenceSteps,
  gnssBaselineExternalLinks,
  gnssBaselineFixCards,
  gnssBaselineFixMapSteps,
  gnssBaselineFixQuizQuestions,
  gnssBaselineFixScenario,
  gnssBaselineFloatEstimates,
  gnssBaselineReceiverComparison,
  gnssBaselineReceiverDifferenceEffects,
  gnssBaselineResultConditions,
} from "../components/gnss/data/gnssBaselineFix";
import { gnssCoordinateHeightQuizQuestions } from "../components/gnss/data/gnssCoordinateHeight";
import { gnssCorrectionDeliveryQuizQuestions } from "../components/gnss/data/gnssCorrectionDelivery";
import { gnssObservationsQuizQuestions } from "../components/gnss/data/gnssObservations";
import {
  fixedGnssScenario,
  gnssQuizQuestions,
} from "../components/gnss/data/gnssOverview";
import { gnssOwnBaseStationQuizQuestions } from "../components/gnss/data/gnssOwnBaseStation";
import { gnssPositioningMethodsQuizQuestions } from "../components/gnss/data/gnssPositioningMethods";

describe("GNSS測量 Phase 7 第7章", () => {
  it("第1章～第6章を維持し、第7章だけを利用可能な章へ追加する", () => {
    expect([
      gnssOverviewLesson,
      gnssObservationsLesson,
      gnssCoordinateHeightLesson,
      gnssPositioningMethodsLesson,
      gnssOwnBaseStationLesson,
      gnssCorrectionDeliveryLesson,
    ]).toMatchObject([
      { id: "gnss-overview", number: 1, title: "GNSS測量の全体像" },
      {
        id: "gnss-observations",
        number: 2,
        title: "GNSSは何を観測しているのか",
      },
      {
        id: "gnss-coordinate-height",
        number: 3,
        title: "GNSSの座標と高さ",
      },
      {
        id: "gnss-positioning-methods",
        number: 4,
        title: "GNSS測位方式を比較する",
      },
      {
        id: "gnss-own-base-station",
        number: 5,
        title: "自前RTK① 基準局をつくる",
      },
      {
        id: "gnss-correction-delivery",
        number: 6,
        title: "自前RTK② 補正情報を届ける",
      },
    ]);
    expect(gnssBaselineFixLesson).toMatchObject({
      id: "gnss-baseline-fix",
      number: 7,
      title: "自前RTK③ 基線解析とFIX",
      learningGoal:
        "基準局Aと移動局P1のGNSS観測を比較することで、なぜ共通する誤差の影響を相殺・低減しながら3次元の相対位置「基線」を求められるのかを理解し、搬送波位相の整数アンビギュイティがFLOATからFIXへ進む意味を説明できる。",
    });
    expect(gnssLessons.map((lesson) => lesson.id)).toEqual([
      "gnss-overview",
      "gnss-observations",
      "gnss-coordinate-height",
      "gnss-positioning-methods",
      "gnss-own-base-station",
      "gnss-correction-delivery",
      "gnss-baseline-fix",
    ]);
    expect(gnssLessons).toHaveLength(7);
    expect(gnssLessons.every((lesson) => lesson.number <= 7)).toBe(true);
    expect(gnssQuizQuestions).toHaveLength(3);
    expect(gnssObservationsQuizQuestions).toHaveLength(7);
    expect(gnssCoordinateHeightQuizQuestions).toHaveLength(8);
    expect(gnssPositioningMethodsQuizQuestions).toHaveLength(8);
    expect(gnssOwnBaseStationQuizQuestions).toHaveLength(8);
    expect(gnssCorrectionDeliveryQuizQuestions).toHaveLength(8);
    expect(gnssBaselineFixQuizQuestions).toHaveLength(8);
  });

  it("9カードを安定IDと指定順で定義する", () => {
    expect(gnssBaselineFixCards.map((card) => card.id)).toEqual([
      "rtcm-to-analysis",
      "receiver-observation-comparison",
      "double-difference",
      "float-state",
      "ambiguity-candidate-evaluation",
      "three-dimensional-baseline",
      "fix-monitoring",
      "fix-and-result-acceptance",
      "rtcm-to-fix-summary",
    ]);
    expect(gnssBaselineFixCards.map((card) => card.title)).toEqual([
      "RTCMは届いた。なぜまだFLOAT？",
      "なぜ基準局AとP1の2地点を比較する？",
      "なぜ、もう1機の衛星とも比べる？",
      "FLOATでは、何が分かっていて何が未確定？",
      "どうやって整数候補を絞ってFIXする？",
      "FIXすると、基線はどう変わる？",
      "一度FIXしたら、そのままずっとFIX？",
      "FIXしているのに、成果が間違うことはある？",
      "RTCM受信からFIXまでをつなげよう",
    ]);
    expect(gnssBaselineFixCards).toHaveLength(9);
  });

  it("RTCM正常・FLOATから3次元基線と第8章点検までの地図を定義する", () => {
    expect(gnssBaselineFixMapSteps.map((step) => step.id)).toEqual([
      "rtcm-received",
      "combine-observations",
      "compare-receivers",
      "double-difference",
      "estimate-unknowns",
      "float",
      "evaluate-candidates",
      "fix-integers",
      "fix",
      "baseline",
      "p1-position",
      "field-check",
    ]);
    expect(gnssBaselineFixMapSteps[0]).toMatchObject({
      label: "RTCMがP1へ届いた",
      chapter: "第6章",
    });
    expect(gnssBaselineFixMapSteps.at(-1)).toMatchObject({
      label: "成果採用前の現場点検",
      chapter: "第8章へ",
    });
  });

  it("1衛星・2受信機の比較と誤差の相殺・低減・残存を区別する", () => {
    expect(gnssBaselineReceiverComparison.map((receiver) => receiver.id)).toEqual([
      "base-a",
      "rover-p1",
    ]);
    expect(gnssBaselineReceiverComparison[1].observation).toContain("対応する時刻");
    expect(gnssBaselineReceiverDifferenceEffects.map((effect) => effect.label)).toEqual([
      "相殺できる代表例",
      "近距離なら差が小さくなりやすいもの",
      "残るもの",
    ]);
    expect(gnssBaselineReceiverDifferenceEffects[1].note).toBe(
      "完全に消えるとは限らない",
    );
    expect(gnssBaselineReceiverDifferenceEffects[2].items).toEqual([
      "マルチパス",
      "観測ノイズ",
      "地点固有の影響",
    ]);
  });

  it("2受信機・2衛星の二重差と残る整数アンビギュイティを定義する", () => {
    expect(gnssBaselineDoubleDifferenceSteps).toMatchObject([
      {
        satellite: "衛星 G1",
        expression: "P1の観測 − Aの観測",
        result: "受信機間の差①",
      },
      {
        satellite: "衛星 G2",
        expression: "P1の観測 − Aの観測",
        result: "受信機間の差②",
      },
    ]);
    expect(gnssBaselineDoubleDifferenceEffects.map((effect) => effect.label)).toEqual([
      "二重差で代表的に相殺",
      "近距離で低減しやすい",
      "二重差後も残る",
    ]);
    expect(gnssBaselineDoubleDifferenceEffects[2].items).toContain(
      "整数アンビギュイティ",
    );
  });

  it("FLOATを解なしとせず実数推定値と単純丸めでない接続を持つ", () => {
    expect(gnssBaselineFloatEstimates.map((estimate) => estimate.value)).toEqual([
      11.82,
      18.17,
      24.91,
    ]);
    expect(gnssBaselineFixCards[3].focus).toContain("推定解");
    expect(gnssBaselineFixCards[4].focus).toContain("観測全体との整合性");
  });

  it("3候補・3段階をFLOATからFIXへ進め、未知段階を安全に拒否する", () => {
    expect(gnssBaselineAmbiguityCandidates).toMatchObject([
      { id: "candidate-a", values: [12, 18, 25] },
      { id: "candidate-b", values: [12, 19, 25] },
      { id: "candidate-c", values: [13, 18, 25] },
    ]);
    expect(gnssBaselineAmbiguityEvaluationStages.map((stage) => stage.id)).toEqual([
      "initial",
      "comparison",
      "fixed",
    ]);
    expect(gnssBaselineAmbiguityEvaluationStages.map((stage) => stage.status)).toEqual([
      "FLOAT",
      "FLOAT",
      "FIX",
    ]);
    expect(gnssBaselineAmbiguityEvaluationStages[0].evaluations.map((item) => item.consistency)).toEqual([
      "高",
      "高",
      "中",
    ]);
    expect(gnssBaselineAmbiguityEvaluationStages[1].conclusion).toContain(
      "候補Bが最良",
    );
    expect(gnssBaselineAmbiguityEvaluationStages[1].nextAction).toContain(
      "FLOATを維持",
    );
    expect(gnssBaselineAmbiguityEvaluationStages[2].conclusion).toContain(
      "候補B",
    );
    expect(getGnssBaselineAmbiguityEvaluationStage("initial")?.id).toBe(
      "initial",
    );
    expect(getGnssBaselineAmbiguityEvaluationStage("unknown")).toBeNull();
    expect(getNextGnssBaselineAmbiguityEvaluationStageId("initial")).toBe(
      "comparison",
    );
    expect(getNextGnssBaselineAmbiguityEvaluationStageId("comparison")).toBe(
      "fixed",
    );
    expect(getNextGnssBaselineAmbiguityEvaluationStageId("fixed")).toBeNull();
    expect(getNextGnssBaselineAmbiguityEvaluationStageId("unknown")).toBeNull();
  });

  it("候補評価を実解析とせず、複数エポック必須とも断定しない", () => {
    expect(gnssBaselineCandidateSchematicNote).toContain("教材用の模式例");
    expect(gnssBaselineCandidateSchematicNote).toContain("専用解析");
    expect(gnssBaselineCandidateSchematicNote).toContain("再現していません");
    expect(gnssBaselineCandidateEpochNote).toContain("単一エポック");
    expect(gnssBaselineCandidateEpochNote).toContain(
      "複数時刻の観測が必ず必要という意味ではありません",
    );
  });

  it("第1章のA・P1固定値を同じ参照で3次元基線へ再利用する", () => {
    expect(gnssBaselineFixScenario).toBe(fixedGnssScenario);
    expect(gnssBaselineFixScenario).toMatchObject({
      knownPoint: { name: "A", x: 1000, y: 1000, elevation: 50 },
      newPoint: { name: "P1", x: 1012.345, y: 1008.765, elevation: 49.832 },
      offsetFromKnownPoint: { north: 12.345, east: 8.765, height: -0.168 },
    });
  });

  it("FIX後の再評価、成果条件、ミスFIX、第5～7章総まとめを保持する", () => {
    expect(gnssBaselineFixCards[6].focus).toContain("FLOATへ戻る");
    expect(gnssBaselineFixCards[7].focus).toContain("ミスFIX");
    expect(gnssBaselineFixCards[8].focus).toContain("第5章から第7章");
    expect(gnssBaselineResultConditions.map((condition) => condition.id)).toEqual([
      "rtk-analysis",
      "base-station",
      "survey-point",
      "result-conditions",
    ]);
    expect(gnssBaselineResultConditions[3].items).toEqual([
      "測地系",
      "系番号",
      "座標の時点",
      "高さ基準",
    ]);
  });

  it("Drogger表示のStatus・RTCM3・Age・Float・FIXEDを一般理論と区別する", () => {
    expect(gnssBaselineDeviceDisplayRows.map((row) => row.deviceExample)).toEqual([
      "Status / RTCM3",
      "Age",
      "FixMode：Float",
      "FixMode：FIXED",
    ]);
    expect(gnssBaselineDeviceDisplayRows[0].note).toContain("Drogger-GPS");
    expect(gnssBaselineDeviceDisplayRows[1].note).toContain("時間差");
    expect(gnssBaselineDeviceDisplayRows[3].note).toContain(
      "成果条件全体の合格表示ではない",
    );
  });

  it("対応カードだけに到達可能なDrogger公式静的リンクを定義する", () => {
    expect(gnssBaselineExternalLinks.every((link) => link.href.startsWith("https://"))).toBe(
      true,
    );
    expect(gnssBaselineExternalLinks.every((link) => link.href.trim() !== "")).toBe(
      true,
    );
    const linkedCards = new Set<number>(
      gnssBaselineExternalLinks.flatMap((link) => [...link.cardIds]),
    );
    expect([...linkedCards].sort((left, right) => left - right)).toEqual([
      1,
      2,
      4,
      6,
      7,
      8,
      9,
    ]);
    expect(linkedCards.has(3)).toBe(false);
    expect(linkedCards.has(5)).toBe(false);
  });

  it("確認問題8問を安定IDとB/C/A/D/B/C/A/Dの正答位置で定義する", () => {
    expect(gnssBaselineFixQuizQuestions.map((question) => question.id)).toEqual([
      "rtcm-received-still-float",
      "baseline-definition",
      "double-difference-concept",
      "float-state-meaning",
      "ambiguity-candidate-fixing",
      "fix-baseline-effect",
      "fix-can-return-float",
      "fix-vs-result-acceptance",
    ]);
    const correctLetters = gnssBaselineFixQuizQuestions.map((question) =>
      getGnssBaselineFixQuizOptionLetter(
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
    const allOptionIds = gnssBaselineFixQuizQuestions.flatMap((question) =>
      question.options.map((option) => option.id),
    );
    expect(new Set(allOptionIds).size).toBe(32);

    for (const question of gnssBaselineFixQuizQuestions) {
      expect(question.options).toHaveLength(4);
      expect(question.correctOptionId).not.toMatch(/^[A-D]$/);
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        const evaluation = evaluateGnssBaselineFixQuizAnswer(
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
    expect(getGnssBaselineFixQuizQuestion("unknown")).toBeNull();
    expect(getGnssBaselineFixQuizOptionLetter("unknown", "unknown")).toBeNull();
    expect(
      getGnssBaselineFixQuizOptionLetter(
        "rtcm-received-still-float",
        "unknown",
      ),
    ).toBeNull();
    expect(evaluateGnssBaselineFixQuizAnswer("unknown", "unknown")).toBeNull();
    expect(
      evaluateGnssBaselineFixQuizAnswer(
        "rtcm-received-still-float",
        "unknown",
      ),
    ).toBeNull();
  });
});
