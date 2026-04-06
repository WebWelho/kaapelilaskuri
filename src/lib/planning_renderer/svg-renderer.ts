import type {
  ElectricalPlan,
  ElectricalDevice,
  Room,
  DeviceType,
} from "@/lib/planning_model/types";

const SCALE = 0.1; // 1mm = 0.1px (eli 1000mm = 100px)
const PADDING = 40;
const DEVICE_RADIUS = 6;
const FONT_SIZE = 8;

/** Sähkösymbolit SVG path -muodossa */
const DEVICE_SYMBOLS: Partial<Record<DeviceType, string>> = {
  outlet: "M-5,0 A5,5 0 1,1 5,0 A5,5 0 1,1 -5,0 M-3,-3 L3,3 M-3,3 L3,-3",
  outlet_dedicated:
    "M-5,0 A5,5 0 1,1 5,0 A5,5 0 1,1 -5,0 M-5,0 L5,0 M0,-5 L0,5",
  switch: "M-4,4 L4,-4 M4,-4 L4,0",
  dimmer: "M-4,4 L4,-4 M4,-4 L4,0 M-2,0 L2,0",
  light_ceiling: "M-5,0 A5,5 0 1,1 5,0 A5,5 0 1,1 -5,0 M-3,3 L3,-3",
  light_wall: "M-5,0 L5,0 M-3,-4 L0,0 L3,-4",
  light_spot: "M-3,0 A3,3 0 1,1 3,0 A3,3 0 1,1 -3,0",
  light_strip: "M-6,0 L6,0 M-6,-2 L6,-2 M-6,2 L6,2",
  smoke_detector:
    "M-4,0 A4,4 0 1,1 4,0 A4,4 0 1,1 -4,0 M-2,0 A2,2 0 1,1 2,0 A2,2 0 1,1 -2,0",
  floor_heating: "M-5,-3 L-5,3 L-2,3 L-2,-3 L1,-3 L1,3 L4,3 L4,-3",
  ev_charger: "M-3,-5 L-3,5 L3,5 L3,-5 Z M-1,-2 L1,2 M1,-2 L-1,2",
  sauna_heater: "M-5,-5 L5,-5 L5,5 L-5,5 Z M-3,-3 L3,3 M3,-3 L-3,3",
  thermostat: "M-3,-5 L-3,5 M-3,5 A3,3 0 1,0 3,0 M-3,-5 L3,-5",
  data_outlet: "M-5,-3 L5,-3 L5,3 L-5,3 Z M-3,0 L3,0",
  tv_outlet: "M-5,-3 L5,-3 L5,3 L-5,3 Z M-3,-1 L0,2 L3,-1",
  fuse_box:
    "M-8,-6 L8,-6 L8,6 L-8,6 Z M-6,-4 L-6,4 M-2,-4 L-2,4 M2,-4 L2,4 M6,-4 L6,4",
  doorbell: "M-4,0 A4,4 0 1,1 4,0 A4,4 0 1,1 -4,0 M0,-4 L0,-6",
  ventilation: "M-5,0 A5,5 0 1,1 5,0 A5,5 0 1,1 -5,0 M-3,0 L0,-3 L3,0 L0,3 Z",
  motion_sensor: "M-4,0 A4,4 0 1,1 4,0 A4,4 0 1,1 -4,0 M4,0 L7,-3 M4,0 L7,3",
};

const DEVICE_COLORS: Partial<Record<DeviceType, string>> = {
  outlet: "#22d3ee",
  outlet_dedicated: "#f472b6",
  switch: "#a78bfa",
  dimmer: "#a78bfa",
  light_ceiling: "#fbbf24",
  light_wall: "#fbbf24",
  light_spot: "#fbbf24",
  light_strip: "#fbbf24",
  smoke_detector: "#ef4444",
  floor_heating: "#fb923c",
  ev_charger: "#34d399",
  sauna_heater: "#f97316",
  thermostat: "#fb923c",
  data_outlet: "#60a5fa",
  tv_outlet: "#60a5fa",
  fuse_box: "#94a3b8",
  doorbell: "#c084fc",
  ventilation: "#6ee7b7",
  motion_sensor: "#a78bfa",
};

function getDeviceColor(type: DeviceType): string {
  return DEVICE_COLORS[type] ?? "#94a3b8";
}

function getDeviceSymbol(type: DeviceType): string {
  return DEVICE_SYMBOLS[type] ?? "M-4,0 A4,4 0 1,1 4,0 A4,4 0 1,1 -4,0";
}

/**
 * Renderöi sähkösuunnitelma SVG-merkkijonona.
 */
export function renderPlanToSvg(plan: ElectricalPlan): string {
  const rooms = plan.floorPlan.rooms;

  // Laske layout — yksinkertainen ruudukko
  const layout = calculateLayout(rooms);
  const totalWidth = layout.totalWidth * SCALE + PADDING * 2;
  const totalHeight = layout.totalHeight * SCALE + PADDING * 2;

  const parts: string[] = [];

  // SVG header
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" ` +
      `width="${totalWidth}" height="${totalHeight}" style="background:#0a0f1a">`,
  );

  // Defs
  parts.push("<defs>");
  parts.push(
    '<style>text { font-family: "DM Sans", system-ui, sans-serif; }</style>',
  );
  parts.push("</defs>");

  // Otsikko
  parts.push(
    `<text x="${PADDING}" y="${PADDING - 15}" fill="#f8fafc" font-size="14" font-weight="700">${escapeXml(plan.floorPlan.name)}</text>`,
  );
  parts.push(
    `<text x="${PADDING}" y="${PADDING - 4}" fill="#64748b" font-size="9">${plan.devices.length} pistettä · ${plan.circuits.length} piiriä · ${plan.mainFuseA}A pääsulake</text>`,
  );

  // Huoneet
  for (const room of rooms) {
    const pos = layout.positions[room.id];
    if (!pos) continue;

    const rx = PADDING + pos.x * SCALE;
    const ry = PADDING + pos.y * SCALE;
    const rw = room.widthMm * SCALE;
    const rh = room.depthMm * SCALE;

    // Huoneen tausta
    parts.push(
      `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" ` +
        `fill="#111827" stroke="#334155" stroke-width="1.5" rx="2"/>`,
    );

    // Huoneen nimi
    const nameFi = getRoomName(room);
    parts.push(
      `<text x="${rx + rw / 2}" y="${ry + 12}" text-anchor="middle" fill="#94a3b8" font-size="${FONT_SIZE}" font-weight="600">${escapeXml(nameFi)}</text>`,
    );
    parts.push(
      `<text x="${rx + rw / 2}" y="${ry + 21}" text-anchor="middle" fill="#475569" font-size="7">${room.areaM2} m²</text>`,
    );

    // Laitteet tässä huoneessa
    const roomDevices = plan.devices.filter((d) => d.roomId === room.id);
    for (const device of roomDevices) {
      const dx = rx + device.posX * rw;
      const dy = ry + 25 + device.posY * (rh - 35);
      const color = getDeviceColor(device.type);
      const symbol = getDeviceSymbol(device.type);

      parts.push(
        `<g transform="translate(${dx},${dy})">` +
          `<path d="${symbol}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>` +
          `</g>`,
      );
    }
  }

  // Legenda
  const legendY = totalHeight - 25;
  const legendItems: [string, DeviceType][] = [
    ["Pistorasia", "outlet"],
    ["Oma piiri", "outlet_dedicated"],
    ["Kytkin", "switch"],
    ["Valaisin", "light_ceiling"],
    ["Palovaroitin", "smoke_detector"],
    ["Lattialäm.", "floor_heating"],
    ["EV-lataus", "ev_charger"],
  ];

  let lx = PADDING;
  for (const [label, type] of legendItems) {
    const color = getDeviceColor(type);
    parts.push(`<circle cx="${lx}" cy="${legendY}" r="3" fill="${color}"/>`);
    parts.push(
      `<text x="${lx + 6}" y="${legendY + 3}" fill="#64748b" font-size="7">${label}</text>`,
    );
    lx += label.length * 5 + 20;
  }

  // Disclaimer
  parts.push(
    `<text x="${totalWidth - PADDING}" y="${totalHeight - 5}" text-anchor="end" fill="#334155" font-size="6">Laskennallinen arvio — ei korvaa sähkösuunnittelijan työtä</text>`,
  );

  parts.push("</svg>");
  return parts.join("\n");
}

/** Yksinkertainen ruudukkoasettelu huoneille */
function calculateLayout(rooms: Room[]): {
  positions: Record<string, { x: number; y: number }>;
  totalWidth: number;
  totalHeight: number;
} {
  const positions: Record<string, { x: number; y: number }> = {};
  const cols = Math.ceil(Math.sqrt(rooms.length));
  let maxRowHeight = 0;
  let x = 0;
  let y = 0;
  let col = 0;
  let totalWidth = 0;

  const gap = 200; // 200mm gap

  for (const room of rooms) {
    if (col >= cols) {
      col = 0;
      x = 0;
      y += maxRowHeight + gap;
      maxRowHeight = 0;
    }

    positions[room.id] = { x, y };
    x += room.widthMm + gap;
    totalWidth = Math.max(totalWidth, x - gap);
    maxRowHeight = Math.max(maxRowHeight, room.depthMm);
    col++;
  }

  const totalHeight = y + maxRowHeight;
  return { positions, totalWidth, totalHeight };
}

function getRoomName(room: Room): string {
  return room.name || room.type;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
