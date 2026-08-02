import type { CalculationStep } from "../../types/traverse";

interface CalculationStepsProps {
  readonly steps: readonly CalculationStep[];
  readonly focusedStepId: string;
}

function CalculationSteps({
  steps,
  focusedStepId,
}: CalculationStepsProps) {
  return (
    <section className="steps-card card" aria-labelledby="steps-title">
      <div className="section-title-row">
        <div>
          <p className="card-kicker">LEARNING FLOW</p>
          <h2 id="steps-title">計算ステップ</h2>
        </div>
        <span className="interactive-badge">操作中</span>
      </div>

      <ol className="calculation-steps">
        {steps.map((step) => {
          return (
            <li
              aria-current={
                step.id === focusedStepId ? "step" : undefined
              }
              className={`is-${step.status}${
                step.id === focusedStepId ? " is-focused" : ""
              }`}
              key={step.id}
            >
              <span className="step-marker" aria-hidden="true">
                {step.status === "completed" ? "✓" : step.order}
              </span>
              <span className="step-copy">
                <span className="step-title">{step.title}</span>
                <span className="step-state">
                  {step.id === focusedStepId &&
                  step.status === "completed"
                    ? "復習中"
                    : step.status === "completed"
                    ? "確認済み"
                    : step.status === "current"
                      ? "現在のステップ"
                      : "未計算"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default CalculationSteps;
