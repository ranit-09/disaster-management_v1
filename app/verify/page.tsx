"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import VerifyCard, { VerifiableIncident } from "@/components/verify/VerifyCard";

type SortMode = "needsReview" | "recent";

export default function VerifyPage() {
  const [incidents, setIncidents] = useState<VerifiableIncident[]>([]);

  const [busyId, setBusyId] = useState<string | null>(null);

  const [sortMode, setSortMode] = useState<SortMode>("needsReview");

  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const response = await axios.get("/api/incidents?status=active");

      setIncidents(response.data.incidents || []);
    } catch (error) {
      console.error("Failed to load incidents:", error);

      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function vote(incidentId: string, voteValue: "confirm" | "deny") {
    try {
      setBusyId(incidentId);

      await axios.post("/api/verify", {
        incidentId,
        reporterId: "web_user",
        vote: voteValue,
      });

      await load();
    } catch (error) {
      console.error("Failed to submit vote:", error);
    } finally {
      setBusyId(null);
    }
  }

  const sorted = [...incidents].sort((a, b) =>
    sortMode === "needsReview"
      ? a.confidence - b.confidence
      : b.updatedAt - a.updatedAt,
  );

  const needingReview = incidents.filter(
    (incident) => incident.confidence < 70,
  ).length;

  return (
    <main className="min-h-screen px-6 pb-20 pt-8 text-fg">
      <div className="mx-auto max-w-[920px]">
        <header className="mb-7">
          <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-amber">
            Flow 04
          </div>

          <h1 className="mb-2 font-display text-[28px] font-semibold">
            Community verification
          </h1>

          <p className="max-w-[560px] text-[14.5px] leading-6 text-muted">
            Confirm or deny active reports. Confidence crosses 70% → the
            incident becomes verified and carries full weight in routing.
          </p>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              className={
                sortMode === "needsReview"
                  ? `
                    rounded
                    bg-amber
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-bg-deep
                    transition
                    hover:brightness-110
                  `
                  : `
                    rounded
                    border
                    border-border
                    bg-transparent
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-fg
                    transition
                    hover:bg-grid
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
                    rounded
                    bg-amber
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-bg-deep
                    transition
                    hover:brightness-110
                  `
                  : `
                    rounded
                    border
                    border-border
                    bg-transparent
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-fg
                    transition
                    hover:bg-grid
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
                inline-block
                rounded-full
                border
                border-amber-border
                px-3
                py-1
                font-mono
                text-[11px]
                text-amber
              "
            >
              {needingReview} below 70% confidence
            </span>
          )}
        </div>

        {loading && (
          <div
            className="
              rounded-md
              border
              border-border
              bg-bg-deep
              px-6
              py-6
              text-center
              text-sm
              text-muted
            "
          >
            Loading…
          </div>
        )}

        {!loading && incidents.length === 0 && (
          <div
            className="
              rounded-md
              border
              border-border
              bg-bg-deep
              px-6
              py-6
              text-center
              text-sm
              text-muted
            "
          >
            No active incidents to verify.
          </div>
        )}

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
