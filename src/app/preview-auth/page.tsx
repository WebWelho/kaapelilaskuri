"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PreviewAuthForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get("from") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/preview-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, redirectTo }),
      });

      if (!res.ok) {
        setError("Väärä salasana");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Jokin meni pieleen");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Kaapelimitoitus
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Suljettu esikatselu — syötä salasana
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Salasana"
            autoFocus
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Tarkistetaan..." : "Kirjaudu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PreviewAuthPage() {
  return (
    <Suspense>
      <PreviewAuthForm />
    </Suspense>
  );
}
