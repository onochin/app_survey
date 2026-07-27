import { decimalDegreesToDms } from "../calculations/angle";

export function formatAngleDms(
  decimalDegrees: number,
  secondDecimalPlaces = 0,
): string {
  const dms = decimalDegreesToDms(decimalDegrees, secondDecimalPlaces);
  const sign = dms.sign === -1 ? "−" : "";
  const minutes = String(dms.minutes).padStart(2, "0");
  const seconds =
    secondDecimalPlaces === 0
      ? String(dms.seconds).padStart(2, "0")
      : dms.seconds
          .toFixed(secondDecimalPlaces)
          .padStart(secondDecimalPlaces + 3, "0");

  return `${sign}${dms.degrees}°${minutes}′${seconds}″`;
}
