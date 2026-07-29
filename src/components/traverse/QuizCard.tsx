export const QUIZ_CORRECT_ANSWER = "all";

export type QuizAnswerId =
  | "leveling"
  | "angle-reading"
  | "distance-entry"
  | typeof QUIZ_CORRECT_ANSWER;

interface QuizCardProps {
  readonly selectedAnswer: QuizAnswerId | null;
  readonly isSubmitted: boolean;
  readonly onSelectAnswer: (answer: QuizAnswerId) => void;
  readonly onSubmit: () => void;
}

const options = [
  { id: "leveling", label: "器械の整準不良" },
  { id: "angle-reading", label: "観測角の読み違い" },
  { id: "distance-entry", label: "距離の入力間違い" },
  { id: QUIZ_CORRECT_ANSWER, label: "上記すべて" },
] as const satisfies readonly {
  readonly id: QuizAnswerId;
  readonly label: string;
}[];

function QuizCard({
  selectedAnswer,
  isSubmitted,
  onSelectAnswer,
  onSubmit,
}: QuizCardProps) {
  const isCorrect =
    isSubmitted && selectedAnswer === QUIZ_CORRECT_ANSWER;

  return (
    <section className="quiz-card" aria-labelledby="quiz-title">
      <div className="quiz-heading">
        <div>
          <p className="card-kicker">KNOWLEDGE CHECK</p>
          <h2 id="quiz-title">確認問題</h2>
        </div>
        <span>全1問</span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <fieldset>
          <legend>
            閉合差が大きくなる原因として考えられるものはどれですか。
          </legend>
          <div className="quiz-options">
            {options.map((option) => (
              <label
                className={
                  selectedAnswer === option.id ? "is-selected" : ""
                }
                key={option.id}
              >
                <input
                  checked={selectedAnswer === option.id}
                  name="closure-cause"
                  onChange={() => onSelectAnswer(option.id)}
                  type="radio"
                  value={option.id}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          className="quiz-submit-button"
          disabled={selectedAnswer === null}
          type="submit"
        >
          回答を確認する
        </button>
      </form>

      {isSubmitted ? (
        <div
          className={`quiz-feedback ${
            isCorrect ? "is-correct" : "is-incorrect"
          }`}
          role="status"
        >
          <strong>{isCorrect ? "正解です" : "もう一度考えてみましょう"}</strong>
          <p>
            {isCorrect
              ? "整準不良は角度観測へ影響し、角度の読み違いや距離の入力間違いも座標成分のずれにつながるため、すべて閉合差を大きくする原因になります。"
              : "選んだ項目も原因の一つですが、器械の整準、角度観測、距離入力のいずれの誤りも閉合差へ影響します。"}
          </p>
        </div>
      ) : (
        <p className="quiz-hint">
          ヒント：閉合差には角度と距離の両方の誤差が現れます。
        </p>
      )}
    </section>
  );
}

export default QuizCard;
