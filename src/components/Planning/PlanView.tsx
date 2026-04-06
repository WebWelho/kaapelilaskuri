"use client";

import { useMemo } from "react";
import type { ElectricalPlan } from "@/lib/planning_model/types";
import { renderPlanToSvg } from "@/lib/planning_renderer/svg-renderer";
import { summarizePlan } from "@/lib/planning_engine/planner";
import { preparePdfData } from "@/lib/planning_renderer/pdf-export";
import { jsPDF } from "jspdf";

interface PlanViewProps {
  plan: ElectricalPlan;
}

export function PlanView({ plan }: PlanViewProps) {
  const svg = useMemo(() => renderPlanToSvg(plan), [plan]);
  const summary = useMemo(() => summarizePlan(plan), [plan]);

  const downloadPdf = () => {
    const data = preparePdfData(plan);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Otsikko
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(data.title, margin, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(data.subtitle, margin, y);
    doc.text(data.date, pageWidth - margin, y, { align: "right" });
    y += 6;
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Sektiot
    const drawSection = (section: {
      title: string;
      rows: [string, string][];
    }) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(8);
      doc.setTextColor(34, 211, 238);
      doc.text(section.title, margin, y);
      y += 5;
      doc.setFontSize(9);
      for (const [label, value] of section.rows) {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin + 2, y);
        doc.setTextColor(15, 23, 42);
        doc.text(value, pageWidth - margin - 2, y, { align: "right" });
        y += 4.5;
      }
      y += 3;
    };

    drawSection(data.summary);
    drawSection(data.circuits);
    for (const room of data.rooms) {
      drawSection(room);
    }

    // Huomiot
    if (data.notes.length > 0) {
      if (y > 260) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(8);
      doc.setTextColor(34, 211, 238);
      doc.text("HUOMIOT", margin, y);
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      for (const note of data.notes) {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }
        const lines = doc.splitTextToSize(`- ${note}`, contentWidth - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 3.5;
      }
    }

    // Disclaimer
    y = doc.internal.pageSize.getHeight() - 12;
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(data.disclaimer, margin, y, { maxWidth: contentWidth });

    doc.save(
      `sahkosuunnitelma_${plan.floorPlan.rooms.length}h_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  return (
    <div className="space-y-4">
      {/* Yhteenveto */}
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-5 shadow-[0_0_30px_var(--accent-glow)]">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          <Stat label="Pisteitä" value={plan.devices.length} />
          <Stat label="Piirejä" value={plan.circuits.length} />
          <Stat label="Pääsulake" value={`${plan.mainFuseA}A`} />
          <Stat
            label="Kuorma"
            value={`${(plan.totalLoadW / 1000).toFixed(0)}kW`}
          />
          <Stat label="Huoneita" value={plan.floorPlan.rooms.length} />
          <Stat label="Pinta-ala" value={`${plan.floorPlan.totalAreaM2}m²`} />
        </div>
      </div>

      {/* SVG-pohjapiirros */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 overflow-x-auto">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      {/* Piiriluettelo */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Piiriluettelo
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--text-muted)]">
                <th className="pb-2 pr-2 font-medium">#</th>
                <th className="pb-2 pr-2 font-medium">Piiri</th>
                <th className="pb-2 pr-2 font-medium">Suojaus</th>
                <th className="pb-2 pr-2 font-medium">Kaapeli</th>
                <th className="pb-2 pr-2 font-medium">Kuorma</th>
                <th className="pb-2 font-medium">Lait.</th>
              </tr>
            </thead>
            <tbody>
              {plan.circuits.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--border-subtle)]"
                >
                  <td className="py-1.5 pr-2 font-mono text-xs text-[var(--text-muted)]">
                    {c.groupNumber}
                  </td>
                  <td className="py-1.5 pr-2 text-[var(--text-primary)]">
                    {c.name}
                  </td>
                  <td className="py-1.5 pr-2 font-mono text-xs text-[var(--text-secondary)]">
                    {c.protectionType} {c.fuseA}A
                  </td>
                  <td className="py-1.5 pr-2 font-mono text-xs text-[var(--text-secondary)]">
                    {c.cableType} {c.crossSectionMm2}mm²
                  </td>
                  <td className="py-1.5 pr-2 font-mono text-xs text-[var(--text-secondary)]">
                    {(c.totalLoadW / 1000).toFixed(1)} kW
                  </td>
                  <td className="py-1.5 font-mono text-xs text-[var(--text-muted)]">
                    {c.deviceIds.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Huomiot */}
      {plan.notes.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Huomiot ({plan.notes.length})
          </h3>
          <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
            {plan.notes.map((n, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="shrink-0 text-[var(--text-accent)]">-</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toiminnot */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadPdf}
          className="rounded-xl border border-[var(--border-accent)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-accent)] transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-[0_0_16px_var(--accent-glow)]"
        >
          Lataa PDF
        </button>
        <button
          onClick={() => {
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sahkosuunnitelma_${plan.floorPlan.rooms.length}h.svg`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-card-hover)]"
        >
          Lataa SVG
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] leading-relaxed text-[var(--text-muted)]">
        Laskennallinen arvio — ei korvaa standardikirjaa tai pätevän
        sähkösuunnittelijan työtä. Perustuu SFS 6000:2017 julkisiin
        periaatteisiin.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="font-mono text-lg font-bold text-[var(--text-primary)]">
        {value}
      </div>
      <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
