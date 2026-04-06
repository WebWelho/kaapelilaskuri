import { db, type Project, type Circuit } from "./schema";
import type { CalcInput, CalcResult } from "@/lib/electrical";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ── Projektit ──

export async function createProject(
  name: string,
  description = "",
): Promise<Project> {
  const project: Project = {
    id: generateId(),
    name,
    description,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.projects.add(project);
  return project;
}

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy("updatedAt").reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id);
}

export async function deleteProject(id: string): Promise<void> {
  await db.circuits.where("projectId").equals(id).delete();
  await db.projects.delete(id);
}

export async function updateProjectName(
  id: string,
  name: string,
): Promise<void> {
  await db.projects.update(id, { name, updatedAt: now() });
}

// ── Piirit ──

export async function saveCircuit(
  projectId: string,
  name: string,
  input: CalcInput,
  result: CalcResult,
): Promise<Circuit> {
  const circuit: Circuit = {
    id: generateId(),
    projectId,
    name,
    input,
    result,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.circuits.add(circuit);
  await db.projects.update(projectId, { updatedAt: now() });
  return circuit;
}

export async function listCircuits(projectId: string): Promise<Circuit[]> {
  return db.circuits
    .where("projectId")
    .equals(projectId)
    .reverse()
    .sortBy("updatedAt");
}

export async function deleteCircuit(id: string): Promise<void> {
  await db.circuits.delete(id);
}

export async function getCircuitCount(projectId: string): Promise<number> {
  return db.circuits.where("projectId").equals(projectId).count();
}
