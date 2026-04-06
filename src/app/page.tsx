import Link from "next/link";
import { CacheBuster } from "@/components/CacheBuster";

const TOOLS = [
  {
    href: "/kaapelilaskuri",
    title: "Kaapelimitoitus",
    description:
      "Sulake, kaapeli, jännitteenalenema, oikosulkuvirta. Cu/Al, PVC/XLPE.",
    badge: "BETA",
    icon: "🔌",
  },
  {
    href: "/suunnittelu",
    title: "Sähkösuunnittelu",
    description:
      "Pohjapiirros → sähköpisteet → ryhmäjako → piiriluettelo. SFS 6000.",
    badge: "PROTO",
    icon: "📐",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--text-accent)] to-cyan-600 text-xl font-bold text-white shadow-[0_0_20px_var(--accent-glow)]">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Sähkötyökalut
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Sähköalan ammattilaisen apuvälineet · SFS 6000
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--border-accent)] hover:bg-[var(--bg-card-hover)] hover:shadow-[0_0_30px_var(--accent-glow)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-glow)] text-2xl">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--text-accent)]">
                      {tool.title}
                    </h2>
                    <span className="rounded-full border border-[var(--border-accent)] bg-[var(--accent-glow)] px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-[var(--text-accent)]">
                      {tool.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {tool.description}
                  </p>
                </div>
                <span className="mt-1 text-[var(--text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--text-accent)]">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] px-4 py-6 text-center text-[11px] leading-relaxed text-[var(--text-muted)]">
        <p>
          TPCore · Sähkötyökalut <CacheBuster /> (beta)
        </p>
        <p className="mt-1">
          Sähköalan ammattilaisten apuväline. Ei korvaa standardikirjaa tai
          pätevän suunnittelijan arviota.
        </p>
      </footer>
    </div>
  );
}
