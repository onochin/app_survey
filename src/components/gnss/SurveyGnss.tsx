import { useState } from "react";
import GnssOverviewLesson from "./lessons/GnssOverviewLesson";

function SurveyGnss() {
  const [isOverviewUnderstood, setIsOverviewUnderstood] = useState(false);

  return (
    <div className="gnss-page">
      <GnssOverviewLesson
        isUnderstood={isOverviewUnderstood}
        onToggleUnderstood={() =>
          setIsOverviewUnderstood((current) => !current)
        }
      />

      <p className="gnss-course-note">
        本章の数値と図は学習用の仮想例です。GNSS教材の操作状態と問題回答はこの画面を開いている間だけ保持し、localStorageへ保存しません。
      </p>
    </div>
  );
}

export default SurveyGnss;
