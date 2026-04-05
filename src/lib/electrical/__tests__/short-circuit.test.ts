import { describe, it, expect } from "vitest";
import {
  calculateCableLoopImpedance,
  calculateFaultCurrent,
  getRequiredFaultCurrent,
  checkDisconnection,
} from "../short-circuit";

describe("calculateCableLoopImpedance", () => {
  it("laskee silmukkaimpedanssin 1-vaihe, 2.5 mm², 20 m", () => {
    // Z = 2 × ρ × L / A = 2 × 0.0225 × 20 / 2.5 = 0.36 Ω
    const result = calculateCableLoopImpedance(2.5, 20, "1-phase");
    expect(result).toBeCloseTo(0.36, 2);
  });

  it("laskee silmukkaimpedanssin 3-vaihe, 6 mm², 30 m", () => {
    // Z = 2 × ρ × L / A = 2 × 0.0225 × 30 / 6 = 0.225 Ω
    // Huom: 3-vaiheessa vika on L-PE, sama kaava kuin 1-vaihe
    const result = calculateCableLoopImpedance(6, 30, "1-phase");
    expect(result).toBeCloseTo(0.225, 3);
  });

  it("palauttaa 0 kun pituus on 0", () => {
    expect(calculateCableLoopImpedance(2.5, 0, "1-phase")).toBe(0);
  });

  it("laskee isommalle kaapelille pienemmän impedanssin", () => {
    const z10 = calculateCableLoopImpedance(10, 20, "1-phase");
    const z25 = calculateCableLoopImpedance(25, 20, "1-phase");
    expect(z25).toBeLessThan(z10);
  });
});

describe("calculateFaultCurrent", () => {
  it("laskee oikosulkuvirran kun Ze=0.5Ω ja Zcable=0.36Ω", () => {
    // Ik = c_min × U0 / Zs = 0.95 × 230 / (0.5 + 0.36) = 254.1 A
    const result = calculateFaultCurrent(0.5, 0.36);
    expect(result).toBeCloseTo(254.1, 0);
  });

  it("laskee oikosulkuvirran pienellä impedanssilla", () => {
    // Ik = 0.95 × 230 / (0.2 + 0.1) = 728.3 A
    const result = calculateFaultCurrent(0.2, 0.1);
    expect(result).toBeCloseTo(728.3, 0);
  });

  it("laskee oikosulkuvirran suurella impedanssilla", () => {
    // Ik = 0.95 × 230 / (0.8 + 1.0) = 121.4 A
    const result = calculateFaultCurrent(0.8, 1.0);
    expect(result).toBeCloseTo(121.4, 0);
  });

  it("palauttaa virran pelkällä ulkoisella impedanssilla (Zcable=0)", () => {
    // Ik = 0.95 × 230 / 0.5 = 437 A
    const result = calculateFaultCurrent(0.5, 0);
    expect(result).toBeCloseTo(437, 0);
  });
});

describe("getRequiredFaultCurrent", () => {
  it("MCB-B: vaatii 5 × In", () => {
    expect(getRequiredFaultCurrent("MCB-B", 16)).toBe(80);
    expect(getRequiredFaultCurrent("MCB-B", 10)).toBe(50);
    expect(getRequiredFaultCurrent("MCB-B", 32)).toBe(160);
  });

  it("MCB-C: vaatii 10 × In", () => {
    expect(getRequiredFaultCurrent("MCB-C", 16)).toBe(160);
    expect(getRequiredFaultCurrent("MCB-C", 32)).toBe(320);
  });

  it("MCB-D: vaatii 20 × In", () => {
    expect(getRequiredFaultCurrent("MCB-D", 16)).toBe(320);
    expect(getRequiredFaultCurrent("MCB-D", 63)).toBe(1260);
  });

  it("MCB-K: vaatii 14 × In", () => {
    expect(getRequiredFaultCurrent("MCB-K", 16)).toBe(224);
    expect(getRequiredFaultCurrent("MCB-K", 32)).toBe(448);
  });

  it("gG: käyttää poiskytkentäaikataulukkoa (0.4s)", () => {
    // gG 16A → 65A vaaditaan 0.4s laukaisuun
    expect(getRequiredFaultCurrent("gG", 16)).toBe(65);
    // gG 32A → 150A
    expect(getRequiredFaultCurrent("gG", 32)).toBe(150);
    // gG 63A → 320A
    expect(getRequiredFaultCurrent("gG", 63)).toBe(320);
  });

  it("gG: pienemmät sulakekoot", () => {
    expect(getRequiredFaultCurrent("gG", 6)).toBe(28);
    expect(getRequiredFaultCurrent("gG", 10)).toBe(46);
    expect(getRequiredFaultCurrent("gG", 20)).toBe(80);
    expect(getRequiredFaultCurrent("gG", 25)).toBe(100);
  });

  it("gG: suuremmat sulakekoot", () => {
    expect(getRequiredFaultCurrent("gG", 80)).toBe(425);
    expect(getRequiredFaultCurrent("gG", 100)).toBe(580);
    expect(getRequiredFaultCurrent("gG", 125)).toBe(715);
  });
});

describe("checkDisconnection", () => {
  it("hyväksyy kun oikosulkuvirta riittää (MCB-B 16A, 254A)", () => {
    // B16 vaatii 80A, saadaan 254A → OK
    const result = checkDisconnection(254, "MCB-B", 16);
    expect(result.disconnectionOk).toBe(true);
    expect(result.requiredFaultCurrentA).toBe(80);
  });

  it("hylkää kun oikosulkuvirta ei riitä (MCB-C 32A, 200A)", () => {
    // C32 vaatii 320A, saadaan 200A → EI OK
    const result = checkDisconnection(200, "MCB-C", 32);
    expect(result.disconnectionOk).toBe(false);
    expect(result.requiredFaultCurrentA).toBe(320);
  });

  it("hyväksyy raja-arvon (tasan vaadittava)", () => {
    // B16 vaatii 80A, saadaan 80A → OK (tasan riittää)
    const result = checkDisconnection(80, "MCB-B", 16);
    expect(result.disconnectionOk).toBe(true);
  });

  it("hylkää gG-sulakkeella liian pienellä vikavirralla", () => {
    // gG 32A vaatii 150A, saadaan 120A → EI OK
    const result = checkDisconnection(120, "gG", 32);
    expect(result.disconnectionOk).toBe(false);
    expect(result.requiredFaultCurrentA).toBe(150);
  });

  it("hyväksyy gG-sulakkeella riittävällä vikavirralla", () => {
    // gG 16A vaatii 65A, saadaan 254A → OK
    const result = checkDisconnection(254, "gG", 16);
    expect(result.disconnectionOk).toBe(true);
  });
});
