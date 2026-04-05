"use client";

import { useState, useMemo, useCallback } from "react";
import type { CalcInput, CalcResult } from "@/lib/electrical";
import type {
  InstallMethod,
  Phase,
  LoadType,
  ProtectionType,
} from "@/lib/electrical/types";
import {
  INSTALL_METHOD_DESCRIPTIONS,
  PROTECTION_DESCRIPTIONS,
} from "@/lib/electrical/constants";
import { calculate } from "@/lib/electrical";
import { PRESETS, type Preset } from "@/lib/electrical/presets";
import { ResultPanel } from "./ResultPanel";

const DEFAULT_INPUT: CalcInput = {
  powerW: 20000,
  phase: "3-phase",
  cosPhi: 1.0,
  installMethod: "C",
  cableLengthM: 30,
  ambientTempC: 25,
  groupedCircuits: 1,
  loadType: "general",
  protectionType: "gG",
};

const INSTALL_METHOD_ICONS: Record<InstallMethod, string> = {
  A1: "⬜",
  A2: "⬜",
  B1: "🧱",
  B2: "🧱",
  C: "📎",
  D1: "🌍",
  D2: "🌍",
  E: "🌬️",
  F: "🔩",
  G: "🔩",
};

const INSTALL_METHOD_SHORT: Record<InstallMethod, string> = {
  A1: "Putki eristeseinässä",
  A2: "Kaapeli putki/seinä",
  B1: "Putki seinällä",
  B2: "Kaapeli putki/seinä",
  C: "Seinäpinnalla",
  D1: "Maassa",
  D2: "Putki maassa",
  E: "Vapaassa ilmassa",
  F: "Hylly (koskettaen)",
  G: "Hylly (välimatkalla)",
};

export function CalculatorForm() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const update = useCallback((changes: Partial<CalcInput>) => {
    setInput((prev) => ({ ...prev, ...changes }));
  }, []);

  const handlePreset = useCallback((preset: Preset) => {
    setActivePreset(preset.id);
    setInput((prev) => ({
      ...prev,
      ...preset.input,
    }));
  }, []);

  const result = useMemo<{
    data: CalcResult | null;
    error: string | null;
  }>(() => {
    if (input.powerW <= 0) return { data: null, error: null };
    if (input.cosPhi <= 0 || input.cosPhi > 1)
      return { data: null, error: "Tehokerroin 0.1–1.0" };
    if (input.cableLengthM <= 0)
      return { data: null, error: "Kaapelin pituus > 0" };

    try {
      return { data: calculate(input), error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Tuntematon virhe",
      };
    }
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Presetit */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Yleisimmät kuormat
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                activePreset === preset.id
                  ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-sm"
              }`}
            >
              <span className="text-xl leading-none">{preset.icon}</span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {preset.name}
                </div>
                <div className="truncate text-xs text-[var(--muted)]">
                  {(preset.input.powerW ?? 0) / 1000} kW
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Lomake */}
        <div className="space-y-5">
          {/* Kuorma */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-light)] text-xs font-bold text-[var(--accent-dark)]">
                1
              </span>
              Kuorma
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Teho (kW)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  step="0.1"
                  value={input.powerW / 1000 || ""}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    update({ powerW: isNaN(v) ? 0 : v * 1000 });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-mono text-lg font-semibold tabular-nums focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Vaihe</span>
                <select
                  value={input.phase}
                  onChange={(e) => {
                    update({ phase: e.target.value as Phase });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                >
                  <option value="3-phase">3-vaihe (400 V)</option>
                  <option value="1-phase">1-vaihe (230 V)</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Tehokerroin (cos φ)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={input.cosPhi}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    update({ cosPhi: isNaN(v) ? 1.0 : v });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-mono tabular-nums focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Kuormatyyppi
                </span>
                <select
                  value={input.loadType}
                  onChange={(e) => {
                    update({ loadType: e.target.value as LoadType });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                >
                  <option value="general">Yleinen (max 5% ΔU)</option>
                  <option value="lighting">Valaistus (max 3% ΔU)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Suojalaite */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-light)] text-xs font-bold text-[var(--accent-dark)]">
                2
              </span>
              Suojalaite
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                Object.entries(PROTECTION_DESCRIPTIONS) as [
                  ProtectionType,
                  string,
                ][]
              ).map(([key, desc]) => (
                <button
                  key={key}
                  onClick={() => {
                    update({ protectionType: key });
                    setActivePreset(null);
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                    input.protectionType === key
                      ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--accent)]"
                  }`}
                >
                  <div className="text-sm font-semibold">
                    {key === "gG" ? "gG" : key.replace("MCB-", "")}
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--muted)]">
                    {key === "gG"
                      ? "Kahvasulake"
                      : desc.replace(/.*\(/, "").replace(")", "")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Asennus */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-light)] text-xs font-bold text-[var(--accent-dark)]">
                3
              </span>
              Asennus
            </h3>

            {/* Asennustapavalitsin */}
            <div className="mb-4">
              <span className="mb-2 block text-sm font-medium">
                Asennustapa
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {(Object.keys(INSTALL_METHOD_SHORT) as InstallMethod[]).map(
                  (key) => (
                    <button
                      key={key}
                      onClick={() => {
                        update({ installMethod: key });
                        setActivePreset(null);
                      }}
                      className={`rounded-xl border px-2 py-2 text-center transition-all ${
                        input.installMethod === key
                          ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-sm"
                          : "border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--accent)]"
                      }`}
                    >
                      <div className="text-base leading-none">
                        {INSTALL_METHOD_ICONS[key]}
                      </div>
                      <div className="mt-1 text-xs font-bold">{key}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-[var(--muted)]">
                        {INSTALL_METHOD_SHORT[key]}
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Pituus (m)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={input.cableLengthM || ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    update({ cableLengthM: isNaN(v) ? 0 : v });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-mono tabular-nums focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Lämpötila (°C)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="10"
                  max="60"
                  step="5"
                  value={input.ambientTempC}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    update({ ambientTempC: isNaN(v) ? 25 : v });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-mono tabular-nums focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  Vierekkäiset piirit
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="20"
                  step="1"
                  value={input.groupedCircuits}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    update({ groupedCircuits: isNaN(v) ? 1 : v });
                    setActivePreset(null);
                  }}
                  className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 font-mono tabular-nums focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] focus:outline-none"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Tulokset */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          {result.error && (
            <div className="rounded-2xl border border-[var(--danger)] bg-[var(--danger-light)] p-5 text-sm">
              <div className="font-semibold text-[var(--danger)]">Virhe</div>
              <p className="mt-1">{result.error}</p>
            </div>
          )}
          {result.data && <ResultPanel result={result.data} />}
          {!result.data && !result.error && (
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)]">
              <p className="text-center text-sm text-[var(--muted)]">
                Syötä teho ja asennus&shy;parametrit
                <br />
                niin tulos päivittyy reaaliaikaisesti
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
