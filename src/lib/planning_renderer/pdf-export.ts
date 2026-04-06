import type { ElectricalPlan } from "@/lib/planning_model/types";
import { ROOM_REQUIREMENTS } from "@/lib/planning_rules/room-requirements";

/**
 * Generoi PDF-valmis data sähkösuunnitelmasta.
 * Varsinainen jsPDF-generointi tapahtuu app-kerroksessa (ei node-riippuvuutta core-paketissa).
 */

export interface PdfSection {
  title: string;
  rows: [string, string][];
}

export interface PdfPlanData {
  title: string;
  subtitle: string;
  date: string;
  summary: PdfSection;
  rooms: PdfSection[];
  circuits: PdfSection;
  warnings: string[];
  notes: string[];
  disclaimer: string;
}

export function preparePdfData(plan: ElectricalPlan): PdfPlanData {
  const date = new Date().toLocaleDateString("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Yhteenveto
  const summary: PdfSection = {
    title: "YHTEENVETO",
    rows: [
      ["Pinta-ala", `${plan.floorPlan.totalAreaM2} m²`],
      ["Huoneita", `${plan.floorPlan.rooms.length}`],
      ["Sähköpisteitä", `${plan.devices.length}`],
      ["Piirejä", `${plan.circuits.length}`],
      ["Kokonaiskuorma", `${(plan.totalLoadW / 1000).toFixed(1)} kW`],
      ["Pääsulake", `${plan.mainFuseA} A (3-vaihe)`],
    ],
  };

  // Huonekohtaiset tiedot
  const rooms: PdfSection[] = plan.floorPlan.rooms.map((room) => {
    const roomDevices = plan.devices.filter((d) => d.roomId === room.id);
    const req = ROOM_REQUIREMENTS[room.type];
    const deviceSummary: Record<string, number> = {};

    for (const d of roomDevices) {
      deviceSummary[d.label] = (deviceSummary[d.label] ?? 0) + 1;
    }

    return {
      title: `${req?.nameFi ?? room.type} — ${room.name} (${room.areaM2} m²)`,
      rows: Object.entries(deviceSummary).map(([label, count]) => [
        label,
        `${count} kpl`,
      ]),
    };
  });

  // Piiriluettelo
  const circuits: PdfSection = {
    title: "PIIRILUETTELO",
    rows: plan.circuits.map((c) => [
      `${c.groupNumber}. ${c.name}`,
      `${c.protectionType} ${c.fuseA}A · ${c.cableType} ${c.crossSectionMm2}mm² · ${(c.totalLoadW / 1000).toFixed(1)} kW`,
    ]),
  };

  return {
    title: plan.floorPlan.name,
    subtitle: "Sähkösuunnitelma — laskennallinen arvio",
    date,
    summary,
    rooms,
    circuits,
    warnings: plan.warnings,
    notes: plan.notes,
    disclaimer:
      "Laskennallinen arvio — ei korvaa standardikirjaa tai pätevän sähkösuunnittelijan työtä. " +
      "Perustuu SFS 6000:2017 julkisiin periaatteisiin. Vastuu on aina sähköurakoitsijalla.",
  };
}
