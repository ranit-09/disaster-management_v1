"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import MapLegend from "@/components/map/MapLegend";
import IncidentFilters from "@/components/map/IncidentFilters";
import IncidentListPanel from "@/components/map/IncidentListPanel";
import type { Incident } from "@/components/map/HazardMap";

// Leaflet uses window, so the map must only load in the browser.
const HazardMap = dynamic(
  () => import("@/components/map/HazardMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-[#9fb8cf]">
        Loading map…
      </div>
    ),
  }
);

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hazardFilter, setHazardFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const params = new URLSearchParams();

    if (hazardFilter) {
      params.set("hazardType", hazardFilter);
    }

    if (severityFilter) {
      params.set("severity", severityFilter);
    }

    const res = await fetch(
      `/api/incidents?${params.toString()}`
    );

    const data = await res.json();

    setIncidents(data.incidents || []);
    setLoading(false);
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 8000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hazardFilter, severityFilter]);

  return (
    <main
      className="
        min-h-screen px-6 pb-20 pt-8 text-[#eaf2f8]
        bg-[#0d2b4e]
        bg-[linear-gradient(rgba(234,242,248,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(234,242,248,0.09)_1px,transparent_1px)]
        bg-[size:32px_32px]
      "
    >
      <div className="mx-auto max-w-[920px]">
        {/* Header */}
        <header className="mb-7">
          <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-[#f2a154]">
            Flow 03
          </div>

          <h1 className="mb-2 font-[Space_Grotesk] text-[28px] font-semibold">
            Live disaster map
          </h1>

          <p className="max-w-[560px] text-[14.5px] leading-6 text-[#9fb8cf]">
            Every active incident, filterable by type and severity, on real
            map tiles. Refreshes automatically every 8 seconds.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-4">
          <IncidentFilters
            hazardFilter={hazardFilter}
            severityFilter={severityFilter}
            onHazardChange={setHazardFilter}
            onSeverityChange={setSeverityFilter}
          />
        </div>

        {/* Legend */}
        <div className="mb-5">
          <MapLegend />
        </div>

        {/* Map + Incident list */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div
            className="
              overflow-hidden rounded-md
              border border-white/15
              bg-[#081b34]
              p-2
            "
          >
            <HazardMap incidents={incidents} />
          </div>

          <div
            className="
              overflow-hidden rounded-md
              border border-white/15
              bg-[#081b34]
              p-5
            "
          >
            <IncidentListPanel
              incidents={incidents}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
