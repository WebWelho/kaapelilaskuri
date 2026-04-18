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

## TPCore v2.1 -orkestraattori

**Globaali kanon:** `~/.claude/CLAUDE.md` (16 sääntöä + hard gates).

**Sovellus tähän repoon (kevyt standalone):**
- **Ei Edit/Write ≥3 tied. muutoksella ilman `.handoff/PLAN.md`** (pre-edit-gate.sh blokkaa)
- **Auto-checkpoint** ennen Edit/Write (refs/testocore-checkpoints/, rollback: `git checkout refs/testocore-checkpoints/<ts> -- .`)
- **GATE 1-8 ennen commitia:** tsc, build, testit, regressio, **Playwright UI** (laskurin syöte→tuloste golden path), review
- **Sääntö 16 (Todenna älä luota):** SFS 6000 -laskuri-muutos → vertaile tunnettuun ref-arvoon (esim. 3×2.5mm² 16A 50m → ~1.8V alenema), ei pelkkä tsc-läpäisy
- **Template-pohjat:** `~/.claude/skills/tpcore/templates/09-16.md`

**Dokumentaatio:** [Notion Tilannekuva](https://www.notion.so/3461fc763e01818898abd9f9c4e3ac9d) · [Hard Gates](https://www.notion.so/3461fc763e0181caabd3f24f889e59c5) · [Roadmap](https://www.notion.so/3461fc763e0181c8976bc68d1c9fee30)
