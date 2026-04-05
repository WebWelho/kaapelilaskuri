import type { CrossSection, Phase, LoadType } from "./types";
import { COPPER_RESISTIVITY_70C } from "./constants";

interface VoltageDropResult {
  voltageDropV: number;
  voltageDropPercent: number;
}

/** Laske jännitteenalenema */
export function calculateVoltageDrop(
  currentA: number,
  crossSectionMm2: CrossSection | number,
  lengthM: number,
  phase: Phase,
): VoltageDropResult {
  if (lengthM === 0) {
    return { voltageDropV: 0, voltageDropPercent: 0 };
  }

  const voltage = phase === "1-phase" ? 230 : 400;
  const multiplier = phase === "1-phase" ? 2 : Math.sqrt(3);

  const voltageDropV =
    (multiplier * lengthM * currentA * COPPER_RESISTIVITY_70C) /
    crossSectionMm2;

  const voltageDropPercent = (voltageDropV / voltage) * 100;

  return { voltageDropV, voltageDropPercent };
}

/** Tarkista onko jännitteenalenema sallituissa rajoissa */
export function checkVoltageDrop(
  voltageDropPercent: number,
  loadType: LoadType,
): { ok: boolean; limit: number } {
  const limit = loadType === "lighting" ? 3 : 5;
  return {
    ok: voltageDropPercent <= limit,
    limit,
  };
}
