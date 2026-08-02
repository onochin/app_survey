import { useState } from "react";
import {
  calculateElevation,
  coordinateQuadrants,
  coordinateRepresentations,
  ellipsoidHeightRange,
  fixedCoordinateSample,
  heightControlPointDefinitions,
  heightReferences,
  type CoordinateQuadrantId,
  type CoordinateRepresentationId,
  type HeightReferenceId,
} from "../data/coordinateAndHeight";
import DefinitionCard from "../ui/DefinitionCard";

function formatHeight(value: number): string {
  return `${value.toFixed(4)} m`;
}

function DistanceAndDirectionLesson() {
  const [representationId, setRepresentationId] =
    useState<CoordinateRepresentationId>("latitude-longitude");
  const [quadrantId, setQuadrantId] =
    useState<CoordinateQuadrantId>("north-east");
  const [ellipsoidHeight, setEllipsoidHeight] = useState<number>(
    fixedCoordinateSample.height.ellipsoidHeight,
  );
  const [heightReferenceId, setHeightReferenceId] =
    useState<HeightReferenceId>("ellipsoid-height");
  const selectedRepresentation =
    coordinateRepresentations.find(
      (representation) => representation.id === representationId,
    ) ?? coordinateRepresentations[0];
  const selectedQuadrant =
    coordinateQuadrants.find((quadrant) => quadrant.id === quadrantId) ??
    coordinateQuadrants[0];
  const selectedHeightReference =
    heightReferences.find(
      (reference) => reference.id === heightReferenceId,
    ) ?? heightReferences[0];
  const elevation = calculateElevation(
    ellipsoidHeight,
    fixedCoordinateSample.height.geoidHeight,
  );
  const selectedHeightValue =
    heightReferenceId === "ellipsoid-height"
      ? ellipsoidHeight
      : elevation;
  const heightPointY =
    142 -
    ((ellipsoidHeight - ellipsoidHeightRange.min) /
      (ellipsoidHeightRange.max - ellipsoidHeightRange.min)) *
      46;

  return (
    <div className="basics-coordinate-height-lesson">
      <section
        aria-labelledby="coordinate-intro-title"
        className="basics-coordinate-intro"
      >
        <div className="basics-coordinate-intro-copy">
          <span className="basics-card-kicker">座標は値と基準を一組で読む</span>
          <h3 id="coordinate-intro-title">
            同じ地点でも、表し方と基準が変われば座標の数値は変わります
          </h3>
          <p>
            緯度・経度は地球上の位置を角度で、平面直角座標は地域ごとの
            原点からの位置をメートルで表します。数字だけを受け取っても、
            座標系、原点、系番号が分からなければ地点を正しく再現できません。
          </p>
          <aside className="basics-coordinate-key-message">
            <strong>実務の確認順</strong>
            <span>座標の種類 → 座標系 → 系番号・原点 → 数値と単位</span>
          </aside>
        </div>

        <div className="basics-definition-grid basics-coordinate-definition-grid">
          <DefinitionCard icon="φλ" title="緯度・経度">
            緯度は赤道から南北へ、経度は本初子午線から東西へ測る角度です。
            度分秒または十進度で表します。
          </DefinitionCard>
          <DefinitionCard icon="XY" title="平面直角座標">
            地域を平面へ投影し、原点からの位置をメートルで表します。
            Xは北方向、Yは東方向が正です。
          </DefinitionCard>
        </div>
      </section>

      <section
        aria-labelledby="coordinate-representation-title"
        className="basics-visual-card basics-coordinate-representation-lab"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">同じ地点の表現切替</span>
            <h3 id="coordinate-representation-title">
              日本経緯度原点を、3つの表示で見比べよう
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">⇄</span>
            表現を切替
          </span>
        </div>

        <div
          aria-label="座標表現"
          className="basics-coordinate-representation-selector"
          role="tablist"
        >
          {coordinateRepresentations.map((representation) => (
            <button
              aria-controls="coordinate-representation-panel"
              aria-selected={representationId === representation.id}
              className={
                representationId === representation.id ? "is-selected" : ""
              }
              id={`coordinate-representation-${representation.id}`}
              key={representation.id}
              onClick={() => setRepresentationId(representation.id)}
              role="tab"
              type="button"
            >
              {representation.label}
            </button>
          ))}
        </div>

        <div
          aria-labelledby={`coordinate-representation-${selectedRepresentation.id}`}
          aria-live="polite"
          className="basics-coordinate-representation-panel"
          id="coordinate-representation-panel"
          role="tabpanel"
        >
          <div className="basics-fixed-point-summary">
            <span className="basics-fixed-point-mark" aria-hidden="true">
              ◎
            </span>
            <div>
              <span>地点は変わりません</span>
              <strong>{fixedCoordinateSample.name}</strong>
              <p>{selectedRepresentation.description}</p>
            </div>
          </div>

          <div className="basics-coordinate-value-grid">
            {selectedRepresentation.values.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.unit}</small>
              </div>
            ))}
          </div>

          <dl className="basics-coordinate-context">
            <div>
              <dt>座標の種類</dt>
              <dd>{selectedRepresentation.label}</dd>
            </div>
            <div>
              <dt>座標系</dt>
              <dd>{selectedRepresentation.coordinateSystem}</dd>
            </div>
            <div>
              <dt>系番号</dt>
              <dd>{selectedRepresentation.zone}</dd>
            </div>
            <div>
              <dt>実務で確認</dt>
              <dd>
                <ul>
                  {selectedRepresentation.practicalChecks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <aside className="basics-fixed-sample-note">
            <strong>事前確認済みの固定値</strong>
            <p>
              {fixedCoordinateSample.verification.horizontalSource}で
              緯度経度から第IX系へ換算し、X・Yから元の緯度経度へ戻ることを
              {fixedCoordinateSample.verification.checkedOn}に確認しました。
              画面内では座標変換を行わず、確認済みの値を切り替えています。
            </p>
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="coordinate-axis-title"
        className="basics-visual-card basics-coordinate-axis-lab"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">X・Y方向と符号</span>
            <h3 id="coordinate-axis-title">
              原点のどちら側にあるかで、X・Yの正負が決まります
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">●</span>
            点の位置を選択
          </span>
        </div>

        <div className="basics-coordinate-axis-workspace">
          <div className="basics-coordinate-axis-diagram">
            <svg
              aria-labelledby="coordinate-axis-svg-title coordinate-axis-svg-description"
              className="basics-coordinate-axis-svg"
              role="img"
              viewBox="0 0 440 360"
            >
              <title id="coordinate-axis-svg-title">
                平面直角座標のX・Y方向と4つの符号
              </title>
              <desc id="coordinate-axis-svg-description">
                原点から北へ進むとXが正、南へ進むとXが負、東へ進むとYが正、
                西へ進むとYが負になる模式図です。
              </desc>
              <defs>
                <pattern
                  height="34"
                  id="basics-coordinate-axis-grid"
                  patternUnits="userSpaceOnUse"
                  width="34"
                >
                  <path
                    className="basics-coordinate-axis-grid-line"
                    d="M34 0H0V34"
                  />
                </pattern>
                <marker
                  className="basics-coordinate-axis-marker"
                  id="basics-coordinate-axis-arrow"
                  markerHeight="8"
                  markerWidth="8"
                  orient="auto"
                  refX="7"
                  refY="4"
                >
                  <path d="M0 0 8 4 0 8Z" />
                </marker>
              </defs>
              <rect
                className="basics-coordinate-axis-grid"
                height="320"
                width="400"
                x="20"
                y="20"
              />
              <g className="basics-coordinate-axis-lines">
                <path
                  d="M220 326V34"
                  markerEnd="url(#basics-coordinate-axis-arrow)"
                />
                <path
                  d="M34 180H406"
                  markerEnd="url(#basics-coordinate-axis-arrow)"
                />
              </g>
              <g className="basics-coordinate-axis-labels">
                <text x="236" y="45">
                  北　X 正
                </text>
                <text x="236" y="326">
                  南　X 負
                </text>
                <text x="350" y="166">
                  東　Y 正
                </text>
                <text x="38" y="166">
                  西　Y 負
                </text>
              </g>
              <g className="basics-coordinate-origin">
                <circle cx="220" cy="180" r="10" />
                <circle cx="220" cy="180" r="3" />
                <text x="232" y="201">
                  原点 X=0, Y=0
                </text>
              </g>
              <g
                className="basics-coordinate-quadrant-point"
                transform={`translate(${selectedQuadrant.diagramX} ${selectedQuadrant.diagramY})`}
              >
                <circle r="14" />
                <circle r="5" />
                <text x="18" y="-9">
                  選択した点
                </text>
                <text x="18" y="12">
                  X {selectedQuadrant.xSign}・Y {selectedQuadrant.ySign}
                </text>
              </g>
            </svg>
            <p>
              これは符号と方向を学ぶ模式図です。上の固定サンプル地点や
              実座標を動かす操作ではありません。
            </p>
          </div>

          <div className="basics-coordinate-quadrant-control">
            <div
              aria-label="原点に対する点の位置"
              className="basics-coordinate-quadrant-selector"
            >
              {coordinateQuadrants.map((quadrant) => (
                <button
                  aria-pressed={quadrantId === quadrant.id}
                  className={quadrantId === quadrant.id ? "is-selected" : ""}
                  key={quadrant.id}
                  onClick={() => setQuadrantId(quadrant.id)}
                  type="button"
                >
                  <strong>{quadrant.label}</strong>
                  <span>
                    X {quadrant.xSign}・Y {quadrant.ySign}
                  </span>
                </button>
              ))}
            </div>
            <div
              aria-live="polite"
              className="basics-coordinate-quadrant-result"
            >
              <span>選択中：{selectedQuadrant.label}</span>
              <strong>
                X {selectedQuadrant.xSign} ／ Y {selectedQuadrant.ySign}
              </strong>
              <p>{selectedQuadrant.position}にある点です。</p>
            </div>
            <dl className="basics-coordinate-origin-data">
              <div>
                <dt>第IX系の原点緯度</dt>
                <dd>
                  {fixedCoordinateSample.planeCoordinate.originLatitude}
                </dd>
              </div>
              <div>
                <dt>第IX系の中央経線</dt>
                <dd>
                  {fixedCoordinateSample.planeCoordinate.originLongitude}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="height-relation-title"
        className="basics-visual-card basics-height-reference-lab"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">3つの高さの関係</span>
            <h3 id="height-relation-title">
              楕円体高から固定ジオイド高を引いて、標高を求めよう
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↕</span>
            楕円体高を操作
          </span>
        </div>

        <div className="basics-height-model-workspace">
          <div className="basics-height-model-diagram">
            <svg
              aria-labelledby="height-model-svg-title height-model-svg-description"
              className="basics-height-model-svg"
              role="img"
              viewBox="0 0 620 360"
            >
              <title id="height-model-svg-title">
                楕円体高、ジオイド高、標高の関係
              </title>
              <desc id="height-model-svg-description">
                楕円体面から観測点までが楕円体高、楕円体面からジオイド面までが
                ジオイド高、ジオイド面から観測点までが標高であることを示します。
              </desc>
              <defs>
                <marker
                  className="basics-height-model-marker"
                  id="basics-height-model-arrow"
                  markerHeight="7"
                  markerWidth="7"
                  orient="auto-start-reverse"
                  refX="3.5"
                  refY="3.5"
                >
                  <path d="M7 0 0 3.5 7 7Z" />
                </marker>
              </defs>
              <path
                className="basics-height-ellipsoid-surface"
                d="M36 304 Q310 270 584 304"
              />
              <path
                className="basics-height-geoid-surface"
                d="M36 226 C145 206 235 242 338 219 S500 209 584 226"
              />
              <path
                className="basics-height-ground-surface"
                d={`M36 ${heightPointY + 22} C160 ${
                  heightPointY + 2
                } 270 ${heightPointY + 28} 390 ${
                  heightPointY + 4
                } S520 ${heightPointY + 12} 584 ${heightPointY + 4}`}
              />
              <g className="basics-height-observation-point">
                <circle cx="390" cy={heightPointY} r="9" />
                <circle cx="390" cy={heightPointY} r="3" />
                <text x="404" y={heightPointY - 10}>
                  地表上の観測点
                </text>
              </g>
              <g className="basics-height-surface-labels">
                <text x="45" y="327">
                  楕円体面
                </text>
                <text x="45" y="214">
                  ジオイド面
                </text>
              </g>
              <g className="basics-height-measurement-arrows">
                <path
                  d={`M505 300V${heightPointY}`}
                  markerEnd="url(#basics-height-model-arrow)"
                  markerStart="url(#basics-height-model-arrow)"
                />
                <text x="516" y={(300 + heightPointY) / 2}>
                  h 楕円体高
                </text>
                <path
                  className="is-geoid"
                  d="M112 296V226"
                  markerEnd="url(#basics-height-model-arrow)"
                  markerStart="url(#basics-height-model-arrow)"
                />
                <text x="122" y="266">
                  N ジオイド高
                </text>
                <path
                  className="is-elevation"
                  d={`M215 222V${heightPointY}`}
                  markerEnd="url(#basics-height-model-arrow)"
                  markerStart="url(#basics-height-model-arrow)"
                />
                <text x="226" y={(222 + heightPointY) / 2}>
                  H 標高
                </text>
              </g>
            </svg>
            <p>
              図は高さ関係を強調した模式図です。面どうしの間隔を実際の縮尺では
              表していません。
            </p>
          </div>

          <div className="basics-height-model-control">
            <div className="basics-height-range-heading">
              <label htmlFor="ellipsoid-height-range">楕円体高 h</label>
              <output htmlFor="ellipsoid-height-range">
                {formatHeight(ellipsoidHeight)}
              </output>
            </div>
            <input
              id="ellipsoid-height-range"
              max={ellipsoidHeightRange.max}
              min={ellipsoidHeightRange.min}
              onChange={(event) =>
                setEllipsoidHeight(Number(event.currentTarget.value))
              }
              step={ellipsoidHeightRange.step}
              type="range"
              value={ellipsoidHeight}
            />

            <dl className="basics-height-live-values" aria-live="polite">
              <div>
                <dt>楕円体高 h</dt>
                <dd>{formatHeight(ellipsoidHeight)}</dd>
                <span>基準楕円体から</span>
              </div>
              <div className="is-fixed">
                <dt>ジオイド高 N</dt>
                <dd>{formatHeight(fixedCoordinateSample.height.geoidHeight)}</dd>
                <span>同一地点では固定</span>
              </div>
              <div className="is-result">
                <dt>標高 H</dt>
                <dd>{formatHeight(elevation)}</dd>
                <span>ジオイド面から</span>
              </div>
            </dl>

            <div
              aria-label="標高の計算式"
              className="basics-height-relation-equation"
            >
              <strong>標高 H</strong>
              <span>＝</span>
              <strong>楕円体高 h</strong>
              <span>−</span>
              <strong>ジオイド高 N</strong>
              <output>
                {ellipsoidHeight.toFixed(4)} −{" "}
                {fixedCoordinateSample.height.geoidHeight.toFixed(4)} ＝{" "}
                {elevation.toFixed(4)} m
              </output>
            </div>
            <p className="basics-fixed-geoid-note">
              この地点のジオイド高は
              <strong>
                {fixedCoordinateSample.height.geoidHeight.toFixed(4)} m
              </strong>
              で固定しています。楕円体高を変えても、同じ地点のジオイド高は
              動かしません。
            </p>
          </div>
        </div>

        <div className="basics-height-reference-comparison">
          <div
            aria-label="比較する高さの基準"
            className="basics-height-reference-selector"
            role="tablist"
          >
            {heightReferences.map((reference) => (
              <button
                aria-controls="height-reference-panel"
                aria-selected={heightReferenceId === reference.id}
                className={
                  heightReferenceId === reference.id ? "is-selected" : ""
                }
                id={`height-reference-${reference.id}`}
                key={reference.id}
                onClick={() => setHeightReferenceId(reference.id)}
                role="tab"
                type="button"
              >
                {reference.label}
              </button>
            ))}
          </div>
          <div
            aria-labelledby={`height-reference-${selectedHeightReference.id}`}
            aria-live="polite"
            className="basics-height-reference-panel"
            id="height-reference-panel"
            role="tabpanel"
          >
            <div>
              <span>選択した高さ</span>
              <strong>{selectedHeightReference.label}</strong>
              <output>{formatHeight(selectedHeightValue)}</output>
            </div>
            <dl>
              <div>
                <dt>基準</dt>
                <dd>{selectedHeightReference.basis}</dd>
              </div>
              <div>
                <dt>用途</dt>
                <dd>{selectedHeightReference.purpose}</dd>
              </div>
              <div>
                <dt>現場で確認</dt>
                <dd>{selectedHeightReference.fieldCheck}</dd>
              </div>
            </dl>
            <p>
              両者を結ぶ地点固有の固定値：
              <strong>
                ジオイド高{" "}
                {fixedCoordinateSample.height.geoidHeight.toFixed(4)} m
              </strong>
            </p>
          </div>
        </div>

        <p className="basics-height-learning-value-note">
          {fixedCoordinateSample.height.learningValueNote}
        </p>
      </section>

      <section
        aria-labelledby="height-control-points-title"
        className="basics-height-control-points"
      >
        <div className="basics-section-heading">
          <span>高さの基準となる点</span>
          <h3 id="height-control-points-title">
            BMはBenchmark、つまり水準点を指します
          </h3>
        </div>
        <div className="basics-definition-grid basics-height-point-grid">
          {heightControlPointDefinitions.map((definition) => (
            <DefinitionCard
              className={`basics-height-point-card ${
                definition.id === "benchmark" ? "is-benchmark" : ""
              }`}
              icon={definition.icon}
              key={definition.id}
              title={definition.title}
            >
              {definition.description}
            </DefinitionCard>
          ))}
        </div>
        <aside className="basics-later-lesson-note">
          <strong>この章では基準の意味まで</strong>
          <p>
            後視・前視、器械高方式、高低差方式、水準路線、閉合差などの
            詳しい水準測量の手順は、後続章で扱います。
          </p>
        </aside>
      </section>
    </div>
  );
}

export default DistanceAndDirectionLesson;
