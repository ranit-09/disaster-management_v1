import { Incident, LatLon, Responder, RouteOption, RouteSegmentScore, Severity } from "./types";
import { haversineDistanceMeters } from "./hazards";

/**
 * --- Mock road graph -------------------------------------------------
 * A real system would pull this from OSM / a routing engine (OSRM,
 * Valhalla, Google Roads). For a functions-only prototype we model a
 * small diamond-shaped graph between an origin and destination with
 * several alternate paths, which is enough to demonstrate risk-aware
 * route scoring end to end.
 */
export interface GraphNode {
  id: string;
  lat: number;
  lon: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number;
  baseTimeMin: number;
}

export function buildMockGraph(origin: LatLon, destination: LatLon): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const midLat = (origin.lat + destination.lat) / 2;
  const midLon = (origin.lon + destination.lon) / 2;
  const latSpread = (destination.lat - origin.lat) || 0.01;
  const lonSpread = (destination.lon - origin.lon) || 0.01;

  const nodes: GraphNode[] = [
    { id: "origin", lat: origin.lat, lon: origin.lon },
    { id: "waypoint_a", lat: midLat + latSpread * 0.15, lon: midLon - lonSpread * 0.1 },
    { id: "waypoint_b", lat: midLat - latSpread * 0.1, lon: midLon + lonSpread * 0.05 },
    { id: "waypoint_c", lat: midLat + latSpread * 0.05, lon: midLon + lonSpread * 0.2 },
    { id: "destination", lat: destination.lat, lon: destination.lon },
  ];

  const dist = (a: GraphNode, b: GraphNode) =>
    haversineDistanceMeters(a.lat, a.lon, b.lat, b.lon) / 1000;

  const km = (aId: string, bId: string) => {
    const a = nodes.find((n) => n.id === aId)!;
    const b = nodes.find((n) => n.id === bId)!;
    return dist(a, b);
  };

  const AVG_SPEED_KMH = 30;
  const timeFor = (km: number) => (km / AVG_SPEED_KMH) * 60;

  const rawEdges: [string, string][] = [
    ["origin", "waypoint_a"],
    ["waypoint_a", "destination"],
    ["origin", "waypoint_b"],
    ["waypoint_b", "destination"],
    ["origin", "waypoint_c"],
    ["waypoint_c", "waypoint_b"],
    ["waypoint_b", "waypoint_a"],
  ];

  const edges: GraphEdge[] = rawEdges.map(([from, to]) => {
    const distanceKm = Math.max(km(from, to), 0.2);
    return { from, to, distanceKm, baseTimeMin: timeFor(distanceKm) };
  });

  return { nodes, edges };
}

/**
 * Enumerates simple paths (no repeated nodes) from start to end via DFS.
 * The graph is intentionally tiny so this is cheap; swap for a real
 * k-shortest-paths algorithm against a production road network.
 */
export function findAllPaths(
  edges: GraphEdge[],
  start: string,
  end: string,
  visited: string[] = []
): string[][] {
  if (start === end) return [[start]];
  const paths: string[][] = [];
  const outgoing = edges.filter((e) => e.from === start && !visited.includes(e.to));
  for (const edge of outgoing) {
    const subPaths = findAllPaths(edges, edge.to, end, [...visited, start]);
    for (const sub of subPaths) {
      paths.push([start, ...sub]);
    }
  }
  return paths;
}

const SEVERITY_RISK: Record<Severity, number> = {
  low: 20,
  medium: 50,
  high: 90,
  critical: Infinity, // treated as unavailable
};

const BLOCKING_HAZARDS = new Set(["road_blocked", "building_collapse", "flood"]);
const INCIDENT_INFLUENCE_RADIUS_METERS = 350;

/**
 * Assigns a risk value to a single edge based on any active incidents
 * near either endpoint. Mirrors the flat table from the spec:
 * normal=0, minor=20, moderate=50, severe=90, blocked=unavailable.
 */
export function scoreEdgeRisk(
  edge: GraphEdge,
  nodes: GraphNode[],
  incidents: Incident[]
): { risk: number; blockedBy?: string } {
  const from = nodes.find((n) => n.id === edge.from)!;
  const to = nodes.find((n) => n.id === edge.to)!;

  let worstRisk = 0;
  let blockedBy: string | undefined;

  for (const incident of incidents) {
    if (incident.status === "resolved") continue;

    const distFrom = haversineDistanceMeters(from.lat, from.lon, incident.latitude, incident.longitude);
    const distTo = haversineDistanceMeters(to.lat, to.lon, incident.latitude, incident.longitude);
    const nearEdge = Math.min(distFrom, distTo) <= INCIDENT_INFLUENCE_RADIUS_METERS;
    if (!nearEdge) continue;

    const isBlocking = BLOCKING_HAZARDS.has(incident.hazardType) && incident.severity === "critical";
    if (isBlocking) {
      blockedBy = incident.id;
      worstRisk = Infinity;
      break;
    }

    const risk = SEVERITY_RISK[incident.severity];
    if (risk > worstRisk) worstRisk = risk;
  }

  return { risk: worstRisk, blockedBy };
}

export interface WeightConfig {
  timeWeight: number;
  distanceWeight: number;
  riskWeight: number;
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  timeWeight: 1,
  distanceWeight: 2,
  riskWeight: 0.6,
};

/**
 * Scores a full path (sequence of node ids) against active incidents.
 * routeScore = travelTime + distance*distanceWeight + risk*riskWeight,
 * matching "Route Score = Travel Time + Distance + Risk" from the spec,
 * with tunable weights since raw units aren't directly comparable.
 */
export function scoreRoute(
  path: string[],
  nodes: GraphNode[],
  edges: GraphEdge[],
  incidents: Incident[],
  weights: WeightConfig = DEFAULT_WEIGHTS
): { segments: RouteSegmentScore[]; totalDistanceKm: number; totalTimeMin: number; totalRisk: number; routeScore: number } | null {
  const segments: RouteSegmentScore[] = [];
  let totalDistanceKm = 0;
  let totalTimeMin = 0;
  let totalRisk = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find((e) => e.from === path[i] && e.to === path[i + 1]);
    if (!edge) return null; // path isn't actually connected in this graph

    const { risk, blockedBy } = scoreEdgeRisk(edge, nodes, incidents);
    if (risk === Infinity) return null; // route is impassable, discard

    segments.push({
      from: edge.from,
      to: edge.to,
      distanceKm: edge.distanceKm,
      timeMin: edge.baseTimeMin,
      risk,
      blockedBy,
    });

    totalDistanceKm += edge.distanceKm;
    totalTimeMin += edge.baseTimeMin;
    totalRisk += risk;
  }

  const routeScore =
    totalTimeMin * weights.timeWeight +
    totalDistanceKm * weights.distanceWeight +
    totalRisk * weights.riskWeight;

  return { segments, totalDistanceKm, totalTimeMin, totalRisk, routeScore };
}

export interface RoutePlanResult {
  origin: LatLon;
  destination: LatLon;
  routes: RouteOption[];
}

/**
 * Main entry point for Flow 2 (Safe Navigation).
 * Builds the graph, enumerates candidate paths, scores each against
 * active incidents, then labels the best three as safest/balanced/risky.
 */
export function planRoute(
  origin: LatLon,
  destination: LatLon,
  incidents: Incident[],
  weights: WeightConfig = DEFAULT_WEIGHTS
): RoutePlanResult {
  const { nodes, edges } = buildMockGraph(origin, destination);
  const candidatePaths = findAllPaths(edges, "origin", "destination");

  const scored = candidatePaths
    .map((path) => {
      const result = scoreRoute(path, nodes, edges, incidents, weights);
      if (!result) return null;
      return { path, ...result };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (scored.length === 0) {
    return { origin, destination, routes: [] };
  }

  const byRisk = [...scored].sort((a, b) => a.totalRisk - b.totalRisk || a.routeScore - b.routeScore);
  const byScore = [...scored].sort((a, b) => a.routeScore - b.routeScore);
  const byTime = [...scored].sort((a, b) => a.totalTimeMin - b.totalTimeMin);

  const safest = byRisk[0];
  const balanced = byScore.find((r) => r !== safest) ?? byScore[0];
  const risky = byTime.find((r) => r !== safest && r !== balanced) ?? byTime[0];

  const toOption = (label: RouteOption["label"], r: (typeof scored)[number]): RouteOption => ({
    label,
    path: r.path,
    totalDistanceKm: Math.round(r.totalDistanceKm * 10) / 10,
    totalTimeMin: Math.round(r.totalTimeMin),
    totalRisk: r.totalRisk,
    routeScore: Math.round(r.routeScore * 10) / 10,
    segments: r.segments,
  });

  return {
    origin,
    destination,
    routes: [toOption("safest", safest), toOption("balanced", balanced), toOption("risky", risky)],
  };
}

/**
 * Main entry point for Flow 6 (Emergency Response).
 * Picks the nearest available responder (straight-line distance as a
 * cheap pre-filter) then computes the safest route from that responder
 * to the incident, same risk-aware logic as citizen routing.
 */
export function findNearestResponderAndRoute(
  incidentLocation: LatLon,
  responders: Responder[],
  incidents: Incident[]
) {
  const available = responders.filter((r) => r.available);
  if (available.length === 0) {
    throw new Error("No available responders");
  }

  const withDistance = available.map((r) => ({
    responder: r,
    straightLineKm: haversineDistanceMeters(r.lat, r.lon, incidentLocation.lat, incidentLocation.lon) / 1000,
  }));

  withDistance.sort((a, b) => a.straightLineKm - b.straightLineKm);

  // Try nearest few responders and pick whichever gets the best (safest) actual route,
  // in case the closest one is cut off by a blocked road.
  const candidates = withDistance.slice(0, 3);

  let best: { responder: Responder; plan: RoutePlanResult } | null = null;
  for (const candidate of candidates) {
    const plan = planRoute(
      { lat: candidate.responder.lat, lon: candidate.responder.lon },
      incidentLocation,
      incidents
    );
    if (plan.routes.length === 0) continue;
    if (!best || plan.routes[0].routeScore < best.plan.routes[0].routeScore) {
      best = { responder: candidate.responder, plan };
    }
  }

  if (!best) {
    throw new Error("No passable route found from any nearby responder");
  }

  return {
    dispatchedResponder: best.responder,
    route: best.plan.routes[0], // safest option
  };
}
