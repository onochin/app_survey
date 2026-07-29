import type { TraverseDisplaySample } from "../../data/traverseSample";
import type { SurveyCoordinate, SurveyPoint } from "../../types/traverse";
import { formatAngleDms } from "../../utils/formatAngle";
import TraverseSvg from "./TraverseSvg";

interface TraverseSimulatorProps {
  readonly geometry: TraverseDisplaySample;
  readonly referencePoints: readonly SurveyPoint[];
  readonly observedSample: TraverseDisplaySample | null;
  readonly selectedPointId: string | null;
  readonly onSelectPoint: (pointId: string) => void;
  readonly onMovePoint: (
    pointId: string,
    coordinate: SurveyCoordinate,
  ) => void;
  readonly onInteractionError: (message: string) => void;
  readonly onOpenObservationBook: () => void;
  readonly onReset: () => void;
}

function TraverseSimulator({
  geometry,
  referencePoints,
  observedSample,
  selectedPointId,
  onSelectPoint,
  onMovePoint,
  onInteractionError,
  onOpenObservationBook,
  onReset,
}: TraverseSimulatorProps) {
  const selectedPoint = geometry.points.find(
    (point) => point.id === selectedPointId,
  );
  const theoreticalAngle = geometry.angles.find(
    (angle) => angle.pointId === selectedPointId,
  );
  const observedAngle = observedSample?.angles.find(
    (angle) => angle.pointId === selectedPointId,
  );

  return (
    <section className="simulator-card card" aria-labelledby="map-title">
      <div className="simulator-header">
        <div>
          <div className="simulator-title-row">
            <span className="live-dot" aria-hidden="true" />
            <p className="card-kicker">VIRTUAL FIELD</p>
          </div>
          <h2 id="map-title">仮想現場図</h2>
        </div>
        <div className="map-status">
          <span>P1〜P4をドラッグ可能</span>
          <strong>図上値は理論値</strong>
        </div>
      </div>

      <div className="map-frame">
        <TraverseSvg
          onInteractionError={onInteractionError}
          onMovePoint={onMovePoint}
          onSelectPoint={onSelectPoint}
          referencePoints={referencePoints}
          sample={geometry}
          selectedPointId={selectedPointId}
        />
      </div>

      <div className="simulator-footer">
        <div className="map-reading-hint">
          <span className="hint-icon" aria-hidden="true">
            i
          </span>
          {selectedPoint === undefined ? (
            <p>
              <strong>P1〜P4を選んでドラッグ</strong>
              すると、図上の理論距離と理論内角が変化します。
            </p>
          ) : (
            <p>
              <strong>{selectedPoint.name}を選択中</strong>
              <span className="selected-point-reading">
                理論内角{" "}
                {theoreticalAngle === undefined
                  ? "計算不可"
                  : formatAngleDms(theoreticalAngle.angleDegrees, 1)}
                {" / "}観測内角{" "}
                {observedAngle === undefined
                  ? "入力確認中"
                  : formatAngleDms(observedAngle.angleDegrees, 1)}
              </span>
            </p>
          )}
        </div>

        <div className="phase-controls" aria-label="シミュレーター操作">
          <button onClick={onReset} type="button">
            <span aria-hidden="true">↺</span>
            リセット
          </button>
          <button
            className="primary-action"
            onClick={onOpenObservationBook}
            type="button"
          >
            <span aria-hidden="true">⌖</span>
            観測値を編集
          </button>
        </div>
      </div>
    </section>
  );
}

export default TraverseSimulator;
