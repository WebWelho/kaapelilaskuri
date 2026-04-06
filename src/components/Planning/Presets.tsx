"use client";

import type { Room } from "@/lib/planning_model/types";

interface PresetsProps {
  onSelect: (rooms: Room[], name: string) => void;
}

function r(
  id: string,
  type: Room["type"],
  name: string,
  areaM2: number,
  w: number,
  d: number,
): Room {
  return {
    id,
    type,
    name,
    areaM2,
    x: 0,
    y: 0,
    widthMm: w,
    depthMm: d,
    walls: [],
    doors: [],
    windows: [],
  };
}

const PRESETS: { name: string; desc: string; rooms: Room[] }[] = [
  {
    name: "Yksiö 30 m²",
    desc: "1h+kt+kph",
    rooms: [
      r("p1", "kitchen", "Keittiö", 6, 3000, 2000),
      r("p2", "living_room", "OH/MH", 16, 5000, 3200),
      r("p3", "bathroom", "KPH", 4, 2000, 2000),
      r("p4", "hallway", "Eteinen", 4, 2000, 2000),
    ],
  },
  {
    name: "Kaksio 45 m²",
    desc: "2h+kt+kph",
    rooms: [
      r("p1", "kitchen", "Keittiö", 8, 4000, 2000),
      r("p2", "living_room", "Olohuone", 18, 5000, 3600),
      r("p3", "bedroom", "MH", 12, 4000, 3000),
      r("p4", "bathroom", "KPH", 4, 2000, 2000),
      r("p5", "hallway", "Eteinen", 3, 2000, 1500),
    ],
  },
  {
    name: "Kolmio 75 m²",
    desc: "3h+kt+s+kph",
    rooms: [
      r("p1", "kitchen", "Keittiö", 10, 4000, 2500),
      r("p2", "living_room", "Olohuone", 22, 5500, 4000),
      r("p3", "bedroom", "MH1", 14, 4000, 3500),
      r("p4", "bedroom", "MH2", 10, 3300, 3000),
      r("p5", "bathroom", "KPH", 5, 2500, 2000),
      r("p6", "sauna", "Sauna", 4, 2000, 2000),
      r("p7", "hallway", "Eteinen", 6, 3000, 2000),
      r("p8", "wc", "WC", 2, 1500, 1300),
      r("p9", "storage", "Varasto", 2, 1500, 1300),
    ],
  },
  {
    name: "Omakotitalo 120 m²",
    desc: "4h+kt+s+at",
    rooms: [
      r("p1", "kitchen", "Keittiö", 12, 4000, 3000),
      r("p2", "living_room", "Olohuone", 28, 7000, 4000),
      r("p3", "bedroom", "MH1", 14, 4000, 3500),
      r("p4", "bedroom", "MH2", 11, 3500, 3100),
      r("p5", "bedroom", "MH3", 10, 3300, 3000),
      r("p6", "bathroom", "KPH", 6, 3000, 2000),
      r("p7", "sauna", "Sauna", 5, 2500, 2000),
      r("p8", "wc", "WC", 2, 1500, 1300),
      r("p9", "utility", "KHH", 6, 3000, 2000),
      r("p10", "hallway", "Eteinen", 8, 4000, 2000),
      r("p11", "technical", "Tekn.tila", 3, 2000, 1500),
      r("p12", "garage", "Autotalli", 15, 5000, 3000),
    ],
  },
];

export function Presets({ onSelect }: PresetsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          onClick={() => onSelect(preset.rooms, preset.name)}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-left transition-all hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] hover:shadow-[0_0_12px_var(--accent-glow)]"
        >
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {preset.name}
          </div>
          <div className="mt-0.5 text-xs text-[var(--text-muted)]">
            {preset.desc} · {preset.rooms.length} huonetta
          </div>
        </button>
      ))}
    </div>
  );
}
