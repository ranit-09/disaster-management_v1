const ICONS: Record<string, string> = {
  waterlogging: "💧",
  flood: "🌊",
  road_blocked: "🚧",
  fallen_tree: "🌳",
  building_collapse: "🏚️",
  fire: "🔥",
  medical_emergency: "🚑",
};

export function hazardIcon(hazardType: string): string {
  return ICONS[hazardType] ?? "⚠️";
}

export default function HazardIcon({ type, size = 18 }: { type: string; size?: number }) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>{hazardIcon(type)}</span>;
}
