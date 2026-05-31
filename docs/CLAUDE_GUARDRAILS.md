# CLAUDE.md Guardrails

Rules for maintaining `CLAUDE.md` as an accurate, useful living document.

---

## Update Triggers

Update `CLAUDE.md` **only** when one of these occurs:

- A phase completes — features move from "on the horizon" to "shipped"
- A hard rule is established (architectural decision, security requirement, convention locked in)
- The schema changes
- A key convention is decided
- A technology is added or swapped out

### Not triggers
- Work-in-progress state
- Session notes or partial progress
- Anything still uncertain or unfinalized

---

## What Never Goes in CLAUDE.md

- WIP or partial progress ("working on X", "started implementing Y")
- Unfinalized decisions
- Anything better expressed as a comment in the code itself
- Secrets, connection strings, or environment-specific URLs
- Duplicate information — if the schema is the source of truth, don't describe it in prose above it

---

## Accuracy Rules

- **Claude Code must scan the project before writing any update** — never write from memory
- **No placeholders or TODOs** — if it's not confirmed true, it does not belong in the file
- **If accuracy is uncertain, remove the entry** until it can be verified against the codebase

---

## Format Rules

- No long prose paragraphs — if it can't be said in a bullet, it probably doesn't belong
- Tables for reference material (tech stack, schema, infrastructure, env vars)
- The file must be skimmable in under 2 minutes — if it isn't, it's too long

---

## Bloat Prevention

- Adding a new section requires a reason it belongs in `CLAUDE.md` rather than in a code comment, README, or the code itself
- At every phase boundary, do a pruning pass — delete anything now obvious from the codebase
- A `<!-- last reviewed: YYYY-MM-DD -->` comment lives at the top of `CLAUDE.md` and gets updated on every edit

---

## When to Update

| Situation | When to update |
|---|---|
| Phase completes | At the phase boundary — not before |
| Hard rule established | Immediately — do not defer |
| Convention decided (whole codebase impact) | Immediately |
| Schema change | After migration is applied and confirmed |
| Mid-feature, convention not yet settled | Do not update — wait until finalized |
