import { describe, it, expect } from "vitest";
import { calculate } from "../index";
import type { CalcInput } from "../types";

describe("calculate — integraatiotesti", () => {
  it("20 kW uuni, 3-vaihe, C-asennus, 30 m", () => {
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

    expect(result.currentA).toBeCloseTo(28.87, 1);
    expect(result.fuseA).toBe(32);
    // C-asennus, 3 johdinta: 6mm² = 38A ≥ 32A
    expect(result.crossSectionMm2).toBe(6);
    expect(result.cableType).toBe("MMJ");
    expect(result.voltageDropPercent).toBeLessThan(5);
    expect(result.voltageDropOk).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("5 kW lämmitin, 1-vaihe, A1-asennus, 20 m", () => {
    const input: CalcInput = {
      powerW: 5000,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "A1",
      cableLengthM: 20,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "general",
    };

    const result = calculate(input);

    // 5000 / 230 = 21.74 A → 25 A sulake
    expect(result.currentA).toBeCloseTo(21.74, 1);
    expect(result.fuseA).toBe(25);
    // A1, 2 johdinta: 2.5mm² = 19A < 25A, 4mm² = 25A ≥ 25A
    expect(result.crossSectionMm2).toBe(4);
    expect(result.voltageDropOk).toBe(true);
  });

  it("huomioi korjauskertoimet (40°C, 3 ryhmää)", () => {
    const input: CalcInput = {
      powerW: 10000,
      phase: "3-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 20,
      ambientTempC: 40,
      groupedCircuits: 3,
      loadType: "general",
    };

    const result = calculate(input);

    // 10000 / (√3 × 400) = 14.43 A → 16 A sulake
    expect(result.fuseA).toBe(16);
    // Korjattu: 16 / (0.87 × 0.70) = 26.27 A
    // C, 3 johdinta: 4mm² = 30A ≥ 26.27A
    expect(result.crossSectionMm2).toBe(4);
    expect(result.tempCorrectionFactor).toBeCloseTo(0.87, 2);
    expect(result.groupCorrectionFactor).toBeCloseTo(0.7, 2);
  });

  it("kasvattaa kaapelia jännitteenaleneman vuoksi (pitkä veto)", () => {
    const input: CalcInput = {
      powerW: 3680,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 100,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "general",
    };

    const result = calculate(input);

    // 3680 / 230 = 16A → 16A sulake
    // C, 2 johdinta: 1.5mm² = 19A ≥ 16A → mutta ΔU liian suuri
    // 2 × 100 × 16 × 0.0225 / 1.5 = 48V → 20.9% → ylittää 5%
    // Pitäisi kasvattaa useita kokoja
    expect(result.crossSectionMm2).toBeGreaterThan(1.5);
    expect(result.voltageDropOk).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("maa-asennus suosittelee MCMK:ta", () => {
    const input: CalcInput = {
      powerW: 15000,
      phase: "3-phase",
      cosPhi: 0.85,
      installMethod: "D1",
      cableLengthM: 50,
      ambientTempC: 20,
      groupedCircuits: 1,
      loadType: "general",
    };

    const result = calculate(input);

    expect(result.cableType).toBe("MCMK");
    expect(result.voltageDropOk).toBe(true);
  });

  it("valaistus käyttää tiukempaa 3% rajaa", () => {
    const input: CalcInput = {
      powerW: 2000,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 50,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "lighting",
    };

    const result = calculate(input);

    expect(result.voltageDropLimit).toBe(3);
    expect(result.voltageDropOk).toBe(true);
  });

  it("heittää virheen liian suurelle kuormalle", () => {
    const input: CalcInput = {
      powerW: 500000,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "A1",
      cableLengthM: 10,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "general",
    };

    expect(() => calculate(input)).toThrow("ylittää suurimman suojalaitteen");
  });

  it("MCB-B: 10 kW moottori, 3-vaihe, C-asennus", () => {
    const input: CalcInput = {
      powerW: 10000,
      phase: "3-phase",
      cosPhi: 0.85,
      installMethod: "C",
      cableLengthM: 20,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "general",
      protectionType: "MCB-C",
    };

    const result = calculate(input);

    // 10000 / (√3 × 400 × 0.85) = 16.98 A → MCB C20
    expect(result.currentA).toBeCloseTo(16.98, 1);
    expect(result.fuseA).toBe(20);
    expect(result.protectionType).toBe("MCB-C");
    expect(result.protectionDescription).toBe("C20");
    expect(result.voltageDropOk).toBe(true);
  });

  it("MCB-B: pistorasiapiiri 3.68 kW, 1-vaihe", () => {
    const input: CalcInput = {
      powerW: 3680,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 15,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "general",
      protectionType: "MCB-B",
    };

    const result = calculate(input);

    // 3680 / 230 = 16 A → MCB B16
    expect(result.fuseA).toBe(16);
    expect(result.protectionType).toBe("MCB-B");
    expect(result.protectionDescription).toBe("B16");
  });

  it("MCB heittää virheen yli 63 A virralle", () => {
    const input: CalcInput = {
      powerW: 20000,
      phase: "1-phase",
      cosPhi: 1.0,
      installMethod: "C",
      cableLengthM: 10,
      ambientTempC: 30,
      groupedCircuits: 1,
      loadType: "general",
      protectionType: "MCB-B",
    };

    // 20000 / 230 = 86.96 A → yli MCB-rajan
    expect(() => calculate(input)).toThrow("ylittää suurimman suojalaitteen");
  });

  it("oletus on gG kun protectionType ei ole annettu", () => {
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
    expect(result.protectionType).toBe("gG");
    expect(result.protectionDescription).toBe("32 A gG");
  });
});
