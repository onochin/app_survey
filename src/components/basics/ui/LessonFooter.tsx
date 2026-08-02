import CheckIcon from "./CheckIcon";

interface LessonFooterProps {
  readonly isLastLesson: boolean;
  readonly onCompleteLesson: () => void;
}

function LessonFooter({
  isLastLesson,
  onCompleteLesson,
}: LessonFooterProps) {
  return (
    <footer className="basics-lesson-footer">
      <div>
        <span className="basics-footer-check">
          <CheckIcon />
        </span>
        <p>
          <strong>ここまで理解できましたか？</strong>
          操作をもう一度試してから次へ進んでも大丈夫です。
        </p>
      </div>
      <button onClick={onCompleteLesson} type="button">
        {isLastLesson
          ? "理解した・最初から見直す"
          : "理解した・次の章へ"}
        <span aria-hidden="true">→</span>
      </button>
    </footer>
  );
}

export default LessonFooter;
