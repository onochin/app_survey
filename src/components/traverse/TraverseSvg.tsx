import { useMemo, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  clampSvgCoordinate,
  clientToSvgCoordinate,
  createSurveySvgTransform,
  surveyToSvgCoordinate,
  svgToSurveyCoordinate,
} from "../../calculations/geometry";
import type { SvgCoordinate } from "../../calculations/geometry";
import type { TraverseDisplaySample } from "../../data/traverseSample";
import type { SurveyCoordinate, SurveyPoint } from "../../types/traverse";
import { formatAngleDms } from "../../utils/formatAngle";

interface TraverseSvgProps {
  readonly sample: TraverseDisplaySample;
  readonly referencePoints: readonly SurveyPoint[];
  readonly selectedPointId: string | null;
  readonly onSelectPoint: (pointId: string) => void;
  readonly onMovePoint: (
    pointId: string,
    coordinate: SurveyCoordinate,
  ) => void;
  readonly onInteractionError: (message: string) => void;
}

const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 500;
export const TRAVERSE_PLOT_BOUNDS = {
  left: 92,
  right: 724,
  top: 74,
  bottom: 414,
} as const;

function normalizeVector(vector: SvgCoordinate): SvgCoordinate {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function getReadableRotation(from: SvgCoordinate, to: SvgCoordinate) {
  let rotation = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

  if (rotation > 90 || rotation < -90) {
    rotation += 180;
  }

  return rotation;
}

function TotalStationIcon({ x, y }: SvgCoordinate) {
  return (
    <g
      aria-label="トータルステーション"
      className="total-station"
      role="img"
      transform={`translate(${x} ${y})`}
    >
      <path d="M0 13-9 35M0 13l9 22M0 13v22" />
      <path className="station-accent" d="m-4 22-5 13M4 22l5 13" />
      <rect height="18" rx="3" width="15" x="-7.5" y="-6" />
      <circle cx="0" cy="2.5" r="3.4" />
      <path d="M-4-6v-5h8v5" />
    </g>
  );
}

function TraverseSvg({
  sample,
  referencePoints,
  selectedPointId,
  onSelectPoint,
  onMovePoint,
  onInteractionError,
}: TraverseSvgProps) {
  const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
  const transform = useMemo(
    () =>
      createSurveySvgTransform(referencePoints, TRAVERSE_PLOT_BOUNDS),
    [referencePoints],
  );

  const screenByPointId = new Map(
    sample.points.map((point) => [
      point.id,
      surveyToSvgCoordinate(point.coordinate, transform),
    ]),
  );

  const getScreenPoint = (pointId: string): SvgCoordinate => {
    const screenPoint = screenByPointId.get(pointId);

    if (screenPoint === undefined) {
      throw new Error(`SVG上の測点が見つかりません: ${pointId}`);
    }

    return screenPoint;
  };

  const polygonPoints = sample.points
    .map((point) => {
      const position = getScreenPoint(point.id);
      return `${position.x},${position.y}`;
    })
    .join(" ");

  const centroid = sample.points.reduce(
    (total, point) => {
      const position = getScreenPoint(point.id);
      return {
        x: total.x + position.x / sample.points.length,
        y: total.y + position.y / sample.points.length,
      };
    },
    { x: 0, y: 0 },
  );

  const angleByPointId = new Map(
    sample.angles.map((angle) => [angle.pointId, angle.angleDegrees]),
  );
  const stationPosition = getScreenPoint("p2");
  const scaleLength = 100 * transform.scale;

  const stopDragging = (): void => {
    setDraggingPointId(null);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<SVGSVGElement>,
  ): void => {
    if (draggingPointId === null) {
      return;
    }

    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const svgCoordinate = clientToSvgCoordinate(
        { x: event.clientX, y: event.clientY },
        rect,
        VIEWBOX_WIDTH,
        VIEWBOX_HEIGHT,
      );
      const bounded = clampSvgCoordinate(
        svgCoordinate,
        TRAVERSE_PLOT_BOUNDS,
      );
      onMovePoint(
        draggingPointId,
        svgToSurveyCoordinate(bounded, transform),
      );
    } catch {
      stopDragging();
      onInteractionError(
        "画面位置を測量座標へ変換できませんでした。もう一度操作してください。",
      );
    }
  };

  const handlePointPointerDown = (
    event: ReactPointerEvent<SVGGElement>,
    point: SurveyPoint,
  ): void => {
    onSelectPoint(point.id);

    if (point.isFixed) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingPointId(point.id);
  };

  const handlePointKeyDown = (
    event: ReactKeyboardEvent<SVGGElement>,
    pointId: string,
  ): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectPoint(pointId);
    }
  };

  return (
    <svg
      aria-labelledby="traverse-svg-title traverse-svg-description"
      className="traverse-svg"
      onPointerCancel={stopDragging}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      role="group"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
    >
      <title id="traverse-svg-title">
        閉合トラバース測量の仮想現場図
      </title>
      <desc id="traverse-svg-description">
        固定点AからP1、P2、P3、P4、固定点Bを順に通り、Aへ戻る六角形です。
        P1からP4はドラッグできます。図には理論距離と理論内角を表示しています。
      </desc>

      <defs>
        <pattern
          height="24"
          id="minor-grid"
          patternUnits="userSpaceOnUse"
          width="24"
        >
          <path d="M24 0H0V24" fill="none" stroke="#eaf0f6" strokeWidth="1" />
        </pattern>
        <filter height="160%" id="point-shadow" width="160%" x="-30%" y="-30%">
          <feDropShadow
            dx="0"
            dy="2"
            floodColor="#0a2540"
            floodOpacity=".2"
            stdDeviation="2"
          />
        </filter>
        <linearGradient id="map-wash" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fbfdff" />
          <stop offset="1" stopColor="#f3f8fc" />
        </linearGradient>
      </defs>

      <rect
        fill="url(#map-wash)"
        height={VIEWBOX_HEIGHT}
        rx="16"
        width={VIEWBOX_WIDTH}
      />
      <rect
        fill="url(#minor-grid)"
        height={VIEWBOX_HEIGHT}
        opacity=".75"
        rx="16"
        width={VIEWBOX_WIDTH}
      />

      <g className="contour-lines">
        <path d="M-35 96C95 30 158 138 278 74s209-46 319 13 215 55 341-9" />
        <path d="M-52 134C73 70 168 181 292 112s205-39 318 18 211 48 338-8" />
        <path d="M-28 378c112-68 196 32 316-21s213-61 330-6 196 58 310 3" />
        <path d="M-48 418c125-74 206 25 326-26s211-59 333-7 198 61 320 0" />
        <path d="M164-26c-45 89 31 127-10 214s-34 166 15 248" />
        <path d="M604-35c-52 85 27 135-18 218s-35 176 22 266" />
      </g>

      <g className="map-center-mark" aria-hidden="true">
        <path d="M438 250h24M450 238v24" />
        <circle cx="450" cy="250" r="22" />
      </g>

      <g className="north-arrow" transform="translate(40 45)">
        <text x="12" y="-8">
          N
        </text>
        <path className="north-outline" d="m12 0 11 43-11-8-11 8L12 0Z" />
        <path className="north-fill" d="m12 0 3 34-3-5-3 5L12 0Z" />
        <path d="M12 0v43" />
      </g>

      <polyline
        className="traverse-line-shadow"
        points={`${polygonPoints} ${polygonPoints.split(" ")[0] ?? ""}`}
      />
      <polyline
        className="traverse-line"
        points={`${polygonPoints} ${polygonPoints.split(" ")[0] ?? ""}`}
      />

      {sample.legs.map((leg) => {
        const from = getScreenPoint(leg.fromPointId);
        const to = getScreenPoint(leg.toPointId);
        const midpoint = {
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2,
        };
        const outward = normalizeVector({
          x: midpoint.x - centroid.x,
          y: midpoint.y - centroid.y,
        });
        const labelPosition = {
          x: midpoint.x + outward.x * 19,
          y: midpoint.y + outward.y * 19,
        };
        const rotation = getReadableRotation(from, to);

        return (
          <g
            className="distance-label"
            key={leg.id}
            transform={`translate(${labelPosition.x} ${labelPosition.y}) rotate(${rotation})`}
          >
            <text textAnchor="middle">{leg.distance.toFixed(2)} m</text>
          </g>
        );
      })}

      {sample.points.map((point, index) => {
        const current = getScreenPoint(point.id);
        const previousPoint =
          sample.points[
            (index - 1 + sample.points.length) % sample.points.length
          ]!;
        const nextPoint = sample.points[(index + 1) % sample.points.length]!;
        const previous = getScreenPoint(previousPoint.id);
        const next = getScreenPoint(nextPoint.id);
        const toPrevious = normalizeVector({
          x: previous.x - current.x,
          y: previous.y - current.y,
        });
        const toNext = normalizeVector({
          x: next.x - current.x,
          y: next.y - current.y,
        });
        const radius = 29;
        const arcStart = {
          x: current.x + toPrevious.x * radius,
          y: current.y + toPrevious.y * radius,
        };
        const arcEnd = {
          x: current.x + toNext.x * radius,
          y: current.y + toNext.y * radius,
        };
        const inward = normalizeVector({
          x: toPrevious.x + toNext.x,
          y: toPrevious.y + toNext.y,
        });
        const angleLabelPosition = {
          x: current.x + inward.x * 55,
          y: current.y + inward.y * 55,
        };
        const observedAngle = angleByPointId.get(point.id);

        return (
          <g className="angle-observation" key={`angle-${point.id}`}>
            <path
              d={`M ${arcStart.x} ${arcStart.y} Q ${current.x} ${current.y} ${arcEnd.x} ${arcEnd.y}`}
            />
            {observedAngle === undefined ? null : (
              <text
                textAnchor="middle"
                x={angleLabelPosition.x}
                y={angleLabelPosition.y}
              >
                {formatAngleDms(observedAngle)}
              </text>
            )}
          </g>
        );
      })}

      <TotalStationIcon x={stationPosition.x} y={stationPosition.y - 37} />

      {sample.points.map((point) => {
        const position = getScreenPoint(point.id);
        const outward = normalizeVector({
          x: position.x - centroid.x,
          y: position.y - centroid.y,
        });
        const isInstrumentPoint = point.id === "p2";
        const labelPosition = isInstrumentPoint
          ? { x: position.x + 27, y: position.y + 5 }
          : {
              x: position.x + outward.x * 23,
              y: position.y + outward.y * 23,
            };
        const isFixed = point.isFixed;
        const isSelected = point.id === selectedPointId;
        const isDragging = point.id === draggingPointId;

        return (
          <g
            aria-label={`${point.name}（${
              isFixed ? "固定点" : "ドラッグ可能"
            }${isSelected ? "、選択中" : ""}）`}
            className={[
              "survey-point",
              isFixed ? "is-fixed" : "is-draggable",
              isSelected ? "is-selected" : "",
              isDragging ? "is-dragging" : "",
            ].join(" ")}
            key={point.id}
            onKeyDown={(event) => handlePointKeyDown(event, point.id)}
            onPointerDown={(event) =>
              handlePointPointerDown(event, point)
            }
            role="button"
            tabIndex={0}
          >
            {isSelected ? (
              <circle
                className="selected-point-marker"
                cx={position.x}
                cy={position.y}
                r="17"
              />
            ) : null}
            {isFixed ? (
              <circle
                className="fixed-point-halo"
                cx={position.x}
                cy={position.y}
                r="12"
              />
            ) : null}
            <circle
              className="point-ring"
              cx={position.x}
              cy={position.y}
              filter="url(#point-shadow)"
              r="8"
            />
            <circle
              className="point-core"
              cx={position.x}
              cy={position.y}
              r={isFixed ? 4 : 3}
            />
            <text
              className="point-name"
              dominantBaseline="middle"
              textAnchor={
                isInstrumentPoint
                  ? "start"
                  : outward.x < -0.25
                    ? "end"
                    : outward.x > 0.25
                      ? "start"
                      : "middle"
              }
              x={labelPosition.x}
              y={labelPosition.y}
            >
              {point.name}
            </text>
            {isSelected ? (
              <text
                className="selected-point-label"
                textAnchor="middle"
                x={position.x}
                y={position.y - 21}
              >
                選択中
              </text>
            ) : null}
          </g>
        );
      })}

      <g className="scale-bar" transform="translate(34 452)">
        <text x="0" y="-10">
          縮尺
        </text>
        <rect height="7" width={scaleLength / 2} x="0" y="0" />
        <rect
          className="scale-light"
          height="7"
          width={scaleLength / 2}
          x={scaleLength / 2}
          y="0"
        />
        <path d={`M0 0v12M${scaleLength / 2} 0v12M${scaleLength} 0v12`} />
        <text x="0" y="25">
          0
        </text>
        <text textAnchor="middle" x={scaleLength / 2} y="25">
          50
        </text>
        <text textAnchor="end" x={scaleLength} y="25">
          100 m
        </text>
      </g>

      <g className="map-legend" transform="translate(748 300)">
        <rect height="160" rx="12" width="132" />
        <text className="legend-title" x="14" y="23">
          凡例
        </text>
        <circle className="legend-fixed" cx="20" cy="45" r="6" />
        <text x="36" y="49">
          固定点
        </text>
        <circle className="legend-new" cx="20" cy="70" r="6" />
        <text x="36" y="74">
          新点
        </text>
        <path className="legend-line" d="M13 96h22" />
        <text x="44" y="100">
          観測辺
        </text>
        <path className="legend-angle" d="M14 126q8-15 17 0" />
        <text x="44" y="127">
          観測角
        </text>
        <g className="legend-station" transform="translate(20 143)">
          <rect height="10" rx="1.5" width="9" x="-4.5" y="-8" />
          <path d="M0 2-6 14M0 2l6 12M0 2v12" />
        </g>
        <text x="44" y="151">
          TS
        </text>
      </g>
    </svg>
  );
}

export default TraverseSvg;
