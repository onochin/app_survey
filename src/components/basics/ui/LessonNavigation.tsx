import type {
  AvailableBasicsLessonId,
  BasicsLesson,
} from "../basicsCourse";
import CheckIcon from "./CheckIcon";

interface LessonNavigationProps {
  readonly activeLessonId: AvailableBasicsLessonId;
  readonly completedLessonIds: readonly AvailableBasicsLessonId[];
  readonly lessons: readonly BasicsLesson[];
  readonly onSelectLesson: (lessonId: AvailableBasicsLessonId) => void;
}

function LessonNavigation({
  activeLessonId,
  completedLessonIds,
  lessons,
  onSelectLesson,
}: LessonNavigationProps) {
  return (
    <nav className="basics-lesson-navigation" aria-label="基礎教材の章">
      {lessons.map((lesson) => {
        const isAvailable = lesson.status === "available";
        const isCompleted =
          isAvailable && completedLessonIds.includes(lesson.id);
        const isActive = activeLessonId === lesson.id;

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            className={`${isActive ? "is-active" : ""} ${
              isCompleted ? "is-completed" : ""
            } ${isAvailable ? "" : "is-coming-soon"}`}
            disabled={!isAvailable}
            key={lesson.id}
            onClick={
              isAvailable
                ? () => onSelectLesson(lesson.id)
                : undefined
            }
            type="button"
          >
            <span className="basics-lesson-number">
              {isCompleted ? <CheckIcon /> : lesson.number}
            </span>
            <span className="basics-lesson-nav-copy">
              <strong>{lesson.title}</strong>
              <small>
                {isAvailable ? lesson.terms.join("・") : "準備中"}
              </small>
            </span>
            <span className="basics-lesson-arrow" aria-hidden="true">
              {isAvailable ? "→" : "…"}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default LessonNavigation;
