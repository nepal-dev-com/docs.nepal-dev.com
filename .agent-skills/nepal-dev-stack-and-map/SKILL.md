---
name: nepal-dev-stack-and-map
description: "Where things live and what is installed in the Nepal Dev Verse docs repository: the stack table (framework, Fumadocs, catalogue, routes, look, search, analytics, linting, testing, hosting) with the file for each concern, and the full repository map. Read before looking for a file, or touching config, dependencies, routes, the proxy or the build."
---

# nepal-dev-stack-and-map

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `AGENTS.md`. Links are relative to this file.

## First

- Read the installed docs and source (`node_modules/next/dist/docs/`, Fumadocs' source and types), never recall.
- A new top-level route or `public/` file must be added to `src/lib/known-paths.ts`; a test compares them.
- The docs layout stays below `(site)`, in `(docs)`.
- `bun run lint` does not run today; fixing it needs its own ADR.
- A new dependency or a tooling change needs an ADR and the owner's yes.

## Stack (`AGENTS.md` §5)

What is installed **today** (verified from `package.json`, `node_modules` and the config files):

| Concern | In the repo |
|---|---|
| Framework | Next.js **16.4.2**, App Router, `src/app/`; `cacheComponents` and `partialPrefetching` on in `next.config.mjs` (ADR-0016) |
| Docs framework | Fumadocs: `fumadocs-core` 16.17.9, `fumadocs-mdx` 15.4.10, `fumadocs-ui` 16.17.9 (installed as `@fumadocs/base-ui`) |
| Content source | `defineDocs` from `fumadocs-mdx/macro` in `src/lib/source.ts`, reading `content/`; no `source.config.ts`; generated files in `.source/` (gitignored) |
| Catalogue | `src/lib/catalog-schema.ts` (meta schema with `catalog`, `name`, `version`, `channel`), `src/lib/catalog-plugin.ts` (build checks, line names and URL segments, typed roots), `src/lib/catalog.ts` (entries for pages and the home page), `src/lib/catalog-routes.ts` (line redirects and known paths in the proxy) — ADR-0013, ADR-0015, ADR-0034 |
| Routes | `/` is `src/app/(home)/`; every page is `src/app/(site)/(docs)/[...slug]/` at `/<slug>/…` (`docsRoute` is `''` in `src/lib/shared.ts`); `src/proxy.ts` leaves the site's routes alone, handles line redirects and Markdown on catalogued paths, and rewrites any other unknown path to `/_not-found` with a 404; `src/lib/known-paths.ts` holds the routes and the list of paths, and a new top-level route or `public/` file must be added there (a test compares them); the build fails if the list differs from the pages — ADR-0015, ADR-0034. **The docs layout stays below `(site)`, in `(docs)`:** Turbopack hangs the root `not-found.tsx` on the children of a first-layer route group, inside that group's layout, so a layout directly in `(site)` would stand around the 404 |
| Look | Tokens on `:root` and `.dark` in `src/app/global.css`, mapped onto Fumadocs' `--color-fd-*`; site header, orrery theme switch (`src/components/theme-switch.tsx`, `useTheme` from `fumadocs-ui/provider/base`), docs typography, planet header, notices, planet row, orbit stations, trajectory and Horizon footer in `src/app/site.css`; planet and moon marks in `src/components/planet.tsx`; the brand mark in `src/components/brand-mark.tsx`, its flag in `src/components/nepal-flag.tsx` with `src/lib/flag.ts`, the logo as supplied in `assets/nepal-dev-logo.svg` (not served), the site icon `src/app/icon.svg` (ADR-0036); the Verse's place mark in `src/components/verse-mark.tsx`; the still sky in `src/components/sky.tsx` from `src/lib/sky.ts`, styled in `global.css` and `site.css`; the zoom: `src/components/zoom-page.tsx` (`ZoomPage` in each page, `PlanetMorph` on the card's and the planet header's planet), the transition types in `src/lib/zoom.ts`, their CSS in `global.css` (ADR-0029); fonts Bricolage Grotesque, Onest and JetBrains Mono through `next/font/google` in `src/app/layout.tsx`; light/dark through next-themes (dark by default); visual system in `DESIGN.md` — ADR-0015, ADR-0017, ADR-0018, ADR-0029 |
| Home page | `src/app/(home)/` and `src/components/home/`; the Verse view in `orbit-map.tsx` with `src/lib/verse-view.ts`, its hash target at the very top of `(home)/page.tsx` (ADR-0033); the living system's geometry, comet and telemetry in `src/lib/hero-sky.ts` (ADR-0032); styles in `src/app/(home)/home.css` (also the 404's) — ADR-0014, ADR-0016, ADR-0017, ADR-0029, ADR-0032 |
| Docs pages | Fumadocs notebook layout in `src/app/(site)/(docs)/layout.tsx`, header `src/components/site-header.tsx` (shared with the home page), `src/components/docs/` (the scale strip in `scale-strip.tsx` with `src/lib/scale-strip.ts`, rendered first in the page with Fumadocs' breadcrumb off, docs header, planet header, the planet row in `track-switch.tsx` with `src/lib/overview-sidebar.ts`, orbit stations in `orbit-station.tsx` passed as `sidebar.components`, the ADR constellation in `adr-constellation.tsx` with `src/lib/adr-status.ts`, the trajectory in `trajectory-toc.tsx` passed as `slots.toc` from the page, version notice), moon icons on the version menu, `src/lib/trajectory.ts` and `src/lib/reading-time.ts` (geometry, time left, reading time), `src/components/horizon-footer.tsx` below every page, its scene from `src/lib/horizon-sky.ts`, its hour from `src/lib/horizon-time.ts` and its loops, the flag and the clock woken by `src/components/horizon-awake.tsx` (ADR-0030, ADR-0037, ADR-0040), — ADR-0015, ADR-0017, ADR-0018, ADR-0019, ADR-0029 |
| UI runtime | React 19.3 |
| Language | TypeScript 7, `strict`; `@/*` → `./src/*` |
| Styling | Tailwind CSS 4 through `@tailwindcss/postcss`; global styles in `src/app/global.css` |
| Diagrams | Archify source and HTML side by side in `diagrams/<project-slug>/`; served by `src/app/diagrams/[project]/[file]/route.ts` with the site shell `src/lib/diagram-shell.ts`; `<Diagram>` in `src/components/diagram.tsx` and `diagram-frame.tsx` (registered in `src/components/mdx.tsx`); the shape check and Markdown filter in `src/lib/remark-diagrams.ts` (wired in `src/lib/source.ts`); file checks in `src/lib/diagrams.ts`, run by the loader plugin `src/lib/diagrams-plugin.ts`; the CSP `sandbox` header for `/diagrams/:path*` in `next.config.mjs` — ADR-0011, ADR-0022 |
| Search engines and sharing | `src/lib/seo.ts` holds the address (`SITE_URL`), each page's rule, title, metadata and JSON-LD, all pure and tested; `generateMetadata` in the docs page and `metadata` in the home page read it; `src/components/json-ld.tsx`; `src/app/robots.ts`, `sitemap.ts` (`lastmod` from git, `lastModified: true` in `source.ts`), `manifest.ts`, `apple-icon.tsx`; share images in `src/app/og/[...slug]/route.tsx` with `src/components/share-image.tsx` and `src/lib/share-fonts.ts` (fetched from Google Fonts at build, in `use cache`); the description check in `catalog-plugin.ts`; `X-Robots-Tag: noindex` on the Markdown route and in `next.config.mjs` for the other machine-readable routes — ADR-0035 |
| Search | Algolia: `src/app/static.json/route.ts` emits the records (scope `tag` plus catalogue fields), `scripts/sync-content.ts` pushes them after `next build`; `src/lib/algolia.ts` is the search-only client (off Vercel it builds without its two variables, with a search that finds nothing, ADR-0047), used by `src/components/search.tsx`, the one search dialog (its no-results line in `search-empty.tsx`) (the home page's hero button opens it) |
| Analytics | `@vercel/analytics` 2.0.1 and `@vercel/speed-insights` 2.0.0 in `src/components/vercel-insights.tsx` (rendered when `VERCEL` is set at build); GA4 in `src/components/google-analytics.tsx` (two `next/script` elements, the consent script first); the banner and the footer button in `src/components/privacy-choices.tsx`; the rules, the ID check and the inline script in `src/lib/privacy-choice.ts`, tested; styles at the end of `site.css` — ADR-0041 |
| Linting | ESLint 9 + `eslint-config-next` (core-web-vitals); ignores `.agent-skills/**`, `.claude/**` and `.agents/**` (agent skills, ADR-0009, ADR-0045). **`bun run lint` does not run today:** `typescript-eslint` does not support TypeScript 7; fixing it needs its own ADR |
| Testing | `bun test` (Bun's built-in runner), tests beside the code as `*.test.ts(x)`; `@types/bun` 1.4.4 through `tsconfig.test.json`, which `tsconfig.json` leaves out so the site's own check never sees Bun's types; server components rendered with `react-dom/server`; client components not unit-tested until a DOM is chosen — ADR-0007, ADR-0021 |
| Hosting | Vercel, `main` only, straight to production: `vercel.json` (`git.deploymentEnabled`, no `ignoreCommand`, `installCommand` `bun install --frozen-lockfile` with Vercel's Bun, 1.4.4 as picked from `bun.lock` (ADR-0044), `buildCommand`); `scripts/require-full-history.sh` fails a shallow clone; `engines.node` `26.x` in `package.json`; the publish variables checked by `src/lib/publish-env.ts` — ADR-0042, ADR-0043 |
| CI | GitHub Actions, checks only, no secret: `.github/workflows/ci.yml` (`verify`: Node 26, Bun 1.4.4, frozen install, `bun run test`, `bun run types:check`, `bunx next build`; `dependency-review` on pull requests) and `codeql.yml` (`Analyze`); `.github/dependabot.yml` (bun and github-actions at `/`, weekly, grouped, seven-day cooldown, `@types/bun` and `@types/node` majors left out); the rules in `src/lib/github-automation.ts`, tested. **The Bun version in `ci.yml` moves by hand with `@types/bun`; an action is pinned to a commit SHA** — ADR-0047 |
| Package manager | Bun (`bun.lock`; 1.4.4 on the owner's machine and in the Vercel build). `scripts/sync-content.ts` runs on Node (26.x on Vercel, `engines.node`; v24 on the owner's machine) — ADR-0043 |

- **Read the installed docs first.** `node_modules/next/dist/docs/` holds the docs for the exact
  installed Next.js version. For Fumadocs, read the installed packages' source and type
  definitions. Use them, not recall.
- **Content is MDX in `content/<slug>/`.** Frontmatter is validated by `pageSchema` and
  `meta.json` files by `metaSchema` (`src/lib/source.ts`).

## Repository map (`AGENTS.md` §10)

```
.
├── AGENTS.md            # this working agreement (CLAUDE.md imports it)
├── CLAUDE.md            # → @AGENTS.md
├── .agent-skills/       # every agent skill: nepal-dev-* (this project's own, binding), vendored and pinned, installed —
│                        #   start at INDEX.md (§12, ADR-0009, ADR-0045); not published
├── .claude/skills/, .agents/skills/   # relative symlinks into .agent-skills/, nothing else (ADR-0045)
├── README.md            # project overview and getting started
├── CONTRIBUTING.md      # how to contribute, for people; restates this agreement and adds no rule (ADR-0046)
├── CODE_OF_CONDUCT.md   # Contributor Covenant 2.1 (ADR-0046)
├── SECURITY.md          # how to report a vulnerability or leaked private content, privately (ADR-0046)
├── LICENSE              # MIT: the code (ADR-0046)
├── LICENSE-CONTENT      # CC BY 4.0: content/ and diagrams/ (ADR-0046)
├── .github/             # issue forms, pull request template, CODEOWNERS (ADR-0046);
│                        #   workflows/ci.yml (tests, type check, build, dependency review) and codeql.yml, checks only;
│                        #   dependabot.yml (weekly, grouped, seven-day cooldown) — ADR-0047
├── PRODUCT.md           # product truth for UI work (impeccable reads it); not published (§8)
├── DESIGN.md            # the home page's visual system, with .impeccable/design.json; not published (§8)
├── PROJECT_AGENTS.md    # guide for repositories that include this one as a git submodule (§1)
├── content/             # PUBLISHED — every page readers see; one folder per entry, at /<slug> (ADR-0015)
│   ├── <project-slug>/  # a package or project: meta.json `catalog`, index.mdx, use/ (dev/ + named lines), maintain/;
│   │                    #   a project of several repositories has use/<id>/ and maintain/<id>/ per repository (ADR-0024)
│   └── docs/            # this site as a project, at /docs: meta.json `catalog`, index.mdx
│       └── maintain/    # its Maintain track: this site's own decisions and design documents
│           ├── meta.json    # title, page order
│           ├── index.mdx    # documentation map — what lives where
│           ├── _templates/  # a starting point for each document type
│           ├── adr/         # binding decisions — immutable once approved
│           ├── app-flow/    # Mermaid flows + screen wireframes, one per feature — with every UI-changing ADR
│           ├── prd/         # product requirements + user stories
│           ├── architecture/  # high-level design
│           ├── dfd/         # data flow diagrams
│           ├── erd/         # persisted data, once there is any
│           ├── state/       # state machines / lifecycles
│           ├── sequence/    # sequence diagrams
│           ├── api/         # route handler and endpoint contracts
│           ├── rbac/        # access matrices (public vs private documentation)
│           └── security/    # threat model, data classification, secrets, audit checklist
├── src/
│   ├── proxy.ts         # catalogued paths: line redirects (use/latest, unknown lines), then /<page>.md and Markdown negotiation; any other unknown path: the true 404 (ADR-0034)
│   ├── app/             # App Router: layout.tsx (fonts, theme), global.css (tokens), site.css (header, theme switch,
│   │                    #   planet header, notices, planet row, stations, trajectory, footer), not-found.tsx (the 404),
│   │                    #   (home)/ (home page, home.css), (site)/(docs)/[...slug]/ (every page, notebook layout),
│   │                    #   llms.txt, llms-full.txt, llms.mdx/[...slug]/, og/[...slug]/ (share images), static.json,
│   │                    #   robots.ts, sitemap.ts, manifest.ts, apple-icon.tsx (ADR-0035),
│   │                    #   diagrams/[project]/[file]/ (each Archify diagram with the site shell), icon.svg (the brand mark, small)
│   ├── components/      # site-header.tsx, theme-switch.tsx, planet.tsx (planet and moon marks),
│   │                    #   share-image.tsx (the share images), json-ld.tsx (ADR-0035),
│   │                    #   brand-mark.tsx (the brand mark), nepal-flag.tsx (the flag), verse-mark.tsx (the Verse's place mark), sky.tsx (the still sky), zoom-page.tsx (zoom and morph, ADR-0029),
│   │                    #   horizon-footer.tsx + horizon-awake.tsx (the Himalayan Horizon, ADR-0030, ADR-0037, ADR-0040), footer-actions.tsx, mdx.tsx, diagram.tsx + diagram-frame.tsx, profile-link.tsx, search.tsx + search-empty.tsx (search dialog),
│   │                    #   google-analytics.tsx, privacy-choices.tsx, vercel-insights.tsx (analytics and the Privacy choices banner, ADR-0041),
│   │                    #   docs/ (scale strip, docs header, planet header, track switch, orbit stations,
│   │                    #   ADR constellation, trajectory TOC, version notice),
│   │                    #   home/ (home header, hero, orbit map with the Verse view, search button, planet cards,
│   │                    #   beyond-the-belt + private-projects.ts, two sides, moon rows, terminal,
│   │                    #   assistant actions)
│   └── lib/             # source.ts (content loader), catalog*.ts (catalogue schema, checks, entries, redirects),
│                        #   rings.ts (ecosystem rings and kind names), sky.ts (seeded star fields), horizon-sky.ts (the Horizon's scene, ADR-0030, ADR-0037), horizon-time.ts (its sun, moon and light by the reader's clock, ADR-0040), flag.ts (the flag's geometry, ADR-0036), hero-sky.ts (the living hero, ADR-0032), scale-strip.ts, verse-view.ts and zoom.ts (ADR-0029), overview-sidebar.ts (ADR-0025), sidebar-ladder.ts (ADR-0027),
│                        #   docs-layout.ts (DocsLayout options: Fumadocs' theme switch off), trajectory.ts, reading-time.ts, adr-status.ts,
│                        #   known-paths.ts (site routes and every path with a page, ADR-0034), search-scope.ts, algolia.ts, diagrams.ts + diagrams-plugin.ts (file checks), remark-diagrams.ts
│                        #   (shape check, Markdown filter), diagram-shell.ts, diagram-files.ts (ADR-0022),
│                        #   github-profile.ts (ADR-0020), privacy-choice.ts (ADR-0041), github-automation.ts (the workflow and Dependabot rules, ADR-0047); tests beside the code, *.test.ts(x) (ADR-0021)
│                        #   shared.ts (site name, community, maker, home line, routes, GitHub),
│                        #   seo.ts (address, each page's rule, titles, metadata, JSON-LD) and share-fonts.ts (ADR-0035)
├── assets/              # the logo as supplied, not served (ADR-0036)
├── diagrams/            # Archify diagrams, one pair each (ADR-0022)
│   └── <project-slug>/  # <slug>.json, the source (not served) · <slug>.html, PUBLISHED at /diagrams/ with the site shell
├── scripts/
│   ├── sync-content.ts  # after next build: pushes static.json records to Algolia
│   └── require-full-history.sh  # the Vercel build fails on a shallow clone (ADR-0042)
├── vercel.json          # Vercel: main only, no previews, the install and build commands (ADR-0042)
├── .env.example         # every variable the site reads, names only (§9)
├── next.config.mjs      # Fumadocs MDX plugin, Cache Components, the sandbox header for /diagrams/, X-Robots-Tag on machine-readable routes
├── postcss.config.mjs   # Tailwind CSS 4
├── eslint.config.mjs    # eslint-config-next (core-web-vitals)
├── tsconfig.json        # strict; @/* → ./src/*; leaves out *.test.ts(x)
└── tsconfig.test.json   # the tests' check, with Bun's types (ADR-0021)
```

The system as built is described in [`content/docs/maintain/architecture/system.mdx`](../../content/docs/maintain/architecture/system.mdx).
