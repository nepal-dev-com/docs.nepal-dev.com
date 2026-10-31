---
title: "API"
---

Contracts for every route handler and endpoint that another client or system calls — the
Markdown routes, `llms.txt`, the search records, and any future integration.

> **Living snapshots.** Edit in place so each file describes the system as it is right now. No
> revision tables, no "previously X, now Y" — delete what is no longer true
> ([ADR-0002](../adr/ADR-0002-living-design-documentation.md)).

## Conventions

- File name: `<resource>.md`.
- Each endpoint: purpose, who may call it and what content it can return (cross-reference `content/docs/documentation/rbac/`), request, responses, caching, side effects.
- A public endpoint says what keeps private content out of it.

**Template:** [`../_templates/api.md`](../_templates/api.md)

## Documents

| Document | Status | ADR |
|---|---|---|
| [Machine-readable content routes](./content-routes.md) | Current | — (Fumadocs scaffold) |
