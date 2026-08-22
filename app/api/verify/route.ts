import { NextRequest, NextResponse } from "next/server";
import { castVote, Vote } from "@/lib/verification";

interface VerifyBody {
  incidentId: string;
  reporterId: string;
  vote: Vote;
}

export async function POST(req: NextRequest) {
  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.incidentId || !body.vote || !["confirm", "deny"].includes(body.vote)) {
    return NextResponse.json(
      { error: "incidentId and vote ('confirm' | 'deny') are required" },
      { status: 400 }
    );
  }

  try {
    const result = castVote(body.incidentId, body.reporterId, body.vote);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
