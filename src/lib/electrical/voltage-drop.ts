import type { CrossSection, Phase, LoadType, ConductorMaterial } from "./types";
import { COPPER_RESISTIVITY_70C, ALUMINIUM_RESISTIVITY_70C } from "./constants";

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
  conductorMaterial: ConductorMaterial = "copper",
): VoltageDropResult {
  if (lengthM === 0) {
    return { voltageDropV: 0, voltageDropPercent: 0 };
  }

  const voltage = phase === "1-phase" ? 230 : 400;
  const multiplier = phase === "1-phase" ? 2 : Math.sqrt(3);
  const resistivity =
    conductorMaterial === "aluminium"
      ? ALUMINIUM_RESISTIVITY_70C
      : COPPER_RESISTIVITY_70C;

  const voltageDropV =
    (multiplier * lengthM * currentA * resistivity) / crossSectionMm2;

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
