import { useState } from "react";
import {
  calculateClockOffsetDistanceMeters,
  calculateSignalDistanceKm,
  calculateWavelengthRatio,
  countGnssFrequencies,
  createCarrierPhaseExample,
  evaluateGnssObservationsQuizAnswer,
  getGnssObservationsQuizOptionLetter,
  getGnssSystemDefinition,
  GNSS_CLOCK_OFFSET_EXAMPLE_DISTANCE_METERS,
  GNSS_DEFAULT_TRAVEL_TIME_MS,
  GNSS_FRACTIONAL_PHASE,
  GNSS_GEOMETRIC_DISTANCE_KM,
  GNSS_L1_WAVELENGTH_CM,
  GNSS_MODELED_INTEGER_WAVELENGTHS,
  GNSS_PSEUDORANGE_EXAMPLE_KM,
  GNSS_SIGNAL_SPEED_KM_PER_SECOND,
  gnssFrequencyBands,
  gnssFrequencyCharacteristics,
  gnssFrequencySelections,
  gnssFourSatelliteClarification,
  gnssGlobalSystemDefinitions,
  gnssIntegerWavelengthCandidates,
  gnssIntegerResolutionFlow,
  gnssNavicNote,
  gnssObservationComparisonRows,
  gnssObservationConceptFlow,
  gnssObservationsQuizQuestions,
  gnssPseudorangeInfluences,
  gnssQzssSystemDefinition,
  gnssSatelliteSignalFlow,
  gnssSystemDefinitions,
  gnssSystemStartYearCaution,
  summarizeGnssSystemSelection,
} from "../data/gnssObservations";
import { gnssObservationsLesson } from "../gnssCourse";
import type {
  GnssObservationEnvironmentId,
  GnssObservationKindId,
  GnssObservationWorldId,
  GnssSatelliteGeometryId,
  GnssSystemId,
} from "../types";

interface GnssObservationsLessonProps {
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

const distributedSatellitePositions = [
  [88, 62],
  [205, 42],
  [356, 66],
  [520, 45],
  [650, 82],
  [137, 137],
  [285, 125],
  [440, 137],
  [590, 151],
  [73, 216],
  [196, 207],
  [335, 220],
  [478, 205],
  [630, 230],
  [248, 285],
  [408, 274],
  [555, 291],
  [102, 294],
  [178, 269],
  [324, 312],
  [486, 318],
  [675, 284],
] as const;

const biasedSatellitePositions = [
  [420, 48],
  [505, 42],
  [585, 62],
  [650, 91],
  [455, 112],
  [542, 121],
  [622, 146],
  [485, 174],
  [570, 189],
  [654, 211],
  [432, 231],
  [518, 245],
  [608, 265],
  [472, 287],
  [550, 297],
  [635, 301],
  [686, 178],
  [389, 91],
  [688, 132],
  [602, 327],
  [702, 263],
  [429, 316],
] as const;

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
          カード {index} / 9 · {label}
        </span>
        <h2 id={titleId}>{title}</h2>
      </div>
      <p>{description}</p>
    </header>
  );
}

function formatWholeKilometers(value: number): string {
  return `${Math.round(value).toLocaleString("ja-JP")} km`;
}

function formatCentimeters(value: number): string {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function formatKilometersToThreeDecimals(value: number): string {
  return `${value.toLocaleString("ja-JP", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  })} km`;
}

function GnssSignalDiagram() {
  return (
    <div
      aria-label="GNSS衛星が測位用の信号を継続的に送信し、GNSS受信機が一方向に受信して位置を計算する模式図"
      className="gnss-observations-signal-diagram"
      role="img"
    >
      <div className="gnss-observations-satellite-box">
        <span aria-hidden="true">◈</span>
        <strong>{gnssSatelliteSignalFlow[0]}</strong>
      </div>
      <span aria-hidden="true" className="gnss-observations-down-arrow">
        ↓ {gnssSatelliteSignalFlow[1]}
      </span>
      <div className="gnss-observations-signal-parts">
        <div>
          <strong>コード</strong>
          <span>到達タイミングを観測</span>
        </div>
        <div>
          <strong>搬送波</strong>
          <span>波の位相を観測</span>
        </div>
        <div>
          <strong>軌道・時刻等に関係する情報</strong>
          <span>衛星側の情報を位置計算に利用</span>
        </div>
      </div>
      <span aria-hidden="true" className="gnss-observations-down-arrow">
        ↓ 衛星から受信機への一方向
      </span>
      <div className="gnss-observations-receiver-box">
        <strong>{gnssSatelliteSignalFlow[2]}</strong>
        <span>{gnssSatelliteSignalFlow[3]}</span>
      </div>
    </div>
  );
}

function GnssTravelTimeDiagram({
  travelTimeMilliseconds,
}: {
  readonly travelTimeMilliseconds: number;
}) {
  const travelFraction =
    (travelTimeMilliseconds - 65) / (85 - 65);
  const satelliteX = 365 + travelFraction * 265;

  return (
    <div className="gnss-observations-travel-diagram">
      <svg
        aria-labelledby="gnss-travel-diagram-title gnss-travel-diagram-description"
        role="img"
        viewBox="0 0 740 260"
      >
        <title id="gnss-travel-diagram-title">
          電波の到達時間に応じて衛星との模式的な距離が変わる図
        </title>
        <desc id="gnss-travel-diagram-description">
          到達時間が増えるほど、衛星を受信機から遠く表示する学習用模式図です。
        </desc>
        <defs>
          <marker
            id="gnss-observations-distance-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
          >
            <path d="M0 0 8 4 0 8Z" />
          </marker>
        </defs>
        <rect className="gnss-observations-diagram-sky" height="240" rx="14" width="720" x="10" y="10" />
        <g className="gnss-observations-diagram-receiver" transform="translate(92 170)">
          <rect height="48" rx="8" width="88" x="-44" y="-24" />
          <path d="M0-24V-48M-15-48h30" />
          <text y="45">GNSS受信機</text>
        </g>
        <g
          className="gnss-observations-diagram-satellite"
          transform={`translate(${satelliteX} 78)`}
        >
          <rect height="34" rx="6" width="54" x="-27" y="-17" />
          <path d="M-27-9-64-27v36l37-18ZM27-9 64-27v36L27-9Z" />
          <text y="45">GNSS衛星</text>
        </g>
        <path
          className="gnss-observations-distance-line"
          d={`M138 151L${satelliteX - 36} 98`}
          markerEnd="url(#gnss-observations-distance-arrow)"
        />
        <text
          className="gnss-observations-distance-label"
          x={(138 + satelliteX - 36) / 2}
          y="116"
        >
          {travelTimeMilliseconds} ms
        </text>
      </svg>
      <p>※模式図。実際の距離比率ではありません。</p>
    </div>
  );
}

function GnssCarrierWaveDiagram({
  movementCentimeters,
}: {
  readonly movementCentimeters: number;
}) {
  const ratio =
    calculateWavelengthRatio(movementCentimeters) ?? 0;
  const markerX = 70 + ratio * 580;
  const markerY = 120 - Math.sin(ratio * Math.PI * 2) * 70;

  return (
    <div className="gnss-observations-wave-diagram">
      <svg
        aria-labelledby="gnss-wave-title gnss-wave-description"
        role="img"
        viewBox="0 0 720 245"
      >
        <title id="gnss-wave-title">L1の約19cmを1波長とする波形模式図</title>
        <desc id="gnss-wave-description">
          受信機の模式的な移動量に合わせ、1周期内の現在位置が変化します。
        </desc>
        <line className="gnss-observations-wave-axis" x1="70" x2="650" y1="120" y2="120" />
        <path
          className="gnss-observations-wave-path"
          d="M70 120C142 27 287 27 360 120C432 213 577 213 650 120"
        />
        <line
          className="gnss-observations-wave-marker-line"
          x1={markerX}
          x2={markerX}
          y1="38"
          y2="202"
        />
        <circle
          className="gnss-observations-wave-marker"
          cx={markerX}
          cy={markerY}
          r="8"
        />
        <text x="70" y="225">0.00</text>
        <text textAnchor="middle" x="360" y="225">0.50</text>
        <text textAnchor="end" x="650" y="225">1.00波長</text>
        <text className="gnss-observations-wave-current" textAnchor="middle" x={markerX} y="27">
          現在位置
        </text>
      </svg>
    </div>
  );
}

function GnssMultiSystemSkyDiagram({
  environmentId,
  geometryId,
  selectedSystemIds,
}: {
  readonly environmentId: GnssObservationEnvironmentId;
  readonly geometryId: GnssSatelliteGeometryId;
  readonly selectedSystemIds: readonly GnssSystemId[];
}) {
  const systems = selectedSystemIds
    .map(getGnssSystemDefinition)
    .filter((system) => system !== null);
  const satellites = systems.flatMap((system) =>
    Array.from(
      {
        length:
          environmentId === "open"
            ? system.openSatelliteCount
            : system.obstructedSatelliteCount,
      },
      (_, index) => ({
        key: `${system.id}-${index}`,
        label: `${system.shortLabel}${index + 1}`,
        systemId: system.id,
      }),
    ),
  );
  const positions =
    geometryId === "distributed"
      ? distributedSatellitePositions
      : biasedSatellitePositions;

  return (
    <div className="gnss-observations-sky-diagram">
      <svg
        aria-labelledby="gnss-multi-sky-title gnss-multi-sky-description"
        role="img"
        viewBox="0 0 740 360"
      >
        <title id="gnss-multi-sky-title">
          選択したGNSSと衛星配置、観測環境の教材用模式図
        </title>
        <desc id="gnss-multi-sky-description">
          GNSSを追加すると利用できる衛星候補が増え、山地・森林では一部が遮られる固定教材例です。
        </desc>
        <rect className="gnss-observations-sky-background" height="340" rx="16" width="720" x="10" y="10" />
        <circle className="gnss-observations-sky-horizon" cx="370" cy="184" r="145" />
        <line className="gnss-observations-sky-axis" x1="225" x2="515" y1="184" y2="184" />
        <line className="gnss-observations-sky-axis" x1="370" x2="370" y1="39" y2="329" />
        <text className="gnss-observations-sky-direction" x="370" y="31">北</text>
        <text className="gnss-observations-sky-direction" x="370" y="349">南</text>
        <text className="gnss-observations-sky-direction" x="210" y="188">西</text>
        <text className="gnss-observations-sky-direction" x="530" y="188">東</text>

        {satellites.map((satellite, index) => {
          const position = positions[index % positions.length] ?? [370, 184];

          return (
            <g
              className={`gnss-observations-sky-satellite is-${satellite.systemId}`}
              key={satellite.key}
              transform={`translate(${position[0]} ${position[1]})`}
            >
              <circle r="15" />
              <text dy="4">{satellite.label}</text>
            </g>
          );
        })}

        {satellites.length === 0 ? (
          <text className="gnss-observations-sky-empty" x="370" y="188">
            GNSSを選択してください
          </text>
        ) : null}

        {environmentId === "mountain-forest" ? (
          <g className="gnss-observations-sky-obstruction">
            <path d="M8 322 8 188 105 94 174 185 241 132 310 322Z" />
            <path d="M528 322 575 198 615 241 661 151 731 226 731 322Z" />
            <path d="M64 308v-72m-29 28 29-59 29 59m-43-7 14-29 14 29M675 310v-67m-27 27 27-55 27 55m-40-6 13-27 13 27" />
            <text x="90" y="337">山・樹冠による遮蔽</text>
          </g>
        ) : null}
      </svg>
      <p>教材用の仮想観測時刻・固定衛星数です。リアルタイム値ではありません。</p>
    </div>
  );
}

function GnssObservationsLesson({
  completedLessonCount,
  isUnderstood,
  onToggleUnderstood,
  totalLessonCount,
}: GnssObservationsLessonProps) {
  const [travelTimeMilliseconds, setTravelTimeMilliseconds] = useState(
    GNSS_DEFAULT_TRAVEL_TIME_MS,
  );
  const [observationWorldId, setObservationWorldId] =
    useState<GnssObservationWorldId>("ideal");
  const [clockOffsetMicroseconds, setClockOffsetMicroseconds] = useState(0);
  const [carrierMovementCentimeters, setCarrierMovementCentimeters] =
    useState(5);
  const [integerWavelengths, setIntegerWavelengths] = useState(10);
  const [isIntegerFixed, setIsIntegerFixed] = useState(false);
  const [comparisonObservationKindId, setComparisonObservationKindId] =
    useState<GnssObservationKindId>("code");
  const [comparisonMovementCentimeters, setComparisonMovementCentimeters] =
    useState(5);
  const [hasIonosphereInfluence, setHasIonosphereInfluence] = useState(false);
  const [selectedSystemIds, setSelectedSystemIds] = useState<
    readonly GnssSystemId[]
  >(["gps"]);
  const [environmentId, setEnvironmentId] =
    useState<GnssObservationEnvironmentId>("open");
  const [satelliteGeometryId, setSatelliteGeometryId] =
    useState<GnssSatelliteGeometryId>("biased");
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});

  const distanceKilometers =
    calculateSignalDistanceKm(travelTimeMilliseconds) ?? 0;
  const travelTimeSeconds = travelTimeMilliseconds / 1000;
  const clockOffsetDistanceMeters =
    calculateClockOffsetDistanceMeters(
      observationWorldId === "real" ? clockOffsetMicroseconds : 0,
    ) ?? 0;
  const observedDistanceKilometers =
    GNSS_GEOMETRIC_DISTANCE_KM + clockOffsetDistanceMeters / 1000;
  const carrierWavelengthRatio =
    calculateWavelengthRatio(carrierMovementCentimeters) ?? 0;
  const selectedCarrierPhaseExample =
    createCarrierPhaseExample(integerWavelengths) ?? {
      integerWavelengths: 0,
      fractionalWavelengths: GNSS_FRACTIONAL_PHASE,
      totalWavelengths: GNSS_FRACTIONAL_PHASE,
    };
  const comparisonWavelengthRatio =
    calculateWavelengthRatio(comparisonMovementCentimeters) ?? 0;
  const systemSelectionSummary =
    summarizeGnssSystemSelection(selectedSystemIds, environmentId) ?? {
      systemCount: 0,
      satelliteCount: 0,
      mode: "GNSS未選択" as const,
    };
  const progressPercent = Math.round(
    (completedLessonCount / totalLessonCount) * 100,
  );

  const toggleSystem = (systemId: GnssSystemId): void => {
    setSelectedSystemIds((current) =>
      current.includes(systemId)
        ? current.filter((id) => id !== systemId)
        : [...current, systemId],
    );
  };

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
      evaluateGnssObservationsQuizAnswer(
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
    <div data-lesson-id={gnssObservationsLesson.id}>
      <section
        aria-labelledby="gnss-observations-course-title"
        className="gnss-card gnss-chapter-card"
        data-testid="gnss-observations-intro-card"
        id="gnss-observations"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 9</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 2</span>
            <h1 id="gnss-observations-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第2章</p>
            <h2>GNSSは何を観測しているのか</h2>
            <p>{gnssObservationsLesson.description}</p>
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
            <strong>{gnssObservationsLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>用語</h3>
            <div className="gnss-term-list">
              {gnssObservationsLesson.terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>混同しないこと</h3>
            <ul>
              {gnssObservationsLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gnss-observations-intro-message">
          <p>第1章でP1の位置を求めた受信機は、衛星から何を観測していたのでしょうか。</p>
          <blockquote>
            GNSS受信機は、衛星から自分の座標そのものを受け取っているわけではない。
          </blockquote>
          <p>
            衛星から届く電波を観測し、衛星までの距離に関係する情報を求め、それらを組み合わせて位置を計算します。
          </p>
        </div>

        <ol className="gnss-observations-concept-flow" aria-label="第2章で学ぶ概念の流れ">
          {gnssObservationConceptFlow.map((step, index) => (
            <li key={step}>
              <span>{step}</span>
              {index < gnssObservationConceptFlow.length - 1 ? (
                <b aria-hidden="true">↓</b>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="gnss-observations-signal-title"
        className="gnss-card"
        data-testid="gnss-observations-signal-card"
      >
        <GnssCardHeading
          description="衛星が送る電波と、受信機が行う観測を分けて見ます。"
          index={2}
          label="信号の入口"
          title="衛星から何が届く？"
          titleId="gnss-observations-signal-title"
        />

        <div className="gnss-observations-two-column">
          <GnssSignalDiagram />
          <aside className="gnss-observations-explanation-panel">
            <h3>受信機側で行うこと</h3>
            <ul>
              <li>コードを観測する</li>
              <li>搬送波を観測する</li>
              <li>衛星側の軌道・時刻等に関する情報も利用する</li>
            </ul>
            <p>
              この段階では、信号から得る観測量と位置計算の入口だけを確認します。詳しい計算は次のカードから追います。
            </p>
          </aside>
        </div>
        <div className="gnss-observations-communication-note">
          <h3>衛星と受信機の通信方向</h3>
          <p>
            <strong>
              GNSS衛星は、受信機から「電波を送ってください」という合図を受けて応答しているわけではありません。
            </strong>
          </p>
          <p>
            一般のGNSS測位では、衛星から受信機への一方向の測位信号を受信機が利用します。
          </p>
          <p>
            受信機が合図を送り、返事が戻るまでの往復時間を測っているのではありません。衛星が送った信号の送信時刻と、受信機が受け取った時刻の関係から距離に相当する情報を求めます。
          </p>
        </div>
        <blockquote className="gnss-important-message">
          衛星は「あなたのX座標は○○mです」と送信しているわけではありません。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-observations-travel-title"
        className="gnss-card"
        data-testid="gnss-observations-travel-time-card"
      >
        <GnssCardHeading
          description="まず時計や大気を除いた理想世界で、時間と距離の関係を操作します。"
          index={3}
          label="到達時間"
          title="電波が届くまでの時間から距離を考える"
          titleId="gnss-observations-travel-title"
        />

        <p className="gnss-observations-premise">
          まず、時計のずれや大気の影響がない「理想的な場合」で考えてみます。
        </p>

        <div className="gnss-observations-two-column">
          <div>
            <label className="gnss-observations-range-control">
              <span>
                電波の到達時間
                <strong>{travelTimeMilliseconds} ms</strong>
              </span>
              <input
                aria-label="電波の到達時間"
                data-testid="gnss-travel-time-slider"
                max="85"
                min="65"
                onChange={(event) =>
                  setTravelTimeMilliseconds(Number(event.currentTarget.value))
                }
                step="5"
                type="range"
                value={travelTimeMilliseconds}
              />
              <small>65 ms ～ 85 ms</small>
            </label>
            <div className="gnss-observations-formula" aria-live="polite">
              <span>{travelTimeMilliseconds} ms = {travelTimeSeconds.toFixed(3)} s</span>
              <strong>距離 ≈ 電波の速さ × 到達時間</strong>
              <span>
                ≈ {GNSS_SIGNAL_SPEED_KM_PER_SECOND.toLocaleString("ja-JP")} km/s × {travelTimeSeconds.toFixed(3)} s
              </span>
              <b>≈ {formatWholeKilometers(distanceKilometers)}</b>
            </div>
          </div>
          <GnssTravelTimeDiagram travelTimeMilliseconds={travelTimeMilliseconds} />
        </div>

        <div className="gnss-observations-time-scale">
          <article>
            <span>1 ms = 0.001 s</span>
            <strong>約300 km</strong>
            <p>300,000 km/s × 0.001 s</p>
          </article>
          <article>
            <span>では、時計がわずか1 μsずれていたら？</span>
            <strong>約300 m</strong>
            <p>1 msの1/1000でも、距離換算では大きな差になります。</p>
          </article>
        </div>
        <p className="gnss-key-message">1 msの違い ≈ 300 km</p>

        <div className="gnss-observations-one-satellite">
          <div aria-hidden="true">
            <span>衛星</span>
            <i />
            <b>受信機候補</b>
            <em>受信機候補</em>
          </div>
          <p>
            1機との距離が分かっても、受信機は「その衛星から一定距離にある場所のどこか」までしか絞れません。なぜ4衛星かの基本は次のカードで確認します。
          </p>
        </div>
        <blockquote className="gnss-important-message">
          でも現実には、時計も完全ではないし、電波も大気を通ります。この値は本当に「衛星までの真の距離」なのでしょうか？
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-observations-pseudorange-title"
        className="gnss-card"
        data-testid="gnss-observations-pseudorange-card"
      >
        <GnssCardHeading
          description="理想世界と現実を切り替え、1μsの時計ずれを距離換算します。"
          index={4}
          label="擬似距離"
          title="なぜ「擬似距離」なのか？"
          titleId="gnss-observations-pseudorange-title"
        />

        <div
          aria-label="理想と現実の切り替え"
          className="gnss-segmented-control gnss-observations-world-selector"
        >
          {[
            ["ideal", "理想的な場合"],
            ["real", "現実のGNSS"],
          ].map(([id, label]) => (
            <button
              aria-pressed={observationWorldId === id}
              key={id}
              onClick={() => setObservationWorldId(id as GnssObservationWorldId)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="gnss-observations-clock-layout">
          <div>
            <h3>受信機時計のずれ</h3>
            <div
              aria-label="受信機時計のずれ"
              className="gnss-segmented-control gnss-observations-clock-selector"
            >
              {[0, 1].map((offset) => (
                <button
                  aria-pressed={clockOffsetMicroseconds === offset}
                  key={offset}
                  onClick={() => setClockOffsetMicroseconds(offset)}
                  type="button"
                >
                  {offset} μs
                </button>
              ))}
            </div>
            <p>
              時計ずれは「現実のGNSS」を選んだとき、この教材用単純モデルへ反映します。
            </p>
          </div>

          <dl className="gnss-observations-distance-breakdown" aria-live="polite">
            <div>
              <dt>真の幾何学的距離</dt>
              <dd>{formatKilometersToThreeDecimals(GNSS_GEOMETRIC_DISTANCE_KM)}</dd>
            </div>
            <div>
              <dt>時計ずれに相当する距離</dt>
              <dd>
                約 {clockOffsetDistanceMeters >= 0 ? "+" : ""}
                {(clockOffsetDistanceMeters / 1000).toFixed(3)} km
              </dd>
            </div>
            <div>
              <dt>観測される距離に相当する値</dt>
              <dd>約{formatKilometersToThreeDecimals(observedDistanceKilometers)}</dd>
            </div>
          </dl>
        </div>

        <div
          className="gnss-observations-pseudorange-example"
          data-testid="gnss-pseudorange-fixed-example"
        >
          <h3>1 μsの時計ずれを含む固定教材例</h3>
          <dl>
            <div>
              <dt>真の幾何学的距離</dt>
              <dd>{formatKilometersToThreeDecimals(GNSS_GEOMETRIC_DISTANCE_KM)}</dd>
            </div>
            <div>
              <dt>時計ずれ等の影響に相当する値</dt>
              <dd>
                +{(GNSS_CLOCK_OFFSET_EXAMPLE_DISTANCE_METERS / 1000).toFixed(3)} km
              </dd>
            </div>
            <div>
              <dt>時計ずれ等の影響を含んだ距離相当の観測値</dt>
              <dd>{formatKilometersToThreeDecimals(GNSS_PSEUDORANGE_EXAMPLE_KM)}</dd>
            </div>
          </dl>
          <p>
            この21,000.300 kmのような「影響を含んだ距離相当の観測値全体」が擬似距離です。
          </p>
          <strong>
            擬似距離とは「ずれた分の0.300 km」だけを指す言葉ではありません。
          </strong>
          <p>
            時計ずれや大気などの影響を含んだ、距離に相当する観測値全体を擬似距離と呼びます。
          </p>
        </div>

        <p className="gnss-important-message">
          衛星と受信機の本当の距離そのものが300m伸びたわけではない。
        </p>

        <div className="gnss-observations-reality-panel">
          <h3>
            {observationWorldId === "ideal"
              ? "理想的な場合：距離だけを考える"
              : "現実の観測に影響するもの"}
          </h3>
          {observationWorldId === "ideal" ? (
            <p>
              時計ずれや大気等の影響をいったん除き、電波速度と到達時間から幾何学的距離を考えています。
            </p>
          ) : (
            <div className="gnss-observations-influence-grid">
              {gnssPseudorangeInfluences.map((influence) => (
                <article key={influence.id}>
                  <strong>{influence.label}</strong>
                  <p>{influence.description}</p>
                </article>
              ))}
            </div>
          )}
          <small>
            各影響量は条件で変わるため、このカードでは「常に○m」という固定値を設定していません。
          </small>
        </div>

        <blockquote className="gnss-observations-definition">
          これらの影響を含む「距離のような観測量」が擬似距離であり、真の幾何学的距離そのものとは限らない。
        </blockquote>

        <div className="gnss-observations-unknowns">
          <div>
            <span>X</span>
            <span>Y</span>
            <span>Z</span>
            <span>受信機時計ずれ</span>
          </div>
          <p>
            位置3成分と受信機時計ずれを求める基本的な3次元単独測位では、少なくとも4機の衛星を利用します。
          </p>
        </div>
      </section>

      <section
        aria-labelledby="gnss-observations-carrier-title"
        className="gnss-card"
        data-testid="gnss-observations-carrier-card"
      >
        <GnssCardHeading
          description="L1の約19cmを1波長とする模式図で、搬送波の細かさを見ます。"
          index={5}
          label="搬送波位相"
          title="搬送波位相とは？"
          titleId="gnss-observations-carrier-title"
        />

        <div className="gnss-observations-two-column">
          <div>
            <p className="gnss-observations-definition">
              搬送波は繰り返す波であり、搬送波位相は1周期のどの位置にあるかを表す。
            </p>
            <label className="gnss-observations-range-control">
              <span>
                受信機を模式的に動かす
                <strong>{formatCentimeters(carrierMovementCentimeters)} cm</strong>
              </span>
              <input
                aria-label="搬送波位相での受信機移動量"
                data-testid="gnss-carrier-movement-slider"
                max={GNSS_L1_WAVELENGTH_CM}
                min="0"
                onChange={(event) =>
                  setCarrierMovementCentimeters(Number(event.currentTarget.value))
                }
                step="0.5"
                type="range"
                value={carrierMovementCentimeters}
              />
              <small>0 ～ 約19 cm</small>
            </label>
            <div className="gnss-observations-phase-value" aria-live="polite">
              <span>L1の教材用波長</span>
              <strong>1波長 ≈ 19 cm</strong>
              <b>{carrierWavelengthRatio.toFixed(2)}波長</b>
              <small>1周期 = 360°（角度の暗記は不要です）</small>
            </div>
          </div>
          <GnssCarrierWaveDiagram movementCentimeters={carrierMovementCentimeters} />
        </div>
        <p className="gnss-key-message">
          約19cmという短い波長の、さらに一部分まで細かく観測できる。
        </p>
        <blockquote className="gnss-important-message">
          こんなに細かく観測できるなら、搬送波位相だけで衛星までの距離全体が分かるのでしょうか？
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-observations-ambiguity-title"
        className="gnss-card"
        data-testid="gnss-observations-ambiguity-card"
      >
        <GnssCardHeading
          description="同じ0.35波長でも整数部分が異なる短い模式例を切り替えます。"
          index={6}
          label="整数波長数"
          title="なぜ整数波長数が分からない？"
          titleId="gnss-observations-ambiguity-title"
        />

        <div className="gnss-observations-ambiguity-center" aria-live="polite">
          <span>観測開始時</span>
          <strong>
            {isIntegerFixed
              ? `${selectedCarrierPhaseExample.integerWavelengths}波長 + ${selectedCarrierPhaseExample.fractionalWavelengths.toFixed(2)}波長`
              : `？波長 + ${selectedCarrierPhaseExample.fractionalWavelengths.toFixed(2)}波長`}
          </strong>
          <p>
            0.35という1波長内の細かな位置は観測できます。しかし、衛星との間に整数で何波長あるかは最初から分かりません。
          </p>
        </div>

        <div
          aria-label="整数波長数の模式候補"
          className="gnss-segmented-control gnss-observations-integer-selector"
        >
          {gnssIntegerWavelengthCandidates.map((integerValue) => (
            <button
              aria-pressed={integerWavelengths === integerValue}
              key={integerValue}
              onClick={() => {
                setIntegerWavelengths(integerValue);
                setIsIntegerFixed(false);
              }}
              type="button"
            >
              {integerValue} + 0.35波長
            </button>
          ))}
        </div>

        <div className="gnss-observations-phase-rulers">
          {gnssIntegerWavelengthCandidates.map((integerValue) => (
            <div
              className={integerWavelengths === integerValue ? "is-selected" : ""}
              key={integerValue}
            >
              <span>{integerValue}波長</span>
              <i><b style={{ left: "35%" }} /></i>
              <strong data-testid={`gnss-fractional-phase-${integerValue}`}>0.35波長</strong>
            </div>
          ))}
        </div>

        <div className="gnss-observations-ruler-metaphor">
          <h3>超精密な定規の比喩</h3>
          <p>
            搬送波は非常に細かな目盛を持つ定規のようなもの。ただし、どの目盛から数え始めたのかが分かりません。
          </p>
          <dl>
            <div><dt>衛星まで</dt><dd>約21,000 km</dd></div>
            <div><dt>L1の1波長</dt><dd>約19 cm</dd></div>
          </dl>
          <strong>
            実際には衛星まで約21,000 km、L1波長約19 cmなので、整数波長数は1億程度の桁になります。12は仕組みを理解するための模式値です。
          </strong>
        </div>

        <div className="gnss-observations-ambiguity-term">
          <h3>整数値バイアス（整数アンビギュイティ）</h3>
          <p>この章では「未知の整数波長数に関係する未知量」と理解します。</p>
        </div>

        <p className="gnss-important-message">
          教材の「12波長」は、実際の受信機が最初から知っている値ではありません。
        </p>

        <ol
          aria-label="整数波長数の候補を絞ってFLOATからFIXへ進む流れ"
          className="gnss-observations-ambiguity-resolution-flow"
          data-testid="gnss-ambiguity-resolution-flow"
        >
          {gnssIntegerResolutionFlow.map((step, index) => (
            <li className={step.id === "float" || step.id === "fix" ? "is-state" : ""} key={step.id}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.label}</strong>
                <p>{step.description}</p>
              </div>
              {index < gnssIntegerResolutionFlow.length - 1 ? (
                <b aria-hidden="true">↓</b>
              ) : null}
            </li>
          ))}
        </ol>

        <p className="gnss-observations-definition">
          複数衛星・複数周波数・基準局と移動局の観測などを組み合わせ、観測結果が最も整合する整数値を解析して決定します。
        </p>

        <div className="gnss-observations-four-satellite-note">
          <p>{gnssFourSatelliteClarification.reason}</p>
          <strong>{gnssFourSatelliteClarification.notMeaning}</strong>
        </div>

        <div className="gnss-observations-fix-flow">
          <div>
            <strong>FLOAT</strong>
            <span>整数アンビギュイティを整数としてまだ確定できていない状態</span>
          </div>
          <b aria-hidden="true">↓</b>
          <button
            onClick={() => {
              setIntegerWavelengths(GNSS_MODELED_INTEGER_WAVELENGTHS);
              setIsIntegerFixed(true);
            }}
            type="button"
          >
            観測結果が最も整合する12波長を固定解として採用する
          </button>
          <b aria-hidden="true">↓</b>
          <div className={isIntegerFixed ? "is-fixed" : ""}>
            <strong>FIX</strong>
            <span>整数アンビギュイティを整数値として固定解にできた状態</span>
          </div>
        </div>
        <p className="gnss-figure-note">
          ※実際のRTKでは、12という値をボタン1つで指定するのではありません。この操作は、解析で最も整合する整数値を固定解として採用できた状態の模式例です。
        </p>
        <p className="gnss-observations-fix-monitoring-note">
          FIXは解析終了という意味ではありません。FIX後も観測・監視を継続し、条件悪化や衛星遮蔽等によってFLOATへ戻る場合があります。
        </p>
        <p className="gnss-base-error-note">
          FIXは基準局座標、アンテナ高、座標系、マルチパス等の正しさまで保証するものではありません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-observations-comparison-title"
        className="gnss-card"
        data-testid="gnss-observations-comparison-card"
      >
        <GnssCardHeading
          description="同じ衛星・受信機の移動を、コードと搬送波の見え方で比較します。"
          index={7}
          label="観測量の比較"
          title="擬似距離と搬送波位相を比べる"
          titleId="gnss-observations-comparison-title"
        />

        <div
          aria-label="比較する観測量"
          className="gnss-segmented-control gnss-observations-kind-selector"
        >
          <button
            aria-pressed={comparisonObservationKindId === "code"}
            onClick={() => setComparisonObservationKindId("code")}
            type="button"
          >
            コード（擬似距離）
          </button>
          <button
            aria-pressed={comparisonObservationKindId === "carrier"}
            onClick={() => setComparisonObservationKindId("carrier")}
            type="button"
          >
            搬送波位相
          </button>
        </div>

        <div className="gnss-observations-comparison-lab">
          <label className="gnss-observations-range-control">
            <span>
              同じ受信機を動かす
              <strong>{comparisonMovementCentimeters.toFixed(0)} cm</strong>
            </span>
            <input
              aria-label="擬似距離と搬送波位相比較の受信機移動量"
              data-testid="gnss-comparison-movement-slider"
              max="20"
              min="0"
              onChange={(event) =>
                setComparisonMovementCentimeters(Number(event.currentTarget.value))
              }
              step="1"
              type="range"
              value={comparisonMovementCentimeters}
            />
            <small>0 ～ 約20 cm</small>
          </label>

          <div aria-live="polite">
            <span>選択中：{comparisonObservationKindId === "code" ? "コード（擬似距離）" : "搬送波位相"}</span>
            <h3>
              {comparisonObservationKindId === "code"
                ? "コードの到達タイミングを見る"
                : "波の1周期の中の位置を細かく見る"}
            </h3>
            {comparisonObservationKindId === "code" ? (
              <p>
                受信機は{comparisonMovementCentimeters.toFixed(0)}cm動きました。擬似距離は距離全体を把握しやすい一方、搬送波ほど小さな変化を精密に捉えることを得意としません。
              </p>
            ) : (
              <p>
                L1約19cmに対して約{comparisonWavelengthRatio.toFixed(2)}波長の変化として、1周期内の細かな位置を観測します。
              </p>
            )}
            <div className="gnss-observations-moving-receiver" aria-hidden="true">
              <span>衛星</span>
              <i />
              <b style={{ left: `${Math.min(100, comparisonMovementCentimeters * 5)}%` }}>受信機</b>
            </div>
          </div>
        </div>

        <div className="gnss-table-scroll" tabIndex={0}>
          <table>
            <caption>擬似距離と搬送波位相の役割比較</caption>
            <thead>
              <tr><th scope="col">項目</th><th scope="col">擬似距離</th><th scope="col">搬送波位相</th></tr>
            </thead>
            <tbody>
              {gnssObservationComparisonRows.map((row) => (
                <tr key={row.item}>
                  <th scope="row">{row.item}</th>
                  <td>{row.code}</td>
                  <td>{row.carrier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-key-message">
          擬似距離が不要で搬送波位相だけが正しい、という関係ではありません。両方が役割を持ちます。
        </p>
        <div className="gnss-observations-relative-flow">
          <div><strong>基準局</strong><span>擬似距離</span><span>搬送波位相</span></div>
          <div><strong>移動局</strong><span>擬似距離</span><span>搬送波位相</span></div>
          <b aria-hidden="true">↓</b>
          <div><strong>相対的な解析</strong><span>FLOAT → FIX</span></div>
        </div>
      </section>

      <section
        aria-labelledby="gnss-observations-frequency-title"
        className="gnss-card"
        data-testid="gnss-observations-frequency-card"
      >
        <GnssCardHeading
          description="同じGPS衛星G12から観測する周波数の組合せと役割を整理します。"
          index={8}
          label="複数周波数"
          title="なぜ複数周波数を使う？"
          titleId="gnss-observations-frequency-title"
        />

        <div className="gnss-observations-question-banner">
          <span>問い</span>
          <strong>同じ衛星を観測するなら、L1だけではだめなのでしょうか？</strong>
          <p>1周波でもGNSS測位は可能です。</p>
        </div>

        <div className="gnss-observations-frequency-lab" aria-live="polite">
          <div className="gnss-observations-frequency-satellite">
            <strong>GPS衛星 G12</strong>
            <div>
              {gnssFrequencyBands.map((frequency) => (
                <span className="is-selected" key={frequency.id}>
                  {frequency.label}
                </span>
              ))}
            </div>
            <b aria-hidden="true">↓</b>
            <strong>受信機</strong>
          </div>
          <div className="gnss-observations-frequency-summary">
            <span>複数周波数の意味</span>
            <h3>同じ衛星から異なる周波数を観測</h3>
            <p>
              複数周波数とは、衛星を増やすことではありません。同じ衛星から異なる周波数の信号を観測することです。
            </p>
          </div>
        </div>

        <div
          aria-label="L1・L2・L5の周波数组合せと周波数数"
          className="gnss-observations-frequency-combinations"
          data-testid="gnss-frequency-combinations"
        >
          {gnssFrequencySelections.map((selection) => {
            const selectionFrequencyCount = countGnssFrequencies(
              selection.frequencyIds,
            );

            return (
              <article key={selection.id}>
                <strong>{selection.label}</strong>
                <span>
                  {selection.label} → {selectionFrequencyCount === null
                    ? "確認不可"
                    : `${selectionFrequencyCount}周波`}
                </span>
              </article>
            );
          })}
        </div>

        <div className="gnss-observations-ionosphere-lab">
          <div>
            <h3>電離層の影響</h3>
            <div
              aria-label="電離層の影響"
              className="gnss-segmented-control gnss-observations-ionosphere-selector"
            >
              <button
                aria-pressed={!hasIonosphereInfluence}
                onClick={() => setHasIonosphereInfluence(false)}
                type="button"
              >
                影響なし
              </button>
              <button
                aria-pressed={hasIonosphereInfluence}
                onClick={() => setHasIonosphereInfluence(true)}
                type="button"
              >
                影響あり
              </button>
            </div>
          </div>
          <div className={hasIonosphereInfluence ? "has-influence" : ""} aria-live="polite">
            <span>L1の観測</span><b>＋</b><span>L2またはL5の観測</span>
            <b>↓</b>
            <strong>
              {hasIonosphereInfluence
                ? "周波数ごとの差を利用し、電離層の影響を推定・低減"
                : "電離層の影響は周波数によって異なるため、複数周波数で比較する"}
            </strong>
          </div>
        </div>

        <div className="gnss-observations-frequency-values">
          {gnssFrequencyBands.map((frequency) => (
            <div key={frequency.id}>
              <strong>{frequency.label}</strong>
              <span>{frequency.megahertz.toFixed(2)} MHz</span>
            </div>
          ))}
          <p>数値の暗記は不要です。</p>
        </div>

        <div className="gnss-observations-frequency-characteristics">
          {gnssFrequencyCharacteristics.map((frequency) => (
            <article key={frequency.id}>
              <h3>{frequency.label}</h3>
              <p>{frequency.description}</p>
            </article>
          ))}
        </div>

        <div className="gnss-observations-frequency-caution">
          <p>L1 + L2もL1 + L5も、どちらも2周波観測です。</p>
          <strong>
            L1 + L5だから必ずL1 + L2より高精度になる、という意味ではありません。
          </strong>
        </div>

        <div className="gnss-observations-frequency-observables">
          {gnssFrequencyBands.map((frequency) => (
            <article key={frequency.id}>
              <h3>{frequency.label}</h3>
              <p>コード観測 → 擬似距離</p>
              <p>搬送波観測 → 搬送波位相</p>
            </article>
          ))}
        </div>
        <p className="gnss-important-message">
          L1＝擬似距離、L2＝搬送波位相、という関係ではありません。
        </p>
        <p className="gnss-base-error-note">
          3周波だから2周波より単純に何倍も精度が良くなる、という意味ではありません。搬送波解析等の利点は後続章で扱います。
        </p>
        <aside className="gnss-observations-clas-note">
          <strong>CLASのL6</strong>
          <p>
            みちびきのCLASではL6系の信号を使ってセンチメータ級測位の補強情報を受信します。今回のL1/L2/L5の複数周波数測位信号とは役割が異なります。詳細は第10章「ネットワーク型RTKとCLAS」で扱います。
          </p>
        </aside>
      </section>

      <section
        aria-labelledby="gnss-observations-multi-title"
        className="gnss-card"
        data-testid="gnss-observations-multi-gnss-card"
      >
        <GnssCardHeading
          description="利用する衛星測位システム、観測環境、衛星配置を切り替えます。"
          index={9}
          label="複数GNSSと確認問題"
          title="なぜ複数GNSSを使う？"
          titleId="gnss-observations-multi-title"
        />

        <div className="gnss-observations-question-banner">
          <span>問い</span>
          <strong>GPSだけでも位置は求められるのに、なぜGLONASS・Galileo・BeiDou・QZSSなども一緒に使うのでしょうか？</strong>
          <p>それぞれは別の衛星測位システムです。</p>
        </div>

        <div className="gnss-table-scroll" tabIndex={0}>
          <table data-testid="gnss-global-system-table">
            <caption>主要な全球型衛星測位システム</caption>
            <thead>
              <tr>
                <th scope="col">システム</th>
                <th scope="col">国・地域</th>
                <th scope="col">説明</th>
                <th scope="col">開始年の目安</th>
              </tr>
            </thead>
            <tbody>
              {gnssGlobalSystemDefinitions.map((system) => (
                <tr key={system.id}>
                  <th scope="row">{system.label}</th>
                  <td>{system.countryOrRegion}</td>
                  <td>{system.description}</td>
                  <td>{system.serviceStartLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-figure-note">{gnssSystemStartYearCaution}</p>

        <div className="gnss-observations-regional-systems">
          <article>
            <h3>{gnssQzssSystemDefinition.label}</h3>
            <p>
              {gnssQzssSystemDefinition.description}。{gnssQzssSystemDefinition.serviceStartLabel}にサービス開始。
            </p>
          </article>
          <article>
            <h3>ほかにもある衛星測位システム：NavIC</h3>
            <p>{gnssNavicNote}</p>
          </article>
        </div>

        <div className="gnss-observations-system-controls">
          <fieldset>
            <legend>利用するGNSS</legend>
            {gnssSystemDefinitions.map((system) => (
              <label key={system.id}>
                <input
                  checked={selectedSystemIds.includes(system.id)}
                  onChange={() => toggleSystem(system.id)}
                  type="checkbox"
                />
                <span><strong>{system.label}</strong><small>{system.note}</small></span>
              </label>
            ))}
          </fieldset>

          <div>
            <span>観測環境</span>
            <div
              aria-label="観測環境"
              className="gnss-segmented-control gnss-observations-environment-selector"
            >
              <button
                aria-pressed={environmentId === "open"}
                onClick={() => setEnvironmentId("open")}
                type="button"
              >
                開けた場所
              </button>
              <button
                aria-pressed={environmentId === "mountain-forest"}
                onClick={() => setEnvironmentId("mountain-forest")}
                type="button"
              >
                山地・森林
              </button>
            </div>
            <span>衛星配置</span>
            <div
              aria-label="衛星配置"
              className="gnss-segmented-control gnss-observations-geometry-selector"
            >
              <button
                aria-pressed={satelliteGeometryId === "biased"}
                onClick={() => setSatelliteGeometryId("biased")}
                type="button"
              >
                一方向に偏った衛星配置
              </button>
              <button
                aria-pressed={satelliteGeometryId === "distributed"}
                onClick={() => setSatelliteGeometryId("distributed")}
                type="button"
              >
                空全体へ分散した衛星配置
              </button>
            </div>
          </div>
        </div>

        <div className="gnss-observations-sky-layout">
          <GnssMultiSystemSkyDiagram
            environmentId={environmentId}
            geometryId={satelliteGeometryId}
            selectedSystemIds={selectedSystemIds}
          />
          <aside className="gnss-observations-system-summary" aria-live="polite">
            <span>教材用の現在値</span>
            <h3>{systemSelectionSummary.mode}</h3>
            <dl>
              <div><dt>利用GNSS</dt><dd>{systemSelectionSummary.systemCount}系</dd></div>
              <div><dt>利用可能な衛星候補</dt><dd>{systemSelectionSummary.satelliteCount}機</dd></div>
              <div><dt>観測環境</dt><dd>{environmentId === "open" ? "開けた場所" : "山地・森林"}</dd></div>
              <div><dt>配置</dt><dd>{satelliteGeometryId === "distributed" ? "空全体へ分散" : "一方向に偏る"}</dd></div>
            </dl>
            <p>
              GNSSを追加すると利用できる衛星候補を確保しやすくなります。ただし、衛星数だけでなく衛星配置も重要です。
            </p>
            <small>DOPは衛星配置の良し悪しに関係する指標です。詳しい種類や計算は後続章で扱います。</small>
          </aside>
        </div>

        <p className="gnss-base-error-note">
          マルチGNSSなら山林でも必ずFIXするわけではありません。衛星遮蔽、樹冠、マルチパス、衛星配置等によって条件は変わります。QZSSも常に天頂に衛星が存在するとは限りません。
        </p>

        <div className="gnss-observations-frequency-vs-system">
          <article>
            <span>複数周波数</span>
            <strong>同じ衛星を異なる周波数で観測</strong>
          </article>
          <article>
            <span>複数GNSS</span>
            <strong>異なる衛星測位システムの衛星を利用</strong>
          </article>
        </div>

        <div className="gnss-observations-combination-examples">
          <div><strong>GPSだけ + L1/L2/L5</strong><span>1衛星系 + 3周波</span></div>
          <div><strong>GPS + QZSS + Galileo、各1周波相当</strong><span>マルチGNSS + 1周波</span></div>
          <div><strong>複数GNSS + 複数周波数</strong><span>マルチGNSS + マルチ周波数</span></div>
        </div>

        <div className="gnss-observations-satellite-signal-contrast">
          <article>
            <h3>GPS G12</h3>
            <p>├ L1<br />├ L2<br />└ L5</p>
            <strong>衛星：1機 ／ 複数周波数の信号を追尾</strong>
          </article>
          <article>
            <h3>G03・G12・G24・G31</h3>
            <p>各衛星でL1を追尾</p>
            <strong>衛星：4機 ／ 使用する周波数帯：1種類</strong>
          </article>
        </div>
        <p className="gnss-figure-note">
          衛星系によって信号名称は異なります。すべてを無理にL1/L2/L5へ置き換えず、対応する複数の衛星・信号を受信機が利用すると整理します。
        </p>

        <div
          aria-labelledby="gnss-observations-quiz-title"
          className="gnss-quiz-section"
          data-testid="gnss-observations-quiz-panel"
        >
          <div className="gnss-quiz-heading">
            <span>第2章 確認問題</span>
            <h3 id="gnss-observations-quiz-title">観測量・周波数・衛星系を7問で整理する</h3>
            <p>回答状態はReact状態だけに保持し、ページ再読込み後は初期化します。</p>
          </div>

          <div className="gnss-quiz-list">
            {gnssObservationsQuizQuestions.map((question, questionIndex) => {
              const answerState = quizAnswerStates[question.id];
              const evaluation = answerState?.isAnswered
                ? evaluateGnssObservationsQuizAnswer(
                    question.id,
                    answerState.selectedOptionId,
                  )
                : null;
              const correctOptionLetter =
                getGnssObservationsQuizOptionLetter(
                  question.id,
                  question.correctOptionId,
                );
              const selectedOptionLetter = evaluation
                ? getGnssObservationsQuizOptionLetter(
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

export default GnssObservationsLesson;
