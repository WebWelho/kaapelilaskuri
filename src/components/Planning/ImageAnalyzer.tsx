"use client";

import { useState, useRef } from "react";
import type { Room } from "@/lib/planning_model/types";

interface ImageAnalyzerProps {
  onRoomsDetected: (rooms: Room[], name: string) => void;
}

export function ImageAnalyzer({ onRoomsDetected }: ImageAnalyzerProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);
      setMessage(null);

      try {
        const base64 = dataUrl.split(",")[1];
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType: file.type }),
        });

        const data = await res.json();

        if (data.error) {
          setMessage(data.error);
          return;
        }

        if (data.message) {
          setMessage(data.message);
        }

        if (data.rooms?.length > 0) {
          const rooms: Room[] = data.rooms.map(
            (
              r: { type: Room["type"]; name: string; areaM2: number },
              i: number,
            ) => {
              const side = Math.sqrt(r.areaM2) * 1000;
              return {
                id: `ai-${Date.now()}-${i}`,
                type: r.type,
                name: r.name,
                areaM2: r.areaM2,
                x: 0,
                y: 0,
                widthMm: Math.round(side * 1.2),
                depthMm: Math.round(side / 1.2),
                walls: [],
                doors: [],
                windows: [],
              };
            },
          );
          onRoomsDetected(rooms, "AI-tunnistettu pohjapiirros");
        }
      } catch {
        setMessage("Kuvan analysointi epäonnistui");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--bg-card)] p-5">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!preview && (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 py-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-2xl">
            📸
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Lataa pohjapiirros tai ota kuva
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              AI tunnistaa huoneet automaattisesti (Gemini Vision)
            </div>
          </div>
        </button>
      )}

      {preview && (
        <div className="space-y-3">
          <img
            src={preview}
            alt="Pohjapiirros"
            className="max-h-48 w-full rounded-lg object-contain"
          />
          {loading && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-accent)] border-t-transparent" />
              <span className="text-sm text-[var(--text-muted)]">
                Analysoidaan...
              </span>
            </div>
          )}
          {message && (
            <p className="rounded-lg bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-warn)]">
              {message}
            </p>
          )}
          <button
            onClick={() => {
              setPreview(null);
              setMessage(null);
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Lataa uusi kuva
          </button>
        </div>
      )}
    </div>
  );
}
