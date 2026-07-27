import { traverseDisplaySample } from "../../data/traverseSample";
import TraverseSvg from "./TraverseSvg";

function TraverseSimulator() {
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
          <span>サンプル No.01</span>
          <strong>閉合トラバース</strong>
        </div>
      </div>

      <div className="map-frame">
        <TraverseSvg sample={traverseDisplaySample} />
      </div>

      <div className="simulator-footer">
        <div className="map-reading-hint">
          <span className="hint-icon" aria-hidden="true">
            i
          </span>
          <p>
            <strong>Aから時計回り</strong>
            に測点と観測辺をたどってみましょう。
          </p>
        </div>

        <div className="phase-controls" aria-label="Phase 3で実装予定の操作">
          <button disabled type="button">
            <span aria-hidden="true">↺</span>
            リセット
          </button>
          <button className="primary-placeholder" disabled type="button">
            <span aria-hidden="true">⌖</span>
            観測をはじめる
            <small>Phase 3</small>
          </button>
        </div>
      </div>
    </section>
  );
}

export default TraverseSimulator;
