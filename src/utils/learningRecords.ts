import type {
  LearningRecord,
  LearningRecordMap,
  LearningRecordUpdate,
} from "../types/learningRecord";

export const LEARNING_RECORD_STORAGE_KEY =
  "survey-learning-lab:traverse-learning-records:v1";
export const MAX_LEARNING_NOTE_LENGTH = 500;

interface LearningRecordStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface LearningRecordPayload {
  readonly version: 1;
  readonly records: LearningRecordMap;
}

export interface LearningRecordLoadResult {
  readonly records: LearningRecordMap;
  readonly error: string | null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeUpdatedAt(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    Number.isNaN(Date.parse(value))
  ) {
    return null;
  }

  return value;
}

function normalizePracticeCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

export function createEmptyLearningRecord(): LearningRecord {
  return {
    isUnderstood: false,
    needsReview: false,
    note: "",
    practiceCount: 0,
    updatedAt: null,
  };
}

export function createLearningRecords(
  contentIds: readonly string[],
): LearningRecordMap {
  return Object.fromEntries(
    contentIds.map((contentId) => [
      contentId,
      createEmptyLearningRecord(),
    ]),
  );
}

function normalizeLearningRecord(value: unknown): LearningRecord {
  if (!isObject(value)) {
    return createEmptyLearningRecord();
  }

  return {
    isUnderstood:
      typeof value.isUnderstood === "boolean"
        ? value.isUnderstood
        : false,
    needsReview:
      typeof value.needsReview === "boolean"
        ? value.needsReview
        : false,
    note:
      typeof value.note === "string"
        ? value.note.slice(0, MAX_LEARNING_NOTE_LENGTH)
        : "",
    practiceCount: normalizePracticeCount(value.practiceCount),
    updatedAt: normalizeUpdatedAt(value.updatedAt),
  };
}

export function deserializeLearningRecords(
  serialized: string | null,
  contentIds: readonly string[],
): LearningRecordMap {
  const emptyRecords = createLearningRecords(contentIds);

  if (serialized === null) {
    return emptyRecords;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch {
    return emptyRecords;
  }

  if (!isObject(parsed) || parsed.version !== 1) {
    return emptyRecords;
  }

  const parsedRecords = parsed.records;

  if (!isObject(parsedRecords)) {
    return emptyRecords;
  }

  return Object.fromEntries(
    contentIds.map((contentId) => [
      contentId,
      normalizeLearningRecord(parsedRecords[contentId]),
    ]),
  );
}

export function loadLearningRecords(
  storage: LearningRecordStorage,
  contentIds: readonly string[],
): LearningRecordLoadResult {
  try {
    return {
      records: deserializeLearningRecords(
        storage.getItem(LEARNING_RECORD_STORAGE_KEY),
        contentIds,
      ),
      error: null,
    };
  } catch {
    return {
      records: createLearningRecords(contentIds),
      error:
        "学習記録を読み込めませんでした。ブラウザの保存設定を確認してください。",
    };
  }
}

export function saveLearningRecords(
  storage: LearningRecordStorage,
  records: LearningRecordMap,
): string | null {
  const payload: LearningRecordPayload = {
    version: 1,
    records,
  };

  try {
    storage.setItem(
      LEARNING_RECORD_STORAGE_KEY,
      JSON.stringify(payload),
    );
    return null;
  } catch {
    return "学習記録を保存できませんでした。ブラウザの保存容量や設定を確認してください。";
  }
}

export function updateLearningRecord(
  records: LearningRecordMap,
  contentId: string,
  update: LearningRecordUpdate,
  updatedAt = new Date().toISOString(),
): LearningRecordMap {
  const current =
    records[contentId] ?? createEmptyLearningRecord();

  return {
    ...records,
    [contentId]: {
      ...current,
      ...update,
      note:
        update.note === undefined
          ? current.note
          : update.note.slice(0, MAX_LEARNING_NOTE_LENGTH),
      updatedAt,
    },
  };
}

export function recordLearningPractice(
  records: LearningRecordMap,
  contentId: string,
  update: LearningRecordUpdate = {},
  updatedAt = new Date().toISOString(),
): LearningRecordMap {
  const current =
    records[contentId] ?? createEmptyLearningRecord();
  const updated = updateLearningRecord(
    records,
    contentId,
    update,
    updatedAt,
  );

  return {
    ...updated,
    [contentId]: {
      ...updated[contentId]!,
      practiceCount: current.practiceCount + 1,
    },
  };
}

export function hasLearningActivity(
  record: LearningRecord,
): boolean {
  return (
    record.isUnderstood ||
    record.needsReview ||
    record.note.trim().length > 0 ||
    record.practiceCount > 0
  );
}
