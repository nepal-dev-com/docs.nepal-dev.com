---
name: nepal-dev-site-picture
description: "How the Nepal Dev Verse site looks and behaves today: the one shape for every entry, the solar system, the home page, docs pages, Cache Components, analytics, deploys, search and sharing, diagrams, and what is not published. Read before changing anything under src/, or when a task needs to know what the site does now."
paths:
  - "src/**"
---

# nepal-dev-site-picture

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `AGENTS.md`. Links are relative to this file.

## First

- Space words name places, never controls: Search, Overview, Use, Maintain, On this page and version names keep their plain names.
- Cache Components is on: use `use cache` and `<Suspense>`, not route segment configs such as `revalidate`.
- Only `main` deploys, straight to production. Never `vercel` or `vercel --prod`.
- Never a real private project name on the home page.
- Any analytics tag beyond the two adopted needs its own ADR.

## Current state (`AGENTS.md` §1)

**Current state:** the site is named **Nepal Dev Verse** (`appName` in `src/lib/shared.ts`,
ADR-0036), its own documentation is **Nepal Dev Verse Docs**, and it links to GitHub
`nepal-dev-com/docs.nepal-dev.com`. **No package or project is documented
yet** besides the site itself, so the home page shows its empty states.

- **One shape for every entry** (ADR-0013, ADR-0015). `content/<slug>/` has a `catalog` entry in
  its `meta.json`, a `use/` track and a `maintain/` track. A versioned `use/` holds version
  lines: `dev/` for unreleased work in progress, and released lines whose URL segment is the
  `name` set in their `meta.json` (any string, such as `v1.0` or `2024 LTS`). Maintain is not
  versioned. A project has at most `dev` and one released line; older lines are for packages.
  A project of several repositories lists them in `catalog.repositories` (one primary) and gives
  each a folder in each track, `use/<id>/` and `maintain/<id>/` (ADR-0024).
- **The build checks the shape.** Line redirects, version banners, scoped sidebars, search
  fields and `llms.txt` labels all come from it.
- **The whole site is one solar system** (ADR-0015, ADR-0017, ADR-0018). The star is nepal-dev.com, the community (ADR-0036); a package
  is a solid planet, a project a ringed one; each version line is a moon (full = latest,
  crescent = older, dashed new moon = `dev`); Use and Maintain are a planet's day and night
  sides. The marks are drawn by `src/components/planet.tsx` and mean the same on every page.
  The system sits in a wider sky, the Verse (ADR-0029): the Verse mark, the still sky, the zoom
  (the scale strip, the Verse view, the morph) and its words. Space words name places, never
  controls: Search, Overview, Use, Maintain, On this page and version names keep their plain
  names, and a space word always stands beside a plain sentence (DESIGN.md, *The Places, Not
  Controls Rule*). Every page stands on one still star field, never behind
  text, and shares the site header (the brand mark, nepal-dev.com's mountain and flag, and wordmark, nav, GitHub, the orrery theme
  switch; a search button on docs pages), the tokens and fonts, and the full Horizon footer: a closing line whose *The Verse* opens the Verse view (ADR-0033), a living sky (twinkling stars, shooting stars, lit clouds, a natural sun in the light theme or a moon in its real phase in the dark one, placed by the reader's clock with the scene lit to match, rising with the scroll, ADR-0040) whose loops run only while it is on screen, rising over the docs sidebar and trajectory as they set into its dusk edge (ADR-0030), the Himalaya under it (ADR-0037: three ranges, alpenglow, the flag raised once on arrival, one light per entry, an observatory on the shoulder), and the credit "Part of nepal-dev.com. Made with ❤️ by Puncoz Nepal.". Docs pages use the
  Fumadocs notebook layout: the scale strip above every page in place of Fumadocs' breadcrumb
  (Verse ▸ System ▸ planet ▸ side and moon ▸ orbits ▸ page; going up zooms out); a planet header
  on each overview, its planet morphing from the home page's card; in the sidebar the planet row
  (chip, a sun for Use and a moon for Maintain), the moon picker, then a scale ladder (ADR-0027): top-level
  pages as landmarks (*Overview* first in every track, ADR-0025), separators as belts, folders as
  orbit rows with only the open one a card, its pages satellites on an arc (one open at a time at
  each level, ADR-0023; a folder named `adr` a constellation of moons phased by status,
  ADR-0019); the overview shows its default track's sidebar (ADR-0025); "On this page" as a trajectory
  with a probe riding at the reading position and the minutes left; moon notices on `dev` and
  older lines. Unknown paths get the out-of-orbit 404 (`src/app/not-found.tsx`), from the proxy, with a 404 status and the whole page on the first request (ADR-0034).
- **The home page is the system** (ADR-0014, ADR-0016, ADR-0017): the turning system (ADR-0032:
  the npm, Composer, PyPI, Go and Projects orbits always, the empty ones faint and named; a
  breathing star; planet trails; a lean toward the pointer; a spin-up once per session; a comet
  every 20 to 30 seconds; a still nebula; the telemetry line), with *Zoom out to the Verse* (the Verse view, also at `/#verse`, ADR-0029), beside the hero search
  button (it opens the site's Fumadocs search dialog), one planet card per entry
  with no section heading, private projects beyond an asteroid belt (three invented names from
  `src/components/home/private-projects.ts`, shown to everyone by the owner's decision; never a
  real private name there), Two sides of every planet, Every moon and "Read it anywhere"
  (terminal tabs and the live page actions).
- **Cache Components is on** (ADR-0016). Every page and route handler is prerendered; use
  `use cache` and `<Suspense>`, not route segment configs such as `revalidate`. The one
  exception, by the owner's choice: the docs page (`src/app/(site)/(docs)/[...slug]/page.tsx`) exports
  `instant = false`, opting it out of the development-only instant-navigation check. Its whole
  body comes from the slug, so a `<Suspense>` boundary would put a skeleton in every page's
  static HTML and hide the content without scripts.
- **Also here:** Algolia search, `llms.txt` / `llms-full.txt` and per-page Markdown.
- **Readers are counted** (ADR-0041): Vercel Web Analytics and Speed Insights, cookieless, on builds
  that run on Vercel; Google Analytics 4 loaded directly (no Tag Manager) under Consent Mode v2 when
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, with the *Privacy choices* banner and a footer link to
  change the choice. Any other tag needs its own ADR. Search Console is verified by DNS, with no code.
- **Only `main` deploys, straight to production on Vercel** (ADR-0042, ADR-0043): `vercel.json` gives other
  branches no deployment and has no `ignoreCommand`, so every commit on `main` goes to the custom domain and
  there are no previews. A build that starts elsewhere has no variables, so it cannot publish. A push
  to `main` runs `bun run build` there, which publishes the site and the search index together. Production
  deploys come only from Git, never `vercel --prod`.
- **Every page is ready for search and sharing** (ADR-0035), from where it sits and its frontmatter:
  canonical link, `robots`, title, description, Open Graph, JSON-LD and its own share image, with
  `robots.txt`, `sitemap.xml`, the manifest and the Apple icon. `SITE_URL` holds the address; without
  it nothing is indexed and `bun run build` refuses to publish. `description` is required on every page.
- **Every diagram is a `<Diagram>`** around its Mermaid fence (ADR-0022): the page shows its
  Archify view from `diagrams/`, in a sandboxed frame with the site shell; every Markdown surface
  carries the Mermaid. The build fails on a bare Mermaid fence outside the templates.
- **Not published:** demos and private projects. Each waits for its own ADR: ADR-0011 covers
  diagrams only, so a demo's embed is not decided yet.
