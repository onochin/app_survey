import { useState } from "react";
import {
  accuracyPrecisionPatterns,
  applySystematicBias,
  calculateBiasFromReference,
  calculateHeightInputImpact,
  calculateObservationStatistics,
  calculateScatterSummary,
  combineIndependentStandardDeviations,
  errorScenarios,
  evaluateClosingError,
  getRecommendedInspectionDecision,
  heightInputScenarios,
  inspectionDecisionOptions,
  inspectionDecisionScenarios,
  observationErrorConcepts,
  propagationLearningDefaults,
  repeatedObservationSample,
  type AccuracyPrecisionPatternId,
  type ErrorScenarioId,
  type HeightInputScenarioId,
  type InspectionDecision,
  type InspectionDecisionScenarioId,
} from "../data/observationError";
import DefinitionCard from "../ui/DefinitionCard";

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

function ObservationErrorLesson() {
  const [accuracyPatternId, setAccuracyPatternId] =
    useState<AccuracyPrecisionPatternId>("accurate-precise");
  const [repeatCount, setRepeatCount] = useState<number>(
    repeatedObservationSample.initialCount,
  );
  const [errorScenarioId, setErrorScenarioId] =
    useState<ErrorScenarioId>("random");
  const [heightScenarioId, setHeightScenarioId] =
    useState<HeightInputScenarioId>("normal");
  const [standardDeviationA, setStandardDeviationA] = useState<number>(
    propagationLearningDefaults.standardDeviationA,
  );
  const [standardDeviationB, setStandardDeviationB] = useState<number>(
    propagationLearningDefaults.standardDeviationB,
  );
  const [decisionScenarioId, setDecisionScenarioId] =
    useState<InspectionDecisionScenarioId>("within-clear");
  const [selectedDecision, setSelectedDecision] =
    useState<InspectionDecision | null>(null);

  const activeAccuracyPattern =
    accuracyPrecisionPatterns.find(
      (pattern) => pattern.id === accuracyPatternId,
    ) ?? accuracyPrecisionPatterns[0];
  const scatterSummary = calculateScatterSummary(
    activeAccuracyPattern.observations,
    activeAccuracyPattern.referencePosition,
  );
  const activeRepeatedObservations =
    repeatedObservationSample.observations.slice(0, repeatCount);
  const repeatedStatistics = calculateObservationStatistics(
    activeRepeatedObservations,
  );
  const systematicallyBiasedObservations = applySystematicBias(
    activeRepeatedObservations,
    repeatedObservationSample.systematicBiasExample,
  );
  const systematicBiasAfterAveraging = calculateBiasFromReference(
    systematicallyBiasedObservations,
    repeatedObservationSample.referenceValue,
  );
  const activeErrorScenario =
    errorScenarios.find((scenario) => scenario.id === errorScenarioId) ??
    errorScenarios[0];
  const errorScenarioStatistics = calculateObservationStatistics(
    activeErrorScenario.observations,
  );
  const errorScenarioBias = calculateBiasFromReference(
    activeErrorScenario.observations,
    activeErrorScenario.referenceValue,
  );
  const activeHeightScenario =
    heightInputScenarios.find(
      (scenario) => scenario.id === heightScenarioId,
    ) ?? heightInputScenarios[0];
  const heightInputImpact = calculateHeightInputImpact(activeHeightScenario);
  const combinedStandardDeviation = combineIndependentStandardDeviations(
    standardDeviationA,
    standardDeviationB,
  );
  const activeDecisionScenario =
    inspectionDecisionScenarios.find(
      (scenario) => scenario.id === decisionScenarioId,
    ) ?? inspectionDecisionScenarios[0];
  const closingEvaluation = evaluateClosingError(
    activeDecisionScenario.closingError,
    activeDecisionScenario.educationalTolerance,
  );
  const recommendation = getRecommendedInspectionDecision(
    activeDecisionScenario.id,
  );

  const changeRepeatCount = (value: number): void => {
    if (!Number.isFinite(value)) {
      return;
    }

    setRepeatCount(
      Math.min(
        repeatedObservationSample.maximumCount,
        Math.max(repeatedObservationSample.minimumCount, Math.round(value)),
      ),
    );
  };

  const changeStandardDeviation = (
    value: number,
    setter: (nextValue: number) => void,
  ): void => {
    if (
      Number.isFinite(value) &&
      value >= propagationLearningDefaults.minimum &&
      value <= propagationLearningDefaults.maximum
    ) {
      setter(value);
    }
  };

  const selectDecisionScenario = (
    scenarioId: InspectionDecisionScenarioId,
  ): void => {
    setDecisionScenarioId(scenarioId);
    setSelectedDecision(null);
  };

  const scatterOrigin = 110;
  const scatterScale = 8;

  return (
    <div className="basics-error-lesson">
      <section
        aria-labelledby="observation-error-overview-title"
        className="basics-error-intro"
      >
        <div className="basics-section-heading">
          <span>数字を得たあとに、成果として使えるか点検する</span>
          <h3 id="observation-error-overview-title">
            観測値は、点検・原因確認・再観測判断を経て成果になる
          </h3>
        </div>
        <p className="basics-error-lead">
          機器に数値が表示されても、それだけで正しい成果とは限りません。
          <strong>基準との偏り、反復値のばらつき、記録、閉合差</strong>を組み合わせて確認します。
          実務では真値を完全に知ることは通常できないため、この章の計算例は
          「教材用基準値」と比較します。
        </p>
        <ol className="basics-error-flow" aria-label="観測成果を点検する流れ">
          {[
            "観測値を得る",
            "反復値を集計",
            "基準値と比較",
            "残差・閉合差を点検",
            "原因を確認",
            "採用・再計算・再観測",
          ].map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="basics-error-definition-grid">
          {observationErrorConcepts.map((concept) => (
            <DefinitionCard
              className="basics-error-definition"
              icon={concept.icon}
              key={concept.id}
              title={concept.title}
            >
              {concept.description}
            </DefinitionCard>
          ))}
        </div>
        <p className="basics-error-scope-note">
          この章は誤差を見分けて点検へつなげる基礎教材です。共分散、重み付き最小二乗法、
          誤差楕円、観測方程式、分散共分散行列、本格的な網平均は扱いません。
        </p>
      </section>

      <section
        aria-labelledby="accuracy-precision-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 1</span>
          <h3 id="accuracy-precision-title">正確さと精密さは別の性質</h3>
        </div>
        <p className="basics-error-section-lead">
          的の中心は固定した教材用基準位置です。観測点の中心が近いかを
          <strong>正確さ</strong>、観測点どうしのまとまりを<strong>精密さ</strong>として比べます。
        </p>
        <div
          aria-label="正確さと精密さのパターンを選択"
          className="basics-error-selector basics-error-accuracy-selector"
        >
          {accuracyPrecisionPatterns.map((pattern) => (
            <button
              aria-pressed={pattern.id === activeAccuracyPattern.id}
              className={pattern.id === activeAccuracyPattern.id ? "is-selected" : undefined}
              key={pattern.id}
              onClick={() => setAccuracyPatternId(pattern.id)}
              type="button"
            >
              {pattern.label}
            </button>
          ))}
        </div>
        <div className="basics-error-scatter-workspace">
          <div className="basics-error-scatter-diagram">
            <svg
              aria-labelledby="error-scatter-title error-scatter-description"
              role="img"
              viewBox="0 0 220 220"
            >
              <title id="error-scatter-title">{activeAccuracyPattern.label}の散布図</title>
              <desc id="error-scatter-description">
                教材用基準位置、複数の観測点、観測点の中心位置を示します。
              </desc>
              {[75, 52, 29].map((radius) => (
                <circle
                  className="basics-error-target-ring"
                  cx={scatterOrigin}
                  cy={scatterOrigin}
                  key={radius}
                  r={radius}
                />
              ))}
              <path
                className="basics-error-target-axis"
                d={`M${scatterOrigin - 84} ${scatterOrigin}H${scatterOrigin + 84}M${scatterOrigin} ${scatterOrigin - 84}V${scatterOrigin + 84}`}
              />
              <g
                className="basics-error-reference-point"
                transform={`translate(${scatterOrigin} ${scatterOrigin})`}
              >
                <circle r="6" />
                <path d="M-10 0H10M0-10V10" />
                <text x="0" y="-14">教材用基準位置</text>
              </g>
              {activeAccuracyPattern.observations.map((point, index) => (
                <g
                  className="basics-error-observation-point"
                  key={`${point.x}-${point.y}-${index}`}
                  transform={`translate(${scatterOrigin + point.x * scatterScale} ${scatterOrigin - point.y * scatterScale})`}
                >
                  <circle r="6" />
                  <text x="0" y="3">{index + 1}</text>
                </g>
              ))}
              <g
                className="basics-error-observation-center"
                transform={`translate(${scatterOrigin + scatterSummary.center.x * scatterScale} ${scatterOrigin - scatterSummary.center.y * scatterScale})`}
              >
                <rect height="11" width="11" x="-5.5" y="-5.5" />
                <path d="M-9 0H9M0-9V9" />
              </g>
            </svg>
            <p>
              ○番号：個々の観測点 ／ □＋：観測点の中心 ／ ＋：教材用基準位置
            </p>
          </div>
          <article className="basics-error-pattern-panel" id="accuracy-pattern-panel">
            <span>選択中の固定パターン</span>
            <h4>{activeAccuracyPattern.label}</h4>
            <dl>
              <div>
                <dt>観測点の中心位置</dt>
                <dd>
                  X {formatSigned(scatterSummary.center.x, 2)} ／ Y {formatSigned(scatterSummary.center.y, 2)}
                </dd>
              </div>
              <div>
                <dt>基準位置からの偏り</dt>
                <dd data-testid="accuracy-pattern-bias">
                  {scatterSummary.biasFromReference.toFixed(2)} 教材単位
                </dd>
              </div>
              <div>
                <dt>観測点の広がり</dt>
                <dd data-testid="accuracy-pattern-spread">
                  {scatterSummary.rootMeanSquareSpread.toFixed(2)} 教材単位（RMS）
                </dd>
              </div>
              <div>
                <dt>正確さ</dt>
                <dd>{activeAccuracyPattern.accuracy}</dd>
              </div>
              <div>
                <dt>精密さ</dt>
                <dd>{activeAccuracyPattern.precision}</dd>
              </div>
            </dl>
            <p>{activeAccuracyPattern.explanation}</p>
            <strong>現場で考える原因：{activeAccuracyPattern.likelyCause}</strong>
          </article>
        </div>
        <p className="basics-error-caution">
          偏りと広がりは4パターンを比較する教材用指標です。正確・不正確を分ける普遍的なしきい値ではありません。
        </p>
      </section>

      <section
        aria-labelledby="repeated-observation-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 2</span>
          <h3 id="repeated-observation-title">反復観測から平均・残差・ばらつきを読む</h3>
        </div>
        <p className="basics-error-section-lead">
          残差の符号は、この章では<strong>観測値 − 平均値</strong>に統一します。
          正は平均より大きく、負は平均より小さい観測です。計算途中では丸めません。
        </p>
        <div className="basics-error-repeat-controls">
          <label>
            <span>
              使用する観測回数
              <output>{repeatCount} 回</output>
            </span>
            <input
              aria-label="反復観測回数"
              max={repeatedObservationSample.maximumCount}
              min={repeatedObservationSample.minimumCount}
              onChange={(event) => changeRepeatCount(Number(event.currentTarget.value))}
              step={1}
              type="range"
              value={repeatCount}
            />
          </label>
          <div>
            <button
              disabled={repeatCount <= repeatedObservationSample.minimumCount}
              onClick={() => changeRepeatCount(repeatCount - 1)}
              type="button"
            >
              1回減らす
            </button>
            <button
              disabled={repeatCount >= repeatedObservationSample.maximumCount}
              onClick={() => changeRepeatCount(repeatCount + 1)}
              type="button"
            >
              1回増やす
            </button>
          </div>
        </div>
        <div className="basics-error-stat-grid">
          <div>
            <span>観測回数</span>
            <strong>{repeatedStatistics.count} 回</strong>
          </div>
          <div>
            <span>平均値</span>
            <strong data-testid="error-repeat-mean">
              {repeatedStatistics.mean.toFixed(4)} m
            </strong>
          </div>
          <div>
            <span>最大値／最小値</span>
            <strong>
              {repeatedStatistics.maximum.toFixed(4)} ／ {repeatedStatistics.minimum.toFixed(4)} m
            </strong>
          </div>
          <div>
            <span>最大最小差 R</span>
            <strong data-testid="error-repeat-range">
              {repeatedStatistics.range.toFixed(4)} m
            </strong>
          </div>
          <div>
            <span>残差平方和</span>
            <strong data-testid="error-repeat-square-sum">
              {repeatedStatistics.residualSquareSum.toFixed(8)} m²
            </strong>
          </div>
          <div>
            <span>標本標準偏差 s</span>
            <strong data-testid="error-repeat-standard-deviation">
              {repeatedStatistics.sampleStandardDeviation === null
                ? "2回以上必要"
                : `${repeatedStatistics.sampleStandardDeviation.toFixed(5)} m`}
            </strong>
          </div>
        </div>
        <div className="basics-error-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">観測回</th>
                <th scope="col">観測値 xi</th>
                <th scope="col">残差 vi = xi − x̄</th>
                <th scope="col">残差の符号</th>
                <th scope="col">残差²</th>
              </tr>
            </thead>
            <tbody>
              {activeRepeatedObservations.map((observation, index) => {
                const residual = repeatedStatistics.residuals[index] ?? 0;
                const squaredResidual =
                  repeatedStatistics.squaredResiduals[index] ?? 0;

                return (
                  <tr key={`${observation}-${index}`}>
                    <th scope="row">{index + 1}</th>
                    <td>{observation.toFixed(4)} m</td>
                    <td data-testid={`repeat-residual-${index + 1}`}>
                      {formatSigned(residual, 5)} m
                    </td>
                    <td>{residual > 0 ? "正：平均より大" : residual < 0 ? "負：平均より小" : "0：平均と同じ"}</td>
                    <td>{squaredResidual.toFixed(8)} m²</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="basics-error-equations">
          <p>
            <strong>平均値</strong>
            <span>x̄ ＝ Σxi ÷ n ＝ {repeatedStatistics.mean.toFixed(6)} m</span>
          </p>
          <p>
            <strong>残差の確認</strong>
            <span>Σvi ＝ {formatSigned(repeatedStatistics.residualSum, 10)} m（丸め前ではほぼ0）</span>
          </p>
          <p>
            <strong>標本標準偏差</strong>
            <span>
              s ＝ √&#123;Σvi² ÷（n − 1）&#125; ＝ {repeatedStatistics.sampleStandardDeviation?.toFixed(6)} m
            </span>
          </p>
        </div>
        <div className="basics-error-systematic-note">
          <strong>回数を増やしても、系統的な偏りは残る</strong>
          <p>
            同じ観測値すべてへ教材用の偏り+{repeatedObservationSample.systematicBiasExample.toFixed(3)} mを加えると、
            {repeatCount}回を平均した後も教材用基準値との差は
            <b data-testid="systematic-bias-after-average">
              {formatSigned(systematicBiasAfterAveraging, 4)} m
            </b>
            です。反復回数が増えれば必ず正確になるわけではありません。
          </p>
        </div>
        <p className="basics-error-caution">
          観測回数1回では標本標準偏差を計算できません。2回以上の反復値でばらつきを確認し、
          標準偏差が小さいことを正確さと同一視しません。
        </p>
      </section>

      <section
        aria-labelledby="error-types-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 3</span>
          <h3 id="error-types-title">偶然誤差・系統誤差・粗大誤差を見分ける</h3>
        </div>
        <div
          aria-label="誤差の固定教材例を選択"
          className="basics-error-selector basics-error-type-selector"
        >
          {errorScenarios.map((scenario) => (
            <button
              aria-pressed={scenario.id === activeErrorScenario.id}
              className={scenario.id === activeErrorScenario.id ? "is-selected" : undefined}
              key={scenario.id}
              onClick={() => setErrorScenarioId(scenario.id)}
              type="button"
            >
              {scenario.label}
            </button>
          ))}
        </div>
        <article className="basics-error-type-panel" id="error-type-panel">
          <div>
            <span>教材用基準値 {activeErrorScenario.referenceValue.toFixed(3)} m</span>
            <h4>{activeErrorScenario.label}</h4>
            <p>{activeErrorScenario.pattern}</p>
          </div>
          <div className="basics-error-observation-strip" aria-label="観測値一覧">
            {activeErrorScenario.observations.map((observation, index) => (
              <span key={`${observation}-${index}`}>
                {index + 1}: {observation.toFixed(3)} m
              </span>
            ))}
          </div>
          <dl>
            <div>
              <dt>平均値</dt>
              <dd data-testid="error-scenario-mean">
                {errorScenarioStatistics.mean.toFixed(4)} m
              </dd>
            </div>
            <div>
              <dt>平均値 − 教材用基準値</dt>
              <dd data-testid="error-scenario-bias">
                {formatSigned(errorScenarioBias, 4)} m
              </dd>
            </div>
            <div>
              <dt>最大最小差</dt>
              <dd>{errorScenarioStatistics.range.toFixed(4)} m</dd>
            </div>
            <div>
              <dt>標本標準偏差</dt>
              <dd data-testid="error-scenario-standard-deviation">
                {errorScenarioStatistics.sampleStandardDeviation?.toFixed(5)} m
              </dd>
            </div>
          </dl>
          <div className="basics-error-type-guidance">
            <p>
              <strong>反復回数を増やすと：</strong>
              {activeErrorScenario.repetitionEffect}
            </p>
            <p>
              <strong>考えられる原因：</strong>
              {activeErrorScenario.causes.join("、")}
            </p>
            <p>
              <strong>点検：</strong>
              {activeErrorScenario.inspection}
            </p>
            <p>
              <strong>対応：</strong>
              {activeErrorScenario.response}
            </p>
          </div>
        </article>
      </section>

      <section
        aria-labelledby="height-input-error-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 4</span>
          <h3 id="height-input-error-title">高さ入力ミスは成果を同じ量だけずらすことがある</h3>
        </div>
        <p className="basics-error-section-lead">
          正しい高さと入力した高さを比べます。GNSSはアンテナ基準点から地上点を求める
          <strong>教材用簡略モデル</strong>、TSは第5章と同じ高さ規約です。
        </p>
        <div className="basics-error-height-formulas">
          <p>
            <strong>GNSS教材用簡略モデル</strong>
            <span>地上点の高さ ＝ アンテナ基準点の高さ − 入力したアンテナ高</span>
          </p>
          <p>
            <strong>TSの高さ規約</strong>
            <span>測点間高低差 ＝ 器械高 ＋ 視準線上の高低差 − プリズム高</span>
          </p>
        </div>
        <div
          aria-label="高さ入力ミスの固定教材例を選択"
          className="basics-error-selector basics-error-height-selector"
        >
          {heightInputScenarios.map((scenario) => (
            <button
              aria-pressed={scenario.id === activeHeightScenario.id}
              className={scenario.id === activeHeightScenario.id ? "is-selected" : undefined}
              key={scenario.id}
              onClick={() => setHeightScenarioId(scenario.id)}
              type="button"
            >
              {scenario.label}
            </button>
          ))}
        </div>
        <article className="basics-error-height-panel" id="height-input-panel">
          <div className="basics-error-height-heading">
            <span>{heightInputImpact.modelLabel}</span>
            <h4>{activeHeightScenario.label}</h4>
            <p>{activeHeightScenario.explanation}</p>
          </div>
          <div className="basics-error-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">入力項目</th>
                  <th scope="col">正しい入力値</th>
                  <th scope="col">入力した値</th>
                  <th scope="col">入力差</th>
                </tr>
              </thead>
              <tbody>
                {heightInputImpact.inputs.map((input) => (
                  <tr key={input.label}>
                    <th scope="row">{input.label}</th>
                    <td>{input.correctValue.toFixed(3)} m</td>
                    <td>{input.inputValue.toFixed(3)} m</td>
                    <td>{formatSigned(input.inputDifference, 3)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="basics-error-height-results">
            <div>
              <dt>正しい{heightInputImpact.resultLabel}</dt>
              <dd>{heightInputImpact.correctResult.toFixed(3)} m</dd>
            </div>
            <div>
              <dt>誤入力による{heightInputImpact.resultLabel}</dt>
              <dd>{heightInputImpact.inputResult.toFixed(3)} m</dd>
            </div>
            <div>
              <dt>成果への差</dt>
              <dd data-testid="height-input-result-difference">
                {formatSigned(heightInputImpact.resultDifference, 3)} m（{heightInputImpact.direction}）
              </dd>
            </div>
            <div>
              <dt>誤差の性質</dt>
              <dd>{activeHeightScenario.classification}</dd>
            </div>
          </dl>
          <p>
            <strong>現場で確認する記録：</strong>
            {activeHeightScenario.recordsToCheck.join("、")}
          </p>
        </article>
        <p className="basics-error-caution">
          GNSSの式は高さ入力ミスの向きだけを理解する簡略モデルです。アンテナ位相中心や機器内部補正を含む
          本格的なGNSS処理は実装していません。
        </p>
      </section>

      <section
        aria-labelledby="error-propagation-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 5</span>
          <h3 id="error-propagation-title">独立した2量の不確かさは二乗和で合成する</h3>
        </div>
        <p className="basics-error-section-lead">
          第6章の「高低差 ＝ 後視 − 前視」を例に、後視Aと前視Bが
          <strong>独立・無相関</strong>と仮定した基本モデルを操作します。
        </p>
        <div className="basics-error-propagation-workspace">
          <div className="basics-error-propagation-controls">
            <label>
              <span>
                観測量A（後視）の標準偏差
                <output>{standardDeviationA.toFixed(1)} mm</output>
              </span>
              <input
                aria-label="観測量Aの標準偏差"
                max={propagationLearningDefaults.maximum}
                min={propagationLearningDefaults.minimum}
                onChange={(event) =>
                  changeStandardDeviation(
                    Number(event.currentTarget.value),
                    setStandardDeviationA,
                  )
                }
                step={propagationLearningDefaults.step}
                type="range"
                value={standardDeviationA}
              />
            </label>
            <label>
              <span>
                観測量B（前視）の標準偏差
                <output>{standardDeviationB.toFixed(1)} mm</output>
              </span>
              <input
                aria-label="観測量Bの標準偏差"
                max={propagationLearningDefaults.maximum}
                min={propagationLearningDefaults.minimum}
                onChange={(event) =>
                  changeStandardDeviation(
                    Number(event.currentTarget.value),
                    setStandardDeviationB,
                  )
                }
                step={propagationLearningDefaults.step}
                type="range"
                value={standardDeviationB}
              />
            </label>
          </div>
          <div className="basics-error-propagation-result">
            <div className="basics-error-propagation-steps" aria-label="標準偏差の合成計算">
              <span>
                σA²
                <strong>{standardDeviationA.toFixed(1)}² ＝ {(standardDeviationA ** 2).toFixed(2)} mm²</strong>
              </span>
              <b aria-hidden="true">＋</b>
              <span>
                σB²
                <strong>{standardDeviationB.toFixed(1)}² ＝ {(standardDeviationB ** 2).toFixed(2)} mm²</strong>
              </span>
              <b aria-hidden="true">＝</b>
              <span>
                二乗和
                <strong>{(standardDeviationA ** 2 + standardDeviationB ** 2).toFixed(2)} mm²</strong>
              </span>
              <b aria-hidden="true">√</b>
              <span className="is-result">
                和・差の標準偏差
                <strong data-testid="combined-standard-deviation">
                  {combinedStandardDeviation.toFixed(3)} mm
                </strong>
              </span>
            </div>
            <p>
              σq ＝ √(σA² ＋ σB²) ＝ {combinedStandardDeviation.toFixed(3)} mm。
              両方が0より大きいとき、合成後は一方だけの標準偏差より大きくなります。
            </p>
          </div>
        </div>
        <p className="basics-error-caution">
          誤差を符号付きで単純加算する式ではありません。実務の精密な評価では、相関、機器仕様、
          観測方法、補正条件を確認します。
        </p>
      </section>

      <section
        aria-labelledby="difference-terms-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 6</span>
          <h3 id="difference-terms-title">誤差・残差・閉合差は、比較する相手が違う</h3>
        </div>
        <div className="basics-error-difference-grid">
          <article>
            <span>観測値 ↔ 真値・教材用基準値</span>
            <h4>誤差</h4>
            <p>観測値と真値、または教材用基準値との差です。</p>
            <code>50.006 − 50.000 ＝ +0.006 m</code>
          </article>
          <article>
            <span>個々の観測値 ↔ 平均値</span>
            <h4>残差</h4>
            <p>個々の観測値と、平均値などの代表値との差です。</p>
            <code>vi ＝ xi − x̄</code>
          </article>
          <article>
            <span>計算終点 ↔ 閉じる点・既知終点</span>
            <h4>閉合差</h4>
            <p>閉じるべき観測や既知点へ到達した観測で、一致しなかった差です。</p>
            <code>101.254 − 101.250 ＝ +0.004 m</code>
          </article>
        </div>
        <ul className="basics-error-difference-notes">
          <li>残差が小さくても、全体が系統的に偏っている場合があります。</li>
          <li>閉合差が小さくても、粗大誤差どうしが相殺されている可能性があります。</li>
          <li>1つの指標だけで成果の正しさを決めず、記録、既知値、点検、再観測を組み合わせます。</li>
          <li>測量計算・調整では残差や補正量の符号規約が異なる場合があり、この章では反復観測用の規約を使います。</li>
        </ul>
      </section>

      <section
        aria-labelledby="inspection-decision-title"
        className="basics-error-section"
      >
        <div className="basics-section-heading">
          <span>ミニ操作 7</span>
          <h3 id="inspection-decision-title">許容値だけで決めず、原因と記録を確認する</h3>
        </div>
        <p className="basics-error-section-lead">
          ここで使う許容値は、判断手順を学ぶための<strong>教材用の仮定値</strong>です。
          実務では測量区分、路線長、観測方法、作業規程に合う値を確認します。
        </p>
        <div className="basics-error-decision-workspace">
          <div
            aria-label="点検と再観測の教材用シナリオを選択"
            className="basics-error-decision-scenarios"
          >
            {inspectionDecisionScenarios.map((scenario) => (
              <button
                aria-pressed={scenario.id === activeDecisionScenario.id}
                className={scenario.id === activeDecisionScenario.id ? "is-selected" : undefined}
                key={scenario.id}
                onClick={() => selectDecisionScenario(scenario.id)}
                type="button"
              >
                {scenario.label}
              </button>
            ))}
          </div>
          <article className="basics-error-decision-panel" id="inspection-decision-panel">
            <span>固定教材シナリオ</span>
            <h4>{activeDecisionScenario.label}</h4>
            <p>{activeDecisionScenario.finding}</p>
            <dl>
              <div>
                <dt>閉合差</dt>
                <dd>{formatSigned(activeDecisionScenario.closingError, 3)} m</dd>
              </div>
              <div>
                <dt>教材用許容値（仮定）</dt>
                <dd>±{activeDecisionScenario.educationalTolerance.toFixed(3)} m</dd>
              </div>
              <div>
                <dt>絶対値で比較</dt>
                <dd data-testid="closing-tolerance-evaluation">
                  |{formatSigned(activeDecisionScenario.closingError, 3)}| {closingEvaluation.withinTolerance ? "≦" : "＞"} {closingEvaluation.tolerance.toFixed(3)} m
                  （{closingEvaluation.withinTolerance ? "仮定値以内" : "仮定値超過"}）
                </dd>
              </div>
            </dl>
            <div className="basics-error-warning-signs">
              <strong>閉合差と一緒に確認する兆候</strong>
              <ul>
                {activeDecisionScenario.warningSigns.map((sign) => (
                  <li key={sign}>{sign}</li>
                ))}
              </ul>
            </div>
            <fieldset>
              <legend>あなたの判断を選ぶ</legend>
              <div className="basics-error-decision-options">
                {inspectionDecisionOptions.map((decision) => (
                  <button
                    aria-pressed={decision === selectedDecision}
                    className={decision === selectedDecision ? "is-selected" : undefined}
                    key={decision}
                    onClick={() => setSelectedDecision(decision)}
                    type="button"
                  >
                    {decision}
                  </button>
                ))}
              </div>
            </fieldset>
            {selectedDecision ? (
              <div
                className={`basics-error-decision-feedback ${selectedDecision === recommendation.decision ? "is-match" : "is-review"}`}
                data-testid="inspection-decision-feedback"
              >
                <strong>
                  {selectedDecision === recommendation.decision
                    ? "推奨判断と一致"
                    : "もう一度、異常の種類を確認"}
                </strong>
                <p>
                  推奨：<b>{recommendation.decision}</b>
                </p>
                <p>理由：{recommendation.reason}</p>
              </div>
            ) : (
              <p className="basics-error-decision-prompt">判断を1つ選ぶと、推奨判断と理由を表示します。</p>
            )}
          </article>
        </div>
        <p className="basics-error-next-note">
          <strong>次の章へ：</strong>
          第8章では距離と方位角をX・Y座標の変化へ分ける計算へ進みます。この章では座標増分や
          閉合トラバース計算を先行実装しません。
        </p>
      </section>
    </div>
  );
}

export default ObservationErrorLesson;
