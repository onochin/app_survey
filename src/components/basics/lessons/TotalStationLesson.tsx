import { useState } from "react";
import { degreesToRadians } from "../../../calculations/angle";
import {
  backsightLearningSample,
  calculateForesightAzimuth,
  calculateHeightInputImpact,
  calculateSignedDirectionError,
  calculateTsDerivedValues,
  evaluateSetupOrder,
  heightInputLearningModel,
  heightInputScenarios,
  initialSetupStepOrder,
  inspectionScenarios,
  moveSetupStep,
  observationChecklistItems,
  setupConditions,
  totalStationConcepts,
  totalStationSetupSteps,
  tsObservationLearningDefaults,
  type BacksightSelectionId,
  type HeightInputScenarioId,
  type ObservationChecklistItemId,
  type SetupConditionId,
  type SetupStepId,
} from "../data/totalStationObservation";
import DefinitionCard from "../ui/DefinitionCard";

interface SvgPoint {
  readonly x: number;
  readonly y: number;
}

type InspectionScenarioId = (typeof inspectionScenarios)[number]["id"];

const formatSigned = (value: number, digits = 3): string => {
  const magnitude = Math.abs(value).toFixed(digits);

  if (value > 0) {
    return `+${magnitude}`;
  }

  if (value < 0) {
    return `−${magnitude}`;
  }

  return Number(magnitude).toFixed(digits);
};

const pointFromNorthClockwise = (
  angleDegrees: number,
  radius: number,
  centerX: number,
  centerY: number,
): SvgPoint => {
  const radians = degreesToRadians(angleDegrees);

  return {
    x: centerX + radius * Math.sin(radians),
    y: centerY - radius * Math.cos(radians),
  };
};

const getSetupStep = (stepId: SetupStepId) =>
  totalStationSetupSteps.find((step) => step.id === stepId) ??
  totalStationSetupSteps[0];

function TotalStationLesson() {
  const [setupOrder, setSetupOrder] =
    useState<readonly SetupStepId[]>(initialSetupStepOrder);
  const [setupEvaluation, setSetupEvaluation] = useState<ReturnType<
    typeof evaluateSetupOrder
  > | null>(null);
  const [conditionId, setConditionId] =
    useState<SetupConditionId>("normal");
  const [backsightSelectionId, setBacksightSelectionId] =
    useState<BacksightSelectionId>("correct");
  const [horizontalAngleDegrees, setHorizontalAngleDegrees] = useState<number>(
    tsObservationLearningDefaults.horizontalAngleDegrees,
  );
  const [verticalAngleDegrees, setVerticalAngleDegrees] = useState<number>(
    tsObservationLearningDefaults.verticalAngleDegrees,
  );
  const [slopeDistance, setSlopeDistance] = useState<number>(
    tsObservationLearningDefaults.slopeDistance,
  );
  const [instrumentHeight, setInstrumentHeight] = useState<number>(
    tsObservationLearningDefaults.instrumentHeight,
  );
  const [prismHeight, setPrismHeight] = useState<number>(
    tsObservationLearningDefaults.prismHeight,
  );
  const [heightScenarioId, setHeightScenarioId] =
    useState<HeightInputScenarioId>("correct");
  const [checkedItemIds, setCheckedItemIds] = useState<
    readonly ObservationChecklistItemId[]
  >([]);
  const [inspectionScenarioId, setInspectionScenarioId] =
    useState<InspectionScenarioId>(
    inspectionScenarios[0].id,
    );

  const activeCondition =
    setupConditions.find((condition) => condition.id === conditionId) ??
    setupConditions[0];
  const backsightSelection =
    backsightLearningSample.selections.find(
      (selection) => selection.id === backsightSelectionId,
    ) ?? backsightLearningSample.selections[0];
  const calculatedForesightAzimuth =
    backsightSelection.knownAzimuthDegrees === null
      ? null
      : calculateForesightAzimuth(
          backsightSelection.knownAzimuthDegrees,
          backsightLearningSample.observedHorizontalAngleDegrees,
        );
  const directionError =
    calculatedForesightAzimuth === null
      ? null
      : calculateSignedDirectionError(
          calculatedForesightAzimuth,
          backsightLearningSample.correctForesightAzimuthDegrees,
        );
  const directionIsCorrect =
    directionError !== null && Math.abs(directionError) < 1e-9;
  const derivedValues = calculateTsDerivedValues(
    slopeDistance,
    verticalAngleDegrees,
    instrumentHeight,
    prismHeight,
  );
  const activeHeightScenario =
    heightInputScenarios.find(
      (scenario) => scenario.id === heightScenarioId,
    ) ?? heightInputScenarios[0];
  const heightImpact = calculateHeightInputImpact(
    heightInputLearningModel.lineOfSightHeightDifference,
    heightInputLearningModel.correctInstrumentHeight,
    heightInputLearningModel.correctPrismHeight,
    activeHeightScenario.inputInstrumentHeight,
    activeHeightScenario.inputPrismHeight,
  );
  const activeInspectionScenario =
    inspectionScenarios.find(
      (scenario) => scenario.id === inspectionScenarioId,
    ) ?? inspectionScenarios[0];
  const missingChecklistItems = observationChecklistItems.filter(
    (item) => !checkedItemIds.includes(item.id),
  );
  const allChecklistItemsChecked = missingChecklistItems.length === 0;

  const stationX = 160;
  const stationY = 145;
  const correctBacksightPoint = pointFromNorthClockwise(320, 96, stationX, stationY);
  const wrongBacksightPoint = pointFromNorthClockwise(300, 96, stationX, stationY);
  const foresightPoint = pointFromNorthClockwise(
    backsightLearningSample.correctForesightAzimuthDegrees,
    104,
    stationX,
    stationY,
  );
  const selectedBacksightPoint =
    backsightSelectionId === "correct"
      ? correctBacksightPoint
      : backsightSelectionId === "wrong"
        ? wrongBacksightPoint
        : null;

  const observationHorizontalLength =
    (derivedValues.horizontalDistance / slopeDistance) * 210;
  const observationVerticalOffset =
    (derivedValues.lineOfSightHeightDifference / slopeDistance) * 150;
  const observationTargetX = 55 + observationHorizontalLength;
  const observationTargetY = 220 - observationVerticalOffset;

  const changeFiniteValue = (
    value: number,
    setter: (nextValue: number) => void,
  ): void => {
    if (Number.isFinite(value)) {
      setter(value);
    }
  };

  const moveStep = (
    stepId: SetupStepId,
    direction: "up" | "down",
  ): void => {
    setSetupOrder((currentOrder) =>
      moveSetupStep(currentOrder, stepId, direction),
    );
    setSetupEvaluation(null);
  };

  const toggleChecklistItem = (
    itemId: ObservationChecklistItemId,
  ): void => {
    setCheckedItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId],
    );
  };

  return (
    <div className="basics-ts-lesson">
      <section
        aria-labelledby="ts-overview-title"
        className="basics-ts-intro"
      >
        <div className="basics-section-heading">
          <span>据付から点検まで</span>
          <h3 id="ts-overview-title">
            TS観測は、正しい基準を作ってから角度と距離を測る
          </h3>
        </div>
        <p className="basics-ts-lead">
          トータルステーション（TS）は、据え付けただけでは正しい方向や高さを得られません。
          測点上へ正しく設置し、後視点で方向を定め、設定と観測条件を点検してから前視点を観測します。
        </p>
        <ol className="basics-ts-flow" aria-label="TS観測の基本的な流れ">
          {[
            "三脚設置",
            "求心",
            "整準",
            "視差除去",
            "高さ確認",
            "方向付け",
            "前視観測",
            "点検・再観測",
          ].map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="basics-definition-grid basics-ts-definition-grid">
          {totalStationConcepts.map((concept) => (
            <DefinitionCard
              className="basics-ts-definition"
              icon={concept.icon}
              key={concept.id}
              title={concept.title}
            >
              {concept.description}
            </DefinitionCard>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="ts-order-title"
        className="basics-visual-card basics-ts-order-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">据付手順ラボ</span>
            <h3 id="ts-order-title">観測開始までの10項目を正しい順序にする</h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↕</span>
            上下ボタンで移動
          </span>
        </div>
        <div className="basics-ts-order-workspace">
          <ol className="basics-ts-order-list">
            {setupOrder.map((stepId, index) => {
              const step = getSetupStep(stepId);
              const isMismatch =
                setupEvaluation?.firstMismatchIndex === index;

              return (
                <li className={isMismatch ? "is-mismatch" : ""} key={step.id}>
                  <span className="basics-ts-order-number">{index + 1}</span>
                  <strong>{step.label}</strong>
                  <span className="basics-ts-order-actions">
                    <button
                      aria-label={`${step.label}を上へ`}
                      disabled={index === 0}
                      onClick={() => moveStep(step.id, "up")}
                      type="button"
                    >
                      ↑<span>上へ</span>
                    </button>
                    <button
                      aria-label={`${step.label}を下へ`}
                      disabled={index === setupOrder.length - 1}
                      onClick={() => moveStep(step.id, "down")}
                      type="button"
                    >
                      ↓<span>下へ</span>
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="basics-ts-order-check">
            <div>
              <button
                onClick={() => setSetupEvaluation(evaluateSetupOrder(setupOrder))}
                type="button"
              >
                順序を確認
              </button>
              <button
                className="is-secondary"
                onClick={() => {
                  setSetupOrder(initialSetupStepOrder);
                  setSetupEvaluation(null);
                }}
                type="button"
              >
                初期の並びへ戻す
              </button>
            </div>
            <p
              className={
                setupEvaluation === null
                  ? "is-pending"
                  : setupEvaluation.isCorrect
                    ? "is-correct"
                    : "is-error"
              }
              data-testid="setup-order-feedback"
              role="status"
            >
              {setupEvaluation?.message ??
                "現在の順序を確認し、必要な項目を上下へ動かしてください。"}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="ts-condition-title"
        className="basics-ts-section"
      >
        <div className="basics-section-heading">
          <span>据付状態とミス</span>
          <h3 id="ts-condition-title">異常を見つけたら、影響と再確認箇所を結び付ける</h3>
        </div>
        <div className="basics-ts-condition-selector" aria-label="据付状態を選択">
          {setupConditions.map((condition) => (
            <button
              aria-pressed={condition.id === conditionId}
              className={condition.id === conditionId ? "is-selected" : ""}
              key={condition.id}
              onClick={() => setConditionId(condition.id)}
              type="button"
            >
              {condition.label}
            </button>
          ))}
        </div>
        <div className="basics-ts-condition-workspace">
          <div
            className={`basics-ts-setup-diagram is-${conditionId}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 340 270">
              <line className="basics-ts-ground-line" x1="25" x2="315" y1="235" y2="235" />
              <circle className="basics-ts-ground-point" cx="170" cy="235" r="8" />
              <path className="basics-ts-ground-cross" d="M154 235h32M170 219v32" />
              <g className="basics-ts-instrument">
                <path d="M170 98v34M170 125l-62 110M170 125l62 110M170 125v110" />
                <rect height="42" rx="7" width="78" x="131" y="55" />
                <circle cx="204" cy="76" r="17" />
                <circle cx="204" cy="76" r="7" />
                <path d="M145 55V38h47v17" />
              </g>
              <line className="basics-ts-plumb-axis" x1="170" x2="170" y1="28" y2="235" />
              <g className="basics-ts-bubble" transform="translate(46 42)">
                <rect height="34" rx="17" width="82" />
                <line x1="41" x2="41" y1="5" y2="29" />
                <circle cx="41" cy="17" r="10" />
              </g>
              <g className="basics-ts-parallax-target" transform="translate(274 72)">
                <circle r="22" />
                <path d="M-30 0h60M0-30v60" />
                <path className="is-ghost" d="M-26 7h60M7-23v60" />
              </g>
              <text className="basics-ts-diagram-label" x="170" y="263">測点中心</text>
            </svg>
          </div>
          <div className="basics-ts-condition-panel" id="ts-condition-panel">
            <strong className={`is-${activeCondition.tone}`}>
              {activeCondition.label}：{activeCondition.decision}
            </strong>
            <dl>
              <div>
                <dt>何が正しくないか</dt>
                <dd>{activeCondition.incorrectState}</dd>
              </div>
              <div>
                <dt>考えられる影響</dt>
                <dd>{activeCondition.impact}</dd>
              </div>
              <div>
                <dt>現場で再確認すること</dt>
                <dd>{activeCondition.recheck}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="ts-orientation-title"
        className="basics-ts-section basics-ts-orientation-section"
      >
        <div className="basics-section-heading">
          <span>後視点による方向付け</span>
          <h3 id="ts-orientation-title">基準方向がずれると、その後の方向全体がずれる</h3>
        </div>
        <p className="basics-ts-section-lead">
          この固定例では、北0°・時計回りを正とし、後視方位角へ右回り水平角を加えます。
          正しいB1と誤ったB2の既知方位角差は20°です。
        </p>
        <div className="basics-ts-orientation-selector" aria-label="後視点の状態を選択">
          {backsightLearningSample.selections.map((selection) => (
            <button
              aria-pressed={selection.id === backsightSelectionId}
              className={selection.id === backsightSelectionId ? "is-selected" : ""}
              key={selection.id}
              onClick={() => setBacksightSelectionId(selection.id)}
              type="button"
            >
              {selection.label}
            </button>
          ))}
        </div>
        <div className="basics-ts-orientation-workspace">
          <div className="basics-ts-orientation-diagram">
            <svg
              aria-labelledby="ts-direction-svg-title ts-direction-svg-description"
              role="img"
              viewBox="0 0 320 290"
            >
              <title id="ts-direction-svg-title">器械点、2つの後視点、前視点の方向図</title>
              <desc id="ts-direction-svg-description">
                器械点Oから正しい後視点B1、誤った後視点B2、前視点F1への方向を示します。
              </desc>
              <circle className="basics-ts-direction-ring" cx={stationX} cy={stationY} r="108" />
              <line className="basics-ts-direction-north" x1={stationX} x2={stationX} y1="20" y2={stationY} />
              <text className="basics-ts-direction-label" x={stationX} y="15">N 0°</text>
              <line
                className="basics-ts-correct-back-line"
                x1={stationX}
                x2={correctBacksightPoint.x}
                y1={stationY}
                y2={correctBacksightPoint.y}
              />
              <line
                className="basics-ts-wrong-back-line"
                x1={stationX}
                x2={wrongBacksightPoint.x}
                y1={stationY}
                y2={wrongBacksightPoint.y}
              />
              <line
                className="basics-ts-fore-line"
                x1={stationX}
                x2={foresightPoint.x}
                y1={stationY}
                y2={foresightPoint.y}
              />
              {selectedBacksightPoint ? (
                <line
                  className="basics-ts-selected-back-line"
                  x1={stationX}
                  x2={selectedBacksightPoint.x}
                  y1={stationY}
                  y2={selectedBacksightPoint.y}
                />
              ) : null}
              <circle className="basics-ts-station-point" cx={stationX} cy={stationY} r="8" />
              <circle className="basics-ts-correct-back-point" cx={correctBacksightPoint.x} cy={correctBacksightPoint.y} r="7" />
              <circle className="basics-ts-wrong-back-point" cx={wrongBacksightPoint.x} cy={wrongBacksightPoint.y} r="7" />
              <circle className="basics-ts-fore-point" cx={foresightPoint.x} cy={foresightPoint.y} r="7" />
              <text className="basics-ts-direction-label" x={stationX} y={stationY + 24}>O 器械点</text>
              <text className="basics-ts-direction-label" x={correctBacksightPoint.x - 8} y={correctBacksightPoint.y - 12}>B1 320°</text>
              <text className="basics-ts-direction-label" x={wrongBacksightPoint.x - 1} y={wrongBacksightPoint.y + 23}>B2 300°</text>
              <text className="basics-ts-direction-label" x={foresightPoint.x + 4} y={foresightPoint.y - 12}>F1 35°</text>
            </svg>
          </div>
          <div className="basics-ts-orientation-result" id="ts-orientation-result">
            <p>{backsightSelection.explanation}</p>
            <dl>
              <div>
                <dt>器械点</dt>
                <dd>{backsightLearningSample.stationName}</dd>
              </div>
              <div>
                <dt>選択した後視点</dt>
                <dd>{backsightSelection.pointName ?? "未設定"}</dd>
              </div>
              <div>
                <dt>後視点の既知方位角</dt>
                <dd>
                  {backsightSelection.knownAzimuthDegrees === null
                    ? "—"
                    : `${backsightSelection.knownAzimuthDegrees.toFixed(3)}°`}
                </dd>
              </div>
              <div>
                <dt>観測した右回り水平角</dt>
                <dd>{backsightLearningSample.observedHorizontalAngleDegrees.toFixed(3)}°</dd>
              </div>
              <div className="is-result">
                <dt>前視方向の計算方位角</dt>
                <dd data-testid="foresight-azimuth-result">
                  {calculatedForesightAzimuth === null
                    ? "未計算"
                    : `${calculatedForesightAzimuth.toFixed(3)}°`}
                </dd>
              </div>
              <div className={directionIsCorrect ? "is-correct" : "is-warning"}>
                <dt>方向付けの判定</dt>
                <dd>
                  {directionError === null
                    ? "基準方向なし"
                    : directionIsCorrect
                      ? "正しい"
                      : `方向誤差 ${formatSigned(directionError)}°`}
                </dd>
              </div>
            </dl>
            <div className="basics-ts-formula">
              <strong>前視方位角 ＝ 後視方位角 ＋ 右回り水平角</strong>
              <span>結果は0°以上360°未満へ正規化</span>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="ts-values-title"
        className="basics-visual-card basics-ts-values-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">観測値から計算値へ</span>
            <h3 id="ts-values-title">TSが直接観測する値と、成果へ使う計算値を分ける</h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">∠</span>
            角度・距離・高さを操作
          </span>
        </div>
        <div className="basics-ts-values-workspace">
          <div className="basics-ts-observation-diagram">
            <svg
              aria-labelledby="ts-observation-svg-title ts-observation-svg-description"
              role="img"
              viewBox="0 0 330 310"
            >
              <title id="ts-observation-svg-title">TSからプリズムまでの斜距離と高低差</title>
              <desc id="ts-observation-svg-description">
                水平線を0度とする鉛直角、斜距離、水平距離、視準線上の高低差を直角三角形で示します。
              </desc>
              <line className="basics-ts-observation-ground" x1="25" x2="305" y1="255" y2="255" />
              <line className="basics-ts-observation-horizontal" x1="55" x2={observationTargetX} y1="220" y2="220" />
              <line className="basics-ts-observation-vertical" x1={observationTargetX} x2={observationTargetX} y1="220" y2={observationTargetY} />
              <line className="basics-ts-observation-slope" x1="55" x2={observationTargetX} y1="220" y2={observationTargetY} />
              <g className="basics-ts-mini-instrument" transform="translate(55 220)">
                <path d="M0 0v18M0 13l-19 35M0 13l19 35" />
                <rect height="19" rx="4" width="38" x="-19" y="-19" />
              </g>
              <g className="basics-ts-mini-prism" transform={`translate(${observationTargetX} ${observationTargetY})`}>
                <path d="M0 0v48M-12 48h24" />
                <path d="M0-13 11 0 0 13-11 0Z" />
              </g>
              <text className="basics-ts-observation-label" x={(55 + observationTargetX) / 2} y="239">水平距離</text>
              <text className="basics-ts-observation-label" x={(55 + observationTargetX) / 2} y={(220 + observationTargetY) / 2 - 8}>斜距離</text>
              <text className="basics-ts-observation-label" x={observationTargetX + 12} y={(220 + observationTargetY) / 2}>視準線上の高低差</text>
              <text className="basics-ts-observation-label" x="55" y="287">器械点</text>
              <text className="basics-ts-observation-label" x={observationTargetX} y="287">前視点</text>
            </svg>
            <p>
              鉛直角の規約：<strong>水平線0°、上向き正、下向き負</strong>
            </p>
          </div>
          <div className="basics-ts-value-controls">
            <div className="basics-ts-direct-values">
              <span>TSが直接観測する代表値</span>
              <label>
                <span>水平角 <output>{horizontalAngleDegrees.toFixed(3)}°</output></span>
                <input
                  aria-label="水平角を操作"
                  max={tsObservationLearningDefaults.limits.horizontalAngle.max}
                  min={tsObservationLearningDefaults.limits.horizontalAngle.min}
                  onChange={(event) =>
                    changeFiniteValue(
                      Number(event.currentTarget.value),
                      setHorizontalAngleDegrees,
                    )
                  }
                  step={tsObservationLearningDefaults.limits.horizontalAngle.step}
                  type="range"
                  value={horizontalAngleDegrees}
                />
              </label>
              <label>
                <span>鉛直角 <output>{formatSigned(verticalAngleDegrees)}°</output></span>
                <input
                  aria-label="鉛直角を操作"
                  max={tsObservationLearningDefaults.limits.verticalAngle.max}
                  min={tsObservationLearningDefaults.limits.verticalAngle.min}
                  onChange={(event) =>
                    changeFiniteValue(
                      Number(event.currentTarget.value),
                      setVerticalAngleDegrees,
                    )
                  }
                  step={tsObservationLearningDefaults.limits.verticalAngle.step}
                  type="range"
                  value={verticalAngleDegrees}
                />
              </label>
              <label>
                <span>斜距離 <output>{slopeDistance.toFixed(3)} m</output></span>
                <input
                  aria-label="斜距離を操作"
                  max={tsObservationLearningDefaults.limits.slopeDistance.max}
                  min={tsObservationLearningDefaults.limits.slopeDistance.min}
                  onChange={(event) =>
                    changeFiniteValue(
                      Number(event.currentTarget.value),
                      setSlopeDistance,
                    )
                  }
                  step={tsObservationLearningDefaults.limits.slopeDistance.step}
                  type="range"
                  value={slopeDistance}
                />
              </label>
            </div>
            <div className="basics-ts-height-controls">
              <span>測点間高低差に使う高さ</span>
              <label>
                <span>器械高 <output>{instrumentHeight.toFixed(2)} m</output></span>
                <input
                  aria-label="器械高を操作"
                  max={tsObservationLearningDefaults.limits.instrumentHeight.max}
                  min={tsObservationLearningDefaults.limits.instrumentHeight.min}
                  onChange={(event) =>
                    changeFiniteValue(
                      Number(event.currentTarget.value),
                      setInstrumentHeight,
                    )
                  }
                  step={tsObservationLearningDefaults.limits.instrumentHeight.step}
                  type="range"
                  value={instrumentHeight}
                />
              </label>
              <label>
                <span>プリズム高 <output>{prismHeight.toFixed(2)} m</output></span>
                <input
                  aria-label="プリズム高を操作"
                  max={tsObservationLearningDefaults.limits.prismHeight.max}
                  min={tsObservationLearningDefaults.limits.prismHeight.min}
                  onChange={(event) =>
                    changeFiniteValue(
                      Number(event.currentTarget.value),
                      setPrismHeight,
                    )
                  }
                  step={tsObservationLearningDefaults.limits.prismHeight.step}
                  type="range"
                  value={prismHeight}
                />
              </label>
            </div>
          </div>
          <div className="basics-ts-calculated-panel">
            <span>角度・距離・高さから計算する値</span>
            <dl className="basics-ts-calculated-values">
              <div>
                <dt>水平距離</dt>
                <dd data-testid="ts-horizontal-distance">
                  {derivedValues.horizontalDistance.toFixed(4)} m
                </dd>
              </div>
              <div>
                <dt>視準線上の高低差</dt>
                <dd data-testid="ts-line-height-difference">
                  {formatSigned(derivedValues.lineOfSightHeightDifference, 4)} m
                </dd>
              </div>
              <div className="is-result">
                <dt>測点間高低差</dt>
                <dd data-testid="ts-point-height-difference">
                  {formatSigned(derivedValues.pointHeightDifference, 4)} m
                </dd>
              </div>
            </dl>
            <div className="basics-ts-equation-list">
              <p>
                <strong>水平距離 ＝ 斜距離 × cos（鉛直角）</strong>
                <span>
                  {slopeDistance.toFixed(3)} × cos（{formatSigned(verticalAngleDegrees, 3)}°）
                  ＝ {derivedValues.horizontalDistance.toFixed(4)} m
                </span>
              </p>
              <p>
                <strong>視準線上の高低差 ＝ 斜距離 × sin（鉛直角）</strong>
                <span>
                  {slopeDistance.toFixed(3)} × sin（{formatSigned(verticalAngleDegrees, 3)}°）
                  ＝ {formatSigned(derivedValues.lineOfSightHeightDifference, 4)} m
                </span>
              </p>
              <p>
                <strong>測点間高低差 ＝ 器械高 ＋ 視準線上の高低差 − プリズム高</strong>
                <span>
                  {instrumentHeight.toFixed(2)} ＋ {formatSigned(derivedValues.lineOfSightHeightDifference, 4)} − {prismHeight.toFixed(2)}
                  ＝ {formatSigned(derivedValues.pointHeightDifference, 4)} m
                </span>
              </p>
            </div>
          </div>
        </div>
        <p className="basics-ts-caution">
          第3章の斜距離・水平距離・高低差の関係と同じ直角三角形です。
          この章では、TSの据付条件と器械高・プリズム高まで含めて測点間の高さへつなげます。
        </p>
      </section>

      <section
        aria-labelledby="ts-height-error-title"
        className="basics-ts-section basics-ts-height-error-section"
      >
        <div className="basics-section-heading">
          <span>高さ入力ミスの固定教材モデル</span>
          <h3 id="ts-height-error-title">同じ視準線でも、高さの入力で測点間高低差が変わる</h3>
        </div>
        <p className="basics-ts-section-lead">
          視準線上の高低差を<strong>+2.000 m</strong>、正しい器械高を
          <strong>1.500 m</strong>、正しいプリズム高を<strong>1.800 m</strong>に固定した教材例です。
        </p>
        <div className="basics-ts-height-scenario-selector" aria-label="高さ入力の状態を選択">
          {heightInputScenarios.map((scenario) => (
            <button
              aria-pressed={scenario.id === heightScenarioId}
              className={scenario.id === heightScenarioId ? "is-selected" : ""}
              key={scenario.id}
              onClick={() => setHeightScenarioId(scenario.id)}
              type="button"
            >
              {scenario.label}
            </button>
          ))}
        </div>
        <div className="basics-ts-height-impact" id="ts-height-impact-panel">
          <dl>
            <div>
              <dt>入力した器械高</dt>
              <dd>{activeHeightScenario.inputInstrumentHeight.toFixed(3)} m</dd>
            </div>
            <div>
              <dt>入力したプリズム高</dt>
              <dd>{activeHeightScenario.inputPrismHeight.toFixed(3)} m</dd>
            </div>
            <div>
              <dt>正しい測点間高低差</dt>
              <dd>{formatSigned(heightImpact.correctPointHeightDifference)} m</dd>
            </div>
            <div className="is-result">
              <dt>入力値による測点間高低差</dt>
              <dd>{formatSigned(heightImpact.inputPointHeightDifference)} m</dd>
            </div>
            <div className={Math.abs(heightImpact.difference) < 1e-9 ? "is-correct" : "is-error"}>
              <dt>正しい結果との差</dt>
              <dd data-testid="height-input-error-result">
                {formatSigned(heightImpact.difference)} m
              </dd>
            </div>
          </dl>
          <p>{activeHeightScenario.effectDirection}</p>
          <div className="basics-ts-formula">
            <strong>
              入力値による高低差 ＝ 入力器械高 ＋ 固定した視準線上の高低差 − 入力プリズム高
            </strong>
            <span>実務では測定位置・単位・原記録と入力値を照合します。</span>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="ts-checklist-title"
        className="basics-ts-section basics-ts-checklist-section"
      >
        <div className="basics-section-heading">
          <span>観測開始前チェックリスト</span>
          <h3 id="ts-checklist-title">不足項目を残したまま観測を始めない</h3>
        </div>
        <div className="basics-ts-checklist-toolbar">
          <strong data-testid="ts-checklist-progress">
            {checkedItemIds.length} / {observationChecklistItems.length} 項目確認
          </strong>
          <div>
            <button
              onClick={() =>
                setCheckedItemIds(
                  observationChecklistItems.map((item) => item.id),
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
        <div className="basics-ts-checklist-grid">
          {observationChecklistItems.map((item) => (
            <label
              className={checkedItemIds.includes(item.id) ? "is-checked" : ""}
              key={item.id}
            >
              <input
                checked={checkedItemIds.includes(item.id)}
                onChange={() => toggleChecklistItem(item.id)}
                type="checkbox"
              />
              <span aria-hidden="true">✓</span>
              {item.label}
            </label>
          ))}
        </div>
        <div
          className={`basics-ts-missing-items ${
            allChecklistItemsChecked ? "is-complete" : ""
          }`}
          role="status"
        >
          <strong>
            {allChecklistItemsChecked
              ? "全項目を確認しました。観測開始前に現況と記録を最終照合します。"
              : `未確認 ${missingChecklistItems.length}項目`}
          </strong>
          {!allChecklistItemsChecked ? (
            <ul>
              {missingChecklistItems.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <p className="basics-ts-storage-note">
          このチェックは第5章内のミニ操作です。ブラウザへ永続保存せず、確認問題や学習記録にも登録しません。
        </p>
      </section>

      <section
        aria-labelledby="ts-inspection-title"
        className="basics-ts-section basics-ts-inspection-section"
      >
        <div className="basics-section-heading">
          <span>点検観測と再観測判断</span>
          <h3 id="ts-inspection-title">発見した異常の種類から、次の行動を選ぶ</h3>
        </div>
        <div className="basics-ts-inspection-workspace">
          <div className="basics-ts-inspection-selector" aria-label="点検シナリオを選択">
            {inspectionScenarios.map((scenario) => (
              <button
                aria-pressed={scenario.id === inspectionScenarioId}
                className={scenario.id === inspectionScenarioId ? "is-selected" : ""}
                key={scenario.id}
                onClick={() => setInspectionScenarioId(scenario.id)}
                type="button"
              >
                {scenario.label}
              </button>
            ))}
          </div>
          <article className="basics-ts-inspection-result" id="ts-inspection-result">
            <span>点検で分かったこと</span>
            <h4>{activeInspectionScenario.label}</h4>
            <p>{activeInspectionScenario.finding}</p>
            <strong>{activeInspectionScenario.decision}</strong>
            <dl>
              <div>
                <dt>判断理由</dt>
                <dd>{activeInspectionScenario.reason}</dd>
              </div>
              <div>
                <dt>現場での対応</dt>
                <dd>{activeInspectionScenario.fieldAction}</dd>
              </div>
            </dl>
          </article>
        </div>
        <p className="basics-ts-caution">
          実務上の許容値は作業規程、精度区分、使用機器、観測方法で異なります。
          この教材では根拠のない固定許容値を設定せず、原因と影響範囲を確認する考え方を扱います。
        </p>
      </section>

      <p className="basics-ts-next-note">
        <strong>次の章への接続：</strong>
        第6章では、レベルと標尺を使い、既知標高から新点の標高を求める水準測量の基礎を学びます。
      </p>
    </div>
  );
}

export default TotalStationLesson;
