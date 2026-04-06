import type { ElectricalDevice, Circuit, CircuitType } from "@/lib/planning_model/types";
import {
  LIGHTING_CIRCUIT,
  OUTLET_CIRCUIT,
  STOVE_CIRCUIT,
  APPLIANCE_CIRCUIT,
  FLOOR_HEATING_CIRCUIT,
  SAUNA_HEATER_CIRCUIT,
  EV_CHARGER_CIRCUIT,
  WET_ROOM_OUTLET_CIRCUIT,
  type CircuitTemplate,
} from "@/lib/planning_rules/circuit-rules";
import { ROOM_REQUIREMENTS } from "@/lib/planning_rules/room-requirements";

let circuitCounter = 0;

function nextCircuitId(): string {
  return `cir-${++circuitCounter}`;
}

export function resetCircuitCounter(): void {
  circuitCounter = 0;
}

/**
 * Valitse piiritemplate laitteen tyypin perusteella.
 */
function getCircuitTemplate(
  device: ElectricalDevice,
  isWetRoom: boolean,
): CircuitTemplate {
  switch (device.type) {
    case "sauna_heater":
      return SAUNA_HEATER_CIRCUIT;
    case "ev_charger":
      return EV_CHARGER_CIRCUIT;
    case "floor_heating":
      return FLOOR_HEATING_CIRCUIT;
    case "outlet_dedicated":
      if (device.label.includes("Liesi")) return STOVE_CIRCUIT;
      return APPLIANCE_CIRCUIT;
    case "light_ceiling":
    case "light_wall":
    case "light_spot":
    case "light_strip":
      return LIGHTING_CIRCUIT;
    case "outlet":
      return isWetRoom ? WET_ROOM_OUTLET_CIRCUIT : OUTLET_CIRCUIT;
    default:
      return OUTLET_CIRCUIT;
  }
}

/**
 * Tarvitseeko laite oman piirin?
 */
function needsDedicatedCircuit(device: ElectricalDevice): boolean {
  return (
    device.type === "outlet_dedicated" ||
    device.type === "sauna_heater" ||
    device.type === "ev_charger" ||
    device.type === "floor_heating"
  );
}

/**
 * Onko laite valaistuslaite?
 */
function isLightingDevice(device: ElectricalDevice): boolean {
  return (
    device.type === "light_ceiling" ||
    device.type === "light_wall" ||
    device.type === "light_spot" ||
    device.type === "light_strip"
  );
}

interface RoomLookup {
  [roomId: string]: { moistureZone?: 0 | 1 | 2 };
}

/**
 * Ryhmittele laitteet piireihin SFS 6000 -sääntöjen mukaisesti.
 */
export function groupIntoCircuits(
  devices: ElectricalDevice[],
  roomLookup: RoomLookup,
): Circuit[] {
  resetCircuitCounter();

  const circuits: Circuit[] = [];
  let groupNumber = 1;

  // 1. Dedikoidut piirit ensin
  const dedicated = devices.filter(needsDedicatedCircuit);
  const shared = devices.filter(
    (d) => !needsDedicatedCircuit(d) && !isNonElectrical(d),
  );

  for (const device of dedicated) {
    const isWet = (roomLookup[device.roomId]?.moistureZone ?? 0) > 0;
    const template = getCircuitTemplate(device, isWet);

    circuits.push({
      id: nextCircuitId(),
      name: device.label,
      type: template.type,
      groupNumber: groupNumber++,
      fuseA: template.fuseA,
      protectionType: template.protectionType,
      cableType: template.cableType,
      crossSectionMm2: template.crossSectionMm2,
      deviceIds: [device.id],
      totalLoadW: device.powerW ?? 0,
    });
  }

  // 2. Valaistuspiirit — ryhmitellään max 10 per piiri
  const lightingDevices = shared.filter(isLightingDevice);
  const lightingChunks = chunkDevices(
    lightingDevices,
    LIGHTING_CIRCUIT.maxDevices,
  );

  for (const chunk of lightingChunks) {
    circuits.push({
      id: nextCircuitId(),
      name: `Valaistus ${groupNumber}`,
      type: "lighting",
      groupNumber: groupNumber++,
      fuseA: LIGHTING_CIRCUIT.fuseA,
      protectionType: LIGHTING_CIRCUIT.protectionType,
      cableType: LIGHTING_CIRCUIT.cableType,
      crossSectionMm2: LIGHTING_CIRCUIT.crossSectionMm2,
      deviceIds: chunk.map((d) => d.id),
      totalLoadW: chunk.reduce((sum, d) => sum + (d.powerW ?? 50), 0),
    });
  }

  // 3. Pistorasiapiirit — ryhmitellään max 10 per piiri
  const outletDevices = shared.filter(
    (d) => d.type === "outlet" && !isLightingDevice(d),
  );

  // Erota kosteustila- ja normaalipisteet
  const wetOutlets = outletDevices.filter(
    (d) => (roomLookup[d.roomId]?.moistureZone ?? 0) > 0,
  );
  const dryOutlets = outletDevices.filter(
    (d) => (roomLookup[d.roomId]?.moistureZone ?? 0) === 0,
  );

  // Kosteustilat omana piirinä
  if (wetOutlets.length > 0) {
    const wetChunks = chunkDevices(
      wetOutlets,
      WET_ROOM_OUTLET_CIRCUIT.maxDevices,
    );
    for (const chunk of wetChunks) {
      circuits.push({
        id: nextCircuitId(),
        name: `Pistorasiat kosteustila ${groupNumber}`,
        type: "outlet",
        groupNumber: groupNumber++,
        fuseA: WET_ROOM_OUTLET_CIRCUIT.fuseA,
        protectionType: WET_ROOM_OUTLET_CIRCUIT.protectionType,
        cableType: WET_ROOM_OUTLET_CIRCUIT.cableType,
        crossSectionMm2: WET_ROOM_OUTLET_CIRCUIT.crossSectionMm2,
        deviceIds: chunk.map((d) => d.id),
        totalLoadW: chunk.reduce((sum, d) => sum + (d.powerW ?? 200), 0),
      });
    }
  }

  // Normaalit pistorasiat
  const dryChunks = chunkDevices(dryOutlets, OUTLET_CIRCUIT.maxDevices);
  for (const chunk of dryChunks) {
    circuits.push({
      id: nextCircuitId(),
      name: `Pistorasiat ${groupNumber}`,
      type: "outlet",
      groupNumber: groupNumber++,
      fuseA: OUTLET_CIRCUIT.fuseA,
      protectionType: OUTLET_CIRCUIT.protectionType,
      cableType: OUTLET_CIRCUIT.cableType,
      crossSectionMm2: OUTLET_CIRCUIT.crossSectionMm2,
      deviceIds: chunk.map((d) => d.id),
      totalLoadW: chunk.reduce((sum, d) => sum + (d.powerW ?? 200), 0),
    });
  }

  return circuits;
}

/**
 * Jaa laitteet lohkoihin max-koon mukaan.
 */
function chunkDevices(
  devices: ElectricalDevice[],
  maxPerChunk: number,
): ElectricalDevice[][] {
  const chunks: ElectricalDevice[][] = [];
  for (let i = 0; i < devices.length; i += maxPerChunk) {
    chunks.push(devices.slice(i, i + maxPerChunk));
  }
  return chunks;
}

/**
 * Ei-sähköiset laitteet (kytkimet, palovaroittimet, jne.)
 * Nämä eivät tarvitse omaa piiriä vaan kytketään valaistupiiriin.
 */
function isNonElectrical(device: ElectricalDevice): boolean {
  return (
    device.type === "switch" ||
    device.type === "dimmer" ||
    device.type === "smoke_detector" ||
    device.type === "motion_sensor" ||
    device.type === "thermostat" ||
    device.type === "doorbell" ||
    device.type === "data_outlet" ||
    device.type === "tv_outlet" ||
    device.type === "ventilation" ||
    device.type === "fuse_box" ||
    device.type === "main_fuse_box"
  );
}
