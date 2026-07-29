import { useMemo, useState } from "react";
import {
  calculateTheoreticalTraverseGeometry,
  hasSelfIntersectingEdges,
} from "../../calculations/geometry";
import { calculateTraverse } from "../../calculations/traverse";
import type { TraverseCalculationResult } from "../../calculations/traverse";
import { traverseSample } from "../../data/traverseSample";
import type {
  SurveyCoordinate,
  SurveyPoint,
  TraverseObservation,
} from "../../types/traverse";
import {
  buildCalculationSteps,
  toJapaneseCalculationError,
} from "../../utils/calculationSteps";
import {
  buildObservationFromDrafts,
  createObservationDrafts,
  validateObservationDrafts,
} from "../../utils/observationInput";
import type { ObservationDrafts } from "../../utils/observationInput";
import CalculationBook from "./CalculationBook";
import CalculationDetail from "./CalculationDetail";
import CalculationSteps from "./CalculationSteps";
import ClosureVector from "./ClosureVector";
import ObservationTable from "./ObservationTable";
import QuizCard, {
  QUIZ_CORRECT_ANSWER,
} from "./QuizCard";
import type { QuizAnswerId } from "./QuizCard";
import ResultTable from "./ResultTable";
import TraverseSimulator from "./TraverseSimulator";

type WorkbookTab =
  | "observation"
  | "calculation"
  | "closure"
  | "quiz";

const learningStages = ["観測", "計算", "誤差確認"] as const;
const MINIMUM_POINT_DISTANCE = 5;
const CROSSED_EDGES_MESSAGE =
  "観測辺が交差しています。単純な閉合多角形になるよう測点を動かしてください。交差中は計算を進められません。";

function cloneInitialPoints(): SurveyPoint[] {
  return traverseSample.points.map((point) => ({
    ...point,
    coordinate: { ...point.coordinate },
  }));
}

function createInitialDrafts(): ObservationDrafts {
  return createObservationDrafts(traverseSample);
}

function activeLearningStage(
  currentStepIndex: number,
  isLearningComplete: boolean,
): number {
  if (isLearningComplete) {
    return learningStages.length;
  }

  if (currentStepIndex === 0) {
    return 0;
  }

  return currentStepIndex < 5 ? 1 : 2;
}

function TraverseWorkspace() {
  const [points, setPoints] = useState<readonly SurveyPoint[]>(
    cloneInitialPoints,
  );
  const [drafts, setDrafts] = useState<ObservationDrafts>(
    createInitialDrafts,
  );
  const [selectedPointId, setSelectedPointId] = useState<string | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeTab, setActiveTab] =
    useState<WorkbookTab>("observation");
  const [message, setMessage] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] =
    useState<QuizAnswerId | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const hasCrossedEdges = useMemo(
    () => hasSelfIntersectingEdges(points),
    [points],
  );

  const validation = useMemo(
    () => validateObservationDrafts(traverseSample, drafts),
    [drafts],
  );

  const observation = useMemo<TraverseObservation | null>(() => {
    if (!validation.isValid) {
      return null;
    }

    return buildObservationFromDrafts(traverseSample, points, drafts);
  }, [drafts, points, validation.isValid]);

  const calculationState = useMemo<{
    readonly result: TraverseCalculationResult | null;
    readonly error: string | null;
  }>(() => {
    if (observation === null) {
      return { result: null, error: null };
    }

    try {
      return {
        result: calculateTraverse(observation),
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        error: toJapaneseCalculationError(error),
      };
    }
  }, [observation]);

  const theoreticalState = useMemo(() => {
    try {
      return {
        geometry: calculateTheoreticalTraverseGeometry(
          points,
          traverseSample.legs,
          traverseSample.angles,
        ),
        error: null,
      };
    } catch {
      return {
        geometry: calculateTheoreticalTraverseGeometry(
          traverseSample.points,
          traverseSample.legs,
          traverseSample.angles,
        ),
        error:
          "図上の理論値を計算できない配置です。測点を離して再度操作してください。",
      };
    }
  }, [points]);

  const steps = useMemo(
    () =>
      buildCalculationSteps(
        calculationState.result,
        currentStepIndex,
      ),
    [calculationState.result, currentStepIndex],
  );
  const currentStep = steps[currentStepIndex]!;
  const visibleMessage =
    message ??
    (hasCrossedEdges ? CROSSED_EDGES_MESSAGE : null) ??
    calculationState.error ??
    theoreticalState.error;

  const invalidateCalculation = (): void => {
    setCurrentStepIndex(0);
    setMessage(null);
  };

  const updateDrafts = (
    update: (current: ObservationDrafts) => ObservationDrafts,
  ): void => {
    setDrafts(update);
    invalidateCalculation();
  };

  const handleInitialAzimuthChange = (value: string): void => {
    updateDrafts((current) => ({
      ...current,
      initialAzimuth: value,
    }));
  };

  const handleAngleChange = (
    pointId: string,
    value: string,
  ): void => {
    updateDrafts((current) => ({
      ...current,
      anglesByPointId: {
        ...current.anglesByPointId,
        [pointId]: value,
      },
    }));
  };

  const handleDistanceChange = (
    legId: string,
    value: string,
  ): void => {
    updateDrafts((current) => ({
      ...current,
      distancesByLegId: {
        ...current.distancesByLegId,
        [legId]: value,
      },
    }));
  };

  const handleMovePoint = (
    pointId: string,
    coordinate: SurveyCoordinate,
  ): void => {
    const movingPoint = points.find((point) => point.id === pointId);

    if (movingPoint === undefined || movingPoint.isFixed) {
      setMessage("AとBは固定点のため移動できません。");
      return;
    }

    const isTooClose = points.some(
      (point) =>
        point.id !== pointId &&
        Math.hypot(
          point.coordinate.x - coordinate.x,
          point.coordinate.y - coordinate.y,
        ) < MINIMUM_POINT_DISTANCE,
    );

    if (isTooClose) {
      setMessage(
        "測点同士が近すぎるため移動できません。少し離れた位置を選んでください。",
      );
      return;
    }

    const movedPoints = points.map((point) =>
      point.id === pointId
        ? { ...point, coordinate: { ...coordinate } }
        : point,
    );

    setPoints(movedPoints);
    setCurrentStepIndex(0);
    setMessage(
      hasSelfIntersectingEdges(movedPoints)
        ? CROSSED_EDGES_MESSAGE
        : null,
    );
  };

  const handleNext = (): void => {
    if (hasCrossedEdges) {
      setMessage(CROSSED_EDGES_MESSAGE);
      return;
    }

    if (!validation.isValid) {
      setMessage(
        "観測手簿に入力エラーがあります。赤く表示された項目を修正してください。",
      );
      setActiveTab("observation");
      return;
    }

    if (calculationState.result === null) {
      setMessage(
        calculationState.error ??
          "現在の観測値では計算できません。入力値を確認してください。",
      );
      return;
    }

    setMessage(null);
    setCurrentStepIndex((current) => Math.min(current + 1, 7));
    setActiveTab("calculation");
  };

  const handleReset = (): void => {
    setPoints(cloneInitialPoints());
    setDrafts(createInitialDrafts());
    setSelectedPointId(null);
    setCurrentStepIndex(0);
    setActiveTab("observation");
    setQuizAnswer(null);
    setIsQuizSubmitted(false);
    setMessage("サンプルデータの初期状態へ戻しました。");
  };

  const openObservationBook = (): void => {
    setActiveTab("observation");
    document
      .getElementById("workbook-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleQuizAnswer = (answer: QuizAnswerId): void => {
    setQuizAnswer(answer);
    setIsQuizSubmitted(false);
  };

  const isLearningComplete =
    currentStepIndex === 7 &&
    isQuizSubmitted &&
    quizAnswer === QUIZ_CORRECT_ANSWER;
  const stageIndex = activeLearningStage(
    currentStepIndex,
    isLearningComplete,
  );

  return (
    <>
      <section className="page-heading" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">多角測量 / 学習シミュレーター</p>
          <div className="page-title-row">
            <h1 id="page-title">閉合多角測量シミュレーター</h1>
            <span className="phase-badge">Phase 4</span>
          </div>
          <p className="page-description">
            測点と観測値を操作し、閉合計算と誤差の意味を図で確認します。
          </p>
        </div>

        <ol className="learning-stages" aria-label="学習の流れ">
          {learningStages.map((stage, index) => (
            <li
              className={
                index < stageIndex
                  ? "is-completed"
                  : index === stageIndex
                    ? "is-active"
                    : ""
              }
              key={stage}
            >
              <span className="stage-number">
                {index < stageIndex ? "✓" : index + 1}
              </span>
              <span>{stage}</span>
            </li>
          ))}
        </ol>
      </section>

      {visibleMessage === null ? null : (
        <div className="simulation-message" role="alert">
          <span aria-hidden="true">!</span>
          {visibleMessage}
          <button
            aria-label="メッセージを閉じる"
            onClick={() => setMessage(null)}
            type="button"
          >
            ×
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="workspace-main-column">
          <TraverseSimulator
            geometry={theoreticalState.geometry}
            observedSample={observation}
            onInteractionError={setMessage}
            onMovePoint={handleMovePoint}
            onOpenObservationBook={openObservationBook}
            onReset={handleReset}
            onSelectPoint={setSelectedPointId}
            referencePoints={traverseSample.points}
            selectedPointId={selectedPointId}
          />

          <section
            className="workbook-card card"
            id="workbook-panel"
          >
            <div className="workbook-tabs" role="tablist">
              <button
                aria-controls="workbook-content"
                aria-selected={activeTab === "observation"}
                className={
                  activeTab === "observation" ? "is-active" : ""
                }
                onClick={() => setActiveTab("observation")}
                role="tab"
                type="button"
              >
                観測手簿
              </button>
              <button
                aria-controls="workbook-content"
                aria-selected={activeTab === "calculation"}
                className={
                  activeTab === "calculation" ? "is-active" : ""
                }
                onClick={() => setActiveTab("calculation")}
                role="tab"
                type="button"
              >
                計算簿
              </button>
              <button
                aria-controls="workbook-content"
                aria-selected={activeTab === "closure"}
                className={
                  activeTab === "closure" ? "is-active" : ""
                }
                onClick={() => setActiveTab("closure")}
                role="tab"
                type="button"
              >
                誤差の見える化
                <small>
                  {currentStepIndex >= 5 ? "表示可" : "STEP 6"}
                </small>
              </button>
              <button
                aria-controls="workbook-content"
                aria-selected={activeTab === "quiz"}
                className={activeTab === "quiz" ? "is-active" : ""}
                onClick={() => setActiveTab("quiz")}
                role="tab"
                type="button"
              >
                確認問題
                <small>1問</small>
              </button>
            </div>

            <div id="workbook-content" role="tabpanel">
              {activeTab === "observation" ? (
                <ObservationTable
                  angleAdjustment={
                    calculationState.result?.angleAdjustment ?? null
                  }
                  azimuthsDegrees={
                    calculationState.result?.azimuthsDegrees ?? null
                  }
                  currentStepIndex={currentStepIndex}
                  drafts={drafts}
                  observedSample={observation ?? traverseSample}
                  onAngleChange={handleAngleChange}
                  onDistanceChange={handleDistanceChange}
                  onInitialAzimuthChange={
                    handleInitialAzimuthChange
                  }
                  onSelectPoint={setSelectedPointId}
                  selectedPointId={selectedPointId}
                  theoreticalGeometry={theoreticalState.geometry}
                  validation={validation}
                />
              ) : activeTab === "calculation" ? (
                <CalculationBook
                  calculation={calculationState.result}
                  currentStepIndex={currentStepIndex}
                />
              ) : activeTab === "closure" ? (
                <ClosureVector
                  calculation={calculationState.result}
                  isRevealed={currentStepIndex >= 5}
                />
              ) : (
                <QuizCard
                  isSubmitted={isQuizSubmitted}
                  onSelectAnswer={handleQuizAnswer}
                  onSubmit={() => {
                    if (quizAnswer !== null) {
                      setIsQuizSubmitted(true);
                    }
                  }}
                  selectedAnswer={quizAnswer}
                />
              )}
            </div>
          </section>
        </div>

        <aside className="learning-panel" aria-label="学習ガイド">
          <CalculationSteps steps={steps} />
          <CalculationDetail
            hasGeometryError={hasCrossedEdges}
            hasInputError={!validation.isValid}
            isLastStep={currentStepIndex === 7}
            onNext={handleNext}
            step={currentStep}
          />
          <ResultTable
            calculation={calculationState.result}
            currentStepIndex={currentStepIndex}
          />
        </aside>
      </div>
    </>
  );
}

export default TraverseWorkspace;
