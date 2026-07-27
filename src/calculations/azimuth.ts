import { normalizeAzimuth } from "./angle";

function assertInteriorAngle(interiorAngleDegrees: number): void {
  if (
    !Number.isFinite(interiorAngleDegrees) ||
    interiorAngleDegrees <= 0 ||
    interiorAngleDegrees >= 360
  ) {
    throw new RangeError(
      "interiorAngleDegrees must be greater than 0 and less than 360.",
    );
  }
}

export function calculateNextAzimuth(
  previousAzimuthDegrees: number,
  correctedInteriorAngleDegrees: number,
): number {
  assertInteriorAngle(correctedInteriorAngleDegrees);

  return normalizeAzimuth(
    previousAzimuthDegrees + 180 - correctedInteriorAngleDegrees,
  );
}

/**
 * angles[i] は巡回順の点 i における補正内角。
 * 最初の辺は点0→点1で、点1の内角を用いて2本目の方位角を求める。
 * 点0の内角は最後の辺から最初の辺へ戻る閉合確認に使用する。
 */
export function calculateClosedTraverseAzimuths(
  initialAzimuthDegrees: number,
  correctedInteriorAnglesDegrees: readonly number[],
): number[] {
  if (correctedInteriorAnglesDegrees.length < 3) {
    throw new RangeError("A closed traverse requires at least three angles.");
  }

  correctedInteriorAnglesDegrees.forEach(assertInteriorAngle);

  const azimuths = [normalizeAzimuth(initialAzimuthDegrees)];

  for (let legIndex = 1; legIndex < correctedInteriorAnglesDegrees.length; legIndex += 1) {
    azimuths.push(
      calculateNextAzimuth(
        azimuths[legIndex - 1]!,
        correctedInteriorAnglesDegrees[legIndex]!,
      ),
    );
  }

  return azimuths;
}

/**
 * 最終辺から計算した最初の辺の方位角と、入力した初期方位角との差。
 * 戻り値は -180度以上180度未満に正規化する。
 */
export function calculateAzimuthClosureError(
  initialAzimuthDegrees: number,
  correctedInteriorAnglesDegrees: readonly number[],
): number {
  const azimuths = calculateClosedTraverseAzimuths(
    initialAzimuthDegrees,
    correctedInteriorAnglesDegrees,
  );
  const closingAzimuth = calculateNextAzimuth(
    azimuths.at(-1)!,
    correctedInteriorAnglesDegrees[0]!,
  );
  const unsignedError = normalizeAzimuth(
    closingAzimuth - normalizeAzimuth(initialAzimuthDegrees),
  );

  return unsignedError >= 180 ? unsignedError - 360 : unsignedError;
}
