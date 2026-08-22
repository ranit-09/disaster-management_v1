"use client";

import { useState } from "react";
import axios from "axios";

import HazardTypeGrid from "@/components/report/HazardTypeGrid";
import SeverityPicker from "@/components/report/SeverityPicker";
import PhotoUpload from "@/components/report/PhotoUpload";

interface Incident {
  id: string;
  hazardType: string;
  severity: string;
  latitude: number;
  longitude: number;
}

export default function ReportPage() {
  const [latitude, setLatitude] = useState("22.5726");
  const [longitude, setLongitude] = useState("88.3639");
  const [locating, setLocating] = useState(false);

  const [hazardType, setHazardType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  function detectLocation() {
    if (!navigator.geolocation) return;

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("/api/report", {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        hazardType: hazardType || undefined,
        severity: severity || undefined,
        description: description || undefined,
        photoUrl: photoUrl || undefined,
        reporterId: "web_user",
      });

      setResult(response.data);

      // Reset form fields
      setHazardType("");
      setSeverity("");
      setDescription("");
      setPhotoUrl(null);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to submit report"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[920px] px-6 pt-8 pb-20">
      {/* PAGE HEADER */}
      <div className="mb-7">
        <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-[var(--app-amber)]">
          Flow 01
        </div>

        <h1 className="mb-2 font-[var(--font-display)] text-[28px] font-bold">
          Report a hazard
        </h1>

        <p className="max-w-[560px] text-[14.5px] text-[var(--app-muted)]">
          Drop a pin, pick what you're seeing, and submit. Leave
          hazard type or severity unselected to let the description
          auto-fill them.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* REPORT FORM */}
        <form
          onSubmit={submit}
          className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6"
        >
          {/* LOCATION */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
              Location
            </label>

            <div className="mb-2 flex flex-col gap-3 sm:flex-row">
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                required
                className="
                  min-w-0
                  flex-1
                  rounded-[4px]
                  border
                  border-[var(--app-grid-strong)]
                  bg-[var(--app-bg)]
                  px-3
                  py-2.5
                  text-sm
                  text-[var(--app-fg)]
                  outline-none
                  focus:border-[var(--app-amber)]
                "
              />

              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                required
                className="
                  min-w-0
                  flex-1
                  rounded-[4px]
                  border
                  border-[var(--app-grid-strong)]
                  bg-[var(--app-bg)]
                  px-3
                  py-2.5
                  text-sm
                  text-[var(--app-fg)]
                  outline-none
                  focus:border-[var(--app-amber)]
                "
              />
            </div>

            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="
                w-fit
                cursor-pointer
                rounded-[4px]
                border
                border-[var(--app-grid-strong)]
                bg-transparent
                px-5
                py-[11px]
                text-sm
                font-semibold
                text-[var(--app-fg)]
                transition
                hover:bg-[var(--app-grid)]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {locating
                ? "Detecting…"
                : "📍 Auto-detect GPS"}
            </button>
          </div>

          {/* HAZARD TYPE */}
          <div className="mb-4 mt-5 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
              Hazard type (optional if description given)
            </label>

            <HazardTypeGrid
              value={hazardType}
              onChange={setHazardType}
            />
          </div>

          {/* SEVERITY */}
          <div className="mb-4 mt-5 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
              Severity (optional)
            </label>

            <SeverityPicker
              value={severity}
              onChange={setSeverity}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-4 mt-5 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. The road is completely underwater and cars cannot move."
              className="
                min-h-[70px]
                resize-y
                rounded-[4px]
                border
                border-[var(--app-grid-strong)]
                bg-[var(--app-bg)]
                px-3
                py-2.5
                text-sm
                text-[var(--app-fg)]
                outline-none
                focus:border-[var(--app-amber)]
              "
            />
          </div>

          {/* PHOTO */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--app-muted)]">
              Photo
            </label>

            <PhotoUpload
              photoUrl={photoUrl}
              onChange={setPhotoUrl}
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-2
              cursor-pointer
              rounded-[4px]
              border-none
              bg-[var(--app-amber)]
              px-5
              py-[11px]
              text-sm
              font-semibold
              text-[var(--app-bg-deep)]
              transition
              hover:brightness-110
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Submitting…" : "Submit Report"}
          </button>

          {/* ERROR */}
          {error && (
            <div className="mt-2 text-[13px] text-[var(--app-red)]">
              {error}
            </div>
          )}
        </form>

        {/* RESPONSE */}
        <div className="rounded-[6px] border border-[var(--app-grid-strong)] bg-[var(--app-bg-deep)] p-6">
          <h3 className="mb-3.5 font-[var(--font-display)] text-[15px]">
            Response
          </h3>

          {/* EMPTY STATE */}
          {!result && (
            <div className="py-6 text-center text-sm text-[var(--app-muted)]">
              Submit a report to see the processed incident here.
            </div>
          )}

          {/* RESULT */}
          {result && (
            <>
              {/* RESULT BADGES */}
              <div className="mb-3 flex flex-wrap gap-3">
                <span
                  className="
                    inline-block
                    rounded-full
                    border
                    border-[rgba(79,216,184,0.4)]
                    px-2.5
                    py-1
                    font-mono
                    text-[11px]
                    text-[var(--app-green)]
                  "
                >
                  {result.merged
                    ? "merged into existing incident"
                    : "new incident created"}
                </span>

                {result.incident.aiExtracted && (
                  <span
                    className="
                      inline-block
                      rounded-full
                      border
                      border-[rgba(242,161,84,0.4)]
                      px-2.5
                      py-1
                      font-mono
                      text-[11px]
                      text-[var(--app-amber)]
                    "
                  >
                    fields auto-extracted from description
                  </span>
                )}
              </div>

              {/* PHOTO */}
              {result.incident.photoUrl && (
                <img
                  src={result.incident.photoUrl}
                  alt="Submitted hazard"
                  className="
                    mb-3
                    h-auto
                    max-h-[160px]
                    w-full
                    rounded-[4px]
                    border
                    border-[var(--app-grid-strong)]
                    object-cover
                  "
                />
              )}

              {/* JSON RESPONSE */}
              <pre
                className="
                  whitespace-pre-wrap
                  font-mono
                  text-[12.5px]
                  text-[var(--app-muted)]
                "
              >
                {JSON.stringify(
                  {
                    ...result.incident,
                    photoUrl: result.incident.photoUrl
                      ? "(attached above)"
                      : undefined,
                  },
                  null,
                  2
                )}
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}