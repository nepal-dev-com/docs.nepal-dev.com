## What this changes

<!-- One or two sentences. Link the issue. -->

## ADR

<!-- Every feature and functional change needs an approved ADR first (AGENTS.md §2).
     Link it, or say why none is needed: a bug fix that restores documented behaviour, a typo or
     copy fix, or pages for a package or project within the approved conventions. -->

## Checklist

- [ ] The ADR is **Approved**, or this change needs none (above).
- [ ] If a person can see the change, its app flow is in `content/docs/maintain/app-flow/`.
- [ ] Nothing private, secret or internal is in the pages, diagrams, examples or tests.
- [ ] Tests cover the happy path and the obvious failures.
- [ ] The design documents, `README.md`, `AGENTS.md` and the ADR index match the change.
- [ ] Every diagram has its Mermaid inside a `<Diagram>` and its Archify pair in `diagrams/`.
- [ ] `bun run test`, `bun run types:check` and `bunx next build` pass. I did **not** run `bun run build`.

<!-- Merging to main publishes at once: the site and the search index, with no preview (ADR-0042). -->
