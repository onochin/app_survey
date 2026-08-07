import { useState } from "react";
import {
  evaluateGnssQuizAnswer,
  fixedGnssScenario,
  getGnssMethod,
  getGnssQuizOptionLetter,
  getGnssWorkflowStep,
  gnssInformationFlowSteps,
  gnssMethods,
  gnssPositioningStates,
  gnssQualityChecks,
  gnssQuizQuestions,
  gnssRepresentativeCase,
  gnssWorkflowSteps,
} from "../data/gnssOverview";
import { gnssOverviewLesson } from "../gnssCourse";
import type {
  GnssMethodId,
  GnssPositioningStateId,
} from "../types";

interface GnssOverviewLessonProps {
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

const circledNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];

function formatMeters(value: number): string {
  return `${value.toFixed(3)} m`;
}

function formatSignedMeters(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(3)} m`;
}

function GnssSiteDiagram({ methodId }: { readonly methodId: GnssMethodId }) {
  const method = getGnssMethod(methodId) ?? gnssMethods[0];
  const isOwnRtk = method.id === "own-rtk";
  const isNetworkRtk = method.id === "network-rtk";

  return (
    <div className="gnss-site-figure">
      <svg
        aria-labelledby="gnss-site-diagram-title gnss-site-diagram-description"
        role="img"
        viewBox="0 0 780 360"
      >
        <title id="gnss-site-diagram-title">
          GNSS衛星、既知点A、基準局、移動局、新点P1の仮想現場図
        </title>
        <desc id="gnss-site-diagram-description">
          選択した測位方式に応じて、情報の送り元と移動局までの経路を示す教材用模式図です。
        </desc>
        <defs>
          <linearGradient id="gnss-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e8f4ff" />
            <stop offset="100%" stopColor="#f8fbfd" />
          </linearGradient>
          <marker
            id="gnss-info-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
          >
            <path d="M0 0 8 4 0 8Z" />
          </marker>
        </defs>

        <rect className="gnss-site-sky" height="298" rx="16" width="760" x="10" y="8" />
        <path className="gnss-site-ground" d="M18 278C155 250 245 286 380 266s248-4 382 12v55H18Z" />

        <g className="gnss-satellite" transform="translate(100 54)">
          <rect height="28" rx="5" width="46" x="-23" y="-14" />
          <path d="M-23-8-53-23v30l30-15ZM23-8 53-23v30L23-8ZM0 14v14" />
          <text y="44">GNSS衛星</text>
        </g>
        <g className="gnss-satellite" transform="translate(355 43)">
          <rect height="28" rx="5" width="46" x="-23" y="-14" />
          <path d="M-23-8-53-23v30l30-15ZM23-8 53-23v30L23-8ZM0 14v14" />
          <text y="44">GNSS衛星</text>
        </g>
        <g
          className={`gnss-satellite ${method.id === "clas" ? "is-source" : ""}`}
          transform="translate(635 54)"
        >
          <rect height="28" rx="5" width="46" x="-23" y="-14" />
          <path d="M-23-8-53-23v30l30-15ZM23-8 53-23v30L23-8ZM0 14v14" />
          <text y="44">{method.id === "clas" ? "みちびき" : "GNSS衛星"}</text>
        </g>

        <path className="gnss-satellite-signal" d="M105 99 153 196M355 88 184 196M355 88 585 197M632 100 616 197" />

        <g className="gnss-known-point" transform="translate(160 280)">
          <path d="M-11 0h22M0-11v22" />
          <circle r="7" />
          <text className="gnss-site-point-name" y="31">A</text>
          <text className="gnss-site-point-role" y="49">既知点</text>
        </g>

        {isOwnRtk ? (
          <g className="gnss-base-station" transform="translate(160 195)">
            <path d="M0 12v68M0 35l-28 45M0 35l28 45" />
            <rect height="22" rx="5" width="52" x="-26" y="-12" />
            <path d="M-15-12V-27h30v15" />
            <text y="-39">Pパッケージ基準局</text>
          </g>
        ) : (
          <text className="gnss-no-field-base" x="160" y="222">
            現場基準局なし
          </text>
        )}

        <g className="gnss-rover" transform="translate(610 199)">
          <path d="M0 5v81M0 45l-23 41M0 45l23 41" />
          <rect height="20" rx="5" width="46" x="-23" y="-15" />
          <path d="M-13-15V-29h26v14" />
          <text y="-41">移動局</text>
        </g>
        <g className="gnss-new-point" transform="translate(610 285)">
          <path d="m0-8 9 16H-9Z" />
          <text className="gnss-site-point-name" y="31">P1</text>
          <text className="gnss-site-point-role" y="49">新点</text>
        </g>

        {isNetworkRtk ? (
          <g className="gnss-network-source" transform="translate(382 128)">
            <rect height="58" rx="12" width="176" x="-88" y="-29" />
            <text y="-4">配信サービス</text>
            <text className="gnss-network-source-detail" y="16">ネットワーク型RTK</text>
          </g>
        ) : null}

        <path
          className="gnss-information-route"
          d={
            isOwnRtk
              ? "M198 219C300 176 456 182 577 225"
              : isNetworkRtk
                ? "M470 139C526 151 566 181 592 219"
                : "M644 103C657 143 649 183 624 221"
          }
          markerEnd="url(#gnss-info-arrow)"
        />
        <text
          className="gnss-information-route-label"
          x={isOwnRtk ? 389 : isNetworkRtk ? 526 : 670}
          y={isOwnRtk ? 180 : isNetworkRtk ? 170 : 164}
        >
          {isOwnRtk
            ? "基準局側の情報"
            : isNetworkRtk
              ? "インターネット"
              : "衛星経由"}
        </text>
      </svg>

      <div className="gnss-site-route-summary" aria-live="polite">
        <div>
          <span>情報の送り元</span>
          <strong>{method.diagramSource}</strong>
        </div>
        <div>
          <span>情報の経路</span>
          <strong>{method.diagramPath}</strong>
        </div>
      </div>
    </div>
  );
}

function GnssOverviewLesson({
  completedLessonCount,
  isUnderstood,
  onToggleUnderstood,
  totalLessonCount,
}: GnssOverviewLessonProps) {
  const [selectedWorkflowStepId, setSelectedWorkflowStepId] = useState<string>(
    gnssWorkflowSteps[0].id,
  );
  const [selectedMethodId, setSelectedMethodId] =
    useState<GnssMethodId>("own-rtk");
  const [informationFlowIndex, setInformationFlowIndex] = useState(0);
  const [positioningStateId, setPositioningStateId] =
    useState<GnssPositioningStateId>("single");
  const [checkedQualityIds, setCheckedQualityIds] = useState<readonly string[]>(
    [],
  );
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});

  const selectedWorkflowStep =
    getGnssWorkflowStep(selectedWorkflowStepId) ?? gnssWorkflowSteps[0];
  const selectedMethod =
    getGnssMethod(selectedMethodId) ?? gnssMethods[0];
  const positioningStateIndex = Math.max(
    0,
    gnssPositioningStates.findIndex(
      (state) => state.id === positioningStateId,
    ),
  );
  const positioningState =
    gnssPositioningStates[positioningStateIndex] ?? gnssPositioningStates[0];
  const informationFlowStep =
    gnssInformationFlowSteps[informationFlowIndex] ??
    gnssInformationFlowSteps[0];
  const isFix = positioningState.id === "fix";
  const areQualityChecksComplete =
    checkedQualityIds.length === gnssQualityChecks.length;
  const progressPercent = Math.round(
    (completedLessonCount / totalLessonCount) * 100,
  );

  const setPositioningStateByIndex = (nextIndex: number): void => {
    const nextState = gnssPositioningStates[nextIndex];

    if (nextState) {
      setPositioningStateId(nextState.id);
    }
  };

  const toggleQualityCheck = (checkId: string): void => {
    setCheckedQualityIds((current) =>
      current.includes(checkId)
        ? current.filter((id) => id !== checkId)
        : [...current, checkId],
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
      evaluateGnssQuizAnswer(questionId, answerState.selectedOptionId) === null
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
    <div data-lesson-id={gnssOverviewLesson.id}>
      <section
        aria-labelledby="gnss-course-title"
        className="gnss-card gnss-chapter-card"
        id="gnss-overview"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 8</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 1</span>
            <h1 id="gnss-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第1章</p>
            <h2>GNSS測量の全体像</h2>
            <p>{gnssOverviewLesson.description}</p>
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
            <strong>{gnssOverviewLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>用語</h3>
            <div className="gnss-term-list">
              {gnssOverviewLesson.terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>現場での注意</h3>
            <ul>
              {gnssOverviewLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="gnss-purpose-title"
        className="gnss-card"
        data-testid="gnss-purpose-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 2 / 8 · 代表ケース</span>
            <h2 id="gnss-purpose-title">何のためにGNSSで測る？</h2>
          </div>
          <p>この章で扱う代表ケースと、P1に必要な成果を確認します。</p>
        </header>

        <div className="gnss-purpose-result">
          <h3>今回の代表ケース</h3>
          <dl>
            <div>
              <dt>対象</dt>
              <dd>{gnssRepresentativeCase.target}</dd>
            </div>
            <div>
              <dt>今回求める点</dt>
              <dd>{gnssRepresentativeCase.targetPoint}</dd>
            </div>
            <div>
              <dt>求める成果</dt>
              <dd>{gnssRepresentativeCase.expectedResult}</dd>
            </div>
          </dl>
        </div>
        <p className="gnss-key-message">
          {gnssRepresentativeCase.practicalExamples}
        </p>
      </section>

      <section
        aria-labelledby="gnss-workflow-title"
        className="gnss-card"
        data-testid="gnss-workflow-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 3 / 8 · 現場の流れ</span>
            <h2 id="gnss-workflow-title">現場全体の流れ</h2>
          </div>
          <p>9工程から選び、行うことと重要事項を追います。</p>
        </header>

        <ol className="gnss-workflow-selector">
          {gnssWorkflowSteps.map((step, index) => (
            <li key={step.id}>
              <button
                aria-current={
                  step.id === selectedWorkflowStep.id ? "step" : undefined
                }
                className={
                  step.id === selectedWorkflowStep.id ? "is-selected" : ""
                }
                data-testid={`gnss-workflow-step-${step.id}`}
                onClick={() => setSelectedWorkflowStepId(step.id)}
                type="button"
              >
                <span aria-hidden="true">{circledNumbers[index]}</span>
                <strong>{step.title}</strong>
              </button>
            </li>
          ))}
        </ol>

        <article className="gnss-workflow-detail" aria-live="polite">
          <span>第{selectedWorkflowStep.number}工程</span>
          <h3>
            {circledNumbers[selectedWorkflowStep.number - 1]} {selectedWorkflowStep.title}
          </h3>
          <div>
            <section>
              <h4>現場で行うこと</h4>
              <p>{selectedWorkflowStep.fieldAction}</p>
            </section>
            <section>
              <h4>この工程で重要なもの</h4>
              <ul>
                {selectedWorkflowStep.importantItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4>後続章で詳しく学ぶ内容</h4>
              <p>{selectedWorkflowStep.laterLesson}</p>
            </section>
          </div>
        </article>
      </section>

      <section
        aria-labelledby="gnss-site-title"
        className="gnss-card"
        data-testid="gnss-site-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 4 / 8 · 模式図</span>
            <h2 id="gnss-site-title">仮想現場</h2>
          </div>
          <p>既知点Aから新点P1へ位置をつなぎます。</p>
        </header>

        <div className="gnss-site-layout">
          <GnssSiteDiagram methodId={selectedMethod.id} />
          <aside className="gnss-equipment-panel">
            <span>自前基準局RTKの具体例</span>
            <h3>Drogger Pパッケージ</h3>
            <strong>{fixedGnssScenario.baseStation.equipment}</strong>
            <p>
              自前基準局RTKを理解するための実機例です。本章はDrogger-GPSの操作マニュアルではありません。
            </p>
            <dl>
              <div>
                <dt>既知点A</dt>
                <dd>
                  X {formatMeters(fixedGnssScenario.knownPoint.x)} ／ Y {formatMeters(fixedGnssScenario.knownPoint.y)}
                </dd>
              </div>
              <div>
                <dt>基準局アンテナ高</dt>
                <dd>{formatMeters(fixedGnssScenario.baseStation.antennaHeight)}</dd>
              </div>
              <div>
                <dt>選択中の方式</dt>
                <dd>{selectedMethod.label}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <p className="gnss-figure-note">
          この図は情報の関係を学ぶ模式図です。実際の電波伝搬や通信量を物理的に再現したものではありません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-information-title"
        className="gnss-card"
        data-testid="gnss-information-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 5 / 8 · 段階操作</span>
            <h2 id="gnss-information-title">情報はどこを流れる？</h2>
          </div>
          <p>「次へ」「戻る」で、情報のつながりを1段階ずつ追います。</p>
        </header>

        <ol className="gnss-information-flow">
          {gnssInformationFlowSteps.map((step, index) => (
            <li
              className={`${index === informationFlowIndex ? "is-current" : ""} ${index < informationFlowIndex ? "is-completed" : ""}`}
              key={step.id}
            >
              <button
                aria-current={index === informationFlowIndex ? "step" : undefined}
                onClick={() => setInformationFlowIndex(index)}
                type="button"
              >
                <span>{index + 1}</span>
                {step.label}
              </button>
              {index < gnssInformationFlowSteps.length - 1 ? (
                <span aria-hidden="true" className="gnss-flow-arrow">↓</span>
              ) : null}
            </li>
          ))}
        </ol>

        <div className="gnss-information-detail" aria-live="polite">
          <span>
            {informationFlowIndex + 1} / {gnssInformationFlowSteps.length}
          </span>
          <h3>{informationFlowStep.label}</h3>
          <p>{informationFlowStep.description}</p>
          <div className="gnss-step-controls">
            <button
              disabled={informationFlowIndex === 0}
              onClick={() =>
                setInformationFlowIndex((current) => Math.max(0, current - 1))
              }
              type="button"
            >
              戻る
            </button>
            <button
              disabled={
                informationFlowIndex === gnssInformationFlowSteps.length - 1
              }
              onClick={() =>
                setInformationFlowIndex((current) =>
                  Math.min(gnssInformationFlowSteps.length - 1, current + 1),
                )
              }
              type="button"
            >
              次へ
            </button>
          </div>
        </div>

        <blockquote className="gnss-important-message">
          衛星からP1の完成したX・Y座標がそのまま送られてくるわけではありません。
        </blockquote>
        <p className="gnss-later-note">
          搬送波位相、RTCM、整数値バイアス、二重差、RINEXの詳しい仕組みは後続章で扱います。
        </p>
      </section>

      <section
        aria-labelledby="gnss-method-title"
        className="gnss-card"
        data-testid="gnss-method-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 6 / 8 · 比較</span>
            <h2 id="gnss-method-title">測り方を変えてみる</h2>
          </div>
          <p>3方式は、情報の送り元と経路が異なります。</p>
        </header>

        <div
          aria-label="GNSS測位方式"
          className="gnss-segmented-control gnss-method-selector"
          data-testid="gnss-method-selector"
        >
          {gnssMethods.map((method) => (
            <button
              aria-pressed={method.id === selectedMethod.id}
              data-method-id={method.id}
              key={method.id}
              onClick={() => setSelectedMethodId(method.id)}
              type="button"
            >
              {method.label}
            </button>
          ))}
        </div>

        <div className="gnss-method-summary" aria-live="polite">
          <div>
            <span>選択中</span>
            <h3>{selectedMethod.label}</h3>
            <p>{selectedMethod.summary}</p>
          </div>
          <p>
            <strong>確認：</strong>
            {selectedMethod.caution}
          </p>
        </div>

        <div className="gnss-table-scroll" tabIndex={0}>
          <table>
            <caption>自前RTK・ネットワーク型RTK・CLASの第1章比較</caption>
            <thead>
              <tr>
                <th scope="col">比較</th>
                {gnssMethods.map((method) => (
                  <th
                    className={method.id === selectedMethod.id ? "is-selected" : ""}
                    key={method.id}
                    scope="col"
                  >
                    {method.shortLabel}
                    {method.id === selectedMethod.id ? <span>選択中</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["現場基準局", "fieldBaseStation"],
                ["情報の主な送り元", "informationSource"],
                ["主な通信経路", "communicationPath"],
                ["新点P1を測る", "canMeasureP1"],
              ].map(([label, property]) => (
                <tr key={property}>
                  <th scope="row">{label}</th>
                  {gnssMethods.map((method) => (
                    <td
                      className={method.id === selectedMethod.id ? "is-selected" : ""}
                      key={method.id}
                    >
                      {method[property as keyof typeof method]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-key-message">
          3方式は同じ仕組みではありません。特にCLASを「ネットワーク型RTKのインターネット無し版」と単純化せず、利用条件を確認します。
        </p>
      </section>

      <section
        aria-labelledby="gnss-observation-title"
        className="gnss-card"
        data-testid="gnss-observation-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 7 / 8 · 手動操作</span>
            <h2 id="gnss-observation-title">P1を観測した</h2>
          </div>
          <p>自前基準局RTKの基本シナリオを、時間ではなく自分の操作で進めます。</p>
        </header>

        <div className="gnss-observation-layout">
          <div>
            <ol className="gnss-positioning-states" aria-label="測位状態">
              {gnssPositioningStates.map((state, index) => (
                <li
                  className={`${state.id === positioningState.id ? "is-current" : ""} ${index < positioningStateIndex ? "is-completed" : ""}`}
                  key={state.id}
                >
                  <button
                    aria-current={
                      state.id === positioningState.id ? "step" : undefined
                    }
                    onClick={() => setPositioningStateByIndex(index)}
                    type="button"
                  >
                    <strong>{state.label}</strong>
                    <span>{state.summary}</span>
                  </button>
                  {index < gnssPositioningStates.length - 1 ? (
                    <span aria-hidden="true">→</span>
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="gnss-positioning-detail" aria-live="polite">
              <span>現在の測位状態</span>
              <strong>{positioningState.label}</strong>
              <p>{positioningState.fieldMeaning}</p>
            </div>

            <div className="gnss-step-controls">
              <button
                disabled={positioningStateIndex === 0}
                onClick={() => setPositioningStateByIndex(0)}
                type="button"
              >
                SINGLEからやり直す
              </button>
              <button
                disabled={
                  positioningStateIndex === gnssPositioningStates.length - 1
                }
                onClick={() =>
                  setPositioningStateByIndex(positioningStateIndex + 1)
                }
                type="button"
              >
                {positioningStateIndex === 0
                  ? "FLOATへ進める"
                  : positioningStateIndex === 1
                    ? "FIXへ進める"
                    : "FIX"}
              </button>
            </div>
            <p className="gnss-figure-note">
              FIXまでの時間は固定していません。実際の到達時間は観測条件などで変わります。
            </p>
          </div>

          <aside className="gnss-fixed-case">
            <span>正しい条件で観測した基準ケース</span>
            <h3>既知点Aから見たP1</h3>
            <dl>
              <div>
                <dt>北方向（ΔX）</dt>
                <dd>{formatSignedMeters(fixedGnssScenario.offsetFromKnownPoint.north)}</dd>
              </div>
              <div>
                <dt>東方向（ΔY）</dt>
                <dd>{formatSignedMeters(fixedGnssScenario.offsetFromKnownPoint.east)}</dd>
              </div>
              <div>
                <dt>高さ</dt>
                <dd>{formatSignedMeters(fixedGnssScenario.offsetFromKnownPoint.height)}</dd>
              </div>
              <div>
                <dt>移動局アンテナ高</dt>
                <dd>{formatMeters(fixedGnssScenario.rover.antennaHeight)}</dd>
              </div>
            </dl>
            <p>Xは北方向、Yは東方向です。</p>
          </aside>
        </div>

        {isFix ? (
          <article
            aria-labelledby="gnss-result-title"
            className="gnss-result-card"
            data-testid="gnss-p1-result"
          >
            <div>
              <span>固定サンプル成果</span>
              <h3 id="gnss-result-title">P1の成果</h3>
            </div>
            <dl>
              <div>
                <dt>点名</dt>
                <dd>{fixedGnssScenario.newPoint.name}</dd>
              </div>
              <div>
                <dt>X（北）</dt>
                <dd>{formatMeters(fixedGnssScenario.newPoint.x)}</dd>
              </div>
              <div>
                <dt>Y（東）</dt>
                <dd>{formatMeters(fixedGnssScenario.newPoint.y)}</dd>
              </div>
              <div>
                <dt>標高</dt>
                <dd>{formatMeters(fixedGnssScenario.newPoint.elevation)}</dd>
              </div>
              <div>
                <dt>測位状態</dt>
                <dd>FIX</dd>
              </div>
              <div>
                <dt>用途</dt>
                <dd>{gnssRepresentativeCase.resultUsageLabel}</dd>
              </div>
            </dl>
            <p>この固定値は実在点の成果ではなく、教材用仮想値です。</p>
          </article>
        ) : (
          <div className="gnss-result-placeholder">
            FIXへ進めると、P1の固定サンプル成果を表示します。
          </div>
        )}
      </section>

      <section
        aria-labelledby="gnss-quality-title"
        className="gnss-card"
        data-testid="gnss-quality-card"
      >
        <header className="gnss-card-heading">
          <div>
            <span>カード 8 / 8 · 品質管理と確認問題</span>
            <h2 id="gnss-quality-title">成果を使う前に確認</h2>
          </div>
          <p>FIX表示の後に、設定・基準・観測記録を点検します。</p>
        </header>

        {isFix ? (
          <div className="gnss-quality-panel">
            <div className="gnss-quality-question">
              <span>現場判断</span>
              <h3>FIXしました。これで終了してよい？</h3>
              <p>次の8項目を、成果と原記録で確認してください。</p>
            </div>

            <div className="gnss-quality-summary">
              <strong>
                {checkedQualityIds.length} / {gnssQualityChecks.length} 項目確認
              </strong>
              <div>
                <button
                  disabled={areQualityChecksComplete}
                  onClick={() =>
                    setCheckedQualityIds(
                      gnssQualityChecks.map((check) => check.id),
                    )
                  }
                  type="button"
                >
                  8項目を一括確認
                </button>
                <button
                  disabled={checkedQualityIds.length === 0}
                  onClick={() => setCheckedQualityIds([])}
                  type="button"
                >
                  確認をリセット
                </button>
              </div>
            </div>

            <div className="gnss-quality-grid">
              {gnssQualityChecks.map((check) => {
                const inputId = `gnss-quality-${check.id}`;
                const isChecked = checkedQualityIds.includes(check.id);

                return (
                  <label
                    className={isChecked ? "is-checked" : ""}
                    htmlFor={inputId}
                    key={check.id}
                  >
                    <input
                      checked={isChecked}
                      id={inputId}
                      onChange={() => toggleQualityCheck(check.id)}
                      type="checkbox"
                    />
                    <span aria-hidden="true">{isChecked ? "✓" : "□"}</span>
                    <span>
                      <strong>{check.label}</strong>
                      <small>{check.reason}</small>
                    </span>
                  </label>
                );
              })}
            </div>

            {areQualityChecksComplete ? (
              <p className="gnss-quality-complete" role="status">
                <strong>P1の成果を使用する準備ができました</strong>
                8項目の確認内容と点検結果を、成果と対応付けて残します。
              </p>
            ) : null}
          </div>
        ) : (
          <div className="gnss-quality-locked">
            <strong>先にカード7で測位状態をFIXまで進めてください。</strong>
            <span>FIX後に8つの品質管理項目を操作できます。</span>
          </div>
        )}

        <blockquote className="gnss-important-message gnss-quality-message">
          FIXしていることと、成果が正しいことは同じではありません。
        </blockquote>
        <p className="gnss-base-error-note">
          基準局座標を誤って設定していてもFIXする場合があり、その場合はP1の成果座標が誤った基準の影響を受けます。
        </p>

        <div
          aria-labelledby="gnss-quiz-title"
          className="gnss-quiz-section"
          data-testid="gnss-quiz-panel"
        >
          <div className="gnss-quiz-heading">
            <span>第1章 確認問題</span>
            <h3 id="gnss-quiz-title">仕組み・品質管理・方式選択を確認する</h3>
            <p>回答状態はこの画面内だけに保持し、ページ再読込み後は初期化します。</p>
          </div>

          <div className="gnss-quiz-list">
            {gnssQuizQuestions.map((question, questionIndex) => {
              const answerState = quizAnswerStates[question.id];
              const evaluation = answerState?.isAnswered
                ? evaluateGnssQuizAnswer(
                    question.id,
                    answerState.selectedOptionId,
                  )
                : null;
              const correctOptionLetter = getGnssQuizOptionLetter(
                question.id,
                question.correctOptionId,
              );
              const selectedOptionLetter = evaluation
                ? getGnssQuizOptionLetter(
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
                            checked={
                              answerState?.selectedOptionId === option.id
                            }
                            id={optionDomId}
                            name={`gnss-quiz-answer-${question.id}`}
                            onChange={() =>
                              selectQuizOption(question.id, option.id)
                            }
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

export default GnssOverviewLesson;
