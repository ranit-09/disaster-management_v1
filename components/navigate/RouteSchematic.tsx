interface Segment {
  from: string;
  to: string;
  risk: number;
}

function riskColor(risk: number): string {
  if (risk >= 70) return "var(--app-red)";
  if (risk >= 35) return "var(--app-amber)";
  if (risk > 0) return "#f2d16a";

  return "var(--app-green)";
}

function nodeLabel(id: string): string {
  if (id === "origin") return "You";

  if (id === "destination") return "Dest";

  return id
    .replace("waypoint_", "WP-")
    .toUpperCase();
}

export default function RouteSchematic({
  path,
  segments,
}: {
  path: string[];
  segments: Segment[];
}) {
  const width = 100;

  const step =
    path.length > 1
      ? width / (path.length - 1)
      : width;

  return (
    <svg
      viewBox="0 0 100 34"
      className="h-14 w-full"
    >
      {/* Route lines */}
      {segments.map((seg, i) => {
        const x1 = i * step;
        const x2 = (i + 1) * step;

        return (
          <line
            key={`${seg.from}-${seg.to}`}
            x1={x1}
            y1={17}
            x2={x2}
            y2={17}
            stroke={riskColor(seg.risk)}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* Nodes */}
      {path.map((nodeId, i) => {
        const isOrigin = i === 0;
        const isDestination =
          i === path.length - 1;

        return (
          <g
            key={nodeId}
            transform={`translate(${i * step},17)`}
          >
            <circle
              r={3}
              fill={
                isOrigin
                  ? "var(--app-fg)"
                  : isDestination
                    ? "var(--app-green)"
                    : "var(--app-muted)"
              }
            />

            <text
              x={0}
              y={isDestination ? -8 : 12}
              fontSize="4.5"
              textAnchor="middle"
              fill="var(--app-muted)"
              fontFamily="var(--font-mono)"
            >
              {nodeLabel(nodeId)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}