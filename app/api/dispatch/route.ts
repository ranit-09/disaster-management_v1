import { NextRequest, NextResponse } from "next/server";
import { findNearestResponderAndRoute } from "@/lib/routing";
import { getActiveIncidents, getIncident } from "@/lib/store";
import { Responder } from "@/lib/types";

interface DispatchBody {
  incidentId: string;
  responders: Responder[];
}

export async function POST(req: NextRequest) {
  let body: DispatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.incidentId || !Array.isArray(body.responders)) {
    return NextResponse.json(
      { error: "incidentId and responders ([{id, lat, lon, available}]) are required" },
      { status: 400 }
    );
  }

  const incident = getIncident(body.incidentId);
  if (!incident) {
    return NextResponse.json({ error: `Incident ${body.incidentId} not found` }, { status: 404 });
  }

  try {
    const result = findNearestResponderAndRoute(
      { lat: incident.latitude, lon: incident.longitude },
      body.responders,
      getActiveIncidents()
    );
    return NextResponse.json({ incident, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
