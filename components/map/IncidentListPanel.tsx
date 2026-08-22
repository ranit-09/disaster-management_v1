import {
  SeverityBadge,
  StatusBadge,
} from "@/components/Badges";

import HazardIcon from "@/components/HazardIcon";

import type { Incident } from "@/components/map/HazardMap";

export default function IncidentListPanel({
  incidents,
  loading,
}: {
  incidents: Incident[];
  loading: boolean;
}) {
  return (
    <div className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
      <h3 className="mb-3.5 text-[15px] font-semibold">
        Incident list ({incidents.length})
      </h3>

      {loading && (
        <div className="py-6 text-center text-sm text-[var(--app-muted)]">
          Loading…
        </div>
      )}

      {!loading && incidents.length === 0 && (
        <div className="py-6 text-center text-sm text-[var(--app-muted)]">
          No incidents match this filter.
        </div>
      )}

      <div className="flex max-h-[400px] flex-col gap-2.5 overflow-y-auto">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="border-t border-[var(--app-grid-strong)] pt-2.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-mono text-[13px]">
                <HazardIcon
                  type={incident.hazardType}
                  size={15}
                />

                {incident.hazardType.replace(
                  "_",
                  " "
                )}
              </span>

              <div className="flex flex-wrap gap-3">
                <SeverityBadge
                  severity={incident.severity}
                />

                <StatusBadge
                  status={incident.status}
                />
              </div>
            </div>

            {/* Confidence */}
            <div className="mt-1 font-mono text-[11px] text-[var(--app-muted)]">
              confidence {incident.confidence}% ·{" "}
              {incident.verified
                ? "verified"
                : "unverified"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}