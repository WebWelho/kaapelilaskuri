import type { FloorPlan, ElectricalPlan } from "@/lib/planning_model/types";
import { ROOM_REQUIREMENTS } from "@/lib/planning_rules/room-requirements";
import { generateAllDevices } from "@/lib/planning_engine/generate-devices";
import { groupIntoCircuits } from "@/lib/planning_engine/group-circuits";

/**
 * Pääsulakkeen arviointi kokonaistehon perusteella.
 * SFS 6000 + verkkoyhtiön liittymäkoot.
 */
function estimateMainFuse(totalLoadW: number): number {
  // Samanaikaisuuskerroin asuinrakennukselle ~0.4-0.6
  const simultaneousFactor = 0.5;
  const simultaneousLoadW = totalLoadW * simultaneousFactor;
  const currentA = simultaneousLoadW / (Math.sqrt(3) * 400);

  // Pyöristä ylöspäin lähimpään standardikokoon
  const mainFuses = [25, 35, 50, 63, 80, 100, 125, 160, 200];
  for (const fuse of mainFuses) {
    if (fuse >= currentA) return fuse;
  }
  return 200;
}

/**
 * Generoi täydellinen sähkösuunnitelma pohjapiirroksen perusteella.
 */
export function generateElectricalPlan(floorPlan: FloorPlan): ElectricalPlan {
  const warnings: string[] = [];
  const notes: string[] = [];

  // 1. Generoi sähköpisteet huoneittain
  const devices = generateAllDevices(floorPlan.rooms);

  // 2. Rakenna huonehakutaulukko ryhmäjakomoottorille
  const roomLookup: Record<string, { moistureZone?: 0 | 1 | 2 }> = {};
  for (const room of floorPlan.rooms) {
    const req = ROOM_REQUIREMENTS[room.type];
    roomLookup[room.id] = { moistureZone: req?.moistureZone };
  }

  // 3. Ryhmittele piireihin
  const circuits = groupIntoCircuits(devices, roomLookup);

  // 4. Laske kokonaiskuorma
  const totalLoadW = circuits.reduce((sum, c) => sum + c.totalLoadW, 0);

  // 5. Arvioi pääsulake
  const mainFuseA = estimateMainFuse(totalLoadW);

  // 6. Varoitukset ja huomiot
  if (circuits.length > 20) {
    warnings.push(
      `Suuri piirimäärä (${circuits.length}) — harkitse useampaa ryhmäkeskusta`,
    );
  }

  if (mainFuseA >= 63) {
    notes.push(
      `Arvioitu pääsulake ${mainFuseA} A — tarkista verkkoyhtiön liittymäkoko`,
    );
  }

  // Kosteustilavaroitukset
  const wetRooms = floorPlan.rooms.filter((r) => {
    const req = ROOM_REQUIREMENTS[r.type];
    return req?.moistureZone && req.moistureZone > 0;
  });
  if (wetRooms.length > 0) {
    notes.push(
      `Kosteustiloja ${wetRooms.length} kpl — kaikki piirit vikavirtasuojalla 30mA`,
    );
  }

  // Huonekohtaiset huomiot
  for (const room of floorPlan.rooms) {
    const req = ROOM_REQUIREMENTS[room.type];
    if (req?.notes.length) {
      for (const note of req.notes) {
        notes.push(`${req.nameFi} (${room.name}): ${note}`);
      }
    }
  }

  return {
    id: `plan-${Date.now()}`,
    floorPlan,
    devices,
    circuits,
    mainFuseA,
    totalLoadW,
    warnings,
    notes,
  };
}

/**
 * Yhteenveto sähkösuunnitelmasta — ihmisluettava.
 */
export function summarizePlan(plan: ElectricalPlan): string {
  const lines: string[] = [];

  lines.push(`SÄHKÖSUUNNITELMA: ${plan.floorPlan.name}`);
  lines.push(`${"=".repeat(50)}`);
  lines.push(`Pinta-ala: ${plan.floorPlan.totalAreaM2} m²`);
  lines.push(`Huoneita: ${plan.floorPlan.rooms.length}`);
  lines.push(`Sähköpisteitä: ${plan.devices.length}`);
  lines.push(`Piirejä: ${plan.circuits.length}`);
  lines.push(`Kokonaiskuorma: ${(plan.totalLoadW / 1000).toFixed(1)} kW`);
  lines.push(`Pääsulake: ${plan.mainFuseA} A (3-vaihe)`);
  lines.push("");

  // Huonekohtainen yhteenveto
  lines.push("HUONEET:");
  lines.push("-".repeat(50));
  for (const room of plan.floorPlan.rooms) {
    const roomDevices = plan.devices.filter((d) => d.roomId === room.id);
    const req = ROOM_REQUIREMENTS[room.type];
    lines.push(
      `  ${req?.nameFi ?? room.type} "${room.name}" (${room.areaM2} m²): ${roomDevices.length} pistettä`,
    );
  }
  lines.push("");

  // Piiriluettelo
  lines.push("PIIRIT:");
  lines.push("-".repeat(50));
  for (const circuit of plan.circuits) {
    const loadKw = (circuit.totalLoadW / 1000).toFixed(1);
    lines.push(
      `  ${circuit.groupNumber}. ${circuit.name} — ${circuit.protectionType} ${circuit.fuseA}A, ${circuit.cableType} ${circuit.crossSectionMm2}mm², ${loadKw} kW, ${circuit.deviceIds.length} laitetta`,
    );
  }

  if (plan.warnings.length > 0) {
    lines.push("");
    lines.push("VAROITUKSET:");
    for (const w of plan.warnings) lines.push(`  ! ${w}`);
  }

  if (plan.notes.length > 0) {
    lines.push("");
    lines.push("HUOMIOT:");
    for (const n of plan.notes) lines.push(`  - ${n}`);
  }

  lines.push("");
  lines.push(
    "Laskennallinen arvio — ei korvaa pätevän sähkösuunnittelijan työtä.",
  );

  return lines.join("\n");
}
