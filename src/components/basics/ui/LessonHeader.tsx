import type { BasicsLessonMetadata } from "../types";

interface LessonHeaderProps {
  readonly lesson: BasicsLessonMetadata;
}

function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <header className="basics-lesson-header">
      <div className="basics-lesson-heading">
        <span>LESSON {lesson.number}</span>
        <h2 id="active-lesson-title">{lesson.title}</h2>
        <p>{lesson.description}</p>
        {lesson.learningGoal ? (
          <div className="basics-learning-goal">
            <span>到達目標</span>
            <strong>{lesson.learningGoal}</strong>
          </div>
        ) : null}
      </div>
      <div className="basics-lesson-metadata">
        <div className="basics-concept-tags" aria-label="この章で学ぶ用語">
          {lesson.terms.map((term) => (
            <span key={term}>{term}</span>
          ))}
        </div>
        {lesson.cautions.length > 0 ? (
          <ul className="basics-lesson-cautions" aria-label="現場での注意">
            {lesson.cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  );
}

export default LessonHeader;
