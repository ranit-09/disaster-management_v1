export default function ConfidenceMeter({
  confidence,
}: {
  confidence: number;
}) {
  const colorClass =
    confidence >= 70
      ? "text-green"
      : confidence >= 40
        ? "text-amber"
        : "text-red";

  const barColor =
    confidence >= 70 ? "bg-green" : confidence >= 40 ? "bg-amber" : "bg-red";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
          Confidence
        </span>

        <span className={`font-mono text-xs font-semibold ${colorClass}`}>
          {confidence}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded bg-grid">
        <div
          className={`h-full transition-[width] duration-500 ease-out ${barColor}`}
          style={{
            width: `${confidence}%`,
          }}
        />
      </div>
    </div>
  );
}
