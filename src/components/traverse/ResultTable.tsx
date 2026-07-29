import type { TraverseCalculationResult } from "../../calculations/traverse";

interface ResultTableProps {
  readonly calculation: TraverseCalculationResult | null;
  readonly currentStepIndex: number;
}

function fixed(value: number): string {
  const normalized = Math.abs(value) < 0.0005 ? 0 : value;
  return normalized.toFixed(3);
}

function ResultTable({
  calculation,
  currentStepIndex,
}: ResultTableProps) {
  const showClosure = calculation !== null && currentStepIndex >= 5;
  const showCoordinates = calculation !== null && currentStepIndex >= 7;

  return (
    <section className="result-card card" aria-labelledby="result-title">
      <div className="section-title-row">
        <div>
          <p className="card-kicker">CALCULATION RESULT</p>
          <h2 id="result-title">計算結果</h2>
        </div>
        <span className="result-state">
          {showCoordinates ? "計算済み" : "進行中"}
        </span>
      </div>

      {showClosure && calculation !== null ? (
        <dl className="closure-values">
          <div>
            <dt>fx</dt>
            <dd>{fixed(calculation.closure.fx)} m</dd>
          </div>
          <div>
            <dt>fy</dt>
            <dd>{fixed(calculation.closure.fy)} m</dd>
          </div>
          <div>
            <dt>合成閉合差 f</dt>
            <dd>{fixed(calculation.closure.linearClosure)} m</dd>
          </div>
          <div>
            <dt>閉合比</dt>
            <dd>
              {calculation.closure.closureRatio === null
                ? "完全閉合に近い"
                : `1 / ${Math.round(
                    calculation.closure.closureRatio,
                  ).toLocaleString("ja-JP")}`}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="result-placeholder">
          閉合差はステップ6で表示します。
        </p>
      )}

      {showCoordinates && calculation !== null ? (
        <div className="result-table-wrap">
          <table className="result-table">
            <thead>
              <tr>
                <th>点名</th>
                <th>X (m)</th>
                <th>Y (m)</th>
              </tr>
            </thead>
            <tbody>
              {calculation.adjustedCoordinates
                .slice(0, calculation.observation.points.length)
                .map((coordinate) => {
                  const point = calculation.observation.points.find(
                    (candidate) =>
                      candidate.id === coordinate.pointId,
                  );

                  return (
                    <tr key={coordinate.pointId}>
                      <th scope="row">{point?.name ?? coordinate.pointId}</th>
                      <td>{fixed(coordinate.x)}</td>
                      <td>{fixed(coordinate.y)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <p className="coordinate-note">
            Aの既知座標から補正後成分を加算した値です。
          </p>
        </div>
      ) : (
        <p className="result-placeholder">
          新点座標はステップ8で表示します。
        </p>
      )}
    </section>
  );
}

export default ResultTable;
