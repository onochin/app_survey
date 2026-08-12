import { useState } from "react";
import {
  evaluateGnssBaselineFixQuizAnswer,
  getGnssBaselineAmbiguityEvaluationStage,
  getGnssBaselineFixQuizOptionLetter,
  getNextGnssBaselineAmbiguityEvaluationStageId,
  gnssBaselineAmbiguityCandidates,
  gnssBaselineAmbiguityEvaluationStages,
  gnssBaselineCandidateEpochNote,
  gnssBaselineCandidateSchematicNote,
  gnssBaselineDeviceDisplayRows,
  gnssBaselineDoubleDifferenceEffects,
  gnssBaselineDoubleDifferenceSteps,
  gnssBaselineExternalLinks,
  gnssBaselineFixCards,
  gnssBaselineFixMapSteps,
  gnssBaselineFixQuizQuestions,
  gnssBaselineFixScenario,
  gnssBaselineFloatEstimates,
  gnssBaselineReceiverComparison,
  gnssBaselineReceiverDifferenceEffects,
  gnssBaselineResultConditions,
} from "../data/gnssBaselineFix";
import { gnssBaselineFixLesson } from "../gnssCourse";
import type { GnssAmbiguityEvaluationStageId } from "../types";

interface GnssBaselineFixLessonProps {
  readonly completedLessonCount: number;
  readonly totalLessonCount: number;
}

interface GnssQuizAnswerState {
  readonly selectedOptionId: string;
  readonly isAnswered: boolean;
}

type GnssQuizAnswerStateMap = Readonly<
  Record<string, GnssQuizAnswerState | undefined>
>;

interface GnssBaselineCardHeadingProps {
  readonly description: string;
  readonly index: number;
  readonly label: string;
  readonly title: string;
  readonly titleId: string;
}

function GnssBaselineCardHeading({
  description,
  index,
  label,
  title,
  titleId,
}: GnssBaselineCardHeadingProps) {
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

function GnssBaselineFlow({
  ariaLabel,
  compact = false,
}: {
  readonly ariaLabel: string;
  readonly compact?: boolean;
}) {
  return (
    <ol
      aria-label={ariaLabel}
      className={`gnss-baseline-flow${compact ? " is-compact" : ""}`}
    >
      {gnssBaselineFixMapSteps.map((step, index) => (
        <li data-baseline-flow-step-id={step.id} key={step.id}>
          <span>{step.chapter}</span>
          <strong>{step.label}</strong>
          {index < gnssBaselineFixMapSteps.length - 1 ? (
            <b aria-hidden="true">↓</b>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function GnssBaselineExternalLinks({ cardNumber }: { readonly cardNumber: number }) {
  const links = gnssBaselineExternalLinks.filter((link) =>
    link.cardIds.some((currentCardNumber) => currentCardNumber === cardNumber),
  );

  if (links.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label={`カード${cardNumber}のDrogger公式補助リンク`}
      className="gnss-baseline-external-links"
      data-external-link-card={cardNumber}
    >
      <span>Drogger実機で確認</span>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.href} rel="noreferrer" target="_blank">
              {link.label}
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function formatMeters(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(3)} m` : "表示できません";
}

function formatSignedMeters(value: number): string {
  if (!Number.isFinite(value)) {
    return "表示できません";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(3)} m`;
}

function GnssBaselineFixLesson({
  completedLessonCount,
  totalLessonCount,
}: GnssBaselineFixLessonProps) {
  const [evaluationStageId, setEvaluationStageId] =
    useState<GnssAmbiguityEvaluationStageId>("initial");
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});
  const progressPercent =
    totalLessonCount > 0
      ? Math.round((completedLessonCount / totalLessonCount) * 100)
      : 0;
  const evaluationStage =
    getGnssBaselineAmbiguityEvaluationStage(evaluationStageId) ??
    gnssBaselineAmbiguityEvaluationStages[0];
  const nextEvaluationStageId =
    getNextGnssBaselineAmbiguityEvaluationStageId(evaluationStage.id);

  const advanceEvaluation = (): void => {
    setEvaluationStageId(nextEvaluationStageId ?? "initial");
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
      evaluateGnssBaselineFixQuizAnswer(
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

  const correctBaseX = gnssBaselineFixScenario.knownPoint.x;
  const offsetBaseX = correctBaseX + 0.5;
  const p1North = gnssBaselineFixScenario.offsetFromKnownPoint.north;
  const offsetP1X = offsetBaseX + p1North;

  return (
    <div data-lesson-id={gnssBaselineFixLesson.id}>
      <section
        aria-labelledby="gnss-baseline-fix-course-title"
        className="gnss-card gnss-chapter-card"
        data-gnss-baseline-card="1"
        data-testid="gnss-baseline-intro-card"
        id="gnss-baseline-fix"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 9</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 7</span>
            <h1 id="gnss-baseline-fix-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第7章</p>
            <h2>{gnssBaselineFixCards[0].title}</h2>
            <p>{gnssBaselineFixLesson.description}</p>
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
            <p className="gnss-baseline-session-note">
              第7章の操作・回答は、この画面を開いている間だけ保持します。
            </p>
          </div>
        </div>

        <div className="gnss-chapter-metadata">
          <div className="gnss-goal-panel">
            <span>到達目標</span>
            <strong>{gnssBaselineFixLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>主な用語</h3>
            <div className="gnss-term-list">
              {gnssBaselineFixLesson.terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>この章で確認すること</h3>
            <ul>
              {gnssBaselineFixLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gnss-baseline-opening-question">
          <span>第6章からの接続</span>
          <p>
            第6章では、基準局側のRTCMが移動局P1へ正しく継続して届くところまで確認しました。
          </p>
          <strong>
            RTCMは正常に届いている。移動局自身もGNSSを観測している。それなのに、なぜ最初はFLOATで、そこからFIXになるのでしょうか？
          </strong>
        </div>

        <div
          aria-label="Drogger-GPSでRTCMを受信しているがFloatである実機表示例"
          className="gnss-baseline-device-status"
          role="img"
        >
          <span>Drogger-GPSの実機表示例</span>
          <dl>
            <div data-device-field="status">
              <dt>Status</dt>
              <dd>Running</dd>
            </div>
            <div data-device-field="rtcm3">
              <dt>RTCM3</dt>
              <dd>受信中</dd>
            </div>
            <div data-device-field="age">
              <dt>Age</dt>
              <dd>表示あり</dd>
            </div>
            <div data-device-field="fix-mode">
              <dt>FixMode</dt>
              <dd>Float</dd>
            </div>
          </dl>
        </div>
        <blockquote className="gnss-important-message">
          RTCMが届くことは解析に必要な基準局側情報が届いた段階です。FIXは、その情報とP1自身の観測を使い、必要な整数アンビギュイティを固定できた別の段階です。
        </blockquote>
        <GnssBaselineFlow ariaLabel="RTCM受信からFIX、3次元基線、成果点検までの第7章全体図" />
        <GnssBaselineExternalLinks cardNumber={1} />
      </section>

      <section
        aria-labelledby="gnss-baseline-receiver-comparison-title"
        className="gnss-card"
        data-gnss-baseline-card="2"
        data-testid="gnss-baseline-receiver-comparison-card"
      >
        <GnssBaselineCardHeading
          description="最初は1衛星・2受信機に絞り、同じ衛星を対応する時刻に観測して2地点の違いを見る意味を考えます。"
          index={2}
          label="静的比較図"
          title={gnssBaselineFixCards[1].title}
          titleId="gnss-baseline-receiver-comparison-title"
        />
        <div
          aria-label="衛星G1を基準局Aと移動局P1で観測して比較する模式図"
          className="gnss-baseline-one-satellite"
          role="img"
        >
          <strong>衛星 G1</strong>
          <div aria-hidden="true">
            <span>↙</span>
            <span>↘</span>
          </div>
          <section>
            {gnssBaselineReceiverComparison.map((receiver) => (
              <article data-receiver-id={receiver.id} key={receiver.id}>
                <h3>{receiver.label}</h3>
                <strong>{receiver.role}</strong>
                <p>{receiver.observation}</p>
              </article>
            ))}
          </section>
          <p>
            <span>Aの観測</span>
            <b aria-hidden="true">⇄</b>
            <span>P1の観測</span>
            <strong>2地点の違いを比較</strong>
          </p>
        </div>
        <blockquote className="gnss-important-message">
          同じ衛星を基準局Aと移動局P1で対応する時刻に観測し、観測値そのものではなく「2地点の違い」に注目すると、両地点へ共通・類似して入る影響の一部を相殺・低減できます。
        </blockquote>
        <div className="gnss-baseline-effect-grid">
          {gnssBaselineReceiverDifferenceEffects.map((effect) => (
            <article data-effect-id={effect.id} key={effect.id}>
              <h3>{effect.label}</h3>
              <ul>
                {effect.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{effect.note}</p>
            </article>
          ))}
        </div>
        <p className="gnss-baseline-review-note">
          衛星位置、時計、大気状態等は時間とともに変わります。比較には同じ衛星の対応する観測時刻を使うことが重要ですが、完全に同一瞬間でなければ解析不能という意味ではありません。
        </p>
        <GnssBaselineExternalLinks cardNumber={2} />
      </section>

      <section
        aria-labelledby="gnss-baseline-double-difference-title"
        className="gnss-card"
        data-gnss-baseline-card="3"
        data-testid="gnss-baseline-double-difference-card"
      >
        <GnssBaselineCardHeading
          description="1衛星で作った受信機間の差を別衛星でも作り、2つの差をさらに組み合わせます。"
          index={3}
          label="静的2衛星×2受信機図"
          title={gnssBaselineFixCards[2].title}
          titleId="gnss-baseline-double-difference-title"
        />
        <div
          aria-label="衛星G1とG2を基準局Aと移動局P1で観測する2衛星2受信機図"
          className="gnss-baseline-two-by-two"
          role="img"
        >
          <span aria-hidden="true" />
          <strong>衛星 G1</strong>
          <strong>衛星 G2</strong>
          <b>基準局A</b>
          <span>A × G1</span>
          <span>A × G2</span>
          <b>移動局P1</b>
          <span>P1 × G1</span>
          <span>P1 × G2</span>
        </div>
        <div className="gnss-baseline-difference-grid">
          {gnssBaselineDoubleDifferenceSteps.map((step) => (
            <article data-difference-step-id={step.id} key={step.id}>
              <span>{step.satellite}</span>
              <strong>{step.expression}</strong>
              <b aria-hidden="true">↓</b>
              <p>{step.result}</p>
            </article>
          ))}
        </div>
        <p className="gnss-baseline-double-difference-result">
          <span>差①</span>
          <b>−</b>
          <span>差②</span>
          <strong>二重差</strong>
        </p>
        <div className="gnss-baseline-effect-grid">
          {gnssBaselineDoubleDifferenceEffects.map((effect) => (
            <article data-double-difference-effect-id={effect.id} key={effect.id}>
              <h3>{effect.label}</h3>
              <ul>
                {effect.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <blockquote className="gnss-important-message">
          二重差でも整数アンビギュイティは未知の整数として残ります。ここから基線・アンビギュイティの推定とFLOAT / FIXへ進みます。
        </blockquote>
        <p className="gnss-baseline-review-note">
          二重差は単一基準局RTKの原理を理解する代表的な説明です。すべての現代RTKエンジンが画面どおりの二重差式だけを内部で使う、と断定するものではありません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-baseline-float-title"
        className="gnss-card"
        data-gnss-baseline-card="4"
        data-testid="gnss-baseline-float-card"
      >
        <GnssBaselineCardHeading
          description="整数が未固定でも、FLOATには基線・位置とアンビギュイティの推定解があります。"
          index={4}
          label="静的状態比較"
          title={gnssBaselineFixCards[3].title}
          titleId="gnss-baseline-float-title"
        />
        <p className="gnss-baseline-card-question">
          整数アンビギュイティがまだ決まっていないなら、FLOATではP1の位置はまったく分からないのでしょうか？
        </p>
        <div className="gnss-baseline-float-definition">
          <article>
            <span>FLOAT</span>
            <strong>≠ 何も計算できていない</strong>
          </article>
          <article>
            <span>FLOAT</span>
            <strong>位置・基線の推定解はある</strong>
            <b>＋</b>
            <strong>必要な整数をまだ固定できない</strong>
          </article>
        </div>
        <ol className="gnss-baseline-simple-flow" aria-label="FLOATまでの未知量推定フロー">
          <li>AとP1の観測を比較</li>
          <li>基線・相対位置と整数アンビギュイティを推定</li>
          <li>必要な整数をまだ固定解として採用できない</li>
          <li>FLOAT</li>
        </ol>
        <div className="gnss-baseline-float-estimates">
          <span>整数アンビギュイティの実数推定値（教材用模式値）</span>
          <div>
            {gnssBaselineFloatEstimates.map((estimate) => (
              <article data-float-estimate-id={estimate.id} key={estimate.id}>
                <small>{estimate.label}</small>
                <strong>{estimate.value.toFixed(2)}</strong>
              </article>
            ))}
          </div>
          <p>
            実際の衛星までの生の整数波長数を3個表示したものではありません。二重差等で扱う複数のアンビギュイティ・組合せを初心者向けに模式化しています。
          </p>
        </div>
        <blockquote className="gnss-important-message">
          11.82を単純に12へ四捨五入すればFIX、ではありません。複数の整数候補を観測全体との整合性から評価します。
        </blockquote>
        <GnssBaselineExternalLinks cardNumber={4} />
      </section>

      <section
        aria-labelledby="gnss-baseline-candidate-title"
        className="gnss-card"
        data-gnss-baseline-card="5"
        data-testid="gnss-baseline-candidate-card"
      >
        <GnssBaselineCardHeading
          description="判断材料を増やし、最良候補と固定してよい候補の違いを3段階で確認します。"
          index={5}
          label="操作あり"
          title={gnssBaselineFixCards[4].title}
          titleId="gnss-baseline-candidate-title"
        />
        <p className="gnss-baseline-card-question">
          最も近い整数へ丸めるのではなく、複数候補のどれが観測全体へ一貫して整合するかを見ます。
        </p>
        <div
          aria-live="polite"
          className={`gnss-baseline-candidate-lab${evaluationStage.status === "FIX" ? " is-fixed" : ""}`}
          data-evaluation-stage-id={evaluationStage.id}
          data-testid="gnss-baseline-candidate-result"
        >
          <header>
            <div>
              <span>{evaluationStage.stepLabel}</span>
              <strong>観測全体との整合性</strong>
            </div>
            <b>{evaluationStage.status}</b>
          </header>
          <div className="gnss-baseline-candidate-grid">
            {gnssBaselineAmbiguityCandidates.map((candidate) => {
              const evaluation = evaluationStage.evaluations.find(
                (currentEvaluation) =>
                  currentEvaluation.candidateId === candidate.id,
              );

              if (!evaluation) {
                return null;
              }

              return (
                <article
                  data-candidate-id={candidate.id}
                  data-consistency={evaluation.consistency}
                  key={candidate.id}
                >
                  <span>{candidate.label}</span>
                  <strong>{candidate.values.join(" / ")}</strong>
                  <p>
                    <b aria-hidden="true">{evaluation.marker}</b>
                    整合性：{evaluation.consistency}
                  </p>
                  <small>{evaluation.reason}</small>
                </article>
              );
            })}
          </div>
          <section className="gnss-baseline-candidate-conclusion">
            <span>この段階の判断</span>
            <strong>{evaluationStage.conclusion}</strong>
            <p>{evaluationStage.nextAction}</p>
          </section>
        </div>
        <p className="gnss-baseline-not-equal">
          <strong>一番良い候補がある</strong>
          <span>≠</span>
          <strong>その候補を固定してよいと十分に判断できた</strong>
        </p>
        <button
          className="gnss-baseline-next-observation"
          data-testid="gnss-baseline-next-observation"
          onClick={advanceEvaluation}
          type="button"
        >
          {nextEvaluationStageId ? "次の観測を見る" : "最初から見直す"}
        </button>
        <p className="gnss-baseline-schematic-note">
          {gnssBaselineCandidateSchematicNote}
        </p>
        <p className="gnss-baseline-review-note">
          {gnssBaselineCandidateEpochNote}
        </p>
      </section>

      <section
        aria-labelledby="gnss-baseline-vector-title"
        className="gnss-card"
        data-gnss-baseline-card="6"
        data-testid="gnss-baseline-vector-card"
      >
        <GnssBaselineCardHeading
          description="必要な整数を固定した条件から、AとP1の3次元の相対位置を高精度に推定する流れを確認します。"
          index={6}
          label="静的3次元基線図"
          title={gnssBaselineFixCards[5].title}
          titleId="gnss-baseline-vector-title"
        />
        <ol className="gnss-baseline-simple-flow" aria-label="FLOATからFIXと3次元基線へ進む流れ">
          <li>FLOAT：基線とアンビギュイティを実数として推定</li>
          <li>複数の整数候補を評価</li>
          <li>必要な整数アンビギュイティを固定</li>
          <li>FIX：固定した整数条件で3次元基線を高精度に推定</li>
        </ol>
        <div
          aria-label="既知点AからP1への北・東・高さ3成分を持つ基線模式図"
          className="gnss-baseline-vector-diagram"
          role="img"
        >
          <article data-baseline-point="a">
            <span>始点</span>
            <strong>既知点 A</strong>
            <dl>
              <div>
                <dt>X（北）</dt>
                <dd>{formatMeters(gnssBaselineFixScenario.knownPoint.x)}</dd>
              </div>
              <div>
                <dt>Y（東）</dt>
                <dd>{formatMeters(gnssBaselineFixScenario.knownPoint.y)}</dd>
              </div>
              <div>
                <dt>標高</dt>
                <dd>{formatMeters(gnssBaselineFixScenario.knownPoint.elevation)}</dd>
              </div>
            </dl>
          </article>
          <div className="gnss-baseline-vector-components">
            <span>A → P1 3次元基線</span>
            <dl>
              <div>
                <dt>北方向 ΔX</dt>
                <dd>{formatSignedMeters(gnssBaselineFixScenario.offsetFromKnownPoint.north)}</dd>
              </div>
              <div>
                <dt>東方向 ΔY</dt>
                <dd>{formatSignedMeters(gnssBaselineFixScenario.offsetFromKnownPoint.east)}</dd>
              </div>
              <div>
                <dt>高さ ΔH</dt>
                <dd>{formatSignedMeters(gnssBaselineFixScenario.offsetFromKnownPoint.height)}</dd>
              </div>
            </dl>
            <b aria-hidden="true">→</b>
          </div>
          <article data-baseline-point="p1">
            <span>終点</span>
            <strong>新点 P1</strong>
            <dl>
              <div>
                <dt>X（北）</dt>
                <dd>{formatMeters(gnssBaselineFixScenario.newPoint.x)}</dd>
              </div>
              <div>
                <dt>Y（東）</dt>
                <dd>{formatMeters(gnssBaselineFixScenario.newPoint.y)}</dd>
              </div>
              <div>
                <dt>標高</dt>
                <dd>{formatMeters(gnssBaselineFixScenario.newPoint.elevation)}</dd>
              </div>
            </dl>
          </article>
        </div>
        <p className="gnss-baseline-equation">
          <span>基準局Aの座標</span>
          <b>＋</b>
          <span>A→P1の3次元基線</span>
          <b>＝</b>
          <strong>P1の位置</strong>
        </p>
        <blockquote className="gnss-important-message">
          基線はAとP1の単なる距離ではなく、3次元の相対的な位置関係です。
        </blockquote>
        <p className="gnss-baseline-review-note">
          本教材では既存のX・Y・標高で模式化します。実際のGNSSでは3次元座標系で相対位置を解析し、必要な座標・高さ表現へつなげます。平面直角座標と標高を単純に差し引くだけの解析という意味ではありません。
        </p>
        <p className="gnss-baseline-review-note">
          FIXは整数アンビギュイティを固定したRTK固定解が得られた状態であり、P1の真値や成果条件全体を保証する表示ではありません。
        </p>
        <GnssBaselineExternalLinks cardNumber={6} />
      </section>

      <section
        aria-labelledby="gnss-baseline-monitoring-title"
        className="gnss-card"
        data-gnss-baseline-card="7"
        data-testid="gnss-baseline-monitoring-card"
      >
        <GnssBaselineCardHeading
          description="FIX後もGNSS観測と解の整合性監視は続き、条件が変われば再評価します。"
          index={7}
          label="静的状態遷移図"
          title={gnssBaselineFixCards[6].title}
          titleId="gnss-baseline-monitoring-title"
        />
        <div className="gnss-baseline-monitoring-flow">
          <article>
            <span>FIX</span>
            <strong>必要な整数を固定</strong>
          </article>
          <b aria-hidden="true">↓</b>
          <article>
            <span>観測継続</span>
            <strong>新しい観測との整合性を監視</strong>
          </article>
          <div>
            <section>
              <span>整合する</span>
              <strong>FIXを維持</strong>
            </section>
            <section>
              <span>整合を維持できない</span>
              <strong>FLOAT等へ戻り再評価</strong>
            </section>
          </div>
        </div>
        <p className="gnss-baseline-not-equal">
          <strong>FIX</strong>
          <span>≠</span>
          <strong>観測終了</strong>
        </p>
        <div className="gnss-baseline-cycle-slip">
          <header>
            <span>専門用語</span>
            <h3>サイクルスリップ</h3>
            <p>
              搬送波位相の連続追跡中に、受信機のロック喪失等で整数波長単位の不連続が生じること。
            </p>
          </header>
          <div>
            <p>
              <span>連続追跡</span>
              <strong>10 → 11 → 12 → 13 → 14</strong>
            </p>
            <p>
              <span>追跡中断の模式例</span>
              <strong>10 → 11 → 12 → ? → 17</strong>
              <small>「?」で位相の連続性が切れた</small>
            </p>
          </div>
        </div>
        <p className="gnss-baseline-review-note">
          この数列は連続性の理解用模式図で、波数そのものを実距離として数える図ではありません。FIXからFLOATへ戻るのは、整数アンビギュイティが時間とともに小数へ変わったためでも、必ず受信機が故障したためでもありません。
        </p>
        <p className="gnss-baseline-review-note">
          衛星遮蔽、信号追跡の中断、基準局側情報の途切れ等で、固定条件を新しい観測へ信頼して使い続けられなくなる場合があります。具体的な再測判断は第8章で扱います。
        </p>
        <GnssBaselineExternalLinks cardNumber={7} />
      </section>

      <section
        aria-labelledby="gnss-baseline-result-title"
        className="gnss-card"
        data-gnss-baseline-card="8"
        data-testid="gnss-baseline-result-card"
      >
        <GnssBaselineCardHeading
          description="RTK解析で得る固定解と、その結果を測量成果として採用する条件を分けます。"
          index={8}
          label="静的成果条件表"
          title={gnssBaselineFixCards[7].title}
          titleId="gnss-baseline-result-title"
        />
        <p className="gnss-baseline-card-question">
          測位状態がFIXなら、表示されたP1の座標は正しいと考えてよいのでしょうか？
        </p>
        <div className="gnss-baseline-analysis-vs-result">
          <section>
            <span>RTK解析</span>
            <strong>整数アンビギュイティを固定</strong>
            <b aria-hidden="true">↓</b>
            <strong>FIX</strong>
            <b aria-hidden="true">↓</b>
            <p>A→P1の高精度な相対位置</p>
          </section>
          <section>
            <span>成果として使う</span>
            <ul>
              <li>基準局座標は正しい？</li>
              <li>アンテナ高・求心は正しい？</li>
              <li>測地系・系番号・座標の時点は合っている？</li>
              <li>高さ基準と観測結果に異常はない？</li>
            </ul>
            <strong>点検して成果として採用</strong>
          </section>
        </div>
        <blockquote className="gnss-important-message">
          FIXはRTK固定解の状態です。成果条件すべての合格マークではありません。
        </blockquote>
        <div className="gnss-baseline-offset-example">
          <header>
            <span>第4章の既習例を静的に再確認</span>
            <strong>基準局A.Xが +0.500 m違っていてもFIXする場合</strong>
          </header>
          <div>
            <article>
              <span>正しい基準局座標</span>
              <dl>
                <div>
                  <dt>基準局A.X</dt>
                  <dd>{formatMeters(correctBaseX)}</dd>
                </div>
                <div>
                  <dt>A→P1 X方向差</dt>
                  <dd>{formatSignedMeters(p1North)}</dd>
                </div>
                <div>
                  <dt>P1.X</dt>
                  <dd>{formatMeters(gnssBaselineFixScenario.newPoint.x)}</dd>
                </div>
                <div>
                  <dt>測位状態</dt>
                  <dd>FIX</dd>
                </div>
              </dl>
            </article>
            <article>
              <span>基準局A.Xを誤入力</span>
              <dl>
                <div>
                  <dt>基準局A.X</dt>
                  <dd>{formatMeters(offsetBaseX)}</dd>
                </div>
                <div>
                  <dt>A→P1 X方向差</dt>
                  <dd>{formatSignedMeters(p1North)}</dd>
                </div>
                <div>
                  <dt>P1.X</dt>
                  <dd>{formatMeters(offsetP1X)}</dd>
                </div>
                <div>
                  <dt>測位状態</dt>
                  <dd>FIX</dd>
                </div>
              </dl>
            </article>
          </div>
          <p>基準局座標の誤りが、同じ量だけP1成果へ伝わる既習の因果関係です。操作は再実装していません。</p>
        </div>
        <div className="gnss-baseline-result-condition-grid">
          {gnssBaselineResultConditions.map((condition) => (
            <article data-result-condition-id={condition.id} key={condition.id}>
              <h3>{condition.label}</h3>
              <ul>
                {condition.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="gnss-baseline-review-note">
          座標の時点も成果採用時に確認する条件の一つです。元期・今期やセミ・ダイナミック補正の詳しい処理は第9章で扱います。
        </p>
        <div className="gnss-baseline-false-fix-warning">
          <span>ミスFIX</span>
          <strong>
            誤った整数候補を固定解として採用し、FIX表示でも正しい位置が得られていない場合があります。
          </strong>
          <p>
            マルチパス等の悪い観測環境が影響する場合がありますが、マルチパスがあれば必ずミスFIXになる、という意味ではありません。
          </p>
        </div>
        <GnssBaselineExternalLinks cardNumber={8} />
      </section>

      <section
        aria-labelledby="gnss-baseline-summary-title"
        className="gnss-card"
        data-gnss-baseline-card="9"
        data-testid="gnss-baseline-summary-card"
      >
        <GnssBaselineCardHeading
          description="第5章の基準局準備、第6章のRTCM伝送、第7章の観測比較から3次元基線までを1本につなぎます。"
          index={9}
          label="静的総まとめ"
          title={gnssBaselineFixCards[8].title}
          titleId="gnss-baseline-summary-title"
        />
        <GnssBaselineFlow
          ariaLabel="第5章の基準局準備から第8章の成果点検へつながる総まとめ"
          compact
        />
        <div
          aria-label="第7章理論とDrogger実機表示例の対応表"
          className="gnss-table-scroll"
          data-testid="gnss-baseline-device-display-table"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-baseline-device-display-table">
            <caption>一般理論とDrogger-GPSの実機表示例を区別して確認</caption>
            <thead>
              <tr>
                <th>理論上の確認</th>
                <th>Drogger実機例</th>
                <th>読み方</th>
              </tr>
            </thead>
            <tbody>
              {gnssBaselineDeviceDisplayRows.map((row) => (
                <tr data-device-display-id={row.id} key={row.id}>
                  <th>{row.theory}</th>
                  <td>{row.deviceExample}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-baseline-review-note">
          AgeはDrogger公式では基準局と移動局の観測データの時間差として説明されます。全GNSS受信機共通の固定名称・普遍的なしきい値ではなく、CLAS時は通常RTKと表示挙動が異なる点にも注意します。
        </p>
        <div className="gnss-baseline-next-chapter">
          <span>第8章への問い</span>
          <strong>
            P1がFIXしました。では現場では、この結果を何を見て点検し、どのように成果として採用すればよいのでしょうか？
          </strong>
          <p>次は第8章「自前RTK④ 現場観測と点検」で扱います。</p>
        </div>
        <GnssBaselineExternalLinks cardNumber={9} />
      </section>

      <div
        aria-labelledby="gnss-baseline-fix-quiz-title"
        className="gnss-quiz-section"
        data-testid="gnss-baseline-fix-quiz-panel"
      >
        <div className="gnss-quiz-heading">
          <span>第7章 確認問題</span>
          <h3 id="gnss-baseline-fix-quiz-title">
            基線解析・FLOAT・FIXを8問で確認する
          </h3>
          <p>回答状態はReact状態だけに保持し、ページ再読込み後は初期化します。</p>
        </div>

        <div className="gnss-quiz-list">
          {gnssBaselineFixQuizQuestions.map((question, questionIndex) => {
            const answerState = quizAnswerStates[question.id];
            const evaluation = answerState?.isAnswered
              ? evaluateGnssBaselineFixQuizAnswer(
                  question.id,
                  answerState.selectedOptionId,
                )
              : null;
            const correctOptionLetter = getGnssBaselineFixQuizOptionLetter(
              question.id,
              question.correctOptionId,
            );
            const selectedOptionLetter = evaluation
              ? getGnssBaselineFixQuizOptionLetter(
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
    </div>
  );
}

export default GnssBaselineFixLesson;
