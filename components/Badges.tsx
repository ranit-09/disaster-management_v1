export function SeverityBadge({ severity }: { severity: string }) {
  const base =
    "inline-block rounded-full border px-2.5 py-1 font-mono text-[11px]";

  const cls =
    severity === "critical"
      ? "border-red-border text-red"
      : severity === "high"
        ? "border-amber-border text-amber"
        : severity === "medium"
          ? "border-border text-muted"
          : "border-green-border text-green";

  return <span className={`${base} ${cls}`}>{severity}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const base =
    "inline-block rounded-full border px-2.5 py-1 font-mono text-[11px]";

  const cls =
    status === "resolved"
      ? "border-green-border text-green"
      : status === "stale"
        ? "border-border text-muted"
        : "border-amber-border text-amber";

  return <span className={`${base} ${cls}`}>{status}</span>;
}
