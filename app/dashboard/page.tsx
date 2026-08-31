"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import { SeverityBadge, StatusBadge } from "@/components/Badges";

interface Incident {
  id: string;
  hazardType: string;
  severity: string;
  status: string;
  confidence: number;
  verified: boolean;
  latitude: number;
  longitude: number;
  updatedAt: number;
}

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);

  useEffect(() => {
    axios
      .get("/api/incidents")
      .then((response) => {
        setIncidents(response.data.incidents);
      })
      .catch(() => {
        setIncidents([]);
      });
  }, []);

  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  incidents?.forEach((incident) => {
    const severity =
      incident.severity as keyof typeof counts;

    counts[severity] = (counts[severity] || 0) + 1;
  });

  return (
    <div className="mx-auto max-w-[920px] px-6 pt-8 pb-20">
      {/* PAGE HEADER */}
      <div className="mb-7">
        <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-amber">
          Command Overview
        </div>

        <h1 className="mb-2 font-display text-[28px] font-bold">
          Live incident dashboard.
        </h1>

        <p className="max-w-[560px] text-[14.5px] text-muted">
          Report hazards, watch the live map update, and get routes that
          avoid what&apos;s actually happening on the ground right now.
        </p>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* CRITICAL */}
        <div className="rounded-[6px] border border-border bg-bg-deep p-6">
          <div className="mb-2 font-mono text-xs text-muted">
            CRITICAL
          </div>

          <div className="text-[32px] font-bold bg-red">
            {counts.critical}
          </div>
        </div>

        {/* HIGH */}
        <div className="rounded-[6px] border border-border bg-bg-deep p-6">
          <div className="mb-2 font-mono text-xs text-muted">
            HIGH
          </div>

          <div className="text-[32px] font-bold text-amber">
            {counts.high}
          </div>
        </div>

        {/* TOTAL */}
        <div className="rounded-[6px] border border-border bg-bg-deep p-6">
          <div className="mb-2 font-mono text-xs text-muted">
            ACTIVE TOTAL
          </div>

          <div className="text-[32px] font-bold">
            {incidents?.length ?? "—"}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mb-7 flex flex-wrap gap-3">
        <Link href="/report">
          <button
            className="
              cursor-pointer
              rounded-[4px]
              border-none
              bg-amber
              px-5
              py-[11px]
              text-sm
              font-semibold
              text-bg-deep
              transition
              hover:brightness-110
            "
          >
            Report a Hazard
          </button>
        </Link>

        <Link href="/navigate">
          <button
            className="
              cursor-pointer
              rounded-[4px]
              border
              border-border
              bg-transparent
              px-5
              py-[11px]
              text-sm
              font-semibold
              text-[var(--app-fg)]
              transition
              bg-grid
            "
          >
            Plan a Safe Route
          </button>
        </Link>

        <Link href="/map">
          <button
            className="
              cursor-pointer
              rounded-[4px]
              border
              border-border
              bg-transparent
              px-5
              py-[11px]
              text-sm
              font-semibold
              text-fg
              transition
              bg-grid
            "
          >
            Open Live Map
          </button>
        </Link>
      </div>

      {/* RECENT INCIDENTS */}
      <div className="rounded-[6px] border border-border bg-bg-deep p-6">
        <h3 className="mb-4 font-display text-base">
          Most recent incidents
        </h3>

        {/* LOADING */}
        {incidents === null && (
          <div className="py-6 text-center text-sm text-muted">
            Loading…
          </div>
        )}

        {/* EMPTY */}
        {incidents?.length === 0 && (
          <div className="py-6 text-center text-sm text-muted">
            No incidents reported yet.
          </div>
        )}

        {/* INCIDENT LIST */}
        {incidents?.slice(0, 6).map((incident) => (
          <div
            key={incident.id}
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              border-t
              border-border
              py-2.5
            "
          >
            <div className="font-mono text-[13px]">
              {incident.hazardType.replace("_", " ")}
            </div>

            <div className="flex flex-wrap gap-3">
              <SeverityBadge severity={incident.severity} />

              <StatusBadge status={incident.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}