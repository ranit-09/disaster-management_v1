const HAZARD_TYPES = [
  "waterlogging",
  "flood",
  "road_blocked",
  "fallen_tree",
  "building_collapse",
  "fire",
  "medical_emergency",
];

const SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
];

export default function IncidentFilters({
  hazardFilter,
  severityFilter,
  onHazardChange,
  onSeverityChange,
}: {
  hazardFilter: string;
  severityFilter: string;
  onHazardChange: (v: string) => void;
  onSeverityChange: (v: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-3">
      <select
        value={hazardFilter}
        onChange={(e) =>
          onHazardChange(e.target.value)
        }
        className="min-w-[180px]"
      >
        <option value="">All hazard types</option>

        {HAZARD_TYPES.map((hazard) => (
          <option key={hazard} value={hazard}>
            {hazard.replace("_", " ")}
          </option>
        ))}
      </select>

      <select
        value={severityFilter}
        onChange={(e) =>
          onSeverityChange(e.target.value)
        }
        className="min-w-[150px]"
      >
        <option value="">All severities</option>

        {SEVERITIES.map((severity) => (
          <option
            key={severity}
            value={severity}
          >
            {severity}
          </option>
        ))}
      </select>
    </div>
  );
}