import { NextRequest, NextResponse } from "next/server";
import { planRoute } from "@/lib/routing";
import { getActiveIncidents } from "@/lib/store";
import { refreshLifecycle } from "@/lib/verification";

interface RoutePlanBody {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
}

export async function POST(req: NextRequest) {
  let body: RoutePlanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.origin || !body.destination) {
    return NextResponse.json({ error: "origin and destination ({lat, lon}) are required" }, { status: 400 });
  }

  const incidents = getActiveIncidents().map((i) => refreshLifecycle(i));
  const plan = planRoute(body.origin, body.destination, incidents);

  if (plan.routes.length === 0) {
    return NextResponse.json({ error: "No passable route found", plan }, { status: 200 });
  }

  return NextResponse.json(plan);
}
