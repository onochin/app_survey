import { useState } from "react";
import {
  evaluateGnssOwnBaseStationQuizAnswer,
  getGnssOwnBaseStationQuizOptionLetter,
  gnssOwnBaseAntennaChecks,
  gnssOwnBaseCoordinateSources,
  gnssOwnBaseKnownPointFlow,
  gnssOwnBaseKnownPointResultChecks,
  gnssOwnBaseNextChapterFlow,
  gnssOwnBaseNoKnownPointBranches,
  gnssOwnBaseNoKnownPointFlow,
  gnssOwnBasePreUseChecks,
  gnssOwnBaseSiteChecks,
  gnssOwnBaseSiteExamples,
  gnssOwnBaseStationCards,
  gnssOwnBaseStationElements,
  gnssOwnBaseStationOverviewFlow,
  gnssOwnBaseStationQuizQuestions,
  gnssOwnBaseStationScenario,
} from "../data/gnssOwnBaseStation";
import { gnssOwnBaseStationLesson } from "../gnssCourse";

interface GnssOwnBaseStationLessonProps {
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

interface GnssOwnBaseCardHeadingProps {
  readonly description: string;
  readonly index: number;
  readonly label: string;
  readonly title: string;
  readonly titleId: string;
}

function GnssOwnBaseCardHeading({
  description,
  index,
  label,
  title,
  titleId,
}: GnssOwnBaseCardHeadingProps) {
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

function GnssOwnBaseFlow({
  ariaLabel,
  steps,
}: {
  readonly ariaLabel: string;
  readonly steps: readonly string[];
}) {
  return (
    <ol
      aria-label={ariaLabel}
      className="gnss-positioning-flow-diagram gnss-own-base-flow"
    >
      {steps.map((step, index) => (
        <li key={`${step}-${index}`}>
          <span>{step}</span>
          {index < steps.length - 1 ? <b aria-hidden="true">↓</b> : null}
        </li>
      ))}
    </ol>
  );
}

function GnssOwnBaseStationLesson({
  completedLessonCount,
  isUnderstood,
  onToggleUnderstood,
  totalLessonCount,
}: GnssOwnBaseStationLessonProps) {
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});
  const progressPercent = Math.round(
    (completedLessonCount / totalLessonCount) * 100,
  );
  const knownPoint = gnssOwnBaseStationScenario.knownPoint;
  const baseStation = gnssOwnBaseStationScenario.baseStation;
  const knownPointResultValues = {
    "point-name": `既知点 ${knownPoint.name}`,
    "horizontal-coordinate": `X = ${knownPoint.x.toFixed(3)} m / Y = ${knownPoint.y.toFixed(3)} m`,
    "height-result": `標高 = ${knownPoint.elevation.toFixed(3)} m（教材値）`,
    datum: "成果資料で確認",
    "coordinate-epoch": "成果資料で確認",
  } as const;

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
      evaluateGnssOwnBaseStationQuizAnswer(
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
    <div data-lesson-id={gnssOwnBaseStationLesson.id}>
      <section
        aria-labelledby="gnss-own-base-course-title"
        className="gnss-card gnss-chapter-card"
        data-gnss-own-base-card="1"
        data-testid="gnss-own-base-intro-card"
        id="gnss-own-base-station"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 9</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 5</span>
            <h1 id="gnss-own-base-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第5章</p>
            <h2>{gnssOwnBaseStationCards[0].title}</h2>
            <p>{gnssOwnBaseStationLesson.description}</p>
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
            <strong>{gnssOwnBaseStationLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>主な用語</h3>
            <div className="gnss-term-list">
              {gnssOwnBaseStationLesson.terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>この章で確認すること</h3>
            <ul>
              {gnssOwnBaseStationLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gnss-own-base-opening-question">
          <span>第4章からの接続</span>
          <p>
            第4章では、基準局Aの座標が0.500 m違えば、A→P1の位置差が同じでもP1成果が0.500
            m違うことを確認しました。
          </p>
          <strong>では、その基準局Aの座標はどこから来るのでしょうか？</strong>
        </div>

        <GnssOwnBaseFlow
          ariaLabel="自前RTKの基準局を準備する流れ"
          steps={gnssOwnBaseStationOverviewFlow}
        />
        <blockquote className="gnss-important-message">
          正しい基準局をつくるには、基準となる座標を決め、その座標とGNSSアンテナを正しく結び付け、安定して観測できる状態にする必要があります。
        </blockquote>
        <p className="gnss-own-base-distinction">
          <strong>GNSS受信機を設置できた</strong>
          <span aria-hidden="true">≠</span>
          <strong>測量成果の基準として適切な基準局をつくれた</strong>
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-elements-title"
        className="gnss-card"
        data-gnss-own-base-card="2"
        data-testid="gnss-own-base-elements-card"
      >
        <GnssOwnBaseCardHeading
          description="正しい基準局を、基準となる座標・現地アンテナ・GNSS観測環境の3要素に分けて見通します。"
          index={2}
          label="3要素"
          title={gnssOwnBaseStationCards[1].title}
          titleId="gnss-own-base-elements-title"
        />
        <div className="gnss-own-base-element-grid">
          {gnssOwnBaseStationElements.map((element) => (
            <article data-element-id={element.id} key={element.id}>
              <span>{element.numberLabel}</span>
              <h3>{element.title}</h3>
              <p>{element.question}</p>
              <small>→ {element.linkedCards}</small>
            </article>
          ))}
        </div>
        <p className="gnss-own-base-all-check">
          <strong>全部まとめて確認</strong>
          <span>→ カード8</span>
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-coordinate-source-title"
        className="gnss-card"
        data-gnss-own-base-card="3"
        data-testid="gnss-own-base-coordinate-source-card"
      >
        <GnssOwnBaseCardHeading
          description="4つの入口を同じ精度・同じ成果価値とは考えず、座標の出どころと利用目的を比較します。"
          index={3}
          label="静的比較表"
          title={gnssOwnBaseStationCards[2].title}
          titleId="gnss-own-base-coordinate-source-title"
        />
        <p className="gnss-own-base-card-question">
          基準局へ設定する座標には、どのような用意の仕方があるのでしょうか？
        </p>
        <div
          aria-label="基準局座標の4つの用意の仕方"
          className="gnss-table-scroll"
          data-testid="gnss-own-base-coordinate-source-table"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-own-base-table gnss-own-base-coordinate-table">
            <caption>座標の用意の仕方と第5章で理解すること</caption>
            <thead>
              <tr>
                <th>座標の用意の仕方</th>
                <th>第5章で理解すること</th>
              </tr>
            </thead>
            <tbody>
              {gnssOwnBaseCoordinateSources.map((source) => (
                <tr data-coordinate-source-id={source.id} key={source.id}>
                  <th>{source.label}</th>
                  <td>{source.understanding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <blockquote className="gnss-important-message">
          大切なのは「座標値が表示されているか」だけではなく、その座標がどこから得られ、今回必要とする成果の基準として適切かを確認することです。
        </blockquote>
        <div className="gnss-own-base-coordinate-notes">
          <p>
            <strong>サーベイイン等：</strong>
            受信機側で基準局位置を求める方法がありますが、その座標が今回の成果に使用できるかは別途判断します。
          </p>
          <p>
            <strong>単独測位：</strong>
            基準局や補正サービスからの外部補正情報を使わず、衛星から受信した信号や航法情報を利用して受信機自身で位置を求めます。
          </p>
        </div>
        <p className="gnss-own-base-warning-message">
          基準局受信機を起動しただけで、国家座標等へ正しく整合した基準局座標が自動的に決まるとは限りません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-known-point-title"
        className="gnss-card"
        data-gnss-own-base-card="4"
        data-testid="gnss-own-base-known-point-card"
      >
        <GnssOwnBaseCardHeading
          description="第1章から続く教材用仮想現場の既知点Aを使い、成果確認からアンテナ設置までをつなぎます。"
          index={4}
          label="既存教材値"
          title={gnssOwnBaseStationCards[3].title}
          titleId="gnss-own-base-known-point-title"
        />
        <GnssOwnBaseFlow
          ariaLabel="既知点Aを使って基準局をつくる流れ"
          steps={gnssOwnBaseKnownPointFlow}
        />
        <div
          className="gnss-own-base-known-values"
          data-testid="gnss-own-base-known-point-values"
        >
          <header>
            <span>既存教材値を再利用</span>
            <strong>既知点 {knownPoint.name}</strong>
          </header>
          <dl>
            {gnssOwnBaseKnownPointResultChecks.map((check) => (
              <div key={check.id}>
                <dt>{check.label}</dt>
                <dd>{knownPointResultValues[check.id]}</dd>
              </div>
            ))}
            <div>
              <dt>基準局アンテナ高</dt>
              <dd>{baseStation.antennaHeight.toFixed(3)} m</dd>
            </div>
          </dl>
          <p>この座標と高さは実在点の成果ではなく、教材用の仮想値です。</p>
        </div>
        <div className="gnss-own-base-equipment-example">
          <span>自前基準局の具体例</span>
          <strong>Drogger Pパッケージ</strong>
          <p>{baseStation.equipment}</p>
          <small>製品操作マニュアルではなく、基準局の役割を理解するための例です。</small>
        </div>
        <blockquote className="gnss-important-message">
          基準局座標として使用する成果の条件を確認する必要があります。測地系や座標の時点、高さの詳細は第3章の学習内容を参照します。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-own-base-no-known-point-title"
        className="gnss-card"
        data-gnss-own-base-card="5"
        data-testid="gnss-own-base-no-known-point-card"
      >
        <GnssOwnBaseCardHeading
          description="基準局候補点Bの座標が未確定な場合に、まず必要な成果を分けて考えます。"
          index={5}
          label="静的分岐フロー"
          title={gnssOwnBaseStationCards[4].title}
          titleId="gnss-own-base-no-known-point-title"
        />
        <div className="gnss-own-base-branch-start">
          <span>基準局候補点 B</span>
          <strong>座標：まだ確定していない</strong>
          <p>BへGNSS受信機を置けば、そのまま測量用の正しい基準局になるのでしょうか？</p>
          <b aria-hidden="true">↓</b>
          <strong>何の成果が必要？</strong>
        </div>
        <div className="gnss-own-base-branch-grid">
          {gnssOwnBaseNoKnownPointBranches.map((branch) => (
            <article data-branch-id={branch.id} key={branch.id}>
              <h3>{branch.title}</h3>
              <b aria-hidden="true">↓</b>
              <p>{branch.result}</p>
            </article>
          ))}
        </div>
        <blockquote className="gnss-important-message">
          相対的な位置関係を高精度に求められることと、その結果が国家座標等へ正しく整合していることは別です。
        </blockquote>
        <div className="gnss-own-base-not-equal-grid">
          <p>
            <strong>既知点がない</strong>
            <span>≠ 自前RTKが一切できない</span>
          </p>
          <p>
            <strong>RTKでFIXした</strong>
            <span>≠ 基準局候補点Bの絶対座標も正しい</span>
          </p>
        </div>
        <GnssOwnBaseFlow
          ariaLabel="既知点がない場合に基準局座標を決める範囲"
          steps={gnssOwnBaseNoKnownPointFlow}
        />
        <p className="gnss-figure-note">
          点Bを決める具体的なスタティック観測、RINEX、基線解析、網平均、セミ・ダイナミック補正は後続章で扱います。
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-antenna-title"
        className="gnss-card"
        data-gnss-own-base-card="6"
        data-testid="gnss-own-base-antenna-card"
      >
        <GnssOwnBaseCardHeading
          description="決めた座標が示す地上の点と、実際のGNSSアンテナ位置を正しく結び付けます。"
          index={6}
          label="静的模式図"
          title={gnssOwnBaseStationCards[5].title}
          titleId="gnss-own-base-antenna-title"
        />
        <div className="gnss-own-base-antenna-layout">
          <div
            aria-label={`既知点Aの上へ、アンテナ高${baseStation.antennaHeight.toFixed(3)} mでGNSSアンテナを設置する模式図`}
            className="gnss-own-base-antenna-diagram"
            role="img"
          >
            <strong>GNSSアンテナ</strong>
            <span aria-hidden="true">●</span>
            <b aria-hidden="true" />
            <p>アンテナ高 {baseStation.antennaHeight.toFixed(3)} m</p>
            <b aria-hidden="true" />
            <span aria-hidden="true">◎</span>
            <strong>既知点 {knownPoint.name}</strong>
          </div>
          <ul className="gnss-own-base-check-list">
            {gnssOwnBaseAntennaChecks.map((check) => (
              <li key={check.id}>
                <span aria-hidden="true">✓</span>
                {check.label}
              </li>
            ))}
          </ul>
        </div>
        <blockquote className="gnss-important-message">
          既知点の座標を入力するだけでは不十分です。その座標が示す地上の点と、実際のGNSSアンテナ位置を正しく結び付ける必要があります。
        </blockquote>
        <p className="gnss-own-base-review-note">
          第3章で学んだアンテナ位置と測点位置の関係を、ここでは実際の基準局設置へつなげています。機種固有のアンテナ基準位置は扱いません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-site-title"
        className="gnss-card"
        data-gnss-own-base-card="7"
        data-testid="gnss-own-base-site-card"
      >
        <GnssOwnBaseCardHeading
          description="座標だけでなく、基準局側で安定したGNSS観測を続けられる場所かを確認します。"
          index={7}
          label="静的左右比較"
          title={gnssOwnBaseStationCards[6].title}
          titleId="gnss-own-base-site-title"
        />
        <div className="gnss-own-base-site-comparison">
          {gnssOwnBaseSiteExamples.map((example) => (
            <article data-site-example-id={example.id} key={example.id}>
              <header>
                <span aria-hidden="true">{example.marker}</span>
                <h3>{example.title}</h3>
              </header>
              <ul>
                {example.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <ul className="gnss-own-base-check-list gnss-own-base-site-checks">
          {gnssOwnBaseSiteChecks.map((check) => (
            <li key={check.id}>
              <span aria-hidden="true">✓</span>
              {check.label}
            </li>
          ))}
        </ul>
        <blockquote className="gnss-important-message">
          基準局は「座標が正しい場所」に置くだけでなく、GNSSを安定して観測でき、観測中に動かない場所へ設置します。
        </blockquote>
        <p className="gnss-own-base-review-note">
          移動局だけでなく、基準局側でも良いGNSS観測が必要です。山地・森林の具体的判断は後続の難条件章で扱います。
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-final-check-title"
        className="gnss-card"
        data-gnss-own-base-card="8"
        data-testid="gnss-own-base-final-check-card"
      >
        <GnssOwnBaseCardHeading
          description="カード3～7で確認した座標・設置・観測環境を、基準局として使う前の表へまとめます。"
          index={8}
          label="静的確認表"
          title={gnssOwnBaseStationCards[7].title}
          titleId="gnss-own-base-final-check-title"
        />
        <div
          aria-label="基準局として使う前の8項目確認表"
          className="gnss-table-scroll"
          data-testid="gnss-own-base-final-check-table"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-own-base-table gnss-own-base-final-check-table">
            <caption>基準局として使う前の確認</caption>
            <thead>
              <tr>
                <th>確認するもの</th>
                <th>なぜ必要？</th>
              </tr>
            </thead>
            <tbody>
              {gnssOwnBasePreUseChecks.map((check) => (
                <tr data-pre-use-check-id={check.id} key={check.id}>
                  <th>{check.item}</th>
                  <td>{check.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-own-base-ready-message">
          基準局の座標・設置・観測環境を確認できました。これで基準局そのものの準備はできました。
        </p>
      </section>

      <section
        aria-labelledby="gnss-own-base-next-title"
        className="gnss-card"
        data-gnss-own-base-card="9"
        data-testid="gnss-own-base-next-card"
      >
        <GnssOwnBaseCardHeading
          description="準備した基準局の情報を移動局P1へ届ける、次の工程へつなぎます。"
          index={9}
          label="第6章への接続"
          title={gnssOwnBaseStationCards[8].title}
          titleId="gnss-own-base-next-title"
        />
        <GnssOwnBaseFlow
          ariaLabel="基準局の準備から第6章へ進む流れ"
          steps={gnssOwnBaseNextChapterFlow}
        />
        <p className="gnss-own-base-next-question">
          基準局側の情報は、どんな形で、どの経路を通って移動局へ届くのでしょうか？
        </p>
        <div className="gnss-own-base-next-terms" aria-label="第6章の予告用語">
          <span>RTCM</span>
          <span>Ntrip</span>
          <span>Caster</span>
          <span>通信経路</span>
        </div>
        <p className="gnss-figure-note">
          ここでは名称だけを予告します。情報形式、設定、通信シミュレーションは第6章で扱います。
        </p>

        <div
          aria-labelledby="gnss-own-base-station-quiz-title"
          className="gnss-quiz-section"
          data-testid="gnss-own-base-station-quiz-panel"
        >
          <div className="gnss-quiz-heading">
            <span>第5章 確認問題</span>
            <h3 id="gnss-own-base-station-quiz-title">
              基準局座標・設置・使用前確認を8問で確認する
            </h3>
            <p>回答状態はReact状態だけに保持し、ページ再読込み後は初期化します。</p>
          </div>

          <div className="gnss-quiz-list">
            {gnssOwnBaseStationQuizQuestions.map(
              (question, questionIndex) => {
                const answerState = quizAnswerStates[question.id];
                const evaluation = answerState?.isAnswered
                  ? evaluateGnssOwnBaseStationQuizAnswer(
                      question.id,
                      answerState.selectedOptionId,
                    )
                  : null;
                const correctOptionLetter =
                  getGnssOwnBaseStationQuizOptionLetter(
                    question.id,
                    question.correctOptionId,
                  );
                const selectedOptionLetter = evaluation
                  ? getGnssOwnBaseStationQuizOptionLetter(
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
                        <strong>
                          {evaluation.isCorrect ? "正解" : "不正解"}
                        </strong>
                        {correctOptionLetter ? (
                          <p className="gnss-quiz-correct-answer">
                            正解：{correctOptionLetter}
                          </p>
                        ) : null}
                        {!evaluation.isCorrect &&
                        evaluation.selectedAnswerReason &&
                        selectedOptionLetter ? (
                          <section className="gnss-quiz-explanation gnss-quiz-selected-explanation">
                            <h5>
                              {selectedOptionLetter}を選んだ場合の解説
                            </h5>
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

export default GnssOwnBaseStationLesson;
