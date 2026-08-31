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
  onVote: (id: string, vote: "confirm" | "deny") => void;
}) {
  return (
    <div className="rounded-[6px] border border-border bg-bg-deep p-6">
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
            <span className="rounded-full border border-green-border px-2.5 py-1 font-mono text-[11px] text-green">
              verified
            </span>
          )}
        </div>
      </div>

      {/* Confidence */}
      <ConfidenceMeter confidence={incident.confidence} />

      {/* Metadata */}
      <div className="my-[10px] mb-4 font-mono text-[11px] text-muted">
        {incident.confirmations} confirm
        {incident.confirmations === 1 ? "" : "s"} · {incident.rejections} den
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
          className="
            cursor-pointer
            rounded-[4px]
            border
            border-green-border
            bg-green-soft
            px-4
            py-2
            text-sm
            font-semibold
            text-green
            transition
            hover:brightness-110
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          👍 Confirm
        </button>

        <button
          type="button"
          className="cursor-pointer
            rounded-[4px]
            border
            border-border
            bg-transparent
            px-4
            py-2
            text-sm
            font-semibold
            text-fg
            transition
            hover:border-amber
            disabled:cursor-not-allowed
            disabled:opacity-50"
          disabled={busy}
          onClick={() => onVote(incident.id, "deny")}
        >
          👎 Not present
        </button>
      </div>
    </div>
  );
}
