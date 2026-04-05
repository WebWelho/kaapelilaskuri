import { describe, it, expect } from "vitest";
import { calculateVoltageDrop, checkVoltageDrop } from "../voltage-drop";

describe("calculateVoltageDrop", () => {
  it("laskee 3-vaihejännitteenaleneman oikein", () => {
    // 28.87A, 6mm², 30m, 3-vaihe, 400V
    // ΔU = √3 × 30 × 28.87 × 0.0225 / 6 = 5.63V
    // ΔU% = 5.63 / 400 × 100 = 1.41%
    const result = calculateVoltageDrop(28.87, 6, 30, "3-phase");
    expect(result.voltageDropV).toBeCloseTo(5.63, 0);
    expect(result.voltageDropPercent).toBeCloseTo(1.41, 1);
  });

  it("laskee 1-vaihejännitteenaleneman oikein", () => {
    // 86.96A, 25mm², 50m, 1-vaihe, 230V
    // ΔU = 2 × 50 × 86.96 × 0.0225 / 25 = 7.83V
    // ΔU% = 7.83 / 230 × 100 = 3.40%
    const result = calculateVoltageDrop(86.96, 25, 50, "1-phase");
    expect(result.voltageDropV).toBeCloseTo(7.83, 0);
    expect(result.voltageDropPercent).toBeCloseTo(3.4, 1);
  });

  it("palauttaa 0 kun pituus on 0", () => {
    const result = calculateVoltageDrop(30, 4, 0, "3-phase");
    expect(result.voltageDropPercent).toBe(0);
  });

  it("laskee pitkän kaapelin aleneman (100m)", () => {
    // 16A, 2.5mm², 100m, 1-vaihe
    // ΔU = 2 × 100 × 16 × 0.0225 / 2.5 = 28.8V
    // ΔU% = 28.8 / 230 × 100 = 12.52%
    const result = calculateVoltageDrop(16, 2.5, 100, "1-phase");
    expect(result.voltageDropPercent).toBeCloseTo(12.52, 0);
  });
});

describe("checkVoltageDrop", () => {
  it("hyväksyy alle 5% yleiselle kuormalle", () => {
    const result = checkVoltageDrop(3.5, "general");
    expect(result.ok).toBe(true);
    expect(result.limit).toBe(5);
  });

  it("hylkää yli 5% yleiselle kuormalle", () => {
    const result = checkVoltageDrop(6.0, "general");
    expect(result.ok).toBe(false);
  });

  it("hyväksyy alle 3% valaistukselle", () => {
    const result = checkVoltageDrop(2.5, "lighting");
    expect(result.ok).toBe(true);
    expect(result.limit).toBe(3);
  });

  it("hylkää yli 3% valaistukselle", () => {
    const result = checkVoltageDrop(3.5, "lighting");
    expect(result.ok).toBe(false);
  });
});
