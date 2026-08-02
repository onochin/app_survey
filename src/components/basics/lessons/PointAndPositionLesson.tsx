import { useState } from "react";
import {
  pointComparisons,
  surveyPurposes,
  surveyWorkflow,
  type PointComparisonId,
  type SurveyPurposeId,
} from "../data/surveyOverview";
import DefinitionCard from "../ui/DefinitionCard";

function PointAndPositionLesson() {
  const [selectedPurposeId, setSelectedPurposeId] =
    useState<SurveyPurposeId>("create-control-point");
  const [selectedPointId, setSelectedPointId] =
    useState<PointComparisonId>("known");
  const selectedPurpose =
    surveyPurposes.find((purpose) => purpose.id === selectedPurposeId) ??
    surveyPurposes[0];
  const selectedPoint = pointComparisons[selectedPointId];

  const selectPoint = (pointId: PointComparisonId): void => {
    setSelectedPointId(pointId);
  };

  return (
    <div className="basics-overview-lesson">
      <section
        aria-labelledby="survey-definition-title"
        className="basics-overview-intro"
      >
        <div className="basics-overview-definition">
          <span className="basics-card-kicker">まず全体像をつかむ</span>
          <h3 id="survey-definition-title">
            測量は、必要な位置や高さを観測・計算・点検して表すこと
          </h3>
          <p>
            現地にある点どうしの関係を測り、土地や構造物の位置・高さ・形を
            数値や図にします。機器に数値が表示されただけでは終わらず、
            計算と点検を経て、使える成果にするまでが測量です。
          </p>

          <div
            aria-label="平面位置と高さの違い"
            className="basics-position-dimensions"
          >
            <article>
              <svg aria-hidden="true" viewBox="0 0 84 68">
                <path className="dimension-grid" d="M12 56V12M12 56h60M24 56V18m12 38V18m12 38V18m12 38V18M12 44h60M12 32h60M12 20h60" />
                <circle className="dimension-point" cx="51" cy="29" r="6" />
                <path className="dimension-guide" d="M51 29v27M12 29h39" />
              </svg>
              <div>
                <strong>平面位置 X・Y</strong>
                <p>上から見て、点が南北・東西のどこにあるかを表します。</p>
              </div>
            </article>
            <article>
              <svg aria-hidden="true" viewBox="0 0 84 68">
                <path className="dimension-datum" d="M10 56h64" />
                <path className="dimension-ground" d="M10 43c17-7 31 1 45-8 8-5 13-3 19-7" />
                <path className="dimension-height" d="M57 35v21m-5-16 5-6 5 6M52 51l5 6 5-6" />
                <circle className="dimension-point" cx="57" cy="35" r="5" />
              </svg>
              <div>
                <strong>高さ H</strong>
                <p>決められた高さの基準から、点がどれだけ高いかを表します。</p>
              </div>
            </article>
          </div>
        </div>

        <aside className="basics-result-first-card">
          <span className="basics-card-kicker">測量方法の選び方</span>
          <h3>機器ではなく、求める成果から逆算します</h3>
          <p>
            「TSを使う」「GNSSを使う」を出発点にせず、必要な成果と精度を
            先に決めます。その後で観測方法と機器を選びます。
          </p>
          <ol>
            <li>
              <span>1</span>
              <div>
                <strong>求める成果</strong>
                <small>座標・標高・現況図など</small>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>必要な観測</strong>
                <small>位置関係・距離・方向・高低差など</small>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>測量方法と機器</strong>
                <small>精度、現場条件、点検方法も含めて選ぶ</small>
              </div>
            </li>
          </ol>
        </aside>
      </section>

      <section
        aria-labelledby="purpose-lab-title"
        className="basics-visual-card basics-purpose-lab"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">目的選択ラボ</span>
            <h3 id="purpose-lab-title">
              何を求めたいか選び、測量の種類と成果を確かめよう
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">●</span>
            目的を選択
          </span>
        </div>

        <div
          aria-label="測量目的"
          className="basics-purpose-selector"
          role="tablist"
        >
          {surveyPurposes.map((purpose) => (
            <button
              aria-controls="survey-purpose-panel"
              aria-selected={selectedPurposeId === purpose.id}
              className={
                selectedPurposeId === purpose.id ? "is-selected" : ""
              }
              id={`survey-purpose-${purpose.id}`}
              key={purpose.id}
              onClick={() => setSelectedPurposeId(purpose.id)}
              role="tab"
              type="button"
            >
              {purpose.label}
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`survey-purpose-${selectedPurpose.id}`}
          aria-live="polite"
          className="basics-purpose-detail"
          id="survey-purpose-panel"
          role="tabpanel"
        >
          <div className="basics-purpose-summary">
            <span>選んだ目的</span>
            <h4>{selectedPurpose.label}</h4>
            <p>{selectedPurpose.summary}</p>
          </div>
          <div
            aria-label="成果から測量方法を選ぶ順序"
            className="basics-purpose-path"
          >
            <section className="is-result">
              <span>1　先に決める</span>
              <h4>想定される成果</h4>
              <ul>
                {selectedPurpose.expectedResults.map((result) => (
                  <li key={result}>{result}</li>
                ))}
              </ul>
            </section>
            <span aria-hidden="true" className="basics-purpose-arrow">
              →
            </span>
            <section>
              <span>2　必要な情報</span>
              <h4>主な観測対象</h4>
              <ul>
                {selectedPurpose.observationTargets.map((target) => (
                  <li key={target}>{target}</li>
                ))}
              </ul>
            </section>
            <span aria-hidden="true" className="basics-purpose-arrow">
              →
            </span>
            <section className="is-method">
              <span>3　選ぶ方法</span>
              <h4>測量の種類</h4>
              <strong>{selectedPurpose.surveyType}</strong>
            </section>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="survey-types-title"
        className="basics-survey-types"
      >
        <div className="basics-section-heading">
          <span>測量の主な区分</span>
          <h3 id="survey-types-title">成果の目的によって、測る内容が変わります</h3>
        </div>
        <div className="basics-definition-grid basics-survey-type-grid">
          <DefinitionCard
            className="basics-survey-type-card"
            icon="基"
            title="基準点測量"
          >
            他の測量のよりどころとなる基準点の座標や標高を求めます。
            後の観測をつなぎ、位置を再現する土台になります。
          </DefinitionCard>
          <DefinitionCard
            className="basics-survey-type-card"
            icon="地"
            title="地形測量"
          >
            地表の起伏や建物・道路などの地物を測り、現況平面図や
            地形を表すデータにつなげます。
          </DefinitionCard>
          <DefinitionCard
            className="basics-survey-type-card"
            icon="応"
            title="応用測量"
          >
            道路、河川、用地、工事などの目的に必要な位置・形・高さを
            求めます。基準点や地形の成果も利用します。
          </DefinitionCard>
        </div>
      </section>

      <section
        aria-labelledby="survey-workflow-title"
        className="basics-workflow-section"
      >
        <div className="basics-section-heading">
          <span>現場から成果まで</span>
          <h3 id="survey-workflow-title">
            観測値をそのまま成果にせず、計算と点検を通します
          </h3>
        </div>
        <ol className="basics-survey-workflow">
          {surveyWorkflow.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="point-comparison-title"
        className="basics-point-comparison-section"
      >
        <div className="basics-section-heading">
          <span>測点比較ラボ</span>
          <h3 id="point-comparison-title">
            測点のうち、何が分かっているかで役割が変わります
          </h3>
          <p>
            図のAとP1を選び、既知点と新点を現場でどう扱うか比べてみましょう。
          </p>
        </div>

        <div className="basics-lesson-layout">
          <section
            aria-labelledby="point-map-title"
            className="basics-visual-card basics-point-map-card"
          >
            <div className="basics-card-heading">
              <div>
                <span className="basics-card-kicker">平面図を見てみよう</span>
                <h3 id="point-map-title">
                  既知点と新点では、観測前に持つ情報が違います
                </h3>
              </div>
              <span className="basics-operation-hint">
                <span aria-hidden="true">●</span>
                点を選択
              </span>
            </div>

            <div className="basics-point-map">
              <svg
                aria-labelledby="point-map-svg-title point-map-svg-description"
                className="basics-map-svg"
                role="img"
                viewBox="0 0 640 390"
              >
                <title id="point-map-svg-title">既知点Aと新点P1の比較図</title>
                <desc id="point-map-svg-description">
                  北をX軸、東をY軸とした平面上で、値が分かっている既知点Aと、
                  観測前は座標が未定の新点P1を結んでいます。
                </desc>
            <defs>
              <pattern
                height="32"
                id="basics-grid"
                patternUnits="userSpaceOnUse"
                width="32"
              >
                <path d="M 32 0 L 0 0 0 32" />
              </pattern>
              <marker
                id="basics-axis-arrow"
                markerHeight="7"
                markerWidth="7"
                orient="auto-start-reverse"
                refX="6"
                refY="3.5"
              >
                <path d="M0,0 L7,3.5 L0,7 Z" />
              </marker>
            </defs>
            <rect className="basics-map-grid" height="390" width="640" />
            <g className="basics-coordinate-axes">
              <path
                d="M72 326V45"
                markerEnd="url(#basics-axis-arrow)"
              />
              <path
                d="M72 326H598"
                markerEnd="url(#basics-axis-arrow)"
              />
              <text x="50" y="52">
                北
              </text>
              <text x="50" y="70">
                X
              </text>
              <text x="570" y="354">
                東 Y
              </text>
            </g>

            <path
              className="basics-point-connection"
              d="M230 244 466 119"
            />
            <g className="basics-map-projections">
              <path d="M230 244V326M230 244H72" />
              <path d="M466 119V326M466 119H72" />
            </g>

            <g
              aria-label="既知点Aを選択"
              className={`basics-map-point is-known ${
                selectedPointId === "known" ? "is-selected" : ""
              }`}
              onClick={() => selectPoint("known")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectPoint("known");
                }
              }}
              role="button"
              tabIndex={0}
            >
              <circle className="point-touch-target" cx="230" cy="244" r="28" />
              <circle className="point-halo" cx="230" cy="244" r="18" />
              <circle className="point-mark" cx="230" cy="244" r="8" />
              <text className="point-label" x="208" y="218">
                A
              </text>
              <text className="point-kind" x="208" y="274">
                既知点
              </text>
            </g>
            <g
              aria-label="新点P1を選択"
              className={`basics-map-point is-new ${
                selectedPointId === "new" ? "is-selected" : ""
              }`}
              onClick={() => selectPoint("new")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectPoint("new");
                }
              }}
              role="button"
              tabIndex={0}
            >
              <circle className="point-touch-target" cx="466" cy="119" r="28" />
              <circle className="point-halo" cx="466" cy="119" r="18" />
              <circle className="point-mark" cx="466" cy="119" r="8" />
              <text className="point-label" x="482" y="103">
                P1
              </text>
              <text className="point-kind" x="482" y="129">
                新点
              </text>
            </g>

                <g className="basics-map-axis-values">
                  <text x="207" y="349">
                    Y 既知
                  </text>
                  <text x="440" y="349">
                    Y 未定
                  </text>
                  <text x="18" y="249">
                    X 既知
                  </text>
                  <text x="18" y="124">
                    X 未定
                  </text>
                </g>
              </svg>

              <div className="basics-point-selector" aria-label="表示する測点">
                <button
                  aria-pressed={selectedPointId === "known"}
                  className={selectedPointId === "known" ? "is-selected" : ""}
                  onClick={() => selectPoint("known")}
                  type="button"
                >
                  <span className="basics-point-swatch is-known" />
                  A：既知点
                </button>
                <button
                  aria-pressed={selectedPointId === "new"}
                  className={selectedPointId === "new" ? "is-selected" : ""}
                  onClick={() => selectPoint("new")}
                  type="button"
                >
                  <span className="basics-point-swatch is-new" />
                  P1：新点
                </button>
              </div>
            </div>
          </section>

          <aside className="basics-explanation-stack">
            <section className="basics-reading-card" aria-live="polite">
              <div className="basics-selected-point">
                <span
                  className={`basics-selected-point-mark is-${selectedPoint.id}`}
                >
                  {selectedPoint.name}
                </span>
                <div>
                  <span>{selectedPoint.kind}</span>
                  <strong>測点 {selectedPoint.name}</strong>
                </div>
              </div>
              <p>{selectedPoint.summary}</p>
              <dl className="basics-coordinate-readout">
                <div>
                  <dt>X座標</dt>
                  <dd>{selectedPoint.coordinateReadout.x}</dd>
                  <span>北・南の位置</span>
                </div>
                <div>
                  <dt>Y座標</dt>
                  <dd>{selectedPoint.coordinateReadout.y}</dd>
                  <span>東・西の位置</span>
                </div>
                <div>
                  <dt>標高 H</dt>
                  <dd>{selectedPoint.coordinateReadout.elevation}</dd>
                  <span>高さの位置</span>
                </div>
              </dl>
            </section>

            <section
              aria-live="polite"
              className="basics-point-role-comparison"
            >
              <h3>{selectedPoint.kind}を4つの視点で確認</h3>
              <dl>
                <div>
                  <dt>現在分かっている情報</dt>
                  <dd>{selectedPoint.currentInformation}</dd>
                </div>
                <div>
                  <dt>測量での役割</dt>
                  <dd>{selectedPoint.role}</dd>
                </div>
                <div>
                  <dt>現地で確認すること</dt>
                  <dd>{selectedPoint.fieldCheck}</dd>
                </div>
                <div>
                  <dt>測量後の状態</dt>
                  <dd>{selectedPoint.afterSurvey}</dd>
                </div>
              </dl>
            </section>

            <section className="basics-concept-card">
              <span className="basics-concept-number">!</span>
              <div>
                <h3>測点・基準点・既知点は同じ分類ではありません</h3>
                <p>
                  測点は測量で扱う点の総称、基準点は位置や高さの基準となる点です。
                  既知点と新点は、今回必要な値が観測前に分かっているかで決まる
                  役割です。基準点を既知点として使うこともあります。
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default PointAndPositionLesson;
