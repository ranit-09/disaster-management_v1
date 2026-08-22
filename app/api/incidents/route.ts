import { NextRequest, NextResponse } from "next/server";
import { getAllIncidents } from "@/lib/store";
import { refreshLifecycle } from "@/lib/verification";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hazardType = searchParams.get("hazardType");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");

  let incidents = getAllIncidents().map((i) => refreshLifecycle(i));

  if (hazardType) incidents = incidents.filter((i) => i.hazardType === hazardType);
  if (severity) incidents = incidents.filter((i) => i.severity === severity);
  if (status) incidents = incidents.filter((i) => i.status === status);

  return NextResponse.json({ count: incidents.length, incidents });
}
