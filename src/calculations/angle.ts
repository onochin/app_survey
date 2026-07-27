import type {
  AngleAdjustmentResult,
  AngularClosureResult,
  DmsAngle,
} from "../types/traverse";

const SECONDS_PER_DEGREE = 3_600;
const REPRESENTATION_TOLERANCE = 1e-6;

function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function validateInteriorAngles(anglesDegrees: readonly number[]): void {
  if (anglesDegrees.length < 3) {
    throw new RangeError("A closed traverse requires at least three angles.");
  }

  anglesDegrees.forEach((angle, index) => {
    assertFiniteNumber(angle, `anglesDegrees[${index}]`);
    if (angle <= 0 || angle >= 360) {
      throw new RangeError(
        `anglesDegrees[${index}] must be greater than 0 and less than 360.`,
      );
    }
  });
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function degreesToRadians(degrees: number): number {
  assertFiniteNumber(degrees, "degrees");
  return (degrees * Math.PI) / 180;
}

export function decimalDegreesToDms(
  decimalDegrees: number,
  secondDecimalPlaces = 6,
): DmsAngle {
  assertFiniteNumber(decimalDegrees, "decimalDegrees");

  if (
    !Number.isInteger(secondDecimalPlaces) ||
    secondDecimalPlaces < 0 ||
    secondDecimalPlaces > 9
  ) {
    throw new RangeError(
      "secondDecimalPlaces must be an integer from 0 through 9.",
    );
  }

  const sign: 1 | -1 = decimalDegrees < 0 ? -1 : 1;
  const scale = 10 ** secondDecimalPlaces;
  let totalSeconds =
    Math.round(Math.abs(decimalDegrees) * SECONDS_PER_DEGREE * scale) /
    scale;

  let degrees = Math.floor(totalSeconds / SECONDS_PER_DEGREE);
  totalSeconds -= degrees * SECONDS_PER_DEGREE;

  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.round((totalSeconds - minutes * 60) * scale) / scale;

  if (seconds >= 60) {
    seconds = 0;
    minutes += 1;
  }

  if (minutes >= 60) {
    minutes = 0;
    degrees += 1;
  }

  return { sign, degrees, minutes, seconds };
}

export function dmsToDecimalDegrees(dms: DmsAngle): number {
  if (dms.sign !== 1 && dms.sign !== -1) {
    throw new RangeError("sign must be either 1 or -1.");
  }

  assertFiniteNumber(dms.degrees, "degrees");
  assertFiniteNumber(dms.minutes, "minutes");
  assertFiniteNumber(dms.seconds, "seconds");

  if (!Number.isInteger(dms.degrees) || dms.degrees < 0) {
    throw new RangeError("degrees must be a non-negative integer.");
  }

  if (!Number.isInteger(dms.minutes) || dms.minutes < 0 || dms.minutes >= 60) {
    throw new RangeError("minutes must be an integer from 0 through 59.");
  }

  if (dms.seconds < 0 || dms.seconds >= 60) {
    throw new RangeError("seconds must be greater than or equal to 0 and less than 60.");
  }

  return (
    dms.sign *
    (dms.degrees + dms.minutes / 60 + dms.seconds / SECONDS_PER_DEGREE)
  );
}

export function normalizeAzimuth(degrees: number): number {
  assertFiniteNumber(degrees, "degrees");
  return ((degrees % 360) + 360) % 360;
}

export function calculateTheoreticalInteriorAngleSum(
  pointCount: number,
): number {
  if (!Number.isInteger(pointCount) || pointCount < 3) {
    throw new RangeError("pointCount must be an integer of at least 3.");
  }

  return (pointCount - 2) * 180;
}

export function calculateAngularClosure(
  observedAnglesDegrees: readonly number[],
): AngularClosureResult {
  validateInteriorAngles(observedAnglesDegrees);

  const observedSumDegrees = sum(observedAnglesDegrees);
  const theoreticalSumDegrees = calculateTheoreticalInteriorAngleSum(
    observedAnglesDegrees.length,
  );

  return {
    observedSumDegrees,
    theoreticalSumDegrees,
    closureDegrees: observedSumDegrees - theoreticalSumDegrees,
  };
}

/**
 * 丸めを行わず、角度閉合差を各角へ均等配分する。
 * 浮動小数点の最終残差だけを最後の角に加え、補正角和を理論値に合わせる。
 */
export function adjustInteriorAnglesEqually(
  observedAnglesDegrees: readonly number[],
): AngleAdjustmentResult {
  const closure = calculateAngularClosure(observedAnglesDegrees);
  const correctionDegrees =
    -closure.closureDegrees / observedAnglesDegrees.length;
  const correctionsDegrees = observedAnglesDegrees.map(
    () => correctionDegrees,
  );
  const adjustedAnglesDegrees = observedAnglesDegrees.map(
    (angle, index) => angle + correctionsDegrees[index]!,
  );

  const lastIndex = adjustedAnglesDegrees.length - 1;
  const residual =
    closure.theoreticalSumDegrees - sum(adjustedAnglesDegrees);
  adjustedAnglesDegrees[lastIndex] =
    adjustedAnglesDegrees[lastIndex]! + residual;
  correctionsDegrees[lastIndex] = correctionsDegrees[lastIndex]! + residual;

  return {
    closure,
    observedAnglesDegrees: [...observedAnglesDegrees],
    correctionsDegrees,
    adjustedAnglesDegrees,
  };
}

/**
 * 指定した秒精度で閉合差を均等配分する。
 * 割り切れない残差は観測順の先頭から1単位ずつ配分する。
 */
export function adjustInteriorAnglesBySeconds(
  observedAnglesDegrees: readonly number[],
  precisionSeconds = 1,
): AngleAdjustmentResult {
  const closure = calculateAngularClosure(observedAnglesDegrees);
  assertFiniteNumber(precisionSeconds, "precisionSeconds");

  if (precisionSeconds <= 0 || precisionSeconds > 1) {
    throw new RangeError(
      "precisionSeconds must be greater than 0 and no greater than 1.",
    );
  }

  const unitsPerDegree = SECONDS_PER_DEGREE / precisionSeconds;
  if (
    Math.abs(unitsPerDegree - Math.round(unitsPerDegree)) >
    REPRESENTATION_TOLERANCE
  ) {
    throw new RangeError(
      "precisionSeconds must divide evenly into one degree.",
    );
  }

  const observedUnits = observedAnglesDegrees.map((angle, index) => {
    const rawUnits = angle * unitsPerDegree;
    const roundedUnits = Math.round(rawUnits);

    if (Math.abs(rawUnits - roundedUnits) > REPRESENTATION_TOLERANCE) {
      throw new RangeError(
        `anglesDegrees[${index}] cannot be represented at the requested second precision.`,
      );
    }

    return roundedUnits;
  });

  const theoreticalUnits = Math.round(
    closure.theoreticalSumDegrees * unitsPerDegree,
  );
  const totalCorrectionUnits = theoreticalUnits - sum(observedUnits);
  const baseCorrectionUnits = Math.trunc(
    totalCorrectionUnits / observedUnits.length,
  );
  const remainderUnits =
    totalCorrectionUnits - baseCorrectionUnits * observedUnits.length;
  const remainderDirection = Math.sign(remainderUnits);

  const correctionUnits = observedUnits.map((_, index) => {
    const receivesRemainder = index < Math.abs(remainderUnits);
    return (
      baseCorrectionUnits +
      (receivesRemainder ? remainderDirection : 0)
    );
  });

  const correctionsDegrees = correctionUnits.map(
    (units) => units / unitsPerDegree,
  );
  const adjustedAnglesDegrees = observedUnits.map(
    (units, index) => (units + correctionUnits[index]!) / unitsPerDegree,
  );

  const lastIndex = adjustedAnglesDegrees.length - 1;
  const residual =
    closure.theoreticalSumDegrees - sum(adjustedAnglesDegrees);
  adjustedAnglesDegrees[lastIndex] =
    adjustedAnglesDegrees[lastIndex]! + residual;
  correctionsDegrees[lastIndex] = correctionsDegrees[lastIndex]! + residual;

  return {
    closure,
    observedAnglesDegrees: [...observedAnglesDegrees],
    correctionsDegrees,
    adjustedAnglesDegrees,
  };
}
