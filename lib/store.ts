import { Incident } from "./types";

// Module-level in-memory store. Persists for the lifetime of the server
// process — good enough for a prototype, swap for a real DB later.
const incidents: Map<string, Incident> = new Map();

let counter = 0;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

export function saveIncident(incident: Incident): Incident {
  incidents.set(incident.id, incident);
  return incident;
}

export function getIncident(id: string): Incident | undefined {
  return incidents.get(id);
}

export function getAllIncidents(): Incident[] {
  return Array.from(incidents.values());
}

export function getActiveIncidents(): Incident[] {
  return getAllIncidents().filter((i) => i.status !== "resolved");
}

export function deleteIncident(id: string): boolean {
  return incidents.delete(id);
}
