import type { CalculationStep } from "../../types/traverse";

interface CalculationDetailProps {
  readonly step: CalculationStep;
  readonly isLastStep: boolean;
  readonly hasInputError: boolean;
  readonly hasGeometryError: boolean;
  readonly onNext: () => void;
}

function CalculationDetail({
  step,
  isLastStep,
  hasInputError,
  hasGeometryError,
  onNext,
}: CalculationDetailProps) {
  const isBlocked = hasInputError || hasGeometryError;

  return (
    <section className="calculation-detail card" aria-live="polite">
      <div className="detail-heading">
        <span>STEP {step.order}</span>
        <h2>{step.title}</h2>
      </div>
      <p className="detail-description">{step.description}</p>

      <dl className="formula-list">
        <div>
          <dt>使用する式</dt>
          <dd>{step.formula}</dd>
        </div>
        {step.substitution === undefined ? null : (
          <div>
            <dt>代入した数値</dt>
            <dd>{step.substitution}</dd>
          </div>
        )}
        {step.result === undefined ? null : (
          <div className="formula-result">
            <dt>計算結果</dt>
            <dd>{step.result}</dd>
          </div>
        )}
      </dl>

      <div className="learning-note why-note">
        <strong>なぜ必要？</strong>
        <p>{step.reason}</p>
      </div>
      <div className="learning-note mistake-note">
        <strong>よくある間違い</strong>
        <p>{step.commonMistake}</p>
      </div>

      <button
        className="next-step-button"
        disabled={isLastStep || isBlocked}
        onClick={onNext}
        type="button"
      >
        {isLastStep
          ? "全8ステップ完了"
          : hasGeometryError
            ? "辺の交差を解消してください"
          : hasInputError
            ? "入力値を修正してください"
            : `次へ：ステップ${step.order + 1}`}
      </button>
    </section>
  );
}

export default CalculationDetail;
