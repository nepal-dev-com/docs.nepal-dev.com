---
title: "ADR-0010 — Projects document themselves here through a git submodule, one root folder each"
---

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** `PROJECT_AGENTS.md`,
  [`../app-flow/project-root-folders.md`](../app-flow/project-root-folders.md), `AGENTS.md` §1, §8

## Context

The owner's project and package repositories will include this repository as a git submodule
and maintain their own documentation in it. Their agents then work inside this repository
without having read its working agreement, from a repository whose rules differ.

Three things are undecided without this ADR: where a project's pages go (the per-project
content layout is open, `AGENTS.md` §1), how changes made in a submodule come back, and what
a private project may put here. Every file under `content/docs/` is published (ADR-0002, §6.1),
and a consuming repository may be private.

## Decision

1. **One root folder per project or package**: `content/docs/<project-slug>/`, with a
   `meta.json` that sets `root: true`. Fumadocs gives each one an entry in the sidebar's
   switcher (`getSidebarTabs`, default `tabMode: "auto"`). The slug is agreed with the owner when
   the folder is first created.
2. **Consuming repositories edit only their own folder.** Any other change, such as another
   project's pages, `src/`, configuration, dependencies or this site's documents, is a change
   to the site and goes through ADR-0001.
3. **Edit only; a human commits.** An agent in a consuming repository never commits, pushes,
   rebases or switches branches inside the submodule, and never moves the submodule pointer. It
   lists its changes and hands the human the commands.
4. **Public only until private documentation is decided.** A private project keeps its
   documentation in its own repository and adds nothing here, until an ADR decides how private
   documentation is stored, served and searched.
5. **`PROJECT_AGENTS.md`** at the repository root is the guide for consuming repositories,
   with a block each one pastes into its own `AGENTS.md` / `CLAUDE.md`. It changes in the same
   change as anything that alters how they work here, and so does `AGENTS.md`.
6. **Writing pages inside a project's folder needs no ADR**, within this guide and the content
   invariants.

## Options considered

| Concern | Option | Pros | Cons | Verdict |
|---|---|---|---|---|
| Layout | A — `content/docs/<slug>/` root folder per project | Self-contained; a consumer touches one folder; matches the Documentation project | The switcher grows with every project | Chosen |
| Layout | B — grouped: `projects/<slug>/`, `packages/<ecosystem>/<slug>/` | Browsable by kind and ecosystem | Deeper paths; the grouping itself needs deciding | Rejected |
| Layout | C — a separate content-layout ADR first | Decides everything at once | Consumers wait | Rejected |
| Git flow | A — edit only, a human commits | Same rule as this repository; a person reviews every change before it is published | Manual steps for every update | Chosen |
| Git flow | B — the agent commits on a branch and opens a pull request | Reviewable and traceable | Agents commit, against `AGENTS.md` §3 | Rejected |
| Git flow | C — the agent commits and pushes to `main` | Fastest | No review before publishing | Rejected |
| Private | A — not yet; private projects keep docs locally | Nothing private can leak | Private projects get no site yet | Chosen |
| Private | B — draft the private-documentation ADR now | Starts the design | Private consumers still wait for it | Deferred |
| Private | C — this site stays public only, permanently | Simplest | Contradicts the site's purpose (`AGENTS.md` §1) | Rejected |
| Guide | `PROJECT_AGENTS.md` + a paste-in block | Short and separate; consumers' agents find it from their own instructions | A second file to keep in step with `AGENTS.md` | Chosen |

## Consequences

**Positive**

- Each project's documentation lives next to its code and is published in one place.
- A person reviews every change before it reaches a public surface.

**Negative / accepted trade-offs**

- Every update needs a manual commit in the submodule and a pointer bump in the project.
- Private projects have no documentation here until a later ADR.
- The sidebar switcher lists every project; a large number may need grouping later (a new
  ADR).

## Content invariants

All five apply to every consuming repository's pages; `PROJECT_AGENTS.md` §4 restates them.
Invariant 1 is the reason for decision 4.

## Security considerations

- **Trust boundary.** Content moves from consuming repositories, some of them private, into
  this public site. The controls are: private repositories add nothing (decision 4); public
  pages carry no secrets, internal hostnames, client names, personal data or copied private
  code (`PROJECT_AGENTS.md` §2); and a human reviews and commits every change (decision 3).
- **Scope.** Consuming agents may only edit their own folder (decision 2), so a consuming
  repository cannot change routes, the search sync or another project's pages.
- **Publishing.** Consumers verify with `bunx next build` and never run `bun run build`, which
  writes to the live search index.

## Implementation notes

- [x] `PROJECT_AGENTS.md` written with the paste-in block.
- [x] App flow: [`../app-flow/project-root-folders.md`](../app-flow/project-root-folders.md).
- [ ] On approval: the first consuming project's folder, with the slug agreed with the owner.
- [ ] On approval: `../dfd/system.md` gains consuming repositories as a source, across the
      trust boundary.
- Tests: a build check that every `content/docs/*/meta.json` outside `documentation/` sets
  `root: true` belongs with the test runner chosen under ADR-0007.

## Docs to update on implementation

- [x] `AGENTS.md` §1, §8, §10
- [x] `README.md` — project structure, decisions table
- [x] [`./index.md`](./index.md) — index row, next free number
- [ ] [`./index.md`](./index.md) — status on approval
