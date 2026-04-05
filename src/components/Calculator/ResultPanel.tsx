"use client";

import type { CalcResult } from "@/lib/electrical";

function BigStat({
  label,
  value,
  unit,
  variant = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "border-[var(--border)] bg-[var(--surface)]",
    success: "border-[color:var(--success)]/30 bg-[var(--success-light)]",
    warning: "border-[color:var(--warning)]/30 bg-[var(--warning-light)]",
    danger: "border-[color:var(--danger)]/30 bg-[var(--danger-light)]",
  };

  return (
    <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
      <div className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[var(--muted)]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function ResultPanel({ result }: { result: CalcResult }) {
  const vdVariant = !result.voltageDropOk
    ? "danger"
    : result.voltageDropPercent > result.voltageDropLimit * 0.8
      ? "warning"
      : "success";

  return (
    <div className="space-y-4">
      {/* Pääkaapeli — iso kortti */}
      <div className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent-light)] p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-dark)]">
          Kaapelisuositus
        </div>
        <div className="mt-2 font-mono text-2xl font-bold sm:text-3xl">
          {result.cableDescription}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface)] px-2.5 py-1 font-medium">
            {result.protectionDescription}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface)] px-2.5 py-1 text-[var(--muted)]">
            {result.cableType} · {result.actualCapacityA} A kuormitettavuus
          </span>
        </div>
      </div>

      {/* Avainluvut */}
      <div className="grid grid-cols-2 gap-3">
        <BigStat
          label="Kuormitusvirta"
          value={result.currentA.toFixed(1)}
          unit="A"
        />
        <BigStat
          label="Suojalaite"
          value={result.protectionDescription}
          variant="default"
        />
        <BigStat
          label="Poikkipinta"
          value={result.crossSectionMm2}
          unit="mm²"
          variant="success"
        />
        <BigStat
          label="Jännitteenalenema"
          value={result.voltageDropPercent.toFixed(2)}
          unit={`% / ${result.voltageDropLimit}%`}
          variant={vdVariant}
        />
      </div>

      {/* Korjauskertoimet */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Korjauskertoimet
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {result.tempCorrectionFactor.toFixed(2)}
            </div>
            <div className="text-xs text-[var(--muted)]">Lämpötila</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {result.groupCorrectionFactor.toFixed(2)}
            </div>
            <div className="text-xs text-[var(--muted)]">Ryhmitys</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold tabular-nums">
              {result.correctedCapacityA.toFixed(1)}
            </div>
            <div className="text-xs text-[var(--muted)]">Vaatimus (A)</div>
          </div>
        </div>
      </div>

      {/* Varoitukset */}
      {result.warnings.length > 0 && (
        <div className="rounded-2xl border border-[color:var(--warning)]/30 bg-[var(--warning-light)] p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--warning)]">
            Huomautukset
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        Laskelma perustuu SFS 6000 -standardin taulukoihin (kupari, PVC-eristys,
        70 °C). Tarkista aina lopullinen mitoitus standardikirjasta. Työkalu ei
        korvaa sähkösuunnittelijan ammattitaitoa.
      </p>
    </div>
  );
}
