"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, Circuit } from "@/lib/db/schema";
import type { CalcInput, CalcResult } from "@/lib/electrical";
import {
  listProjects,
  createProject,
  deleteProject,
  saveCircuit,
  listCircuits,
  deleteCircuit,
  getCircuitCount,
} from "@/lib/db/operations";

interface ProjectBarProps {
  currentInput: CalcInput;
  currentResult: CalcResult | null;
  onLoadCircuit: (input: CalcInput) => void;
}

export function ProjectBar({
  currentInput,
  currentResult,
  onLoadCircuit,
}: ProjectBarProps) {
  const [projects, setProjects] = useState<
    (Project & { circuitCount: number })[]
  >([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [circuitName, setCircuitName] = useState("");
  const [showSave, setShowSave] = useState(false);

  const refresh = useCallback(async () => {
    const projs = await listProjects();
    const withCounts = await Promise.all(
      projs.map(async (p) => ({
        ...p,
        circuitCount: await getCircuitCount(p.id),
      })),
    );
    setProjects(withCounts);
  }, []);

  const refreshCircuits = useCallback(async () => {
    if (!activeProjectId) return;
    const c = await listCircuits(activeProjectId);
    setCircuits(c);
  }, [activeProjectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    refreshCircuits();
  }, [refreshCircuits]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const proj = await createProject(newName.trim());
    setNewName("");
    setShowNew(false);
    setActiveProjectId(proj.id);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setCircuits([]);
    }
    await refresh();
  };

  const handleSave = async () => {
    if (!activeProjectId || !currentResult || !circuitName.trim()) return;
    await saveCircuit(
      activeProjectId,
      circuitName.trim(),
      currentInput,
      currentResult,
    );
    setCircuitName("");
    setShowSave(false);
    await refreshCircuits();
    await refresh();
  };

  const handleDeleteCircuit = async (id: string) => {
    await deleteCircuit(id);
    await refreshCircuits();
    await refresh();
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Projektit
        </h2>
        <button
          onClick={() => setShowNew(!showNew)}
          className="rounded-lg border border-[var(--border-accent)] px-2.5 py-1 text-xs font-medium text-[var(--text-accent)] transition-all hover:bg-[var(--bg-card-hover)]"
        >
          + Uusi
        </button>
      </div>

      {/* Uusi projekti */}
      {showNew && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="Projektin nimi..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="input-field flex-1 text-sm"
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="rounded-lg bg-[var(--text-accent)] px-3 py-2 text-xs font-semibold text-[var(--bg-base)] transition-all hover:opacity-90"
          >
            Luo
          </button>
        </div>
      )}

      {/* Projektilista */}
      {projects.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {projects.map((proj) => {
            const active = activeProjectId === proj.id;
            return (
              <div key={proj.id} className="group">
                <button
                  onClick={() => setActiveProjectId(active ? null : proj.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    active
                      ? "bg-[var(--bg-card-hover)] text-[var(--text-accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span className="truncate font-medium">{proj.name}</span>
                  <span className="ml-2 shrink-0 font-mono text-xs text-[var(--text-muted)]">
                    {proj.circuitCount}
                  </span>
                </button>

                {/* Piirit */}
                {active && (
                  <div className="ml-3 mt-1 space-y-1 border-l border-[var(--border-subtle)] pl-3">
                    {circuits.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-[var(--bg-elevated)]"
                      >
                        <button
                          onClick={() => onLoadCircuit(c.input)}
                          className="flex-1 truncate text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          title={`${c.result.cableDescription} — ${c.result.protectionDescription}`}
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="ml-2 font-mono text-[var(--text-muted)]">
                            {c.result.cableDescription}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteCircuit(c.id)}
                          className="ml-1 shrink-0 px-1 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                          title="Poista"
                        >
                          x
                        </button>
                      </div>
                    ))}

                    {circuits.length === 0 && (
                      <p className="py-1 text-xs text-[var(--text-muted)]">
                        Ei piirejä vielä
                      </p>
                    )}

                    {/* Tallenna piiri */}
                    {currentResult && (
                      <>
                        {showSave ? (
                          <div className="flex gap-1.5 pt-1">
                            <input
                              type="text"
                              placeholder="Piirin nimi..."
                              value={circuitName}
                              onChange={(e) => setCircuitName(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSave()
                              }
                              className="input-field flex-1 py-1 text-xs"
                              autoFocus
                            />
                            <button
                              onClick={handleSave}
                              className="rounded-md bg-[var(--text-accent)] px-2 py-1 text-xs font-semibold text-[var(--bg-base)]"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowSave(true)}
                            className="mt-1 w-full rounded-lg border border-dashed border-[var(--border-medium)] px-2 py-1.5 text-xs text-[var(--text-muted)] transition-all hover:border-[var(--text-accent)] hover:text-[var(--text-accent)]"
                          >
                            + Tallenna piiri
                          </button>
                        )}
                      </>
                    )}

                    {/* Poista projekti */}
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="mt-1 text-[10px] text-[var(--text-muted)] hover:text-red-400"
                    >
                      Poista projekti
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {projects.length === 0 && !showNew && (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Luo projekti tallentaaksesi piirilaskelmia.
        </p>
      )}
    </div>
  );
}
