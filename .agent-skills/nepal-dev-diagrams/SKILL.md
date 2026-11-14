---
name: nepal-dev-diagrams
description: "Making, changing or publishing a diagram, flow, sequence, state diagram, ERD or screen wireframe in the Nepal Dev Verse docs repository: Mermaid and Archify together inside a Diagram component, how to run Archify without the browser gate, where the files go, and what the build rejects. Read before writing a Mermaid fence, running Archify, or touching diagrams/."
paths:
  - "diagrams/**"
  - "**/diagrams/**"
---

# nepal-dev-diagrams

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `AGENTS.md` in the first part, and in the second part of `PROJECT_AGENTS.md`. Links are relative to this file.

## First

- Every diagram is a Mermaid fence inside a `<Diagram>` with its Archify view; both change in the same change.
- Run only `deliver` and `check`. `finalize`, `browser-check` and `visual-check` launch Chrome: only when the owner asks.
- Never upgrade Archify without the owner's yes.
- Never copy a receipt (`*.delivery*.json`), journal or lock file into `diagrams/` or `public/`.
- A diagram of anything private never goes in `diagrams/`: its HTML is published.
- No HTML prototypes or HTML wireframes.

## Rules and the owner's settings (`AGENTS.md` §8)

**Diagrams and flows are made with Archify**, always: architecture, workflow, sequence, data
flow, lifecycle, ERD, class, tree and timeline diagrams. This is the owner's standing choice.
Use the project copy in `.claude/skills/archify`. Archify produces a standalone, interactive
HTML file.

- **Every diagram is Mermaid and Archify together** ([ADR-0022](../../content/docs/maintainer-guide/adr/ADR-0022-diagrams-show-archify-on-the-page-and-mermaid-in-markdown.mdx)):
  flows, sequences, states, ERDs and screen wireframes (`block-beta`) are written as a Mermaid
  fence inside a `<Diagram>`, and each has its Archify view. The page shows only the Archify
  view; every Markdown surface (Copy Markdown, `/<page>.md`, `llms-full.txt`) carries only the
  Mermaid, so the docs stay readable as Markdown (§6.5), render on GitHub and diff as text. A
  wireframe's Archify view is an `architecture` diagram drawn from its Mermaid, one per screen,
  its boxes inside a labelled phone-screen region. Both versions change in the same change.
- **How to run it** (the owner's settings): author the candidate JSON as the skill describes,
  then deliver and check it **without the browser gate**:

  ```sh
  node .claude/skills/archify/bin/archify.mjs deliver <type> <candidate.json> <output.html> --quality showcase --json
  node .claude/skills/archify/bin/archify.mjs check <output.html> --require-provenance
  ```

  Don't run `finalize`, `browser-check` or `visual-check`: they launch Chrome. Run them only
  when the owner asks, for a broken diagram. The update check inside `deliver` may run. When it
  reports a new version, tell the owner and never upgrade without their yes. Working folders go
  in `.archify/` (gitignored).
- **No HTML prototypes or HTML wireframes.** By the owner's decision, an app flow's screens
  are its `block-beta` wireframes and their Archify views; no prototype skill is used.
- **Publishing a diagram** (ADR-0022): put both files in `diagrams/<project-slug>/`: the
  candidate as `<slug>.json` (Archify's classic style: no `visual_preset`) and the checked HTML,
  byte for byte, as `<slug>.html`. Never copy a receipt (`*.delivery*.json`), journal or lock
  file: they hold local paths. In the page, wrap the Mermaid fence, with nothing else inside:

  ````mdx
  <Diagram src="/diagrams/docs/site-pages.html" title="Site pages">

  ```mermaid
  flowchart LR
    A --> B
  ```

  </Diagram>
  ````

  The build fails on a Mermaid fence outside a `<Diagram>` (templates excepted), a `<Diagram>`
  without a plain `src` and `title` or without exactly one Mermaid fence, a `src` that is not
  `/diagrams/<project-slug>/<slug>.html` or has no file, an HTML without its JSON or not used by
  any page, anything in `public/diagrams/`, and a receipt in `diagrams/` or `public/`. The site
  shell hides Archify's title, notes and theme buttons in the frame, puts the diagram on the
  site's colours, starts it Live and fits the frame to it; nothing per diagram is needed.
  `/diagrams/…` is served with a CSP `sandbox` header (`next.config.mjs`), and the frame has no
  `allow-same-origin`. Before publishing after an Archify upgrade, scan the HTML for external
  resources and network calls, and run the shell's tests: they check what it hides against a
  committed Archify file (ADR-0011, ADR-0022, security considerations).
- No binary or externally hosted images, with one exception: the avatar in a GitHub profile
  chip, loaded live from GitHub (ADR-0020).

## Steps, screens and what the build refuses (`PROJECT_AGENTS.md` §8)

**Every page that has a diagram embeds both**, in the User guide and in the Maintainer guide, with no exceptions
([ADR-0022](../../content/docs/maintainer-guide/adr/ADR-0022-diagrams-show-archify-on-the-page-and-mermaid-in-markdown.mdx)).
Architecture, flows, sequences, states, data flows, ERDs, class diagrams, trees, timelines and
screen wireframes are all diagrams.

| Version | Where it shows | Lives in |
|---|---|---|
| **Archify** | On the page: the interactive view readers see | `diagrams/<project-slug>/<slug>.html`, with its source `<slug>.json` |
| **Mermaid** | Copy Markdown, `/<page>.md`, `llms-full.txt`, GitHub | A fence inside the page's `<Diagram>` |

Both show the same thing, and **both change in the same change**. A Mermaid fence alone, or an
Archify file alone, fails the build.

### 8.1 Steps

Archify is the skill in this repository at `.claude/skills/archify`. Its schemas are in
`.claude/skills/archify/schemas/`. Run everything from the submodule root.

1. **Write the Mermaid** for the diagram.
2. **Write the Archify candidate**, showing the same nodes and links, in a working folder under
   `.archify/` (gitignored). Use the type that fits: `architecture`, `workflow`, `sequence`,
   `dataflow`, `lifecycle`, `erd`, `class`, `tree`, `timeline` or `waterfall`. Use Archify's classic
   style: no `visual_preset`.
3. **Deliver and check it**, without the browser gate:

   ```sh
   node .claude/skills/archify/bin/archify.mjs deliver <type> <candidate.json> <output.html> --quality showcase --json
   node .claude/skills/archify/bin/archify.mjs check <output.html> --require-provenance
   ```

   Don't run `finalize`, `browser-check` or `visual-check`, whatever the skill's own steps say: they
   launch Chrome. Run them only if the owner asks. Never upgrade Archify; tell the owner when it
   reports an update.
4. **Publish the pair**: copy the candidate and the checked HTML, byte for byte, to
   `diagrams/<project-slug>/<slug>.json` and `<slug>.html`. The `<slug>` is lowercase letters,
   digits and hyphens. Never copy a `*.delivery*.json` receipt or any other working file: they hold
   local paths.
5. **Then embed it in the page**, with the Mermaid fence and nothing else inside the `<Diagram>`:

   ````mdx
   <Diagram src="/diagrams/<project-slug>/request-flow.html" title="Request flow">

   ```mermaid
   flowchart LR
     Parser --> Router --> Handler
   ```

   </Diagram>
   ````

Keep that order. If a running `next dev` sees a page before its diagram's files exist, it fails on
every page until it next reloads the content. Saving a page usually clears it; if not, restart it.

The site does the rest: the frame fits the diagram, follows the site's theme, starts Live, and
shows only the diagram and its controls.

### 8.2 Screens

**Screens are `block-beta` wireframes**, phone width first, with invented sample values, each with
its Archify view: an `architecture` diagram drawn from the Mermaid, its boxes inside a labelled
phone-screen region, one per screen. Name them `<feature>-screen-<n>`. No HTML prototypes or HTML
wireframes.

### 8.3 What the build refuses

The build fails, naming the page or file, on:

- a Mermaid fence outside a `<Diagram>`;
- a `<Diagram>` without a plain `src` and `title`, or without exactly one Mermaid fence;
- a `src` outside `/diagrams/<project-slug>/<slug>.html`, or without its file;
- an HTML without its JSON, a JSON without its HTML, or an HTML no page uses;
- anything else in `diagrams/`, anything in `public/diagrams/`, and a receipt.

A diagram of anything private never goes in `diagrams/`: its HTML is published.
