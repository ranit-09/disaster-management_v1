"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { hazardIcon } from "@/components/HazardIcon";

export interface Incident {
  id: string;
  hazardType: string;
  hazardTypes?: string[];
  severity: string;
  status: string;
  confidence: number;
  verified: boolean;
  latitude: number;
  longitude: number;
  updatedAt: number;
  photoUrl?: string;
  address?: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#4fd8b8",
  medium: "#f2d16a",
  high: "#f2a154",
  critical: "#ff6b5e",
};

const DEFAULT_CENTER: [number, number] = [22.5726, 88.3639]; // fallback if no incidents yet

function buildIcon(hazardType: string, severity: string, active: boolean) {
  const color = SEVERITY_COLOR[severity] ?? "#9fb8cf";
  return L.divIcon({
    className: "",
    html: `
      <div class="hazard-marker">
        ${active ? `<span class="ring" style="border-color:${color};"></span>` : ""}
        <span class="badge-circle" style="background:${color};">${hazardIcon(hazardType)}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

function timeAgo(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function HazardMap({ incidents }: { incidents: Incident[] }) {
  const center = useMemo<[number, number]>(() => {
    if (incidents.length === 0) return DEFAULT_CENTER;
    const lat = incidents.reduce((sum, i) => sum + i.latitude, 0) / incidents.length;
    const lon = incidents.reduce((sum, i) => sum + i.longitude, 0) / incidents.length;
    return [lat, lon];
  }, [incidents]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: 460, width: "100%", borderRadius: 4 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.latitude, incident.longitude]}
          icon={buildIcon(incident.hazardType, incident.severity, incident.status === "active")}
        >
          <Popup maxWidth={220}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, minWidth: 160 }}>
              {incident.photoUrl && (
                <img
                  src={incident.photoUrl}
                  alt={incident.hazardType}
                  style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 4, marginBottom: 8 }}
                />
              )}
              <div style={{ fontWeight: 600, marginBottom: 6, textTransform: "capitalize" }}>
                {hazardIcon(incident.hazardType)} {incident.hazardType.replace("_", " ")}
              </div>
              <div style={{ color: SEVERITY_COLOR[incident.severity], marginBottom: 4 }}>
                {incident.severity.toUpperCase()} · {incident.status}
              </div>
              {incident.address && <div style={{ color: "#666", marginBottom: 4 }}>📍 {incident.address}</div>}
              <div style={{ color: "#666" }}>
                confidence {incident.confidence}% · {incident.verified ? "verified" : "unverified"}
              </div>
              <div style={{ color: "#666", marginTop: 4 }}>{timeAgo(incident.updatedAt)}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
