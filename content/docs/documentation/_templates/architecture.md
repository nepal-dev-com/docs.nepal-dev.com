---
title: "Architecture — <system or feature>"
---

- **Status:** Draft
- **Last updated:** YYYY-MM-DD
- **Related ADRs:** ADR-NNNN

> Snapshot of the system as it stands today. Edit in place; never record what changed.

## Context

What this is, and the boundary between it and everything else.

## Components

| Component | Responsibility | Depends on |
|---|---|---|
| | | |

## Diagram

```mermaid
flowchart TB
  subgraph Site["puncoz-packages-docs"]
    CONTENT["content/docs/<br/>MDX"]
    APP["Next.js + Fumadocs"]
  end
  Reader["Reader"] --> APP
  CONTENT --> APP
```

## Key decisions in force

Links to the ADRs that govern this, one line each on what they mandate.

## Constraints

Performance, security, privacy and operational constraints this must respect.
