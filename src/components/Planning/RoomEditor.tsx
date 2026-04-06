"use client";

import { useState } from "react";
import type { Room, RoomType } from "@/lib/planning_model/types";
import { ROOM_REQUIREMENTS } from "@/lib/planning_rules/room-requirements";

const ROOM_TYPES: { key: RoomType; label: string; icon: string }[] = [
  { key: "kitchen", label: "Keittiö", icon: "🍳" },
  { key: "living_room", label: "Olohuone", icon: "🛋" },
  { key: "bedroom", label: "Makuuhuone", icon: "🛏" },
  { key: "bathroom", label: "Kylpyhuone", icon: "🚿" },
  { key: "sauna", label: "Sauna", icon: "🧖" },
  { key: "wc", label: "WC", icon: "🚽" },
  { key: "utility", label: "KHH", icon: "🧺" },
  { key: "hallway", label: "Eteinen", icon: "🚪" },
  { key: "office", label: "Työhuone", icon: "💻" },
  { key: "garage", label: "Autotalli", icon: "🚗" },
  { key: "storage", label: "Varasto", icon: "📦" },
  { key: "technical", label: "Tekn.tila", icon: "⚡" },
  { key: "balcony", label: "Parveke", icon: "🌿" },
  { key: "laundry", label: "Pesutupa", icon: "🫧" },
];

interface RoomEditorProps {
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
}

export function RoomEditor({ rooms, onRoomsChange }: RoomEditorProps) {
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<RoomType>("bedroom");
  const [newName, setNewName] = useState("");
  const [newArea, setNewArea] = useState(12);

  const addRoom = () => {
    if (!newName.trim()) return;
    const side = Math.sqrt(newArea) * 1000;
    const room: Room = {
      id: `room-${Date.now()}`,
      type: newType,
      name: newName.trim(),
      areaM2: newArea,
      x: 0,
      y: 0,
      widthMm: Math.round(side * 1.2),
      depthMm: Math.round(side / 1.2),
      walls: [],
      doors: [],
      windows: [],
    };
    onRoomsChange([...rooms, room]);
    setNewName("");
    setAdding(false);
  };

  const removeRoom = (id: string) => {
    onRoomsChange(rooms.filter((r) => r.id !== id));
  };

  const totalArea = rooms.reduce((sum, r) => sum + r.areaM2, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
            Huoneet
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {rooms.length} huonetta · {totalArea} m²
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-lg border border-[var(--border-accent)] px-3 py-1.5 text-xs font-medium text-[var(--text-accent)] transition-all hover:bg-[var(--bg-card-hover)]"
        >
          + Lisää huone
        </button>
      </div>

      {/* Lisää huone */}
      {adding && (
        <div className="rounded-xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-4 space-y-3">
          {/* Huonetyypin valinta */}
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
            {ROOM_TYPES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setNewType(key);
                  if (!newName) setNewName(label);
                }}
                className={`rounded-lg border px-1.5 py-2 text-center transition-all ${
                  newType === key
                    ? "border-[var(--border-accent)] bg-[var(--bg-card-hover)] shadow-[0_0_10px_var(--accent-glow)]"
                    : "border-[var(--border-subtle)] hover:border-[var(--border-medium)]"
                }`}
              >
                <div className="text-base">{icon}</div>
                <div className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                  {label}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--text-muted)]">
                Nimi
              </span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRoom()}
                className="input-field"
                placeholder="esim. MH1"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--text-muted)]">
                Pinta-ala (m²)
              </span>
              <input
                type="number"
                min="1"
                max="200"
                value={newArea}
                onChange={(e) => setNewArea(parseInt(e.target.value) || 1)}
                className="input-field font-mono"
              />
            </label>
          </div>

          <button
            onClick={addRoom}
            className="w-full rounded-lg bg-[var(--text-accent)] py-2 text-sm font-semibold text-[var(--bg-base)]"
          >
            Lisää {ROOM_REQUIREMENTS[newType]?.nameFi ?? newType}
          </button>
        </div>
      )}

      {/* Huonelista */}
      <div className="space-y-1.5">
        {rooms.map((room) => {
          const req = ROOM_REQUIREMENTS[room.type];
          const icon =
            ROOM_TYPES.find((t) => t.key === room.type)?.icon ?? "📐";
          return (
            <div
              key={room.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2"
            >
              <span className="text-lg">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {room.name}
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {req?.nameFi} · {room.areaM2} m² · {req?.devices.length ?? 0}{" "}
                  pistettä min
                </div>
              </div>
              <button
                onClick={() => removeRoom(room.id)}
                className="text-xs text-[var(--text-muted)] hover:text-red-400"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {rooms.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed border-[var(--border-medium)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Lisää huoneita tai käytä valmista pohjaa
          </p>
        </div>
      )}
    </div>
  );
}
