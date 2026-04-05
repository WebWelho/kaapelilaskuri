import { CalculatorForm } from "@/components/Calculator/CalculatorForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-lg font-bold text-white">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              SähköAI — Kaapelimitoitus
            </h1>
            <p className="text-xs text-[var(--muted)]">
              Sulake &amp; kaapeli SFS 6000 -standardin mukaan
            </p>
          </div>
          <div className="ml-auto">
            <span className="rounded-full bg-[var(--accent-light)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-dark)]">
              Beta
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <CalculatorForm />
      </main>
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-xs text-[var(--muted)]">
        TPCore Oy — SähköAI Kaapelimitoitus v0.2
      </footer>
    </div>
  );
}
