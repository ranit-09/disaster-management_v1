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
  const [locationError, setLocationError] = useState("");

  const [address, setAddress] = useState("");
  const [hazardType, setHazardType] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationError("This browser doesn't support geolocation — enter coordinates or an address manually.");
      return;
    }

    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError("Location permission denied — allow it in your browser's site settings and try again.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError("Position unavailable — GPS/network location couldn't be determined right now.");
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Location request timed out — try again, or enter coordinates/address manually.");
        } else {
          setLocationError("Couldn't get your location — enter coordinates or an address manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      //const {data} = await axios.post("")
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
      setAddress("");
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
        <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-amber">
          Flow 01
        </div>

        <h1 className="mb-2 font-display text-[28px] font-bold">
          Report a hazard
        </h1>

        <p className="max-w-[560px] text-[14.5px] text-muted">
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
          className="rounded-[6px] border border-border bg-bg-deep p-6"
        >
          {/* LOCATION */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
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
                  border-border
                  bg-bg
                  px-3
                  py-2.5
                  text-sm
                  text-fg
                  outline-none
                  focus:border-amber
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
                  border-border
                  bg-bg
                  px-3
                  py-2.5
                  text-sm
                  text-fg
                  outline-none
                  focus:border-amber
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
                border-border
                bg-transparent
                px-5
                py-[11px]
                text-sm
                font-semibold
                text-fg
                transition
                hover:bg-grid
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
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
              Hazard type (optional if description given)
            </label>

            <HazardTypeGrid
              value={hazardType}
              onChange={setHazardType}
            />
          </div>

          {/* SEVERITY */}
          <div className="mb-4 mt-5 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
              Severity (optional)
            </label>

            <SeverityPicker
              value={severity}
              onChange={setSeverity}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-4 mt-5 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
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
                border-border
                bg-bg
                px-3
                py-2.5
                text-sm
                text-fg
                outline-none
                focus:border-amber
              "
            />
          </div>

          {/* PHOTO */}
          <div className="mb-4 flex flex-col gap-1.5">
            <label className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted">
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
              bg-amber
              px-5
              py-[11px]
              text-sm
              font-semibold
              text-bg-deep
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
            <div className="mt-2 text-[13px] text-red">
              {error}
            </div>
          )}
        </form>

        {/* RESPONSE */}
        <div className="rounded-[6px] border border-border bg-bg-deep p-6">
          <h3 className="mb-3.5 font-display text-[15px]">
            Response
          </h3>

          {/* EMPTY STATE */}
          {!result && (
            <div className="py-6 text-center text-sm text-muted">
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
                    text-green
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
                      text-amber
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
                    border-border
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
                  text-muted
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