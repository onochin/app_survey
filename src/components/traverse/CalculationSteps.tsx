const calculationSteps = [
  "観測角",
  "角度閉合差",
  "角度補正",
  "方位角",
  "緯距・経距",
  "座標閉合差",
  "座標補正",
  "新点座標",
] as const;

function CalculationSteps() {
  return (
    <section className="steps-card card" aria-labelledby="steps-title">
      <div className="section-title-row">
        <div>
          <p className="card-kicker">LEARNING FLOW</p>
          <h2 id="steps-title">計算ステップ</h2>
        </div>
        <span className="static-badge">静的表示</span>
      </div>

      <ol className="calculation-steps">
        {calculationSteps.map((step, index) => {
          const isCurrent = index === 0;

          return (
            <li className={isCurrent ? "is-current" : ""} key={step}>
              <span className="step-marker" aria-hidden="true">
                {isCurrent ? "✓" : index + 1}
              </span>
              <span className="step-copy">
                <span className="step-title">{step}</span>
                <span className="step-state">
                  {isCurrent ? "図で確認中" : "Phase 3で実装"}
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
