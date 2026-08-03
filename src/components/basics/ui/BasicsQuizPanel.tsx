import {
  evaluateBasicsQuizAnswer,
  type BasicsQuizQuestion,
} from "../data/quizData";

export interface BasicsQuizAnswerState {
  readonly selectedOptionId: string | null;
  readonly isAnswered: boolean;
  readonly isCorrect: boolean | null;
  readonly isExplanationVisible: boolean;
}

export type BasicsQuizAnswerStateMap = Readonly<
  Partial<Record<string, BasicsQuizAnswerState>>
>;

interface BasicsQuizPanelProps {
  readonly lessonId: string;
  readonly questions: readonly BasicsQuizQuestion[];
  readonly answerStates: BasicsQuizAnswerStateMap;
  readonly onSelectOption: (questionId: string, optionId: string) => void;
  readonly onSubmitAnswer: (questionId: string) => void;
}

function BasicsQuizPanel({
  lessonId,
  questions,
  answerStates,
  onSelectOption,
  onSubmitAnswer,
}: BasicsQuizPanelProps) {
  const answeredCount = questions.filter(
    (question) => answerStates[question.id]?.isAnswered,
  ).length;
  const headingId = `basics-quiz-heading-${lessonId}`;

  return (
    <section
      aria-labelledby={headingId}
      className="basics-quiz-panel"
      data-lesson-id={lessonId}
      data-testid="basics-quiz-panel"
    >
      <header className="basics-quiz-heading">
        <div>
          <span>KNOWLEDGE CHECK</span>
          <h3 id={headingId}>この章の確認問題</h3>
          <p>
            教材の図・操作・固定例を思い出し、理由まで確認しましょう。
          </p>
        </div>
        <strong>
          {answeredCount} / {questions.length} 問回答
        </strong>
      </header>

      <div className="basics-quiz-question-list">
        {questions.map((question, questionIndex) => {
          const answerState = answerStates[question.id];
          const evaluation =
            answerState?.isAnswered && answerState.selectedOptionId
              ? evaluateBasicsQuizAnswer(
                  question.id,
                  answerState.selectedOptionId,
                )
              : null;
          const feedbackIsVisible =
            answerState?.isAnswered &&
            answerState.isExplanationVisible &&
            evaluation !== null;

          return (
            <article
              className="basics-quiz-question"
              data-question-type={question.questionType}
              data-testid={`basics-quiz-question-${question.id}`}
              id={`basics-quiz-card-${question.id}`}
              key={question.id}
            >
              <div className="basics-quiz-question-meta">
                <span>問 {questionIndex + 1}</span>
                <strong>{question.questionType}</strong>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmitAnswer(question.id);
                }}
              >
                <fieldset>
                  <legend>{question.prompt}</legend>
                  <div className="basics-quiz-options">
                    {question.options.map((option) => {
                      const isSelected =
                        answerState?.selectedOptionId === option.id;
                      const isCorrectOption =
                        feedbackIsVisible &&
                        option.id === question.correctOptionId;
                      const isSelectedIncorrectOption =
                        feedbackIsVisible &&
                        isSelected &&
                        option.id !== question.correctOptionId;
                      const inputId = `basics-quiz-option-${question.id}-${option.id}`;

                      return (
                        <label
                          className={[
                            isSelected ? "is-selected" : "",
                            isCorrectOption ? "is-correct-answer" : "",
                            isSelectedIncorrectOption
                              ? "is-incorrect-answer"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          htmlFor={inputId}
                          key={option.id}
                        >
                          <input
                            checked={isSelected}
                            id={inputId}
                            name={`basics-quiz-answer-${question.id}`}
                            onChange={() =>
                              onSelectOption(question.id, option.id)
                            }
                            type="radio"
                            value={option.id}
                          />
                          <span>{option.label}</span>
                          {isCorrectOption ? (
                            <small>正答</small>
                          ) : isSelectedIncorrectOption ? (
                            <small>選択した回答</small>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <button
                  className="basics-quiz-submit"
                  disabled={!answerState?.selectedOptionId}
                  type="submit"
                >
                  回答を確認する
                </button>
              </form>

              {feedbackIsVisible && evaluation ? (
                <div
                  className={`basics-quiz-feedback ${
                    answerState.isCorrect ? "is-correct" : "is-incorrect"
                  }`}
                  data-testid={`basics-quiz-feedback-${question.id}`}
                  role="status"
                >
                  <strong>
                    {answerState.isCorrect ? "正解です" : "不正解です"}
                  </strong>

                  <dl className="basics-quiz-answer-summary">
                    <div>
                      <dt>選択した回答</dt>
                      <dd>{evaluation.selectedOptionLabel}</dd>
                    </div>
                    <div>
                      <dt>正答</dt>
                      <dd>{evaluation.correctOptionLabel}</dd>
                    </div>
                  </dl>

                  {!answerState.isCorrect ? (
                    <section className="basics-quiz-reason is-incorrect-reason">
                      <h4>選択した誤答が誤りである理由</h4>
                      <p>{evaluation.selectedAnswerReason}</p>
                    </section>
                  ) : null}

                  <section className="basics-quiz-reason is-correct-reason">
                    <h4>正答理由</h4>
                    <p>{evaluation.correctReason}</p>
                  </section>

                  <section className="basics-quiz-field-check">
                    <h4>現場での確認事項</h4>
                    <p>{evaluation.fieldCheck}</p>
                  </section>
                </div>
              ) : (
                <p className="basics-quiz-before-answer">
                  回答を選んで「回答を確認する」を押すまで、正答と理由は表示されません。
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default BasicsQuizPanel;
