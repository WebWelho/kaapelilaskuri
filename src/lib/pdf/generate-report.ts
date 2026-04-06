import { jsPDF } from "jspdf";
import type { CalcInput, CalcResult } from "@/lib/electrical";
import { INSTALL_METHOD_DESCRIPTIONS } from "@/lib/electrical/constants";

const COLORS = {
  primary: [15, 23, 42] as [number, number, number], // slate-900
  accent: [34, 211, 238] as [number, number, number], // cyan-400
  muted: [100, 116, 139] as [number, number, number], // slate-500
  success: [52, 211, 153] as [number, number, number], // emerald-400
  error: [239, 68, 68] as [number, number, number], // red-500
  bg: [241, 245, 249] as [number, number, number], // slate-100
};

function formatDate(): string {
  return new Date().toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateReport(input: CalcInput, result: CalcResult): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Otsikko ──
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.primary);
  doc.text("Kaapelimitoituslaskelma", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Laskennallinen arvio \u2014 ei virallinen dokumentti", margin, y);

  doc.text(formatDate(), pageWidth - margin, y, { align: "right" });
  y += 4;

  // Viiva
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Kaapelisuositus (pääkortti) ──
  doc.setFillColor(...COLORS.bg);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, "F");

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text("KAAPELISUOSITUS", margin + 5, y + 6);

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text(result.cableDescription, margin + 5, y + 15);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(result.protectionDescription, pageWidth - margin - 5, y + 15, {
    align: "right",
  });
  y += 30;

  // ── Syötteet ──
  y = drawSection(doc, "SYÖTTEET", margin, y, contentWidth, [
    ["Teho", `${(input.powerW / 1000).toFixed(1)} kW`],
    ["Vaihejärjestelmä", input.phase === "1-phase" ? "1-vaihe" : "3-vaihe"],
    ["Tehokerroin (cos φ)", input.cosPhi.toString()],
    [
      "Asennustapa",
      `${input.installMethod} — ${INSTALL_METHOD_DESCRIPTIONS[input.installMethod]}`,
    ],
    ["Kaapelin pituus", `${input.cableLengthM} m`],
    ["Ympäristölämpötila", `${input.ambientTempC} °C`],
    ["Vierekkäiset piirit", input.groupedCircuits.toString()],
    ["Kuormatyyppi", input.loadType === "lighting" ? "Valaistus" : "Yleinen"],
    ["Suojalaitetyyppi", result.protectionType],
    [
      "Syöttöimpedanssi (Ze)",
      `${(input.sourceImpedanceOhm ?? 0.5).toFixed(2)} Ω`,
    ],
  ]);
  y += 5;

  // ── Tulokset ──
  y = drawSection(doc, "TULOKSET", margin, y, contentWidth, [
    ["Kuormitusvirta", `${result.currentA.toFixed(2)} A`],
    ["Suojalaite", result.protectionDescription],
    ["Kaapelin poikkipinta", `${result.crossSectionMm2} mm²`],
    ["Kaapelityyppi", result.cableType],
    ["Kaapelinimike", result.cableDescription],
    ["Kuormitettavuus", `${result.actualCapacityA} A`],
    ["Korjattu vaatimus", `${result.correctedCapacityA.toFixed(1)} A`],
  ]);
  y += 5;

  // ── Korjauskertoimet ──
  y = drawSection(doc, "KORJAUSKERTOIMET", margin, y, contentWidth, [
    ["Lämpötilakerroin", result.tempCorrectionFactor.toFixed(3)],
    ["Ryhmityskerroin", result.groupCorrectionFactor.toFixed(3)],
  ]);
  y += 5;

  // ── Jännitteenalenema ──
  const vdStatus = result.voltageDropOk ? "OK" : "YLITTÄÄ";
  y = drawSection(doc, "JÄNNITTEENALENEMA", margin, y, contentWidth, [
    [
      "Jännitteenalenema",
      `${result.voltageDropPercent.toFixed(2)} % (raja ${result.voltageDropLimit} %)`,
    ],
    ["Status", vdStatus],
  ]);
  // Värikoodi statukselle
  const statusColor = result.voltageDropOk ? COLORS.success : COLORS.error;
  doc.setTextColor(...statusColor);
  doc.text(
    result.voltageDropOk ? "✓" : "✗",
    pageWidth - margin - 5,
    y - 5 - 7,
    { align: "right" },
  );
  doc.setTextColor(...COLORS.primary);
  y += 5;

  // ── Oikosulkuvirta ──
  const scStatus = result.faultCurrentOk ? "OK" : "EI RIITÄ";
  y = drawSection(doc, "OIKOSULKUVIRTATARKISTUS", margin, y, contentWidth, [
    ["Oikosulkuvirta (Ik min)", `${result.faultCurrentA.toFixed(0)} A`],
    ["Vaadittu laukaisu", `${result.requiredFaultCurrentA} A`],
    ["Silmukkaimpedanssi (Zs)", `${result.totalLoopImpedanceOhm.toFixed(3)} Ω`],
    ["Kaapelin impedanssi", `${result.cableLoopImpedanceOhm.toFixed(3)} Ω`],
    ["Poiskytkentä", scStatus],
  ]);

  const scColor = result.faultCurrentOk ? COLORS.success : COLORS.error;
  doc.setTextColor(...scColor);
  doc.text(
    result.faultCurrentOk ? "✓" : "✗",
    pageWidth - margin - 5,
    y - 5 - 7,
    {
      align: "right",
    },
  );
  doc.setTextColor(...COLORS.primary);

  // ── Varoitukset ──
  if (result.warnings.length > 0) {
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.accent);
    doc.text("HUOMAUTUKSET", margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.error);
    for (const w of result.warnings) {
      doc.text(`! ${w}`, margin + 2, y);
      y += 5;
    }
  }

  // ── Alatunniste ──
  y = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(...COLORS.bg);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Laskennallinen arvio \u2014 ei korvaa standardikirjaa tai p\u00E4tev\u00E4n suunnittelijan arviota. Perustuu SFS 6000:2017 julkisiin periaatteisiin.",
    margin,
    y,
    { maxWidth: contentWidth * 0.7 },
  );
  doc.text("TPCore \u00B7 Kaapelimitoitus v0.2", pageWidth - margin, y, {
    align: "right",
  });

  // ── Tallenna ──
  const filename = `kaapelimitoitus_${result.crossSectionMm2}mm2_${result.fuseA}A_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function drawSection(
  doc: jsPDF,
  title: string,
  x: number,
  startY: number,
  width: number,
  rows: [string, string][],
): number {
  let y = startY;

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text(title, x, y);
  y += 5;

  doc.setFontSize(9);
  for (const [label, value] of rows) {
    doc.setTextColor(...COLORS.muted);
    doc.text(label, x + 2, y);
    doc.setTextColor(...COLORS.primary);
    doc.text(value, x + width - 2, y, { align: "right" });
    y += 5;
  }

  return y;
}
