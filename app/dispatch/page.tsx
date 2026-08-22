"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import { SeverityBadge } from "@/components/Badges";

interface Incident {
  id: string;
  hazardType: string;
  severity: string;
  latitude: number;
  longitude: number;
}

const MOCK_RESPONDERS = [
  {
    id: "amb_1",
    lat: 22.505,
    lon: 88.365,
    available: true,
    type: "ambulance",
  },
  {
    id: "amb_2",
    lat: 22.61,
    lon: 88.41,
    available: true,
    type: "ambulance",
  },
  {
    id: "fire_1",
    lat: 22.55,
    lon: 88.39,
    available: true,
    type: "fire",
  },
];

export default function DispatchPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Load active incidents
  useEffect(() => {
    axios
      .get("/api/incidents?status=active")
      .then((response) => {
        setIncidents(response.data.incidents || []);
      })
      .catch(() => {
        setIncidents([]);
      });
  }, []);

  async function dispatch() {
    if (!selected) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("/api/dispatch", {
        incidentId: selected,
        responders: MOCK_RESPONDERS,
      });

      setResult(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Dispatch failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[920px] px-6 pt-8 pb-20">
      {/* PAGE HEADER */}
      <div className="mb-7">
        <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-[var(--app-amber)]">
          Flow 06
        </div>

        <h1 className="mb-2 font-[var(--font-display)] text-[28px] font-bold">
          Emergency dispatch
        </h1>

        <p className="max-w-[560px] text-[14.5px] text-[var(--app-muted)]">
          Pick a critical incident. The system checks the nearest
          responders and routes to whichever one gets there safest.
        </p>
      </div>

      {/* DISPATCH FORM */}
      <div className="mb-5 rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
        {/* INCIDENT SELECT */}
        <div className="mb-4 flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
            Active incident
          </label>

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="
              rounded-[4px]
              border
              border-[var(--app-grid-strong)]
              bg-[var(--app-bg)]
              px-3
              py-2.5
              text-sm
              text-[var(--app-fg)]
              outline-none
              transition
              focus:border-[var(--app-amber)]
            "
          >
            <option value="">
              — choose an incident —
            </option>

            {incidents.map((incident) => (
              <option
                key={incident.id}
                value={incident.id}
              >
                {incident.hazardType.replace("_", " ")} ·{" "}
                {incident.severity} · {incident.id.slice(-8)}
              </option>
            ))}
          </select>
        </div>

        {/* MOCK RESPONDERS INFO */}
        <div className="mb-4 font-mono text-xs text-[var(--app-muted)]">
          Using {MOCK_RESPONDERS.length} mock responders
          (2 ambulances, 1 fire unit) for this prototype.
        </div>

        {/* DISPATCH BUTTON */}
        <button
          onClick={dispatch}
          disabled={!selected || loading}
          className="
            cursor-pointer
            rounded-[4px]
            border-none
            bg-[var(--app-amber)]
            px-5
            py-[11px]
            text-sm
            font-semibold
            text-[var(--app-bg-deep)]
            transition
            hover:brightness-110
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Dispatching…"
            : "🚑 Dispatch Nearest Responder"}
        </button>

        {/* ERROR */}
        {error && (
          <div className="mt-2 text-[13px] text-[var(--app-red)]">
            {error}
          </div>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* DISPATCHED RESPONDER */}
          <div className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
            <h3 className="mb-3.5 font-[var(--font-display)] text-[15px]">
              Dispatched responder
            </h3>

            <div className="mb-2.5 flex flex-wrap gap-3">
              <span
                className="
                  inline-block
                  rounded-full
                  border
                  border-[rgba(79,216,184,0.4)]
                  px-2.5
                  py-1
                  font-mono
                  text-[11px]
                  text-[var(--app-green)]
                "
              >
                {result.dispatchedResponder.id}
              </span>

              <span
                className="
                  inline-block
                  rounded-full
                  border
                  border-[var(--app-grid-strong)]
                  px-2.5
                  py-1
                  font-mono
                  text-[11px]
                  text-[var(--app-muted)]
                "
              >
                {result.dispatchedResponder.type}
              </span>
            </div>

            <div className="font-mono text-xs text-[var(--app-muted)]">
              {result.dispatchedResponder.lat},{" "}
              {result.dispatchedResponder.lon}
            </div>
          </div>

          {/* ROUTE */}
          <div className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
            <h3 className="mb-3.5 font-[var(--font-display)] text-[15px]">
              Route to incident
            </h3>

            <div className="text-[26px] font-bold">
              {result.route.totalTimeMin}

              <span className="ml-1 text-[13px] font-normal text-[var(--app-muted)]">
                min
              </span>
            </div>

            <div className="mt-1 font-mono text-xs text-[var(--app-muted)]">
              {result.route.totalDistanceKm} km · risk{" "}
              {result.route.totalRisk}
            </div>

            <div className="mt-3 font-mono text-[11px] text-[var(--app-muted)]">
              path: {result.route.path.join(" → ")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}