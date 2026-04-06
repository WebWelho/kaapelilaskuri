"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Room, FloorPlan } from "@/lib/planning_model/types";
import { generateElectricalPlan } from "@/lib/planning_engine/planner";
import { RoomEditor } from "@/components/Planning/RoomEditor";
import { PlanView } from "@/components/Planning/PlanView";
import { Presets } from "@/components/Planning/Presets";
import { ImageAnalyzer } from "@/components/Planning/ImageAnalyzer";
import { CacheBuster } from "@/components/CacheBuster";

export default function SuunnitteluPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [planName, setPlanName] = useState("Sähkösuunnitelma");

  const handlePreset = (presetRooms: Room[], name: string) => {
    setRooms(presetRooms);
    setPlanName(name);
  };

  const plan = useMemo(() => {
    if (rooms.length === 0) return null;
    const totalArea = rooms.reduce((sum, r) => sum + r.areaM2, 0);
    const floorPlan: FloorPlan = {
      id: `fp-${Date.now()}`,
      name: planName,
      totalAreaM2: totalArea,
      rooms,
    };
    return generateElectricalPlan(floorPlan);
  }, [rooms, planName]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--text-accent)] to-cyan-600 text-lg font-bold text-white shadow-[0_0_20px_var(--accent-glow)]"
          >
            ⚡
          </Link>
          <div>
            <h1 className="text-base font-bold text-[var(--text-primary)]">
              Sähkösuunnittelu
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">
              Pohjapiirros → sähköpisteet → piiriluettelo · SFS 6000
            </p>
          </div>
          <span className="ml-auto rounded-full border border-[var(--border-accent)] bg-[var(--accent-glow)] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-accent)]">
            PROTO
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
          <div className="space-y-5">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Valmiit pohjat
              </h2>
              <Presets onSelect={handlePreset} />
            </section>

            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Kuva → pohjapiirros (AI)
              </h2>
              <ImageAnalyzer onRoomsDetected={handlePreset} />
            </section>

            <section>
              <RoomEditor rooms={rooms} onRoomsChange={setRooms} />
            </section>
          </div>

          <div>
            {plan ? (
              <PlanView plan={plan} />
            ) : (
              <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-[var(--border-medium)]">
                <div className="text-center">
                  <p className="text-sm text-[var(--text-muted)]">
                    Valitse valmis pohja, lataa kuva
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    tai lisää huoneita käsin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] px-4 py-4 text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
        <p>
          TPCore · Sähkösuunnittelu <CacheBuster /> (proto)
        </p>
        <p className="mt-1">
          Sähköalan ammattilaisen apuväline. Ei korvaa pätevän
          sähkösuunnittelijan työtä.
        </p>
      </footer>
    </div>
  );
}
