export interface LearningRecord {
  readonly isUnderstood: boolean;
  readonly needsReview: boolean;
  readonly note: string;
  readonly practiceCount: number;
  readonly updatedAt: string | null;
}

export type LearningRecordMap = Readonly<
  Record<string, LearningRecord>
>;

export interface LearningRecordUpdate {
  readonly isUnderstood?: boolean;
  readonly needsReview?: boolean;
  readonly note?: string;
}
