import { useState } from "react";
import { gnssLessons } from "./gnssCourse";
import GnssOverviewLesson from "./lessons/GnssOverviewLesson";
import GnssObservationsLesson from "./lessons/GnssObservationsLesson";
import type { GnssLessonId } from "./types";

function SurveyGnss() {
  const [activeLessonId, setActiveLessonId] =
    useState<GnssLessonId>("gnss-overview");
  const [understoodLessonIds, setUnderstoodLessonIds] = useState<
    readonly GnssLessonId[]
  >([]);

  const toggleUnderstood = (lessonId: GnssLessonId): void => {
    setUnderstoodLessonIds((current) =>
      current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId],
    );
  };

  const completedLessonCount = understoodLessonIds.length;
  const totalLessonCount = gnssLessons.length;

  return (
    <div className="gnss-page">
      <nav aria-label="GNSS教材の章" className="gnss-lesson-navigation">
        <ol>
          {gnssLessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                aria-current={lesson.id === activeLessonId ? "page" : undefined}
                className={lesson.id === activeLessonId ? "is-selected" : ""}
                data-lesson-navigation-id={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                type="button"
              >
                <span>第{lesson.number}章</span>
                <strong>{lesson.title}</strong>
                <small>
                  {understoodLessonIds.includes(lesson.id)
                    ? "理解済み"
                    : "学習する"}
                </small>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div
        className="gnss-lesson-panel"
        hidden={activeLessonId !== "gnss-overview"}
      >
        <GnssOverviewLesson
          completedLessonCount={completedLessonCount}
          isUnderstood={understoodLessonIds.includes("gnss-overview")}
          onToggleUnderstood={() => toggleUnderstood("gnss-overview")}
          totalLessonCount={totalLessonCount}
        />
      </div>

      <div
        className="gnss-lesson-panel"
        hidden={activeLessonId !== "gnss-observations"}
      >
        <GnssObservationsLesson
          completedLessonCount={completedLessonCount}
          isUnderstood={understoodLessonIds.includes("gnss-observations")}
          onToggleUnderstood={() => toggleUnderstood("gnss-observations")}
          totalLessonCount={totalLessonCount}
        />
      </div>

      <p className="gnss-course-note">
        本教材の数値と図は学習用の仮想例です。GNSS教材の操作状態と問題回答はこの画面を開いている間だけ保持し、localStorageへ保存しません。
      </p>
    </div>
  );
}

export default SurveyGnss;
