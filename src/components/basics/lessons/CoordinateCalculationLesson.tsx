import { useState } from "react";
import { calculateCoordinateInverse } from "../../../calculations/coordinate";
import {
  calculateForwardCoordinate,
  closureBridgeSample,
  coordinateCalculationConcepts,
  coordinateCalculationWorkflow,
  coordinateComparisonSample,
  describeSurveyDirection,
  inverseDirectionPresets,
} from "../data/coordinateCalculation";
import type { BasicsLessonComponentProps } from "../types";
import DefinitionCard from "../ui/DefinitionCard";

type ComparisonMode = "forward" | "inverse";

interface CoordinateVectorDiagramProps {
  readonly deltaX: number;
  readonly deltaY: number;
  readonly description: string;
  readonly markerId: string;
  readonly title: string;
}

const formatSigned = (value: number, digits = 3): string => {
  const normalizedValue = Math.abs(value) < 10 ** -(digits + 2) ? 0 : value;
  const magnitude = Math.abs(normalizedValue).toFixed(digits);

  if (normalizedValue > 0) {
    return `+${magnitude}`;
  }

  if (normalizedValue < 0) {
    return `−${magnitude}`;
  }

  return Number(magnitude).toFixed(digits);
};

function CoordinateVectorDiagram({
  deltaX,
  deltaY,
  description,
  markerId,
  title,
}: CoordinateVectorDiagramProps) {
  const centerX = 160;
  const centerY = 130;
  const plotScale = 88 / Math.max(Math.abs(deltaX), Math.abs(deltaY), 1);
  const endX = centerX + deltaY * plotScale;
  const endY = centerY - deltaX * plotScale;
  const isSamePoint = deltaX === 0 && deltaY === 0;
  const titleId = `${markerId}-title`;
  const descriptionId = `${markerId}-description`;

  return (
    <svg
      aria-labelledby={`${titleId} ${descriptionId}`}
      className="basics-coordinate-vector-svg"
      role="img"
      viewBox="0 0 320 260"
    >
      <title id={titleId}>{title}</title>
      <desc id={descriptionId}>{description}</desc>
      <defs>
        <marker
          id={markerId}
          markerHeight="7"
          markerWidth="7"
          orient="auto"
          refX="6"
          refY="3.5"
          viewBox="0 0 7 7"
        >
          <path d="M0 0 7 3.5 0 7Z" />
        </marker>
      </defs>
      <path
        className="basics-coordinate-axis"
        d="M24 130H296M160 238V22"
      />
      <path className="basics-coordinate-axis-arrow" d="m160 22-6 12h12ZM296 130l-12-6v12Z" />
      <text className="basics-coordinate-axis-label" x="166" y="32">
        X（北＋）
      </text>
      <text className="basics-coordinate-axis-label" x="230" y="122">
        Y（東＋）
      </text>
      <path
        className="basics-coordinate-component is-x"
        d={`M${centerX} ${centerY}V${endY}`}
      />
      <path
        className="basics-coordinate-component is-y"
        d={`M${centerX} ${endY}H${endX}`}
      />
      {!isSamePoint ? (
        <path
          className="basics-coordinate-vector"
          d={`M${centerX} ${centerY}L${endX} ${endY}`}
          markerEnd={`url(#${markerId})`}
        />
      ) : null}
      <circle className="basics-coordinate-point is-known" cx={centerX} cy={centerY} r="7" />
      <circle className="basics-coordinate-point is-new" cx={endX} cy={endY} r="7" />
      <text className="basics-coordinate-point-label" x={centerX + 9} y={centerY + 18}>
        A
      </text>
      <text className="basics-coordinate-point-label" x={endX + 9} y={endY - 9}>
        {isSamePoint ? "A＝B" : "B"}
      </text>
      <text
        className="basics-coordinate-component-label is-x"
        x={centerX - 8}
        y={(centerY + endY) / 2}
      >
        ΔX {formatSigned(deltaX)}
      </text>
      <text
        className="basics-coordinate-component-label is-y"
        x={(centerX + endX) / 2}
        y={endY - 8}
      >
        ΔY {formatSigned(deltaY)}
      </text>
    </svg>
  );
}

function CoordinateCalculationLesson({
  onOpenTraverse,
}: BasicsLessonComponentProps) {
  const [forwardStartX, setForwardStartX] = useState(1_000);
  const [forwardStartY, setForwardStartY] = useState(500);
  const [forwardDistance, setForwardDistance] = useState(50);
  const [forwardAzimuth, setForwardAzimuth] = useState(30);
  const [inverseStartX, setInverseStartX] = useState(1_000);
  const [inverseStartY, setInverseStartY] = useState(500);
  const [inverseEndX, setInverseEndX] = useState(1_030);
  const [inverseEndY, setInverseEndY] = useState(540);
  const [comparisonMode, setComparisonMode] =
    useState<ComparisonMode>("forward");

  const forwardResult = calculateForwardCoordinate(
    { x: forwardStartX, y: forwardStartY },
    forwardDistance,
    forwardAzimuth,
  );
  const inverseResult = calculateCoordinateInverse(
    { x: inverseStartX, y: inverseStartY },
    { x: inverseEndX, y: inverseEndY },
  );
  const inverseDirection = describeSurveyDirection(
    inverseResult.azimuthDegrees,
  );
  const comparisonForward = calculateForwardCoordinate(
    coordinateComparisonSample.startPoint,
    coordinateComparisonSample.distance,
    coordinateComparisonSample.azimuthDegrees,
  );
  const comparisonInverse = calculateCoordinateInverse(
    comparisonForward.startPoint,
    comparisonForward.newPoint,
  );
  const closurePlotPoints = closureBridgeSample.coordinates.map(
    (coordinate) => ({
      x:
        58 +
        (coordinate.y - closureBridgeSample.startPoint.y) * 1.38,
      y:
        212 -
        (coordinate.x - closureBridgeSample.startPoint.x) * 1.38,
    }),
  );
  const closurePointLabels = ["A", "P1", "P2", "P3", "A′"] as const;
  const closureVectorStart = { x: 308, y: 194 } as const;
  const closureVectorScale = 55;
  const closureVectorEnd = {
    x: closureVectorStart.x + closureBridgeSample.closure.fy * closureVectorScale,
    y: closureVectorStart.y - closureBridgeSample.closure.fx * closureVectorScale,
  };

  const setFiniteInRange = (
    value: number,
    minimum: number,
    maximum: number,
    setter: (nextValue: number) => void,
  ): void => {
    if (Number.isFinite(value) && value >= minimum && value <= maximum) {
      setter(value);
    }
  };

  const selectInversePreset = (
    deltaX: number,
    deltaY: number,
  ): void => {
    setInverseEndX(inverseStartX + deltaX);
    setInverseEndY(inverseStartY + deltaY);
  };

  return (
    <div className="basics-coordinate-lesson">
      <section
        aria-labelledby="coordinate-overview-title"
        className="basics-coordinate-intro"
      >
        <div className="basics-section-heading">
          <span>距離と方向を、座標の変化へつなぐ</span>
          <h3 id="coordinate-overview-title">
            1本の辺をX方向とY方向へ分けると、新点座標を計算できる
          </h3>
        </div>
        <p className="basics-coordinate-lead">
          平面直角座標では<strong>Xが北方向、Yが東方向</strong>です。
          方位角は<strong>北を0度として時計回り</strong>に測り、距離Sを
          ΔX（緯距）とΔY（経距）へ分解します。
        </p>
        <ol className="basics-coordinate-flow" aria-label="座標計算から閉合差点検までの流れ">
          {coordinateCalculationWorkflow.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="basics-coordinate-calc-definition-grid">
          {coordinateCalculationConcepts.map((concept) => (
            <DefinitionCard
              className="basics-coordinate-definition"
              icon={concept.icon}
              key={concept.id}
              title={concept.title}
            >
              {concept.description}
            </DefinitionCard>
          ))}
        </div>
        <p className="basics-coordinate-scope-note">
          この章は平面座標計算の入口です。座標系変換、緯度経度、標高、ジオイドは
          第2章で扱っています。ここでは同じ座標系のX・Yだけを計算します。
        </p>
      </section>

      <section
        aria-labelledby="forward-coordinate-title"
        className="basics-visual-card basics-coordinate-calculation-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">ミニ操作 1・正計算</span>
            <h3 id="forward-coordinate-title">距離・方位角をΔX・ΔYへ分解して新点Bを求める</h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">●</span>
            4つの値を操作
          </span>
        </div>
        <div className="basics-coordinate-calculation-workspace">
          <div className="basics-coordinate-diagram-panel">
            <CoordinateVectorDiagram
              deltaX={forwardResult.deltaX}
              deltaY={forwardResult.deltaY}
              description="既知点Aから新点Bへのベクトルを、北方向のΔXと東方向のΔYへ分解しています。"
              markerId="forward-coordinate-arrow"
              title="正計算の座標増分図"
            />
            <p>青：距離と方位角のベクトル ／ 緑：ΔX（緯距） ／ 橙：ΔY（経距）</p>
          </div>
          <div className="basics-coordinate-control-panel">
            <div className="basics-coordinate-controls">
              <label>
                <span>既知点AのX座標 <strong>{forwardStartX.toFixed(1)} m</strong></span>
                <input
                  aria-label="正計算 既知点AのX座標"
                  max="1100"
                  min="900"
                  onChange={(event) =>
                    setFiniteInRange(Number(event.target.value), 900, 1_100, setForwardStartX)
                  }
                  step="1"
                  type="range"
                  value={forwardStartX}
                />
              </label>
              <label>
                <span>既知点AのY座標 <strong>{forwardStartY.toFixed(1)} m</strong></span>
                <input
                  aria-label="正計算 既知点AのY座標"
                  max="600"
                  min="400"
                  onChange={(event) =>
                    setFiniteInRange(Number(event.target.value), 400, 600, setForwardStartY)
                  }
                  step="1"
                  type="range"
                  value={forwardStartY}
                />
              </label>
              <label>
                <span>距離S <strong>{forwardDistance.toFixed(1)} m</strong></span>
                <input
                  aria-label="正計算 距離"
                  max="100"
                  min="1"
                  onChange={(event) =>
                    setFiniteInRange(Number(event.target.value), 1, 100, setForwardDistance)
                  }
                  step="1"
                  type="range"
                  value={forwardDistance}
                />
              </label>
              <label>
                <span>方位角α <strong>{forwardAzimuth.toFixed(1)}°</strong></span>
                <input
                  aria-label="正計算 方位角"
                  max="359.9"
                  min="0"
                  onChange={(event) =>
                    setFiniteInRange(Number(event.target.value), 0, 359.9, setForwardAzimuth)
                  }
                  step="0.1"
                  type="range"
                  value={forwardAzimuth}
                />
              </label>
            </div>
            <dl className="basics-coordinate-result-grid">
              <div>
                <dt>ΔX（緯距）</dt>
                <dd data-testid="forward-delta-x">{formatSigned(forwardResult.deltaX)} m</dd>
              </div>
              <div>
                <dt>ΔY（経距）</dt>
                <dd data-testid="forward-delta-y">{formatSigned(forwardResult.deltaY)} m</dd>
              </div>
              <div className="is-result">
                <dt>新点BのX座標</dt>
                <dd data-testid="forward-point-x">{forwardResult.newPoint.x.toFixed(3)} m</dd>
              </div>
              <div className="is-result">
                <dt>新点BのY座標</dt>
                <dd data-testid="forward-point-y">{forwardResult.newPoint.y.toFixed(3)} m</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="basics-coordinate-equations" aria-label="正計算の式と代入値">
          <p>
            <span>緯距</span>
            ΔX ＝ S × cos α ＝ {forwardResult.distance.toFixed(3)} × cos {forwardResult.azimuthDegrees.toFixed(1)}°
            ＝ <strong>{formatSigned(forwardResult.deltaX)} m</strong>
          </p>
          <p>
            <span>経距</span>
            ΔY ＝ S × sin α ＝ {forwardResult.distance.toFixed(3)} × sin {forwardResult.azimuthDegrees.toFixed(1)}°
            ＝ <strong>{formatSigned(forwardResult.deltaY)} m</strong>
          </p>
          <p>
            <span>新点X</span>
            XB ＝ XA ＋ ΔX ＝ {forwardStartX.toFixed(3)} {forwardResult.deltaX >= 0 ? "＋" : "−"} {Math.abs(forwardResult.deltaX).toFixed(3)}
            ＝ <strong>{forwardResult.newPoint.x.toFixed(3)} m</strong>
          </p>
          <p>
            <span>新点Y</span>
            YB ＝ YA ＋ ΔY ＝ {forwardStartY.toFixed(3)} {forwardResult.deltaY >= 0 ? "＋" : "−"} {Math.abs(forwardResult.deltaY).toFixed(3)}
            ＝ <strong>{forwardResult.newPoint.y.toFixed(3)} m</strong>
          </p>
        </div>
        <p className="basics-coordinate-caution">
          角度は内部では十進度で保持し、三角関数へ渡すときだけラジアンへ変換します。
          計算途中は丸めず、上の表示だけを小数第3位へ整えています。
        </p>
      </section>

      <section
        aria-labelledby="inverse-coordinate-title"
        className="basics-coordinate-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 2・逆計算</span>
          <h3 id="inverse-coordinate-title">点A・Bの座標から距離と方位角を戻す</h3>
        </div>
        <p className="basics-coordinate-section-lead">
          まず座標差を求め、距離は二乗和の平方根、方位角は
          <strong>atan2（ΔY, ΔX）</strong>で求めます。X北・Y東の規約では、
          atan2へ渡す順序が一般的な画面座標の説明と異なる点に注意します。
        </p>
        <div
          aria-label="点Bの方向プリセット"
          className="basics-coordinate-direction-selector"
        >
          {inverseDirectionPresets.map((preset) => {
            const isSelected =
              inverseEndX - inverseStartX === preset.deltaX &&
              inverseEndY - inverseStartY === preset.deltaY;

            return (
              <button
                aria-pressed={isSelected}
                className={isSelected ? "is-selected" : undefined}
                key={preset.id}
                onClick={() => selectInversePreset(preset.deltaX, preset.deltaY)}
                type="button"
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        <div className="basics-coordinate-inverse-workspace">
          <div className="basics-coordinate-diagram-panel">
            <CoordinateVectorDiagram
              deltaX={inverseResult.deltaX}
              deltaY={inverseResult.deltaY}
              description="点Aと点Bの座標差から距離と方位角を逆算する図です。"
              markerId="inverse-coordinate-arrow"
              title="逆計算の2点間ベクトル図"
            />
            <p>
              点Bは点Aから見て<strong data-testid="inverse-direction">{inverseDirection}</strong>
            </p>
          </div>
          <div className="basics-coordinate-control-panel">
            <div className="basics-coordinate-controls is-inverse">
              {[
                {
                  label: "点AのX座標",
                  ariaLabel: "逆計算 点AのX座標",
                  value: inverseStartX,
                  minimum: 900,
                  maximum: 1_100,
                  setter: setInverseStartX,
                },
                {
                  label: "点AのY座標",
                  ariaLabel: "逆計算 点AのY座標",
                  value: inverseStartY,
                  minimum: 400,
                  maximum: 600,
                  setter: setInverseStartY,
                },
                {
                  label: "点BのX座標",
                  ariaLabel: "逆計算 点BのX座標",
                  value: inverseEndX,
                  minimum: 900,
                  maximum: 1_100,
                  setter: setInverseEndX,
                },
                {
                  label: "点BのY座標",
                  ariaLabel: "逆計算 点BのY座標",
                  value: inverseEndY,
                  minimum: 400,
                  maximum: 600,
                  setter: setInverseEndY,
                },
              ].map((control) => (
                <label key={control.ariaLabel}>
                  <span>{control.label} <strong>{control.value.toFixed(1)} m</strong></span>
                  <input
                    aria-label={control.ariaLabel}
                    max={control.maximum}
                    min={control.minimum}
                    onChange={(event) =>
                      setFiniteInRange(
                        Number(event.target.value),
                        control.minimum,
                        control.maximum,
                        control.setter,
                      )
                    }
                    step="1"
                    type="range"
                    value={control.value}
                  />
                </label>
              ))}
            </div>
            <dl className="basics-coordinate-result-grid">
              <div>
                <dt>ΔX</dt>
                <dd data-testid="inverse-delta-x">{formatSigned(inverseResult.deltaX)} m</dd>
              </div>
              <div>
                <dt>ΔY</dt>
                <dd data-testid="inverse-delta-y">{formatSigned(inverseResult.deltaY)} m</dd>
              </div>
              <div className="is-result">
                <dt>2点間距離S</dt>
                <dd data-testid="inverse-distance">{inverseResult.distance.toFixed(3)} m</dd>
              </div>
              <div className={inverseResult.azimuthDegrees === null ? "is-undefined" : "is-result"}>
                <dt>方位角α</dt>
                <dd data-testid="inverse-azimuth">
                  {inverseResult.azimuthDegrees === null
                    ? "定義できません（同一点）"
                    : `${inverseResult.azimuthDegrees.toFixed(3)}°`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="basics-coordinate-equations" aria-label="逆計算の式と代入値">
          <p>
            <span>座標差X</span>
            ΔX ＝ XB − XA ＝ {inverseEndX.toFixed(3)} − {inverseStartX.toFixed(3)}
            ＝ <strong>{formatSigned(inverseResult.deltaX)} m</strong>
          </p>
          <p>
            <span>座標差Y</span>
            ΔY ＝ YB − YA ＝ {inverseEndY.toFixed(3)} − {inverseStartY.toFixed(3)}
            ＝ <strong>{formatSigned(inverseResult.deltaY)} m</strong>
          </p>
          <p>
            <span>距離</span>
            S ＝ √（ΔX² ＋ ΔY²）＝ √（{inverseResult.deltaX.toFixed(3)}² ＋ {inverseResult.deltaY.toFixed(3)}²）
            ＝ <strong>{inverseResult.distance.toFixed(3)} m</strong>
          </p>
          <p>
            <span>方位角</span>
            {inverseResult.azimuthDegrees === null ? (
              <strong>ΔX＝0、ΔY＝0のため方向を一意に決められません。</strong>
            ) : (
              <>
                α ＝ atan2（ΔY, ΔX）を0°以上360°未満へ正規化
                ＝ <strong>{inverseResult.azimuthDegrees.toFixed(3)}°</strong>
              </>
            )}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="coordinate-comparison-title"
        className="basics-coordinate-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 3</span>
          <h3 id="coordinate-comparison-title">同じ固定サンプルで正計算と逆計算を比較する</h3>
        </div>
        <p className="basics-coordinate-section-lead">
          A（X＝1000.000 m、Y＝500.000 m）からB（X＝1030.000 m、Y＝540.000 m）へ進む
          3・4・5の固定例です。切り替わるのは<strong>入力値と求める値の役割</strong>です。
        </p>
        <div className="basics-coordinate-mode-selector" aria-label="正計算と逆計算を切り替え">
          <button
            aria-pressed={comparisonMode === "forward"}
            className={comparisonMode === "forward" ? "is-selected" : undefined}
            onClick={() => setComparisonMode("forward")}
            type="button"
          >
            正計算
          </button>
          <button
            aria-pressed={comparisonMode === "inverse"}
            className={comparisonMode === "inverse" ? "is-selected" : undefined}
            onClick={() => setComparisonMode("inverse")}
            type="button"
          >
            逆計算
          </button>
        </div>
        <div className="basics-coordinate-comparison-grid">
          <article data-testid="comparison-inputs">
            <span>入力値</span>
            <h4>{comparisonMode === "forward" ? "既知点A・距離・方位角" : "点A・点Bの座標"}</h4>
            {comparisonMode === "forward" ? (
              <p>
                XA＝1000.000 m ／ YA＝500.000 m<br />
                S＝50.000 m ／ α＝53.130°
              </p>
            ) : (
              <p>
                A（1000.000, 500.000）m<br />
                B（1030.000, 540.000）m
              </p>
            )}
          </article>
          <span className="basics-coordinate-comparison-arrow" aria-hidden="true">→</span>
          <article className="is-result" data-testid="comparison-results">
            <span>求める値</span>
            <h4>{comparisonMode === "forward" ? "座標増分・新点B" : "座標差・距離・方位角"}</h4>
            {comparisonMode === "forward" ? (
              <p>
                ΔX＝{formatSigned(comparisonForward.deltaX)} m ／ ΔY＝{formatSigned(comparisonForward.deltaY)} m<br />
                B（{comparisonForward.newPoint.x.toFixed(3)}, {comparisonForward.newPoint.y.toFixed(3)}）m
              </p>
            ) : (
              <p>
                ΔX＝{formatSigned(comparisonInverse.deltaX)} m ／ ΔY＝{formatSigned(comparisonInverse.deltaY)} m<br />
                S＝{comparisonInverse.distance.toFixed(3)} m ／ α＝{comparisonInverse.azimuthDegrees?.toFixed(3)}°
              </p>
            )}
          </article>
        </div>
      </section>

      <section
        aria-labelledby="closure-bridge-title"
        className="basics-coordinate-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 4・閉合差への橋渡し</span>
          <h3 id="closure-bridge-title">各辺のΔX・ΔYを足すと終点が決まり、残った差が閉合差になる</h3>
        </div>
        <p className="basics-coordinate-section-lead">
          既知点Aから各辺の座標増分を順次加える固定例です。閉じるべき測量では、
          理想的にはΣΔX＝0、ΣΔY＝0ですが、観測誤差があると計算終点A′がAと一致しません。
        </p>
        <div className="basics-coordinate-closure-workspace">
          <div className="basics-coordinate-closure-diagram">
            <svg
              aria-labelledby="coordinate-closure-title coordinate-closure-description"
              role="img"
              viewBox="0 0 420 260"
            >
              <title id="coordinate-closure-title">複数辺の座標増分と閉合差の概念図</title>
              <desc id="coordinate-closure-description">
                Aから4辺をたどった計算終点Aダッシュと、始点Aとの差を拡大表示します。
              </desc>
              <defs>
                <marker
                  id="coordinate-closure-arrow"
                  markerHeight="7"
                  markerWidth="7"
                  orient="auto"
                  refX="6"
                  refY="3.5"
                  viewBox="0 0 7 7"
                >
                  <path d="M0 0 7 3.5 0 7Z" />
                </marker>
              </defs>
              <path className="basics-coordinate-closure-grid" d="M30 72H230M30 142H230M98 32V232M168 32V232" />
              <polyline
                className="basics-coordinate-closure-route"
                points={closurePlotPoints.map((point) => `${point.x},${point.y}`).join(" ")}
              />
              {closurePlotPoints.map((point, index) => (
                <g key={closurePointLabels[index]}>
                  <circle
                    className={index === closurePlotPoints.length - 1 ? "is-calculated" : undefined}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                  />
                  <text x={point.x + 8} y={point.y - 8}>{closurePointLabels[index]}</text>
                </g>
              ))}
              <path
                className="basics-coordinate-closure-link"
                d={`M${closurePlotPoints.at(-1)!.x} ${closurePlotPoints.at(-1)!.y}L${closurePlotPoints[0]!.x} ${closurePlotPoints[0]!.y}`}
              />
              <rect className="basics-coordinate-closure-inset" height="122" rx="10" width="126" x="274" y="104" />
              <text className="basics-coordinate-closure-inset-title" x="288" y="126">閉合差を55倍表示</text>
              <circle cx={closureVectorStart.x} cy={closureVectorStart.y} r="5" />
              <path
                className="basics-coordinate-closure-vector"
                d={`M${closureVectorStart.x} ${closureVectorStart.y}L${closureVectorEnd.x} ${closureVectorEnd.y}`}
                markerEnd="url(#coordinate-closure-arrow)"
              />
              <text x="284" y="212">A</text>
              <text x={closureVectorEnd.x + 7} y={closureVectorEnd.y - 7}>A′</text>
              <text className="basics-coordinate-north-label" x="292" y="56">X（北＋）↑</text>
              <text className="basics-coordinate-north-label" x="292" y="76">Y（東＋）→</text>
            </svg>
          </div>
          <div className="basics-coordinate-closure-summary">
            <dl>
              <div>
                <dt>fx ＝ ΣΔX</dt>
                <dd data-testid="closure-fx">{formatSigned(closureBridgeSample.closure.fx)} m</dd>
              </div>
              <div>
                <dt>fy ＝ ΣΔY</dt>
                <dd data-testid="closure-fy">{formatSigned(closureBridgeSample.closure.fy)} m</dd>
              </div>
              <div>
                <dt>合成閉合差 f</dt>
                <dd data-testid="closure-linear">{closureBridgeSample.closure.linearClosure.toFixed(3)} m</dd>
              </div>
              <div>
                <dt>計算終点A′</dt>
                <dd>
                  X＝{closureBridgeSample.coordinates.at(-1)!.x.toFixed(3)} m<br />
                  Y＝{closureBridgeSample.coordinates.at(-1)!.y.toFixed(3)} m
                </dd>
              </div>
            </dl>
            <p>
              fx ＝ ΣΔX ＝ {closureBridgeSample.legs.map((leg) => formatSigned(leg.deltaX)).join(" ＋ ")}
              ＝ <strong>{formatSigned(closureBridgeSample.closure.fx)} m</strong>
            </p>
            <p>
              fy ＝ ΣΔY ＝ {closureBridgeSample.legs.map((leg) => formatSigned(leg.deltaY)).join(" ＋ ")}
              ＝ <strong>{formatSigned(closureBridgeSample.closure.fy)} m</strong>
            </p>
          </div>
        </div>
        <div className="basics-coordinate-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">辺</th>
                <th scope="col">距離S</th>
                <th scope="col">方位角α</th>
                <th scope="col">ΔX（緯距）</th>
                <th scope="col">ΔY（経距）</th>
              </tr>
            </thead>
            <tbody>
              {closureBridgeSample.legs.map((leg) => (
                <tr key={leg.id}>
                  <th scope="row">{leg.fromPointId} → {leg.toPointId}</th>
                  <td>{leg.distance.toFixed(3)} m</td>
                  <td>{leg.azimuthDegrees.toFixed(3)}°</td>
                  <td>{formatSigned(leg.deltaX)} m</td>
                  <td>{formatSigned(leg.deltaY)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="basics-coordinate-caution">
          閉合差が小さくても、粗大誤差や系統誤差が相殺されている可能性があります。
          原記録、点名、座標系、観測条件と合わせて点検します。
        </p>
        <div className="basics-coordinate-traverse-bridge">
          <div>
            <span>次の教材へ</span>
            <h4>角度補正・コンパス法・閉合比は、既存の閉合トラバースで確認</h4>
            <p>
              ここで学んだ方位角、緯距・経距、座標累積、閉合差が、複数辺を調整して
              成果座標へつなげる閉合トラバースの計算ステップになります。
            </p>
          </div>
          <button data-testid="open-traverse-course" onClick={onOpenTraverse} type="button">
            閉合トラバース測量を開く
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default CoordinateCalculationLesson;
