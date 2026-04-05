import type { CalcInput, CalcResult, CrossSection } from "./types";
import {
  calculateCurrent,
  selectFuse,
  getTempCorrectionFactor,
  getGroupCorrectionFactor,
  selectCable,
  getCableRecommendation,
  getCableDescription,
} from "./calculator";
import { calculateVoltageDrop, checkVoltageDrop } from "./voltage-drop";
import { CROSS_SECTIONS, GROUND_INSTALL_METHODS } from "./constants";

export type { CalcInput, CalcResult };
export { CROSS_SECTIONS };

/** Suorita koko mitoituslaskenta */
export function calculate(input: CalcInput): CalcResult {
  const warnings: string[] = [];

  // 1. Kuormitusvirta
  const currentA = calculateCurrent(input.powerW, input.phase, input.cosPhi);

  // 2. Sulakevalinta
  const fuseA = selectFuse(currentA);
  if (fuseA === null) {
    throw new Error(
      `Virta ${currentA.toFixed(1)} A ylittää suurimman sulakekoon (630 A)`,
    );
  }

  // 3. Korjauskertoimet
  const isGround = GROUND_INSTALL_METHODS.includes(input.installMethod);
  const tempFactor = getTempCorrectionFactor(input.ambientTempC, isGround);
  const groupFactor = getGroupCorrectionFactor(input.groupedCircuits);

  // 4. Kaapelinvalinta
  const cableResult = selectCable(
    fuseA,
    input.installMethod,
    input.phase,
    tempFactor,
    groupFactor,
  );

  let crossSection = cableResult.crossSection;
  let actualCapacity = cableResult.capacityA;

  if (crossSection === null) {
    throw new Error("Yksikään kaapelikoko ei riitä annetuilla parametreilla");
  }

  // 5. Jännitteenalenema — tarkista ja kasvata tarvittaessa
  let vdResult = calculateVoltageDrop(
    currentA,
    crossSection,
    input.cableLengthM,
    input.phase,
  );
  const vdCheck = checkVoltageDrop(vdResult.voltageDropPercent, input.loadType);

  if (!vdCheck.ok) {
    // Kokeile suurempia poikkipintoja
    const csIndex = CROSS_SECTIONS.indexOf(crossSection);
    let upgraded = false;

    for (let i = csIndex + 1; i < CROSS_SECTIONS.length; i++) {
      const tryCs = CROSS_SECTIONS[i];
      const tryVd = calculateVoltageDrop(
        currentA,
        tryCs,
        input.cableLengthM,
        input.phase,
      );
      if (tryVd.voltageDropPercent <= vdCheck.limit) {
        warnings.push(
          `Kaapeli kasvatettu ${crossSection} → ${tryCs} mm² jännitteenaleneman vuoksi`,
        );
        crossSection = tryCs;
        vdResult = tryVd;
        upgraded = true;
        break;
      }
    }

    if (!upgraded) {
      warnings.push(
        `Jännitteenalenema ${vdResult.voltageDropPercent.toFixed(1)}% ylittää rajan ${vdCheck.limit}% — myös suurimmalla kaapelilla`,
      );
    }
  }

  // 6. Kaapelityyppi ja nimike
  const cableType = getCableRecommendation(input.installMethod);
  const cableDescription = getCableDescription(
    cableType,
    crossSection as CrossSection,
    input.phase,
  );

  return {
    currentA,
    fuseA,
    crossSectionMm2: crossSection as CrossSection,
    cableType,
    cableDescription,
    voltageDropPercent: vdResult.voltageDropPercent,
    voltageDropLimit: vdCheck.limit,
    voltageDropOk: vdResult.voltageDropPercent <= vdCheck.limit,
    correctedCapacityA: fuseA / (tempFactor * groupFactor),
    actualCapacityA: actualCapacity,
    tempCorrectionFactor: tempFactor,
    groupCorrectionFactor: groupFactor,
    warnings,
  };
}
