import type { AngleAdjustmentResult } from "../../types/traverse";
import type { TraverseDisplaySample } from "../../data/traverseSample";
import type {
  ObservationDrafts,
  ObservationInputValidation,
} from "../../utils/observationInput";
import { formatAngleDms } from "../../utils/formatAngle";

interface ObservationTableProps {
  readonly observedSample: TraverseDisplaySample;
  readonly theoreticalGeometry: TraverseDisplaySample;
  readonly drafts: ObservationDrafts;
  readonly validation: ObservationInputValidation;
  readonly selectedPointId: string | null;
  readonly currentStepIndex: number;
  readonly angleAdjustment: AngleAdjustmentResult | null;
  readonly azimuthsDegrees: readonly number[] | null;
  readonly onInitialAzimuthChange: (value: string) => void;
  readonly onAngleChange: (pointId: string, value: string) => void;
  readonly onDistanceChange: (legId: string, value: string) => void;
  readonly onSelectPoint: (pointId: string) => void;
}

function parseFinite(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function ObservationTable({
  observedSample,
  theoreticalGeometry,
  drafts,
  validation,
  selectedPointId,
  currentStepIndex,
  angleAdjustment,
  azimuthsDegrees,
  onInitialAzimuthChange,
  onAngleChange,
  onDistanceChange,
  onSelectPoint,
}: ObservationTableProps) {
  const initialAzimuth = parseFinite(drafts.initialAzimuth);

  return (
    <div className="observation-editor">
      <div className="initial-azimuth-field">
        <label htmlFor="initial-azimuth">
          初期方位角 <strong>A → P1</strong>
        </label>
        <div>
          <input
            aria-describedby={
              validation.initialAzimuthError === null
                ? "initial-azimuth-format"
                : "initial-azimuth-error"
            }
            aria-invalid={validation.initialAzimuthError !== null}
            id="initial-azimuth"
            inputMode="decimal"
            max="359.999999"
            min="0"
            onChange={(event) =>
              onInitialAzimuthChange(event.target.value)
            }
            step="any"
            type="number"
            value={drafts.initialAzimuth}
          />
          <span id="initial-azimuth-format">
            {initialAzimuth === null ||
            initialAzimuth < 0 ||
            initialAzimuth >= 360
              ? "十進度で入力"
              : formatAngleDms(initialAzimuth, 1)}
          </span>
        </div>
        {validation.initialAzimuthError === null ? null : (
          <p className="field-error" id="initial-azimuth-error">
            {validation.initialAzimuthError}
          </p>
        )}
      </div>

      <div className="table-scroll">
        <table className="observation-table">
          <thead>
            <tr>
              <th>測点</th>
              <th>観測角（十進度）</th>
              <th>距離（m）</th>
              <th>補正角</th>
              <th>方位角</th>
              <th>備考</th>
            </tr>
          </thead>
          <tbody>
            {observedSample.points.map((point, index) => {
              const leg = observedSample.legs[index]!;
              const theoreticalAngle =
                theoreticalGeometry.angles[index]!;
              const theoreticalLeg = theoreticalGeometry.legs[index]!;
              const angleValue =
                drafts.anglesByPointId[point.id] ?? "";
              const distanceValue =
                drafts.distancesByLegId[leg.id] ?? "";
              const parsedAngle = parseFinite(angleValue);
              const angleError =
                validation.angleErrorsByPointId[point.id];
              const distanceError =
                validation.distanceErrorsByLegId[leg.id];
              const correction =
                angleAdjustment?.correctionsDegrees[index];
              const adjustedAngle =
                angleAdjustment?.adjustedAnglesDegrees[index];
              const azimuth = azimuthsDegrees?.[index];

              return (
                <tr
                  className={
                    selectedPointId === point.id ? "is-selected" : ""
                  }
                  key={point.id}
                >
                  <th scope="row">
                    <button
                      aria-pressed={selectedPointId === point.id}
                      onClick={() => onSelectPoint(point.id)}
                      type="button"
                    >
                      {point.name}
                    </button>
                    <small>
                      {point.name}→
                      {observedSample.points[
                        (index + 1) % observedSample.points.length
                      ]!.name}
                    </small>
                  </th>
                  <td>
                    <input
                      aria-label={`${point.name}の観測内角（十進度）`}
                      aria-invalid={angleError !== undefined}
                      inputMode="decimal"
                      max="359.999999"
                      min="0.000001"
                      onChange={(event) =>
                        onAngleChange(point.id, event.target.value)
                      }
                      onFocus={() => onSelectPoint(point.id)}
                      step="any"
                      type="number"
                      value={angleValue}
                    />
                    <small>
                      観測:{" "}
                      {parsedAngle === null ||
                      parsedAngle <= 0 ||
                      parsedAngle >= 360
                        ? "—"
                        : formatAngleDms(parsedAngle, 1)}
                    </small>
                    <small>
                      理論:{" "}
                      {formatAngleDms(
                        theoreticalAngle.angleDegrees,
                        1,
                      )}
                    </small>
                    {angleError === undefined ? null : (
                      <span className="field-error">{angleError}</span>
                    )}
                  </td>
                  <td>
                    <input
                      aria-label={`${leg.fromPointId}から${leg.toPointId}の観測距離`}
                      aria-invalid={distanceError !== undefined}
                      inputMode="decimal"
                      min="0.001"
                      onChange={(event) =>
                        onDistanceChange(leg.id, event.target.value)
                      }
                      onFocus={() => onSelectPoint(point.id)}
                      step="any"
                      type="number"
                      value={distanceValue}
                    />
                    <small>理論: {theoreticalLeg.distance.toFixed(3)}</small>
                    {distanceError === undefined ? null : (
                      <span className="field-error">
                        {distanceError}
                      </span>
                    )}
                  </td>
                  <td className="numeric-cell">
                    {currentStepIndex >= 2 &&
                    correction !== undefined &&
                    adjustedAngle !== undefined ? (
                      <>
                        <strong>{formatAngleDms(adjustedAngle, 1)}</strong>
                        <small>
                          補正量 {formatAngleDms(correction, 1)}
                        </small>
                      </>
                    ) : (
                      <span className="pending-value">ステップ3で表示</span>
                    )}
                  </td>
                  <td className="numeric-cell">
                    {currentStepIndex >= 3 &&
                    azimuth !== undefined ? (
                      <strong>{formatAngleDms(azimuth, 1)}</strong>
                    ) : (
                      <span className="pending-value">ステップ4で表示</span>
                    )}
                  </td>
                  <td>
                    <span className="point-note">
                      {point.id === observedSample.points[0]!.id
                        ? "既知点・固定"
                        : point.isFixed
                          ? "新点・固定"
                          : "ドラッグ可"}
                    </span>
                    <small>
                      観測値と図上理論値は別管理
                    </small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ObservationTable;
