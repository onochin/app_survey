import {
  availableBasicsLessons,
  type AvailableBasicsLessonId,
} from "../basicsCourse";
import { basicsQuizQuestions } from "../data/quizData";
import type {
  BasicsLearningItem,
  BasicsLearningItemId,
  BasicsLearningRecord,
  BasicsLearningRecordMap,
  BasicsLearningRecordUpdate,
} from "../learningRecordTypes";

export const BASICS_LEARNING_RECORD_STORAGE_KEY =
  "survey-learning-lab:basics-learning-records:v1";
export const MAX_BASICS_LEARNING_NOTE_LENGTH = 500;

interface BasicsLearningRecordStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface BasicsLearningRecordPayload {
  readonly version: 1;
  readonly records: BasicsLearningRecordMap;
}

export interface BasicsLearningRecordLoadResult {
  readonly records: BasicsLearningRecordMap;
  readonly error: string | null;
}

export function getBasicsLessonLearningItemId(
  lessonId: AvailableBasicsLessonId,
): BasicsLearningItemId {
  return `lesson:${lessonId}`;
}

export function getBasicsQuizLearningItemId(
  questionId: string,
): BasicsLearningItemId {
  return `quiz:${questionId}`;
}

export function getBasicsLearningDomSuffix(
  itemId: BasicsLearningItemId,
): string {
  return itemId.replace(/[^a-zA-Z0-9-]/g, "-");
}

export const basicsLearningItems: readonly BasicsLearningItem[] =
  availableBasicsLessons.flatMap((lesson) => {
    const lessonItemId = getBasicsLessonLearningItemId(lesson.id);
    const lessonItem: BasicsLearningItem = {
      id: lessonItemId,
      kind: "lesson",
      lessonId: lesson.id,
      lessonNumber: lesson.number,
      lessonTitle: lesson.title,
      title: lesson.title,
      questionId: null,
      targetDomId: `basics-learning-editor-${getBasicsLearningDomSuffix(
        lessonItemId,
      )}`,
    };
    const quizItems: BasicsLearningItem[] = basicsQuizQuestions
      .filter((question) => question.lessonId === lesson.id)
      .map((question) => ({
        id: getBasicsQuizLearningItemId(question.id),
        kind: "quiz",
        lessonId: lesson.id,
        lessonNumber: lesson.number,
        lessonTitle: lesson.title,
        title: question.prompt,
        questionId: question.id,
        targetDomId: `basics-quiz-card-${question.id}`,
      }));

    return [lessonItem, ...quizItems];
  });

export const basicsLearningItemIds: readonly BasicsLearningItemId[] =
  basicsLearningItems.map((item) => item.id);

const basicsLearningItemIdSet = new Set<string>(basicsLearningItemIds);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidUpdatedAt(value: unknown): value is string | null {
  return (
    value === null ||
    (typeof value === "string" &&
      value.trim().length > 0 &&
      !Number.isNaN(Date.parse(value)))
  );
}

function normalizeBasicsLearningRecord(
  value: unknown,
): BasicsLearningRecord | null {
  if (
    !isObject(value) ||
    typeof value.isUnderstood !== "boolean" ||
    typeof value.needsReview !== "boolean" ||
    typeof value.note !== "string" ||
    value.note.length > MAX_BASICS_LEARNING_NOTE_LENGTH ||
    typeof value.practiceCount !== "number" ||
    !Number.isFinite(value.practiceCount) ||
    !Number.isInteger(value.practiceCount) ||
    value.practiceCount < 0 ||
    !isValidUpdatedAt(value.updatedAt)
  ) {
    return null;
  }

  return {
    isUnderstood: value.isUnderstood,
    needsReview: value.needsReview,
    note: value.note,
    practiceCount: value.practiceCount,
    updatedAt: value.updatedAt,
  };
}

export function isBasicsLearningItemId(
  value: string,
): value is BasicsLearningItemId {
  return basicsLearningItemIdSet.has(value);
}

export function getBasicsLearningItem(
  itemId: string,
): BasicsLearningItem | null {
  return basicsLearningItems.find((item) => item.id === itemId) ?? null;
}

export function createEmptyBasicsLearningRecord(): BasicsLearningRecord {
  return {
    isUnderstood: false,
    needsReview: false,
    note: "",
    practiceCount: 0,
    updatedAt: null,
  };
}

export function createBasicsLearningRecords(): BasicsLearningRecordMap {
  return Object.fromEntries(
    basicsLearningItemIds.map((itemId) => [
      itemId,
      createEmptyBasicsLearningRecord(),
    ]),
  );
}

export function deserializeBasicsLearningRecords(
  serialized: string | null,
): BasicsLearningRecordMap {
  const records: Record<string, BasicsLearningRecord> = {
    ...createBasicsLearningRecords(),
  };

  if (serialized === null) {
    return records;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch {
    return records;
  }

  if (!isObject(parsed) || parsed.version !== 1) {
    return records;
  }

  const parsedRecords = parsed.records;

  if (!isObject(parsedRecords)) {
    return records;
  }

  for (const itemId of basicsLearningItemIds) {
    const normalized = normalizeBasicsLearningRecord(parsedRecords[itemId]);

    if (normalized !== null) {
      records[itemId] = normalized;
    }
  }

  return records;
}

export function loadBasicsLearningRecords(
  storage: BasicsLearningRecordStorage,
): BasicsLearningRecordLoadResult {
  try {
    return {
      records: deserializeBasicsLearningRecords(
        storage.getItem(BASICS_LEARNING_RECORD_STORAGE_KEY),
      ),
      error: null,
    };
  } catch {
    return {
      records: createBasicsLearningRecords(),
      error:
        "ブラウザの保存機能を利用できないため、基礎教材の学習記録を読み込めませんでした。この画面を開いている間は操作を続けられます。",
    };
  }
}

function sanitizeBasicsLearningRecords(
  records: BasicsLearningRecordMap,
): BasicsLearningRecordMap {
  const sanitized: Record<string, BasicsLearningRecord> = {};

  for (const itemId of basicsLearningItemIds) {
    sanitized[itemId] =
      normalizeBasicsLearningRecord(records[itemId]) ??
      createEmptyBasicsLearningRecord();
  }

  return sanitized;
}

export function saveBasicsLearningRecords(
  storage: BasicsLearningRecordStorage,
  records: BasicsLearningRecordMap,
): string | null {
  const payload: BasicsLearningRecordPayload = {
    version: 1,
    records: sanitizeBasicsLearningRecords(records),
  };

  try {
    storage.setItem(
      BASICS_LEARNING_RECORD_STORAGE_KEY,
      JSON.stringify(payload),
    );
    return null;
  } catch {
    return "ブラウザの保存機能を利用できないため、基礎教材の学習記録を保存できませんでした。この画面を開いている間は操作を続けられます。";
  }
}

export function updateBasicsLearningRecord(
  records: BasicsLearningRecordMap,
  itemId: string,
  update: BasicsLearningRecordUpdate,
): BasicsLearningRecordMap {
  if (!isBasicsLearningItemId(itemId)) {
    return records;
  }

  if (
    (update.isUnderstood !== undefined &&
      typeof update.isUnderstood !== "boolean") ||
    (update.needsReview !== undefined &&
      typeof update.needsReview !== "boolean") ||
    (update.note !== undefined &&
      (typeof update.note !== "string" ||
        update.note.length > MAX_BASICS_LEARNING_NOTE_LENGTH))
  ) {
    return records;
  }

  const current =
    records[itemId] ?? createEmptyBasicsLearningRecord();

  return {
    ...records,
    [itemId]: {
      isUnderstood: update.isUnderstood ?? current.isUnderstood,
      needsReview: update.needsReview ?? current.needsReview,
      note: update.note ?? current.note,
      practiceCount: current.practiceCount,
      updatedAt: current.updatedAt,
    },
  };
}

export function recordBasicsLearningPractice(
  records: BasicsLearningRecordMap,
  itemId: string,
  updatedAt = new Date().toISOString(),
): BasicsLearningRecordMap {
  if (!isBasicsLearningItemId(itemId) || !isValidUpdatedAt(updatedAt)) {
    return records;
  }

  const current =
    records[itemId] ?? createEmptyBasicsLearningRecord();

  return {
    ...records,
    [itemId]: {
      ...current,
      practiceCount: current.practiceCount + 1,
      updatedAt,
    },
  };
}

export function applyBasicsQuizResultToLearningRecords(
  records: BasicsLearningRecordMap,
  questionId: string,
  isCorrect: boolean,
): BasicsLearningRecordMap {
  if (isCorrect) {
    return records;
  }

  const itemId = getBasicsQuizLearningItemId(questionId);
  const item = getBasicsLearningItem(itemId);

  if (item?.kind !== "quiz") {
    return records;
  }

  return updateBasicsLearningRecord(records, itemId, {
    needsReview: true,
  });
}

export function hasBasicsLearningActivity(
  record: BasicsLearningRecord,
): boolean {
  return (
    record.isUnderstood ||
    record.needsReview ||
    record.note.trim().length > 0 ||
    record.practiceCount > 0
  );
}

export function getUnderstoodBasicsLessonIds(
  records: BasicsLearningRecordMap,
): readonly AvailableBasicsLessonId[] {
  return availableBasicsLessons
    .filter(
      (lesson) =>
        records[getBasicsLessonLearningItemId(lesson.id)]?.isUnderstood,
    )
    .map((lesson) => lesson.id);
}
