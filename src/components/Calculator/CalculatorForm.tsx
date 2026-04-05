"use client";

import { useState, useMemo, useCallback } from "react";
import type { CalcInput, CalcResult } from "@/lib/electrical";
import type {
  InstallMethod,
  Phase,
  LoadType,
  ProtectionType,
} from "@/lib/electrical/types";
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

const INSTALL_METHODS: {
  key: InstallMethod;
  label: string;
  desc: string;
}[] = [
  { key: "A1", label: "A1", desc: "Putki eristeseinässä" },
  { key: "A2", label: "A2", desc: "Kaapeli putki/seinä" },
  { key: "B1", label: "B1", desc: "Putki seinällä" },
  { key: "B2", label: "B2", desc: "Kaapeli putki/seinä" },
  { key: "C", label: "C", desc: "Seinäpinnalla" },
  { key: "D1", label: "D1", desc: "Maassa" },
  { key: "D2", label: "D2", desc: "Putki maassa" },
  { key: "E", label: "E", desc: "Vapaassa ilmassa" },
  { key: "F", label: "F", desc: "Hylly (koskettaen)" },
  { key: "G", label: "G", desc: "Hylly (välimatkalla)" },
];

const PROTECTION_OPTIONS: {
  key: ProtectionType;
  label: string;
  desc: string;
}[] = [
  { key: "gG", label: "gG", desc: "Kahvasulake" },
  { key: "MCB-B", label: "B", desc: "Yleiskäyttö" },
  { key: "MCB-C", label: "C", desc: "Moottorit" },
  { key: "MCB-D", label: "D", desc: "Muuntajat" },
  { key: "MCB-K", label: "K", desc: "Teollisuus" },
];

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
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Yleisimmät kuormat
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRESETS.map((preset) => {
            const active = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset)}
                className={`group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? "border-[var(--border-accent)] bg-[var(--bg-card-hover)] shadow-[0_0_16px_var(--accent-glow)]"
                    : "border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <span className="text-xl leading-none">{preset.icon}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {preset.name}
                  </div>
                  <div className="truncate font-mono text-xs text-[var(--text-muted)]">
                    {(preset.input.powerW ?? 0) / 1000} kW
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Lomake */}
        <div className="space-y-5">
          {/* 1. Kuorma */}
          <Card number={1} title="Kuorma">
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Teho (kW)">
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
                  className="input-field font-mono text-lg font-semibold"
                />
              </InputField>

              {/* Vaihe toggle */}
              <InputField label="Vaihe">
                <div className="flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-1">
                  {(["1-phase", "3-phase"] as Phase[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        update({ phase: p });
                        setActivePreset(null);
                      }}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        input.phase === p
                          ? "bg-[var(--bg-card-hover)] text-[var(--text-accent)] shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {p === "1-phase" ? "1-vaihe" : "3-vaihe"}
                    </button>
                  ))}
                </div>
              </InputField>

              <InputField label="Tehokerroin (cos φ)">
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
                  className="input-field font-mono"
                />
              </InputField>

              {/* ΔU raja toggle */}
              <InputField label="ΔU raja">
                <div className="flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-input)] p-1">
                  {(["general", "lighting"] as LoadType[]).map((lt) => (
                    <button
                      key={lt}
                      onClick={() => {
                        update({ loadType: lt });
                        setActivePreset(null);
                      }}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        input.loadType === lt
                          ? "bg-[var(--bg-card-hover)] text-[var(--text-accent)] shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {lt === "general" ? "5 %" : "3 %"}
                    </button>
                  ))}
                </div>
              </InputField>
            </div>
          </Card>

          {/* 2. Suojalaite */}
          <Card number={2} title="Suojalaite">
            <div className="grid grid-cols-5 gap-2">
              {PROTECTION_OPTIONS.map(({ key, label, desc }) => {
                const active = input.protectionType === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      update({ protectionType: key });
                      setActivePreset(null);
                    }}
                    className={`rounded-xl border px-2 py-3 text-center transition-all ${
                      active
                        ? "border-[var(--border-accent)] bg-[var(--bg-card-hover)] shadow-[0_0_12px_var(--accent-glow)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-input)] hover:border-[var(--border-medium)]"
                    }`}
                  >
                    <div
                      className={`font-mono text-base font-bold ${active ? "text-[var(--text-accent)]" : "text-[var(--text-primary)]"}`}
                    >
                      {label}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 3. Asennus */}
          <Card number={3} title="Asennustapa">
            <div className="mb-4 grid grid-cols-5 gap-2">
              {INSTALL_METHODS.map(({ key, label, desc }) => {
                const active = input.installMethod === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      update({ installMethod: key });
                      setActivePreset(null);
                    }}
                    className={`rounded-xl border px-1.5 py-2 text-center transition-all ${
                      active
                        ? "border-[var(--border-accent)] bg-[var(--bg-card-hover)] shadow-[0_0_12px_var(--accent-glow)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-input)] hover:border-[var(--border-medium)]"
                    }`}
                  >
                    <div
                      className={`font-mono text-xs font-bold ${active ? "text-[var(--text-accent)]" : "text-[var(--text-primary)]"}`}
                    >
                      {label}
                    </div>
                    <div className="mt-0.5 text-[9px] leading-tight text-[var(--text-muted)]">
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <InputField label="Pituus (m)">
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
                  className="input-field font-mono"
                />
              </InputField>
              <InputField label="Lämpötila (°C)">
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
                  className="input-field font-mono"
                />
              </InputField>
              <InputField label="Piirit">
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
                  className="input-field font-mono"
                />
              </InputField>
            </div>
          </Card>
        </div>

        {/* Tulokset */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {result.error && (
            <div className="rounded-2xl border border-[var(--text-warn)]/30 bg-[var(--text-warn)]/5 p-5 text-sm">
              <div className="font-semibold text-[var(--text-warn)]">Virhe</div>
              <p className="mt-1 text-[var(--text-secondary)]">
                {result.error}
              </p>
            </div>
          )}
          {result.data && <ResultPanel result={result.data} />}
          {!result.data && !result.error && (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[var(--border-medium)]">
              <p className="text-center text-sm text-[var(--text-muted)]">
                Syötä teho ja asennus&shy;parametrit
                <br />
                <span className="text-xs">
                  tulos päivittyy reaaliaikaisesti
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function Card({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <h3 className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-[var(--text-secondary)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--text-accent)]/10 font-mono text-xs font-bold text-[var(--text-accent)]">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InputField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
