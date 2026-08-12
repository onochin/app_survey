import { useState } from "react";
import {
  evaluateGnssCorrectionDeliveryQuizAnswer,
  getGnssCorrectionDeliveryQuizOptionLetter,
  getGnssCorrectionDiagnosticCase,
  getGnssCorrectionFreshnessState,
  gnssCorrectionBaseInformation,
  gnssCorrectionConcepts,
  gnssCorrectionConnectionSettings,
  gnssCorrectionDeliveryCards,
  gnssCorrectionDeliveryMapSteps,
  gnssCorrectionDeliveryMethods,
  gnssCorrectionDeliveryQuizQuestions,
  gnssCorrectionDiagnosticCases,
  gnssCorrectionDiagnosticOrder,
  gnssCorrectionFreshnessChecks,
  gnssCorrectionFreshnessStates,
  gnssCorrectionMountpoints,
  gnssCorrectionNtripRoles,
  gnssCorrectionRequestResponse,
  gnssCorrectionRtcmMessages,
  gnssCorrectionRtcmStream,
} from "../data/gnssCorrectionDelivery";
import { gnssCorrectionDeliveryLesson } from "../gnssCourse";
import type {
  GnssCorrectionDiagnosticCaseId,
  GnssCorrectionFreshnessId,
} from "../types";

interface GnssCorrectionDeliveryLessonProps {
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

interface GnssCorrectionCardHeadingProps {
  readonly description: string;
  readonly index: number;
  readonly label: string;
  readonly title: string;
  readonly titleId: string;
}

function GnssCorrectionCardHeading({
  description,
  index,
  label,
  title,
  titleId,
}: GnssCorrectionCardHeadingProps) {
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

function GnssCorrectionMap({
  ariaLabel,
  compact = false,
  highlightStepId,
}: {
  readonly ariaLabel: string;
  readonly compact?: boolean;
  readonly highlightStepId?: string;
}) {
  return (
    <ol
      aria-label={ariaLabel}
      className={`gnss-correction-map${compact ? " is-compact" : ""}`}
    >
      {gnssCorrectionDeliveryMapSteps.map((step, index) => {
        const isCurrent = step.id === highlightStepId;

        return (
          <li
            aria-current={isCurrent ? "step" : undefined}
            className={isCurrent ? "is-current" : ""}
            data-correction-map-step-id={step.id}
            key={step.id}
          >
            <span>{step.numberLabel}</span>
            <div>
              <strong>{step.label}</strong>
              {compact ? null : <small>{step.detail}</small>}
            </div>
            {index < gnssCorrectionDeliveryMapSteps.length - 1 ? (
              <b aria-hidden="true">↓</b>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function GnssCorrectionSimpleFlow({
  ariaLabel,
  steps,
}: {
  readonly ariaLabel: string;
  readonly steps: readonly string[];
}) {
  return (
    <ol aria-label={ariaLabel} className="gnss-correction-simple-flow">
      {steps.map((step, index) => (
        <li key={`${step}-${index}`}>
          <span>{step}</span>
          {index < steps.length - 1 ? <b aria-hidden="true">↓</b> : null}
        </li>
      ))}
    </ol>
  );
}

function GnssCorrectionDeliveryLesson({
  completedLessonCount,
  totalLessonCount,
}: GnssCorrectionDeliveryLessonProps) {
  const [freshnessId, setFreshnessId] =
    useState<GnssCorrectionFreshnessId>("fresh");
  const [diagnosticCaseId, setDiagnosticCaseId] =
    useState<GnssCorrectionDiagnosticCaseId>("no-rtcm-output");
  const [quizAnswerStates, setQuizAnswerStates] =
    useState<GnssQuizAnswerStateMap>({});
  const progressPercent =
    totalLessonCount > 0
      ? Math.round((completedLessonCount / totalLessonCount) * 100)
      : 0;
  const freshnessState =
    getGnssCorrectionFreshnessState(freshnessId) ??
    gnssCorrectionFreshnessStates[0];
  const diagnosticCase =
    getGnssCorrectionDiagnosticCase(diagnosticCaseId) ??
    gnssCorrectionDiagnosticCases[0];

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
      evaluateGnssCorrectionDeliveryQuizAnswer(
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
    <div data-lesson-id={gnssCorrectionDeliveryLesson.id}>
      <section
        aria-labelledby="gnss-correction-delivery-course-title"
        className="gnss-card gnss-chapter-card"
        data-gnss-correction-card="1"
        data-testid="gnss-correction-intro-card"
        id="gnss-correction-delivery"
        tabIndex={-1}
      >
        <div className="gnss-card-index">カード 1 / 9</div>
        <div className="gnss-chapter-layout">
          <div className="gnss-chapter-copy">
            <span className="gnss-course-eyebrow">GNSS COURSE · PHASE 6</span>
            <h1 id="gnss-correction-delivery-course-title">GNSS測量</h1>
            <p className="gnss-chapter-number">第6章</p>
            <h2>{gnssCorrectionDeliveryCards[0].title}</h2>
            <p>{gnssCorrectionDeliveryLesson.description}</p>
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
            <p className="gnss-correction-session-note">
              第6章の操作・回答は、この画面を開いている間だけ保持します。
            </p>
          </div>
        </div>

        <div className="gnss-chapter-metadata">
          <div className="gnss-goal-panel">
            <span>到達目標</span>
            <strong>{gnssCorrectionDeliveryLesson.learningGoal}</strong>
          </div>
          <div>
            <h3>主な用語</h3>
            <div className="gnss-term-list">
              {gnssCorrectionDeliveryLesson.terms.map((term) => (
                <span key={term}>{term}</span>
              ))}
            </div>
          </div>
          <div className="gnss-caution-panel">
            <h3>この章で確認すること</h3>
            <ul>
              {gnssCorrectionDeliveryLesson.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="gnss-correction-opening-question">
          <span>第5章からの接続</span>
          <p>
            第5章では、基準局座標・アンテナ・GNSS観測環境を確認し、基準局として使える状態を準備しました。
          </p>
          <strong>
            では、離れたP1の移動局は、その基準局の情報をどうやって受け取るのでしょうか？
          </strong>
        </div>
        <blockquote className="gnss-important-message">
          基準局を設置しただけでは、自前RTKはまだ成立していません。基準局側で得られた情報を、移動局へ継続して届ける必要があります。
        </blockquote>
        <GnssCorrectionMap
          ariaLabel="GNSS衛星から移動局P1へRTCMが届くまでの第6章全体図"
          highlightStepId="rover-receive"
        />
        <div className="gnss-correction-chapter-boundary">
          <p>
            <strong>第6章</strong>
            <span>情報を届ける</span>
          </p>
          <b aria-hidden="true">↓</b>
          <p>
            <strong>第7章</strong>
            <span>届いた情報を使ってFLOAT / FIXを理解する</span>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="gnss-correction-base-information-title"
        className="gnss-card"
        data-gnss-correction-card="2"
        data-testid="gnss-correction-base-information-card"
      >
        <GnssCorrectionCardHeading
          description="基準局から届くものを、基準局位置と基準局側のGNSS観測に分けて整理します。"
          index={2}
          label="静的模式図"
          title={gnssCorrectionDeliveryCards[1].title}
          titleId="gnss-correction-base-information-title"
        />
        <GnssCorrectionMap
          ariaLabel="基準局側情報をRTCMとして出力する位置"
          compact
          highlightStepId="rtcm-output"
        />
        <p className="gnss-correction-misconception">
          <strong>基準局</strong>
          <span>≠</span>
          <strong>P1の完成したX・Y・高さを計算して送る装置</strong>
        </p>
        <div className="gnss-correction-information-grid">
          {gnssCorrectionBaseInformation.map((information) => (
            <article data-base-information-id={information.id} key={information.id}>
              <span>{information.numberLabel}</span>
              <h3>{information.question}</h3>
              <p>{information.answer}</p>
            </article>
          ))}
        </div>
        <div
          aria-label="基準局Aと移動局P1がGNSSを観測する模式図"
          className="gnss-correction-observation-diagram"
          role="img"
        >
          <strong>GNSS衛星</strong>
          <div>
            <article>
              <b>基準局A</b>
              <span>GNSS観測</span>
              <span>基準局位置</span>
            </article>
            <p>
              <span>RTCM</span>
              <b aria-hidden="true">→</b>
            </p>
            <article>
              <b>移動局P1</b>
              <span>GNSS観測</span>
              <span>基準局側情報を受信</span>
            </article>
          </div>
          <small>基準局側情報 ＋ P1自身の観測 → 第7章で扱う</small>
        </div>
        <div className="gnss-correction-message-grid">
          {gnssCorrectionRtcmMessages
            .filter((message) => message.number !== "1087")
            .map((message) => (
              <article data-rtcm-message={message.number} key={message.id}>
                <span>RTCM</span>
                <strong>{message.number}</strong>
                <p>{message.meaning}</p>
              </article>
            ))}
        </div>
        <p className="gnss-figure-note">
          1005は基準局ARP位置を表す教材例です。平面直角座標X・Yそのものとは説明しません。番号の暗記が目的ではありません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-correction-rtcm-title"
        className="gnss-card"
        data-gnss-correction-card="3"
        data-testid="gnss-correction-rtcm-card"
      >
        <GnssCorrectionCardHeading
          description="1個の補正値や完成ファイルではなく、複数のメッセージが継続して流れるストリームとして捉えます。"
          index={3}
          label="静的ストリーム"
          title={gnssCorrectionDeliveryCards[2].title}
          titleId="gnss-correction-rtcm-title"
        />
        <GnssCorrectionMap
          ariaLabel="第6章全体図のRTCM出力部分"
          compact
          highlightStepId="rtcm-output"
        />
        <blockquote className="gnss-important-message">
          RTCMは、基準局の位置やGNSS観測などを、機器どうしで共通して扱えるように決めたデータ形式・メッセージ規格です。
        </blockquote>
        <p className="gnss-correction-equation">
          <strong>RTCM</strong>
          <span>＝</span>
          <b>GNSS情報の共通の書き方</b>
        </p>
        <div
          aria-label="複数のRTCMメッセージが継続して流れるストリーム"
          className="gnss-correction-stream"
          data-testid="gnss-correction-rtcm-stream"
        >
          <header>
            <strong>基準局A</strong>
            <span>RTCMストリーム</span>
          </header>
          <ol>
            {gnssCorrectionRtcmStream.map((streamItem) => {
              const message = gnssCorrectionRtcmMessages.find(
                (candidate) => candidate.number === streamItem.messageNumber,
              );

              if (!message) {
                return null;
              }

              return (
                <li data-stream-message={streamItem.messageNumber} key={streamItem.id}>
                  <span>RTCM {streamItem.messageNumber}</span>
                  <strong>{message.meaning}</strong>
                  <small>{streamItem.timing}</small>
                </li>
              );
            })}
          </ol>
          <p>…複数種類のメッセージが、それぞれの設定に応じて継続して流れる</p>
        </div>
        <p className="gnss-correction-review-note">
          各メッセージがすべて同じ周期とは限りません。利用者が1005・1077・1097・1127を1個ずつ選ぶのではなく、受信機が届いた適切なRTCMを内部で整理して利用します。
        </p>
      </section>

      <section
        aria-labelledby="gnss-correction-ntrip-title"
        className="gnss-card"
        data-gnss-correction-card="4"
        data-testid="gnss-correction-ntrip-card"
      >
        <GnssCorrectionCardHeading
          description="情報の中身であるRTCMと、IPネットワーク上で運ぶ仕組みであるNtripを比較します。"
          index={4}
          label="静的比較"
          title={gnssCorrectionDeliveryCards[3].title}
          titleId="gnss-correction-ntrip-title"
        />
        <GnssCorrectionMap
          ariaLabel="第6章全体図のIPネットワーク部分"
          compact
          highlightStepId="upstream-network"
        />
        <div className="gnss-correction-concept-grid">
          {gnssCorrectionConcepts.map((concept) => (
            <article data-correction-concept-id={concept.id} key={concept.id}>
              <span>{concept.label}</span>
              <strong>{concept.shortMeaning}</strong>
              <p>{concept.meaning}</p>
            </article>
          ))}
        </div>
        <p className="gnss-correction-route-summary">
          <span>基準局</span>
          <b aria-hidden="true">→</b>
          <span>RTCM</span>
          <b aria-hidden="true">→</b>
          <span>Ntrip</span>
          <b aria-hidden="true">→</b>
          <span>一般にはインターネット</span>
          <b aria-hidden="true">→</b>
          <span>移動局</span>
        </p>
        <blockquote className="gnss-important-message">
          NtripはIPネットワーク上でGNSSデータをストリーミングする仕組みで、一般的な利用ではインターネット経由で使われます。
        </blockquote>
        <p className="gnss-correction-review-note">
          Ntripに公衆インターネットが絶対に必要という意味ではありません。公衆インターネット以外のローカルIPネットワークで構成する応用も考えられます。
        </p>
      </section>

      <section
        aria-labelledby="gnss-correction-caster-title"
        className="gnss-card"
        data-gnss-correction-card="5"
        data-testid="gnss-correction-caster-card"
      >
        <GnssCorrectionCardHeading
          description="Casterが扱う複数ストリームと、1本を選ぶMountpoint名を整理します。"
          index={5}
          label="静的配信図"
          title={gnssCorrectionDeliveryCards[4].title}
          titleId="gnss-correction-caster-title"
        />
        <GnssCorrectionMap
          ariaLabel="第6章全体図のNtrip Caster部分"
          compact
          highlightStepId="caster"
        />
        <div className="gnss-correction-caster-role">
          <span>Ntrip Caster</span>
          <strong>複数のGNSSデータストリームを扱う配信所</strong>
          <ul>
            <li>Ntrip Server等からストリームを受け取る</li>
            <li>ストリームを識別する</li>
            <li>Ntrip Clientへ配信する</li>
          </ul>
          <small>CasterはP1のFLOAT → FIXを計算する装置ではありません。</small>
        </div>
        <div className="gnss-correction-mountpoint-panel">
          <header>
            <span>Mountpoint</span>
            <strong>Caster内の1本のGNSSデータストリームを識別する名前</strong>
          </header>
          <div>
            {gnssCorrectionMountpoints.map((mountpoint) => (
              <article data-mountpoint-id={mountpoint.id} key={mountpoint.id}>
                <h3>Mountpoint：{mountpoint.name}</h3>
                <p>{mountpoint.description}</p>
                <ul>
                  {mountpoint.messageNumbers.map((messageNumber) => (
                    <li key={messageNumber}>{messageNumber}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
        <p className="gnss-correction-misconception is-light">
          <strong>Mountpoint：BASE_A</strong>
          <span>≠</span>
          <strong>RTCM番号・基準局座標・アンテナの物理的据付点</strong>
        </p>
        <div
          aria-label="教材用Host、Port、Mountpoint設定例"
          className="gnss-table-scroll"
          data-testid="gnss-correction-settings-table"
          role="region"
          tabIndex={0}
        >
          <table className="gnss-correction-settings-table">
            <caption>教材用の仮想設定値（実在サービスではありません）</caption>
            <thead>
              <tr>
                <th>設定項目</th>
                <th>教材用仮想値</th>
                <th>意味</th>
              </tr>
            </thead>
            <tbody>
              {gnssCorrectionConnectionSettings.map((setting) => (
                <tr key={setting.id}>
                  <th>{setting.label}</th>
                  <td>{setting.value}</td>
                  <td>{setting.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gnss-figure-note">
          実際には、同じ基準局から設定の異なる複数ストリームを別Mountpointとして提供する場合もあります。
        </p>
      </section>

      <section
        aria-labelledby="gnss-correction-route-title"
        className="gnss-card"
        data-gnss-correction-card="6"
        data-testid="gnss-correction-route-card"
      >
        <GnssCorrectionCardHeading
          description="カード2～5の用語を1本の自前RTK経路へ戻し、要求と配信の向きも確認します。"
          index={6}
          label="静的信息経路"
          title={gnssCorrectionDeliveryCards[5].title}
          titleId="gnss-correction-route-title"
        />
        <GnssCorrectionMap ariaLabel="自前RTKの8段階の情報経路" />
        <div
          aria-label="Ntrip ClientとNtrip Casterの要求・配信方向"
          className="gnss-correction-request-response"
          data-testid="gnss-correction-request-response"
        >
          {gnssCorrectionRequestResponse.map((flow) => (
            <article data-flow-direction-id={flow.id} key={flow.id}>
              <strong>{flow.from}</strong>
              <p>
                <span>{flow.payload}</span>
                <b aria-hidden="true">→</b>
              </p>
              <strong>{flow.to}</strong>
            </article>
          ))}
        </div>
        <div className="gnss-correction-role-grid">
          {gnssCorrectionNtripRoles.map((role) => (
            <article data-ntrip-role-id={role.id} key={role.id}>
              <h3>{role.label}</h3>
              <p>{role.role}</p>
            </article>
          ))}
        </div>
        <p className="gnss-correction-review-note">
          Ntrip Server / Clientは、まず通信上の役割名として理解します。実機ではGNSS受信機やアプリの中に、その機能が含まれる場合があります。必ず別々の箱型ハードウェアが必要なわけではありません。
        </p>
        <div className="gnss-correction-analysis-boundary">
          <div>
            <strong>移動局P1</strong>
            <span>RTCM受信</span>
            <b>＋</b>
            <span>移動局自身もGNSS観測</span>
          </div>
          <p>
            <span>ここから第7章</span>
            <strong>FLOAT / FIX</strong>
          </p>
        </div>
        <blockquote className="gnss-important-message">
          RTCMが届いたこととFIXしたことは同じではありません。
        </blockquote>
      </section>

      <section
        aria-labelledby="gnss-correction-other-route-title"
        className="gnss-card"
        data-gnss-correction-card="7"
        data-testid="gnss-correction-other-route-card"
      >
        <GnssCorrectionCardHeading
          description="RTCMという中身を、Ntrip経路とNtripを使わない経路の両方で比較します。"
          index={7}
          label="静的左右比較"
          title={gnssCorrectionDeliveryCards[6].title}
          titleId="gnss-correction-other-route-title"
        />
        <GnssCorrectionMap
          ariaLabel="第6章全体図で届ける中身となるRTCM"
          compact
          highlightStepId="rtcm-output"
        />
        <p className="gnss-correction-card-question">
          携帯通信圏外では、自前RTKはできないのでしょうか？
        </p>
        <p className="gnss-correction-equation is-centered">
          <strong>RTCM</strong>
          <span>＝</span>
          <b>中身</b>
          <strong>Ntrip</strong>
          <span>＝</span>
          <b>届け方の1つ</b>
        </p>
        <div className="gnss-correction-method-grid">
          {gnssCorrectionDeliveryMethods.map((method) => (
            <article data-delivery-method-id={method.id} key={method.id}>
              <h3>{method.title}</h3>
              <GnssCorrectionSimpleFlow
                ariaLabel={`${method.title}のRTCM伝送経路`}
                steps={method.path}
              />
              {method.notRequired.length > 0 ? (
                <p>
                  <strong>この経路では不要：</strong>
                  {method.notRequired.join(" / ")}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <blockquote className="gnss-important-message">
          携帯圏外 ＝ 自前RTKができない、ではありません。重要なのは、基準局側のRTCMを必要な鮮度で継続して移動局へ届けられる通信経路を用意することです。
        </blockquote>
        <p className="gnss-correction-review-note">
          本教材では、Ntrip / Casterを介さず別の通信経路でRTCMを移動局へ届ける構成を、説明上「RTCMを直接届ける」と表現します。「直接RTCM」という正式な通信規格名ではありません。
        </p>
        <p className="gnss-figure-note">
          無線を使えば必ずRTKできるという意味ではありません。自社機器、周波数、電波法、通信距離、配線等の具体構成は将来の応用編で確認します。
        </p>
      </section>

      <section
        aria-labelledby="gnss-correction-freshness-title"
        className="gnss-card"
        data-gnss-correction-card="8"
        data-testid="gnss-correction-freshness-card"
      >
        <GnssCorrectionCardHeading
          description="通信接続とRTCM更新を分け、正常・遅延・停止の模式状態を切り替えて比べます。"
          index={8}
          label="操作あり"
          title={gnssCorrectionDeliveryCards[7].title}
          titleId="gnss-correction-freshness-title"
        />
        <blockquote className="gnss-important-message">
          通信接続できていることと、新しいRTCMが継続して届いていることは別です。
        </blockquote>
        <div
          aria-label="RTCM更新状態を選択"
          className="gnss-correction-selector"
          data-testid="gnss-correction-freshness-selector"
          role="group"
        >
          {gnssCorrectionFreshnessStates.map((state) => (
            <button
              aria-pressed={state.id === freshnessId}
              data-testid={`gnss-correction-freshness-${state.id}`}
              key={state.id}
              onClick={() => setFreshnessId(state.id)}
              type="button"
            >
              {state.label}
            </button>
          ))}
        </div>
        <div
          aria-live="polite"
          className={`gnss-correction-freshness-result is-${freshnessState.id}`}
          data-freshness-id={freshnessState.id}
          data-testid="gnss-correction-freshness-result"
        >
          <header>
            <span>表示状態</span>
            <strong>{freshnessState.label}</strong>
          </header>
          <div
            aria-label={`${freshnessState.label}：${freshnessState.summary}`}
            className="gnss-correction-timeline"
            role="img"
          >
            <span>RTCM</span>
            <div aria-hidden="true">
              {freshnessState.timeline.map((hasArrival, index) => (
                <i className={hasArrival ? "is-arrival" : ""} key={index}>
                  {hasArrival ? "●" : "·"}
                </i>
              ))}
            </div>
            <b>→ 時間</b>
          </div>
          <dl>
            <div>
              <dt>接続</dt>
              <dd>{freshnessState.connectionLabel}</dd>
            </div>
            <div>
              <dt>更新</dt>
              <dd>{freshnessState.updateLabel}</dd>
            </div>
          </dl>
          <p>{freshnessState.summary}</p>
        </div>
        <div className="gnss-correction-freshness-checks">
          <h3>確認材料</h3>
          <ul>
            {gnssCorrectionFreshnessChecks.map((check) => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </div>
        <p className="gnss-correction-review-note">
          実機では機器・Caster・アプリにより表示名が異なります。教材では固定秒数を普遍的な正常・異常のしきい値にしません。
        </p>
      </section>

      <section
        aria-labelledby="gnss-correction-diagnosis-title"
        className="gnss-card"
        data-gnss-correction-card="9"
        data-testid="gnss-correction-diagnosis-card"
      >
        <GnssCorrectionCardHeading
          description="5つのケースを切り替え、情報経路を上流から順番に確認します。"
          index={9}
          label="操作あり"
          title={gnssCorrectionDeliveryCards[8].title}
          titleId="gnss-correction-diagnosis-title"
        />
        <blockquote className="gnss-important-message">
          RTCMが届かない場合は、情報経路を上流から順番に確認します。
        </blockquote>
        <GnssCorrectionSimpleFlow
          ariaLabel="RTCMが届かない場合の基本確認順"
          steps={gnssCorrectionDiagnosticOrder}
        />
        <div
          aria-label="トラブルケースを選択"
          className="gnss-correction-selector gnss-correction-case-selector"
          data-testid="gnss-correction-case-selector"
          role="group"
        >
          {gnssCorrectionDiagnosticCases.map((diagnostic) => (
            <button
              aria-pressed={diagnostic.id === diagnosticCaseId}
              data-testid={`gnss-correction-case-${diagnostic.id}`}
              key={diagnostic.id}
              onClick={() => setDiagnosticCaseId(diagnostic.id)}
              type="button"
            >
              <span>{diagnostic.caseLabel}</span>
              <strong>{diagnostic.title}</strong>
            </button>
          ))}
        </div>
        <div
          aria-live="polite"
          className="gnss-correction-diagnostic-result"
          data-diagnostic-case-id={diagnosticCase.id}
          data-testid="gnss-correction-diagnostic-result"
        >
          <header>
            <span>{diagnosticCase.caseLabel}</span>
            <h3>{diagnosticCase.title}</h3>
          </header>
          <dl>
            {diagnosticCase.statuses.map((status) => (
              <div className={`is-${status.tone}`} key={status.id}>
                <dt>{status.label}</dt>
                <dd>{status.value}</dd>
              </div>
            ))}
          </dl>
          <section>
            <span>正しい確認場所</span>
            <strong>{diagnosticCase.correctCheck}</strong>
            <p>{diagnosticCase.reason}</p>
          </section>
          {diagnosticCase.nextQuestion ? (
            <p className="gnss-correction-next-question">
              {diagnosticCase.nextQuestion}
            </p>
          ) : null}
        </div>
        <div className="gnss-correction-next-chapter">
          <section>
            <span>第6章</span>
            <strong>基準局 → RTCM → 通信経路 → 移動局</strong>
            <p>✓ RTCMが正しく継続して届いた</p>
          </section>
          <b aria-hidden="true">↓</b>
          <section>
            <span>第7章</span>
            <strong>届いた基準局側情報 ＋ 移動局自身のGNSS観測</strong>
            <p>相対的な位置関係 → FLOAT → FIX</p>
          </section>
        </div>
        <p className="gnss-correction-review-note">
          第6章では「基準局側情報を届けるところ」まで確認しました。第7章では、届いた情報と移動局自身のGNSS観測を利用して相対的な位置関係を求め、FLOAT / FIXへつながる流れを学びます。
        </p>

        <div
          aria-labelledby="gnss-correction-delivery-quiz-title"
          className="gnss-quiz-section"
          data-testid="gnss-correction-delivery-quiz-panel"
        >
          <div className="gnss-quiz-heading">
            <span>第6章 確認問題</span>
            <h3 id="gnss-correction-delivery-quiz-title">
              RTCM・Ntrip・情報経路を8問で確認する
            </h3>
            <p>回答状態はReact状態だけに保持し、ページ再読込み後は初期化します。</p>
          </div>

          <div className="gnss-quiz-list">
            {gnssCorrectionDeliveryQuizQuestions.map(
              (question, questionIndex) => {
                const answerState = quizAnswerStates[question.id];
                const evaluation = answerState?.isAnswered
                  ? evaluateGnssCorrectionDeliveryQuizAnswer(
                      question.id,
                      answerState.selectedOptionId,
                    )
                  : null;
                const correctOptionLetter =
                  getGnssCorrectionDeliveryQuizOptionLetter(
                    question.id,
                    question.correctOptionId,
                  );
                const selectedOptionLetter = evaluation
                  ? getGnssCorrectionDeliveryQuizOptionLetter(
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

export default GnssCorrectionDeliveryLesson;
