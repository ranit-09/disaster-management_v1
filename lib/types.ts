export type HazardType =
  | "waterlogging"
  | "flood"
  | "road_blocked"
  | "fallen_tree"
  | "building_collapse"
  | "fire"
  | "medical_emergency";

export type Severity = "low" | "medium" | "high" | "critical";

export type IncidentStatus = "active" | "stale" | "resolved";

export interface ReportInput {
  latitude: number;
  longitude: number;
  hazardType?: HazardType;
  severity?: Severity;
  description?: string;
  photoUrl?: string;
  reporterId?: string;
}

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  hazardType: HazardType;
  severity: Severity;
  description?: string;
  photoUrl?: string;
  createdAt: number;
  updatedAt: number;
  status: IncidentStatus;
  confirmations: number;
  rejections: number;
  confidence: number; // 0-100
  verified: boolean;
  reporterIds: string[];
  aiExtracted: boolean;
}

export interface LatLon {
  lat: number;
  lon: number;
}

export interface RouteSegmentScore {
  from: string;
  to: string;
  distanceKm: number;
  timeMin: number;
  risk: number; // 0-100, or Infinity if impassable
  blockedBy?: string; // incident id
}

export interface RouteOption {
  label: "safest" | "balanced" | "risky";
  path: string[];
  totalDistanceKm: number;
  totalTimeMin: number;
  totalRisk: number;
  routeScore: number;
  segments: RouteSegmentScore[];
}

export interface Responder {
  id: string;
  lat: number;
  lon: number;
  available: boolean;
  type?: string;
}
