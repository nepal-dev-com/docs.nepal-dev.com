---
title: "Data flow diagrams"
---

Where content and data go, and every trust boundary they cross.

> **Living snapshots.** Edit in place so each file describes the system as it is right now. No
> revision tables, no "previously X, now Y" — delete what is no longer true
> ([ADR-0002](../adr/ADR-0002-living-design-documentation.md)).

## Conventions

- `system.md` is Level 0 (context): the site, its readers and every external system. Feature files decompose it (Level 1/2); levels balance — a child's flows match its parent's.
- Every crossing to a third party (search provider, host, analytics, CI) is listed with exactly what is sent, how it is authorised, and whether private content can travel on it.
- Data stores carry their classification.

**Template:** [`../_templates/dfd.md`](../_templates/dfd.md)

## Documents

| Document | Status | ADR |
|---|---|---|
| [System (Level 0)](./system.md) | Current | — (Fumadocs scaffold) |
