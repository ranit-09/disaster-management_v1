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
            ? "border-green bg-green-soft text-green"
            : severity.value === "medium"
              ? "border-yellow bg-yellow-soft text-yellow"
              : severity.value === "high"
                ? "border-amber bg-amber-soft text-amber"
                : "border-red bg-red-soft text-red";

        return (
          <button
            type="button"
            key={severity.value}
            onClick={() => onChange(active ? "" : severity.value)}
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
                  : "border-border bg-bg text-muted hover:border-amber"
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
