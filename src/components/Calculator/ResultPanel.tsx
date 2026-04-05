"use client";

import type { CalcInput, CalcResult } from "@/lib/electrical";
import { generateReport } from "@/lib/pdf/generate-report";

function GlowDot({ color }: { color: "cyan" | "green" | "amber" | "red" }) {
  const styles = {
    cyan: "bg-[var(--text-accent)] shadow-[0_0_8px_var(--accent-glow)]",
    green: "bg-[var(--text-success)] shadow-[0_0_8px_rgba(52,211,153,0.4)]",
    amber: "bg-[var(--text-warn)] shadow-[0_0_8px_rgba(255,159,67,0.4)]",
    red: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${styles[color]}`} />
  );
}

function BigStat({
  label,
  value,
  unit,
  glow = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        glow
          ? "border-[var(--border-accent)] bg-[var(--bg-card-hover)] shadow-[0_0_20px_var(--accent-glow)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-card)]"
      }`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[var(--text-muted)]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "ok" | "warn" | "error";
}) {
  const dot =
    status === "ok"
      ? "green"
      : status === "warn"
        ? "amber"
        : status === "error"
          ? "red"
          : null;
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="flex items-center gap-2 font-mono text-sm font-medium text-[var(--text-primary)]">
        {dot && <GlowDot color={dot} />}
        {value}
      </span>
    </div>
  );
}

export function ResultPanel({
  input,
  result,
}: {
  input: CalcInput;
  result: CalcResult;
}) {
  const vdStatus: "ok" | "warn" | "error" = !result.voltageDropOk
    ? "error"
    : result.voltageDropPercent > result.voltageDropLimit * 0.8
      ? "warn"
      : "ok";

  return (
    <div className="space-y-4">
      {/* Kaapelisuositus — pääkortti */}
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-5 shadow-[0_0_30px_var(--accent-glow)]">
        <div className="flex items-center gap-2">
          <GlowDot color="cyan" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-accent)]">
            Kaapelisuositus
          </span>
        </div>
        <div className="mt-3 font-mono text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          {result.cableDescription}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
            {result.protectionDescription}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
            {result.cableType} · {result.actualCapacityA} A
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
            {result.conductorMaterial === "aluminium" ? "Al" : "Cu"} ·{" "}
            {result.insulationType}
          </span>
        </div>
      </div>

      {/* Avainluvut */}
      <div className="grid grid-cols-2 gap-3">
        <BigStat label="Sulake" value={`${result.fuseA} A`} glow />
        <BigStat label="Kaapeli" value={`${result.crossSectionMm2} mm²`} glow />
      </div>

      {/* Yksityiskohdat */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div className="divide-y divide-[var(--border-subtle)]">
          <DetailRow
            label="Kuormitusvirta"
            value={`${result.currentA.toFixed(1)} A`}
          />
          <DetailRow
            label="Jännitteenalenema"
            value={`${result.voltageDropPercent.toFixed(2)} % / ${result.voltageDropLimit} %`}
            status={vdStatus}
          />
          <DetailRow
            label="Lämpötilakerroin"
            value={result.tempCorrectionFactor.toFixed(2)}
            status={result.tempCorrectionFactor < 1 ? "warn" : "ok"}
          />
          <DetailRow
            label="Ryhmityskerroin"
            value={result.groupCorrectionFactor.toFixed(2)}
            status={result.groupCorrectionFactor < 1 ? "warn" : "ok"}
          />
          <DetailRow
            label="Korjattu vaatimus"
            value={`${result.correctedCapacityA.toFixed(1)} A`}
          />
          <DetailRow
            label="Kuormitettavuus"
            value={`${result.actualCapacityA} A`}
            status={
              result.actualCapacityA >= result.correctedCapacityA
                ? "ok"
                : "error"
            }
          />
        </div>
      </div>

      {/* Oikosulkuvirtatarkistus */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <div className="flex items-center gap-2 pb-2">
          <GlowDot color={result.faultCurrentOk ? "green" : "red"} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Oikosulkuvirtatarkistus
          </span>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          <DetailRow
            label="Oikosulkuvirta (Ik min)"
            value={`${result.faultCurrentA.toFixed(0)} A`}
            status={result.faultCurrentOk ? "ok" : "error"}
          />
          <DetailRow
            label="Vaadittu laukaisu"
            value={`${result.requiredFaultCurrentA} A`}
          />
          <DetailRow
            label="Silmukkaimpedanssi (Zs)"
            value={`${result.totalLoopImpedanceOhm.toFixed(3)} \u03A9`}
          />
          <DetailRow
            label="Kaapelin impedanssi"
            value={`${result.cableLoopImpedanceOhm.toFixed(3)} \u03A9`}
          />
        </div>
      </div>

      {/* Varoitukset */}
      {result.warnings.length > 0 && (
        <div className="rounded-2xl border border-[var(--text-warn)]/20 bg-[var(--text-warn)]/5 p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-warn)]">
            <GlowDot color="amber" />
            Huomautukset
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">
            {result.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-[var(--text-warn)]">!</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PDF-tuloste */}
      <button
        onClick={() => generateReport(input, result)}
        className="w-full rounded-xl border border-[var(--border-accent)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-accent)] transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-[0_0_16px_var(--accent-glow)]"
      >
        Lataa PDF-raportti
      </button>

      {/* SFS viittaus */}
      <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">
        SFS 6000 · kupari · PVC 70 °C · Tarkista aina lopullinen mitoitus
        standardikirjasta.
      </p>
    </div>
  );
}
