import { SeverityBadge, StatusBadge } from "@/components/Badges";
import HazardIcon from "@/components/HazardIcon";
import ConfidenceMeter from "@/components/verify/ConfidenceMeter";

export interface VerifiableIncident {
  id: string;
  hazardType: string;
  severity: string;
  status: string;
  confidence: number;
  verified: boolean;
  confirmations: number;
  rejections: number;
  reporterIds: string[];
  updatedAt: number;
}

function timeAgo(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);

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

export default function VerifyCard({
  incident,
  busy,
  onVote,
}: {
  incident: VerifiableIncident;
  busy: boolean;
  onVote: (
    id: string,
    vote: "confirm" | "deny"
  ) => void;
}) {
  return (
    <div className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-sm">
          <HazardIcon type={incident.hazardType} />

          {incident.hazardType.replace("_", " ")}
        </span>

        <div className="flex flex-wrap gap-3">
          <SeverityBadge severity={incident.severity} />

          <StatusBadge status={incident.status} />

          {incident.verified && (
            <span className="rounded-full border border-[rgba(79,216,184,0.4)] px-2.5 py-1 font-mono text-[11px] text-[var(--app-green)]">
              verified
            </span>
          )}
        </div>
      </div>

      {/* Confidence */}
      <ConfidenceMeter confidence={incident.confidence} />

      {/* Metadata */}
      <div className="my-[10px] mb-4 font-mono text-[11px] text-[var(--app-muted)]">
        {incident.confirmations} confirm
        {incident.confirmations === 1 ? "" : "s"} ·{" "}
        {incident.rejections} den
        {incident.rejections === 1 ? "y" : "ies"} ·{" "}
        {incident.reporterIds.length} reporter
        {incident.reporterIds.length === 1 ? "" : "s"} · updated{" "}
        {timeAgo(incident.updatedAt)}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          disabled={busy}
          onClick={() => onVote(incident.id, "confirm")}
        >
          👍 Confirm
        </button>

        <button
          className="border border-[var(--app-grid-strong)] bg-transparent text-[var(--app-fg)]"
          disabled={busy}
          onClick={() => onVote(incident.id, "deny")}
        >
          👎 Not present
        </button>
      </div>
    </div>
  );
}