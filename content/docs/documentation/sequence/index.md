---
title: "Sequence diagrams"
---

Flows that span actors or systems, run asynchronously, or retry — the build and search sync,
docs generated from a package's source, deploys.

> **Living snapshots.** Edit in place so each file describes the system as it is right now. No
> revision tables, no "previously X, now Y" — delete what is no longer true
> ([ADR-0002](../adr/ADR-0002-living-design-documentation.md)).

## Conventions

- File name: `<flow>.md`.
- Mermaid `sequenceDiagram` with `autonumber`, then failure paths (step, failure, behaviour, recovery) and post-conditions.

**Template:** [`../_templates/sequence.md`](../_templates/sequence.md)

## Documents

| Document | Status | ADR |
|---|---|---|
| [Build and search sync](./build-and-search-sync.md) | Current | — (Fumadocs scaffold) |
