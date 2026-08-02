import { describe, expect, it } from "vitest";
import {
  createLearningRecords,
  deserializeLearningRecords,
  hasLearningActivity,
  loadLearningRecords,
  MAX_LEARNING_NOTE_LENGTH,
  recordLearningPractice,
  saveLearningRecords,
  updateLearningRecord,
} from "../utils/learningRecords";

const contentIds = ["step-1", "step-2", "quiz"] as const;

describe("learning records", () => {
  it("creates an empty record for every learning item", () => {
    const records = createLearningRecords(contentIds);

    expect(records["step-1"]).toEqual({
      isUnderstood: false,
      needsReview: false,
      note: "",
      practiceCount: 0,
      updatedAt: null,
    });
    expect(Object.keys(records)).toEqual(contentIds);
  });

  it("updates checks and notes without changing other items", () => {
    const records = createLearningRecords(contentIds);
    const updated = updateLearningRecord(
      records,
      "step-1",
      {
        isUnderstood: true,
        needsReview: true,
        note: "方位角を復習する",
      },
      "2026-07-29T01:02:03.000Z",
    );

    expect(updated["step-1"]).toMatchObject({
      isUnderstood: true,
      needsReview: true,
      note: "方位角を復習する",
      updatedAt: "2026-07-29T01:02:03.000Z",
    });
    expect(updated["step-2"]).toEqual(records["step-2"]);
    expect(hasLearningActivity(updated["step-1"]!)).toBe(true);
  });

  it("counts repeated practice", () => {
    const records = createLearningRecords(contentIds);
    const first = recordLearningPractice(
      records,
      "step-1",
      {},
      "2026-07-29T01:00:00.000Z",
    );
    const second = recordLearningPractice(
      first,
      "step-1",
      { needsReview: true },
      "2026-07-29T02:00:00.000Z",
    );

    expect(second["step-1"]).toMatchObject({
      needsReview: true,
      practiceCount: 2,
      updatedAt: "2026-07-29T02:00:00.000Z",
    });
  });

  it("sanitizes malformed persisted data and ignores unknown items", () => {
    const oversizedNote = "a".repeat(MAX_LEARNING_NOTE_LENGTH + 20);
    const serialized = JSON.stringify({
      version: 1,
      records: {
        "step-1": {
          isUnderstood: true,
          needsReview: "yes",
          note: oversizedNote,
          practiceCount: 2.9,
          updatedAt: "invalid",
        },
        unknown: {
          isUnderstood: true,
        },
      },
    });

    const records = deserializeLearningRecords(
      serialized,
      contentIds,
    );

    expect(records["step-1"]).toEqual({
      isUnderstood: true,
      needsReview: false,
      note: "a".repeat(MAX_LEARNING_NOTE_LENGTH),
      practiceCount: 2,
      updatedAt: null,
    });
    expect(records.unknown).toBeUndefined();
    expect(records["step-2"]).toEqual(
      createLearningRecords(["step-2"])["step-2"],
    );
  });

  it("round-trips records through storage", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    const updated = updateLearningRecord(
      createLearningRecords(contentIds),
      "quiz",
      { needsReview: true, note: "閉合差の原因を確認" },
      "2026-07-29T03:00:00.000Z",
    );

    expect(saveLearningRecords(storage, updated)).toBeNull();
    expect(loadLearningRecords(storage, contentIds)).toEqual({
      records: updated,
      error: null,
    });
  });

  it("returns an error when browser storage is unavailable", () => {
    const storage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(loadLearningRecords(storage, contentIds).error).toContain(
      "読み込めませんでした",
    );
    expect(
      saveLearningRecords(
        storage,
        createLearningRecords(contentIds),
      ),
    ).toContain("保存できませんでした");
  });
});
