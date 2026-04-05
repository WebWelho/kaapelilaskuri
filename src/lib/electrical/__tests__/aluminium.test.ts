import { describe, it, expect } from "vitest";
import { calculate } from "../index";
import type { CalcInput } from "../types";
import {
  selectCable,
  getCableRecommendation,
  getCableDescription,
  getTempCorrectionFactor,
} from "../calculator";
import { calculateVoltageDrop } from "../voltage-drop";
import { calculateCableLoopImpedance } from "../short-circuit";

describe("alumiinikaapelit", () => {
  describe("selectCable — alumiini", () => {
    it("valitsee 25 mm² alumiinikaapelin C-asennukselle 32A (3-vaihe)", () => {
      // C, alumiini, 3 johdinta: 16mm²=47A, 25mm²=61A
      // 32A → 16mm² riittää (47A ≥ 32A)
      const result = selectCable(32, "C", "3-phase", 1.0, 1.0, "aluminium");
      expect(result.crossSection).toBe(16);
      expect(result.capacityA).toBe(47);
    });

    it("valitsee suuremman alumiinikaapelin korjauskertoimilla", () => {
      // 32A, 40°C (0.87), 3 ryhmää (0.70) → 32 / (0.87×0.70) = 52.5A
      // C, alumiini, 3 johdinta: 25mm²=61A ≥ 52.5A
      const result = selectCable(32, "C", "3-phase", 0.87, 0.7, "aluminium");
      expect(result.crossSection).toBe(25);
    });

    it("pienin alumiinikaapeli on 16 mm²", () => {
      // Pieni kuorma 10A → silti 16mm² (pienin alumiini)
      const result = selectCable(10, "C", "1-phase", 1.0, 1.0, "aluminium");
      expect(result.crossSection).toBe(16);
    });

    it("palauttaa null jos mikään alumiinikaapeli ei riitä", () => {
      const result = selectCable(500, "A1", "3-phase", 0.5, 0.5, "aluminium");
      expect(result.crossSection).toBeNull();
    });
  });

  describe("getCableRecommendation — alumiini", () => {
    it("suosittelee AMCMK:ta maa-asennukselle", () => {
      expect(getCableRecommendation("D1", "aluminium")).toBe("AMCMK");
      expect(getCableRecommendation("D2", "aluminium")).toBe("AMCMK");
    });

    it("suosittelee AXMK:ta muille asennustavoille", () => {
      expect(getCableRecommendation("C", "aluminium")).toBe("AXMK");
      expect(getCableRecommendation("E", "aluminium")).toBe("AXMK");
    });

    it("kupari palauttaa edelleen MMJ/MCMK/MK", () => {
      expect(getCableRecommendation("C", "copper")).toBe("MMJ");
      expect(getCableRecommendation("D1", "copper")).toBe("MCMK");
    });
  });

  describe("getCableDescription — alumiini", () => {
    it("AXMK 3-vaihe → AXMK 4×25", () => {
      expect(getCableDescription("AXMK", 25, "3-phase")).toBe("AXMK 4×25");
    });

    it("AXMK 1-vaihe → AXMK 2×16", () => {
      expect(getCableDescription("AXMK", 16, "1-phase")).toBe("AXMK 2×16");
    });

    it("AMCMK 3-vaihe → AMCMK 4×50+50", () => {
      expect(getCableDescription("AMCMK", 50, "3-phase")).toBe("AMCMK 4×50+50");
    });
  });

  describe("calculateVoltageDrop — alumiini", () => {
    it("alumiinilla suurempi jännitteenalenema kuin kuparilla", () => {
      const cuVd = calculateVoltageDrop(16, 2.5, 20, "1-phase", "copper");
      const alVd = calculateVoltageDrop(16, 25, 20, "1-phase", "aluminium");
      // 2.5mm² Cu vs 25mm² Al → Al on pienempi koska poikkipinta on isompi
      // Mutta sama poikkipinta → Al on isompi
      const cuSame = calculateVoltageDrop(16, 25, 20, "1-phase", "copper");
      const alSame = calculateVoltageDrop(16, 25, 20, "1-phase", "aluminium");
      expect(alSame.voltageDropPercent).toBeGreaterThan(
        cuSame.voltageDropPercent,
      );
    });
  });

  describe("calculateCableLoopImpedance — alumiini", () => {
    it("alumiinilla suurempi impedanssi kuin kuparilla", () => {
      const cuZ = calculateCableLoopImpedance(25, 30, "1-phase", "copper");
      const alZ = calculateCableLoopImpedance(25, 30, "1-phase", "aluminium");
      expect(alZ).toBeGreaterThan(cuZ);
      // Al/Cu resistiivisyyssuhde = 0.036/0.0225 = 1.6
      expect(alZ / cuZ).toBeCloseTo(1.6, 1);
    });
  });

  describe("getTempCorrectionFactor — XLPE", () => {
    it("XLPE 30°C → 1.0 (sama referenssi)", () => {
      expect(getTempCorrectionFactor(30, false, "XLPE")).toBe(1.0);
    });

    it("XLPE sallii korkeamman lämpötilan kuin PVC", () => {
      // PVC 60°C = 0.50, XLPE 60°C = 0.71
      const pvc = getTempCorrectionFactor(60, false, "PVC");
      const xlpe = getTempCorrectionFactor(60, false, "XLPE");
      expect(xlpe).toBeGreaterThan(pvc);
    });

    it("XLPE maa-asennus 20°C → 1.0", () => {
      expect(getTempCorrectionFactor(20, true, "XLPE")).toBe(1.0);
    });
  });

  describe("calculate — alumiini integraatiotesti", () => {
    it("alumiini maakaapeli 20kW, 3-vaihe, D1", () => {
      const input: CalcInput = {
        powerW: 20000,
        phase: "3-phase",
        cosPhi: 1.0,
        installMethod: "D1",
        cableLengthM: 50,
        ambientTempC: 20,
        groupedCircuits: 1,
        loadType: "general",
        conductorMaterial: "aluminium",
      };

      const result = calculate(input);

      expect(result.conductorMaterial).toBe("aluminium");
      expect(result.cableType).toBe("AMCMK");
      expect(result.cableDescription).toContain("AMCMK");
      expect(result.crossSectionMm2).toBeGreaterThanOrEqual(16);
      expect(result.voltageDropOk).toBeDefined();
      expect(result.faultCurrentA).toBeGreaterThan(0);
    });

    it("alumiini kiinteistösyöttö C-asennus", () => {
      const input: CalcInput = {
        powerW: 30000,
        phase: "3-phase",
        cosPhi: 0.9,
        installMethod: "C",
        cableLengthM: 30,
        ambientTempC: 25,
        groupedCircuits: 1,
        loadType: "general",
        conductorMaterial: "aluminium",
        protectionType: "gG",
      };

      const result = calculate(input);

      expect(result.conductorMaterial).toBe("aluminium");
      expect(result.cableType).toBe("AXMK");
      expect(result.insulationType).toBe("PVC");
    });

    it("oletus on kupari kun conductorMaterial ei ole annettu", () => {
      const input: CalcInput = {
        powerW: 20000,
        phase: "3-phase",
        cosPhi: 1.0,
        installMethod: "C",
        cableLengthM: 30,
        ambientTempC: 30,
        groupedCircuits: 1,
        loadType: "general",
      };

      const result = calculate(input);
      expect(result.conductorMaterial).toBe("copper");
      expect(result.insulationType).toBe("PVC");
      expect(result.cableType).toBe("MMJ");
    });

    it("XLPE-eristys antaa paremman lämpötilakertoimen", () => {
      const base: CalcInput = {
        powerW: 10000,
        phase: "3-phase",
        cosPhi: 1.0,
        installMethod: "C",
        cableLengthM: 20,
        ambientTempC: 45,
        groupedCircuits: 1,
        loadType: "general",
      };

      const pvcResult = calculate({ ...base, insulationType: "PVC" });
      const xlpeResult = calculate({ ...base, insulationType: "XLPE" });

      expect(xlpeResult.tempCorrectionFactor).toBeGreaterThan(
        pvcResult.tempCorrectionFactor,
      );
    });
  });
});
