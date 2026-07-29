import type { TraverseCalculationResult } from "../../calculations/traverse";
import {
  CLOSURE_VECTOR_DISPLAY_MULTIPLIER,
  createClosureVectorPlot,
} from "../../utils/closureVector";

interface ClosureVectorProps {
  readonly calculation: TraverseCalculationResult | null;
  readonly isRevealed: boolean;
}

function fixed(value: number): string {
  const normalized = Math.abs(value) < 0.0005 ? 0 : value;
  return normalized.toFixed(3);
}

function ClosureVector({
  calculation,
  isRevealed,
}: ClosureVectorProps) {
  if (!isRevealed || calculation === null) {
    return (
      <div className="phase4-placeholder" role="status">
        <span aria-hidden="true">↗</span>
        <strong>閉合差ベクトルはステップ6で表示します</strong>
        <p>
          計算ステップを進めると、本来の閉合点と計算上の閉合点のずれを確認できます。
        </p>
      </div>
    );
  }

  const { closure } = calculation;
  const plot = createClosureVectorPlot(closure);
  const startCoordinate =
    calculation.observation.points[0]!.coordinate;
  const calculatedCoordinate =
    calculation.unadjustedCoordinates.at(-1)!;
  const calculatedIsEast = plot.calculated.x >= plot.target.x;
  const calculatedLabelX =
    plot.calculated.x + (calculatedIsEast ? 11 : -11);
  const calculatedLabelAnchor = calculatedIsEast ? "start" : "end";
  const showArrows = !closure.isNearlyClosed;

  return (
    <section
      className="closure-visualization"
      aria-labelledby="closure-vector-title"
    >
      <div className="closure-visualization-heading">
        <div>
          <p className="card-kicker">ERROR VISUALIZATION</p>
          <h2 id="closure-vector-title">閉合差ベクトル</h2>
        </div>
        <span className="visualization-status">
          {closure.isNearlyClosed ? "ほぼ完全閉合" : "誤差を拡大表示"}
        </span>
      </div>

      <div className="closure-vector-layout">
        <div className="closure-vector-figure">
          <div className="vector-scale-notice">
            <strong>
              誤差ベクトル表示倍率：
              {CLOSURE_VECTOR_DISPLAY_MULTIPLIER}倍
            </strong>
            <span>実際の数値とは分けて表示しています</span>
          </div>

          <svg
            aria-labelledby="closure-diagram-title closure-diagram-description"
            className="closure-vector-svg"
            role="img"
            viewBox="0 0 520 250"
          >
            <title id="closure-diagram-title">
              本来の閉合点と計算上の閉合点
            </title>
            <desc id="closure-diagram-description">
              X方向の閉合差は{fixed(closure.fx)}メートル、Y方向は
              {fixed(closure.fy)}メートル、合成閉合差は
              {fixed(closure.linearClosure)}メートルです。誤差ベクトルは
              {CLOSURE_VECTOR_DISPLAY_MULTIPLIER}倍で表示しています。
            </desc>

            <defs>
              <pattern
                height="20"
                id="closure-grid"
                patternUnits="userSpaceOnUse"
                width="20"
              >
                <path d="M20 0H0V20" fill="none" />
              </pattern>
              <marker
                id="closure-arrow-orange"
                markerHeight="7"
                markerWidth="7"
                orient="auto-start-reverse"
                refX="6"
                refY="3.5"
                viewBox="0 0 7 7"
              >
                <path d="M0 0 7 3.5 0 7Z" />
              </marker>
              <marker
                id="closure-arrow-blue"
                markerHeight="8"
                markerWidth="8"
                orient="auto-start-reverse"
                refX="7"
                refY="4"
                viewBox="0 0 8 8"
              >
                <path d="M0 0 8 4 0 8Z" />
              </marker>
            </defs>

            <rect
              className="closure-diagram-background"
              height="230"
              rx="12"
              width="500"
              x="10"
              y="10"
            />
            <rect
              className="closure-diagram-grid"
              fill="url(#closure-grid)"
              height="230"
              rx="12"
              width="500"
              x="10"
              y="10"
            />

            <g className="closure-axis" aria-hidden="true">
              <path d="M34 210V38M34 210h454" />
              <path d="m29 45 5-9 5 9M481 205l9 5-9 5" />
              <text x="43" y="46">
                X（北）
              </text>
              <text textAnchor="end" x="485" y="228">
                Y（東）
              </text>
            </g>

            {showArrows ? (
              <>
                <g className="closure-component-vector">
                  <line
                    className="closure-guide"
                    x1={plot.fxEnd.x}
                    x2={plot.calculated.x}
                    y1={plot.fxEnd.y}
                    y2={plot.calculated.y}
                  />
                  <line
                    className="closure-guide"
                    x1={plot.fyEnd.x}
                    x2={plot.calculated.x}
                    y1={plot.fyEnd.y}
                    y2={plot.calculated.y}
                  />
                  <line
                    className="closure-fx-arrow"
                    markerEnd="url(#closure-arrow-orange)"
                    x1={plot.target.x}
                    x2={plot.fxEnd.x}
                    y1={plot.target.y}
                    y2={plot.fxEnd.y}
                  />
                  <line
                    className="closure-fy-arrow"
                    markerEnd="url(#closure-arrow-orange)"
                    x1={plot.target.x}
                    x2={plot.fyEnd.x}
                    y1={plot.target.y}
                    y2={plot.fyEnd.y}
                  />
                  <text
                    className="closure-component-label"
                    x={plot.fxEnd.x - 10}
                    y={(plot.target.y + plot.fxEnd.y) / 2}
                  >
                    fx
                  </text>
                  <text
                    className="closure-component-label"
                    textAnchor="middle"
                    x={(plot.target.x + plot.fyEnd.x) / 2}
                    y={plot.target.y + 16}
                  >
                    fy
                  </text>
                </g>
                <line
                  className="closure-resultant-arrow"
                  markerEnd="url(#closure-arrow-blue)"
                  x1={plot.target.x}
                  x2={plot.calculated.x}
                  y1={plot.target.y}
                  y2={plot.calculated.y}
                />
                <text
                  className="closure-resultant-label"
                  textAnchor="middle"
                  x={(plot.target.x + plot.calculated.x) / 2 + 8}
                  y={(plot.target.y + plot.calculated.y) / 2 - 8}
                >
                  f
                </text>
              </>
            ) : null}

            <g className="closure-target-point">
              <circle cx={plot.target.x} cy={plot.target.y} r="8" />
              <circle cx={plot.target.x} cy={plot.target.y} r="3" />
              <text
                textAnchor="middle"
                x={plot.target.x}
                y={plot.target.y + 23}
              >
                本来の閉合点
              </text>
            </g>

            <g className="closure-calculated-point">
              <circle
                cx={plot.calculated.x}
                cy={plot.calculated.y}
                r={closure.isNearlyClosed ? 11 : 7}
              />
              <text
                textAnchor={calculatedLabelAnchor}
                x={calculatedLabelX}
                y={plot.calculated.y - 9}
              >
                計算上の閉合点
              </text>
            </g>
          </svg>

          {plot.isAutoFitted ? (
            <p className="vector-fit-note" role="note">
              入力された閉合差が大きいため、100倍したベクトルを図枠内へ自動調整しています。
            </p>
          ) : null}
        </div>

        <div className="closure-vector-details">
          <dl className="closure-coordinate-list">
            <div>
              <dt>本来の閉合点</dt>
              <dd>
                X {fixed(startCoordinate.x)} / Y{" "}
                {fixed(startCoordinate.y)} m
              </dd>
            </div>
            <div>
              <dt>計算上の閉合点</dt>
              <dd>
                X {fixed(calculatedCoordinate.x)} / Y{" "}
                {fixed(calculatedCoordinate.y)} m
              </dd>
            </div>
          </dl>

          <dl className="closure-component-values">
            <div>
              <dt>fx（X方向）</dt>
              <dd>{fixed(closure.fx)} m</dd>
            </div>
            <div>
              <dt>fy（Y方向）</dt>
              <dd>{fixed(closure.fy)} m</dd>
            </div>
            <div>
              <dt>合成閉合差 f</dt>
              <dd>{fixed(closure.linearClosure)} m</dd>
            </div>
          </dl>

          <div className="closure-vector-explanation">
            <strong>図の読み方</strong>
            <p>
              オレンジがX・Y方向のずれ、青が合成したずれです。
              コンパス法では、このずれを各辺長に比例して逆向きに配分します。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClosureVector;
