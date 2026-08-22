import { Incident } from "./types";
import { getIncident, saveIncident } from "./store";

export const STALE_AFTER_MS = 2 * 60 * 60 * 1000; // 2 hours with no confirmation
export const VERIFIED_CONFIDENCE_THRESHOLD = 70;

export type Vote = "confirm" | "deny";

/**
 * Recomputes confidence from raw confirm/deny counts.
 * Simple Wilson-ish heuristic: ratio of confirms, scaled by volume,
 * capped 0-100. More confirmations relative to denials -> higher confidence.
 */
export function computeConfidence(confirmations: number, rejections: number): number {
  const total = confirmations + rejections;
  if (total === 0) return 15; // matches computeInitialConfidence baseline
  const ratio = confirmations / total;
  const volumeBoost = Math.min(total, 10) * 3; // more votes = more certain, caps at +30
  const confidence = ratio * 70 + volumeBoost;
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

export interface VerifyResult {
  incident: Incident;
  confidenceDelta: number;
}

/**
 * Main entry point for Flow 4 (Community Verification).
 * Registers a nearby user's confirm/deny vote and updates confidence + status.
 */
export function castVote(incidentId: string, reporterId: string, vote: Vote): VerifyResult {
  const incident = getIncident(incidentId);
  if (!incident) {
    throw new Error(`Incident ${incidentId} not found`);
  }

  const before = incident.confidence;

  if (vote === "confirm") {
    incident.confirmations += 1;
  } else {
    incident.rejections += 1;
  }

  incident.confidence = computeConfidence(incident.confirmations, incident.rejections);
  incident.verified = incident.confidence >= VERIFIED_CONFIDENCE_THRESHOLD;
  incident.updatedAt = Date.now();
  incident.status = "active";

  if (reporterId && !incident.reporterIds.includes(reporterId)) {
    incident.reporterIds.push(reporterId);
  }

  // Enough denials relative to confirms -> treat as resolved/false alarm.
  if (incident.rejections >= 3 && incident.rejections > incident.confirmations) {
    incident.status = "resolved";
  }

  saveIncident(incident);
  return { incident, confidenceDelta: incident.confidence - before };
}

/**
 * Advances an incident's lifecycle based on elapsed time since last update.
 * ACTIVE -> STALE -> (manually) RESOLVED.
 * Call this on read (e.g. from GET /api/incidents) to keep state fresh
 * without needing a background job in a prototype.
 */
export function refreshLifecycle(incident: Incident, now: number = Date.now()): Incident {
  if (incident.status === "resolved") return incident;

  const elapsed = now - incident.updatedAt;
  if (elapsed > STALE_AFTER_MS) {
    incident.status = "stale";
    saveIncident(incident);
  }
  return incident;
}

export function resolveIncident(incidentId: string): Incident {
  const incident = getIncident(incidentId);
  if (!incident) {
    throw new Error(`Incident ${incidentId} not found`);
  }
  incident.status = "resolved";
  incident.updatedAt = Date.now();
  saveIncident(incident);
  return incident;
}
