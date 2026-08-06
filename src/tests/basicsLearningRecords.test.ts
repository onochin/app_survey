import { describe, expect, it } from "vitest";
import { basicsQuizQuestions } from "../components/basics/data/quizData";
import {
  applyBasicsQuizResultToLearningRecords,
  BASICS_LEARNING_RECORD_STORAGE_KEY,
  basicsLearningItemIds,
  basicsLearningItems,
  createBasicsLearningRecords,
  createEmptyBasicsLearningRecord,
  deserializeBasicsLearningRecords,
  getBasicsLessonLearningItemId,
  getBasicsQuizLearningItemId,
  getUnderstoodBasicsLessonIds,
  loadBasicsLearningRecords,
  MAX_BASICS_LEARNING_NOTE_LENGTH,
  recordBasicsLearningPractice,
  saveBasicsLearningRecords,
  updateBasicsLearningRecord,
} from "../components/basics/utils/learningRecords";
import { availableBasicsLessons } from "../components/basics/basicsCourse";
import { LEARNING_RECORD_STORAGE_KEY } from "../utils/learningRecords";

const fixedUpdatedAt = "2026-08-06T01:02:03.000Z";

function createValidPersistedRecord() {
  return {
    isUnderstood: true,
    needsReview: true,
    note: "固定メモ",
    practiceCount: 2,
    updatedAt: fixedUpdatedAt,
  };
}

function createMemoryStorage(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    values,
    storage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    },
  };
}

describe("測量の基礎 Phase 6-2 学習記録", () => {
  it("基礎教材専用保存キーと24項目の安定IDを使用する", () => {
    const lessonItems = basicsLearningItems.filter(
      (item) => item.kind === "lesson",
    );
    const quizItems = basicsLearningItems.filter(
      (item) => item.kind === "quiz",
    );

    expect(BASICS_LEARNING_RECORD_STORAGE_KEY).toBe(
      "survey-learning-lab:basics-learning-records:v1",
    );
    expect(BASICS_LEARNING_RECORD_STORAGE_KEY).not.toBe(
      LEARNING_RECORD_STORAGE_KEY,
    );
    expect(lessonItems).toHaveLength(9);
    expect(quizItems).toHaveLength(15);
    expect(basicsLearningItems).toHaveLength(24);
    expect(new Set(basicsLearningItemIds).size).toBe(24);
    expect(lessonItems.map((item) => item.id)).toEqual(
      availableBasicsLessons.map((lesson) => `lesson:${lesson.id}`),
    );
    expect(quizItems.map((item) => item.id)).toEqual(
      basicsQuizQuestions.map((question) => `quiz:${question.id}`),
    );
  });

  it("全項目の初期状態を作成する", () => {
    const records = createBasicsLearningRecords();

    expect(Object.keys(records)).toEqual(basicsLearningItemIds);
    for (const itemId of basicsLearningItemIds) {
      expect(records[itemId]).toEqual({
        isUnderstood: false,
        needsReview: false,
        note: "",
        practiceCount: 0,
        updatedAt: null,
      });
    }
  });

  it("理解済み・要復習・メモを更新しても回数と日時を変更しない", () => {
    const itemId = getBasicsLessonLearningItemId("point-and-position");
    const records = createBasicsLearningRecords();
    const updated = updateBasicsLearningRecord(records, itemId, {
      isUnderstood: true,
      needsReview: true,
      note: "既知点の基準を復習する",
    });

    expect(updated[itemId]).toEqual({
      isUnderstood: true,
      needsReview: true,
      note: "既知点の基準を復習する",
      practiceCount: 0,
      updatedAt: null,
    });
  });

  it("今回の学習を記録したときだけ回数と最終記録日時を更新する", () => {
    const itemId = getBasicsLessonLearningItemId("distance-and-direction");
    const records = createBasicsLearningRecords();
    const first = recordBasicsLearningPractice(
      records,
      itemId,
      "2026-08-06T01:00:00.000Z",
    );
    const second = recordBasicsLearningPractice(
      first,
      itemId,
      fixedUpdatedAt,
    );

    expect(second[itemId]).toMatchObject({
      practiceCount: 2,
      updatedAt: fixedUpdatedAt,
    });
  });

  it("500文字のメモを保存できる", () => {
    const itemId = getBasicsLessonLearningItemId("height-difference");
    const note = "測".repeat(MAX_BASICS_LEARNING_NOTE_LENGTH);
    const updated = updateBasicsLearningRecord(
      createBasicsLearningRecords(),
      itemId,
      { note },
    );

    expect(updated[itemId]?.note).toBe(note);
  });

  it("501文字以上のメモを拒否する", () => {
    const itemId = getBasicsLessonLearningItemId("height-difference");
    const records = createBasicsLearningRecords();
    const updated = updateBasicsLearningRecord(records, itemId, {
      note: "測".repeat(MAX_BASICS_LEARNING_NOTE_LENGTH + 1),
    });

    expect(updated).toBe(records);
    expect(updated[itemId]?.note).toBe("");
  });

  it("version 1の保存データを保存・読込みできる", () => {
    const itemId = getBasicsQuizLearningItemId(
      "basics-q03-horizontal-distance",
    );
    const { storage, values } = createMemoryStorage();
    const updated = recordBasicsLearningPractice(
      updateBasicsLearningRecord(
        createBasicsLearningRecords(),
        itemId,
        {
          isUnderstood: true,
          needsReview: true,
          note: "水平距離の式を確認",
        },
      ),
      itemId,
      fixedUpdatedAt,
    );

    expect(saveBasicsLearningRecords(storage, updated)).toBeNull();
    expect(
      JSON.parse(values.get(BASICS_LEARNING_RECORD_STORAGE_KEY) ?? ""),
    ).toMatchObject({ version: 1 });
    expect(loadBasicsLearningRecords(storage)).toEqual({
      records: updated,
      error: null,
    });
  });

  it("未知の章ID・問題IDと不明なプロパティを状態へ入れない", () => {
    const knownItemId = getBasicsLessonLearningItemId("error-and-equipment");
    const records = deserializeBasicsLearningRecords(
      JSON.stringify({
        version: 1,
        records: {
          [knownItemId]: {
            ...createValidPersistedRecord(),
            unknownProperty: "除外する",
          },
          "lesson:unknown-lesson": createValidPersistedRecord(),
          "quiz:basics-q99-unknown": createValidPersistedRecord(),
        },
      }),
    );

    expect(records[knownItemId]).toEqual(createValidPersistedRecord());
    expect(records["lesson:unknown-lesson"]).toBeUndefined();
    expect(records["quiz:basics-q99-unknown"]).toBeUndefined();
    expect(records[knownItemId]).not.toHaveProperty("unknownProperty");
  });

  it("不正なversionと保存データ全体を安全に初期化する", () => {
    const invalidVersion = deserializeBasicsLearningRecords(
      JSON.stringify({ version: 2, records: {} }),
    );
    const invalidJson = deserializeBasicsLearningRecords("{invalid");

    expect(invalidVersion).toEqual(createBasicsLearningRecords());
    expect(invalidJson).toEqual(createBasicsLearningRecords());
  });

  it("不正な型・負の回数・無効日時・長すぎるメモの記録を除外する", () => {
    const invalidItemIds = basicsLearningItemIds.slice(0, 4);
    const records = deserializeBasicsLearningRecords(
      JSON.stringify({
        version: 1,
        records: {
          [invalidItemIds[0]!]: {
            ...createValidPersistedRecord(),
            isUnderstood: "yes",
          },
          [invalidItemIds[1]!]: {
            ...createValidPersistedRecord(),
            practiceCount: -1,
          },
          [invalidItemIds[2]!]: {
            ...createValidPersistedRecord(),
            updatedAt: "invalid-date",
          },
          [invalidItemIds[3]!]: {
            ...createValidPersistedRecord(),
            note: "a".repeat(MAX_BASICS_LEARNING_NOTE_LENGTH + 1),
          },
        },
      }),
    );

    for (const itemId of invalidItemIds) {
      expect(records[itemId]).toEqual(createEmptyBasicsLearningRecord());
    }
  });

  it("一部に不正な記録があっても正しい記録を復元する", () => {
    const validItemId = getBasicsLessonLearningItemId(
      "total-station-observation",
    );
    const invalidItemId = getBasicsLessonLearningItemId("leveling-basics");
    const records = deserializeBasicsLearningRecords(
      JSON.stringify({
        version: 1,
        records: {
          [validItemId]: createValidPersistedRecord(),
          [invalidItemId]: {
            ...createValidPersistedRecord(),
            needsReview: 1,
          },
        },
      }),
    );

    expect(records[validItemId]).toEqual(createValidPersistedRecord());
    expect(records[invalidItemId]).toEqual(
      createEmptyBasicsLearningRecord(),
    );
  });

  it("localStorageを利用できない場合も初期状態と日本語案内を返す", () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    const loaded = loadBasicsLearningRecords(unavailableStorage);

    expect(loaded.records).toEqual(createBasicsLearningRecords());
    expect(loaded.error).toContain("画面を開いている間は操作を続けられます");
    expect(
      saveBasicsLearningRecords(unavailableStorage, loaded.records),
    ).toContain("保存できませんでした");
  });

  it("誤答した問題を自動復習へ登録し、正答後も自動解除しない", () => {
    const questionId = "basics-q01-survey-purpose";
    const itemId = getBasicsQuizLearningItemId(questionId);
    const afterIncorrect = applyBasicsQuizResultToLearningRecords(
      createBasicsLearningRecords(),
      questionId,
      false,
    );
    const afterCorrect = applyBasicsQuizResultToLearningRecords(
      afterIncorrect,
      questionId,
      true,
    );

    expect(afterIncorrect[itemId]).toMatchObject({
      needsReview: true,
      practiceCount: 0,
      updatedAt: null,
    });
    expect(afterCorrect[itemId]?.needsReview).toBe(true);
  });

  it("未知の問題は自動復習へ登録しない", () => {
    const records = createBasicsLearningRecords();

    expect(
      applyBasicsQuizResultToLearningRecords(
        records,
        "basics-q99-unknown",
        false,
      ),
    ).toBe(records);
  });

  it("保存した章の理解状態を再読込み後の進捗へ反映できる", () => {
    const itemId = getBasicsLessonLearningItemId("observation-error");
    const updated = updateBasicsLearningRecord(
      createBasicsLearningRecords(),
      itemId,
      { isUnderstood: true },
    );
    const reloaded = deserializeBasicsLearningRecords(
      JSON.stringify({ version: 1, records: updated }),
    );

    expect(getUnderstoodBasicsLessonIds(reloaded)).toEqual([
      "observation-error",
    ]);
  });

  it("基礎記録の保存が閉合トラバースの保存キーと形式へ影響しない", () => {
    const traversePayload = JSON.stringify({
      version: 1,
      records: {
        "step-1": createValidPersistedRecord(),
      },
    });
    const { storage, values } = createMemoryStorage({
      [LEARNING_RECORD_STORAGE_KEY]: traversePayload,
    });

    expect(
      saveBasicsLearningRecords(storage, createBasicsLearningRecords()),
    ).toBeNull();
    expect(values.get(LEARNING_RECORD_STORAGE_KEY)).toBe(traversePayload);
    expect(
      JSON.parse(values.get(BASICS_LEARNING_RECORD_STORAGE_KEY) ?? ""),
    ).toMatchObject({ version: 1, records: expect.any(Object) });
  });
});
