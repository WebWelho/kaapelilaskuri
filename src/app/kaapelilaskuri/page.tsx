import Link from "next/link";
import { CalculatorForm } from "@/components/Calculator/CalculatorForm";
import { CacheBuster } from "@/components/CacheBuster";

export default function KaapelilaskuriPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--text-accent)] to-cyan-600 text-lg font-bold text-white shadow-[0_0_20px_var(--accent-glow)]"
          >
            ⚡
          </Link>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)] sm:text-lg">
              Kaapelimitoitus
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">
              Sähköalan ammattilaisen apuväline · SFS 6000
            </p>
          </div>
          <div className="ml-auto">
            <span className="rounded-full border border-[var(--border-accent)] bg-[var(--accent-glow)] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-accent)]">
              BETA
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
        <CalculatorForm />
      </main>

      <footer className="border-t border-[var(--border-subtle)] px-4 py-6 text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
        <p>
          TPCore · Kaapelimitoituslaskuri <CacheBuster /> (beta)
        </p>
        <p className="mt-1">
          Sähköalan ammattilaisten apuväline. Ei korvaa standardikirjaa tai
          pätevän suunnittelijan arviota.
        </p>
        <p className="mt-1">
          Laskenta perustuu SFS 6000:2017 julkisiin periaatteisiin. Tarkista
          aina lopullinen mitoitus standardikirjasta.
        </p>
      </footer>
    </div>
  );
}
