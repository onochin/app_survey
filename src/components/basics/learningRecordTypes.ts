import type { AvailableBasicsLessonId } from "./basicsCourse";

export type BasicsLearningItemKind = "lesson" | "quiz";

export type BasicsLearningItemId =
  | `lesson:${AvailableBasicsLessonId}`
  | `quiz:${string}`;

export interface BasicsLearningRecord {
  readonly isUnderstood: boolean;
  readonly needsReview: boolean;
  readonly note: string;
  readonly practiceCount: number;
  readonly updatedAt: string | null;
}

export type BasicsLearningRecordMap = Readonly<
  Record<string, BasicsLearningRecord>
>;

export interface BasicsLearningRecordUpdate {
  readonly isUnderstood?: boolean;
  readonly needsReview?: boolean;
  readonly note?: string;
}

export interface BasicsLearningItem {
  readonly id: BasicsLearningItemId;
  readonly kind: BasicsLearningItemKind;
  readonly lessonId: AvailableBasicsLessonId;
  readonly lessonNumber: string;
  readonly lessonTitle: string;
  readonly title: string;
  readonly questionId: string | null;
  readonly targetDomId: string;
}
