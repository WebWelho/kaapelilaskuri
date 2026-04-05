import type {
  CalcInput,
  CalcResult,
  CrossSection,
  ProtectionType,
} from "./types";
import {
  calculateCurrent,
  selectProtection,
  getProtectionDescription,
  getTempCorrectionFactor,
  getGroupCorrectionFactor,
  selectCable,
  getCableRecommendation,
  getCableDescription,
} from "./calculator";
import { calculateVoltageDrop, checkVoltageDrop } from "./voltage-drop";
import {
  calculateCableLoopImpedance,
  calculateFaultCurrent,
  checkDisconnection,
} from "./short-circuit";
import { CROSS_SECTIONS, GROUND_INSTALL_METHODS } from "./constants";

export type { CalcInput, CalcResult };
export { CROSS_SECTIONS };

/** Oletusarvo verkon silmukkaimpedanssille (Ω) */
const DEFAULT_SOURCE_IMPEDANCE = 0.5;

/** Suorita koko mitoituslaskenta */
export function calculate(input: CalcInput): CalcResult {
  const warnings: string[] = [];
  const protectionType: ProtectionType = input.protectionType ?? "gG";

  // 1. Kuormitusvirta
  const currentA = calculateCurrent(input.powerW, input.phase, input.cosPhi);

  // 2. Suojalaitteen valinta
  const fuseA = selectProtection(currentA, protectionType);
  if (fuseA === null) {
    const maxLabel = protectionType === "gG" ? "630 A (gG)" : "63 A (MCB)";
    throw new Error(
      `Virta ${currentA.toFixed(1)} A ylittää suurimman suojalaitteen ${maxLabel}`,
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

  // 7. Oikosulkuvirtatarkistus
  const sourceZ = input.sourceImpedanceOhm ?? DEFAULT_SOURCE_IMPEDANCE;
  const cableLoopZ = calculateCableLoopImpedance(
    crossSection as number,
    input.cableLengthM,
    input.phase,
  );
  const faultCurrentA = calculateFaultCurrent(sourceZ, cableLoopZ);
  const scCheck = checkDisconnection(faultCurrentA, protectionType, fuseA);

  if (!scCheck.disconnectionOk) {
    warnings.push(
      `Oikosulkuvirta ${faultCurrentA.toFixed(0)} A ei riitä suojalaitteen ${getProtectionDescription(protectionType, fuseA)} poiskytkentään (vaaditaan ${scCheck.requiredFaultCurrentA} A)`,
    );
  }

  return {
    currentA,
    fuseA,
    protectionType,
    protectionDescription: getProtectionDescription(protectionType, fuseA),
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
    faultCurrentA,
    requiredFaultCurrentA: scCheck.requiredFaultCurrentA,
    faultCurrentOk: scCheck.disconnectionOk,
    cableLoopImpedanceOhm: cableLoopZ,
    totalLoopImpedanceOhm: sourceZ + cableLoopZ,
  };
}
