import type { ComponentType } from "react";

export interface BasicsLessonComponentProps {
  readonly onOpenTraverse: () => void;
}

export interface BasicsLessonMetadata {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly learningGoal: string | null;
  readonly terms: readonly string[];
  readonly cautions: readonly string[];
  readonly nextLessonId: string | null;
}

export interface AvailableBasicsLessonDefinition
  extends BasicsLessonMetadata {
  readonly status: "available";
  readonly component: ComponentType<BasicsLessonComponentProps>;
}

export interface ComingSoonBasicsLessonDefinition
  extends BasicsLessonMetadata {
  readonly status: "coming-soon";
}

export type BasicsLessonDefinition =
  | AvailableBasicsLessonDefinition
  | ComingSoonBasicsLessonDefinition;
