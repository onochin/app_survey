import type { TraverseCalculationResult } from "../../calculations/traverse";
import { formatAngleDms } from "../../utils/formatAngle";

interface CalculationBookProps {
  readonly calculation: TraverseCalculationResult | null;
  readonly currentStepIndex: number;
}

function valueOrPending(
  revealed: boolean,
  value: number,
  digits = 3,
): string {
  return revealed ? value.toFixed(digits) : "—";
}

function CalculationBook({
  calculation,
  currentStepIndex,
}: CalculationBookProps) {
  if (calculation === null) {
    return (
      <div className="workbook-empty" role="status">
        観測手簿の入力エラーを修正すると、計算簿を確認できます。
      </div>
    );
  }

  const showAzimuth = currentStepIndex >= 3;
  const showIncrements = currentStepIndex >= 4;
  const showCorrections = currentStepIndex >= 6;

  return (
    <div className="table-scroll">
      <table className="calculation-book">
        <thead>
          <tr>
            <th>辺</th>
            <th>S (m)</th>
            <th>方位角</th>
            <th>ΔX</th>
            <th>ΔY</th>
            <th>cX</th>
            <th>cY</th>
            <th>ΔX'</th>
            <th>ΔY'</th>
          </tr>
        </thead>
        <tbody>
          {calculation.increments.map((increment, index) => {
            const adjusted = calculation.adjustedIncrements[index]!;
            const from = calculation.observation.points[index]!;
            const to =
              calculation.observation.points[
                (index + 1) %
                  calculation.observation.points.length
              ]!;

            return (
              <tr key={increment.legId}>
                <th scope="row">
                  {from.name}→{to.name}
                </th>
                <td>{increment.distance.toFixed(3)}</td>
                <td>
                  {showAzimuth
                    ? formatAngleDms(increment.azimuthDegrees, 1)
                    : "—"}
                </td>
                <td>
                  {valueOrPending(
                    showIncrements,
                    increment.deltaX,
                  )}
                </td>
                <td>
                  {valueOrPending(
                    showIncrements,
                    increment.deltaY,
                  )}
                </td>
                <td>
                  {valueOrPending(
                    showCorrections,
                    adjusted.correctionX,
                    4,
                  )}
                </td>
                <td>
                  {valueOrPending(
                    showCorrections,
                    adjusted.correctionY,
                    4,
                  )}
                </td>
                <td>
                  {valueOrPending(
                    showCorrections,
                    adjusted.adjustedDeltaX,
                  )}
                </td>
                <td>
                  {valueOrPending(
                    showCorrections,
                    adjusted.adjustedDeltaY,
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="calculation-book-note">
        Xは北方向、Yは東方向。未到達のステップは「—」で表示します。
      </p>
    </div>
  );
}

export default CalculationBook;
