import type {
  CrossSection,
  InstallMethod,
  Phase,
  CableType,
  ProtectionType,
} from "./types";
import {
  FUSE_SIZES,
  MCB_SIZES,
  CROSS_SECTIONS,
  CAPACITY_2_CONDUCTORS,
  CAPACITY_3_CONDUCTORS,
  TEMP_CORRECTION_AIR,
  TEMP_CORRECTION_GROUND,
  GROUPING_FACTORS,
  GROUND_INSTALL_METHODS,
} from "./constants";

/** Laske kuormitusvirta (A) */
export function calculateCurrent(
  powerW: number,
  phase: Phase,
  cosPhi: number,
): number {
  if (phase === "1-phase") {
    return powerW / (230 * cosPhi);
  }
  return powerW / (Math.sqrt(3) * 400 * cosPhi);
}

/** Valitse pienin riittävä gG-sulake. Palauttaa null jos liian suuri virta. */
export function selectFuse(currentA: number): number | null {
  for (const fuse of FUSE_SIZES) {
    if (fuse >= currentA) return fuse;
  }
  return null;
}

/** Valitse pienin riittävä MCB. Palauttaa null jos liian suuri virta. */
export function selectMCB(currentA: number): number | null {
  for (const mcb of MCB_SIZES) {
    if (mcb >= currentA) return mcb;
  }
  return null;
}

/** Valitse suojalaite tyypin perusteella */
export function selectProtection(
  currentA: number,
  protectionType: ProtectionType,
): number | null {
  if (protectionType === "gG") {
    return selectFuse(currentA);
  }
  return selectMCB(currentA);
}

/** Suojalaitteen kuvaus tulokseen */
export function getProtectionDescription(
  protectionType: ProtectionType,
  ratingA: number,
): string {
  switch (protectionType) {
    case "gG":
      return `${ratingA} A gG`;
    case "MCB-B":
      return `B${ratingA}`;
    case "MCB-C":
      return `C${ratingA}`;
    case "MCB-D":
      return `D${ratingA}`;
    case "MCB-K":
      return `K${ratingA}`;
  }
}

/** Interpoloi korjauskerroin taulukosta */
function interpolateFactor(
  table: Record<number, number>,
  value: number,
): number {
  const temps = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);

  if (value <= temps[0]) return table[temps[0]];
  if (value >= temps[temps.length - 1]) return table[temps[temps.length - 1]];

  for (let i = 0; i < temps.length - 1; i++) {
    if (value >= temps[i] && value <= temps[i + 1]) {
      const ratio = (value - temps[i]) / (temps[i + 1] - temps[i]);
      return table[temps[i]] + ratio * (table[temps[i + 1]] - table[temps[i]]);
    }
  }
  return 1.0;
}

/** Hae lämpötilakorjauskerroin */
export function getTempCorrectionFactor(
  tempC: number,
  isGroundInstall: boolean,
): number {
  const table = isGroundInstall ? TEMP_CORRECTION_GROUND : TEMP_CORRECTION_AIR;
  return interpolateFactor(table, tempC);
}

/** Hae ryhmityskerroin */
export function getGroupCorrectionFactor(circuits: number): number {
  if (circuits <= 1) return 1.0;
  return interpolateFactor(GROUPING_FACTORS, circuits);
}

/** Valitse kaapelin poikkipinta */
export function selectCable(
  fuseA: number,
  installMethod: InstallMethod,
  phase: Phase,
  tempFactor: number,
  groupFactor: number,
): { crossSection: CrossSection | null; capacityA: number } {
  const requiredCapacity = fuseA / (tempFactor * groupFactor);

  const table =
    phase === "1-phase" ? CAPACITY_2_CONDUCTORS : CAPACITY_3_CONDUCTORS;

  for (const cs of CROSS_SECTIONS) {
    const capacity = table[installMethod][cs];
    if (capacity >= requiredCapacity) {
      return { crossSection: cs, capacityA: capacity };
    }
  }

  return { crossSection: null, capacityA: 0 };
}

/** Suosittele kaapelityyppi asennustavan perusteella */
export function getCableRecommendation(
  installMethod: InstallMethod,
): CableType {
  if (GROUND_INSTALL_METHODS.includes(installMethod)) {
    return "MCMK";
  }
  // F ja G = yksijohdinkaapelit kaapelihyllyllä
  if (installMethod === "F" || installMethod === "G") {
    return "MK";
  }
  return "MMJ";
}

/** Muodosta oikea suomalainen kaapelinimike */
export function getCableDescription(
  cableType: CableType,
  crossSection: CrossSection,
  phase: Phase,
): string {
  if (cableType === "MK") {
    // Yksijohdinkaapelit: erillisiä johtimia
    const count = phase === "3-phase" ? 4 : 2;
    return `${count}× MK ${crossSection} + PE ${crossSection}`;
  }
  if (cableType === "MCMK") {
    // Armoitu maakaapeli: kuormajohtimet + konsentinen PE
    const loadConductors = phase === "3-phase" ? 4 : 3;
    return `MCMK ${loadConductors}×${crossSection}+${crossSection}`;
  }
  // MMJ: monijohtiminen muovivaippakaapeli, S = kaikki johtimet samaa kokoa
  const totalConductors = phase === "3-phase" ? 5 : 3;
  return `MMJ ${totalConductors}×${crossSection}S`;
}
