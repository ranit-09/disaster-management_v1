const SEVERITY_LEGEND = [
  {
    label: "Low",
    color: "#4fd8b8",
  },
  {
    label: "Medium",
    color: "#f2d16a",
  },
  {
    label: "High",
    color: "#f2a154",
  },
  {
    label: "Critical",
    color: "#ff6b5e",
  },
];

export default function MapLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {SEVERITY_LEGEND.map((severity) => (
        <div
          key={severity.label}
          className="flex items-center gap-1.5 text-[12.5px] text-[var(--app-muted)]"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: severity.color,
            }}
          />

          {severity.label}
        </div>
      ))}

      {/* Active marker indicator */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--app-muted)]">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-[1.5px] border-[var(--app-muted)]" />

        Pulsing ring = active
      </div>
    </div>
  );
}