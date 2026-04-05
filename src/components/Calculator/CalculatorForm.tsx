"use client";

import { useState } from "react";
import type { CalcInput, CalcResult } from "@/lib/electrical";
import type { InstallMethod, Phase, LoadType } from "@/lib/electrical/types";
import { INSTALL_METHOD_DESCRIPTIONS } from "@/lib/electrical/constants";
import { calculate } from "@/lib/electrical";
import { ResultPanel } from "./ResultPanel";

const DEFAULT_INPUT: CalcInput = {
  powerW: 20000,
  phase: "3-phase",
  cosPhi: 1.0,
  installMethod: "C",
  cableLengthM: 30,
  ambientTempC: 30,
  groupedCircuits: 1,
  loadType: "general",
};

export function CalculatorForm() {
  const [input, setInput] = useState<CalcInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof CalcInput, value: string | number) {
    setInput((prev) => ({ ...prev, [field]: value }));
  }

  function handleNumber(field: keyof CalcInput, raw: string, multiplier = 1) {
    const parsed = parseFloat(raw);
    handleChange(field, isNaN(parsed) ? 0 : parsed * multiplier);
  }

  function handleInt(field: keyof CalcInput, raw: string) {
    const parsed = parseInt(raw, 10);
    handleChange(field, isNaN(parsed) ? 1 : parsed);
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (input.powerW <= 0) {
      setError("Teho pitää olla suurempi kuin 0");
      setResult(null);
      return;
    }
    if (input.cosPhi <= 0 || input.cosPhi > 1) {
      setError("Tehokerroin pitää olla välillä 0.1–1.0");
      setResult(null);
      return;
    }
    if (input.cableLengthM <= 0) {
      setError("Kaapelin pituus pitää olla suurempi kuin 0");
      setResult(null);
      return;
    }

    try {
      const res = calculate(input);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe");
      setResult(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Teho */}
        <fieldset className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <legend className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Kuorma
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Teho (kW)</span>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={input.powerW / 1000}
                onChange={(e) => handleNumber("powerW", e.target.value, 1000)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Vaihejärjestelmä</span>
              <select
                value={input.phase}
                onChange={(e) => handleChange("phase", e.target.value as Phase)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="3-phase">3-vaihe (400 V)</option>
                <option value="1-phase">1-vaihe (230 V)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Tehokerroin (cos φ)</span>
              <input
                type="number"
                min="0.1"
                max="1.0"
                step="0.05"
                value={input.cosPhi}
                onChange={(e) => handleNumber("cosPhi", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kuormatyyppi</span>
              <select
                value={input.loadType}
                onChange={(e) =>
                  handleChange("loadType", e.target.value as LoadType)
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="general">Yleinen (max 5% ΔU)</option>
                <option value="lighting">Valaistus (max 3% ΔU)</option>
              </select>
            </label>
          </div>
        </fieldset>

        {/* Asennus */}
        <fieldset className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <legend className="px-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Asennus
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Asennustapa</span>
              <select
                value={input.installMethod}
                onChange={(e) =>
                  handleChange("installMethod", e.target.value as InstallMethod)
                }
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              >
                {(
                  Object.entries(INSTALL_METHOD_DESCRIPTIONS) as [
                    InstallMethod,
                    string,
                  ][]
                ).map(([key, desc]) => (
                  <option key={key} value={key}>
                    {key} — {desc}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kaapelin pituus (m)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={input.cableLengthM}
                onChange={(e) => handleInt("cableLengthM", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">
                Ympäristölämpötila (°C)
              </span>
              <input
                type="number"
                min="10"
                max="60"
                step="5"
                value={input.ambientTempC}
                onChange={(e) => handleInt("ambientTempC", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">
                Vierekkäiset piirit (kpl)
              </span>
              <input
                type="number"
                min="1"
                max="20"
                step="1"
                value={input.groupedCircuits}
                onChange={(e) => handleInt("groupedCircuits", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"
        >
          Laske mitoitus
        </button>
      </form>

      <div>
        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}
        {result && <ResultPanel result={result} />}
      </div>
    </div>
  );
}
