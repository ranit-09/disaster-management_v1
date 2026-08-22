"use client";

import { hazardIcon } from "@/components/HazardIcon";

const HAZARD_TYPES: { value: string; label: string }[] = [
  { value: "waterlogging", label: "Waterlogging" },
  { value: "flood", label: "Flood" },
  { value: "road_blocked", label: "Road Blocked" },
  { value: "fallen_tree", label: "Fallen Tree" },
  { value: "building_collapse", label: "Building Collapse" },
  { value: "fire", label: "Fire" },
  { value: "medical_emergency", label: "Medical Emergency" },
];

export default function HazardTypeGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
      {HAZARD_TYPES.map((hazard) => {
        const active = value === hazard.value;

        return (
          <button
            type="button"
            key={hazard.value}
            onClick={() =>
              onChange(active ? "" : hazard.value)
            }
            className={`
              flex
              cursor-pointer
              flex-col
              items-center
              gap-1.5
              rounded-[6px]
              border
              px-2
              py-3.5
              font-mono
              text-[11.5px]
              font-medium
              text-center
              transition
              duration-150
              ${
                active
                  ? "border-[var(--app-amber)] bg-[rgba(242,161,84,0.1)] text-[var(--app-amber)]"
                  : "border-[var(--app-grid-strong)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:border-[var(--app-amber)]"
              }
            `}
          >
            <span className="text-[22px]">
              {hazardIcon(hazard.value)}
            </span>

            {hazard.label}
          </button>
        );
      })}
    </div>
  );
}