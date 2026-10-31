---
title: "Security"
---

How puncoz-packages-docs protects what it holds. Security and privacy are a property of
**every change**, not a pre-deploy event — see
[ADR-0005](../adr/ADR-0005-security-as-a-standing-practice.md).

> **Living snapshots.** Edit in place so each file describes the system as it is right now. No
> revision tables, no "previously X, now Y" — delete what is no longer true
> ([ADR-0002](../adr/ADR-0002-living-design-documentation.md)).

## Documents

| File | Answers |
|---|---|
| [`threat-model.md`](./threat-model.md) | What is worth protecting, from whom, and what stops them |
| [`data-classification.md`](./data-classification.md) | How sensitive a piece of content or data is, and how it must be handled |
| [`secrets.md`](./secrets.md) | Every secret: what it is, where it lives, whether it reaches the browser |
| [`checklist.md`](./checklist.md) | The audits, and the gates at which they run |
| `<feature-slug>.md` | A feature's own threat surface, when it warrants one |

**Template:** [`../_templates/security.md`](../_templates/security.md)

## The rules that matter most

**1. Never guess at a security decision.** Whether a project is private, who may read it,
whether a route is public, what is sent to the search provider — the owner decides, and it is
recorded ([ADR-0004](../adr/ADR-0004-ask-never-guess.md)).

**2. Private stays private.** Today every page in `content/docs/` is published on every
surface: the site, the Markdown routes, `llms.txt` / `llms-full.txt`, `static.json`, OG images
and the search index. **No private project content goes there** until an ADR decides how it is
kept and served (`AGENTS.md` §6.1).

**3. Published is permanent.** A page that was served, indexed or crawled cannot be recalled.
Treat it as public from that moment, and rotate anything secret it contained.

**4. Tool-specific rules arrive with the tool.** Algolia is adopted, and its checks are in
[`checklist.md`](./checklist.md#tool-specific-checks). When a host, analytics, CI or an
authentication provider is adopted, **its ADR adds its own entries there**. This project makes
no claim about tools it has not adopted.
