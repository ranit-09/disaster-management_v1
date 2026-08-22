"use client";

import { useState } from "react";
import RouteSchematic from "@/components/navigate/RouteSchematic";

const COLORS: Record<string, string> = {
  safest: "var(--app-green)",
  balanced: "var(--app-amber)",
  risky: "var(--app-red)",
};

export default function RouteCard({
  route,
}: {
  route: any;
}) {
  const [expanded, setExpanded] = useState(false);

  const color = COLORS[route.label];

  return (
    <div className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
      {/* Route label */}
      <div className="mb-3 flex justify-between">
        <span
          className="inline-block rounded-full border px-2.5 py-1 font-mono text-[11px]"
          style={{
            color,
            borderColor: `${color}66`,
          }}
        >
          {route.label}
        </span>
      </div>

      {/* Time */}
      <div className="text-[28px] font-bold">
        {route.totalTimeMin}

        <span className="text-sm font-normal text-[var(--app-muted)]">
          {" "}
          min
        </span>
      </div>

      {/* Route metadata */}
      <div className="mt-1 font-mono text-xs text-[var(--app-muted)]">
        {route.totalDistanceKm} km · risk {route.totalRisk} · score{" "}
        {route.routeScore}
      </div>

      {/* Schematic */}
      <div className="my-4">
        <RouteSchematic
          path={route.path}
          segments={route.segments}
        />
      </div>

      {/* Expand button */}
      <button
        type="button"
        className="w-full border border-[var(--app-grid-strong)] bg-transparent px-3 py-2 text-xs text-[var(--app-fg)]"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded
          ? "Hide segment breakdown ▲"
          : "Show segment breakdown ▼"}
      </button>

      {/* Segments */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-2">
          {route.segments.map(
            (seg: any, i: number) => {
              const risk =
                seg.risk >= 70
                  ? "var(--app-red)"
                  : seg.risk >= 35
                    ? "var(--app-amber)"
                    : "var(--app-green)";

              return (
                <div
                  key={i}
                  className="font-mono text-[11.5px] text-[var(--app-muted)]"
                >
                  <div className="flex justify-between gap-4">
                    <span>
                      {seg.from} → {seg.to}
                    </span>

                    <span>
                      {seg.distanceKm.toFixed(1)}km ·{" "}
                      {Math.round(seg.timeMin)}min · risk{" "}
                      {seg.risk}
                    </span>
                  </div>

                  {/* Risk bar */}
                  <div className="mt-1 h-[3px] overflow-hidden rounded-[3px] bg-[var(--app-grid)]">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(
                          100,
                          seg.risk
                        )}%`,
                        backgroundColor: risk,
                      }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}