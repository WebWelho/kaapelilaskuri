@AGENTS.md

# TPCore — Kaapelilaskuri

> Globaalit TPCore-ohjeet: ~/.claude/CLAUDE.md (ladataan automaattisesti)
> Luotu: 2026-04-18

---

## Mitä tämä on

Standalone SFS 6000 -pohjainen kaapelilaskuri sähköasentajille. Jännitteenalenema, kaapelin mitoitus, oikosulkuvirta.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Hosting:** Vercel (standalone-app)
- **Pkg:** pnpm
- **Standardit:** SFS 6000 (kaapelimitoitus, jännitteenalenema, oikosulkuvirta)

## Kehityskomennot

```bash
cd ~/Documents/GitHub/kaapelilaskuri
pnpm dev
pnpm build
pnpm typecheck
```

## 🛠️ TPCore v4 -orkestraattori

Ketju: SEQ → Context7 → Researcher → Suunnitelma → QA → Review.
Skill: `~/.claude/skills/tpcore/SKILL.md` (auto-aktivoituu).
Ydinsäännöt: `~/.claude/memory/core_rules.md` (17 kanon).
Gotchas: `~/.claude/docs/v4-gotchas.md`.

**Hookit (~/.claude/hooks/):**

- `pre-commit-gate.sh` — QA (tsc + build + turva; SKIP-VALIDATE commit-viestissä ohittaa)
- `pre-edit-checkpoint.sh` — auto-checkpoint `refs/testocore-checkpoints/<ts>` (nimi historiallinen)
- `protect-files.sh` — estää .env/.ssh/migrations/.claude (Edit|Write|MultiEdit)
- `enforce-tests-on-stop.sh` — pakottaa testit ennen "valmis" (SKIP-VALIDATE PROGRESS.md:ssä ohittaa)
- `format-on-write.sh` — auto-prettier/ruff/gofmt (fail-open)
- Muut: session-init/end, github-backup, context-recovery, supabase-gate

Arkistoitu v2.x: user-prompt-gate, pre-edit-gate (~/.claude/\_archive/hooks-v2.x/).
