import type { ProtectionType, ConductorMaterial } from "./types";
import { COPPER_RESISTIVITY_70C, ALUMINIUM_RESISTIVITY_70C } from "./constants";

/** Jännitekerroin minimioikosulkuvirralle (SFS 6000, IEC 60909-0) */
const C_MIN = 0.95;

/** Vaihejännite (V) */
const U0 = 230;

/**
 * gG-sulakkeen vaatima minimivirta 0.4s poiskytkentäajalle (A).
 * Lähde: SFS 6000 taulukko 41.4 / valmistajien aika-virtakäyrät.
 */
const GG_FAULT_CURRENT_04S: Record<number, number> = {
  6: 28,
  10: 46,
  16: 65,
  20: 80,
  25: 100,
  32: 150,
  40: 190,
  50: 250,
  63: 320,
  80: 425,
  100: 580,
  125: 715,
  160: 950,
  200: 1250,
  250: 1650,
  315: 2200,
  400: 2900,
  500: 3800,
  630: 5100,
};

/**
 * MCB magneettilaukaisun kertoimet.
 * Vikavirta >= kerroin × In → välitön laukaisu (< 0.1s).
 */
const MCB_MULTIPLIERS: Record<string, number> = {
  "MCB-B": 5,
  "MCB-C": 10,
  "MCB-D": 20,
  "MCB-K": 14,
};

/**
 * Laske kaapelin silmukkaimpedanssi (vika-silmukka L-PE).
 * Olettaa PE-johtimen olevan samaa poikkipintaa kuin vaihejohtimen (MMJ S).
 *
 * Z_cable = 2 × ρ × L / A
 */
export function calculateCableLoopImpedance(
  crossSectionMm2: number,
  lengthM: number,
  _phase: "1-phase" | "3-phase",
  conductorMaterial: ConductorMaterial = "copper",
): number {
  if (lengthM === 0) return 0;
  const resistivity =
    conductorMaterial === "aluminium"
      ? ALUMINIUM_RESISTIVITY_70C
      : COPPER_RESISTIVITY_70C;
  return (2 * resistivity * lengthM) / crossSectionMm2;
}

/**
 * Laske minimioikosulkuvirta piirin päässä.
 *
 * Ik_min = c_min × U0 / Zs
 *
 * @param sourceImpedanceOhm - Verkon impedanssi syöttöpisteessä (Ze)
 * @param cableLoopImpedanceOhm - Kaapelin silmukkaimpedanssi
 */
export function calculateFaultCurrent(
  sourceImpedanceOhm: number,
  cableLoopImpedanceOhm: number,
): number {
  const totalZ = sourceImpedanceOhm + cableLoopImpedanceOhm;
  if (totalZ === 0) return Infinity;
  return (C_MIN * U0) / totalZ;
}

/**
 * Hae suojalaitteen vaatima minimioikosulkuvirta poiskytkentään.
 *
 * - MCB: magneettilaukaisukerroin × In
 * - gG: 0.4s aika-virtakäyrän arvo
 */
export function getRequiredFaultCurrent(
  protectionType: ProtectionType,
  ratingA: number,
): number {
  if (protectionType === "gG") {
    const required = GG_FAULT_CURRENT_04S[ratingA];
    if (required !== undefined) return required;
    // Interpoloi lähimmästä jos ei löydy taulukosta
    const sizes = Object.keys(GG_FAULT_CURRENT_04S).map(Number);
    for (const size of sizes) {
      if (size >= ratingA) return GG_FAULT_CURRENT_04S[size];
    }
    return ratingA * 8; // Karkea arvio suurille sulakkeille
  }

  const multiplier = MCB_MULTIPLIERS[protectionType];
  if (!multiplier) {
    throw new Error(`Tuntematon suojalaitetyyppi: ${protectionType}`);
  }
  return multiplier * ratingA;
}

/**
 * Tarkista riittääkö oikosulkuvirta suojalaitteen poiskytkentään.
 */
export function checkDisconnection(
  faultCurrentA: number,
  protectionType: ProtectionType,
  ratingA: number,
): { disconnectionOk: boolean; requiredFaultCurrentA: number } {
  const requiredFaultCurrentA = getRequiredFaultCurrent(
    protectionType,
    ratingA,
  );
  return {
    disconnectionOk: faultCurrentA >= requiredFaultCurrentA,
    requiredFaultCurrentA,
  };
}
