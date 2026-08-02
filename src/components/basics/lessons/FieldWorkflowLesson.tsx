import { useState } from "react";
import {
  evaluateFieldDecision,
  evaluateFieldWorkflowOrder,
  evaluateObservationRecordIssueSelection,
  fieldDecisionOptions,
  fieldDecisionScenarios,
  fieldValueKinds,
  fieldWorkflowConcepts,
  fieldWorkflowPhases,
  fieldWorkflowSteps,
  findObservationRecordIssues,
  initialFieldWorkflowStepOrder,
  moveFieldWorkflowStep,
  observationRecordFields,
  observationRecordSamples,
  preObservationChecklistGroups,
  preObservationChecklistItems,
  recordToResultStages,
  summarizePreObservationChecklist,
  type FieldDecisionId,
  type FieldValueKindId,
  type FieldWorkflowStepId,
  type ObservationRecordFieldId,
  type ObservationRecordSampleId,
  type PreObservationChecklistItemId,
  type RecordToResultStageId,
} from "../data/fieldWorkflow";
import DefinitionCard from "../ui/DefinitionCard";

type FieldDecisionScenarioId =
  (typeof fieldDecisionScenarios)[number]["id"];

const getWorkflowStep = (stepId: FieldWorkflowStepId) =>
  fieldWorkflowSteps.find((step) => step.id === stepId) ??
  fieldWorkflowSteps[0];

const getDecisionLabel = (decisionId: FieldDecisionId): string =>
  fieldDecisionOptions.find((option) => option.id === decisionId)?.label ??
  "未定義";

function FieldWorkflowLesson() {
  const [workflowOrder, setWorkflowOrder] = useState<
    readonly FieldWorkflowStepId[]
  >(initialFieldWorkflowStepOrder);
  const [workflowEvaluation, setWorkflowEvaluation] = useState<ReturnType<
    typeof evaluateFieldWorkflowOrder
  > | null>(null);
  const [checkedItemIds, setCheckedItemIds] = useState<
    readonly PreObservationChecklistItemId[]
  >([]);
  const [recordSampleId, setRecordSampleId] =
    useState<ObservationRecordSampleId>("height-settings-missing");
  const [selectedRecordFieldIds, setSelectedRecordFieldIds] = useState<
    readonly ObservationRecordFieldId[]
  >([]);
  const [recordEvaluation, setRecordEvaluation] = useState<ReturnType<
    typeof evaluateObservationRecordIssueSelection
  > | null>(null);
  const [decisionScenarioId, setDecisionScenarioId] =
    useState<FieldDecisionScenarioId>("checks-complete");
  const [selectedDecisionId, setSelectedDecisionId] =
    useState<FieldDecisionId | null>(null);
  const [valueKindId, setValueKindId] =
    useState<FieldValueKindId>("observed");
  const [flowStageId, setFlowStageId] =
    useState<RecordToResultStageId>("field-book");

  const checklistSummary = summarizePreObservationChecklist(checkedItemIds);
  const activeRecordSample =
    observationRecordSamples.find(
      (sample) => sample.id === recordSampleId,
    ) ?? observationRecordSamples[0];
  const activeRecordIssues = findObservationRecordIssues(
    activeRecordSample.record,
  );
  const activeDecisionScenario =
    fieldDecisionScenarios.find(
      (scenario) => scenario.id === decisionScenarioId,
    ) ?? fieldDecisionScenarios[0];
  const decisionEvaluation =
    selectedDecisionId === null
      ? null
      : evaluateFieldDecision(decisionScenarioId, selectedDecisionId);
  const activeValueKind =
    fieldValueKinds.find((kind) => kind.id === valueKindId) ??
    fieldValueKinds[0];
  const activeFlowStage =
    recordToResultStages.find((stage) => stage.id === flowStageId) ??
    recordToResultStages[0];

  const moveWorkflowStep = (
    stepId: FieldWorkflowStepId,
    direction: "up" | "down",
  ): void => {
    setWorkflowOrder((currentOrder) =>
      moveFieldWorkflowStep(currentOrder, stepId, direction),
    );
    setWorkflowEvaluation(null);
  };

  const toggleChecklistItem = (
    itemId: PreObservationChecklistItemId,
  ): void => {
    setCheckedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId],
    );
  };

  const selectRecordSample = (nextSampleId: ObservationRecordSampleId): void => {
    setRecordSampleId(nextSampleId);
    setSelectedRecordFieldIds([]);
    setRecordEvaluation(null);
  };

  const toggleRecordField = (fieldId: ObservationRecordFieldId): void => {
    setSelectedRecordFieldIds((currentIds) =>
      currentIds.includes(fieldId)
        ? currentIds.filter((currentId) => currentId !== fieldId)
        : [...currentIds, fieldId],
    );
    setRecordEvaluation(null);
  };

  const selectDecisionScenario = (
    nextScenarioId: FieldDecisionScenarioId,
  ): void => {
    setDecisionScenarioId(nextScenarioId);
    setSelectedDecisionId(null);
  };

  return (
    <div className="basics-field-lesson">
      <section
        aria-labelledby="field-overview-title"
        className="basics-field-intro"
      >
        <div className="basics-section-heading">
          <span>現場作業の全体像</span>
          <h3 id="field-overview-title">
            現場開始前・観測中・終了時を、一つの記録でつなぐ
          </h3>
        </div>
        <p className="basics-field-lead">
          測量は、機器で数値を得たら終わりではありません。
          <strong>計画、踏査、観測、現場検算、保存、計算、成果確認</strong>
          までを追跡できるように進めます。
        </p>
        <ol className="basics-field-phase-flow" aria-label="現場作業の3段階">
          {fieldWorkflowPhases.map((phase, index) => (
            <li key={phase.id}>
              <span>{index + 1}</span>
              <div>
                <small>{phase.label}</small>
                <h4>{phase.title}</h4>
                <p>{phase.description}</p>
                <strong>{phase.checkpoint}</strong>
              </div>
            </li>
          ))}
        </ol>
        <div className="basics-field-definition-grid">
          {fieldWorkflowConcepts.map((concept) => (
            <DefinitionCard
              className="basics-field-definition"
              icon={concept.icon}
              key={concept.id}
              title={concept.title}
            >
              {concept.description}
            </DefinitionCard>
          ))}
        </div>
        <p className="basics-field-scope-note">
          作業中止の判断、安全対策、観測の許容値は、測量方法、現場、適用規程、
          発注条件、機器によって異なります。本章では根拠のない共通数値を設定せず、
          現場ごとの条件を計画・記録・判断へつなぐ考え方を扱います。
        </p>
      </section>

      <section
        aria-labelledby="field-order-title"
        className="basics-visual-card basics-field-order-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">現場作業手順の並べ替え</span>
            <h3 id="field-order-title">
              13項目を「計画から成果確認まで」の基本順序にする
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↕</span>
            上下ボタンで移動
          </span>
        </div>
        <div className="basics-field-order-workspace">
          <ol className="basics-field-order-list">
            {workflowOrder.map((stepId, index) => {
              const step = getWorkflowStep(stepId);
              const phase = fieldWorkflowPhases.find(
                (candidate) => candidate.id === step.phase,
              )!;
              const isMismatch =
                workflowEvaluation?.firstMismatchIndex === index;

              return (
                <li className={isMismatch ? "is-mismatch" : ""} key={step.id}>
                  <span className="basics-field-order-number">{index + 1}</span>
                  <div>
                    <small>{phase.label}</small>
                    <strong>{step.label}</strong>
                    <p>{step.summary}</p>
                  </div>
                  <span className="basics-field-order-actions">
                    <button
                      aria-label={`${step.label}を上へ`}
                      disabled={index === 0}
                      onClick={() => moveWorkflowStep(step.id, "up")}
                      type="button"
                    >
                      ↑<span>上へ</span>
                    </button>
                    <button
                      aria-label={`${step.label}を下へ`}
                      disabled={index === workflowOrder.length - 1}
                      onClick={() => moveWorkflowStep(step.id, "down")}
                      type="button"
                    >
                      ↓<span>下へ</span>
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="basics-field-order-check">
            <div>
              <button
                onClick={() =>
                  setWorkflowEvaluation(
                    evaluateFieldWorkflowOrder(workflowOrder),
                  )
                }
                type="button"
              >
                順序を確認
              </button>
              <button
                className="is-secondary"
                onClick={() => {
                  setWorkflowOrder(initialFieldWorkflowStepOrder);
                  setWorkflowEvaluation(null);
                }}
                type="button"
              >
                初期の並びへ戻す
              </button>
            </div>
            <p
              className={
                workflowEvaluation === null
                  ? "is-pending"
                  : workflowEvaluation.isCorrect
                    ? "is-correct"
                    : "is-error"
              }
              data-testid="field-order-feedback"
              role="status"
            >
              {workflowEvaluation?.message ??
                "最初は機器点検と測点設置の順序が入れ替わっています。上下へ動かしてから確認してください。"}
            </p>
            <p className="basics-field-order-note">
              この並びは教材用の基本例です。踏査や点検で新しい条件が分かった場合は、
              前の段階へ戻って計画・観測順序・安全対策を更新します。
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="field-checklist-title"
        className="basics-field-section basics-field-checklist-section"
      >
        <div className="basics-section-heading">
          <span>観測前チェックリスト</span>
          <h3 id="field-checklist-title">
            観測値を得る前に、計画・現地・点・機器・記録をそろえる
          </h3>
        </div>
        <p className="basics-field-section-lead">
          チェックを付けること自体が目的ではありません。各項目を
          <strong>何と照合したか</strong>、異常時に誰がどう判断するかまで共有します。
        </p>
        <div className="basics-field-checklist-toolbar">
          <strong data-testid="field-checklist-progress">
            {checklistSummary.checkedCount} / {checklistSummary.totalCount} 項目確認
          </strong>
          <div>
            <button
              onClick={() =>
                setCheckedItemIds(
                  preObservationChecklistItems.map((item) => item.id),
                )
              }
              type="button"
            >
              すべて確認
            </button>
            <button
              className="is-secondary"
              onClick={() => setCheckedItemIds([])}
              type="button"
            >
              確認を外す
            </button>
          </div>
        </div>
        <div className="basics-field-checklist-groups">
          {preObservationChecklistGroups.map((group) => {
            const groupItems = preObservationChecklistItems.filter(
              (item) => item.groupId === group.id,
            );
            const isComplete = checklistSummary.completeGroupIds.includes(
              group.id,
            );

            return (
              <section className={isComplete ? "is-complete" : ""} key={group.id}>
                <header>
                  <h4>{group.label}</h4>
                  <span>{isComplete ? "確認済み" : "確認中"}</span>
                </header>
                <div>
                  {groupItems.map((item) => {
                    const isChecked = checkedItemIds.includes(item.id);

                    return (
                      <label className={isChecked ? "is-checked" : ""} key={item.id}>
                        <input
                          checked={isChecked}
                          onChange={() => toggleChecklistItem(item.id)}
                          type="checkbox"
                        />
                        <span aria-hidden="true">✓</span>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <div
          className={`basics-field-checklist-status ${
            checklistSummary.isComplete ? "is-complete" : ""
          }`}
          data-testid="field-checklist-status"
          role="status"
        >
          <strong>
            {checklistSummary.isComplete
              ? "14項目を確認しました。現場の現在状態と記録を最終照合します。"
              : `未確認 ${checklistSummary.remainingCount}項目`}
          </strong>
          {!checklistSummary.isComplete ? (
            <span>
              完了した分類：{checklistSummary.completeGroupIds.length} / {preObservationChecklistGroups.length}
            </span>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="field-record-title"
        className="basics-field-section basics-field-record-section"
      >
        <div className="basics-section-heading">
          <span>不足項目を含む観測記録</span>
          <h3 id="field-record-title">
            TS観測手簿から、追跡できない項目を探す
          </h3>
        </div>
        <p className="basics-field-section-lead">
          固定したTS観測記録の例です。空欄だけでなく、点・設定・原観測・点検・
          生データのつながりを見て、<strong>問題だと思う欄を選択</strong>してください。
        </p>
        <div
          aria-label="観測記録サンプルを選択"
          className="basics-field-record-selector"
        >
          {observationRecordSamples.map((sample) => (
            <button
              aria-pressed={sample.id === recordSampleId}
              className={sample.id === recordSampleId ? "is-selected" : ""}
              key={sample.id}
              onClick={() => selectRecordSample(sample.id)}
              type="button"
            >
              {sample.label}
            </button>
          ))}
        </div>
        <div className="basics-field-record-workspace">
          <div className="basics-field-record-sheet">
            <header>
              <div>
                <span>教材用TS観測記録</span>
                <h4>{activeRecordSample.label}</h4>
              </div>
              <strong>不足候補 {activeRecordIssues.length}項目</strong>
            </header>
            <p>{activeRecordSample.description}</p>
            <div className="basics-field-record-grid">
              {observationRecordFields.map((field) => {
                const value = activeRecordSample.record[field.id];
                const isMissing = value === null || value.trim() === "";
                const isSelected = selectedRecordFieldIds.includes(field.id);

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`${isMissing ? "is-empty" : ""} ${
                      isSelected ? "is-selected" : ""
                    }`}
                    data-testid={`record-field-${field.id}`}
                    key={field.id}
                    onClick={() => toggleRecordField(field.id)}
                    type="button"
                  >
                    <span>{field.group}</span>
                    <strong>{field.label}</strong>
                    <em>{isMissing ? "記載なし" : value}</em>
                    <small>
                      {isSelected ? "問題点として選択中" : "選択して問題点にする"}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
          <aside className="basics-field-record-evaluation">
            <span>問題点の判定</span>
            <h4>選択中 {selectedRecordFieldIds.length}項目</h4>
            <p>
              記載がある欄でも、内容の正しさは原資料との照合が必要です。
              ここでは固定例の「記載なし」を特定します。
            </p>
            <div>
              <button
                onClick={() =>
                  setRecordEvaluation(
                    evaluateObservationRecordIssueSelection(
                      activeRecordSample.record,
                      selectedRecordFieldIds,
                    ),
                  )
                }
                type="button"
              >
                選択した項目を判定
              </button>
              <button
                className="is-secondary"
                onClick={() => {
                  setSelectedRecordFieldIds([]);
                  setRecordEvaluation(null);
                }}
                type="button"
              >
                選択を外す
              </button>
            </div>
            <div
              className={`basics-field-record-feedback ${
                recordEvaluation?.isCorrect ? "is-correct" : ""
              }`}
              data-testid="field-record-feedback"
              role="status"
            >
              {recordEvaluation === null ? (
                <p>問題だと思う欄を選び、判定してください。</p>
              ) : recordEvaluation.isCorrect ? (
                <>
                  <strong>
                    不足{recordEvaluation.issueCount}項目をすべて特定しました。
                  </strong>
                  <p>各不足が計算・点検・保存へ与える影響を確認します。</p>
                </>
              ) : (
                <>
                  <strong>まだ確認が必要です。</strong>
                  <p>
                    見落とし {recordEvaluation.missedFieldIds.length}項目 ／
                    選び過ぎ {recordEvaluation.extraFieldIds.length}項目
                  </p>
                </>
              )}
            </div>
            {recordEvaluation !== null ? (
              <div className="basics-field-record-issue-list">
                {activeRecordIssues.map((issue) => (
                  <article key={issue.fieldId}>
                    <strong>{issue.label}</strong>
                    <p>{issue.risk}</p>
                    <span>{issue.action}</span>
                  </article>
                ))}
                {activeRecordIssues.length === 0 ? (
                  <p>
                    この固定例に空欄はありません。ただし、記載内容と原資料・
                    機器データの一致は別に点検します。
                  </p>
                ) : null}
              </div>
            ) : null}
          </aside>
        </div>
        <p className="basics-field-caution">
          必須欄は測量方法と使用する記録様式で異なります。この固定例はTS観測の
          基本的な追跡項目を扱うもので、すべての現場へ同じ様式を強制するものではありません。
        </p>
      </section>

      <section
        aria-labelledby="field-decision-title"
        className="basics-field-section basics-field-decision-section"
      >
        <div className="basics-section-heading">
          <span>再測・再計算・採用の判断</span>
          <h3 id="field-decision-title">
            「どこに問題があるか」で次の行動を選ぶ
          </h3>
        </div>
        <p className="basics-field-section-lead">
          正しい原記録から直せる計算誤りと、観測時の条件が成立していない異常を
          分けます。シナリオを選び、最初に行う判断を選択してください。
        </p>
        <div className="basics-field-decision-workspace">
          <div
            aria-label="現場判断シナリオを選択"
            className="basics-field-decision-scenarios"
          >
            {fieldDecisionScenarios.map((scenario) => (
              <button
                aria-pressed={scenario.id === decisionScenarioId}
                className={scenario.id === decisionScenarioId ? "is-selected" : ""}
                key={scenario.id}
                onClick={() => selectDecisionScenario(scenario.id)}
                type="button"
              >
                {scenario.label}
              </button>
            ))}
          </div>
          <article
            className="basics-field-decision-panel"
            id="field-decision-panel"
          >
            <span>現場で分かったこと</span>
            <h4>{activeDecisionScenario.label}</h4>
            <p>{activeDecisionScenario.finding}</p>
            <dl>
              <div>
                <dt>確認できる根拠</dt>
                <dd>{activeDecisionScenario.availableEvidence}</dd>
              </div>
            </dl>
            <fieldset>
              <legend>最初に行う判断を選択</legend>
              <div className="basics-field-decision-options">
                {fieldDecisionOptions.map((option) => (
                  <button
                    aria-pressed={selectedDecisionId === option.id}
                    className={
                      selectedDecisionId === option.id ? "is-selected" : ""
                    }
                    key={option.id}
                    onClick={() => setSelectedDecisionId(option.id)}
                    type="button"
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div
              className={`basics-field-decision-feedback ${
                decisionEvaluation?.isRecommended ? "is-match" : ""
              }`}
              data-testid="field-decision-feedback"
              role="status"
            >
              {decisionEvaluation === null ? (
                <p>判断を選ぶと、推奨する対応と理由を表示します。</p>
              ) : (
                <>
                  <strong>
                    {decisionEvaluation.isRecommended
                      ? "この固定シナリオの推奨判断と一致します。"
                      : `推奨判断は「${getDecisionLabel(
                          decisionEvaluation.recommendedDecisionId,
                        )}」です。`}
                  </strong>
                  <p>{decisionEvaluation.reason}</p>
                  <span>{decisionEvaluation.nextAction}</span>
                </>
              )}
            </div>
          </article>
        </div>
        <p className="basics-field-caution">
          採否を決める許容値や安全上の作業継続条件は、適用規程・精度区分・
          現場条件・機器で異なります。値の大小だけで機械的に判断せず、原記録、
          原因、影響範囲、適用条件を確認します。
        </p>
      </section>

      <section
        aria-labelledby="field-values-title"
        className="basics-field-section basics-field-values-section"
      >
        <div className="basics-section-heading">
          <span>観測値・計算値・成果値</span>
          <h3 id="field-values-title">
            値が生まれた段階と、採用済みかどうかを区別する
          </h3>
        </div>
        <div
          aria-label="値の種類を選択"
          className="basics-field-value-selector"
        >
          {fieldValueKinds.map((kind) => (
            <button
              aria-pressed={kind.id === valueKindId}
              className={kind.id === valueKindId ? "is-selected" : ""}
              key={kind.id}
              onClick={() => setValueKindId(kind.id)}
              type="button"
            >
              <strong>{kind.label}</strong>
              <span>{kind.shortLabel}</span>
            </button>
          ))}
        </div>
        <article
          className={`basics-field-value-panel is-${activeValueKind.id}`}
          data-testid="field-value-detail"
        >
          <div>
            <span>{activeValueKind.shortLabel}</span>
            <h4>{activeValueKind.label}</h4>
            <p>{activeValueKind.definition}</p>
          </div>
          <div>
            <strong>代表例</strong>
            <ul>
              {activeValueKind.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
          <p>
            <strong>記録・取扱い：</strong>
            {activeValueKind.handling}
          </p>
        </article>
      </section>

      <section
        aria-labelledby="field-flow-title"
        className="basics-field-section basics-field-flow-section"
      >
        <div className="basics-section-heading">
          <span>観測手簿から成果表まで</span>
          <h3 id="field-flow-title">
            原記録を残したまま、計算・検査・成果・保存へ進む
          </h3>
        </div>
        <p className="basics-field-section-lead">
          各段階を選ぶと、入力、行う作業、次へ渡す情報、点検箇所を確認できます。
        </p>
        <ol className="basics-field-result-flow">
          {recordToResultStages.map((stage) => (
            <li key={stage.id}>
              <button
                aria-pressed={stage.id === flowStageId}
                className={stage.id === flowStageId ? "is-selected" : ""}
                onClick={() => setFlowStageId(stage.id)}
                type="button"
              >
                <span>{stage.number}</span>
                <strong>{stage.title}</strong>
              </button>
            </li>
          ))}
        </ol>
        <article
          className="basics-field-flow-panel"
          data-testid="field-flow-detail"
        >
          <header>
            <span>STEP {activeFlowStage.number}</span>
            <h4>{activeFlowStage.title}</h4>
            <div>
              {activeFlowStage.valueKindIds.map((kindId) => (
                <em key={kindId}>
                  {fieldValueKinds.find((kind) => kind.id === kindId)?.label}
                </em>
              ))}
            </div>
          </header>
          <dl>
            <div>
              <dt>受け取る情報</dt>
              <dd>{activeFlowStage.input}</dd>
            </div>
            <div>
              <dt>この段階で行うこと</dt>
              <dd>{activeFlowStage.action}</dd>
            </div>
            <div>
              <dt>次へ渡す情報</dt>
              <dd>{activeFlowStage.output}</dd>
            </div>
          </dl>
          <p>
            <strong>確認：</strong>
            {activeFlowStage.checkpoint}
          </p>
        </article>
        <p className="basics-field-storage-note">
          第9章の操作状態は、この画面のReact状態だけに保持します。確認問題、
          学習記録、localStorage保存はPhase 6の対象であり、本章では追加していません。
        </p>
      </section>
    </div>
  );
}

export default FieldWorkflowLesson;
