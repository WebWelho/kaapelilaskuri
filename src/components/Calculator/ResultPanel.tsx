"use client";

import type { CalcResult } from "@/lib/electrical";

function StatCard({
  label,
  value,
  unit,
  color = "blue",
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: "blue" | "green" | "amber" | "red";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    green:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    amber:
      "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
    red: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono">{value}</span>
        {unit && (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function ResultPanel({ result }: { result: CalcResult }) {
  const vdColor = !result.voltageDropOk
    ? "red"
    : result.voltageDropPercent > result.voltageDropLimit * 0.8
      ? "amber"
      : "green";

  return (
    <div className="space-y-6">
      {/* Päätulokset */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Kuormitusvirta"
          value={result.currentA.toFixed(1)}
          unit="A"
        />
        <StatCard
          label="Sulakekoko"
          value={result.fuseA}
          unit="A"
          color="blue"
        />
        <StatCard
          label="Kaapelipoikkipinta"
          value={result.crossSectionMm2}
          unit="mm²"
          color="green"
        />
        <StatCard
          label="Jännitteenalenema"
          value={result.voltageDropPercent.toFixed(2)}
          unit={`% (max ${result.voltageDropLimit}%)`}
          color={vdColor}
        />
      </div>

      {/* Kaapelisuositus */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Kaapelisuositus
        </h3>
        <p className="mt-2 text-xl font-bold font-mono">
          {result.cableDescription}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Kaapelityyppi: {result.cableType} — Kuormitettavuus:{" "}
          {result.actualCapacityA} A
        </p>
      </div>

      {/* Korjauskertoimet */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Korjauskertoimet
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Lämpötilakerroin
          </span>
          <span className="font-mono font-medium">
            {result.tempCorrectionFactor.toFixed(3)}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Ryhmityskerroin
          </span>
          <span className="font-mono font-medium">
            {result.groupCorrectionFactor.toFixed(3)}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Korjattu vaatimus
          </span>
          <span className="font-mono font-medium">
            {result.correctedCapacityA.toFixed(1)} A
          </span>
        </div>
      </div>

      {/* Varoitukset */}
      {result.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Huomautukset
          </h3>
          <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
            {result.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Laskelma perustuu SFS 6000 -standardin taulukoihin (kupari, PVC).
        Tarkista aina lopullinen mitoitus standardikirjasta. Työkalu ei korvaa
        sähkösuunnittelijan ammattitaitoa.
      </p>
    </div>
  );
}
