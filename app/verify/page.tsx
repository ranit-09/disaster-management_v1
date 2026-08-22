"use client";

import { useEffect, useState } from "react";
import VerifyCard, {
  VerifiableIncident,
} from "@/components/verify/VerifyCard";

type SortMode = "needsReview" | "recent";

export default function VerifyPage() {
  const [incidents, setIncidents] = useState<VerifiableIncident[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("needsReview");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/incidents?status=active");
    const data = await res.json();

    setIncidents(data.incidents || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function vote(
    incidentId: string,
    voteValue: "confirm" | "deny"
  ) {
    setBusyId(incidentId);

    await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        incidentId,
        reporterId: "web_user",
        vote: voteValue,
      }),
    });

    await load();
    setBusyId(null);
  }

  const sorted = [...incidents].sort((a, b) =>
    sortMode === "needsReview"
      ? a.confidence - b.confidence
      : b.updatedAt - a.updatedAt
  );

  const needingReview = incidents.filter(
    (i) => i.confidence < 70
  ).length;

  return (
    <main
      className="
        min-h-screen px-6 pb-20 pt-8 text-[#eaf2f8]
        bg-[#0d2b4e]
        bg-[linear-gradient(rgba(234,242,248,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(234,242,248,0.09)_1px,transparent_1px)]
        bg-[size:32px_32px]
      "
    >
      <div className="mx-auto max-w-[920px]">
        {/* Header */}
        <header className="mb-7">
          <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-[#f2a154]">
            Flow 04
          </div>

          <h1 className="mb-2 font-[Space_Grotesk] text-[28px] font-semibold">
            Community verification
          </h1>

          <p className="max-w-[560px] text-[14.5px] leading-6 text-[#9fb8cf]">
            Confirm or deny active reports. Confidence crosses 70% → the
            incident becomes verified and carries full weight in routing.
          </p>
        </header>

        {/* Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className={
                sortMode === "needsReview"
                  ? `
                    rounded bg-[#f2a154] px-5 py-2.5
                    text-sm font-semibold text-[#081b34]
                    transition hover:brightness-110
                  `
                  : `
                    rounded border border-white/15 bg-transparent
                    px-5 py-2.5 text-sm font-semibold text-[#eaf2f8]
                    transition hover:border-white/25 hover:bg-white/5
                  `
              }
              onClick={() => setSortMode("needsReview")}
            >
              Needs review first
            </button>

            <button
              className={
                sortMode === "recent"
                  ? `
                    rounded bg-[#f2a154] px-5 py-2.5
                    text-sm font-semibold text-[#081b34]
                    transition hover:brightness-110
                  `
                  : `
                    rounded border border-white/15 bg-transparent
                    px-5 py-2.5 text-sm font-semibold text-[#eaf2f8]
                    transition hover:border-white/25 hover:bg-white/5
                  `
              }
              onClick={() => setSortMode("recent")}
            >
              Most recent first
            </button>
          </div>

          {!loading && (
            <span
              className="
                inline-block rounded-full
                border border-[#f2a154]/40
                px-3 py-1
                font-mono text-[11px]
                text-[#f2a154]
              "
            >
              {needingReview} below 70% confidence
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="
              rounded-md border border-white/15
              bg-[#081b34] px-6 py-6
              text-center text-sm text-[#9fb8cf]
            "
          >
            Loading…
          </div>
        )}

        {/* Empty */}
        {!loading && incidents.length === 0 && (
          <div
            className="
              rounded-md border border-white/15
              bg-[#081b34] px-6 py-6
              text-center text-sm text-[#9fb8cf]
            "
          >
            No active incidents to verify.
          </div>
        )}

        {/* Incident cards */}
        <div className="flex flex-col gap-3">
          {sorted.map((incident) => (
            <VerifyCard
              key={incident.id}
              incident={incident}
              busy={busyId === incident.id}
              onVote={vote}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
