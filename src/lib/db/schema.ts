import Dexie, { type EntityTable } from "dexie";
import type { CalcInput, CalcResult } from "@/lib/electrical";

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Circuit {
  id: string;
  projectId: string;
  name: string;
  input: CalcInput;
  result: CalcResult;
  createdAt: string;
  updatedAt: string;
}

class SahkoAIDatabase extends Dexie {
  projects!: EntityTable<Project, "id">;
  circuits!: EntityTable<Circuit, "id">;

  constructor() {
    super("sahkoai-kaapelilaskuri");

    this.version(1).stores({
      projects: "id, name, updatedAt",
      circuits: "id, projectId, name, updatedAt",
    });
  }
}

export const db = new SahkoAIDatabase();
