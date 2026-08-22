"use client";

const SEVERITIES = [
  {
    value: "low",
    label: "Low",
  },
  {
    value: "medium",
    label: "Medium",
  },
  {
    value: "high",
    label: "High",
  },
  {
    value: "critical",
    label: "Critical",
  },
];

export default function SeverityPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {SEVERITIES.map((severity) => {
        const active = value === severity.value;

        const activeClasses =
          severity.value === "low"
            ? "border-[var(--app-green)] bg-[rgba(79,216,184,0.13)] text-[var(--app-green)]"
            : severity.value === "medium"
            ? "border-[#f2d16a] bg-[rgba(242,209,106,0.13)] text-[#f2d16a]"
            : severity.value === "high"
            ? "border-[var(--app-amber)] bg-[rgba(242,161,84,0.13)] text-[var(--app-amber)]"
            : "border-[var(--app-red)] bg-[rgba(255,107,94,0.13)] text-[var(--app-red)]";

        return (
          <button
            type="button"
            key={severity.value}
            onClick={() =>
              onChange(active ? "" : severity.value)
            }
            className={`
              flex-1
              cursor-pointer
              rounded-[4px]
              border
              px-1.5
              py-2.5
              font-mono
              text-xs
              font-semibold
              uppercase
              tracking-[0.04em]
              transition
              duration-150
              ${
                active
                  ? activeClasses
                  : "border-[var(--app-grid-strong)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:border-[var(--app-amber)]"
              }
            `}
          >
            {severity.label}
          </button>
        );
      })}
    </div>
  );
}