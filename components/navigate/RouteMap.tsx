"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { hazardIcon } from "@/components/HazardIcon";
import { api } from "@/lib/apiClient";

interface LatLon {
  lat: number;
  lon: number;
}

interface RouteForMap {
  label: "safest" | "balanced" | "risky";
  coordinates: LatLon[];
  totalTimeMin: number;
  totalDistanceKm: number;
}

interface Incident {
  id: string;
  hazardType: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

const COLORS: Record<string, string> = { safest: "#4fd8b8", balanced: "#f2a154", risky: "#ff6b5e" };
const SEVERITY_COLOR: Record<string, string> = {
  low: "#4fd8b8",
  medium: "#f2d16a",
  high: "#f2a154",
  critical: "#ff6b5e",
};
const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639];

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid var(--app-bg-deep);box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function hazardMarkerIcon(hazardType: string, severity: string) {
  const color = SEVERITY_COLOR[severity] ?? "#9fb8cf";
  return L.divIcon({
    className: "",
    html: `<div class="hazard-marker"><span class="badge-circle" style="background:${color};">${hazardIcon(hazardType)}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

export default function RouteMap({
  routes,
  selectedLabel,
  onSelect,
}: {
  routes: RouteForMap[];
  selectedLabel: string | null;
  onSelect?: (label: string) => void;
}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    api
      .get("/api/incidents?status=active")
      .then(({ data }) => setIncidents(data.incidents || []))
      .catch(() => setIncidents([]));
  }, []);

  const center = useMemo<[number, number]>(() => {
    const all = routes.flatMap((r) => r.coordinates);
    if (all.length === 0) return DEFAULT_CENTER;
    const lat = all.reduce((s, c) => s + c.lat, 0) / all.length;
    const lon = all.reduce((s, c) => s + c.lon, 0) / all.length;
    return [lat, lon];
  }, [routes]);

  const origin = routes[0]?.coordinates[0];
  const destination = routes[0]?.coordinates[routes[0]?.coordinates.length - 1];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: 420, width: "100%", borderRadius: 4 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* unselected routes first (dimmed), selected route last (on top, full opacity) */}
      {routes
        .filter((r) => r.label !== selectedLabel)
        .map((r) => (
          <Polyline
            key={r.label}
            positions={r.coordinates.map((c) => [c.lat, c.lon])}
            pathOptions={{ color: COLORS[r.label], weight: 4, opacity: selectedLabel ? 0.25 : 0.55 }}
            eventHandlers={onSelect ? { click: () => onSelect(r.label) } : undefined}
          />
        ))}
      {routes
        .filter((r) => r.label === selectedLabel)
        .map((r) => (
          <Polyline
            key={r.label}
            positions={r.coordinates.map((c) => [c.lat, c.lon])}
            pathOptions={{ color: COLORS[r.label], weight: 6, opacity: 0.95 }}
          />
        ))}

      {origin && (
        <Marker position={[origin.lat, origin.lon]} icon={pinIcon("#eaf2f8")}>
          <Popup>Origin</Popup>
        </Marker>
      )}
      {destination && (
        <Marker position={[destination.lat, destination.lon]} icon={pinIcon("#4fd8b8")}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* active hazards along the way, so you can see *why* a route scored risky */}
      {incidents.map((i) => (
        <Marker
          key={i.id}
          position={[i.latitude, i.longitude]}
          icon={hazardMarkerIcon(i.hazardType, i.severity)}
        >
          <Popup>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, minWidth: 150 }}>
              {i.photoUrl && (
                <img
                  src={i.photoUrl}
                  alt={i.hazardType}
                  style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 4, marginBottom: 6 }}
                />
              )}
              <div style={{ fontWeight: 600, textTransform: "capitalize" }}>
                {hazardIcon(i.hazardType)} {i.hazardType.replace("_", " ")}
              </div>
              <div style={{ color: SEVERITY_COLOR[i.severity] }}>{i.severity.toUpperCase()}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
