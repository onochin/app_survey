import { useState } from "react";
import {
  calculateHorizontalDistance,
  calculateMapDistanceMillimeters,
  calculatePrismConstantResult,
  distanceErrorFactors,
  distanceMethods,
  distanceObservationSamples,
  distanceScaleOptions,
  distanceTypeDefinitions,
  prismLearningModel,
  scaleLearningSample,
  summarizeDistanceObservations,
  type DistanceMethodId,
  type DistanceScaleDenominator,
} from "../data/distanceMeasurement";
import DefinitionCard from "../ui/DefinitionCard";

const formatSignedNumber = (value: number, digits = 0): string => {
  const absoluteValue = Math.abs(value).toFixed(digits);

  if (value > 0) {
    return `+${absoluteValue}`;
  }

  if (value < 0) {
    return `−${absoluteValue}`;
  }

  return Number(absoluteValue).toFixed(digits);
};

const formatPlainNumber = (value: number): string =>
  value < 0 ? `−${Math.abs(value)}` : String(value);

function HeightDifferenceLesson() {
  const [slopeDistance, setSlopeDistance] = useState(50);
  const [heightDifference, setHeightDifference] = useState(30);
  const [activeMethodId, setActiveMethodId] =
    useState<DistanceMethodId>("tape");
  const [configuredPrismConstant, setConfiguredPrismConstant] =
    useState<number>(prismLearningModel.initialSetting);
  const [observations, setObservations] = useState<readonly number[]>(() =>
    distanceObservationSamples.slice(0, 3),
  );
  const [scaleDenominator, setScaleDenominator] =
    useState<DistanceScaleDenominator>(500);

  const horizontalDistance = calculateHorizontalDistance(
    slopeDistance,
    heightDifference,
  );
  const activeMethod =
    distanceMethods.find((method) => method.id === activeMethodId) ??
    distanceMethods[0];
  const prismResult = calculatePrismConstantResult(
    prismLearningModel.trueDistance,
    prismLearningModel.correctConstant,
    configuredPrismConstant,
  );
  const observationSummary =
    summarizeDistanceObservations(observations);
  const mapDistance = calculateMapDistanceMillimeters(
    scaleLearningSample.fieldDistance,
    scaleDenominator,
  );
  const largestMapDistance = calculateMapDistanceMillimeters(
    scaleLearningSample.fieldDistance,
    distanceScaleOptions[0],
  );
  const heightControlLimit = Math.min(30, slopeDistance);
  const diagramPointX = 120 + (horizontalDistance / 100) * 440;
  const diagramPointY = 190 - (heightDifference / 30) * 105;

  const changeSlopeDistance = (value: number): void => {
    if (!Number.isFinite(value)) {
      return;
    }

    const nextSlopeDistance = Math.min(100, Math.max(10, value));
    setSlopeDistance(nextSlopeDistance);
    setHeightDifference((currentHeightDifference) =>
      Math.min(
        nextSlopeDistance,
        Math.max(-nextSlopeDistance, currentHeightDifference),
      ),
    );
  };

  const changeHeightDifference = (value: number): void => {
    if (!Number.isFinite(value)) {
      return;
    }

    setHeightDifference(
      Math.min(
        heightControlLimit,
        Math.max(-heightControlLimit, value),
      ),
    );
  };

  const addObservation = (): void => {
    setObservations((currentObservations) => {
      if (
        currentObservations.length >= distanceObservationSamples.length
      ) {
        return currentObservations;
      }

      const nextObservation =
        distanceObservationSamples[currentObservations.length];

      return nextObservation === undefined
        ? currentObservations
        : [...currentObservations, nextObservation];
    });
  };

  return (
    <div className="basics-distance-lesson">
      <section
        aria-labelledby="distance-types-title"
        className="basics-distance-intro"
      >
        <div className="basics-section-heading">
          <span>3つを1組で考える</span>
          <h3 id="distance-types-title">距離は「どの向きの長さか」で意味が変わる</h3>
        </div>
        <p>
          現場の2点を結ぶ長さには、斜距離、水平距離、高低差があります。
          機器が表示した値の名称を確認し、成果が必要とする距離へ計算・補正して使います。
        </p>
        <div className="basics-definition-grid basics-distance-definition-grid">
          {distanceTypeDefinitions.map((definition) => (
            <DefinitionCard
              className="basics-distance-definition"
              icon={definition.icon}
              key={definition.id}
              title={definition.title}
            >
              {definition.description}
            </DefinitionCard>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="distance-triangle-title"
        className="basics-visual-card basics-distance-triangle-card"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">距離の連動ラボ</span>
            <h3 id="distance-triangle-title">
              斜距離と高低差を動かし、水平距離を確かめる
            </h3>
          </div>
          <span className="basics-operation-hint">
            <span aria-hidden="true">↗</span>
            2つの値を操作
          </span>
        </div>

        <div className="basics-distance-triangle-workspace">
          <div className="basics-distance-diagram">
            <svg
              aria-labelledby="distance-svg-title distance-svg-description"
              className="basics-distance-svg"
              role="img"
              viewBox="0 0 680 360"
            >
              <title id="distance-svg-title">
                斜距離・水平距離・高低差の直角三角形
              </title>
              <desc id="distance-svg-description">
                点Aと点Bを結ぶ斜距離、水平に投影した水平距離、鉛直方向の高低差を直角三角形で示しています。
              </desc>
              <defs>
                <marker
                  id="basics-distance-arrow"
                  markerHeight="7"
                  markerWidth="7"
                  orient="auto-start-reverse"
                  refX="3.5"
                  refY="3.5"
                >
                  <path d="M0,3.5 L7,0 L7,7 Z" />
                </marker>
                <linearGradient
                  id="basics-distance-ground"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#e4f3dc" />
                  <stop offset="100%" stopColor="#f4ead5" />
                </linearGradient>
              </defs>
              <path
                className="basics-distance-ground"
                d={`M42 310 Q135 270 220 278 Q360 290 ${
                  diagramPointX - 45
                } ${diagramPointY + 26} Q${diagramPointX + 45} ${
                  diagramPointY + 18
                } 638 ${diagramPointY + 55} L638 334H42Z`}
              />
              <line
                className="basics-distance-horizontal-line"
                markerEnd="url(#basics-distance-arrow)"
                markerStart="url(#basics-distance-arrow)"
                x1="120"
                x2={diagramPointX}
                y1="190"
                y2="190"
              />
              <line
                className="basics-distance-height-line"
                markerEnd="url(#basics-distance-arrow)"
                markerStart="url(#basics-distance-arrow)"
                x1={diagramPointX}
                x2={diagramPointX}
                y1="190"
                y2={diagramPointY}
              />
              <line
                className="basics-distance-slope-line"
                markerEnd="url(#basics-distance-arrow)"
                markerStart="url(#basics-distance-arrow)"
                x1="120"
                x2={diagramPointX}
                y1="190"
                y2={diagramPointY}
              />
              <path
                className="basics-distance-right-angle"
                d={`M${diagramPointX - 14} 190V${
                  heightDifference >= 0 ? 176 : 204
                }H${diagramPointX}`}
              />
              <g className="basics-distance-point">
                <circle cx="120" cy="190" r="7" />
                <text x="98" y="220">点A</text>
              </g>
              <g className="basics-distance-point is-target">
                <circle cx={diagramPointX} cy={diagramPointY} r="7" />
                <text x={diagramPointX + 12} y={diagramPointY - 12}>点B</text>
              </g>
              <g className="basics-distance-svg-labels">
                <text
                  className="is-horizontal"
                  x={(120 + diagramPointX) / 2}
                  y="216"
                >
                  水平距離 {horizontalDistance.toFixed(3)} m
                </text>
                <text
                  className="is-slope"
                  x={(120 + diagramPointX) / 2}
                  y={(190 + diagramPointY) / 2 - 13}
                >
                  斜距離 {slopeDistance.toFixed(3)} m
                </text>
                <text
                  className="is-height"
                  x={diagramPointX + 12}
                  y={(190 + diagramPointY) / 2 + 4}
                >
                  高低差 {formatSignedNumber(heightDifference, 3)} m
                </text>
              </g>
            </svg>
            <p>
              図は3つの関係を見やすく強調した模式図です。実際の地形縮尺とは異なります。
            </p>
          </div>

          <div className="basics-distance-controls">
            <div className="basics-distance-range-control">
              <div className="basics-range-heading">
                <label htmlFor="distance-slope-range">斜距離</label>
                <output htmlFor="distance-slope-range">
                  {slopeDistance.toFixed(3)} m
                </output>
              </div>
              <input
                id="distance-slope-range"
                max="100"
                min="10"
                onChange={(event) =>
                  changeSlopeDistance(Number(event.currentTarget.value))
                }
                step="1"
                type="range"
                value={slopeDistance}
              />
              <div className="basics-distance-range-scale" aria-hidden="true">
                <span>10 m</span>
                <span>100 m</span>
              </div>
            </div>

            <div className="basics-distance-range-control">
              <div className="basics-range-heading">
                <label htmlFor="distance-height-range">高低差</label>
                <output htmlFor="distance-height-range">
                  {formatSignedNumber(heightDifference, 3)} m
                </output>
              </div>
              <input
                id="distance-height-range"
                max={heightControlLimit}
                min={-heightControlLimit}
                onChange={(event) =>
                  changeHeightDifference(Number(event.currentTarget.value))
                }
                step="1"
                type="range"
                value={heightDifference}
              />
              <div className="basics-distance-range-scale" aria-hidden="true">
                <span>下向き</span>
                <span>上向き</span>
              </div>
            </div>

            <dl
              aria-live="polite"
              className="basics-distance-live-values"
            >
              <div className="is-slope">
                <dt>機器が直接測る斜距離</dt>
                <dd>{slopeDistance.toFixed(3)} m</dd>
              </div>
              <div className="is-height">
                <dt>鉛直方向の高低差</dt>
                <dd>{formatSignedNumber(heightDifference, 3)} m</dd>
              </div>
              <div className="is-horizontal">
                <dt>成果へ使う水平距離</dt>
                <dd>{horizontalDistance.toFixed(3)} m</dd>
              </div>
            </dl>

            <div
              aria-live="polite"
              className="basics-distance-equation"
            >
              <span>直角三角形の関係</span>
              <strong>斜距離² ＝ 水平距離² ＋ 高低差²</strong>
              <p>
                {slopeDistance.toFixed(3)}² ＝{" "}
                {horizontalDistance.toFixed(3)}² ＋{" "}
                {Math.abs(heightDifference).toFixed(3)}²
              </p>
              <strong>
                水平距離 ＝ √(斜距離² − 高低差²)
              </strong>
              <output>
                √({slopeDistance.toFixed(3)}² −{" "}
                {Math.abs(heightDifference).toFixed(3)}²) ＝{" "}
                {horizontalDistance.toFixed(3)} m
              </output>
            </div>

            <p className="basics-learning-note">
              <span aria-hidden="true">!</span>
              斜距離は0より大きく、高低差の絶対値が斜距離を超えない範囲だけを操作できます。
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="distance-method-title"
        className="basics-distance-method-section"
      >
        <div className="basics-section-heading">
          <span>観測方法を切り替える</span>
          <h3 id="distance-method-title">
            道具が直接測る値と、最後に使う距離を比べる
          </h3>
        </div>
        <div
          aria-label="距離を測る方法"
          className="basics-distance-method-selector"
          role="tablist"
        >
          {distanceMethods.map((method) => (
            <button
              aria-controls="distance-method-panel"
              aria-selected={method.id === activeMethodId}
              className={method.id === activeMethodId ? "is-selected" : ""}
              id={`distance-method-${method.id}`}
              key={method.id}
              onClick={() => setActiveMethodId(method.id)}
              role="tab"
              type="button"
            >
              <strong>{method.label}</strong>
              <small>{method.shortLabel}</small>
            </button>
          ))}
        </div>

        <div className="basics-distance-method-workspace">
          <section
            aria-labelledby={`distance-method-${activeMethod.id}`}
            className="basics-distance-method-panel"
            id="distance-method-panel"
            role="tabpanel"
          >
            <div>
              <span>選択中の方法</span>
              <h4>{activeMethod.label}</h4>
              <p>{activeMethod.conversionNeed}</p>
            </div>
            <dl>
              <div>
                <dt>機器が直接測る値</dt>
                <dd>{activeMethod.directValue}</dd>
              </div>
              <div>
                <dt>得意な場面</dt>
                <dd>{activeMethod.bestFor}</dd>
              </div>
              <div>
                <dt>現場で確認する条件</dt>
                <dd>
                  <ul>
                    {activeMethod.fieldChecks.map((fieldCheck) => (
                      <li key={fieldCheck}>{fieldCheck}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>必要な補正・計算</dt>
                <dd>
                  <ul>
                    {activeMethod.corrections.map((correction) => (
                      <li key={correction}>{correction}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="is-result">
                <dt>最終的に使用する距離</dt>
                <dd>{activeMethod.resultDistance}</dd>
              </div>
            </dl>
          </section>

          {activeMethodId === "total-station" ? (
            <section
              aria-labelledby="prism-model-title"
              className="basics-distance-prism-model"
            >
              <div>
                <span>教材用簡略モデル</span>
                <h4 id="prism-model-title">
                  プリズム定数の設定誤り
                </h4>
                <p>
                  正しいプリズム定数を
                  <strong>
                    {formatPlainNumber(prismLearningModel.correctConstant)} mm
                  </strong>
                  とした教材例です。TSへ設定する値を切り替えてください。
                </p>
              </div>
              <div
                aria-label="設定するプリズム定数"
                className="basics-distance-prism-selector"
              >
                {prismLearningModel.settingOptions.map((setting) => (
                  <button
                    aria-pressed={setting === configuredPrismConstant}
                    className={
                      setting === configuredPrismConstant
                        ? "is-selected"
                        : ""
                    }
                    key={setting}
                    onClick={() => setConfiguredPrismConstant(setting)}
                    type="button"
                  >
                    {formatSignedNumber(setting)} mm
                  </button>
                ))}
              </div>
              <dl
                aria-live="polite"
                className="basics-distance-prism-values"
              >
                <div>
                  <dt>真の距離（教材値）</dt>
                  <dd>{prismLearningModel.trueDistance.toFixed(3)} m</dd>
                </div>
                <div>
                  <dt>正しい定数</dt>
                  <dd>
                    {formatPlainNumber(prismLearningModel.correctConstant)} mm
                  </dd>
                </div>
                <div>
                  <dt>設定した定数</dt>
                  <dd>
                    {formatSignedNumber(configuredPrismConstant)} mm
                  </dd>
                </div>
                <div className="is-error">
                  <dt>定数設定誤差</dt>
                  <dd>{formatSignedNumber(prismResult.settingError)} mm</dd>
                </div>
                <div className="is-result">
                  <dt>表示距離</dt>
                  <dd>{prismResult.displayedDistance.toFixed(3)} m</dd>
                </div>
              </dl>
              <div
                aria-live="polite"
                className="basics-distance-prism-equation"
              >
                <p>
                  <strong>定数設定誤差</strong> ＝ 設定した定数 − 正しい定数
                </p>
                <output>
                  {formatPlainNumber(configuredPrismConstant)} − (
                  {formatPlainNumber(prismLearningModel.correctConstant)}) ＝{" "}
                  {formatSignedNumber(prismResult.settingError)} mm
                </output>
                <p>
                  <strong>表示距離</strong> ＝ 真の距離 ＋ 定数設定誤差
                </p>
                <output>
                  {prismLearningModel.trueDistance.toFixed(3)} m ＋ (
                  {formatSignedNumber(prismResult.settingError)} mm ÷ 1000) ＝{" "}
                  {prismResult.displayedDistance.toFixed(3)} m
                </output>
              </div>
              <p className="basics-learning-note">
                <span aria-hidden="true">!</span>
                これは設定誤りの影響を学ぶ簡略モデルです。実務では符号規約を一般化せず、使用機器とプリズムの取扱説明書を確認します。
              </p>
            </section>
          ) : (
            <aside className="basics-distance-prism-placeholder">
              <span aria-hidden="true">◇</span>
              <p>
                <strong>プリズム定数はTSで確認</strong>
                TSを選ぶと、正しい定数と設定値の違いが距離へ与える影響を操作できます。
              </p>
            </aside>
          )}
        </div>
      </section>

      <section
        aria-labelledby="distance-correction-title"
        className="basics-distance-correction-section"
      >
        <div className="basics-section-heading">
          <span>観測値から成果値へ</span>
          <h3 id="distance-correction-title">
            補正する条件を、観測記録へ残す
          </h3>
        </div>
        <div className="basics-distance-value-flow">
          <article>
            <span>01</span>
            <div>
              <h4>観測値</h4>
              <p>機器の表示や巻尺の目盛から、現場で直接得た値。</p>
            </div>
          </article>
          <span aria-hidden="true">→</span>
          <article>
            <span>02</span>
            <div>
              <h4>補正値</h4>
              <p>分かっている影響を、決められた条件と方法で加減した値。</p>
            </div>
          </article>
          <span aria-hidden="true">→</span>
          <article>
            <span>03</span>
            <div>
              <h4>成果で使う距離</h4>
              <p>単位と距離の種類をそろえ、点検を終えた値。</p>
            </div>
          </article>
        </div>
        <div className="basics-distance-factor-grid">
          {distanceErrorFactors.map((factor) => (
            <article key={factor.id}>
              <h4>{factor.title}</h4>
              <p>{factor.affects}</p>
              <strong>現場で確認</strong>
              <p>{factor.fieldAction}</p>
            </article>
          ))}
        </div>
        <p className="basics-distance-coefficient-note">
          温度、張力、気象の精密な補正式や係数は、機器・巻尺・作業規程で異なります。
          この章では推測の係数を使わず、影響と確認条件を学びます。
        </p>
      </section>

      <div className="basics-distance-bottom-labs">
        <section
          aria-labelledby="distance-repeat-title"
          className="basics-visual-card basics-distance-repeat-card"
        >
          <div className="basics-card-heading">
            <div>
              <span className="basics-card-kicker">反復観測ラボ</span>
              <h3 id="distance-repeat-title">
                1回の値だけでなく、ばらつきを見る
              </h3>
            </div>
            <div className="basics-distance-repeat-actions">
              <button
                disabled={
                  observations.length >= distanceObservationSamples.length
                }
                onClick={addObservation}
                type="button"
              >
                観測を1回追加
              </button>
              <button
                className="is-secondary"
                onClick={() =>
                  setObservations(
                    distanceObservationSamples.slice(0, 3),
                  )
                }
                type="button"
              >
                3回に戻す
              </button>
            </div>
          </div>
          <div className="basics-distance-repeat-workspace">
            <ol aria-label="距離の観測値一覧">
              {observations.map((observation, index) => (
                <li key={`${index}-${observation}`}>
                  <span>{index + 1}回目</span>
                  <strong>{observation.toFixed(3)} m</strong>
                </li>
              ))}
            </ol>
            <dl
              aria-live="polite"
              className="basics-distance-repeat-summary"
            >
              <div>
                <dt>観測回数</dt>
                <dd>{observationSummary.count} 回</dd>
              </div>
              <div className="is-mean">
                <dt>平均値</dt>
                <dd>{observationSummary.mean.toFixed(4)} m</dd>
              </div>
              <div>
                <dt>最大値</dt>
                <dd>{observationSummary.maximum.toFixed(4)} m</dd>
              </div>
              <div>
                <dt>最小値</dt>
                <dd>{observationSummary.minimum.toFixed(4)} m</dd>
              </div>
              <div className="is-range">
                <dt>最大最小差</dt>
                <dd>{observationSummary.range.toFixed(4)} m</dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          aria-labelledby="distance-scale-title"
          className="basics-visual-card basics-distance-scale-card"
        >
          <div className="basics-card-heading">
            <div>
              <span className="basics-card-kicker">縮尺比較ラボ</span>
              <h3 id="distance-scale-title">
                同じ現地距離を、異なる縮尺で表す
              </h3>
            </div>
            <span className="basics-operation-hint">
              <span aria-hidden="true">⇄</span>
              縮尺を切替
            </span>
          </div>
          <div className="basics-distance-scale-workspace">
            <div
              aria-label="比較する縮尺"
              className="basics-distance-scale-selector"
            >
              {distanceScaleOptions.map((denominator) => (
                <button
                  aria-pressed={denominator === scaleDenominator}
                  className={
                    denominator === scaleDenominator
                      ? "is-selected"
                      : ""
                  }
                  key={denominator}
                  onClick={() => setScaleDenominator(denominator)}
                  type="button"
                >
                  1:{denominator}
                </button>
              ))}
            </div>
            <div
              aria-live="polite"
              className="basics-distance-scale-result"
            >
              <span>現地距離は変わらない</span>
              <strong>
                {scaleLearningSample.fieldDistance.toFixed(3)}{" "}
                {scaleLearningSample.unit}
              </strong>
              <div aria-hidden="true">
                <span
                  style={{
                    width: `${Math.max(
                      8,
                      (mapDistance / largestMapDistance) * 100,
                    )}%`,
                  }}
                />
              </div>
              <p>
                縮尺 1:{scaleDenominator} では、図上距離は
                <output>{mapDistance.toFixed(2)} mm</output>
              </p>
            </div>
            <div className="basics-distance-scale-equation">
              <span>図上距離(mm)</span>
              <strong>
                ＝ 現地距離(m) × 1000 ÷ 縮尺分母
              </strong>
              <output>
                {scaleLearningSample.fieldDistance.toFixed(3)} × 1000 ÷{" "}
                {scaleDenominator} ＝ {mapDistance.toFixed(2)} mm
              </output>
            </div>
            <div className="basics-distance-scale-comparison">
              {distanceScaleOptions.map((denominator) => {
                const comparisonDistance =
                  calculateMapDistanceMillimeters(
                    scaleLearningSample.fieldDistance,
                    denominator,
                  );

                return (
                  <div
                    className={
                      denominator === scaleDenominator
                        ? "is-selected"
                        : ""
                    }
                    key={denominator}
                  >
                    <span>1:{denominator}</span>
                    <strong>{comparisonDistance.toFixed(2)} mm</strong>
                  </div>
                );
              })}
            </div>
            <p className="basics-learning-note">
              <span aria-hidden="true">!</span>
              縮尺分母が大きいほど、同じ現地距離は図上で小さく表されます。単位をmからmmへそろえて計算します。
            </p>
          </div>
        </section>
      </div>

      <p className="basics-distance-next-note">
        <strong>この章の範囲：</strong>
        距離の種類と補正の考え方までを扱います。鉛直角・天頂角やTS観測手順の詳しい説明は、後続章で学びます。
      </p>
    </div>
  );
}

export default HeightDifferenceLesson;
