import { useState } from "react";
import {
  decimalDegreesToDms,
  degreesToRadians,
  normalizeAzimuth,
} from "../../../calculations/angle";
import { calculateNextAzimuth } from "../../../calculations/azimuth";
import type { DmsAngle } from "../../../types/traverse";
import {
  angleDefinitions,
  calculateDmsOperation,
  calculateExteriorAngle,
  calculateHorizontalAngle,
  calculateVerticalAngleFromZenith,
  directionOptions,
  dmsExercises,
  type HorizontalRotation,
} from "../data/angleAndAzimuth";
import DefinitionCard from "../ui/DefinitionCard";

type DirectionId = (typeof directionOptions)[number]["id"];
type DmsExerciseId = (typeof dmsExercises)[number]["id"];
type InteriorAngleView = "interior" | "exterior";
type VerticalAngleView = "vertical" | "zenith";

interface SvgPoint {
  readonly x: number;
  readonly y: number;
}

const azimuthNudges = [
  { label: "−1°", accessibleLabel: "方位角を1度減らす", delta: -1 },
  {
    label: "−1′",
    accessibleLabel: "方位角を1分減らす",
    delta: -1 / 60,
  },
  {
    label: "−1″",
    accessibleLabel: "方位角を1秒減らす",
    delta: -1 / 3_600,
  },
  {
    label: "+1″",
    accessibleLabel: "方位角を1秒増やす",
    delta: 1 / 3_600,
  },
  {
    label: "+1′",
    accessibleLabel: "方位角を1分増やす",
    delta: 1 / 60,
  },
  { label: "+1°", accessibleLabel: "方位角を1度増やす", delta: 1 },
] as const;

function formatDms(dms: DmsAngle): string {
  const hasMagnitude =
    dms.degrees !== 0 || dms.minutes !== 0 || dms.seconds !== 0;
  const sign = dms.sign === -1 && hasMagnitude ? "−" : "";
  const minutes = String(dms.minutes).padStart(2, "0");
  const seconds = dms.seconds.toFixed(0).padStart(2, "0");

  return `${sign}${dms.degrees}°${minutes}′${seconds}″`;
}

function formatDecimalDegrees(value: number): string {
  return `${value.toFixed(6)}°`;
}

function pointFromNorthClockwise(
  angleDegrees: number,
  radius: number,
  centerX: number,
  centerY: number,
): SvgPoint {
  const radians = degreesToRadians(angleDegrees);

  return {
    x: centerX + radius * Math.sin(radians),
    y: centerY - radius * Math.cos(radians),
  };
}

function describeAngleArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngleDegrees: number,
  sweepDegrees: number,
): string {
  if (Math.abs(sweepDegrees) < 1e-9) {
    return "";
  }

  const start = pointFromNorthClockwise(
    startAngleDegrees,
    radius,
    centerX,
    centerY,
  );
  const end = pointFromNorthClockwise(
    startAngleDegrees + sweepDegrees,
    radius,
    centerX,
    centerY,
  );
  const largeArcFlag = Math.abs(sweepDegrees) > 180 ? 1 : 0;
  const sweepFlag = sweepDegrees > 0 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}

function getDirection(directionId: DirectionId) {
  return (
    directionOptions.find((direction) => direction.id === directionId) ??
    directionOptions[0]
  );
}

function ErrorAndEquipmentLesson() {
  const [azimuthDegrees, setAzimuthDegrees] = useState(
    45 + 20 / 60 + 30 / 3_600,
  );
  const [backSightId, setBackSightId] =
    useState<DirectionId>("northwest");
  const [foreSightId, setForeSightId] =
    useState<DirectionId>("northeast");
  const [horizontalRotation, setHorizontalRotation] =
    useState<HorizontalRotation>("clockwise");
  const [interiorAngleDegrees, setInteriorAngleDegrees] = useState(110);
  const [previousAzimuthDegrees, setPreviousAzimuthDegrees] = useState(35);
  const [interiorAngleView, setInteriorAngleView] =
    useState<InteriorAngleView>("interior");
  const [selectedDmsExerciseId, setSelectedDmsExerciseId] =
    useState<DmsExerciseId>("carry");
  const [zenithAngleDegrees, setZenithAngleDegrees] = useState(65);
  const [verticalAngleView, setVerticalAngleView] =
    useState<VerticalAngleView>("vertical");

  const azimuthDms = decimalDegreesToDms(azimuthDegrees, 0);
  const azimuthLineEnd = pointFromNorthClockwise(
    azimuthDegrees,
    92,
    130,
    125,
  );
  const azimuthArc = describeAngleArc(
    130,
    125,
    51,
    0,
    azimuthDegrees,
  );

  const backSight = getDirection(backSightId);
  const foreSight = getDirection(foreSightId);
  const horizontalAngleDegrees = calculateHorizontalAngle(
    backSight.azimuthDegrees,
    foreSight.azimuthDegrees,
    horizontalRotation,
  );
  const horizontalAngleDms = decimalDegreesToDms(
    horizontalAngleDegrees,
    0,
  );
  const backSightEnd = pointFromNorthClockwise(
    backSight.azimuthDegrees,
    94,
    150,
    130,
  );
  const foreSightEnd = pointFromNorthClockwise(
    foreSight.azimuthDegrees,
    94,
    150,
    130,
  );
  const horizontalArc = describeAngleArc(
    150,
    130,
    54,
    backSight.azimuthDegrees,
    horizontalRotation === "clockwise"
      ? horizontalAngleDegrees
      : -horizontalAngleDegrees,
  );

  const exteriorAngleDegrees = calculateExteriorAngle(interiorAngleDegrees);
  const nextAzimuthDegrees = calculateNextAzimuth(
    previousAzimuthDegrees,
    interiorAngleDegrees,
  );
  const backDirectionDegrees = normalizeAzimuth(
    previousAzimuthDegrees + 180,
  );
  const traverseBackEnd = pointFromNorthClockwise(
    backDirectionDegrees,
    92,
    150,
    132,
  );
  const traverseNextEnd = pointFromNorthClockwise(
    nextAzimuthDegrees,
    92,
    150,
    132,
  );
  const interiorExteriorArc = describeAngleArc(
    150,
    132,
    52,
    backDirectionDegrees,
    interiorAngleView === "interior"
      ? -interiorAngleDegrees
      : exteriorAngleDegrees,
  );

  const selectedDmsExercise =
    dmsExercises.find(
      (exercise) => exercise.id === selectedDmsExerciseId,
    ) ?? dmsExercises[0];
  const dmsResult = calculateDmsOperation(
    selectedDmsExercise.left,
    selectedDmsExercise.right,
    selectedDmsExercise.operation,
  );

  const verticalAngleDegrees =
    calculateVerticalAngleFromZenith(zenithAngleDegrees);
  const verticalSightEnd = pointFromNorthClockwise(
    zenithAngleDegrees,
    112,
    105,
    155,
  );
  const verticalArc = describeAngleArc(
    105,
    155,
    55,
    verticalAngleView === "zenith" ? 0 : 90,
    verticalAngleView === "zenith"
      ? zenithAngleDegrees
      : zenithAngleDegrees - 90,
  );
  const sightDirection =
    verticalAngleDegrees > 0
      ? "上向き"
      : verticalAngleDegrees < 0
        ? "下向き"
        : "水平";

  const updateAzimuth = (nextDegrees: number): void => {
    if (Number.isFinite(nextDegrees)) {
      setAzimuthDegrees(normalizeAzimuth(nextDegrees));
    }
  };

  return (
    <div className="basics-angle-lesson">
      <section
        aria-labelledby="angle-types-title"
        className="basics-angle-intro"
      >
        <div className="basics-section-heading">
          <span>角度の基準を先に確認</span>
          <h3 id="angle-types-title">
            同じ方向線でも、どこを0°にするかで角度の名前と数値が変わります
          </h3>
        </div>
        <p className="basics-angle-lead">
          方位角は北から方向線まで、水平角は後視などの基準方向から
          前視方向までを測ります。角度値だけでなく、基準方向・回転方向・
          角の定義を一組で確認します。
        </p>
        <div className="basics-angle-definition-grid">
          {angleDefinitions.map((definition) => (
            <DefinitionCard
              className="basics-angle-definition-card"
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
        aria-labelledby="azimuth-lab-title"
        className="basics-visual-card basics-angle-lab"
      >
        <div className="basics-card-heading">
          <div>
            <span className="basics-card-kicker">方位角ラボ</span>
            <h3 id="azimuth-lab-title">
              北を0°として、時計回りに方向を表す
            </h3>
          </div>
          <span className="basics-operation-hint">
            スライダーとDMSボタンを操作
          </span>
        </div>

        <div className="basics-angle-workspace">
          <div className="basics-angle-diagram">
            <svg
              aria-labelledby="azimuth-svg-title azimuth-svg-description"
              className="basics-azimuth-svg"
              role="img"
              viewBox="0 0 260 250"
            >
              <title id="azimuth-svg-title">北を基準にした方位角</title>
              <desc id="azimuth-svg-description">
                北を0度として、時計回りに増える方位角と方向線を示します。
              </desc>
              <circle
                className="basics-angle-compass-ring"
                cx="130"
                cy="125"
                r="96"
              />
              <path
                className="basics-angle-axis"
                d="M130 19v212M24 125h212"
              />
              <text className="basics-angle-cardinal" x="130" y="15">
                N 0°
              </text>
              <text className="basics-angle-cardinal" x="245" y="130">
                E 90°
              </text>
              <text className="basics-angle-cardinal" x="130" y="246">
                S 180°
              </text>
              <text className="basics-angle-cardinal" x="15" y="130">
                W 270°
              </text>
              {azimuthArc ? (
                <path
                  className="basics-angle-arc"
                  d={azimuthArc}
                  markerEnd="url(#azimuth-arrow)"
                />
              ) : null}
              <defs>
                <marker
                  id="azimuth-arrow"
                  markerHeight="6"
                  markerWidth="6"
                  orient="auto"
                  refX="5"
                  refY="3"
                >
                  <path className="basics-angle-arrowhead" d="M0 0 6 3 0 6Z" />
                </marker>
              </defs>
              <path
                className="basics-angle-direction-line"
                d={`M130 125 L${azimuthLineEnd.x} ${azimuthLineEnd.y}`}
              />
              <circle
                className="basics-angle-station"
                cx="130"
                cy="125"
                r="7"
              />
              <circle
                className="basics-angle-target"
                cx={azimuthLineEnd.x}
                cy={azimuthLineEnd.y}
                r="6"
              />
              <text
                className="basics-angle-target-label"
                x={azimuthLineEnd.x}
                y={azimuthLineEnd.y - 10}
              >
                方向点
              </text>
            </svg>
          </div>

          <div className="basics-angle-controls">
            <div
              aria-live="polite"
              className="basics-angle-primary-result"
            >
              <span>正規化された方位角</span>
              <strong data-testid="azimuth-decimal">
                {formatDecimalDegrees(azimuthDegrees)}
              </strong>
              <b data-testid="azimuth-dms">{formatDms(azimuthDms)}</b>
              <small>0°以上360°未満・北から時計回り</small>
            </div>

            <label className="basics-angle-range">
              <span>方位角を連続操作</span>
              <input
                aria-label="方位角を連続操作"
                max={359 + 59 / 60 + 59 / 3_600}
                min="0"
                onChange={(event) =>
                  updateAzimuth(Number(event.currentTarget.value))
                }
                step={1 / 3_600}
                type="range"
                value={azimuthDegrees}
              />
            </label>

            <div
              aria-label="度分秒単位で方位角を微調整"
              className="basics-angle-nudge-grid"
              role="group"
            >
              {azimuthNudges.map((nudge) => (
                <button
                  aria-label={nudge.accessibleLabel}
                  key={nudge.label}
                  onClick={() =>
                    updateAzimuth(azimuthDegrees + nudge.delta)
                  }
                  type="button"
                >
                  {nudge.label}
                </button>
              ))}
            </div>

            <div className="basics-angle-boundary-presets">
              <span>境界を試す</span>
              <button
                onClick={() =>
                  updateAzimuth(359 + 59 / 60 + 50 / 3_600)
                }
                type="button"
              >
                359°59′50″
              </button>
              <button
                onClick={() => updateAzimuth(10 / 3_600)}
                type="button"
              >
                0°00′10″
              </button>
            </div>

            <p className="basics-angle-rule">
              <strong>方位角：</strong>
              北0° → 東90° → 南180° → 西270°の順に、時計回りで増えます。
              360°以上や負の値は同じ方向を表す0°～360°へ戻します。
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="horizontal-angle-title"
        className="basics-angle-section"
      >
        <div className="basics-section-heading">
          <span>後視・前視と水平角</span>
          <h3 id="horizontal-angle-title">
            基準方向を決めてから、観測方向までの角を測る
          </h3>
        </div>
        <p className="basics-angle-lead">
          器械点Oから見て、後視は角度の基準にする方向、前視はこれから
          観測する方向です。点の時間的・位置的な前後関係ではありません。
        </p>

        <div className="basics-horizontal-angle-workspace">
          <div className="basics-angle-diagram">
            <svg
              aria-labelledby="horizontal-svg-title horizontal-svg-description"
              className="basics-horizontal-angle-svg"
              role="img"
              viewBox="0 0 300 260"
            >
              <title id="horizontal-svg-title">
                器械点、後視方向、前視方向と水平角
              </title>
              <desc id="horizontal-svg-description">
                器械点Oから後視点と前視点へ伸びる方向線と、選択中の回転方向の
                水平角を示します。
              </desc>
              <circle
                className="basics-angle-compass-ring"
                cx="150"
                cy="130"
                r="99"
              />
              <path className="basics-angle-north" d="M150 130V24" />
              <text className="basics-angle-cardinal" x="150" y="18">
                N
              </text>
              <path
                className="basics-angle-back-line"
                d={`M150 130 L${backSightEnd.x} ${backSightEnd.y}`}
              />
              <path
                className="basics-angle-fore-line"
                d={`M150 130 L${foreSightEnd.x} ${foreSightEnd.y}`}
              />
              {horizontalArc ? (
                <path
                  className="basics-angle-arc"
                  d={horizontalArc}
                  markerEnd="url(#horizontal-arrow)"
                />
              ) : null}
              <defs>
                <marker
                  id="horizontal-arrow"
                  markerHeight="6"
                  markerWidth="6"
                  orient="auto"
                  refX="5"
                  refY="3"
                >
                  <path className="basics-angle-arrowhead" d="M0 0 6 3 0 6Z" />
                </marker>
              </defs>
              <circle
                className="basics-angle-station"
                cx="150"
                cy="130"
                r="8"
              />
              <text className="basics-angle-station-label" x="150" y="153">
                器械点 O
              </text>
              <circle
                className="basics-angle-back-point"
                cx={backSightEnd.x}
                cy={backSightEnd.y}
                r="6"
              />
              <text
                className="basics-angle-point-label"
                x={backSightEnd.x}
                y={backSightEnd.y - 10}
              >
                後視 {backSight.pointLabel}
              </text>
              <circle
                className="basics-angle-fore-point"
                cx={foreSightEnd.x}
                cy={foreSightEnd.y}
                r="6"
              />
              <text
                className="basics-angle-point-label"
                x={foreSightEnd.x}
                y={foreSightEnd.y - 10}
              >
                前視 {foreSight.pointLabel}
              </text>
            </svg>
          </div>

          <div className="basics-horizontal-angle-controls">
            <div className="basics-angle-direction-selectors">
              <label>
                <span>後視方向（基準）</span>
                <select
                  aria-label="後視方向を選択"
                  onChange={(event) =>
                    setBackSightId(event.currentTarget.value as DirectionId)
                  }
                  value={backSightId}
                >
                  {directionOptions.map((direction) => (
                    <option key={direction.id} value={direction.id}>
                      {direction.label}（{direction.azimuthDegrees}°）
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>前視方向（観測）</span>
                <select
                  aria-label="前視方向を選択"
                  onChange={(event) =>
                    setForeSightId(event.currentTarget.value as DirectionId)
                  }
                  value={foreSightId}
                >
                  {directionOptions.map((direction) => (
                    <option key={direction.id} value={direction.id}>
                      {direction.label}（{direction.azimuthDegrees}°）
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              aria-label="水平角の回転方向"
              className="basics-angle-toggle"
              role="group"
            >
              <button
                aria-pressed={horizontalRotation === "clockwise"}
                className={
                  horizontalRotation === "clockwise" ? "is-selected" : ""
                }
                onClick={() => setHorizontalRotation("clockwise")}
                type="button"
              >
                右回り（時計回り）
              </button>
              <button
                aria-pressed={horizontalRotation === "counterclockwise"}
                className={
                  horizontalRotation === "counterclockwise"
                    ? "is-selected"
                    : ""
                }
                onClick={() => setHorizontalRotation("counterclockwise")}
                type="button"
              >
                左回り（反時計回り）
              </button>
            </div>

            <dl
              aria-live="polite"
              className="basics-horizontal-angle-result"
            >
              <div>
                <dt>後視方位角</dt>
                <dd>{backSight.azimuthDegrees.toFixed(0)}°</dd>
              </div>
              <div>
                <dt>前視方位角</dt>
                <dd>{foreSight.azimuthDegrees.toFixed(0)}°</dd>
              </div>
              <div className="is-result">
                <dt>
                  {horizontalRotation === "clockwise"
                    ? "右回り水平角"
                    : "左回り水平角"}
                </dt>
                <dd data-testid="horizontal-angle-result">
                  {horizontalAngleDegrees.toFixed(3)}°
                  <small>{formatDms(horizontalAngleDms)}</small>
                </dd>
              </div>
            </dl>

            <div className="basics-angle-formula">
              <strong>
                {horizontalRotation === "clockwise"
                  ? "右回り水平角 ＝ 前視方位角 − 後視方位角"
                  : "左回り水平角 ＝ 後視方位角 − 前視方位角"}
              </strong>
              <span>計算結果を0°以上360°未満へ正規化</span>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="interior-exterior-title"
        className="basics-angle-section"
      >
        <div className="basics-section-heading">
          <span>内角・外角と次辺方位角</span>
          <h3 id="interior-exterior-title">
            同じ2辺でも、内側と外側では選ぶ角が違う
          </h3>
        </div>

        <div className="basics-interior-workspace">
          <div className="basics-angle-diagram">
            <svg
              aria-labelledby="interior-svg-title interior-svg-description"
              className="basics-interior-svg"
              role="img"
              viewBox="0 0 300 265"
            >
              <title id="interior-svg-title">同じ2辺の内角と外角</title>
              <desc id="interior-svg-description">
                時計回り閉合トラバースの頂点で、前辺の逆方向と次辺の間に
                できる内角と外角を切り替えて示します。
              </desc>
              <path
                className="basics-angle-back-line"
                d={`M150 132 L${traverseBackEnd.x} ${traverseBackEnd.y}`}
              />
              <path
                className="basics-angle-fore-line"
                d={`M150 132 L${traverseNextEnd.x} ${traverseNextEnd.y}`}
              />
              <path
                className={
                  interiorAngleView === "interior"
                    ? "basics-angle-arc is-interior"
                    : "basics-angle-arc is-exterior"
                }
                d={interiorExteriorArc}
                markerEnd="url(#interior-arrow)"
              />
              <defs>
                <marker
                  id="interior-arrow"
                  markerHeight="6"
                  markerWidth="6"
                  orient="auto"
                  refX="5"
                  refY="3"
                >
                  <path className="basics-angle-arrowhead" d="M0 0 6 3 0 6Z" />
                </marker>
              </defs>
              <circle
                className="basics-angle-station"
                cx="150"
                cy="132"
                r="8"
              />
              <text className="basics-angle-station-label" x="150" y="155">
                頂点 P
              </text>
              <circle
                className="basics-angle-back-point"
                cx={traverseBackEnd.x}
                cy={traverseBackEnd.y}
                r="6"
              />
              <text
                className="basics-angle-point-label"
                x={traverseBackEnd.x}
                y={traverseBackEnd.y - 10}
              >
                前辺の逆方向
              </text>
              <circle
                className="basics-angle-fore-point"
                cx={traverseNextEnd.x}
                cy={traverseNextEnd.y}
                r="6"
              />
              <text
                className="basics-angle-point-label"
                x={traverseNextEnd.x}
                y={traverseNextEnd.y - 10}
              >
                次辺
              </text>
            </svg>
          </div>

          <div className="basics-interior-controls">
            <div
              aria-label="内角と外角を切り替え"
              className="basics-angle-toggle"
              role="group"
            >
              <button
                aria-pressed={interiorAngleView === "interior"}
                className={
                  interiorAngleView === "interior" ? "is-selected" : ""
                }
                onClick={() => setInteriorAngleView("interior")}
                type="button"
              >
                内角
              </button>
              <button
                aria-pressed={interiorAngleView === "exterior"}
                className={
                  interiorAngleView === "exterior" ? "is-selected" : ""
                }
                onClick={() => setInteriorAngleView("exterior")}
                type="button"
              >
                外角
              </button>
            </div>

            <label className="basics-angle-range">
              <span>
                内角
                <strong>{interiorAngleDegrees.toFixed(0)}°</strong>
              </span>
              <input
                aria-label="内角を操作"
                max="170"
                min="30"
                onChange={(event) =>
                  setInteriorAngleDegrees(
                    Number(event.currentTarget.value),
                  )
                }
                step="1"
                type="range"
                value={interiorAngleDegrees}
              />
            </label>

            <label className="basics-angle-range">
              <span>
                前辺方位角
                <strong>{previousAzimuthDegrees.toFixed(0)}°</strong>
              </span>
              <input
                aria-label="前辺方位角を操作"
                max="359"
                min="0"
                onChange={(event) =>
                  setPreviousAzimuthDegrees(
                    Number(event.currentTarget.value),
                  )
                }
                step="1"
                type="range"
                value={previousAzimuthDegrees}
              />
            </label>

            <dl
              aria-live="polite"
              className="basics-interior-result"
            >
              <div>
                <dt>内角</dt>
                <dd>{interiorAngleDegrees.toFixed(0)}°</dd>
              </div>
              <div>
                <dt>外角（教材例）</dt>
                <dd>{exteriorAngleDegrees.toFixed(0)}°</dd>
              </div>
              <div className="is-result">
                <dt>次辺方位角</dt>
                <dd data-testid="next-azimuth-result">
                  {nextAzimuthDegrees.toFixed(0)}°
                </dd>
              </div>
            </dl>

            <div className="basics-angle-formula">
              <strong>外角 ＝ 360° − 内角</strong>
              <strong>
                次辺方位角 ＝ 前辺方位角 ＋ 180° − 内角
              </strong>
              <span>どちらも必要に応じて0°以上360°未満へ正規化</span>
            </div>
          </div>
        </div>

        <p className="basics-angle-caution">
          次辺方位角の式は、この教材と閉合トラバースで採用している
          時計回り巡回・内角の規約に対応します。すべての観測へ無条件に
          当てはめず、巡回方向、右回り・左回り、内角・外角の定義を確認します。
        </p>
      </section>

      <section
        aria-labelledby="dms-operation-title"
        className="basics-angle-section basics-dms-operation-section"
      >
        <div className="basics-section-heading">
          <span>度分秒と十進度</span>
          <h3 id="dms-operation-title">
            1°＝60′、1′＝60″として繰上げ・繰下げる
          </h3>
        </div>
        <p className="basics-angle-lead">
          度分秒（DMS）は60進法、十進度は10進法です。同じ角度を
          表現できますが、加減算では秒と分の繰上げ・繰下げに注意します。
        </p>

        <div
          aria-label="度分秒の計算例"
          className="basics-dms-exercise-selector"
          role="tablist"
        >
          {dmsExercises.map((exercise) => (
            <button
              aria-controls="dms-exercise-panel"
              aria-selected={selectedDmsExercise.id === exercise.id}
              className={
                selectedDmsExercise.id === exercise.id ? "is-selected" : ""
              }
              key={exercise.id}
              onClick={() => setSelectedDmsExerciseId(exercise.id)}
              role="tab"
              type="button"
            >
              {exercise.title}
            </button>
          ))}
        </div>

        <div
          aria-live="polite"
          className="basics-dms-exercise-panel"
          id="dms-exercise-panel"
          role="tabpanel"
        >
          <div className="basics-dms-calculation">
            <span>{formatDms(selectedDmsExercise.left)}</span>
            <b>
              {selectedDmsExercise.operation === "add" ? "＋" : "−"}
            </b>
            <span>{formatDms(selectedDmsExercise.right)}</span>
            <b>＝</b>
            <strong data-testid="dms-raw-result">
              {formatDms(dmsResult.rawDms)}
            </strong>
          </div>

          <ol className="basics-dms-steps">
            {selectedDmsExercise.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <dl className="basics-dms-result-grid">
            <div>
              <dt>計算結果（十進度）</dt>
              <dd>{formatDecimalDegrees(dmsResult.rawDecimalDegrees)}</dd>
            </div>
            <div>
              <dt>0°～360°へ正規化</dt>
              <dd data-testid="dms-normalized-result">
                {formatDms(dmsResult.normalizedDms)}
                <small>
                  {formatDecimalDegrees(
                    dmsResult.normalizedDecimalDegrees,
                  )}
                </small>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="vertical-zenith-title"
        className="basics-angle-section"
      >
        <div className="basics-section-heading">
          <span>鉛直角・天頂角の概念比較</span>
          <h3 id="vertical-zenith-title">
            同じ視準線でも、水平線と天頂では0°の方向が違う
          </h3>
        </div>

        <div className="basics-vertical-workspace">
          <div className="basics-angle-diagram">
            <svg
              aria-labelledby="vertical-svg-title vertical-svg-description"
              className="basics-vertical-svg"
              role="img"
              viewBox="0 0 310 245"
            >
              <title id="vertical-svg-title">
                同じ視準線の鉛直角と天頂角
              </title>
              <desc id="vertical-svg-description">
                水平線を基準とする鉛直角と、天頂方向を0度とする天頂角を
                同じ視準線で比較します。
              </desc>
              <path
                className="basics-angle-axis"
                d="M22 155H286M105 214V22"
              />
              <text className="basics-angle-cardinal" x="105" y="17">
                天頂 0°
              </text>
              <text className="basics-angle-axis-label" x="272" y="147">
                水平 0°
              </text>
              <path
                className="basics-angle-direction-line"
                d={`M105 155 L${verticalSightEnd.x} ${verticalSightEnd.y}`}
              />
              <path
                className={
                  verticalAngleView === "vertical"
                    ? "basics-angle-arc is-interior"
                    : "basics-angle-arc"
                }
                d={verticalArc}
                markerEnd="url(#vertical-arrow)"
              />
              <defs>
                <marker
                  id="vertical-arrow"
                  markerHeight="6"
                  markerWidth="6"
                  orient="auto"
                  refX="5"
                  refY="3"
                >
                  <path className="basics-angle-arrowhead" d="M0 0 6 3 0 6Z" />
                </marker>
              </defs>
              <circle
                className="basics-angle-station"
                cx="105"
                cy="155"
                r="8"
              />
              <circle
                className="basics-angle-target"
                cx={verticalSightEnd.x}
                cy={verticalSightEnd.y}
                r="6"
              />
              <text
                className="basics-angle-target-label"
                x={verticalSightEnd.x}
                y={verticalSightEnd.y - 10}
              >
                視準点
              </text>
            </svg>
          </div>

          <div className="basics-vertical-controls">
            <div
              aria-label="鉛直角と天頂角を切り替え"
              className="basics-angle-toggle"
              role="group"
            >
              <button
                aria-pressed={verticalAngleView === "vertical"}
                className={
                  verticalAngleView === "vertical" ? "is-selected" : ""
                }
                onClick={() => setVerticalAngleView("vertical")}
                type="button"
              >
                鉛直角
              </button>
              <button
                aria-pressed={verticalAngleView === "zenith"}
                className={
                  verticalAngleView === "zenith" ? "is-selected" : ""
                }
                onClick={() => setVerticalAngleView("zenith")}
                type="button"
              >
                天頂角
              </button>
            </div>

            <label className="basics-angle-range">
              <span>
                同じ視準線を動かす
                <strong>{sightDirection}</strong>
              </span>
              <input
                aria-label="視準線の天頂角を操作"
                max="135"
                min="45"
                onChange={(event) =>
                  setZenithAngleDegrees(
                    Number(event.currentTarget.value),
                  )
                }
                step="1"
                type="range"
                value={zenithAngleDegrees}
              />
            </label>

            <dl
              aria-live="polite"
              className="basics-vertical-result"
            >
              <div className={verticalAngleView === "vertical" ? "is-result" : ""}>
                <dt>鉛直角</dt>
                <dd data-testid="vertical-angle-result">
                  {verticalAngleDegrees > 0 ? "+" : ""}
                  {verticalAngleDegrees.toFixed(0)}°
                  <small>水平線基準（上向き＋、下向き−）</small>
                </dd>
              </div>
              <div className={verticalAngleView === "zenith" ? "is-result" : ""}>
                <dt>天頂角</dt>
                <dd data-testid="zenith-angle-result">
                  {zenithAngleDegrees.toFixed(0)}°
                  <small>天頂方向0°</small>
                </dd>
              </div>
            </dl>

            <div className="basics-angle-formula">
              <strong>鉛直角 ＝ 90° − 天頂角</strong>
              <span>
                天頂角65°なら鉛直角+25°、天頂角115°なら鉛直角−25°
              </span>
            </div>
          </div>
        </div>

        <p className="basics-angle-caution">
          ここでは基準方向と符号の概念だけを扱います。TSの据付、求心、
          整準、器械高、プリズム高、斜距離から水平距離・高低差への変換は、
          第5章「TSの据付と観測」で学びます。
        </p>
      </section>
    </div>
  );
}

export default ErrorAndEquipmentLesson;
