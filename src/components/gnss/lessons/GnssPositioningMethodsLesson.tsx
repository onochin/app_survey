import { useState } from "react";
import {
  calculateOwnBaseRtkPointX,
  evaluateGnssPositioningConditions,
  evaluateGnssPositioningMethodsQuizAnswer,
  getGnssPositioningMethodsQuizOptionLetter,
  getGnssPositioningPreset,
  getOwnBaseRtkCoordinateCase,
  gnssClasFlow,
  gnssConditionDefinitions,
  gnssNetworkAndClasSignalComparison,
  gnssNetworkRtkFlow,
  gnssOwnAndNetworkRtkComparison,
  gnssOwnBaseRtkFlow,
  gnssPositioningInformationGroups,
  gnssPositioningMethodCards,
  gnssPositioningMethods,
  gnssPositioningMethodsQuizQuestions,
  gnssPositioningPresets,
  gnssPositioningSelectionFlow,
  gnssSingleAndDgnssExplanation,
  isGnssPositioningConditions,
  ownBaseRtkCoordinateExample,
} from "../data/gnssPositioningMethods";
import type {
  GnssPositioningConditions,
  OwnBaseRtkCoordinateCaseId,
} from "../data/gnssPositioningMethods";
import { gnssPositioningMethodsLesson } from "../gnssCourse";

interface GnssPositioningMethodsLessonProps {
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
  readonly description: string;
  readonly index: number;
  readonly label: string;
  readonly title: string;
  readonly titleId: string;
}

function GnssCardHeading({
  description,
  index,
  label,
  title,
  titleId,
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

function GnssFlowDiagram({
  ariaLabel,
  steps,
}: {
  readonly ariaLabel: string;
  readonly steps: readonly string[];
}) {
  return (
    <ol aria-label={ariaLabel} className="gnss-positioning-flow-diagram">
      {steps.map((step, index) => (
        <li key={`${step}-${index}`}>
          <span>{step}</span>
          {index < steps.length - 1 ? <b aria-hidden="true">↓</b> : null}
        </li>
      ))}
    </ol>
  );
}

function GnssPositioningMethodsLesson({
  completedLessonCount,
  isUnderstood,
  onToggleUnderstood,
  totalLessonCount,
}: GnssPositioningMethodsLessonProps) {
  const [coordinateCaseId, setCoordinateCaseId] =
    useState<OwnBaseRtkCoordinateCaseId>("correct");
  const initialPreset = gnssPositioningPresets[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialPreset.id,
  );
  const [conditions, setConditions] = useState<GnssPositioningConditions>({
    ...initialPreset.conditions,
  });
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});

  const coordinateCase =
    getOwnBaseRtkCoordinateCase(coordinateCaseId) ??
    ownBaseRtkCoordinateExample.cases[0];
  const calculatedP1X =
    calculateOwnBaseRtkPointX(
      coordinateCase.baseX,
      ownBaseRtkCoordinateExample.relativeX,
    ) ?? coordinateCase.p1X;
  const correctP1X = ownBaseRtkCoordinateExample.cases[0].p1X;
  const p1Difference = calculatedP1X - correctP1X;
  const positioningEvaluation = evaluateGnssPositioningConditions(conditions);
  const selectedPreset = getGnssPositioningPreset(selectedPresetId);
  const progressPercent = Math.round(
    (completedLessonCount / totalLessonCount) * 100,
  );

  const selectPreset = (presetId: string): void => {
    const preset = getGnssPositioningPreset(presetId);

    if (!preset) {
      return;
    }

    setSelectedPresetId(preset.id);
    setConditions({ ...preset.conditions });
  };

  const updateCondition = (
    key: keyof GnssPositioningConditions,
    value: string,
  ): void => {
    setConditions((current) => {
      const nextConditions = { ...current, [key]: value };

      return isGnssPositioningConditions(nextConditions)
        ? nextConditions
        : current;
    });
    setSelectedPresetId("");
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
      evaluateGnssPositioningMethodsQuizAnswer(
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
    <div data-lesson-id={gnssPositioningMethodsLesson.id}>
      <section
        aria-labelledby="gnss-positioning-methods-course-title"
        className="gnss-card gnss-chapter-card"
        data-gnss-positioning-card="1"
        data-testid="gnss-positioning-methods-intro-card"
        id="gnss-positioning-methods"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 9</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 4</span>
            <h1 id="gnss-positioning-methods-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第4章</p>
            <h2>{gnssPositioningMethodCards[0].title}</h2>
            <p>{gnssPositioningMethodsLesson.description}</p>
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
            <strong>{gnssPositioningMethodsLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>扱う6方式</h3>
            <div className="gnss-term-list">
              {gnssPositioningMethods.map((method) => (
                <span key={method.id}>{method.label}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>混同しないこと</h3>
            <ul>
              {gnssPositioningMethodsLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gnss-positioning-opening-question">
          <span>最初の問い</span>
          <strong>同じGNSSなのに、なぜいろいろな測位方式がある？</strong>
          <p>
            GPS / QZSS / Galileo等の衛星測位システムと、RTK / CLAS /
            スタティック等の測位方式は別の分類です。
          </p>
        </div>

        <div
          aria-label="GNSS測位6方式の入口"
          className="gnss-positioning-method-intro-grid"
        >
          {gnssPositioningMethods.map((method) => (
            <article key={method.id}>
              <strong>{method.label}</strong>
              <p>→ {method.shortDescription}</p>
            </article>
          ))}
        </div>
        <blockquote className="gnss-important-message">
          測位方式が違っても、GNSS衛星そのものが別物になるわけではありません。基準となる情報の得方、解析方法、情報経路、結果を得るタイミングなどが異なります。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-positioning-information-title"
        className="gnss-card"
        data-gnss-positioning-card="2"
        data-testid="gnss-positioning-information-card"
      >
        <GnssCardHeading
          description="6方式を、位置計算へ持ち込む情報の組合せから大きく3つに整理します。"
          index={2}
          label="情報の組合せ"
          title={gnssPositioningMethodCards[1].title}
          titleId="gnss-positioning-information-title"
        />
        <div className="gnss-positioning-source-grid">
          <article>
            <span>{gnssPositioningInformationGroups[0].categoryLabel}</span>
            <h3>代表：{gnssPositioningInformationGroups[0].representative}</h3>
            <p className="gnss-positioning-accuracy-trend">
              <span>精度の傾向</span>
              <strong>{gnssPositioningInformationGroups[0].precisionTrend}</strong>
            </p>
            <GnssFlowDiagram
              ariaLabel="単独測位の情報経路"
              steps={["GNSS衛星", "移動局P1"]}
            />
            <b aria-hidden="true" className="gnss-positioning-result-arrow">↓</b>
            <div
              className="gnss-positioning-source-result"
              data-testid="gnss-positioning-source-result-own-observation"
            >
              {gnssPositioningInformationGroups[0].resultLabel}
            </div>
          </article>
          <article>
            <span>{gnssPositioningInformationGroups[1].categoryLabel}</span>
            <h3>代表：{gnssPositioningInformationGroups[1].representative}</h3>
            <p className="gnss-positioning-accuracy-trend">
              <span>精度の傾向</span>
              <strong>{gnssPositioningInformationGroups[1].precisionTrend}</strong>
            </p>
            <div className="gnss-positioning-plus-flow">
              <span>P1のGNSS観測</span>
              <b>＋</b>
              <span>基準・補正・補強に関する情報</span>
            </div>
            <b aria-hidden="true" className="gnss-positioning-result-arrow">↓</b>
            <div
              className="gnss-positioning-source-result"
              data-testid="gnss-positioning-source-result-external-information"
            >
              {gnssPositioningInformationGroups[1].resultLabel}
            </div>
            <p>
              4方式は同じ仕組みではありません。何が来るか、どこから来るか、どう利用するかが異なります。
            </p>
          </article>
          <article>
            <span>{gnssPositioningInformationGroups[2].categoryLabel}</span>
            <h3>代表：{gnssPositioningInformationGroups[2].representative}</h3>
            <p className="gnss-positioning-accuracy-trend">
              <span>精度の傾向</span>
              <strong>{gnssPositioningInformationGroups[2].precisionTrend}</strong>
            </p>
            <div className="gnss-positioning-static-mini-flow">
              <span>基準側の<br />観測データ</span>
              <b>＋</b>
              <span>P1側の<br />観測データ</span>
            </div>
            <b aria-hidden="true" className="gnss-positioning-result-arrow">↓</b>
            <div className="gnss-positioning-process-box">
              {gnssPositioningInformationGroups[2].processLabel}
            </div>
            <b aria-hidden="true" className="gnss-positioning-result-arrow">↓</b>
            <div
              className="gnss-positioning-source-result"
              data-testid="gnss-positioning-source-result-post-processing"
            >
              {gnssPositioningInformationGroups[2].resultLabel}
            </div>
          </article>
        </div>
        <p className="gnss-positioning-receiver-note">
          受信機が1台だから単独測位とは限りません。ネットワーク型RTKやCLASでは、現場側が1台でも外部情報を利用します。
        </p>
      </section>

      <section
        aria-labelledby="gnss-positioning-single-dgnss-title"
        className="gnss-card"
        data-gnss-positioning-card="3"
        data-testid="gnss-positioning-single-dgnss-card"
      >
        <GnssCardHeading
          description="外部補正情報を使わない単独測位と、既知位置の基準局の補正情報を使うDGNSSを比較します。"
          index={3}
          label="静的左右比較"
          title={gnssPositioningMethodCards[2].title}
          titleId="gnss-positioning-single-dgnss-title"
        />
        <div className="gnss-positioning-comparison-two-column">
          <article>
            <span>基準局や補正サービスからの外部補正情報を使わない</span>
            <h3>単独測位</h3>
            <GnssFlowDiagram
              ariaLabel="単独測位の流れ"
              steps={["複数のGNSS衛星", "信号・航法情報", "受信機P1", "P1の位置"]}
            />
            <p className="gnss-positioning-emphasis-copy">
              {gnssSingleAndDgnssExplanation.single.definition}
            </p>
            <p>{gnssSingleAndDgnssExplanation.single.receiverProcessing}</p>
            <strong className="gnss-positioning-misconception">
              {gnssSingleAndDgnssExplanation.single.misconception}
            </strong>
            <p className="gnss-positioning-familiar-example">
              <b>身近な例：</b>
              {gnssSingleAndDgnssExplanation.single.familiarExamples}
            </p>
            <p>{gnssSingleAndDgnssExplanation.single.capabilityNote}</p>
          </article>
          <article>
            <span>既知位置の基準局で得られた補正情報を利用</span>
            <h3>DGNSS</h3>
            <div className="gnss-positioning-dgnss-diagram">
              <div className="gnss-positioning-dgnss-satellites">
                <strong>GNSS衛星</strong>
                <span>測位信号 ↓　↓</span>
              </div>
              <div><strong>既知位置の基準局 A</strong><small>位置が分かっている</small><span>GNSS観測 → 補正情報</span></div>
              <b>補正情報 →</b>
              <div><strong>移動局 P1</strong><small>位置を求めたい</small><span>GNSS観測</span></div>
            </div>
            <p className="gnss-positioning-emphasis-copy">
              {gnssSingleAndDgnssExplanation.dgnss.definition}
            </p>
            <p>{gnssSingleAndDgnssExplanation.dgnss.processingNote}</p>
            <div className="gnss-positioning-base-distinction">
              <strong>{gnssSingleAndDgnssExplanation.dgnss.baseStationNote}</strong>
              <span>{gnssSingleAndDgnssExplanation.dgnss.baseStationDistinction}</span>
            </div>
          </article>
        </div>
        <div className="gnss-positioning-fix-terms">
          {gnssSingleAndDgnssExplanation.fixTerms.map((item) => (
            <article key={item.term}>
              <strong>{item.term}</strong>
              <span>→ {item.meaning}</span>
            </article>
          ))}
          <p>同じ「fix」という語を含んでも、両者は同じ意味ではありません。</p>
        </div>
        <blockquote className="gnss-positioning-bridge-message">
          基準側の情報で誤差を低減する考え方から、基準局・移動局の搬送波位相等を使う高精度な相対測位へ進みます。「DGNSSはコードだけ、RTKは搬送波だけ」とは断定しません。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-positioning-own-base-title"
        className="gnss-card"
        data-gnss-positioning-card="4"
        data-testid="gnss-positioning-own-base-card"
      >
        <GnssCardHeading
          description="相対的な位置関係が同じでも、出発点の基準局座標が変わるとP1成果が変わります。"
          index={4}
          label="操作あり"
          title={gnssPositioningMethodCards[3].title}
          titleId="gnss-positioning-own-base-title"
        />
        <GnssFlowDiagram
          ariaLabel="自前基準局RTKからP1成果までの流れ"
          steps={gnssOwnBaseRtkFlow}
        />
        <div className="gnss-positioning-baseline-definition">
          <span>基線</span>
          <strong>AからP1までの位置の差</strong>
          <p>
            このような2点間の位置関係を「基線」と呼びます。単なる距離ではなく、X方向・Y方向・高さ方向を含む3次元の位置関係です。
          </p>
          <p>具体的な基線解析や二重差は第7章で扱います。</p>
        </div>
        <p className="gnss-positioning-dimension-note">
          実際のRTKでは3次元の位置関係を求めますが、以下は基準局座標の誤りがP1成果へ伝わる因果関係に集中するため、X方向だけの教材例です。
        </p>

        <div
          aria-label="基準局座標の状態"
          className="gnss-positioning-coordinate-selector"
        >
          {ownBaseRtkCoordinateExample.cases.map((item) => (
            <button
              aria-pressed={coordinateCaseId === item.id}
              data-testid={`gnss-own-base-${item.id}`}
              key={item.id}
              onClick={() => setCoordinateCaseId(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div
          aria-live="polite"
          className="gnss-positioning-coordinate-result"
          data-testid="gnss-own-base-result"
        >
          <div data-coordinate-field="fix">
            <span>測位状態</span>
            <strong>{coordinateCase.fixState}</strong>
          </div>
          <div
            className={coordinateCaseId === "offset" ? "is-changed" : ""}
            data-coordinate-field="base-x"
          >
            <span>基準局 A.X</span>
            <strong>{coordinateCase.baseX.toFixed(3)} m</strong>
            {coordinateCaseId === "offset" ? <small>+0.500 m 変化</small> : null}
          </div>
          <div data-coordinate-field="relative-x">
            <span>A→P1 X方向差</span>
            <strong>+{ownBaseRtkCoordinateExample.relativeX.toFixed(3)} m</strong>
          </div>
          <div
            className={coordinateCaseId === "offset" ? "is-changed" : ""}
            data-coordinate-field="p1-x"
          >
            <span>P1.X</span>
            <strong>{calculatedP1X.toFixed(3)} m</strong>
            {coordinateCaseId === "offset" ? <small>+0.500 m 変化</small> : null}
          </div>
        </div>
        <p
          className={`gnss-positioning-coordinate-impact ${coordinateCaseId === "offset" ? "is-warning" : "is-correct"}`}
          data-testid="gnss-own-base-impact"
          role="status"
        >
          {coordinateCaseId === "offset"
            ? `FIXもA→P1の位置の差も同じなのに、基準局A.Xが +${p1Difference.toFixed(3)} m違うため、P1.Xも +${p1Difference.toFixed(3)} m違います。`
            : "基準局Aの既知座標にA→P1の位置の差を加えて、P1の座標を求めています。"}
        </p>
        <blockquote className="gnss-important-message">
          相対的な位置関係を高精度に求めても、出発点となる基準局座標が誤っていればP1成果も影響を受けます。FIXは、基準局へ入力した座標の正しさまで保証しません。
        </blockquote>
        <div className="gnss-positioning-later-lessons">
          <span>基準局座標 → 第5章</span>
          <span>RTCM / Ntrip → 第6章</span>
          <span>基線・FLOAT・FIX → 第7章</span>
          <span>現場点検 → 第8章</span>
        </div>
      </section>

      <section
        aria-labelledby="gnss-positioning-network-title"
        className="gnss-card"
        data-gnss-positioning-card="5"
        data-testid="gnss-positioning-network-card"
      >
        <GnssCardHeading
          description="利用者が現場基準局を設置するか、配信側の基準情報を利用するかを比較します。"
          index={5}
          label="静的左右比較"
          title={gnssPositioningMethodCards[4].title}
          titleId="gnss-positioning-network-title"
        />
        <p className="gnss-positioning-card-question">
          自分で基準局を置かないのに、なぜRTKができる？
        </p>
        <p className="gnss-positioning-route-introduction">
          電子基準点網などのリアルタイム観測データを利用して、配信サービス側がRTK用の情報を作り、インターネット経由で移動局へ届けます。
        </p>
        <div className="gnss-positioning-route-comparison">
          <article>
            <span>自前RTK</span>
            <GnssFlowDiagram
              ariaLabel="自前RTKの情報経路"
              steps={["自分の現場基準局", "移動局P1"]}
            />
          </article>
          <article>
            <span>ネットワーク型RTK</span>
            <GnssFlowDiagram
              ariaLabel="ネットワーク型RTKの情報経路"
              steps={gnssNetworkRtkFlow}
            />
          </article>
        </div>
        <div
          aria-label="自前基準局RTKとネットワーク型RTKの比較表"
          className="gnss-table-scroll"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-positioning-comparison-table">
            <caption>自前基準局RTKとネットワーク型RTK</caption>
            <thead>
              <tr><th>比較項目</th><th>自前基準局RTK</th><th>ネットワーク型RTK</th></tr>
            </thead>
            <tbody>
              {gnssOwnAndNetworkRtkComparison.map((row) => (
                <tr key={row.item}>
                  <th>{row.item}</th><td>{row.ownBase}</td><td>{row.network}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <blockquote className="gnss-important-message">
          ネットワーク型RTKは「基準となるGNSS観測を利用しない」という意味ではありません。利用者自身が現場基準局を設置する代わりに、電子基準点網などを利用した配信側の仕組みを使います。
        </blockquote>
        <p className="gnss-positioning-ground-reference-note">
          ネットワーク型RTKだけが電子基準点を利用し、CLASだけが別の基準を使うわけではありません。どちらにも電子基準点等の地上側の基準情報が関係し、作る情報と届け方が異なります。
        </p>
        <p className="gnss-positioning-quality-note">
          FIXだけでなく、座標系、高さ、アンテナ高、既知点確認・再観測、上空視界等の品質確認が引き続き必要です。
        </p>
      </section>

      <section
        aria-labelledby="gnss-positioning-clas-title"
        className="gnss-card"
        data-gnss-positioning-card="6"
        data-testid="gnss-positioning-clas-card"
      >
        <GnssCardHeading
          description="どちらも外部情報を使いますが、その情報の生成・配信・受信経路は異なります。"
          index={6}
          label="静的情報経路比較"
          title={gnssPositioningMethodCards[5].title}
          titleId="gnss-positioning-clas-title"
        />
        <blockquote className="gnss-positioning-key-message">
          CLASは「ネットワーク型RTKのインターネットなし版」ではありません。
        </blockquote>
        <div className="gnss-positioning-common-signal">
          <span>ネットワーク型RTK・CLASに共通</span>
          <strong>GNSS測位信号　L1 / L2 / L5 等</strong>
          <p>どちらの方式も、L1/L2/L5等を使ってGNSSを観測します。</p>
          <b aria-hidden="true">↓　両方式のGNSS観測へ</b>
        </div>
        <div className="gnss-positioning-route-comparison">
          <article>
            <span>ネットワーク型RTK</span>
            <GnssFlowDiagram
              ariaLabel="ネットワーク型RTKの配信経路"
              steps={gnssNetworkRtkFlow}
            />
          </article>
          <article>
            <span>CLAS</span>
            <GnssFlowDiagram
              ariaLabel="CLAS補強情報の配信経路"
              steps={gnssClasFlow}
            />
          </article>
        </div>
        <div
          aria-label="ネットワーク型RTKとCLASの信号・外部情報比較"
          className="gnss-table-scroll"
          data-testid="gnss-network-clas-signal-table"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-positioning-comparison-table gnss-positioning-network-clas-table">
            <caption>GNSS観測は共通、外部情報の作り方・届け方は別</caption>
            <thead>
              <tr><th>項目</th><th>ネットワーク型RTK</th><th>CLAS</th></tr>
            </thead>
            <tbody>
              {gnssNetworkAndClasSignalComparison.map((row) => (
                <tr key={row.item}>
                  <th>{row.item}</th><td>{row.networkRtk}</td><td>{row.clas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="gnss-positioning-caution-list">
          <li><strong>L6DでP1までの距離を測っているのではありません。L1/L2/L5等でGNSSを観測し、L6DでCLAS補強情報を受け取ります。</strong></li>
          <li>CLAS補強情報を受信することと、みちびきだけで測位することは別です。</li>
          <li>携帯圏外でも必ず測れるわけではなく、上空視界、遮蔽、マルチパス、対応機器、必要精度を確認します。</li>
        </ul>
        <p className="gnss-figure-note">CLAS内部処理やPPP-RTKの詳解は第10章で扱います。</p>
      </section>

      <section
        aria-labelledby="gnss-positioning-static-title"
        className="gnss-card"
        data-gnss-positioning-card="7"
        data-testid="gnss-positioning-static-card"
      >
        <GnssCardHeading
          description="現場で即時解を得るRTK系と、観測データを蓄積して後処理するスタティックの時間軸を比べます。"
          index={7}
          label="静的タイムライン"
          title={gnssPositioningMethodCards[6].title}
          titleId="gnss-positioning-static-title"
        />
        <div className="gnss-positioning-route-comparison">
          <article>
            <span>RTK</span>
            <GnssFlowDiagram
              ariaLabel="RTKの作業時間軸"
              steps={["観測", "リアルタイム解析", "FLOAT → FIX", "現場でP1座標"]}
            />
          </article>
          <article>
            <span>スタティック</span>
            <GnssFlowDiagram
              ariaLabel="スタティックの作業時間軸"
              steps={[
                "基準側とP1側で一定時間同時観測",
                "観測データを保存",
                "後処理",
                "基線解析",
                "P1の位置",
              ]}
            />
          </article>
        </div>
        <div
          aria-label="基準側とP1側の同時観測タイムライン"
          className="gnss-positioning-static-timeline"
          data-testid="gnss-static-timeline"
        >
          <div className="gnss-positioning-time-labels"><span>10:00</span><span>11:00</span></div>
          <div><strong>基準側</strong><span /></div>
          <div><strong>P1側</strong><span /></div>
          <b>同時観測</b>
        </div>
        <blockquote className="gnss-important-message">
          1回の瞬間的な座標だけで決めるのではなく、一定時間に得たGNSS観測データを使って後から解析します。
        </blockquote>
        <div className="gnss-positioning-observation-data">
          <span>保存する観測データの例</span>
          <strong>コード観測</strong><strong>搬送波位相</strong><strong>衛星・時刻等に関係する情報</strong>
          <p>RINEXは、GNSS観測データをやり取りするために広く使われる標準形式です。</p>
        </div>
        <p className="gnss-figure-note">具体的な観測時間、RINEX内部構造、本格的な基線解析は後続章で扱います。</p>
      </section>

      <section
        aria-labelledby="gnss-positioning-six-methods-title"
        className="gnss-card"
        data-gnss-positioning-card="8"
        data-testid="gnss-positioning-six-methods-card"
      >
        <GnssCardHeading
          description="新しい概念を増やさず、同じP1を求める6方式を同じ比較軸で並べます。"
          index={8}
          label="静的横断比較"
          title={gnssPositioningMethodCards[7].title}
          titleId="gnss-positioning-six-methods-title"
        />
        <div className="gnss-positioning-target-point">
          <span>求めたい点</span><strong>● P1</strong><p>X = ?　Y = ?　高さ = ?</p>
        </div>
        <div
          aria-label="GNSS測位6方式の比較表"
          className="gnss-table-scroll"
          data-testid="gnss-positioning-method-table"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-positioning-comparison-table gnss-positioning-six-methods-table">
            <caption>同じP1を求める6方式</caption>
            <thead>
              <tr>
                <th>方式</th><th>P1以外から利用する情報</th><th>自分で現場基準局を設置</th><th>考え方</th><th>主な情報経路</th><th>結果</th>
              </tr>
            </thead>
            <tbody>
              {gnssPositioningMethods.map((method) => (
                <tr data-method-id={method.id} key={method.id}>
                  <th>{method.label}</th>
                  <td>{method.externalInformation}</td>
                  <td>{method.fieldBaseStation}</td>
                  <td>{method.approach}</td>
                  <td>{method.informationPath}</td>
                  <td>{method.resultTiming}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-positioning-dgnss-table-note">
          <strong>DGNSSにも基準局はあります。</strong> 既知位置の基準局で作った補正情報を利用しますが、その基準局を利用者自身が現場に設置することは必須ではありません。
        </p>
        <div className="gnss-positioning-route-tiles">
          {gnssPositioningMethods.map((method) => (
            <article key={method.id}>
              <strong>{method.label}</strong><span>{method.informationPath}</span>
            </article>
          ))}
        </div>
        <blockquote className="gnss-important-message">
          6方式は「上位・下位」の単純なランキングではありません。必要精度、通信、既知点、観測時間、上空視界、成果用途等によって適した方式は変わります。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-positioning-field-selection-title"
        className="gnss-card"
        data-gnss-positioning-card="9"
        data-testid="gnss-positioning-selection-card"
      >
        <GnssCardHeading
          description="プリセットまたは6条件を変え、検討候補と理由がどのように変化するか確認します。"
          index={9}
          label="操作あり"
          title={gnssPositioningMethodCards[8].title}
          titleId="gnss-positioning-field-selection-title"
        />
        <div className="gnss-positioning-selection-purpose">
          <strong>条件を変えると、検討候補となる測位方式が本当に変化します。</strong>
          <p>これは実務用の自動方式選定エンジンではなく、比較の軸を学ぶ小さな教材ルールです。</p>
        </div>

        <div
          aria-label="現場条件のプリセット"
          className="gnss-positioning-preset-grid"
          data-testid="gnss-positioning-presets"
        >
          {gnssPositioningPresets.map((preset) => (
            <button
              aria-pressed={selectedPresetId === preset.id}
              data-testid={`gnss-positioning-preset-${preset.id}`}
              key={preset.id}
              onClick={() => selectPreset(preset.id)}
              type="button"
            >
              <span>{preset.label}</span><small>{preset.objective}</small>
            </button>
          ))}
        </div>

        <div className="gnss-positioning-condition-grid">
          {gnssConditionDefinitions.map((definition) => (
            <fieldset key={definition.id}>
              <legend>{definition.label}</legend>
              {definition.options.map((option) => (
                <button
                  aria-pressed={conditions[definition.id] === option.id}
                  data-testid={`gnss-condition-${definition.id}-${option.id}`}
                  key={option.id}
                  onClick={() => updateCondition(definition.id, option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </fieldset>
          ))}
        </div>

        <div
          aria-live="polite"
          className="gnss-positioning-candidate-panel"
          data-testid="gnss-positioning-candidates"
        >
          <header>
            <span>今回の条件から検討候補</span>
            <strong>{selectedPreset?.label ?? "条件を個別に変更中"}</strong>
          </header>
          {positioningEvaluation.warning ? (
            <p
              className="gnss-positioning-sky-warning"
              data-testid="gnss-positioning-sky-warning"
              role="alert"
            >
              {positioningEvaluation.warning}
            </p>
          ) : null}
          {positioningEvaluation.candidates.length > 0 ? (
            <div className="gnss-positioning-candidate-list">
              {positioningEvaluation.candidates.map((candidate) => (
                <article data-candidate-id={candidate.methodId} key={candidate.methodId}>
                  <h3>{candidate.label}</h3>
                  <ul>{candidate.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                </article>
              ))}
            </div>
          ) : (
            <strong className="gnss-positioning-additional-check">
              追加条件の確認が必要
            </strong>
          )}
          <div className="gnss-positioning-considerations">
            <h3>{positioningEvaluation.needsAdditionalCheck ? "追加条件の確認" : "あわせて確認"}</h3>
            <ul>{positioningEvaluation.considerations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>

        <div className="gnss-positioning-decision-flow">
          <h3>判断の流れ</h3>
          <GnssFlowDiagram
            ariaLabel="測位方式を検討する判断の流れ"
            steps={gnssPositioningSelectionFlow}
          />
          <div>
            <span>自分の基準局 → 自前RTK</span>
            <span>Internetの配信 → ネットワーク型RTK</span>
            <span>みちびきL6D → CLAS</span>
            <span>補正を使わない → 単独測位</span>
            <span>後処理できる → スタティック等</span>
          </div>
          <p>
            教材上の整理です。実際は必要精度、作業規程、機器性能、上空視界、基準点、通信環境等を総合確認します。
          </p>
        </div>

        <div className="gnss-positioning-final-summary">
          <article><span>①</span><strong>まず目的を見る</strong><p>概略位置か、高精度成果か</p></article>
          <article><span>②</span><strong>情報をどこから得るか</strong><p>自分の基準局、配信、みちびき、後処理等</p></article>
          <article><span>③</span><strong>現場条件を見る</strong><p>通信、既知点、上空視界、観測時間</p></article>
          <article><span>④</span><strong>一番高性能を選ぶのではない</strong><p>その現場・目的に適した方式を選ぶ</p></article>
        </div>

        <div
          aria-labelledby="gnss-positioning-methods-quiz-title"
          className="gnss-quiz-section"
          data-testid="gnss-positioning-methods-quiz-panel"
        >
          <div className="gnss-quiz-heading">
            <span>第4章 確認問題</span>
            <h3 id="gnss-positioning-methods-quiz-title">測位方式の比較と選択を8問で確認する</h3>
            <p>回答状態はReact状態だけに保持し、ページ再読込み後は初期化します。</p>
          </div>

          <div className="gnss-quiz-list">
            {gnssPositioningMethodsQuizQuestions.map(
              (question, questionIndex) => {
                const answerState = quizAnswerStates[question.id];
                const evaluation = answerState?.isAnswered
                  ? evaluateGnssPositioningMethodsQuizAnswer(
                      question.id,
                      answerState.selectedOptionId,
                    )
                  : null;
                const correctOptionLetter =
                  getGnssPositioningMethodsQuizOptionLetter(
                    question.id,
                    question.correctOptionId,
                  );
                const selectedOptionLetter = evaluation
                  ? getGnssPositioningMethodsQuizOptionLetter(
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
              },
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default GnssPositioningMethodsLesson;
