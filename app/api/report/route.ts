import { NextRequest, NextResponse } from "next/server";
import { createOrMergeIncident } from "@/lib/hazards";
import { ReportInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: ReportInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const { incident, merged } = createOrMergeIncident(body);
    return NextResponse.json({ merged, incident }, { status: merged ? 200 : 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
