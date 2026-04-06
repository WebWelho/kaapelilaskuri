import type { Room, ElectricalDevice, DeviceType } from "@/lib/planning_model/types";
import {
  ROOM_REQUIREMENTS,
  type DeviceRequirement,
} from "@/lib/planning_rules/room-requirements";

let deviceCounter = 0;

function nextId(): string {
  return `dev-${++deviceCounter}`;
}

/** Reset counter (testeissä) */
export function resetDeviceCounter(): void {
  deviceCounter = 0;
}

/**
 * Generoi sähköpisteet yhdelle huoneelle SFS 6000 -sääntöjen perusteella.
 */
export function generateDevicesForRoom(room: Room): ElectricalDevice[] {
  const req = ROOM_REQUIREMENTS[room.type];
  if (!req) return [];

  const devices: ElectricalDevice[] = [];

  for (const devReq of req.devices) {
    const count = calculateDeviceCount(devReq, room.areaM2);

    for (let i = 0; i < count; i++) {
      const position = calculatePosition(devReq.type, i, count, room);

      devices.push({
        id: nextId(),
        type: devReq.type,
        roomId: room.id,
        heightMm: devReq.heightMm,
        posX: position.x,
        posY: position.y,
        wall: position.wall,
        powerW: devReq.powerW,
        label: count > 1 ? `${devReq.label} ${i + 1}` : devReq.label,
        ipRating: devReq.ipRating,
      });
    }
  }

  return devices;
}

/**
 * Laske laitteiden määrä huoneen koon perusteella.
 */
function calculateDeviceCount(req: DeviceRequirement, areaM2: number): number {
  if (!req.perM2) return req.minCount;
  return Math.max(req.minCount, Math.ceil(areaM2 * req.perM2));
}

/**
 * Laske laitteen sijainti huoneessa.
 * Yksinkertainen algoritmi joka jakaa laitteet seinille tasaisesti.
 */
function calculatePosition(
  type: DeviceType,
  index: number,
  total: number,
  room: Room,
): { x: number; y: number; wall?: "north" | "south" | "east" | "west" } {
  const walls: ("north" | "south" | "east" | "west")[] = [
    "south",
    "east",
    "north",
    "west",
  ];

  // Kattovalaisimet ja palovaroittimet keskelle
  if (type === "light_ceiling" || type === "smoke_detector") {
    return { x: 0.5, y: 0.5 };
  }

  // Spotit ja LED-nauhat — työtason yläpuolella (keittiö) tai tasaisesti
  if (type === "light_strip" || type === "light_spot") {
    return { x: 0.5, y: 0.1, wall: "north" };
  }

  // Seinälaitteet — jaetaan seinille tasaisesti
  const wallIndex = index % walls.length;
  const wall = walls[wallIndex];
  const posOnWall = total <= walls.length ? 0.5 : (index + 1) / (total + 1);

  switch (wall) {
    case "north":
      return { x: posOnWall, y: 0, wall };
    case "south":
      return { x: posOnWall, y: 1, wall };
    case "east":
      return { x: 1, y: posOnWall, wall };
    case "west":
      return { x: 0, y: posOnWall, wall };
  }
}

/**
 * Generoi sähköpisteet kaikille huoneille.
 */
export function generateAllDevices(rooms: Room[]): ElectricalDevice[] {
  resetDeviceCounter();
  return rooms.flatMap(generateDevicesForRoom);
}
