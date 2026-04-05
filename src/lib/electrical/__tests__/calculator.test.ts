import { describe, it, expect } from "vitest";
import {
  calculateCurrent,
  selectFuse,
  getTempCorrectionFactor,
  getGroupCorrectionFactor,
  selectCable,
  getCableRecommendation,
  getCableDescription,
} from "../calculator";

describe("calculateCurrent", () => {
  it("laskee 3-vaihevirran oikein (20 kW uuni)", () => {
    const result = calculateCurrent(20000, "3-phase", 1.0);
    expect(result).toBeCloseTo(28.87, 1);
  });

  it("laskee 1-vaihevirran oikein (20 kW)", () => {
    const result = calculateCurrent(20000, "1-phase", 1.0);
    expect(result).toBeCloseTo(86.96, 1);
  });

  it("laskee virran tehokertoimella cos φ = 0.8", () => {
    const result = calculateCurrent(10000, "3-phase", 0.8);
    // 10000 / (√3 × 400 × 0.8) = 18.04
    expect(result).toBeCloseTo(18.04, 1);
  });

  it("laskee pienen kuorman oikein (2 kW)", () => {
    const result = calculateCurrent(2000, "1-phase", 1.0);
    // 2000 / 230 = 8.70
    expect(result).toBeCloseTo(8.7, 1);
  });
});

describe("selectFuse", () => {
  it("valitsee 32 A sulakkeen 28.87 A virralle", () => {
    expect(selectFuse(28.87)).toBe(32);
  });

  it("valitsee 100 A sulakkeen 86.96 A virralle", () => {
    expect(selectFuse(86.96)).toBe(100);
  });

  it("valitsee 10 A sulakkeen 8.7 A virralle", () => {
    expect(selectFuse(8.7)).toBe(10);
  });

  it("valitsee tasan sulakekoon", () => {
    expect(selectFuse(16)).toBe(16);
  });

  it("valitsee 6 A pienimmälle virralle", () => {
    expect(selectFuse(3)).toBe(6);
  });

  it("palauttaa null liian suurelle virralle", () => {
    expect(selectFuse(700)).toBeNull();
  });
});

describe("getTempCorrectionFactor", () => {
  it("palauttaa 1.0 referenssilämpötilassa 30°C (ilma)", () => {
    expect(getTempCorrectionFactor(30, false)).toBe(1.0);
  });

  it("palauttaa 0.87 lämpötilassa 40°C (ilma)", () => {
    expect(getTempCorrectionFactor(40, false)).toBe(0.87);
  });

  it("palauttaa 1.0 referenssilämpötilassa 20°C (maa)", () => {
    expect(getTempCorrectionFactor(20, true)).toBe(1.0);
  });

  it("interpoloi arvon lämpötilojen välillä", () => {
    const factor = getTempCorrectionFactor(27, false);
    // Välillä 25°C (1.06) ja 30°C (1.0): interpolaatio 27 → ~1.036
    expect(factor).toBeGreaterThan(1.0);
    expect(factor).toBeLessThan(1.06);
  });
});

describe("getGroupCorrectionFactor", () => {
  it("palauttaa 1.0 yhdelle piirille", () => {
    expect(getGroupCorrectionFactor(1)).toBe(1.0);
  });

  it("palauttaa 0.8 kahdelle piirille", () => {
    expect(getGroupCorrectionFactor(2)).toBe(0.8);
  });

  it("interpoloi 10 piirille (9 ja 12 välissä)", () => {
    const factor = getGroupCorrectionFactor(10);
    expect(factor).toBeGreaterThan(0.45);
    expect(factor).toBeLessThan(0.5);
  });
});

describe("selectCable", () => {
  it("valitsee 4 mm² C-asennukselle 32 A sulakkeella (3-vaihe)", () => {
    const result = selectCable(32, "C", "3-phase", 1.0, 1.0);
    // C-asennus, 3 johdinta, 4mm² = 30A → liian pieni
    // 6mm² = 38A → riittää
    expect(result.crossSection).toBe(6);
  });

  it("valitsee suuremman kaapelin korjauskertoimilla", () => {
    // 32A sulake, mutta 40°C ja 3 ryhmää → vaaditaan 32 / (0.87 × 0.70) = 52.5 A
    const result = selectCable(32, "C", "3-phase", 0.87, 0.7);
    // C, 3 johdinta: 10mm² = 52A → juuri ja juuri ei riitä, 16mm² = 69A → riittää
    expect(result.crossSection).toBe(16);
  });

  it("valitsee oikein 1-vaihekuormalle", () => {
    const result = selectCable(16, "B1", "1-phase", 1.0, 1.0);
    // B1, 2 johdinta: 1.5mm² = 17A → riittää
    expect(result.crossSection).toBe(1.5);
  });

  it("palauttaa null jos mikään kaapeli ei riitä", () => {
    const result = selectCable(630, "A1", "3-phase", 0.5, 0.5);
    expect(result.crossSection).toBeNull();
  });
});

describe("getCableRecommendation", () => {
  it("suosittelee MMJ:tä sisäasennukselle", () => {
    expect(getCableRecommendation("C")).toBe("MMJ");
  });

  it("suosittelee MCMK:ta maa-asennukselle", () => {
    expect(getCableRecommendation("D1")).toBe("MCMK");
    expect(getCableRecommendation("D2")).toBe("MCMK");
  });

  it("suosittelee MMJ:tä vapaaseen ilmaan", () => {
    expect(getCableRecommendation("E")).toBe("MMJ");
  });

  it("suosittelee MK:ta yksijohdinasennuksille (F/G)", () => {
    expect(getCableRecommendation("F")).toBe("MK");
    expect(getCableRecommendation("G")).toBe("MK");
  });
});

describe("getCableDescription", () => {
  it("MMJ 3-vaihe → MMJ 5×6S", () => {
    expect(getCableDescription("MMJ", 6, "3-phase")).toBe("MMJ 5×6S");
  });

  it("MMJ 1-vaihe → MMJ 3×10S", () => {
    expect(getCableDescription("MMJ", 10, "1-phase")).toBe("MMJ 3×10S");
  });

  it("MCMK 3-vaihe → MCMK 4×6+6", () => {
    expect(getCableDescription("MCMK", 6, "3-phase")).toBe("MCMK 4×6+6");
  });

  it("MCMK 1-vaihe → MCMK 3×10+10", () => {
    expect(getCableDescription("MCMK", 10, "1-phase")).toBe("MCMK 3×10+10");
  });

  it("MK 3-vaihe → 4× MK 25 + PE 25", () => {
    expect(getCableDescription("MK", 25, "3-phase")).toBe("4× MK 25 + PE 25");
  });
});
