import { HazardType, Incident, ReportInput, Severity } from "./types";
import { getActiveIncidents, nextId, saveIncident } from "./store";

export const DUPLICATE_RADIUS_METERS = 200;
export const DUPLICATE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

const VALID_HAZARD_TYPES: HazardType[] = [
  "waterlogging",
  "flood",
  "road_blocked",
  "fallen_tree",
  "building_collapse",
  "fire",
  "medical_emergency",
];

const VALID_SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

/**
 * Distance between two lat/lon points in meters (Haversine formula).
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a raw report before it touches the store.
 */
export function validateReportInput(input: ReportInput): ValidationResult {
  const errors: string[] = [];

  if (typeof input.latitude !== "number" || input.latitude < -90 || input.latitude > 90) {
    errors.push("latitude must be a number between -90 and 90");
  }
  if (typeof input.longitude !== "number" || input.longitude < -180 || input.longitude > 180) {
    errors.push("longitude must be a number between -180 and 180");
  }
  if (!input.hazardType && !input.description) {
    errors.push("either hazardType or description must be provided");
  }
  if (input.hazardType && !VALID_HAZARD_TYPES.includes(input.hazardType)) {
    errors.push(`hazardType must be one of: ${VALID_HAZARD_TYPES.join(", ")}`);
  }
  if (input.severity && !VALID_SEVERITIES.includes(input.severity)) {
    errors.push(`severity must be one of: ${VALID_SEVERITIES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}

export interface ExtractedFields {
  hazardType: HazardType;
  severity: Severity;
  roadStatus: "clear" | "blocked";
}

/**
 * Mock "AI" text extraction. A real implementation would call an LLM;
 * this keyword-matcher demonstrates the same input/output contract so
 * the rest of the pipeline (validation, dedup, scoring) doesn't care
 * which one is behind it.
 */
export function extractFromDescription(description: string): ExtractedFields {
  const text = description.toLowerCase();

  let hazardType: HazardType = "road_blocked";
  if (/(flood|underwater|submerged)/.test(text)) hazardType = "flood";
  else if (/(waterlog|water.log|rain.*pool)/.test(text)) hazardType = "waterlogging";
  else if (/(tree|branch)/.test(text)) hazardType = "fallen_tree";
  else if (/(collapse|building|structure)/.test(text)) hazardType = "building_collapse";
  else if (/(fire|smoke|burning)/.test(text)) hazardType = "fire";
  else if (/(injured|medical|ambulance|hurt)/.test(text)) hazardType = "medical_emergency";
  else if (/(block|closed|debris)/.test(text)) hazardType = "road_blocked";

  let severity: Severity = "medium";
  if (/(critical|severe|completely|trapped|can'?t move|cannot move)/.test(text)) severity = "critical";
  else if (/(high|major|significant)/.test(text)) severity = "high";
  else if (/(minor|slight|small)/.test(text)) severity = "low";

  const roadStatus: "clear" | "blocked" = /(cannot move|can'?t move|blocked|impassable|no vehicles)/.test(text)
    ? "blocked"
    : "clear";

  return { hazardType, severity, roadStatus };
}

/**
 * Finds an existing active incident that is the same hazard type,
 * within DUPLICATE_RADIUS_METERS and reported within DUPLICATE_WINDOW_MS.
 */
export function findNearbyDuplicate(
  input: { latitude: number; longitude: number; hazardType: HazardType },
  now: number = Date.now()
): Incident | undefined {
  return getActiveIncidents().find((incident) => {
    if (incident.hazardType !== input.hazardType) return false;
    if (now - incident.updatedAt > DUPLICATE_WINDOW_MS) return false;
    const distance = haversineDistanceMeters(
      input.latitude,
      input.longitude,
      incident.latitude,
      incident.longitude
    );
    return distance <= DUPLICATE_RADIUS_METERS;
  });
}

const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };

/**
 * Base confidence assigned to a brand-new, unconfirmed report.
 * Higher severity reports start slightly higher since they're
 * usually accompanied by more corroborating signals (photos, etc.)
 * in a real deployment, but everything still starts "unverified".
 */
export function computeInitialConfidence(severity: Severity): number {
  return 10 + SEVERITY_RANK[severity] * 2.5; // 12.5 - 20
}

export interface CreateOrMergeResult {
  incident: Incident;
  merged: boolean;
}

/**
 * Main entry point for Flow 1 (Report a Hazard).
 * Validates -> extracts (if needed) -> checks duplicates -> creates or merges.
 */
export function createOrMergeIncident(input: ReportInput): CreateOrMergeResult {
  const validation = validateReportInput(input);
  if (!validation.valid) {
    throw new Error(`Invalid report: ${validation.errors.join("; ")}`);
  }

  let hazardType = input.hazardType;
  let severity = input.severity;
  let aiExtracted = false;

  if ((!hazardType || !severity) && input.description) {
    const extracted = extractFromDescription(input.description);
    hazardType = hazardType ?? extracted.hazardType;
    severity = severity ?? extracted.severity;
    aiExtracted = true;
  }

  hazardType = hazardType ?? "road_blocked";
  severity = severity ?? "medium";

  const now = Date.now();
  const duplicate = findNearbyDuplicate(
    { latitude: input.latitude, longitude: input.longitude, hazardType },
    now
  );

  if (duplicate) {
    // Merge: bump severity to the max seen, add reporter, refresh timestamp,
    // nudge confidence up since independent reports are corroborating.
    duplicate.severity =
      SEVERITY_RANK[severity] > SEVERITY_RANK[duplicate.severity] ? severity : duplicate.severity;
    duplicate.updatedAt = now;
    duplicate.status = "active";
    if (input.reporterId && !duplicate.reporterIds.includes(input.reporterId)) {
      duplicate.reporterIds.push(input.reporterId);
    }
    duplicate.confirmations += 1;
    duplicate.confidence = Math.min(100, duplicate.confidence + 8);
    duplicate.verified = duplicate.confidence >= 70;
    saveIncident(duplicate);
    return { incident: duplicate, merged: true };
  }

  const incident: Incident = {
    id: nextId("incident"),
    latitude: input.latitude,
    longitude: input.longitude,
    hazardType,
    severity,
    description: input.description,
    photoUrl: input.photoUrl,
    createdAt: now,
    updatedAt: now,
    status: "active",
    confirmations: 0,
    rejections: 0,
    confidence: computeInitialConfidence(severity),
    verified: false,
    reporterIds: input.reporterId ? [input.reporterId] : [],
    aiExtracted,
  };

  saveIncident(incident);
  return { incident, merged: false };
}
