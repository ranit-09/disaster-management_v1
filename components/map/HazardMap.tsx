"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { hazardIcon } from "@/components/HazardIcon";

export interface Incident {
  id: string;
  hazardType: string;
  severity: string;
  status: string;
  confidence: number;
  verified: boolean;
  latitude: number;
  longitude: number;
  updatedAt: number;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "#4fd8b8",
  medium: "#f2d16a",
  high: "#f2a154",
  critical: "#ff6b5e",
};

const DEFAULT_CENTER: [number, number] = [
  22.5726,
  88.3639,
];

function buildIcon(
  severity: string,
  active: boolean
) {
  const color =
    SEVERITY_COLOR[severity] ?? "#9fb8cf";

  return L.divIcon({
    className: "",
    html: `
      <div class="hazard-marker">
        ${
          active
            ? `<span class="ring" style="border-color:${color};"></span>`
            : ""
        }
        <span
          class="dot"
          style="background:${color};"
        ></span>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function timeAgo(ts: number): string {
  const mins = Math.round(
    (Date.now() - ts) / 60000
  );

  if (mins < 1) return "just now";

  if (mins < 60) {
    return `${mins}m ago`;
  }

  const hours = Math.round(mins / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
}

export default function HazardMap({
  incidents,
}: {
  incidents: Incident[];
}) {
  const center = useMemo<[number, number]>(() => {
    if (incidents.length === 0) {
      return DEFAULT_CENTER;
    }

    const lat =
      incidents.reduce(
        (sum, incident) =>
          sum + incident.latitude,
        0
      ) / incidents.length;

    const lon =
      incidents.reduce(
        (sum, incident) =>
          sum + incident.longitude,
        0
      ) / incidents.length;

    return [lat, lon];
  }, [incidents]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-[460px] w-full rounded"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[
            incident.latitude,
            incident.longitude,
          ]}
          icon={buildIcon(
            incident.severity,
            incident.status === "active"
          )}
        >
          <Popup>
            <div className="min-w-[160px] font-mono text-xs">
              <div className="mb-1.5 font-semibold capitalize">
                {hazardIcon(incident.hazardType)}{" "}
                {incident.hazardType.replace(
                  "_",
                  " "
                )}
              </div>

              <div
                className="mb-1"
                style={{
                  color:
                    SEVERITY_COLOR[
                      incident.severity
                    ],
                }}
              >
                {incident.severity.toUpperCase()} ·{" "}
                {incident.status}
              </div>

              <div className="text-[var(--app-muted)]">
                confidence {incident.confidence}% ·{" "}
                {incident.verified
                  ? "verified"
                  : "unverified"}
              </div>

              <div className="mt-1 text-[var(--app-muted)]">
                {timeAgo(incident.updatedAt)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}