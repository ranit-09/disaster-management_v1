export default function ConfidenceMeter({
  confidence,
}: {
  confidence: number;
}) {
  const color =
    confidence >= 70
      ? "var(--app-green)"
      : confidence >= 40
        ? "var(--app-amber)"
        : "var(--app-red)";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
          Confidence
        </span>

        <span
          className="font-mono text-xs font-semibold"
          style={{ color }}
        >
          {confidence}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded bg-[var(--app-grid)]">
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${confidence}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}