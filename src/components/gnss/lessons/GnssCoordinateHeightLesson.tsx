import { useState } from "react";
import {
  calculateGnssElevation,
  evaluateGnssCoordinateHeightQuizAnswer,
  getGnssCoordinateHeightQuizOptionLetter,
  getGnssEarthPositionPreset,
  gnssAntennaHeightExample,
  gnssAntennaPointRelationship,
  gnssCoordinateHeightCards,
  gnssCoordinateHeightConceptFlow,
  gnssCoordinateHeightQuizQuestions,
  gnssCoordinateHeightSampleG0,
  gnssDatumRelationship,
  gnssEarthCenteredExplanation,
  gnssEarthPositionPresets,
  gnssEpochReference,
  gnssFieldScenarioP1,
  gnssFinalReviewRows,
  gnssHeightReferenceExplanation,
  gnssPlaneCoordinateExplanation,
  gnssVirtualEpochPointT1,
  GRS80_INVERSE_FLATTENING,
  GRS80_SEMI_MAJOR_AXIS_METERS,
} from "../data/gnssCoordinateHeight";
import { gnssCoordinateHeightLesson } from "../gnssCourse";
import type {
  GnssCoordinateRepresentationId,
  GnssEarthPositionPresetId,
  GnssEpochComparisonId,
  GnssHeightConversionStateId,
  GnssHeightReferenceViewId,
  GnssPlaneSystemViewId,
} from "../data/gnssCoordinateHeight";

interface GnssCoordinateHeightLessonProps {
  readonly completedLessonCount: number;
  readonly isUnderstood: boolean;
  readonly onToggleUnderstood: () => void;
  readonly totalLessonCount: number;
}

interface GnssQuizAnswerState {
  readonly selectedOptionId: string;
  readonly isAnswered: boolean;
}

type GnssQuizAnswerStateMap = Readonly<
  Record<string, GnssQuizAnswerState | undefined>
>;

interface GnssCardHeadingProps {
  readonly index: number;
  readonly label: string;
  readonly title: string;
  readonly titleId: string;
  readonly description: string;
}

function GnssCardHeading({
  index,
  label,
  title,
  titleId,
  description,
}: GnssCardHeadingProps) {
  return (
    <header className="gnss-card-heading">
      <div>
        <span>
          カード {index} / 10 · {label}
        </span>
        <h2 id={titleId}>{title}</h2>
      </div>
      <p>{description}</p>
    </header>
  );
}

function formatMeters(value: number, digits = 4): string {
  return `${value.toFixed(digits)} m`;
}

function formatSignedMeters(value: number, digits = 3): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)} m`;
}

function formatEarthKilometers(value: number): string {
  return `${value >= 0 ? "+" : "−"}${Math.round(Math.abs(value) / 1000).toLocaleString("ja-JP")} km`;
}

function GnssEarthCenteredDiagram({
  pointX,
  pointY,
  pointLabel,
}: {
  readonly pointX: number;
  readonly pointY: number;
  readonly pointLabel: string;
}) {
  return (
    <div className="gnss-coordinate-earth-diagram">
      <svg
        aria-labelledby="gnss-earth-centered-title gnss-earth-centered-description"
        role="img"
        viewBox="0 0 700 380"
      >
        <title id="gnss-earth-centered-title">
          地球の重心を原点とするXc・Yc・Zc軸と観測点の模式図
        </title>
        <desc id="gnss-earth-centered-description">
          地球、地球の重心、北極方向を正とするZ軸を含む3つの座標軸と、選択した模式位置の観測点を示します。
        </desc>
        <defs>
          <radialGradient id="gnss-coordinate-earth-fill" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#d9f1ff" />
            <stop offset="100%" stopColor="#6ea8d6" />
          </radialGradient>
          <marker
            id="gnss-coordinate-axis-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
          >
            <path d="M0 0 8 4 0 8Z" />
          </marker>
        </defs>
        <circle
          className="gnss-coordinate-earth"
          cx="350"
          cy="190"
          fill="url(#gnss-coordinate-earth-fill)"
          r="130"
        />
        <path className="gnss-coordinate-land" d="M330 70c35 18 50 37 42 61-9 27 29 42 6 67-19 20-58 8-77-17-20-26-9-53 29-111Z" />
        <line className="gnss-coordinate-axis" markerEnd="url(#gnss-coordinate-axis-arrow)" x1="350" x2="630" y1="190" y2="190" />
        <line className="gnss-coordinate-axis" markerEnd="url(#gnss-coordinate-axis-arrow)" x1="350" x2="116" y1="190" y2="322" />
        <line className="gnss-coordinate-axis" markerEnd="url(#gnss-coordinate-axis-arrow)" x1="350" x2="350" y1="190" y2="25" />
        <text className="gnss-coordinate-axis-label" x="638" y="195">Xc</text>
        <text className="gnss-coordinate-axis-label" x="84" y="344">Yc</text>
        <text className="gnss-coordinate-axis-label" x="361" y="30">Zc</text>
        <circle className="gnss-coordinate-origin" cx="350" cy="190" r="6" />
        <text className="gnss-coordinate-origin-label" x="364" y="214">地球の重心（地球中心）</text>
        <line className="gnss-coordinate-point-line" x1="350" x2={pointX} y1="190" y2={pointY} />
        <circle className="gnss-coordinate-point" cx={pointX} cy={pointY} r="9" />
        <text className="gnss-coordinate-point-label" x={pointX + 13} y={pointY - 9}>
          {pointLabel}
        </text>
      </svg>
      <p>※軸・地球・地点の位置関係を学ぶ模式図で、実際の縮尺ではありません。</p>
    </div>
  );
}

function GnssGeodeticDiagram() {
  return (
    <div className="gnss-coordinate-geodetic-diagram">
      <svg
        aria-labelledby="gnss-geodetic-title gnss-geodetic-description"
        role="img"
        viewBox="0 0 650 330"
      >
        <title id="gnss-geodetic-title">GRS80楕円体と日本付近の基準サンプルの緯度・経度・楕円体高</title>
        <desc id="gnss-geodetic-description">
          同じ地点を楕円体面からの角度と高さで表す模式図です。
        </desc>
        <ellipse className="gnss-coordinate-ellipsoid" cx="310" cy="190" rx="235" ry="105" />
        <line className="gnss-coordinate-equator" x1="75" x2="545" y1="190" y2="190" />
        <line className="gnss-coordinate-meridian" x1="310" x2="310" y1="78" y2="302" />
        <line className="gnss-coordinate-radius" x1="310" x2="437" y1="190" y2="99" />
        <line className="gnss-coordinate-height-line" x1="437" x2="464" y1="99" y2="75" />
        <circle className="gnss-coordinate-point" cx="464" cy="75" r="9" />
        <text className="gnss-coordinate-point-label" x="478" y="70">基準サンプル（同じ地点）</text>
        <path className="gnss-coordinate-angle" d="M365 190A55 55 0 0 0 354 158" />
        <text className="gnss-coordinate-diagram-label" x="370" y="165">緯度</text>
        <text className="gnss-coordinate-diagram-label" x="277" y="320">経度は基準子午線からの角度</text>
        <text className="gnss-coordinate-diagram-label" x="467" y="103">楕円体高 h</text>
        <text className="gnss-coordinate-diagram-label" x="85" y="180">GRS80楕円体</text>
      </svg>
    </div>
  );
}

function GnssProjectionDiagram() {
  return (
    <div className="gnss-coordinate-projection-diagram">
      <div>
        <span>曲面上の基準サンプル</span>
        <i aria-hidden="true" />
        <strong>地球は曲面</strong>
      </div>
      <b aria-hidden="true">↓ 投影</b>
      <div>
        <span>平面上の基準サンプル</span>
        <em aria-hidden="true" />
        <strong>狭い範囲を平面で計算</strong>
      </div>
    </div>
  );
}

function GnssPlaneAxisDiagram() {
  return (
    <div
      className="gnss-coordinate-plane-axis-diagram"
      data-testid="gnss-plane-axis-diagram"
    >
      <svg
        aria-labelledby="gnss-plane-axis-title gnss-plane-axis-description"
        role="img"
        viewBox="0 0 540 330"
      >
        <title id="gnss-plane-axis-title">平面直角座標系IX系の原点と軸方向</title>
        <desc id="gnss-plane-axis-description">
          原点から北をXの正、東をYの正とし、南西側の基準サンプルではXとYがともに負になる模式図です。
        </desc>
        <defs>
          <marker
            id="gnss-plane-axis-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
          >
            <path d="M0 0 8 4 0 8Z" />
          </marker>
        </defs>
        <line className="gnss-coordinate-axis" markerEnd="url(#gnss-plane-axis-arrow)" x1="270" x2="270" y1="165" y2="35" />
        <line className="gnss-coordinate-axis" markerEnd="url(#gnss-plane-axis-arrow)" x1="270" x2="475" y1="165" y2="165" />
        <line className="gnss-coordinate-plane-negative-axis" x1="270" x2="270" y1="165" y2="290" />
        <line className="gnss-coordinate-plane-negative-axis" x1="55" x2="270" y1="165" y2="165" />
        <circle className="gnss-coordinate-origin" cx="270" cy="165" r="7" />
        <text className="gnss-coordinate-origin-label" x="282" y="187">原点 X=0、Y=0</text>
        <text className="gnss-coordinate-axis-label" x="284" y="38">北 X+</text>
        <text className="gnss-coordinate-axis-label" x="424" y="151">東 Y+</text>
        <text className="gnss-coordinate-diagram-label" x="284" y="289">南 X−</text>
        <text className="gnss-coordinate-diagram-label" x="62" y="151">西 Y−</text>
        <circle className="gnss-coordinate-point" cx="165" cy="242" r="9" />
        <text className="gnss-coordinate-point-label" x="58" y="268">基準サンプル X&lt;0、Y&lt;0</text>
      </svg>
      <p>IX系原点：緯度36°、経度139°50′</p>
    </div>
  );
}

function GnssEpochDiagram({
  comparisonId,
}: {
  readonly comparisonId: GnssEpochComparisonId;
}) {
  return (
    <div
      className={`gnss-coordinate-epoch-diagram ${comparisonId === "aligned" ? "is-aligned" : ""}`}
    >
      <svg
        aria-labelledby="gnss-epoch-title gnss-epoch-description"
        role="img"
        viewBox="0 0 620 260"
      >
        <title id="gnss-epoch-title">元期と今期の位置を比較する模式図</title>
        <desc id="gnss-epoch-description">
          元期と今期の元データの位置を固定し、操作では採用する座標の考え方だけを切り替えます。
        </desc>
        <line className="gnss-coordinate-epoch-ground" x1="60" x2="560" y1="205" y2="205" />
        <circle className="gnss-coordinate-epoch-original" cx="258" cy="137" r="11" />
        <text x="185" y="125">元期の基準点</text>
        <line className="gnss-coordinate-epoch-shift" x1="270" x2="306" y1="132" y2="116" />
        <circle className="gnss-coordinate-epoch-current" cx="318" cy="112" r="11" />
        <text x="334" y="104">今期の位置</text>
        <text className="gnss-coordinate-epoch-label" x="251" y="235">どちらも同じ地表の基準点T1</text>
      </svg>
    </div>
  );
}

function GnssHeightDiagram({
  referenceId,
}: {
  readonly referenceId: GnssHeightReferenceViewId;
}) {
  return (
    <div className="gnss-coordinate-height-diagram">
      <svg
        aria-labelledby="gnss-height-diagram-title gnss-height-diagram-description"
        role="img"
        viewBox="0 0 660 360"
      >
        <title id="gnss-height-diagram-title">楕円体高・ジオイド高・標高の断面模式図</title>
        <desc id="gnss-height-diagram-description">
          P1の位置、地表、楕円体面、ジオイド面を固定し、高さの矢印と説明だけを切り替えて示します。
        </desc>
        <path className="gnss-coordinate-surface" d="M55 87c135-31 235 28 340-4 75-23 137-14 210 2" />
        <path className="gnss-coordinate-geoid" d="M55 228c115-24 226 23 338-7 83-22 139-8 212 2" />
        <path className="gnss-coordinate-ellipsoid-line" d="M55 291c120-16 225 15 342-5 85-14 137-4 208 2" />
        <circle className="gnss-coordinate-point" cx="428" cy="78" r="9" />
        <text className="gnss-coordinate-point-label" x="442" y="72">P1（位置は固定）</text>
        <text className="gnss-coordinate-surface-label" x="66" y="74">地表</text>
        <text className="gnss-coordinate-geoid-label" x="66" y="216">ジオイド面</text>
        <text className="gnss-coordinate-ellipsoid-label" x="66" y="324">GRS80楕円体面</text>
        <line
          className={referenceId === "ellipsoid" ? "gnss-coordinate-height-measure is-active" : "gnss-coordinate-height-measure"}
          x1="428"
          x2="428"
          y1="88"
          y2="283"
        />
        <text className="gnss-coordinate-height-measure-label" x="441" y="187">h = 63.3853 m</text>
        <line
          className={referenceId === "elevation" ? "gnss-coordinate-elevation-measure is-active" : "gnss-coordinate-elevation-measure"}
          x1="392"
          x2="392"
          y1="88"
          y2="220"
        />
        <text className="gnss-coordinate-height-measure-label" x="276" y="156">H = 26.6800 m</text>
        <line className="gnss-coordinate-geoid-measure" x1="520" x2="520" y1="224" y2="286" />
        <text className="gnss-coordinate-height-measure-label" x="531" y="261">N = 36.7053 m</text>
      </svg>
    </div>
  );
}

function GnssAntennaDiagram() {
  return (
    <div className="gnss-coordinate-antenna-diagram">
      <svg
        aria-labelledby="gnss-antenna-title gnss-antenna-description"
        role="img"
        viewBox="0 0 520 380"
      >
        <title id="gnss-antenna-title">GNSSアンテナと測点P1の単純鉛直モデル</title>
        <desc id="gnss-antenna-description">
          GNSSで求めるアンテナ基準点の位置から、正確に記録したアンテナ高2.000mを用いて地上の測点P1へ対応づけます。
        </desc>
        <line className="gnss-coordinate-antenna-ground" x1="70" x2="450" y1="310" y2="310" />
        <path className="gnss-coordinate-tripod" d="M260 92v202m0-142-90 158m90-158 90 158" />
        <rect className="gnss-coordinate-antenna" height="35" rx="9" width="104" x="208" y="57" />
        <circle className="gnss-coordinate-point" cx="260" cy="310" r="9" />
        <line className="gnss-coordinate-antenna-measure" x1="388" x2="388" y1="92" y2="310" />
        <text className="gnss-coordinate-antenna-value" x="400" y="205">
          アンテナ高 2.000 m
        </text>
        <text className="gnss-coordinate-antenna-label" x="214" y="43">GNSSアンテナ</text>
        <text className="gnss-coordinate-antenna-label" x="281" y="341">P1 測量点</text>
      </svg>
    </div>
  );
}

function GnssCoordinateHeightLesson({
  completedLessonCount,
  isUnderstood,
  onToggleUnderstood,
  totalLessonCount,
}: GnssCoordinateHeightLessonProps) {
  const [earthPositionPresetId, setEarthPositionPresetId] =
    useState<GnssEarthPositionPresetId>("japan");
  const [coordinateRepresentationId, setCoordinateRepresentationId] =
    useState<GnssCoordinateRepresentationId>("earth-centered");
  const [planeSystemViewId, setPlaneSystemViewId] =
    useState<GnssPlaneSystemViewId>("zone-9");
  const [isDatumRevealed, setIsDatumRevealed] = useState(false);
  const [epochComparisonId, setEpochComparisonId] =
    useState<GnssEpochComparisonId>("unaligned");
  const [heightReferenceViewId, setHeightReferenceViewId] =
    useState<GnssHeightReferenceViewId>("ellipsoid");
  const [heightConversionStateId, setHeightConversionStateId] =
    useState<GnssHeightConversionStateId>("unapplied");
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});

  const earthPositionPreset =
    getGnssEarthPositionPreset(earthPositionPresetId) ??
    gnssEarthPositionPresets[0];
  const calculatedElevation =
    calculateGnssElevation(
      gnssCoordinateHeightSampleG0.height.ellipsoidHeight,
      gnssCoordinateHeightSampleG0.height.geoidHeight,
      gnssCoordinateHeightSampleG0.height.heightReferenceConversion,
    ) ?? gnssCoordinateHeightSampleG0.height.elevation;
  const progressPercent = Math.round(
    (completedLessonCount / totalLessonCount) * 100,
  );
  const selectQuizOption = (questionId: string, optionId: string): void => {
    setQuizAnswerStates((current) => ({
      ...current,
      [questionId]: {
        selectedOptionId: optionId,
        isAnswered: false,
      },
    }));
  };

  const submitQuizAnswer = (questionId: string): void => {
    const answerState = quizAnswerStates[questionId];

    if (
      !answerState ||
      evaluateGnssCoordinateHeightQuizAnswer(
        questionId,
        answerState.selectedOptionId,
      ) === null
    ) {
      return;
    }

    setQuizAnswerStates((current) => ({
      ...current,
      [questionId]: {
        ...answerState,
        isAnswered: true,
      },
    }));
  };

  return (
    <div data-lesson-id={gnssCoordinateHeightLesson.id}>
      <section
        aria-labelledby="gnss-coordinate-height-course-title"
        className="gnss-card gnss-chapter-card"
        data-gnss-coordinate-card="1"
        data-testid="gnss-coordinate-height-intro-card"
        id="gnss-coordinate-height"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 10</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 3</span>
            <h1 id="gnss-coordinate-height-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第3章</p>
            <h2>{gnssCoordinateHeightCards[0].title}</h2>
            <p>{gnssCoordinateHeightLesson.description}</p>
          </div>

          <div className="gnss-chapter-progress">
            <div>
              <span>利用可能な章の進捗</span>
              <strong>
                {completedLessonCount} / {totalLessonCount} 章
              </strong>
            </div>
            <div
              aria-label={`GNSS教材の進捗 ${progressPercent}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progressPercent}
              className="gnss-progress-track"
              role="progressbar"
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <button
              aria-pressed={isUnderstood}
              onClick={onToggleUnderstood}
              type="button"
            >
              {isUnderstood ? "理解済み（解除する）" : "この章を理解できた"}
            </button>
          </div>
        </div>

        <div className="gnss-chapter-metadata">
          <div className="gnss-goal-panel">
            <span>到達目標</span>
            <strong>{gnssCoordinateHeightLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>用語</h3>
            <div className="gnss-term-list">
              {gnssCoordinateHeightLesson.terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>混同しないこと</h3>
            <ul>
              {gnssCoordinateHeightLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gnss-coordinate-intro-message">
          <p>
            第2章では、受信機が衛星の信号を観測して3次元位置を計算することを学びました。では、その位置は最初から「第IX系 X=-37928 m、Y=-8328 m」のような平面直角座標なのでしょうか？
          </p>
          <blockquote>
            3次元位置を用途に合う座標と高さで表し、基準を確認して測量成果へつなげます。
          </blockquote>
        </div>

        <ol
          aria-label="GNSS観測から測量成果までの流れ"
          className="gnss-coordinate-concept-flow"
        >
          {gnssCoordinateHeightConceptFlow.map((step, index) => (
            <li key={step}>
              <span>{step}</span>
              {index < gnssCoordinateHeightConceptFlow.length - 1 ? (
                <b aria-hidden="true">↓</b>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="gnss-earth-centered-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="2"
        data-testid="gnss-earth-centered-card"
      >
        <GnssCardHeading
          description="地球中心から見た3軸の数値で、地球上の位置を表します。"
          index={2}
          label="地心直交座標"
          title={gnssCoordinateHeightCards[1].title}
          titleId="gnss-earth-centered-card-title"
        />

        <div
          aria-label="地球上の模式位置"
          className="gnss-segmented-control gnss-coordinate-three-selector"
          data-testid="gnss-earth-position-selector"
        >
          {gnssEarthPositionPresets.map((preset) => (
            <button
              aria-pressed={earthPositionPresetId === preset.id}
              data-testid={`gnss-earth-position-${preset.id}`}
              key={preset.id}
              onClick={() => setEarthPositionPresetId(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="gnss-coordinate-two-column">
          <GnssEarthCenteredDiagram
            pointLabel={earthPositionPreset.label}
            pointX={earthPositionPreset.diagramX}
            pointY={earthPositionPreset.diagramY}
          />
          <div className="gnss-coordinate-value-panel" aria-live="polite">
            <span>{earthPositionPreset.label}</span>
            <strong className="gnss-coordinate-location-hint">
              {earthPositionPreset.locationHint}
            </strong>
            <div className="gnss-coordinate-main-values">
              <div><small>Xc</small><strong>{formatEarthKilometers(earthPositionPreset.coordinate.xc)}</strong></div>
              <div><small>Yc</small><strong>{formatEarthKilometers(earthPositionPreset.coordinate.yc)}</strong></div>
              <div><small>Zc</small><strong>{formatEarthKilometers(earthPositionPreset.coordinate.zc)}</strong></div>
            </div>
            <dl>
              <div><dt>Xc</dt><dd>{formatMeters(earthPositionPreset.coordinate.xc, 3)}</dd></div>
              <div><dt>Yc</dt><dd>{formatMeters(earthPositionPreset.coordinate.yc, 3)}</dd></div>
              <div><dt>Zc</dt><dd>{formatMeters(earthPositionPreset.coordinate.zc, 3)}</dd></div>
            </dl>
            <p className="gnss-coordinate-source-label">
              {earthPositionPreset.id === "japan" ? "教材派生値" : "模式値"}
            </p>
            <p>
              GRS80：長半径 a = {GRS80_SEMI_MAJOR_AXIS_METERS.toLocaleString("ja-JP")} m、1 / f = {GRS80_INVERSE_FLATTENING}
            </p>
            <p>{gnssEarthCenteredExplanation.origin}</p>
            <p>{gnssEarthCenteredExplanation.zPositiveDirection}</p>
          </div>
        </div>
        <p className="gnss-figure-note">※{gnssEarthCenteredExplanation.notation}</p>
        <blockquote className="gnss-important-message">
          地心直交座標Xc・Yc・Zcと、日本の平面直角座標X・Yは別の座標です。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-geodetic-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="3"
        data-testid="gnss-geodetic-card"
      >
        <GnssCardHeading
          description="日本付近の基準サンプルを動かさず、同じ3次元位置の数値表現だけを切り替えます。"
          index={3}
          label="同じ位置の別表現"
          title={gnssCoordinateHeightCards[2].title}
          titleId="gnss-geodetic-card-title"
        />

        <div
          aria-label="日本付近の基準サンプルの座標表現"
          className="gnss-segmented-control gnss-coordinate-two-selector"
          data-testid="gnss-coordinate-representation-selector"
        >
          <button
            aria-pressed={coordinateRepresentationId === "earth-centered"}
            data-testid="gnss-representation-earth-centered"
            onClick={() => setCoordinateRepresentationId("earth-centered")}
            type="button"
          >
            地心直交座標 Xc・Yc・Zc
          </button>
          <button
            aria-pressed={coordinateRepresentationId === "geodetic"}
            data-testid="gnss-representation-geodetic"
            onClick={() => setCoordinateRepresentationId("geodetic")}
            type="button"
          >
            緯度・経度・楕円体高
          </button>
        </div>

        <div className="gnss-coordinate-two-column">
          <GnssGeodeticDiagram />
          <div className="gnss-coordinate-representation-panel" aria-live="polite">
            <span>{gnssCoordinateHeightSampleG0.name}</span>
            {coordinateRepresentationId === "earth-centered" ? (
              <dl data-testid="gnss-representation-earth-centered-values">
                <div><dt>Xc</dt><dd>{formatMeters(gnssCoordinateHeightSampleG0.earthCenteredCoordinate.xc, 3)}</dd></div>
                <div><dt>Yc</dt><dd>{formatMeters(gnssCoordinateHeightSampleG0.earthCenteredCoordinate.yc, 3)}</dd></div>
                <div><dt>Zc</dt><dd>{formatMeters(gnssCoordinateHeightSampleG0.earthCenteredCoordinate.zc, 3)}</dd></div>
              </dl>
            ) : (
              <dl data-testid="gnss-representation-geodetic-values">
                <div><dt>緯度</dt><dd>{gnssCoordinateHeightSampleG0.latitude.dms}</dd></div>
                <div><dt>経度</dt><dd>{gnssCoordinateHeightSampleG0.longitude.dms}</dd></div>
                <div><dt>楕円体高</dt><dd>{formatMeters(gnssCoordinateHeightSampleG0.height.ellipsoidHeight)}</dd></div>
              </dl>
            )}
            <p className="gnss-coordinate-source-label">
              水平位置：公式公表値 ／ 高さ：教材値 ／ Xc・Yc・Zc：教材派生値
            </p>
          </div>
        </div>
        <p className="gnss-key-message">
          数値の表し方が変わっただけで、日本付近の基準サンプルが別の地点へ移動したわけではありません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-plane-coordinate-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="4"
        data-testid="gnss-plane-coordinate-card"
      >
        <GnssCardHeading
          description="曲面の緯度・経度を、地域に合う平面直角座標へ投影します。"
          index={4}
          label="平面への投影"
          title={gnssCoordinateHeightCards[3].title}
          titleId="gnss-plane-coordinate-card-title"
        />

        <p className="gnss-coordinate-question">
          緯度・経度が分かっているのに、なぜ測量ではX・Yを使うのでしょうか？
        </p>
        <div className="gnss-coordinate-two-column">
          <GnssProjectionDiagram />
          <div className="gnss-coordinate-projection-flow">
            <span>地球は曲面</span><b>↓</b>
            <span>狭い範囲では平面で扱うと計算しやすい</span><b>↓</b>
            <span>平面へ投影</span><b>↓</b>
            <span>平面直角座標 X・Y</span>
          </div>
        </div>

        <div className="gnss-coordinate-plane-axis-layout">
          <GnssPlaneAxisDiagram />
          <div className="gnss-coordinate-plane-axis-explanation">
            <p>{gnssPlaneCoordinateExplanation.origin}</p>
            <p>{gnssPlaneCoordinateExplanation.xAxis}</p>
            <p>{gnssPlaneCoordinateExplanation.yAxis}</p>
            <strong>{gnssPlaneCoordinateExplanation.sample}</strong>
          </div>
        </div>

        <div
          aria-label="平面直角座標系の表示"
          className="gnss-segmented-control gnss-coordinate-two-selector"
          data-testid="gnss-plane-system-selector"
        >
          <button
            aria-pressed={planeSystemViewId === "zone-9"}
            data-testid="gnss-plane-system-zone-9"
            onClick={() => setPlaneSystemViewId("zone-9")}
            type="button"
          >
            正しい系：第IX系
          </button>
          <button
            aria-pressed={planeSystemViewId === "other-zone"}
            data-testid="gnss-plane-system-other-zone"
            onClick={() => setPlaneSystemViewId("other-zone")}
            type="button"
          >
            別の系：第VIII系（概念）
          </button>
        </div>

        <div className="gnss-coordinate-plane-result" aria-live="polite">
          <div>
            <span>緯度・経度</span>
            <strong>{gnssCoordinateHeightSampleG0.latitude.dms}</strong>
            <strong>{gnssCoordinateHeightSampleG0.longitude.dms}</strong>
            <small>公式公表値</small>
          </div>
          <b aria-hidden="true">→</b>
          {planeSystemViewId === "zone-9" ? (
            <div data-testid="gnss-plane-zone-9-result">
              <span>平面直角座標 第IX系</span>
              <strong>X = {formatMeters(gnssCoordinateHeightSampleG0.planeCoordinate.x)}</strong>
              <strong>Y = {formatMeters(gnssCoordinateHeightSampleG0.planeCoordinate.y)}</strong>
              <small>確認済み換算値 ／ X：北方向が正、Y：東方向が正</small>
            </div>
          ) : (
            <div data-testid="gnss-plane-other-zone-result">
              <span>平面直角座標 第VIII系</span>
              <strong>同じ基準サンプルでもX・Yは変化</strong>
              <small>系を変えると原点・投影条件が変わるためX・Yが変化します。未確認の具体値は表示しません。</small>
            </div>
          )}
        </div>
        <p className="gnss-figure-note">
          第IX系原点：{gnssCoordinateHeightSampleG0.planeCoordinate.originLatitude}、{gnssCoordinateHeightSampleG0.planeCoordinate.originLongitude}
        </p>
      </section>

      <section
        aria-labelledby="gnss-datum-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="5"
        data-testid="gnss-datum-card"
      >
        <GnssCardHeading
          description="座標値だけでなく、どの測地系を基準にした座標かを確認します。"
          index={5}
          label="座標の基準"
          title={gnssCoordinateHeightCards[4].title}
          titleId="gnss-datum-card-title"
        />

        <p className="gnss-coordinate-question">
          緯度・経度やX・Yが表示されていれば、それだけで測量成果として十分でしょうか？
        </p>
        <div className="gnss-coordinate-fix-summary">
          <div><span>地点</span><strong>日本付近の基準サンプル</strong></div>
          <div><span>測位状態</span><strong>FIX ✓</strong></div>
          <div><span>測地系</span><strong data-testid="gnss-datum-value">{isDatumRevealed ? "日本測地系2024（JGD2024）" : "？？？"}</strong></div>
        </div>
        <button
          aria-pressed={isDatumRevealed}
          className="gnss-coordinate-primary-button"
          data-testid="gnss-reveal-datum"
          onClick={() => setIsDatumRevealed((current) => !current)}
          type="button"
        >
          {isDatumRevealed ? "測地系を未確認へ戻す" : "測地系を確認する"}
        </button>

        {isDatumRevealed ? (
          <div className="gnss-coordinate-datum-result" data-testid="gnss-datum-result">
            <div className="gnss-coordinate-datum-flow">
              {gnssDatumRelationship.flow.map((item, index) => (
                <div key={item}>
                  <strong>{item}</strong>
                  <span>
                    {index === 0
                      ? gnssDatumRelationship.itrf
                      : index === 1
                        ? gnssDatumRelationship.jgd2024
                        : "国家座標や既知の測量成果と整合させて利用"}
                  </span>
                  {index < gnssDatumRelationship.flow.length - 1 ? <b aria-hidden="true">↓</b> : null}
                </div>
              ))}
            </div>
            <p>{gnssDatumRelationship.grs80}</p>
            <p>{gnssDatumRelationship.conceptNote}</p>
            <p>{gnssDatumRelationship.succession}</p>
          </div>
        ) : null}

        <aside className="gnss-coordinate-wgs-note">
          <h3>WGS84との関係</h3>
          <p>{gnssDatumRelationship.wgs84}</p>
          <strong>WGS84 = JGD2024 と同一視しません。</strong>
        </aside>
        <blockquote className="gnss-important-message">
          座標値だけではなく、「どの測地系を基準にした座標か」を確認する必要があります。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-epoch-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="6"
        data-testid="gnss-epoch-card"
      >
        <GnssCardHeading
          description="公表成果の基準時点と、実際の観測時点を分けて考えます。"
          index={6}
          label="座標の時点"
          title={gnssCoordinateHeightCards[5].title}
          titleId="gnss-epoch-card-title"
        />

        <div className="gnss-coordinate-epoch-definitions">
          <article><span>元期</span><strong>{gnssEpochReference.originalEpochDefinition}</strong></article>
          <article><span>今期</span><strong>{gnssEpochReference.currentEpochDefinition}</strong></article>
        </div>
        <p className="gnss-key-message">どちらも間違いではありません。「いつの位置か」が違います。</p>
        <p className="gnss-coordinate-epoch-caution">{gnssEpochReference.jgd2024Caution}</p>

        <div className="gnss-coordinate-reference-dates">
          <article>
            <span>{gnssEpochReference.horizontalExample.area}</span>
            <strong>{gnssEpochReference.horizontalExample.referenceDate}</strong>
            <small>水平位置成果の基準日の例</small>
          </article>
          <article>
            <span>{gnssEpochReference.elevationExample.area}</span>
            <strong>{gnssEpochReference.elevationExample.referenceDate}</strong>
            <small>標高成果の基準日</small>
          </article>
        </div>

        <div
          aria-label="元期と今期の比較方法"
          className="gnss-segmented-control gnss-coordinate-two-selector"
          data-testid="gnss-epoch-comparison-selector"
        >
          <button
            aria-pressed={epochComparisonId === "unaligned"}
            data-testid="gnss-epoch-unaligned"
            onClick={() => setEpochComparisonId("unaligned")}
            type="button"
          >
            そのまま比較
          </button>
          <button
            aria-pressed={epochComparisonId === "aligned"}
            data-testid="gnss-epoch-aligned"
            onClick={() => setEpochComparisonId("aligned")}
            type="button"
          >
            元期へそろえる
          </button>
        </div>

        <div className="gnss-coordinate-two-column">
          <GnssEpochDiagram comparisonId={epochComparisonId} />
          <div className="gnss-coordinate-t1-panel" data-testid="gnss-t1-values">
            <div><span>{gnssVirtualEpochPointT1.name}の元データ</span><small>{gnssVirtualEpochPointT1.sourceKind}・常に表示</small></div>
            <dl>
              <div><dt>元期 X</dt><dd>{formatMeters(gnssVirtualEpochPointT1.originalEpoch.x, 3)}</dd></div>
              <div><dt>元期 Y</dt><dd>{formatMeters(gnssVirtualEpochPointT1.originalEpoch.y, 3)}</dd></div>
              <div><dt>今期 X</dt><dd>{formatMeters(gnssVirtualEpochPointT1.currentEpoch.x, 3)}</dd></div>
              <div><dt>今期 Y</dt><dd>{formatMeters(gnssVirtualEpochPointT1.currentEpoch.y, 3)}</dd></div>
              <div><dt>ΔX</dt><dd>{formatSignedMeters(gnssVirtualEpochPointT1.difference.x)}</dd></div>
              <div><dt>ΔY</dt><dd>{formatSignedMeters(gnssVirtualEpochPointT1.difference.y)}</dd></div>
            </dl>
            <p>{gnssVirtualEpochPointT1.note}</p>
          </div>
        </div>

        <div
          className="gnss-coordinate-epoch-adopted"
          data-testid="gnss-epoch-adopted-coordinate"
        >
          <div>
            <span>この比較で採用する座標</span>
            <strong>{epochComparisonId === "aligned" ? "元期へそろえた値" : "今期の観測値"}</strong>
          </div>
          <dl>
            <div>
              <dt>採用 X</dt>
              <dd>
                {formatMeters(
                  epochComparisonId === "aligned"
                    ? gnssVirtualEpochPointT1.originalEpoch.x
                    : gnssVirtualEpochPointT1.currentEpoch.x,
                  3,
                )}
              </dd>
            </div>
            <div>
              <dt>採用 Y</dt>
              <dd>
                {formatMeters(
                  epochComparisonId === "aligned"
                    ? gnssVirtualEpochPointT1.originalEpoch.y
                    : gnssVirtualEpochPointT1.currentEpoch.y,
                  3,
                )}
              </dd>
            </div>
          </dl>
          <strong
            className={epochComparisonId === "aligned" ? "is-confirmed" : "is-warning"}
            data-testid="gnss-epoch-status"
          >
            {epochComparisonId === "aligned"
              ? "✓ 国家座標・既知成果と同じ元期で比較"
              : "× 今期の値のままでは元期成果と時点がそろわない"}
          </strong>
        </div>

        <div
          className="gnss-coordinate-epoch-correction"
          data-testid="gnss-epoch-correction-values"
        >
          <article>
            <span>元期 → 今期の実際の移動量</span>
            <strong>
              ΔX {formatSignedMeters(gnssVirtualEpochPointT1.difference.x)} ／ ΔY {formatSignedMeters(gnssVirtualEpochPointT1.difference.y)}
            </strong>
          </article>
          <article>
            <span>今期 → 元期へ戻す補正量</span>
            <strong>
              ΔX {formatSignedMeters(gnssVirtualEpochPointT1.correctionToOriginal.x)} ／ ΔY {formatSignedMeters(gnssVirtualEpochPointT1.correctionToOriginal.y)}
            </strong>
          </article>
        </div>
        <p className="gnss-key-message">{gnssEpochReference.movementAndCorrectionNote}</p>
        <p>{gnssEpochReference.alignmentPurpose}</p>
        <p className="gnss-figure-note">{gnssEpochReference.semiDynamicNote}</p>
        <p className="gnss-figure-note">※{gnssEpochReference.applicabilityNote}</p>
      </section>

      <section
        aria-labelledby="gnss-height-reference-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="7"
        data-testid="gnss-height-reference-card"
      >
        <GnssCardHeading
          description="同じP1の位置と3つの面を固定し、高さを示す矢印と説明だけを切り替えます。"
          index={7}
          label="高さの基準面"
          title={gnssCoordinateHeightCards[6].title}
          titleId="gnss-height-reference-card-title"
        />

        <p className="gnss-coordinate-question">
          GNSSでFIXし、「高さ 63.3853 m」と表示されました。この63.3853 mは、そのまま標高でしょうか？
        </p>
        <div
          aria-label="P1の高さの種類"
          className="gnss-segmented-control gnss-coordinate-two-selector"
          data-testid="gnss-height-reference-selector"
        >
          <button
            aria-pressed={heightReferenceViewId === "ellipsoid"}
            data-testid="gnss-height-reference-ellipsoid"
            onClick={() => setHeightReferenceViewId("ellipsoid")}
            type="button"
          >
            楕円体高
          </button>
          <button
            aria-pressed={heightReferenceViewId === "elevation"}
            data-testid="gnss-height-reference-elevation"
            onClick={() => setHeightReferenceViewId("elevation")}
            type="button"
          >
            標高
          </button>
        </div>

        <div className="gnss-coordinate-two-column">
          <GnssHeightDiagram referenceId={heightReferenceViewId} />
          <div className="gnss-coordinate-height-reference-result" aria-live="polite">
            <span>測点 P1（同じ位置）</span>
            <strong data-testid="gnss-height-reference-value">
              {heightReferenceViewId === "ellipsoid"
                ? `楕円体高 ${formatMeters(gnssCoordinateHeightSampleG0.height.ellipsoidHeight)}`
                : `標高 ${formatMeters(gnssCoordinateHeightSampleG0.height.elevation)}`}
            </strong>
            <p>
              {heightReferenceViewId === "ellipsoid"
                ? gnssHeightReferenceExplanation.ellipsoidHeight
                : gnssHeightReferenceExplanation.elevation}
            </p>
            <small>高さは教材値。P1の位置と基準面は変わりません。</small>
          </div>
        </div>
        <div className="gnss-coordinate-geoid-explanation">
          <h3>ジオイド</h3>
          <p>{gnssHeightReferenceExplanation.geoid}</p>
        </div>
        <blockquote className="gnss-important-message">
          楕円体高と標高は、同じP1までの高さでも基準面が異なります。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-height-conversion-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="8"
        data-testid="gnss-height-conversion-card"
      >
        <GnssCardHeading
          description="日本付近の基準サンプルの教材値で、楕円体高から標高へ換算します。"
          index={8}
          label="ジオイド適用"
          title={gnssCoordinateHeightCards[7].title}
          titleId="gnss-height-conversion-card-title"
        />

        <div
          aria-label="高さ換算の操作"
          className="gnss-segmented-control gnss-coordinate-three-selector"
          data-testid="gnss-height-conversion-selector"
        >
          <button
            aria-pressed={heightConversionStateId === "unapplied"}
            data-testid="gnss-height-conversion-unapplied"
            onClick={() => setHeightConversionStateId("unapplied")}
            type="button"
          >
            適用前
          </button>
          <button
            aria-pressed={heightConversionStateId === "applied"}
            data-testid="gnss-height-conversion-applied"
            onClick={() => setHeightConversionStateId("applied")}
            type="button"
          >
            ジオイド・モデルを適用
          </button>
          <button
            aria-pressed={heightConversionStateId === "misused"}
            data-testid="gnss-height-conversion-misused"
            onClick={() => setHeightConversionStateId("misused")}
            type="button"
          >
            楕円体高を標高として使用
          </button>
        </div>

        <div className="gnss-coordinate-height-calculation" aria-live="polite">
          <div><span>測位状態</span><strong>FIX ✓</strong></div>
          <div><span>楕円体高 h</span><strong>{formatMeters(gnssCoordinateHeightSampleG0.height.ellipsoidHeight)}</strong><small>教材値</small></div>
          {heightConversionStateId === "unapplied" ? (
            <div data-testid="gnss-height-conversion-result"><span>標高 H</span><strong>？？？？ m</strong><small>ジオイド未適用</small></div>
          ) : heightConversionStateId === "applied" ? (
            <>
              <div><span>− ジオイド高 N</span><strong>{formatMeters(gnssCoordinateHeightSampleG0.height.geoidHeight)}</strong><small>{gnssCoordinateHeightSampleG0.height.geoidModel}</small></div>
              <div><span>− 基準面補正量</span><strong>{formatMeters(gnssCoordinateHeightSampleG0.height.heightReferenceConversion)}</strong><small>この教材条件では0</small></div>
              <div className="is-result" data-testid="gnss-height-conversion-result"><span>標高 H</span><strong>{formatMeters(calculatedElevation)}</strong><small>H = h - N</small></div>
            </>
          ) : (
            <div className="is-error" data-testid="gnss-height-conversion-result">
              <span>高さの種類 ×</span>
              <strong>標高として {formatMeters(gnssCoordinateHeightSampleG0.height.ellipsoidHeight)}</strong>
              <small>楕円体高を標高として使用しています。差：{formatMeters(gnssCoordinateHeightSampleG0.height.geoidHeight)}</small>
            </div>
          )}
        </div>
        <p className="gnss-coordinate-formula">26.6800 = 63.3853 − 36.7053</p>
        <div className="gnss-coordinate-geoid-explanation">
          <h3>ジオイド高Nの意味</h3>
          <p>{gnssHeightReferenceExplanation.geoidHeight}</p>
          <p>{gnssHeightReferenceExplanation.islandNote}</p>
        </div>
        <p className="gnss-base-error-note">
          高さは関係を学ぶ教材値であり、日本経緯度原点の公式な高さ成果ではありません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-antenna-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="9"
        data-testid="gnss-antenna-card"
      >
        <GnssCardHeading
          description="第1章の仮想現場P1を使い、アンテナ位置から測点位置へ換算します。"
          index={9}
          label="アンテナ高"
          title={gnssCoordinateHeightCards[8].title}
          titleId="gnss-antenna-card-title"
        />

        <blockquote className="gnss-important-message">
          GNSSで扱うアンテナ側の位置と、成果として欲しい地上の測点位置を結び付けるためにアンテナ高が必要です。
        </blockquote>
        <div
          aria-label="アンテナ基準点から地上の測点P1までの関係"
          className="gnss-coordinate-antenna-flow"
          data-testid="gnss-antenna-static-flow"
        >
          {gnssAntennaPointRelationship.map((step, index) => (
            <div key={step.id}>
              <article>
                <span>{step.note}</span>
                <strong>{step.label}</strong>
              </article>
              {index < gnssAntennaPointRelationship.length - 1 ? (
                <b aria-hidden="true">↓</b>
              ) : null}
            </div>
          ))}
        </div>

        <div className="gnss-coordinate-two-column">
          <GnssAntennaDiagram />
          <div className="gnss-coordinate-antenna-result" data-testid="gnss-antenna-relationship">
            <span>{gnssFieldScenarioP1.sourceKind}：{gnssFieldScenarioP1.newPoint.name}</span>
            <dl>
              <div><dt>アンテナ側の高さ</dt><dd>{formatMeters(gnssAntennaHeightExample.antennaPositionHeight, 3)}</dd></div>
              <div><dt>正しく記録したアンテナ高</dt><dd>{formatMeters(gnssAntennaHeightExample.correctAntennaHeight, 3)}</dd></div>
              <div><dt>地上の測点P1</dt><dd>{formatMeters(gnssAntennaHeightExample.correctPointHeight, 3)}</dd></div>
            </dl>
            <strong className="is-confirmed">✓ アンテナ高は測定方法・値・単位を正確に記録する</strong>
            <p>アンテナ基準点と地上の測点P1を対応づける教材上の単純モデルです。</p>
          </div>
        </div>

        <div className="gnss-coordinate-station-comparison">
          <article>
            <span>移動局</span>
            <strong>P1 → アンテナ高 2.000 m → 移動局アンテナ位置</strong>
          </article>
          <article>
            <span>基準局</span>
            <strong>既知点A → アンテナ高 1.800 m → 基準局アンテナ位置</strong>
          </article>
        </div>
        <p className="gnss-figure-note">※{gnssAntennaHeightExample.caution}</p>
      </section>

      <section
        aria-labelledby="gnss-final-check-card-title"
        className="gnss-card"
        data-gnss-coordinate-card="10"
        data-testid="gnss-final-check-card"
      >
        <GnssCardHeading
          description="新しい理論は加えず、第3章で学んだ成果条件をFIX後に点検します。"
          index={10}
          label="総合点検"
          title={gnssCoordinateHeightCards[9].title}
          titleId="gnss-final-check-card-title"
        />

        <div className="gnss-coordinate-final-banner">
          <div><span>P1 観測完了</span><strong>測位状態：FIX ✓</strong></div>
          <p>FIXしていることと、成果条件が正しいことは別。</p>
        </div>

        <div className="gnss-coordinate-review-table-wrap">
          <table
            className="gnss-coordinate-review-table"
            data-testid="gnss-final-review-table"
          >
            <caption>FIXなのに成果と合わないときの確認項目</caption>
            <thead>
              <tr>
                <th scope="col">確認項目</th>
                <th scope="col">確かめる内容</th>
              </tr>
            </thead>
            <tbody>
              {gnssFinalReviewRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.label}</th>
                  <td>{row.check}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <blockquote className="gnss-important-message">
          FIXはRTKで固定解が得られたことを示す重要な状態です。しかし、測地系・系番号・座標の時点・高さ基準・アンテナ高まで正しいことを保証する表示ではありません。
        </blockquote>

        <div
          aria-labelledby="gnss-coordinate-height-quiz-title"
          className="gnss-quiz-section"
          data-testid="gnss-coordinate-height-quiz-panel"
        >
          <div className="gnss-quiz-heading">
            <span>第3章 確認問題</span>
            <h3 id="gnss-coordinate-height-quiz-title">座標と高さの判断を8問で確認する</h3>
            <p>回答状態はReact状態だけに保持し、ページ再読込み後は初期化します。</p>
          </div>

          <div className="gnss-quiz-list">
            {gnssCoordinateHeightQuizQuestions.map((question, questionIndex) => {
              const answerState = quizAnswerStates[question.id];
              const evaluation = answerState?.isAnswered
                ? evaluateGnssCoordinateHeightQuizAnswer(
                    question.id,
                    answerState.selectedOptionId,
                  )
                : null;
              const correctOptionLetter =
                getGnssCoordinateHeightQuizOptionLetter(
                  question.id,
                  question.correctOptionId,
                );
              const selectedOptionLetter = evaluation
                ? getGnssCoordinateHeightQuizOptionLetter(
                    question.id,
                    evaluation.selectedOptionId,
                  )
                : null;

              return (
                <article
                  className="gnss-quiz-question"
                  data-testid={`gnss-quiz-question-${question.id}`}
                  id={`gnss-quiz-card-${question.id}`}
                  key={question.id}
                >
                  <header>
                    <span>{question.questionType}</span>
                    <strong>問{questionIndex + 1}</strong>
                  </header>
                  <h4>{question.prompt}</h4>
                  <fieldset>
                    <legend>回答を1つ選んでください</legend>
                    {question.options.map((option, optionIndex) => {
                      const optionDomId = `gnss-quiz-option-${question.id}-${option.id}`;

                      return (
                        <label htmlFor={optionDomId} key={option.id}>
                          <input
                            checked={answerState?.selectedOptionId === option.id}
                            id={optionDomId}
                            name={`gnss-quiz-answer-${question.id}`}
                            onChange={() => selectQuizOption(question.id, option.id)}
                            type="radio"
                          />
                          <span className="gnss-option-letter">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span>{option.label}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                  <button
                    disabled={!answerState?.selectedOptionId}
                    onClick={() => submitQuizAnswer(question.id)}
                    type="button"
                  >
                    回答を確認する
                  </button>

                  {evaluation ? (
                    <div
                      className={`gnss-quiz-feedback ${evaluation.isCorrect ? "is-correct" : "is-incorrect"}`}
                      role="status"
                    >
                      <strong>{evaluation.isCorrect ? "正解" : "不正解"}</strong>
                      {correctOptionLetter ? (
                        <p className="gnss-quiz-correct-answer">
                          正解：{correctOptionLetter}
                        </p>
                      ) : null}
                      {!evaluation.isCorrect &&
                      evaluation.selectedAnswerReason &&
                      selectedOptionLetter ? (
                        <section className="gnss-quiz-explanation gnss-quiz-selected-explanation">
                          <h5>{selectedOptionLetter}を選んだ場合の解説</h5>
                          <p>{evaluation.selectedAnswerReason}</p>
                        </section>
                      ) : null}
                      <section className="gnss-quiz-explanation">
                        <h5>解説</h5>
                        <p>{evaluation.correctReason}</p>
                      </section>
                      <p className="gnss-quiz-field-check">
                        <b>現場で確認：</b>
                        {evaluation.fieldCheck}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default GnssCoordinateHeightLesson;
