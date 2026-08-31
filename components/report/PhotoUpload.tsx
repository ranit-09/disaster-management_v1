"use client";

import { useRef } from "react";

export default function PhotoUpload({
  photoUrl,
  onChange,
}: {
  photoUrl: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Add photo */}
      {!photoUrl && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
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
            hover:bg-grid
          "
        >
          📷 Add Photo (optional)
        </button>
      )}

      {/* Photo preview */}
      {photoUrl && (
        <div className="flex items-center gap-3">
          <img
            src={photoUrl}
            alt="Hazard preview"
            className="
              h-16
              w-16
              rounded-[4px]
              border
              border-border
              object-cover
            "
          />

          <button
            type="button"
            onClick={() => onChange(null)}
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
              hover:bg-grid
            "
          >
            Remove photo
          </button>
        </div>
      )}
    </div>
  );
}
