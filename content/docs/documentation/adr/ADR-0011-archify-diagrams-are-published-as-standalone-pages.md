---
title: "ADR-0011 — Archify diagrams are published as standalone pages, linked from the page that keeps the Mermaid version"
---

- **Status:** Proposed
- **Date:** 2026-10-31
- **Deciders:** Puncoz Nepal
- **Approved by:** —
- **Approved on:** —
- **Supersedes:** —
- **Superseded by:** —
- **Design documents:** [`../app-flow/diagram-pages.md`](../app-flow/diagram-pages.md),
  [`../architecture/system.md`](../architecture/system.md),
  [`../security/threat-model.md`](../security/threat-model.md), `AGENTS.md` §8, `PROJECT_AGENTS.md` §3, §4

## Context

Every diagram and flow in this repository is made with Archify, and every page also keeps a
Mermaid version so it stays readable as Markdown (`AGENTS.md` §8). Archify's output is a
standalone HTML file. Until this ADR is decided, those files stay out of `content/docs/` and
`public/`, so a reader of the site never sees them.

Facts this decision rests on, checked against Archify 3.2.0 and the installed packages:

- **Output.** `deliver` writes `<stem>.html` and a receipt, `<stem>.delivery.json`, next to it.
  The receipt holds absolute local paths (`/Users/…/candidate.json`). The HTML holds none.
- **The HTML is self-contained.** It loads no external script, stylesheet or image, and calls
  no network API (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`). It stores only the
  reader's theme and motion choice in `localStorage`, inside `try`/`catch`, written for
  sandboxed frames. External URLs appear only as text in its licence notices.
- **Size.** The seven-node workflow in this ADR's app flow is 819 KB.
- **Narrow screens.** Archify's viewer is "not a mobile product feature; narrow layouts get
  containment only" (`references/viewer-runtime.md`).
- **Pages.** The Documentation project's pages are `.md`, compiled as plain Markdown, so they
  cannot use JSX components.
- **Links.** A Markdown link renders through Fumadocs' `Link` and `next/link`. A target that
  returns plain HTML instead of an RSC payload falls back to a full page load
  (`doMpaNavigation`, `next/dist/client/components/router-reducer/fetch-server-response.js`).
- **Serving.** Files in `public/` are served from `/`. `headers()` in `next.config.mjs` applies
  to them ("Headers are checked before the filesystem which includes pages and `/public`
  files"). `src/proxy.ts` rewrites only paths under `/docs`.

## Decision

1. **The candidate JSON is the source.** Each diagram's Archify candidate is committed at
   `diagrams/<project-slug>/<diagram-slug>.json`, at the repository root, which is not
   published. The Documentation project uses `documentation` as its slug.
2. **Delivered and checked outside the published folders.** Agents run `deliver` and
   `check --require-provenance` into `.archify/` (gitignored), as `AGENTS.md` §8 sets out.
3. **The HTML alone is published**, copied byte for byte to
   `public/diagrams/<project-slug>/<diagram-slug>.html` and served at
   `/diagrams/<project-slug>/<diagram-slug>.html`. Receipts (`*.delivery.json`,
   `*.delivery-pending.json`) and lock files are never copied: they carry local paths.
   Diagrams live outside `/docs`, so the Markdown rewrites in `src/proxy.ts` never apply to them.
4. **The page links to it.** The page keeps the Mermaid version, shown as highlighted code, and
   directly below it has the link `[Open the interactive diagram](/diagrams/<project-slug>/<diagram-slug>.html)`.
   The link works in `.md` and `.mdx` alike, and in every Markdown surface it is the same
   root-relative URL. No component is added.
5. **Diagram pages are sandboxed.** `next.config.mjs` serves `/diagrams/:path*` with
   `Content-Security-Policy: sandbox allow-scripts allow-downloads allow-popups`. The diagram's
   scripts run in an opaque origin: they cannot read the site's cookies or storage, and Archify
   simply does not remember the theme choice.
6. **Consuming repositories may write their own diagrams**: `diagrams/<project-slug>/` and
   `public/diagrams/<project-slug>/`, alongside `content/docs/<project-slug>/` (ADR-0010,
   decision 2, widened by this).
7. **Diagram pages are not indexed.** They are not part of `static.json`, the search index or
   `llms.txt`. Search finds the page through its Mermaid version and text.

## Options considered

| Concern | Option | Pros | Cons | Verdict |
|---|---|---|---|---|
| Display | A — link from the page to a standalone diagram page | Works in `.md` and `.mdx` with no new code; the viewer gets the whole screen; Markdown readers get the same link | A full page load, and the diagram page has no site header or sidebar; the reader returns with the browser's back | Chosen |
| Display | B — an `<ArchifyDiagram>` MDX component with an iframe | The diagram sits inside the page | Documentation pages would have to become `.mdx`; nested scrolling and zooming in a frame at phone width, where Archify gives "containment only"; 819 KB in every page that shows one | Rejected |
| Display | C — a remark plugin that turns a diagram link into an iframe | Works in `.md` | New build code to maintain; the same phone-width problem as B | Rejected |
| Display | D — not shown on the site; Archify files stay local | Nothing to build | Readers never see the diagrams made for them | Rejected |
| Source | A — candidate JSON in `diagrams/<project-slug>/` | Text diffs; the diagram can be regenerated after an Archify update; not published | A second folder to keep in step with the page | Chosen |
| Source | B — candidate JSON next to the page in `content/docs/` | One folder per project | That folder is what Fumadocs loads and publishes; keeping a file there unpublished depends on loader behaviour | Rejected |
| Source | C — the HTML only, no source | One file | Cannot be edited or regenerated; reviews see 819 KB of generated HTML | Rejected |
| Location | A — `public/diagrams/<project-slug>/` | Static, served from the site's own origin, namespaced per project | — | Chosen |
| Location | B — `public/docs/…` | Diagram URL next to the page URL | Under `/docs`, where `src/proxy.ts` rewrites paths and page routes live | Rejected |
| Location | C — a route handler that reads `diagrams/` | No copy step | A new endpoint, more code and more surface | Rejected |
| Isolation | A — CSP `sandbox` header on `/diagrams/*` | Generated third-party script cannot touch the site's origin, now or after sign-in is added | The theme choice is not remembered; copying an image to the clipboard may be refused in the sandbox (to check on implementation) | Chosen |
| Isolation | B — no header | Every viewer feature works | 819 KB of generated script runs with the site's origin; acceptable with no sign-in, not once private docs are served | Rejected |
| Isolation | C — a separate origin for diagrams | Strongest isolation | Needs a hosting decision first | Deferred |

## Consequences

**Positive**

- Readers get the interactive diagram; Markdown readers and tools keep the Mermaid version and
  the link.
- No component, no dependency and no build step: the only code is one `headers()` entry.
- The source is reviewable text, and regenerating a diagram is one `deliver`.

**Negative / accepted trade-offs**

- Two versions of each diagram, Mermaid and Archify, can drift. Both change in the same change
  and are reviewed together.
- Each diagram adds about 0.8 MB to the published files.
- The diagram page has no site navigation; the reader goes back with the browser.
- Diagram pages do not appear in search.
- An Archify upgrade changes the generated HTML. Diagrams are delivered again after an upgrade,
  and the checks in *Security considerations* run again.

## Content invariants

- **1 (Private stays private).** A diagram of a private project is private content: none goes
  into `diagrams/` or `public/diagrams/`, under the same rule as `content/docs/`. `public/` is
  published.
- **4 (Examples run).** Diagram labels use invented sample values.
- **5 (Readable as Markdown).** Kept: every page keeps its Mermaid version, and the diagram is a
  link.

## Security considerations

- **What is published.** Each diagram's HTML, with its labels, sources and cards, is public and
  served to anyone. It is written by an agent from public information only (invariant 1).
- **Local paths.** Receipts contain absolute local paths, so only the HTML is copied
  (decision 3). The implementation adds a check that no `*.delivery*.json` file exists under
  `public/`.
- **Third-party script.** The HTML runs generated script from Archify. Checked for 3.2.0: no
  external resources and no network calls. The sandbox header (decision 5) keeps it away from
  the site's origin. The checks repeat on every Archify upgrade, which the owner already
  approves one by one.
- **Nothing leaves the system.** Diagram pages send nothing to Algolia or any third party.
- **Residual risk.** A future Archify release could add network calls. That would show in the
  upgrade check, and the sandbox does not block it. Accepted, because upgrades are reviewed.

## Implementation notes

- [x] App flow: [`../app-flow/diagram-pages.md`](../app-flow/diagram-pages.md), its flow made
      with Archify.
- [ ] `diagrams/documentation/diagram-pages.json`, the source of the app flow's diagram, and
      `public/diagrams/documentation/diagram-pages.html`, linked from the app flow page.
- [ ] `next.config.mjs`: the `headers()` entry for `/diagrams/:path*` (decision 5), with a
      comment linking this ADR.
- [ ] On the first page opened in a browser by the owner: the diagram loads under the sandbox,
      theme and motion toggles work, PNG/SVG download works, and whether copy-to-clipboard
      works is recorded in the app flow.
- [ ] Tests, with the runner chosen under ADR-0007: every `/diagrams/…` link in `content/docs/`
      has its file in `public/diagrams/`; every published HTML has its JSON source; no
      `*.delivery*.json` exists under `public/`. Until that runner exists, these are checked by
      hand before review and reported as such.
- [ ] `bun run lint`, `bun run types:check` and `bunx next build` pass.

## Docs to update on implementation

- [x] [`../app-flow/diagram-pages.md`](../app-flow/diagram-pages.md)
- [ ] [`../architecture/system.md`](../architecture/system.md): diagram sources and diagram pages
- [ ] [`../api/content-routes.md`](../api/content-routes.md): `/diagrams/<project-slug>/<diagram-slug>.html`,
      public, static, sandboxed
- [ ] [`../security/threat-model.md`](../security/threat-model.md): the attack-surface table
      (third-party generated script, sandboxed);
      [`../security/checklist.md`](../security/checklist.md): an Archify row under tool-specific
      checks
- [ ] `AGENTS.md` §8 (where Archify files go, the link, the copy step) and §10 (`diagrams/`,
      `public/diagrams/`)
- [ ] `PROJECT_AGENTS.md` §3 and §4: consumers' diagram folders and the link
- [ ] `.claude/agent-skills/INDEX.md`: the Archify override, which today keeps HTML out of
      `public/` until this ADR
- [ ] `README.md`: project structure
- [ ] [`./index.md`](./index.md): status on approval
