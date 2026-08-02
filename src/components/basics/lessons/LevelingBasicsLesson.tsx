import { useState } from "react";
import {
  calculateRoundTripClosingError,
  calculateSequentialLeveling,
  calculateSightDistanceDifference,
  calculateSingleLevelingSetup,
  levelConditions,
  levelingConcepts,
  levelingInputDefaults,
  levelingRouteSamples,
  levelingWorkflow,
  sightDistanceCases,
  staffConditions,
  summarizeLevelingRun,
  turningPointExamples,
  type LevelConditionId,
  type LevelingCalculationMethod,
  type LevelingRunSummary,
  type SightDistanceCaseId,
  type StaffConditionId,
} from "../data/levelingBasics";
import DefinitionCard from "../ui/DefinitionCard";

type TurningPointMode = "without-turning-point" | "with-turning-point";
type LevelingRouteSampleId = (typeof levelingRouteSamples)[number]["id"];

interface RunSummaryCardProps {
  readonly calculatedPointLabel: string;
  readonly knownEndElevation: number;
  readonly knownPointLabel: string;
  readonly summary: LevelingRunSummary;
  readonly testIdPrefix: "outbound" | "return";
  readonly title: string;
}

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

function RunSummaryCard({
  calculatedPointLabel,
  knownEndElevation,
  knownPointLabel,
  summary,
  testIdPrefix,
  title,
}: RunSummaryCardProps) {
  return (
    <article className="basics-level-route-card">
      <h4>{title}</h4>
      <div className="basics-level-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">据付</th>
              <th scope="col">後視点</th>
              <th scope="col">後視</th>
              <th scope="col">前視点</th>
              <th scope="col">前視</th>
            </tr>
          </thead>
          <tbody>
            {summary.setups.map((setup) => (
              <tr key={setup.id}>
                <th scope="row">{setup.stationLabel}</th>
                <td>{setup.backsightPoint}</td>
                <td>{setup.backsight.toFixed(3)} m</td>
                <td>{setup.foresightPoint}</td>
                <td>{setup.foresight.toFixed(3)} m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="basics-level-route-values">
        <div>
          <dt>後視合計</dt>
          <dd>{summary.backsightTotal.toFixed(3)} m</dd>
        </div>
        <div>
          <dt>前視合計</dt>
          <dd>{summary.foresightTotal.toFixed(3)} m</dd>
        </div>
        <div>
          <dt>観測高低差</dt>
          <dd data-testid={`${testIdPrefix}-observed-difference`}>
            {formatSigned(summary.observedHeightDifference)} m
          </dd>
        </div>
        <div>
          <dt>{calculatedPointLabel}</dt>
          <dd data-testid={`${testIdPrefix}-calculated-end`}>
            {summary.calculatedEndElevation.toFixed(3)} m
          </dd>
        </div>
        <div className={Math.abs(summary.closingError) < 1e-9 ? "is-correct" : "is-warning"}>
          <dt>{knownPointLabel}の既知標高</dt>
          <dd>{knownEndElevation.toFixed(3)} m</dd>
        </div>
        <div className={Math.abs(summary.closingError) < 1e-9 ? "is-correct" : "is-warning"}>
          <dt>閉合差</dt>
          <dd data-testid={`${testIdPrefix}-closing-error`}>
            {formatSigned(summary.closingError)} m
          </dd>
        </div>
      </dl>
      <p className="basics-level-route-formula">
        観測高低差 ＝ {summary.backsightTotal.toFixed(3)} − {summary.foresightTotal.toFixed(3)}
        ＝ {formatSigned(summary.observedHeightDifference)} m
      </p>
    </article>
  );
}

function LevelingBasicsLesson() {
  const [benchmarkElevation, setBenchmarkElevation] = useState<number>(
    levelingInputDefaults.benchmarkElevation,
  );
  const [backsight, setBacksight] = useState<number>(
    levelingInputDefaults.backsight,
  );
  const [foresight, setForesight] = useState<number>(
    levelingInputDefaults.foresight,
  );
  const [calculationMethod, setCalculationMethod] =
    useState<LevelingCalculationMethod>("instrument-height");
  const [turningPointMode, setTurningPointMode] =
    useState<TurningPointMode>("without-turning-point");
  const [routeSampleId, setRouteSampleId] =
    useState<LevelingRouteSampleId>("consistent");
  const [staffConditionId, setStaffConditionId] =
    useState<StaffConditionId>("vertical");
  const [sightDistanceCaseId, setSightDistanceCaseId] =
    useState<SightDistanceCaseId>("balanced");
  const [levelConditionId, setLevelConditionId] =
    useState<LevelConditionId>("normal");

  const liveCalculation = calculateSingleLevelingSetup(
    benchmarkElevation,
    backsight,
    foresight,
  );
  const turningPointSetups =
    turningPointMode === "with-turning-point"
      ? turningPointExamples.withTurningPoint
      : turningPointExamples.withoutTurningPoint;
  const turningPointResults = calculateSequentialLeveling(
    turningPointExamples.startElevation,
    turningPointSetups,
  );
  const activeRouteSample =
    levelingRouteSamples.find((sample) => sample.id === routeSampleId) ??
    levelingRouteSamples[0];
  const outboundSummary = summarizeLevelingRun(
    activeRouteSample.knownStartElevation,
    activeRouteSample.knownEndElevation,
    activeRouteSample.outbound,
  );
  const returnSummary = summarizeLevelingRun(
    activeRouteSample.knownEndElevation,
    activeRouteSample.knownStartElevation,
    activeRouteSample.return,
  );
  const roundTripClosingError = calculateRoundTripClosingError(
    outboundSummary.observedHeightDifference,
    returnSummary.observedHeightDifference,
  );
  const activeStaffCondition =
    staffConditions.find((condition) => condition.id === staffConditionId) ??
    staffConditions[0];
  const activeSightDistanceCase =
    sightDistanceCases.find((item) => item.id === sightDistanceCaseId) ??
    sightDistanceCases[0];
  const sightDistanceDifference = calculateSightDistanceDifference(
    activeSightDistanceCase.backsightDistance,
    activeSightDistanceCase.foresightDistance,
  );
  const activeLevelCondition =
    levelConditions.find((condition) => condition.id === levelConditionId) ??
    levelConditions[0];

  const sightLineY = 58;
  const readingScale = 54;
  const benchmarkGroundY = sightLineY + backsight * readingScale;
  const newPointGroundY = sightLineY + foresight * readingScale;
  const distanceScale = 2.45;
  const levelX = 210;
  const backsightStaffX =
    levelX - activeSightDistanceCase.backsightDistance * distanceScale;
  const foresightStaffX =
    levelX + activeSightDistanceCase.foresightDistance * distanceScale;

  const changeFiniteValue = (
    value: number,
    setter: (nextValue: number) => void,
  ): void => {
    if (Number.isFinite(value)) {
      setter(value);
    }
  };

  return (
    <div className="basics-level-lesson">
      <section
        aria-labelledby="leveling-overview-title"
        className="basics-level-intro"
      >
        <div className="basics-section-heading">
          <span>水平な視準線で標高をつなぐ</span>
          <h3 id="leveling-overview-title">
            水準測量は、標尺の読みから既知標高を新点へ引き継ぐ
          </h3>
        </div>
        <p className="basics-level-lead">
          レベルで水平な視準線を作り、BM（Benchmark、水準点）側の後視と、
          新点側の前視を読みます。後視・前視は点の前後ではなく、
          <strong>その据付での標高計算上の役割</strong>で決まります。
        </p>
        <ol className="basics-level-flow" aria-label="水準測量の基本的な流れ">
          {levelingWorkflow.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="basics-definition-grid basics-level-definition-grid">
          {levelingConcepts.map((concept) => (
            <DefinitionCard
              className="basics-level-definition"
              icon={concept.icon}
              key={concept.id}
              title={concept.title}
            >
              {concept.description}
            </DefinitionCard>
          ))}
        </div>
        <p className="basics-level-scope-note">
          この章は水準測量の観測・計算・点検の概念導入です。本格的な路線調整や
          実務成果を作る計算ソフトではありません。
        </p>
      </section>

      <section
        aria-labelledby="leveling-calculation-title"
        className="basics-visual-card basics-level-calculation-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">後視・前視と標高計算</span>
            <h3 id="leveling-calculation-title">
              水平な視準線から標尺を読み、新点標高を求める
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↕</span>
            3つの値を操作
          </span>
        </div>
        <div className="basics-level-calculation-workspace">
          <div className="basics-level-main-diagram">
            <svg
              aria-labelledby="level-main-svg-title level-main-svg-description"
              role="img"
              viewBox="0 0 430 300"
            >
              <title id="level-main-svg-title">
                BM、レベル、標尺、新点による水準測量の模式図
              </title>
              <desc id="level-main-svg-description">
                水平な視準線から後視側と前視側の標尺を読み、器械高と新点標高を求める図です。
              </desc>
              <path
                className="basics-level-ground"
                d={`M20 ${benchmarkGroundY + 12} L75 ${benchmarkGroundY} L150 244 L280 240 L355 ${newPointGroundY} L410 ${newPointGroundY + 10}`}
              />
              <line
                className="basics-level-sight-line"
                x1="42"
                x2="388"
                y1={sightLineY}
                y2={sightLineY}
              />
              <g className="basics-level-staff basics-level-back-staff">
                <line x1="78" x2="78" y1={sightLineY - 10} y2={benchmarkGroundY} />
                <path d={`M69 ${sightLineY - 5}h18M69 ${sightLineY + 4}h18`} />
              </g>
              <g className="basics-level-staff basics-level-fore-staff">
                <line x1="352" x2="352" y1={sightLineY - 10} y2={newPointGroundY} />
                <path d={`M343 ${sightLineY - 5}h18M343 ${sightLineY + 4}h18`} />
              </g>
              <g className="basics-level-instrument" transform="translate(215 58)">
                <rect height="28" rx="6" width="76" x="-38" y="-23" />
                <circle cx="31" cy="-9" r="10" />
                <path d="M0 5v38M0 38l-43 91M0 38l43 91M0 38v91" />
              </g>
              <line
                className="basics-level-reading-arrow is-back"
                x1="98"
                x2="98"
                y1={sightLineY}
                y2={benchmarkGroundY}
              />
              <line
                className="basics-level-reading-arrow is-fore"
                x1="332"
                x2="332"
                y1={sightLineY}
                y2={newPointGroundY}
              />
              <circle className="basics-level-bm-point" cx="78" cy={benchmarkGroundY} r="7" />
              <circle className="basics-level-new-point" cx="352" cy={newPointGroundY} r="7" />
              <text className="basics-level-svg-label" x="78" y={benchmarkGroundY + 22}>
                BM（既知標高点）
              </text>
              <text className="basics-level-svg-label" x="352" y={newPointGroundY + 22}>
                新点P
              </text>
              <text className="basics-level-svg-label" x="215" y="198">
                レベル
              </text>
              <text className="basics-level-svg-label is-sight" x="215" y="45">
                水平な視準線（器械高 {liveCalculation.instrumentHeight.toFixed(3)} m）
              </text>
              <text className="basics-level-svg-label is-back" x="113" y={(sightLineY + benchmarkGroundY) / 2}>
                後視 {backsight.toFixed(3)} m
              </text>
              <text className="basics-level-svg-label is-fore" x="317" y={(sightLineY + newPointGroundY) / 2}>
                前視 {foresight.toFixed(3)} m
              </text>
            </svg>
            <p>
              地面の高さを直接読むのではなく、<strong>水平な視準線からの標尺読み</strong>で
              点間の標高差を求めます。
            </p>
          </div>
          <div className="basics-level-live-controls">
            <label>
              <span>
                BM標高
                <output>{benchmarkElevation.toFixed(3)} m</output>
              </span>
              <input
                aria-label="BM標高を操作"
                id="level-bm-elevation-range"
                max={levelingInputDefaults.limits.benchmarkElevation.max}
                min={levelingInputDefaults.limits.benchmarkElevation.min}
                onChange={(event) =>
                  changeFiniteValue(
                    Number(event.currentTarget.value),
                    setBenchmarkElevation,
                  )
                }
                step={levelingInputDefaults.limits.benchmarkElevation.step}
                type="range"
                value={benchmarkElevation}
              />
            </label>
            <label>
              <span>
                後視
                <output>{backsight.toFixed(3)} m</output>
              </span>
              <input
                aria-label="後視を操作"
                id="level-backsight-range"
                max={levelingInputDefaults.limits.staffReading.max}
                min={levelingInputDefaults.limits.staffReading.min}
                onChange={(event) =>
                  changeFiniteValue(Number(event.currentTarget.value), setBacksight)
                }
                step={levelingInputDefaults.limits.staffReading.step}
                type="range"
                value={backsight}
              />
            </label>
            <label>
              <span>
                前視
                <output>{foresight.toFixed(3)} m</output>
              </span>
              <input
                aria-label="前視を操作"
                id="level-foresight-range"
                max={levelingInputDefaults.limits.staffReading.max}
                min={levelingInputDefaults.limits.staffReading.min}
                onChange={(event) =>
                  changeFiniteValue(Number(event.currentTarget.value), setForesight)
                }
                step={levelingInputDefaults.limits.staffReading.step}
                type="range"
                value={foresight}
              />
            </label>
            <p>
              単位はすべてm、表示は0.001mまでです。標尺読みは0より大きい
              学習用範囲に制限しています。
            </p>
          </div>
          <div className="basics-level-live-result">
            <dl>
              <div>
                <dt>BM標高</dt>
                <dd>{benchmarkElevation.toFixed(3)} m</dd>
              </div>
              <div>
                <dt>後視</dt>
                <dd>{backsight.toFixed(3)} m</dd>
              </div>
              <div>
                <dt>器械高</dt>
                <dd data-testid="level-instrument-height">
                  {liveCalculation.instrumentHeight.toFixed(3)} m
                </dd>
              </div>
              <div>
                <dt>前視</dt>
                <dd>{foresight.toFixed(3)} m</dd>
              </div>
              <div>
                <dt>高低差</dt>
                <dd data-testid="level-height-difference">
                  {formatSigned(liveCalculation.heightDifference)} m
                </dd>
              </div>
              <div className="is-result">
                <dt>新点標高</dt>
                <dd data-testid="level-new-point-elevation">
                  {liveCalculation.elevationByInstrumentHeight.toFixed(3)} m
                </dd>
              </div>
            </dl>
            <div
              aria-label="標高計算方式を選択"
              className="basics-level-method-selector"
            >
              <button
                aria-pressed={calculationMethod === "instrument-height"}
                className={calculationMethod === "instrument-height" ? "is-selected" : ""}
                onClick={() => setCalculationMethod("instrument-height")}
                type="button"
              >
                器械高方式
              </button>
              <button
                aria-pressed={calculationMethod === "height-difference"}
                className={calculationMethod === "height-difference" ? "is-selected" : ""}
                onClick={() => setCalculationMethod("height-difference")}
                type="button"
              >
                高低差方式
              </button>
            </div>
            <div className="basics-level-equations" id="leveling-method-panel">
              {calculationMethod === "instrument-height" ? (
                <>
                  <p>
                    <strong>器械高 ＝ BM標高 ＋ 後視</strong>
                    <span>
                      {benchmarkElevation.toFixed(3)} ＋ {backsight.toFixed(3)} ＝ {liveCalculation.instrumentHeight.toFixed(3)} m
                    </span>
                  </p>
                  <p>
                    <strong>新点標高 ＝ 器械高 − 前視</strong>
                    <span>
                      {liveCalculation.instrumentHeight.toFixed(3)} − {foresight.toFixed(3)} ＝ {liveCalculation.elevationByInstrumentHeight.toFixed(3)} m
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>高低差 ＝ 後視 − 前視</strong>
                    <span>
                      {backsight.toFixed(3)} − {foresight.toFixed(3)} ＝ {formatSigned(liveCalculation.heightDifference)} m
                    </span>
                  </p>
                  <p>
                    <strong>新点標高 ＝ BM標高 ＋ 高低差</strong>
                    <span>
                      {benchmarkElevation.toFixed(3)} ＋ {formatSigned(liveCalculation.heightDifference)} ＝ {liveCalculation.elevationByHeightDifference.toFixed(3)} m
                    </span>
                  </p>
                </>
              )}
            </div>
            <p className="basics-level-method-match" role="status">
              2方式の新点標高は
              <strong>{liveCalculation.elevationByInstrumentHeight.toFixed(3)} m</strong>
              で一致します。変わるのは計算途中の見せ方です。
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="leveling-turning-point-title"
        className="basics-level-section basics-level-turning-section"
      >
        <div className="basics-section-heading">
          <span>転点で標高を引き継ぐ</span>
          <h3 id="leveling-turning-point-title">
            レベルを移動しても、TP1を介して標高を次の据付へ渡す
          </h3>
        </div>
        <p className="basics-level-section-lead">
          転点（TP）は一時的な標高の引継ぎ点です。前の据付でTPへの前視を完了し、
          標尺位置を保ったままレベルを移動して、次の据付では同じTPを後視します。
        </p>
        <div className="basics-level-turning-selector" aria-label="転点の有無を選択">
          <button
            aria-pressed={turningPointMode === "without-turning-point"}
            className={turningPointMode === "without-turning-point" ? "is-selected" : ""}
            onClick={() => setTurningPointMode("without-turning-point")}
            type="button"
          >
            転点なし：BM → 新点
          </button>
          <button
            aria-pressed={turningPointMode === "with-turning-point"}
            className={turningPointMode === "with-turning-point" ? "is-selected" : ""}
            onClick={() => setTurningPointMode("with-turning-point")}
            type="button"
          >
            転点あり：BM → TP1 → 新点
          </button>
        </div>
        {turningPointMode === "with-turning-point" ? (
          <ol className="basics-level-tp-stages">
            <li>BMへの後視から1回目の器械高を求める</li>
            <li>TP1への前視からTP1標高を求める</li>
            <li>標尺をTP1に保持してレベルを移動する</li>
            <li>TP1への後視から2回目の器械高を求める</li>
            <li>新点への前視から新点標高を求める</li>
          </ol>
        ) : (
          <p className="basics-level-single-setup-note">
            1回の据付でBMを後視し、新点を前視します。レベルを移動しないため転点は使いません。
          </p>
        )}
        <div className="basics-level-table-wrap basics-level-turning-table">
          <table>
            <thead>
              <tr>
                <th scope="col">据付</th>
                <th scope="col">後視点・標高</th>
                <th scope="col">後視</th>
                <th scope="col">器械高</th>
                <th scope="col">前視点</th>
                <th scope="col">前視</th>
                <th scope="col">求めた標高</th>
              </tr>
            </thead>
            <tbody>
              {turningPointResults.map((setup) => (
                <tr key={setup.id}>
                  <th scope="row">{setup.stationLabel}</th>
                  <td>
                    {setup.backsightPoint}<br />
                    {setup.backsightPointElevation.toFixed(3)} m
                  </td>
                  <td>{setup.backsight.toFixed(3)} m</td>
                  <td>{setup.instrumentHeight.toFixed(3)} m</td>
                  <td>{setup.foresightPoint}</td>
                  <td>{setup.foresight.toFixed(3)} m</td>
                  <td data-testid={`turning-elevation-${setup.foresightPoint}`}>
                    {setup.foresightPointElevation.toFixed(3)} m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="basics-level-caution">
          TP1への前視を完了する前に標尺を動かすと、標高を次の据付へ正しく引き継げません。
        </p>
      </section>

      <section
        aria-labelledby="leveling-closure-title"
        className="basics-level-section basics-level-closure-section"
      >
        <div className="basics-section-heading">
          <span>往路・復路と閉合差</span>
          <h3 id="leveling-closure-title">
            既知標高へ戻して、観測高低差の整合を点検する
          </h3>
        </div>
        <div className="basics-level-route-selector" aria-label="往復観測例を選択">
          {levelingRouteSamples.map((sample) => (
            <button
              aria-pressed={sample.id === routeSampleId}
              className={sample.id === routeSampleId ? "is-selected" : ""}
              key={sample.id}
              onClick={() => setRouteSampleId(sample.id)}
              type="button"
            >
              {sample.label}
            </button>
          ))}
        </div>
        <p className="basics-level-section-lead">{activeRouteSample.description}</p>
        <div className="basics-level-route-known-values">
          <span>始点 BM-A：{activeRouteSample.knownStartElevation.toFixed(3)} m</span>
          <span>終点 BM-B：{activeRouteSample.knownEndElevation.toFixed(3)} m</span>
          <span>既知標高差：+1.250 m</span>
        </div>
        <div className="basics-level-route-grid">
          <RunSummaryCard
            calculatedPointLabel="BM-B計算標高"
            knownEndElevation={activeRouteSample.knownEndElevation}
            knownPointLabel="BM-B"
            summary={outboundSummary}
            testIdPrefix="outbound"
            title="往路：BM-A → BM-B"
          />
          <RunSummaryCard
            calculatedPointLabel="BM-A計算標高"
            knownEndElevation={activeRouteSample.knownStartElevation}
            knownPointLabel="BM-A"
            summary={returnSummary}
            testIdPrefix="return"
            title="復路：BM-B → BM-A"
          />
        </div>
        <div className="basics-level-round-trip-result">
          <span>往復閉合差</span>
          <strong data-testid="round-trip-closing-error">
            {formatSigned(roundTripClosingError)} m
          </strong>
          <p>
            往路の観測高低差 {formatSigned(outboundSummary.observedHeightDifference)} ＋
            復路の観測高低差 {formatSigned(returnSummary.observedHeightDifference)} ＝
            {formatSigned(roundTripClosingError)} m
          </p>
        </div>
        <div className="basics-level-sign-note">
          <p><strong>正の閉合差：</strong>計算標高が既知標高より高い</p>
          <p><strong>負の閉合差：</strong>計算標高が既知標高より低い</p>
        </div>
        <p className="basics-level-caution">
          「小さいから正しい」とは判断しません。許容値は測量区分、路線長、
          作業規程などで異なります。この章では閉合差の確認までとし、
          補正量の配分や本格的な路線調整は実装していません。
        </p>
      </section>

      <section
        aria-labelledby="leveling-staff-title"
        className="basics-level-section"
      >
        <div className="basics-section-heading">
          <span>標尺の鉛直</span>
          <h3 id="leveling-staff-title">標尺が傾くと、読みが大きくなりやすい</h3>
        </div>
        <div className="basics-level-staff-selector" aria-label="標尺の状態を選択">
          {staffConditions.map((condition) => (
            <button
              aria-pressed={condition.id === staffConditionId}
              className={condition.id === staffConditionId ? "is-selected" : ""}
              key={condition.id}
              onClick={() => setStaffConditionId(condition.id)}
              type="button"
            >
              {condition.label}
            </button>
          ))}
        </div>
        <div className="basics-level-staff-workspace">
          <div className={`basics-level-staff-diagram is-${staffConditionId}`}>
            <svg
              aria-labelledby="level-staff-svg-title level-staff-svg-description"
              role="img"
              viewBox="0 0 330 250"
            >
              <title id="level-staff-svg-title">標尺の鉛直と傾きの比較図</title>
              <desc id="level-staff-svg-description">
                水平な視準線に対し、標尺が鉛直な状態と傾いた状態を示します。
              </desc>
              <line className="basics-level-staff-ground" x1="28" x2="302" y1="220" y2="220" />
              <line className="basics-level-staff-sight" x1="25" x2="305" y1="72" y2="72" />
              <line className="basics-level-staff-plumb" x1="180" x2="180" y1="38" y2="220" />
              <g className="basics-level-tilting-staff" transform="translate(180 220)">
                <rect height="190" width="24" x="-12" y="-190" />
                <path d="M-12-160h24M-12-128h24M-12-96h24M-12-64h24M-12-32h24" />
              </g>
              <circle className="basics-level-staff-foot" cx="180" cy="220" r="7" />
              <text className="basics-level-svg-label" x="70" y="61">水平な視準線</text>
              <text className="basics-level-svg-label" x="180" y="242">同じ測点</text>
            </svg>
          </div>
          <div className="basics-level-condition-panel" id="level-staff-condition-panel">
            <strong>{activeStaffCondition.label}</strong>
            <dl>
              <div>
                <dt>状態</dt>
                <dd>{activeStaffCondition.state}</dd>
              </div>
              <div>
                <dt>読定への影響</dt>
                <dd>{activeStaffCondition.impact}</dd>
              </div>
              <div>
                <dt>現場で確認すること</dt>
                <dd>{activeStaffCondition.fieldCheck}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="leveling-sight-distance-title"
        className="basics-level-section"
      >
        <div className="basics-section-heading">
          <span>視準距離をそろえる</span>
          <h3 id="leveling-sight-distance-title">
            後視距離と前視距離の偏りを、据付位置で小さくする
          </h3>
        </div>
        <div className="basics-level-distance-selector" aria-label="視準距離の状態を選択">
          {sightDistanceCases.map((item) => (
            <button
              aria-pressed={item.id === sightDistanceCaseId}
              className={item.id === sightDistanceCaseId ? "is-selected" : ""}
              key={item.id}
              onClick={() => setSightDistanceCaseId(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="basics-level-distance-workspace">
          <div className="basics-level-distance-diagram">
            <svg
              aria-labelledby="level-distance-svg-title level-distance-svg-description"
              role="img"
              viewBox="0 0 420 190"
            >
              <title id="level-distance-svg-title">後視距離と前視距離の比較図</title>
              <desc id="level-distance-svg-description">
                中央のレベルから後視標尺と前視標尺までの距離を比較します。
              </desc>
              <line className="basics-level-distance-ground" x1="20" x2="400" y1="146" y2="146" />
              <line
                className="basics-level-distance-back-line"
                x1={backsightStaffX}
                x2={levelX}
                y1="83"
                y2="83"
              />
              <line
                className="basics-level-distance-fore-line"
                x1={levelX}
                x2={foresightStaffX}
                y1="83"
                y2="83"
              />
              <g className="basics-level-distance-level" transform={`translate(${levelX} 83)`}>
                <rect height="24" rx="5" width="62" x="-31" y="-20" />
                <path d="M0 4v28M0 28l-30 35M0 28l30 35" />
              </g>
              <g className="basics-level-distance-staff" transform={`translate(${backsightStaffX} 146)`}>
                <rect height="110" width="14" x="-7" y="-110" />
              </g>
              <g className="basics-level-distance-staff" transform={`translate(${foresightStaffX} 146)`}>
                <rect height="110" width="14" x="-7" y="-110" />
              </g>
              <text className="basics-level-svg-label" x={(backsightStaffX + levelX) / 2} y="70">
                後視 {activeSightDistanceCase.backsightDistance} m
              </text>
              <text className="basics-level-svg-label" x={(foresightStaffX + levelX) / 2} y="70">
                前視 {activeSightDistanceCase.foresightDistance} m
              </text>
              <text className="basics-level-svg-label" x={levelX} y="174">レベル</text>
            </svg>
          </div>
          <div className="basics-level-distance-result" id="level-distance-result">
            <dl>
              <div>
                <dt>後視距離</dt>
                <dd>{activeSightDistanceCase.backsightDistance.toFixed(1)} m</dd>
              </div>
              <div>
                <dt>前視距離</dt>
                <dd>{activeSightDistanceCase.foresightDistance.toFixed(1)} m</dd>
              </div>
              <div className="is-result">
                <dt>距離差</dt>
                <dd data-testid="sight-distance-difference">
                  {sightDistanceDifference.toFixed(1)} m
                </dd>
              </div>
            </dl>
            <strong>{activeSightDistanceCase.assessment}</strong>
            <p>{activeSightDistanceCase.explanation}</p>
          </div>
        </div>
        <p className="basics-level-caution">
          この操作は距離差とリスクを定性的に比較します。視準線誤差の係数や、
          距離差から実際の標高誤差を算出する処理は実装していません。
        </p>
      </section>

      <section
        aria-labelledby="leveling-condition-title"
        className="basics-level-section"
      >
        <div className="basics-section-heading">
          <span>気泡・自動補正・視差の確認</span>
          <h3 id="leveling-condition-title">
            水平な視準線と安定した読定を作ってから観測する
          </h3>
        </div>
        <div className="basics-level-condition-selector" aria-label="レベルの確認状態を選択">
          {levelConditions.map((condition) => (
            <button
              aria-pressed={condition.id === levelConditionId}
              className={condition.id === levelConditionId ? "is-selected" : ""}
              key={condition.id}
              onClick={() => setLevelConditionId(condition.id)}
              type="button"
            >
              {condition.label}
            </button>
          ))}
        </div>
        <div className="basics-level-instrument-workspace">
          <div className={`basics-level-condition-diagram is-${levelConditionId}`}>
            <svg
              aria-labelledby="level-condition-svg-title level-condition-svg-description"
              role="img"
              viewBox="0 0 340 250"
            >
              <title id="level-condition-svg-title">レベルの気泡と視差の確認図</title>
              <desc id="level-condition-svg-description">
                気泡、自動補正の安定、十字線と標尺像の視差を模式的に示します。
              </desc>
              <g className="basics-level-condition-instrument" transform="translate(105 132)">
                <rect height="48" rx="8" width="132" x="-66" y="-48" />
                <circle cx="58" cy="-24" r="17" />
                <path d="M0 0v28M0 23l-45 73M0 23l45 73M0 23v73" />
              </g>
              <g className="basics-level-condition-bubble" transform="translate(34 30)">
                <rect height="34" rx="17" width="104" />
                <line x1="52" x2="52" y1="5" y2="29" />
                <circle cx="52" cy="17" r="10" />
              </g>
              <g className="basics-level-condition-target" transform="translate(265 80)">
                <rect height="142" width="28" x="-14" y="-20" />
                <path d="M-14 8h28M-14 34h28M-14 60h28M-14 86h28" />
                <path className="is-reticle" d="M-48 42h96M0-6v96" />
                <path className="is-reticle is-ghost" d="M-40 49h96M8 1v96" />
              </g>
              <text className="basics-level-svg-label" x="86" y="22">気泡・自動補正</text>
              <text className="basics-level-svg-label" x="265" y="232">十字線と標尺像</text>
            </svg>
          </div>
          <div className="basics-level-condition-panel" id="level-condition-panel">
            <strong className={`is-${activeLevelCondition.tone}`}>
              {activeLevelCondition.label}：{activeLevelCondition.decision}
            </strong>
            <dl>
              <div>
                <dt>何が正しくないか</dt>
                <dd>{activeLevelCondition.incorrectState}</dd>
              </div>
              <div>
                <dt>読定への影響</dt>
                <dd>{activeLevelCondition.impact}</dd>
              </div>
              <div>
                <dt>現場で確認・調整すること</dt>
                <dd>{activeLevelCondition.fieldCheck}</dd>
              </div>
            </dl>
          </div>
        </div>
        <p className="basics-level-focus-note">
          <strong>視度調整</strong>は十字線を明瞭にする操作、
          <strong>合焦</strong>は標尺像を明瞭にする操作です。目を動かしても
          十字線と標尺像がずれない状態を「視差除去済み」とします。
        </p>
      </section>

      <p className="basics-level-next-note">
        <strong>次の章への接続：</strong>
        第7章では、観測値の正確さ・精密さ・誤差・検査と再観測判断を学びます。
        この章では第7章の教材や確認問題は実装していません。
      </p>
    </div>
  );
}

export default LevelingBasicsLesson;
