import { useState } from "react";

const lessons = [
  {
    number: "01",
    title: "測点と位置",
    description: "測量の主役である「点」と、位置を表す数値の読み方",
    concepts: ["測点", "既知点・新点", "座標", "標高"],
  },
  {
    number: "02",
    title: "距離と方向",
    description: "2点の間隔と、向きを角度で伝える方法",
    concepts: ["距離", "水平角", "方位角", "度分秒"],
  },
  {
    number: "03",
    title: "高さを比べる",
    description: "点どうしの高さの差から、新しい標高を求める考え方",
    concepts: ["高低差", "標高"],
  },
  {
    number: "04",
    title: "観測と機器",
    description: "測るたびに変わる値との付き合い方と、代表的な道具",
    concepts: ["観測誤差", "主要な測量機器"],
  },
] as const;

type LessonIndex = 0 | 1 | 2 | 3;

interface DmsAngle {
  readonly degrees: number;
  readonly minutes: number;
  readonly seconds: number;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function decimalDegreesToDms(value: number): DmsAngle {
  const normalized = normalizeDegrees(value);
  const totalSeconds = Math.round(normalized * 3600) % (360 * 3600);
  const degrees = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    degrees,
    minutes,
    seconds: totalSeconds % 60,
  };
}

function formatDms(value: number): string {
  const dms = decimalDegreesToDms(value);
  return `${dms.degrees}° ${String(dms.minutes).padStart(2, "0")}′ ${String(
    dms.seconds,
  ).padStart(2, "0")}″`;
}

function surveyAnglePoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
): { readonly x: number; readonly y: number } {
  const radians = (angle * Math.PI) / 180;

  return {
    x: centerX + Math.sin(radians) * radius,
    y: centerY - Math.cos(radians) * radius,
  };
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m4 10 4 4 8-9" />
    </svg>
  );
}

function PointAndPositionLesson() {
  const points = {
    known: {
      id: "known",
      name: "A",
      kind: "既知点",
      x: 100,
      y: 100,
      elevation: 32.415,
      description: "位置がすでに分かっている、測量のスタート地点です。",
    },
    new: {
      id: "new",
      name: "P1",
      kind: "新点",
      x: 134.8,
      y: 142.6,
      elevation: 31.87,
      description: "観測をもとに、これから位置を決める測点です。",
    },
  } as const;
  const [selectedPointId, setSelectedPointId] =
    useState<keyof typeof points>("known");
  const selectedPoint = points[selectedPointId];

  const selectPoint = (pointId: keyof typeof points): void => {
    setSelectedPointId(pointId);
  };

  return (
    <div className="basics-lesson-layout">
      <section
        aria-labelledby="point-map-title"
        className="basics-visual-card basics-point-map-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">平面図を見てみよう</span>
            <h3 id="point-map-title">測点を選ぶと、持っている情報が変わります</h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">●</span>
            点をクリック
          </span>
        </div>

        <div className="basics-point-map">
          <svg
            aria-labelledby="point-map-svg-title point-map-svg-description"
            className="basics-map-svg"
            role="img"
            viewBox="0 0 640 390"
          >
            <title id="point-map-svg-title">既知点Aと新点P1の座標図</title>
            <desc id="point-map-svg-description">
              北をX軸、東をY軸とした平面座標上に既知点Aと新点P1を表示しています。
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
              <text x="214" y="349">
                Y 100.0
              </text>
              <text x="440" y="349">
                Y 142.6
              </text>
              <text x="14" y="249">
                X 100.0
              </text>
              <text x="14" y="124">
                X 134.8
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
          <p>{selectedPoint.description}</p>
          <dl className="basics-coordinate-readout">
            <div>
              <dt>X座標</dt>
              <dd>{selectedPoint.x.toFixed(3)} m</dd>
              <span>北・南の位置</span>
            </div>
            <div>
              <dt>Y座標</dt>
              <dd>{selectedPoint.y.toFixed(3)} m</dd>
              <span>東・西の位置</span>
            </div>
            <div>
              <dt>標高</dt>
              <dd>{selectedPoint.elevation.toFixed(3)} m</dd>
              <span>高さの位置</span>
            </div>
          </dl>
        </section>

        <section className="basics-concept-card">
          <span className="basics-concept-number">01</span>
          <div>
            <h3>測点とは？</h3>
            <p>
              距離や角度を測るときの目印となる点です。杭、鋲、境界標など、
              現地で同じ位置を確かめられるものを使います。
            </p>
          </div>
        </section>
        <section className="basics-concept-card">
          <span className="basics-concept-number">02</span>
          <div>
            <h3>座標と標高は別のもの</h3>
            <p>
              座標（X・Y）は上から見た位置、標高（H）は高さです。
              3つがそろうと、測点の立体的な位置を表せます。
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}

function DistanceAndDirectionLesson() {
  const backsightAzimuth = 45;
  const distance = 42.68;
  const [azimuth, setAzimuth] = useState(128.5125);
  const horizontalAngle = normalizeDegrees(azimuth - backsightAzimuth);
  const azimuthDms = decimalDegreesToDms(azimuth);
  const center = { x: 270, y: 216 };
  const targetPoint = surveyAnglePoint(center.x, center.y, 142, azimuth);
  const backsightPoint = surveyAnglePoint(
    center.x,
    center.y,
    142,
    backsightAzimuth,
  );
  const arcStart = surveyAnglePoint(
    center.x,
    center.y,
    62,
    backsightAzimuth,
  );
  const arcEnd = surveyAnglePoint(center.x, center.y, 62, azimuth);
  const arcLabel = surveyAnglePoint(
    center.x,
    center.y,
    83,
    backsightAzimuth + horizontalAngle / 2,
  );
  const arcPath =
    horizontalAngle < 0.01
      ? ""
      : `M ${arcStart.x} ${arcStart.y} A 62 62 0 ${
          horizontalAngle > 180 ? 1 : 0
        } 1 ${arcEnd.x} ${arcEnd.y}`;

  const adjustAzimuth = (amount: number): void => {
    setAzimuth((current) => normalizeDegrees(current + amount));
  };

  return (
    <div className="basics-direction-layout">
      <section
        aria-labelledby="direction-lab-title"
        className="basics-visual-card basics-direction-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">方向ラボ</span>
            <h3 id="direction-lab-title">
              P1の方向を動かして、2つの角度を比べよう
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↔</span>
            スライダーを操作
          </span>
        </div>

        <div className="basics-direction-workspace">
          <svg
            aria-labelledby="direction-svg-title direction-svg-description"
            className="basics-direction-svg"
            role="img"
            viewBox="0 0 600 410"
          >
            <title id="direction-svg-title">
              方位角と水平角を比べる平面図
            </title>
            <desc id="direction-svg-description">
              測点Aから既知方向Bと新点P1へ線を引き、北からP1までの方位角とBからP1までの水平角を示しています。
            </desc>
            <defs>
              <marker
                id="basics-direction-arrow"
                markerHeight="8"
                markerWidth="8"
                orient="auto"
                refX="7"
                refY="4"
              >
                <path d="M0,0 L8,4 L0,8 Z" />
              </marker>
            </defs>
            <circle
              className="basics-direction-compass"
              cx={center.x}
              cy={center.y}
              r="172"
            />
            <g className="basics-compass-ticks">
              <path d="M270 38V54M448 216H432M270 394V378M92 216H108" />
              <text x="270" y="27">
                北 0°
              </text>
              <text x="468" y="221">
                東 90°
              </text>
              <text x="270" y="407">
                南 180°
              </text>
              <text x="72" y="221">
                西 270°
              </text>
            </g>
            <path
              className="basics-north-reference"
              d={`M${center.x} ${center.y}V58`}
              markerEnd="url(#basics-direction-arrow)"
            />
            <path
              className="basics-backsight-ray"
              d={`M${center.x} ${center.y}L${backsightPoint.x} ${backsightPoint.y}`}
            />
            <path
              className="basics-target-ray"
              d={`M${center.x} ${center.y}L${targetPoint.x} ${targetPoint.y}`}
            />
            <path className="basics-horizontal-angle-arc" d={arcPath} />
            <text
              className="basics-horizontal-angle-label"
              x={arcLabel.x}
              y={arcLabel.y}
            >
              水平角
            </text>
            <g className="basics-direction-station">
              <circle cx={center.x} cy={center.y} r="12" />
              <circle cx={center.x} cy={center.y} r="4" />
              <text x={center.x - 30} y={center.y + 35}>
                器械点 A
              </text>
            </g>
            <g className="basics-backsight-point">
              <circle cx={backsightPoint.x} cy={backsightPoint.y} r="7" />
              <text x={backsightPoint.x + 12} y={backsightPoint.y - 6}>
                B（既知方向）
              </text>
              <text x={backsightPoint.x + 12} y={backsightPoint.y + 12}>
                方位角 45°
              </text>
            </g>
            <g className="basics-target-point">
              <circle cx={targetPoint.x} cy={targetPoint.y} r="9" />
              <text x={targetPoint.x + 13} y={targetPoint.y - 7}>
                P1
              </text>
              <text x={targetPoint.x + 13} y={targetPoint.y + 12}>
                距離 {distance.toFixed(2)} m
              </text>
            </g>
          </svg>

          <div className="basics-angle-control">
            <div className="basics-range-heading">
              <label htmlFor="azimuth-range">P1の方位角</label>
              <output htmlFor="azimuth-range">{formatDms(azimuth)}</output>
            </div>
            <input
              id="azimuth-range"
              max="359.9958333333"
              min="0"
              onChange={(event) => setAzimuth(Number(event.currentTarget.value))}
              step="0.0041666667"
              type="range"
              value={azimuth}
            />
            <div className="basics-angle-nudges" aria-label="方位角の微調整">
              <span>少しずつ動かす</span>
              <button onClick={() => adjustAzimuth(1)} type="button">
                +1°
              </button>
              <button onClick={() => adjustAzimuth(1 / 60)} type="button">
                +1′
              </button>
              <button onClick={() => adjustAzimuth(1 / 3600)} type="button">
                +1″
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="basics-angle-dashboard" aria-live="polite">
        <div className="basics-angle-result is-azimuth">
          <span>北から時計回り</span>
          <h3>方位角</h3>
          <strong>{formatDms(azimuth)}</strong>
          <small>{azimuth.toFixed(4)}°（十進度）</small>
        </div>
        <div className="basics-angle-operation" aria-hidden="true">
          <span>−</span>
          <strong>45°</strong>
          <small>Bの方向</small>
        </div>
        <div className="basics-angle-result is-horizontal">
          <span>2つの方向の差</span>
          <h3>水平角</h3>
          <strong>{formatDms(horizontalAngle)}</strong>
          <small>{horizontalAngle.toFixed(4)}°（十進度）</small>
        </div>
      </section>

      <div className="basics-definition-grid is-four-columns">
        <section>
          <span className="basics-definition-icon">↔</span>
          <h3>距離</h3>
          <p>2つの測点の間の長さ。通常はメートル（m）で表します。</p>
        </section>
        <section>
          <span className="basics-definition-icon">∠</span>
          <h3>水平角</h3>
          <p>同じ器械点から見た、2つの方向の開きです。</p>
        </section>
        <section>
          <span className="basics-definition-icon">N</span>
          <h3>方位角</h3>
          <p>北を0°として、目的の方向まで時計回りに測る角度です。</p>
        </section>
        <section>
          <span className="basics-definition-icon">°′″</span>
          <h3>度分秒</h3>
          <p>
            角度の細かな表し方。1°＝60′、1′＝60″です。
          </p>
        </section>
      </div>

      <section className="basics-dms-strip" aria-label="度分秒の読み方">
        <div>
          <span>いまの方位角</span>
          <strong>{azimuth.toFixed(4)}°</strong>
        </div>
        <span className="basics-dms-equals">＝</span>
        <div className="basics-dms-part">
          <strong>{azimuthDms.degrees}</strong>
          <span>度 °</span>
        </div>
        <div className="basics-dms-part">
          <strong>{String(azimuthDms.minutes).padStart(2, "0")}</strong>
          <span>分 ′</span>
        </div>
        <div className="basics-dms-part">
          <strong>{String(azimuthDms.seconds).padStart(2, "0")}</strong>
          <span>秒 ″</span>
        </div>
      </section>
    </div>
  );
}

function HeightDifferenceLesson() {
  const knownElevation = 100;
  const [newElevation, setNewElevation] = useState(102.4);
  const heightDifference = newElevation - knownElevation;
  const benchmarkY = 232;
  const newPointY = benchmarkY - heightDifference * 20;
  const positiveSign = heightDifference >= 0 ? "+" : "−";

  return (
    <div className="basics-height-layout">
      <section
        aria-labelledby="height-lab-title"
        className="basics-visual-card basics-height-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">高さラボ</span>
            <h3 id="height-lab-title">
              新点Pの高さを動かして、高低差を読もう
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↕</span>
            高さを操作
          </span>
        </div>

        <svg
          aria-labelledby="height-svg-title height-svg-description"
          className="basics-height-svg"
          role="img"
          viewBox="0 0 700 350"
        >
          <title id="height-svg-title">既知点BMと新点Pの高さの比較</title>
          <desc id="height-svg-description">
            標高100メートルの既知点BMと、操作できる新点Pの標高、高低差を断面図で示しています。
          </desc>
          <defs>
            <marker
              id="basics-height-arrow"
              markerHeight="7"
              markerWidth="7"
              orient="auto-start-reverse"
              refX="3.5"
              refY="3.5"
            >
              <path d="M0,3.5 L7,0 L7,7 Z" />
            </marker>
            <linearGradient id="basics-ground" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#dcefcf" />
              <stop offset="100%" stopColor="#f4ead4" />
            </linearGradient>
          </defs>
          <path
            className="basics-height-datum"
            d="M55 310H655"
          />
          <text className="basics-height-datum-label" x="58" y="332">
            高さの基準面
          </text>
          <path
            className="basics-height-ground"
            d={`M55 262 Q130 ${benchmarkY + 8} 190 ${
              benchmarkY + 9
            } Q320 260 430 ${newPointY + 8} Q535 ${
              newPointY + 4
            } 655 ${newPointY + 18} L655 310 L55 310 Z`}
          />
          <g className="basics-height-guide-lines">
            <path d={`M95 ${benchmarkY}H605`} />
            <path d={`M460 ${newPointY}H605`} />
          </g>
          <line
            className="basics-height-difference-arrow"
            markerEnd="url(#basics-height-arrow)"
            markerStart="url(#basics-height-arrow)"
            x1="580"
            x2="580"
            y1={benchmarkY}
            y2={newPointY}
          />
          <text
            className="basics-height-difference-label"
            x="592"
            y={(benchmarkY + newPointY) / 2 - 5}
          >
            高低差
          </text>
          <text
            className="basics-height-difference-value"
            x="592"
            y={(benchmarkY + newPointY) / 2 + 14}
          >
            {positiveSign}
            {Math.abs(heightDifference).toFixed(3)} m
          </text>

          <g className="basics-benchmark">
            <path d={`M120 ${benchmarkY}h34l-17 15Z`} />
            <circle cx="137" cy={benchmarkY} r="5" />
            <text x="92" y={benchmarkY - 25}>
              既知点 BM
            </text>
            <text x="83" y={benchmarkY - 8}>
              標高 100.000 m
            </text>
          </g>
          <g className="basics-new-height-point">
            <path d={`M444 ${newPointY}h34l-17 15Z`} />
            <circle cx="461" cy={newPointY} r="5" />
            <text x="426" y={newPointY - 25}>
              新点 P
            </text>
            <text x="410" y={newPointY - 8}>
              標高 {newElevation.toFixed(3)} m
            </text>
          </g>
          <g className="basics-level-icon" transform="translate(288 164)">
            <path d="M20 34v54M20 50 0 90M20 50l40 40" />
            <rect height="18" rx="4" width="72" x="-16" y="12" />
            <circle cx="45" cy="21" r="8" />
            <path d="M-4 8h34" />
          </g>
          <path
            className="basics-level-sight"
            d="M272 185H548"
          />
          <text className="basics-level-sight-label" x="300" y="177">
            水平な視準線
          </text>
        </svg>

        <div className="basics-height-control">
          <div className="basics-range-heading">
            <label htmlFor="elevation-range">新点Pの標高</label>
            <output htmlFor="elevation-range">
              {newElevation.toFixed(3)} m
            </output>
          </div>
          <input
            id="elevation-range"
            max="104"
            min="97"
            onChange={(event) =>
              setNewElevation(Number(event.currentTarget.value))
            }
            step="0.1"
            type="range"
            value={newElevation}
          />
          <div className="basics-height-scale" aria-hidden="true">
            <span>低い 97.000 m</span>
            <span>高い 104.000 m</span>
          </div>
        </div>
      </section>

      <aside className="basics-height-explanation">
        <section className="basics-height-equation" aria-live="polite">
          <span>新点の標高を求める基本</span>
          <div>
            <strong>100.000 m</strong>
            <small>既知点の標高</small>
          </div>
          <b>{heightDifference >= 0 ? "＋" : "−"}</b>
          <div>
            <strong>{Math.abs(heightDifference).toFixed(3)} m</strong>
            <small>高低差</small>
          </div>
          <b>＝</b>
          <div className="is-result">
            <strong>{newElevation.toFixed(3)} m</strong>
            <small>新点の標高</small>
          </div>
        </section>

        <section className="basics-height-definition">
          <span className="basics-definition-icon">↕</span>
          <div>
            <h3>高低差</h3>
            <p>
              2点の高さを比べた相対的な差です。上がる方向を＋、
              下がる方向を−として表します。
            </p>
          </div>
        </section>
        <section className="basics-height-definition">
          <span className="basics-definition-icon">H</span>
          <div>
            <h3>標高</h3>
            <p>
              基準面から測った点の高さです。既知点の標高に高低差を足すと、
              新点の標高を求められます。
            </p>
          </div>
        </section>
        <p className="basics-learning-note">
          <span aria-hidden="true">!</span>
          図の高さは理解しやすいよう強調しています。実際の地形の縮尺とは異なります。
        </p>
      </aside>
    </div>
  );
}

const instruments = [
  {
    id: "total-station",
    shortName: "TS",
    name: "トータルステーション",
    measures: "水平角・鉛直角・距離",
    description:
      "角度と距離を同時に観測する代表的な機器。プリズムを狙い、測点の座標や高さを求めます。",
    fieldUse: "多角測量、地形測量、位置出し",
  },
  {
    id: "level",
    shortName: "LV",
    name: "レベル",
    measures: "高低差",
    description:
      "水平な視準線をつくる機器。標尺（スタッフ）の目盛を読み、2点の高低差を求めます。",
    fieldUse: "水準測量、標高の移設",
  },
  {
    id: "gnss",
    shortName: "GNSS",
    name: "GNSS測量機",
    measures: "3次元座標",
    description:
      "複数の測位衛星から電波を受信して位置を求めます。上空の見通しや観測条件が重要です。",
    fieldUse: "基準点測量、広い現場の測量",
  },
  {
    id: "tape",
    shortName: "DIST",
    name: "巻尺・鋼巻尺",
    measures: "距離",
    description:
      "2点間の距離を直接測る基本的な道具。短い距離の確認や、機器の点検にも使います。",
    fieldUse: "短距離測定、現場での確認",
  },
] as const;

type InstrumentId = (typeof instruments)[number]["id"];

interface InstrumentIllustrationProps {
  readonly instrumentId: InstrumentId;
}

function InstrumentIllustration({
  instrumentId,
}: InstrumentIllustrationProps) {
  if (instrumentId === "total-station") {
    return (
      <svg aria-hidden="true" viewBox="0 0 260 180">
        <path className="instrument-ground" d="M26 154H234" />
        <path className="instrument-tripod" d="M130 88v24M130 106 85 156M130 106l45 50M130 106v50" />
        <path className="instrument-handle" d="M99 55V36h64v19" />
        <rect className="instrument-body" height="49" rx="9" width="92" x="84" y="50" />
        <circle className="instrument-lens" cx="169" cy="72" r="21" />
        <circle className="instrument-lens-core" cx="169" cy="72" r="9" />
        <rect className="instrument-panel" height="22" rx="3" width="33" x="95" y="63" />
        <path className="instrument-sight-line" d="M191 72H238" />
        <circle className="instrument-prism" cx="235" cy="72" r="8" />
        <path className="instrument-prism-stand" d="M235 80v76" />
      </svg>
    );
  }

  if (instrumentId === "level") {
    return (
      <svg aria-hidden="true" viewBox="0 0 260 180">
        <path className="instrument-ground" d="M26 154H234" />
        <path className="instrument-tripod" d="M116 91v19M116 105 70 156M116 105l45 51M116 105v51" />
        <rect className="instrument-level-body" height="36" rx="8" width="112" x="60" y="56" />
        <circle className="instrument-lens" cx="171" cy="74" r="18" />
        <path className="instrument-level-line" d="M184 74H224" />
        <path className="instrument-staff" d="M224 34v122M216 45h16M216 60h10M216 75h16M216 90h10M216 105h16M216 120h10M216 135h16" />
        <circle className="instrument-bubble" cx="101" cy="49" r="10" />
        <path className="instrument-bubble-line" d="M94 49h14" />
      </svg>
    );
  }

  if (instrumentId === "gnss") {
    return (
      <svg aria-hidden="true" viewBox="0 0 260 180">
        <path className="instrument-ground" d="M26 154H234" />
        <path className="instrument-gnss-pole" d="M130 62v94" />
        <ellipse className="instrument-gnss-dome" cx="130" cy="53" rx="39" ry="18" />
        <path className="instrument-gnss-signal" d="M104 28q26-24 52 0M115 36q15-13 30 0" />
        <rect className="instrument-controller" height="43" rx="6" width="55" x="139" y="90" />
        <rect className="instrument-screen" height="22" rx="2" width="37" x="148" y="98" />
        <path className="instrument-controller-arm" d="M139 112h-9" />
        <path className="instrument-pole-tip" d="m124 156 6 12 6-12" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 260 180">
      <path className="instrument-ground" d="M26 154H234" />
      <circle className="instrument-tape-case" cx="101" cy="90" r="47" />
      <circle className="instrument-tape-center" cx="101" cy="90" r="13" />
      <path className="instrument-tape" d="M142 112q34 10 74-9" />
      <path className="instrument-tape-marks" d="m159 114 3-9m15 10 3-9m15 6 3-9" />
      <rect className="instrument-tape-handle" height="18" rx="6" width="48" x="77" y="31" />
      <path className="instrument-tape-hook" d="m214 96 8 8-10 7" />
    </svg>
  );
}

function ErrorAndEquipmentLesson() {
  const observations = [42.681, 42.694, 42.676] as const;
  const [observationCount, setObservationCount] = useState(1);
  const [selectedInstrumentId, setSelectedInstrumentId] =
    useState<InstrumentId>("total-station");
  const visibleObservations = observations.slice(0, observationCount);
  const mean =
    visibleObservations.reduce((sum, value) => sum + value, 0) /
    visibleObservations.length;
  const selectedInstrument =
    instruments.find((instrument) => instrument.id === selectedInstrumentId) ??
    instruments[0];

  const handleObservation = (): void => {
    setObservationCount((current) =>
      current === observations.length ? 1 : current + 1,
    );
  };

  return (
    <div className="basics-observation-layout">
      <section
        aria-labelledby="error-lab-title"
        className="basics-visual-card basics-error-lab"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">反復観測ラボ</span>
            <h3 id="error-lab-title">
              同じ距離をくり返し測ると、値はどうなる？
            </h3>
          </div>
          <button
            className="basics-observe-button"
            onClick={handleObservation}
            type="button"
          >
            {observationCount === observations.length
              ? "最初からやり直す"
              : "もう1回観測する"}
            <span aria-hidden="true">
              {observationCount === observations.length ? "↻" : "+"}
            </span>
          </button>
        </div>

        <div className="basics-observation-scene">
          <svg
            aria-labelledby="error-svg-title error-svg-description"
            className="basics-error-svg"
            role="img"
            viewBox="0 0 640 225"
          >
            <title id="error-svg-title">AからPまでの距離観測</title>
            <desc id="error-svg-description">
              トータルステーションとプリズムの間の距離を3回観測する様子です。
            </desc>
            <path className="error-scene-ground" d="M34 184H606" />
            <path className="error-scene-ray" d="M168 102 520 79" />
            <g className="error-scene-station" transform="translate(118 66)">
              <rect height="35" rx="6" width="72" />
              <circle cx="67" cy="17" r="15" />
              <path d="M36 35v23M36 55 5 118M36 55l31 63M36 55v63" />
            </g>
            <g className="error-scene-prism">
              <path d="M520 79v105" />
              <path d="m506 79 14-15 14 15-14 15Z" />
              <circle cx="520" cy="79" r="5" />
            </g>
            <g className="error-scene-points">
              <circle cx="154" cy="184" r="6" />
              <circle cx="520" cy="184" r="6" />
              <text x="142" y="210">
                A
              </text>
              <text x="509" y="210">
                P
              </text>
            </g>
            <g className="error-scene-distance">
              <path d="M170 150H504" />
              <path d="m170 150 13-7v14Zm334 0-13-7v14Z" />
              <text x="337" y="141">
                同じ距離を観測
              </text>
            </g>
          </svg>

          <div className="basics-observation-results" aria-live="polite">
            <ol>
              {observations.map((observation, index) => (
                <li
                  className={
                    index < observationCount ? "is-observed" : "is-waiting"
                  }
                  key={observation}
                >
                  <span>{index + 1}回目</span>
                  <strong>
                    {index < observationCount
                      ? `${observation.toFixed(3)} m`
                      : "—"}
                  </strong>
                  {index < observationCount ? <CheckIcon /> : null}
                </li>
              ))}
            </ol>
            <div className="basics-mean-result">
              <span>{observationCount}回の平均</span>
              <strong>{mean.toFixed(3)} m</strong>
              <small>
                最大と最小の差：
                {(
                  Math.max(...visibleObservations) -
                  Math.min(...visibleObservations)
                ).toFixed(3)}
                m
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="basics-error-types" aria-labelledby="error-types-title">
        <div className="basics-section-heading">
          <span>値がずれる理由</span>
          <h3 id="error-types-title">観測誤差には性質があります</h3>
        </div>
        <div className="basics-error-type-grid">
          <article className="is-random">
            <span className="error-type-symbol">±</span>
            <div>
              <h4>偶然誤差</h4>
              <p>読み取りや気象条件で、測るたびに小さく変わるずれ。</p>
              <strong>→ 反復観測と平均で小さくする</strong>
            </div>
          </article>
          <article className="is-systematic">
            <span className="error-type-symbol">→</span>
            <div>
              <h4>系統誤差</h4>
              <p>機器の癖や温度などで、同じ向きに生じやすいずれ。</p>
              <strong>→ 点検・補正・観測方法で除く</strong>
            </div>
          </article>
          <article className="is-gross">
            <span className="error-type-symbol">!</span>
            <div>
              <h4>粗大誤差</h4>
              <p>読み違い、記録違い、違う点を狙うなどの大きな間違い。</p>
              <strong>→ 確認して再観測する</strong>
            </div>
          </article>
        </div>
        <p className="basics-error-caution">
          平均ですべての誤差が消えるわけではありません。値が大きく違うときは、
          原因を確認してから採用します。
        </p>
      </section>

      <section
        aria-labelledby="instrument-title"
        className="basics-instrument-section"
      >
        <div className="basics-section-heading">
          <span>現場の道具</span>
          <h3 id="instrument-title">何を測るかで、機器を使い分けます</h3>
        </div>
        <div className="basics-instrument-selector" role="tablist">
          {instruments.map((instrument) => (
            <button
              aria-controls="instrument-detail"
              aria-selected={selectedInstrumentId === instrument.id}
              className={
                selectedInstrumentId === instrument.id ? "is-selected" : ""
              }
              key={instrument.id}
              onClick={() => setSelectedInstrumentId(instrument.id)}
              role="tab"
              type="button"
            >
              <span>{instrument.shortName}</span>
              <strong>{instrument.name}</strong>
              <small>{instrument.measures}</small>
            </button>
          ))}
        </div>

        <div
          aria-live="polite"
          className="basics-instrument-detail"
          id="instrument-detail"
          role="tabpanel"
        >
          <div className="basics-instrument-illustration">
            <InstrumentIllustration instrumentId={selectedInstrument.id} />
          </div>
          <div className="basics-instrument-copy">
            <span>SELECTED EQUIPMENT</span>
            <h4>{selectedInstrument.name}</h4>
            <p>{selectedInstrument.description}</p>
            <dl>
              <div>
                <dt>測れるもの</dt>
                <dd>{selectedInstrument.measures}</dd>
              </div>
              <div>
                <dt>主な出番</dt>
                <dd>{selectedInstrument.fieldUse}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

function SurveyBasics() {
  const [activeLesson, setActiveLesson] = useState<LessonIndex>(0);
  const [completedLessons, setCompletedLessons] = useState<readonly LessonIndex[]>(
    [],
  );
  const activeLessonData = lessons[activeLesson];
  const progress = (completedLessons.length / lessons.length) * 100;

  const selectLesson = (index: number): void => {
    setActiveLesson(index as LessonIndex);
  };

  const completeLesson = (): void => {
    setCompletedLessons((current) =>
      current.includes(activeLesson) ? current : [...current, activeLesson],
    );
    setActiveLesson((current) =>
      current === lessons.length - 1 ? 0 : ((current + 1) as LessonIndex),
    );
  };

  return (
    <div className="basics-page">
      <section className="basics-hero" aria-labelledby="basics-page-title">
        <div className="basics-hero-copy">
          <span className="basics-eyebrow">
            <span aria-hidden="true">はじめの一歩</span>
            BEGINNER COURSE
          </span>
          <h1 id="basics-page-title">
            測量は、<em>点と点の関係</em>を
            <br />
            数字で表すこと。
          </h1>
          <p>
            専門用語を暗記する前に、図を動かして「何を測っているのか」を
            つかみましょう。4つのミニラボで、測量の共通言語を学びます。
          </p>
          <div className="basics-hero-meta" aria-label="教材の概要">
            <span>
              <strong>11</strong>
              基本キーワード
            </span>
            <span>
              <strong>4</strong>
              ミニラボ
            </span>
            <span>
              <strong>約15</strong>
              分
            </span>
          </div>
        </div>

        <div className="basics-hero-illustration" aria-hidden="true">
          <svg viewBox="0 0 440 270">
            <defs>
              <linearGradient id="hero-ground" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e7f2ff" />
                <stop offset="100%" stopColor="#edf8ef" />
              </linearGradient>
              <filter id="hero-shadow" height="160%" width="160%" x="-30%" y="-30%">
                <feDropShadow
                  dx="0"
                  dy="7"
                  floodColor="#073b72"
                  floodOpacity=".16"
                  stdDeviation="7"
                />
              </filter>
            </defs>
            <path
              className="hero-contour"
              d="M20 197c58-40 97 12 151-25s88-12 126-46 81-20 123 2M9 224c65-38 102 9 160-19s96-10 135-45 75-18 125 4M44 165c41-28 74 0 116-24s83-9 121-37 80-23 132 8"
            />
            <path
              className="hero-ground-plane"
              d="m58 184 185-105 146 71-189 109Z"
              fill="url(#hero-ground)"
            />
            <path className="hero-grid-lines" d="m96 163 146 71M137 139l146 71M178 116l146 71M219 93l146 71M105 211 291 106M151 234 337 129" />
            <path className="hero-measure-line" d="M120 191 323 150" />
            <g className="hero-known-point" transform="translate(120 191)">
              <circle r="15" />
              <circle r="5" />
              <text x="-11" y="-24">
                A
              </text>
            </g>
            <g className="hero-new-point" transform="translate(323 150)">
              <circle r="15" />
              <circle r="5" />
              <text x="-10" y="-24">
                P1
              </text>
            </g>
            <g
              className="hero-total-station"
              filter="url(#hero-shadow)"
              transform="translate(208 91)"
            >
              <path d="M0 50v22M0 68l-28 60M0 68l30 60M0 68v60" />
              <path d="M-28 128h9M21 128h18M-6 128H7" />
              <rect height="32" rx="7" width="64" x="-32" y="18" />
              <circle cx="26" cy="34" r="14" />
              <circle cx="26" cy="34" r="6" />
              <path d="M-20 18V4h43v14" />
            </g>
            <g className="hero-north" transform="translate(375 48)">
              <text x="0" y="-12">
                N
              </text>
              <path d="M0 45V0m0 0-8 16L0 12 8 16Z" />
            </g>
            <g className="hero-distance-pill" transform="translate(227 169)">
              <rect height="28" rx="14" width="96" x="-48" y="-14" />
              <text y="5">
                42.68 m
              </text>
            </g>
          </svg>
        </div>
      </section>

      <section className="basics-course-progress" aria-label="基礎教材の進捗">
        <div>
          <span>コース進捗</span>
          <strong>{completedLessons.length} / 4 章</strong>
        </div>
        <div
          aria-label={`基礎教材の進捗 ${Math.round(progress)}%`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="basics-progress-track"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p>好きな章から始められます</p>
      </section>

      <nav className="basics-lesson-navigation" aria-label="基礎教材の章">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(index as LessonIndex);
          const isActive = activeLesson === index;

          return (
            <button
              aria-current={isActive ? "step" : undefined}
              className={`${isActive ? "is-active" : ""} ${
                isCompleted ? "is-completed" : ""
              }`}
              key={lesson.number}
              onClick={() => selectLesson(index)}
              type="button"
            >
              <span className="basics-lesson-number">
                {isCompleted ? <CheckIcon /> : lesson.number}
              </span>
              <span className="basics-lesson-nav-copy">
                <strong>{lesson.title}</strong>
                <small>{lesson.concepts.join("・")}</small>
              </span>
              <span className="basics-lesson-arrow" aria-hidden="true">
                →
              </span>
            </button>
          );
        })}
      </nav>

      <section
        aria-labelledby="active-lesson-title"
        className="basics-lesson-shell"
      >
        <header className="basics-lesson-header">
          <div className="basics-lesson-heading">
            <span>LESSON {activeLessonData.number}</span>
            <h2 id="active-lesson-title">{activeLessonData.title}</h2>
            <p>{activeLessonData.description}</p>
          </div>
          <div className="basics-concept-tags" aria-label="この章で学ぶ用語">
            {activeLessonData.concepts.map((concept) => (
              <span key={concept}>{concept}</span>
            ))}
          </div>
        </header>

        <div className="basics-lesson-content">
          {activeLesson === 0 ? <PointAndPositionLesson /> : null}
          {activeLesson === 1 ? <DistanceAndDirectionLesson /> : null}
          {activeLesson === 2 ? <HeightDifferenceLesson /> : null}
          {activeLesson === 3 ? <ErrorAndEquipmentLesson /> : null}
        </div>

        <footer className="basics-lesson-footer">
          <div>
            <span className="basics-footer-check">
              <CheckIcon />
            </span>
            <p>
              <strong>ここまで理解できましたか？</strong>
              操作をもう一度試してから次へ進んでも大丈夫です。
            </p>
          </div>
          <button onClick={completeLesson} type="button">
            {activeLesson === lessons.length - 1
              ? "理解した・最初から見直す"
              : "理解した・次の章へ"}
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </section>

      <p className="basics-course-note">
        本教材の数値と図は学習用の例です。実務の成果作成や精度判定には使用しないでください。
      </p>
    </div>
  );
}

export default SurveyBasics;
