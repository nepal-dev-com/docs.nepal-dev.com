---
title: "ERD"
---

Persisted data, as it stands. It is never allowed to drift from the code or migrations that
define it.

> **Living snapshots.** Edit in place so each file describes the system as it is right now. No
> revision tables, no "previously X, now Y" — delete what is no longer true
> ([ADR-0002](../adr/ADR-0002-living-design-documentation.md)).

## Conventions

- `system.md` is the whole schema, created by the first ADR that stores data (a database, a
  key-value store, a structured content index) and updated by **every** change to it after.
- Each entity lists columns, indexes, invariants, relationships with on-delete behaviour, and sensitive fields with their classification ([`../security/data-classification.md`](../security/data-classification.md)).
- MDX frontmatter is not persisted data; its schema lives with the content conventions.

**Template:** [`../_templates/erd.md`](../_templates/erd.md)

## Documents

| Document | Status | ADR |
|---|---|---|

None: the site stores no data. Content is files in `content/docs/`; the search index is a
build output, described in [`../architecture/system.md`](../architecture/system.md).
