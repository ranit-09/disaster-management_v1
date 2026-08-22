export function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const base =
    "inline-block rounded-full border px-2.5 py-1 font-mono text-[11px]";

  const cls =
    severity === "critical"
      ? "border-[rgba(255,107,94,0.4)] text-[var(--app-red)]"
      : severity === "high"
      ? "border-[rgba(242,161,84,0.4)] text-[var(--app-amber)]"
      : severity === "medium"
      ? "border-[var(--app-grid-strong)] text-[var(--app-muted)]"
      : "border-[rgba(79,216,184,0.4)] text-[var(--app-green)]";

  return (
    <span className={`${base} ${cls}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const base =
    "inline-block rounded-full border px-2.5 py-1 font-mono text-[11px]";

  const cls =
    status === "resolved"
      ? "border-[rgba(79,216,184,0.4)] text-[var(--app-green)]"
      : status === "stale"
      ? "border-[var(--app-grid-strong)] text-[var(--app-muted)]"
      : "border-[rgba(242,161,84,0.4)] text-[var(--app-amber)]";

  return (
    <span className={`${base} ${cls}`}>
      {status}
    </span>
  );
}