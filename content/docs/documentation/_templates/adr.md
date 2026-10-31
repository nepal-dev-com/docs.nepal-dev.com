---
title: "ADR-NNNN — <short imperative title>"
---

- **Status:** Proposed
- **Date:** YYYY-MM-DD
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** `content/docs/documentation/app-flow/<slug>.md` (when the UI changes, ADR-0008), `content/docs/documentation/prd/<slug>.md`,
  `content/docs/documentation/architecture/system.md`, … (the living docs this decision creates or changes — see ADR-0002)

## Context

What problem are we solving? What forces, constraints and facts about the current codebase
make this decision necessary *now*? State only what is true and verifiable.

## Decision

The decision, stated plainly and in the present tense ("We use X", "Y lives in Z").
Include the concrete shape of the change: directories, file names, contracts, commands.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A — `<name>` | | | Chosen / Rejected |
| B — `<name>` | | | Chosen / Rejected |

## Consequences

**Positive**

- …

**Negative / accepted trade-offs**

- …

## Content invariants

Which invariants in `AGENTS.md` §6 this touches, and how it keeps them. If it departs from
one, say so explicitly. That departure is part of what the owner approves.

## Security considerations

Mandatory — never omit this section (ADR-0005). For a change with no security surface,
"None — this change touches no data, no endpoint and no secret" is a valid answer; an omitted
section is indistinguishable from not having thought about it.

Where there is a surface, state: what content or data it handles and its classification,
whether anything private can reach a public surface, what authorization applies and where it is
enforced, what leaves the system (search provider, host, analytics), and what residual risk is
accepted. Link `content/docs/documentation/security/<slug>.md` when the feature warrants its own analysis.

## Implementation notes

What actually changes in the repo once this is approved. Keep this list checkable — it is
the scope of the implementation that follows the approval.

- [ ] …
- [ ] Tests — the happy path **and** the obvious failure paths (ADR-0007). If some part cannot
      be unit-tested, say which, and say what was verified instead.
- [ ] `bun run lint`, `bun run types:check` and `bunx next build` pass.

## Docs to update on implementation

Living design documents are snapshots of the system as it stands — edit them in place, never
as a log of what changed (ADR-0002). Delete anything in them that is no longer true.

- [ ] `content/docs/documentation/app-flow/<slug>.md` — if the UI changed
- [ ] `content/docs/documentation/prd/<slug>.md` — requirements + user stories
- [ ] `content/docs/documentation/erd/system.md` — if persisted data changed
- [ ] `content/docs/documentation/architecture/system.md` · `content/docs/documentation/dfd/` · `content/docs/documentation/state/` · `content/docs/documentation/sequence/` ·
      `content/docs/documentation/api/` · `content/docs/documentation/rbac/` — whichever the change requires (ADR-0002)
- [ ] `content/docs/documentation/security/` — `secrets.md` if a secret is introduced; `threat-model.md` if the
      attack surface changed; `<slug>.md` if the feature warrants its own analysis
- [ ] `AGENTS.md` — <what changes, if the way we work changed>
- [ ] `README.md` — <what changes, if the project overview changed>
- [ ] `content/docs/documentation/adr/index.md` — index row + status
