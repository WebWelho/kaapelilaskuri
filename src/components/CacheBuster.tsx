"use client";

import { useState, useCallback } from "react";

export function CacheBuster() {
  const [clicks, setClicks] = useState(0);
  const [clearing, setClearing] = useState(false);

  const handleClick = useCallback(() => {
    setClicks((c) => {
      if (c + 1 >= 5) return 5;
      return c + 1;
    });
  }, []);

  const clearAll = useCallback(async () => {
    setClearing(true);

    // 1. Poista Service Worker
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    // 2. Tyhjennä kaikki cachet
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }

    // 3. Lataa sivu uudelleen
    window.location.reload();
  }, []);

  if (clicks >= 5) {
    return (
      <div className="mt-2 space-y-2">
        <button
          onClick={clearAll}
          disabled={clearing}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
        >
          {clearing ? "Tyhjennetään..." : "Tyhjennä välimuisti + päivitä"}
        </button>
        <button
          onClick={() => setClicks(0)}
          className="ml-2 text-[10px] text-[var(--text-muted)]"
        >
          peruuta
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="cursor-default select-none"
      title={clicks > 2 ? `${5 - clicks} klikkausta...` : undefined}
    >
      v0.2
    </button>
  );
}
