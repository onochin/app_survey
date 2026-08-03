import { describe, expect, it } from "vitest";
import { basicsLessons } from "../components/basics/basicsCourse";
import {
  basicsQuizQuestions,
  evaluateBasicsQuizAnswer,
  getBasicsQuizQuestionsForLesson,
} from "../components/basics/data/quizData";

describe("測量の基礎 Phase 6-1 確認問題", () => {
  it("第1章から第9章のすべてに確認問題を用意する", () => {
    const questionCountByLesson = Object.fromEntries(
      basicsLessons.map((lesson) => [
        lesson.id,
        getBasicsQuizQuestionsForLesson(lesson.id).length,
      ]),
    );

    expect(basicsQuizQuestions).toHaveLength(15);
    expect(questionCountByLesson).toEqual({
      "point-and-position": 1,
      "distance-and-direction": 1,
      "height-difference": 1,
      "error-and-equipment": 1,
      "total-station-observation": 2,
      "leveling-basics": 1,
      "observation-error": 2,
      "coordinate-calculation": 1,
      "field-workflow": 5,
    });

    for (const lesson of basicsLessons) {
      expect(getBasicsQuizQuestionsForLesson(lesson.id).length).toBeGreaterThan(
        0,
      );
    }
  });

  it("問題IDを基礎教材名前空間の一意な文字列で管理する", () => {
    const questionIds = basicsQuizQuestions.map((question) => question.id);

    expect(new Set(questionIds).size).toBe(questionIds.length);
    for (const questionId of questionIds) {
      expect(questionId).toMatch(/^basics-q\d{2}-[a-z0-9-]+$/);
    }
  });

  it("選択肢IDは問題内で一意で、正答IDに一致する選択肢が1つだけある", () => {
    for (const question of basicsQuizQuestions) {
      const optionIds = question.options.map((option) => option.id);
      const correctOptions = question.options.filter(
        (option) => option.id === question.correctOptionId,
      );

      expect(question.options.length).toBeGreaterThanOrEqual(3);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(correctOptions).toHaveLength(1);
      expect(correctOptions[0]?.incorrectReason).toBeNull();
    }
  });

  it("正答理由と現場確認事項を持ち、各誤答に取り違えの理由を設定する", () => {
    for (const question of basicsQuizQuestions) {
      expect(question.correctReason.trim()).not.toBe("");
      expect(question.fieldCheck.trim()).not.toBe("");

      for (const option of question.options) {
        if (option.id === question.correctOptionId) {
          continue;
        }

        expect(option.incorrectReason?.trim()).not.toBe("");
        expect(option.incorrectReason).not.toBe("不正解です");
      }
    }
  });

  it("すべての問題が実在する章IDを参照する", () => {
    const lessonIds = new Set(basicsLessons.map((lesson) => lesson.id));

    for (const question of basicsQuizQuestions) {
      expect(lessonIds.has(question.lessonId)).toBe(true);
    }
  });

  it("第5章・第7章・第9章に既存固定例を用いる現場判断問題を持つ", () => {
    const fieldQuestionSourcesByLesson = new Map(
      [
        "total-station-observation",
        "observation-error",
        "field-workflow",
      ].map((lessonId) => [
        lessonId,
        getBasicsQuizQuestionsForLesson(lessonId)
          .filter((question) => question.questionType === "現場判断")
          .map((question) => question.sourceScenarioId),
      ]),
    );

    expect(fieldQuestionSourcesByLesson.get("total-station-observation")).toEqual(
      ["backsight-shifted"],
    );
    expect(fieldQuestionSourcesByLesson.get("observation-error")).toEqual([
      "within-large-residual",
    ]);
    expect(fieldQuestionSourcesByLesson.get("field-workflow")).toEqual([
      null,
      "checks-complete",
      "transcription-error",
      "wrong-backsight",
    ]);
  });

  it("正答をUIに依存せず判定し、正答理由と現場確認事項を返す", () => {
    const evaluation = evaluateBasicsQuizAnswer(
      "basics-q03-horizontal-distance",
      "horizontal-40",
    );

    expect(evaluation).toMatchObject({
      questionId: "basics-q03-horizontal-distance",
      selectedOptionId: "horizontal-40",
      correctOptionId: "horizontal-40",
      isCorrect: true,
      selectedOptionLabel: "40.000 m",
      correctOptionLabel: "40.000 m",
    });
    expect(evaluation?.correctReason).toContain("√（50²−30²）");
    expect(evaluation?.fieldCheck).not.toBe("");
  });

  it("誤答を判定し、その選択肢固有の誤答理由と正答を返す", () => {
    const evaluation = evaluateBasicsQuizAnswer(
      "basics-q03-horizontal-distance",
      "slope-50",
    );

    expect(evaluation).toMatchObject({
      selectedOptionId: "slope-50",
      selectedOptionLabel: "50.000 m",
      correctOptionId: "horizontal-40",
      correctOptionLabel: "40.000 m",
      isCorrect: false,
    });
    expect(evaluation?.selectedAnswerReason).toContain("斜距離");
    expect(evaluation?.correctReason).toContain("40.000 m");
  });

  it("存在しない問題ID・選択肢ID・章IDを安全に扱う", () => {
    expect(
      evaluateBasicsQuizAnswer("basics-q99-unknown", "unknown-option"),
    ).toBeNull();
    expect(
      evaluateBasicsQuizAnswer(
        "basics-q01-survey-purpose",
        "unknown-option",
      ),
    ).toBeNull();
    expect(getBasicsQuizQuestionsForLesson("unknown-lesson")).toEqual([]);
  });
});
