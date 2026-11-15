---
name: nepal-dev-adr-workflow
description: "Proposing, writing, revising, approving or superseding an ADR, or writing an app flow for a UI change, in the Nepal Dev Verse docs repository. The five workflow steps, how people are named, and what an app flow must show. Read before creating or editing anything in content/docs/maintainer-guide/adr/ or app-flow/."
---

# nepal-dev-adr-workflow

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `AGENTS.md`. Links are relative to this file.

## First

- No application code before the owner approves the ADR. Propose, add the index row, then stop.
- Approval is explicit. Only then set `Status: Approved`, `Approved by` and `Approved on`.
- Never edit an approved ADR's Decision. Supersede it with a new ADR and cross-link both.
- A change a person can see ships its app flow in the same change as its ADR.
- People are GitHub usernames as profile links. Never guess one: ask.

## The ADR workflow (`AGENTS.md` §2)

### Workflow

1. **Propose.** Copy [`content/docs/maintainer-guide/_templates/adr.mdx`](../../content/docs/maintainer-guide/_templates/adr.mdx) to
   `content/docs/maintainer-guide/adr/ADR-NNNN-kebab-title.mdx` using the *next free number* from
   [`content/docs/maintainer-guide/adr/index.mdx`](../../content/docs/maintainer-guide/adr/index.mdx). Set **`Status: Proposed`** and add the index
   row straight away, so ADRs in flight cannot collide on a number.
   **If the change reaches the UI, write its app flow in the same change**
   ([ADR-0008](../../content/docs/maintainer-guide/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx)):
   `content/docs/maintainer-guide/app-flow/<feature-slug>.mdx`. See *App flow* below.
2. **Stop.** Do not write application code. Tell the owner the ADR, and its app flow if it has
   one, are ready for review.
3. **Revise** in place while the owner has feedback — status stays `Proposed`.
   **People in an ADR are GitHub usernames**, written as a profile link:
   `[@puncoz](https://github.com/puncoz)` in `Deciders` and `Approved by`. The person who approves for
   the owner is `puncoz`. If anyone else decides or approves and their username is not known, ask for it.
   The site shows such a link as a chip with the person's avatar (ADR-0020).
4. **On explicit approval only:** set `Status: Approved`, fill `Approved by: [@puncoz](https://github.com/puncoz)` (the approver's GitHub username)
   and `Approved on: <date>`, update the index row, *then* implement.
5. **Never** edit an approved ADR's Decision section. Supersede it with a new ADR and
   cross-link both files. The one exception was the single rewording of earlier names in ADR-0038.

## App flow (`AGENTS.md` §2)

### App flow — required with every ADR that changes the UI

[ADR-0008](../../content/docs/maintainer-guide/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx). An ADR that adds or changes
anything a person sees — a page type, route, nav item, sidebar, search, dialog, or a page's
layout, controls or states — ships `content/docs/maintainer-guide/app-flow/<feature-slug>.mdx`, and the two are reviewed
together. It shows:

- **entry points**: where a person reaches the feature from, and who does not see it;
- **the flow**: the screens and the transitions between them, made with Archify, plus its
  Mermaid flowchart version (§8);
- **one wireframe per screen**, as a Mermaid `block-beta` diagram with invented sample values,
  at phone width first, and its Archify view drawn from it (ADR-0022). No HTML prototypes or
  HTML wireframes: by the owner's decision, the wireframes are the screens;
- **each screen's states**: empty, loading, not found, refused, error, degraded, success.

Not needed for a bug fix, for content within the approved conventions, or for an ADR that
changes nothing visible. Unsure whether a person would notice? Write it. Template:
[`content/docs/maintainer-guide/_templates/app-flow.mdx`](../../content/docs/maintainer-guide/_templates/app-flow.mdx).
