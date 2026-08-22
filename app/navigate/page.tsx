"use client";

import { useState } from "react";
import RouteCard from "@/components/navigate/RouteCard";

export default function NavigatePage() {
  const [originLat, setOriginLat] = useState("22.4990");
  const [originLon, setOriginLon] = useState("88.3712");
  const [destLat, setDestLat] = useState("22.6540");
  const [destLon, setDestLon] = useState("88.4467");
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState("");

  function detectOrigin() {
    if (!navigator.geolocation) return;

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOriginLat(pos.coords.latitude.toFixed(6));
        setOriginLon(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  function swap() {
    setOriginLat(destLat);
    setOriginLon(destLon);
    setDestLat(originLat);
    setDestLon(originLon);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const res = await fetch("/api/route-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: {
            lat: parseFloat(originLat),
            lon: parseFloat(originLon),
          },
          destination: {
            lat: parseFloat(destLat),
            lon: parseFloat(destLon),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to plan route");
      }

      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded border border-white/15 bg-[#0d2b4e] px-3 py-2.5 text-sm text-[#eaf2f8] placeholder:text-[#9fb8cf] outline-none transition focus:border-[#f2a154]";

  const buttonClass =
    "rounded bg-[#f2a154] px-5 py-2.5 text-sm font-semibold text-[#081b34] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";

  const ghostButtonClass =
    "rounded border border-white/15 bg-transparent px-4 py-2 text-sm font-semibold text-[#eaf2f8] transition hover:border-white/25 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main
      className="
        min-h-screen px-6 pb-20 pt-8 text-[#eaf2f8]
        font-[Inter]
        bg-[#0d2b4e]
        bg-[linear-gradient(rgba(234,242,248,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(234,242,248,0.09)_1px,transparent_1px)]
        bg-[size:32px_32px]
      "
    >
      <div className="mx-auto max-w-[920px]">
        <header className="mb-7">
          <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-[#f2a154]">
            Flow 02
          </div>

          <h1 className="mb-2 font-[Space_Grotesk] text-3xl font-semibold">
            Plan a safe route
          </h1>

          <p className="max-w-[560px] text-sm leading-6 text-[#9fb8cf]">
            Route Score = Travel Time + Distance + Risk. Risk comes straight
            from whatever incidents are active right now.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="
            mb-6 rounded-md border border-white/15
            bg-[#081b34] p-6
          "
        >
          <div className="grid grid-cols-1 gap-6 min-[720px]:grid-cols-2">
            {/* Origin */}
            <div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#9fb8cf]">
                  Origin
                </label>

                <div className="flex gap-3">
                  <input
                    value={originLat}
                    onChange={(e) => setOriginLat(e.target.value)}
                    placeholder="Lat"
                    required
                    className={inputClass}
                  />

                  <input
                    value={originLon}
                    onChange={(e) => setOriginLon(e.target.value)}
                    placeholder="Lon"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="button"
                className={ghostButtonClass}
                onClick={detectOrigin}
                disabled={locating}
              >
                {locating ? "Detecting…" : "📍 Use my location"}
              </button>
            </div>

            {/* Destination */}
            <div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#9fb8cf]">
                  Destination
                </label>

                <div className="flex gap-3">
                  <input
                    value={destLat}
                    onChange={(e) => setDestLat(e.target.value)}
                    placeholder="Lat"
                    required
                    className={inputClass}
                  />

                  <input
                    value={destLon}
                    onChange={(e) => setDestLon(e.target.value)}
                    placeholder="Lon"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="button"
                className={ghostButtonClass}
                onClick={swap}
              >
                ⇅ Swap with origin
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${buttonClass} mt-5`}
          >
            {loading ? "Calculating…" : "Find Safe Route"}
          </button>

          {error && (
            <div className="mt-2 text-[13px] text-[#ff6b5e]">
              {error}
            </div>
          )}
        </form>

        {plan && plan.routes?.length === 0 && (
          <div
            className="
              rounded-md border border-white/15
              bg-[#081b34] px-6 py-6
              text-center text-sm text-[#9fb8cf]
            "
          >
            No passable route found — every candidate path is blocked by a
            critical incident.
          </div>
        )}

        {plan && plan.routes?.length > 0 && (
          <div className="grid grid-cols-1 gap-4 min-[820px]:grid-cols-3">
            {plan.routes.map((r: any) => (
              <RouteCard key={r.label} route={r} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
