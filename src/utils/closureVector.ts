import type { ClosureResult } from "../types/traverse";

export const CLOSURE_VECTOR_DISPLAY_MULTIPLIER = 100;

const SVG_UNITS_PER_DISPLAY_METRE = 32;
const MAX_VECTOR_LENGTH = 150;

export interface ClosureVectorPoint {
  readonly x: number;
  readonly y: number;
}

export interface ClosureVectorPlot {
  readonly target: ClosureVectorPoint;
  readonly calculated: ClosureVectorPoint;
  readonly fxEnd: ClosureVectorPoint;
  readonly fyEnd: ClosureVectorPoint;
  readonly fitRatio: number;
  readonly isAutoFitted: boolean;
}

type ClosureVectorSource = Pick<
  ClosureResult,
  "fx" | "fy" | "linearClosure"
>;

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

/**
 * 測量座標のX（北）をSVGの上方向、Y（東）を右方向へ変換する。
 * 誤差成分は指定倍率で拡大し、異常に大きい入力時だけ図枠内へ収める。
 */
export function createClosureVectorPlot(
  closure: ClosureVectorSource,
  target: ClosureVectorPoint = { x: 240, y: 125 },
): ClosureVectorPlot {
  assertFinite(closure.fx, "closure.fx");
  assertFinite(closure.fy, "closure.fy");
  assertFinite(closure.linearClosure, "closure.linearClosure");
  assertFinite(target.x, "target.x");
  assertFinite(target.y, "target.y");

  const rawSvgX =
    closure.fy *
    CLOSURE_VECTOR_DISPLAY_MULTIPLIER *
    SVG_UNITS_PER_DISPLAY_METRE;
  const rawSvgY =
    -closure.fx *
    CLOSURE_VECTOR_DISPLAY_MULTIPLIER *
    SVG_UNITS_PER_DISPLAY_METRE;
  const rawLength = Math.hypot(rawSvgX, rawSvgY);
  const fitRatio =
    rawLength > MAX_VECTOR_LENGTH
      ? MAX_VECTOR_LENGTH / rawLength
      : 1;
  const svgX = rawSvgX * fitRatio;
  const svgY = rawSvgY * fitRatio;

  return {
    target,
    calculated: {
      x: target.x + svgX,
      y: target.y + svgY,
    },
    fxEnd: {
      x: target.x,
      y: target.y + svgY,
    },
    fyEnd: {
      x: target.x + svgX,
      y: target.y,
    },
    fitRatio,
    isAutoFitted: fitRatio < 1,
  };
}
