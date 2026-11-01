<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# puncoz-packages-docs — working agreement

This file governs how work is done in this repository, by humans and by AI agents alike.
`CLAUDE.md` imports it, so it applies to every Claude Code session.

Read this file **before** touching anything. If a change alters how work is done here,
updating this file is part of that change.

> **Status.** The working agreement is set out in ADR-0001 to ADR-0010, all **Approved** by the
> owner on 2026-11-01. The content invariants (§6) are still for the owner to confirm.

## 1. What this project is

**puncoz-packages-docs** is the documentation site for everything its owner, Puncoz Nepal,
builds and publishes:

- **Open-source packages and libraries** — npm packages, PHP / Composer packages, and packages
  and libraries for any other ecosystem.
- **Projects**, both **public** and **private**.

It is a [Fumadocs](https://fumadocs.dev) site on Next.js. Every page a reader sees is a file in
`content/`, and every package or project is a folder there, `content/<slug>/`, published at
`/<slug>` ([ADR-0015](content/docs/maintain/adr/ADR-0015-every-entry-lives-at-the-root-in-one-shape-and-one-look.mdx)).
This site is one project among them: **Puncoz Docs**, slug `docs`, at `content/docs/`. Its own
decisions and design documents are its Maintain track, `content/docs/maintain/`, published at
`/docs/maintain` (§8).

- **Consumed as a git submodule.** The owner's project and package repositories include this
  repository as a submodule and write their own pages into it, each in its own folder
  `content/<project-slug>/`. Their guide is [`PROJECT_AGENTS.md`](PROJECT_AGENTS.md)
  ([ADR-0010](content/docs/maintain/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx)).
  If you are working here from a consuming repository, read that first.
- The overview and getting started are in [`README.md`](README.md). The map of this site's
  maintainer documentation is
  [`content/docs/maintain/index.mdx`](content/docs/maintain/index.mdx).

**Current state:** the site is named **Puncoz Docs** (`appName` in `src/lib/shared.ts`, a
working name) and links to GitHub `puncoz-official/docs`. **No package or project is documented
yet** besides the site itself, so the home page shows its empty states.

- **One shape for every entry** (ADR-0013, ADR-0015). `content/<slug>/` has a `catalog` entry in
  its `meta.json`, a `use/` track and a `maintain/` track. A versioned `use/` holds version
  lines: `dev/` for unreleased work in progress, and released lines whose URL segment is the
  `name` set in their `meta.json` (any string, such as `v1.0` or `2024 LTS`). Maintain is not
  versioned.
- **The build checks the shape.** Line redirects, version banners, scoped sidebars, search
  fields and `llms.txt` labels all come from it.
- **The whole site is one solar system** (ADR-0015, ADR-0017, ADR-0018). The star is the maker; a package
  is a solid planet, a project a ringed one; each version line is a moon (full = latest,
  crescent = older, dashed new moon = `dev`); Use and Maintain are a planet's day and night
  sides. The marks are drawn by `src/components/planet.tsx` and mean the same on every page.
  Every page shares the site header (brand, nav, GitHub, the orrery theme switch; a search
  button on docs pages), the tokens and fonts, and the full Horizon footer. Docs pages use the
  Fumadocs notebook layout: a planet header on each overview; in the sidebar the planet row
  (chip, a sun for Use and a moon for Maintain), the moon picker and orbit stations (each folder
  a card, its pages moons on an arc, only the current one open; a folder named `adr` a
  constellation of moons phased by status, ADR-0019); "On this page" as a trajectory
  with a probe riding at the reading position and the minutes left; moon notices on `dev` and
  older lines. Unknown paths get the out-of-orbit 404 (`src/app/not-found.tsx`).
- **The home page is the system** (ADR-0014, ADR-0016, ADR-0017): the turning system beside
  the hero search button (it opens the site's Fumadocs search dialog), one planet card per entry
  with no section heading, private projects beyond an asteroid belt (three invented names from
  `src/components/home/private-projects.ts`, shown to everyone by the owner's decision; never a
  real private name there), Two sides of every planet, Every moon and "Read it anywhere"
  (terminal tabs and the live page actions).
- **Cache Components is on** (ADR-0016). Every page and route handler is prerendered; use
  `use cache` and `<Suspense>`, not route segment configs such as `revalidate`.
- **Also here:** Algolia search, `llms.txt` / `llms-full.txt`, per-page Markdown and Open Graph
  images.
- **Every diagram is a `<Diagram>`** around its Mermaid fence (ADR-0022): the page shows its
  Archify view from `diagrams/`, in a sandboxed frame with the site shell; every Markdown surface
  carries the Mermaid. The build fails on a bare Mermaid fence outside the templates.
- **Not published:** demos and private projects. Each waits for its own ADR: ADR-0011 covers
  diagrams only, so a demo's embed is not decided yet.

## 2. The ADR gate — non-negotiable

**Every feature and functional change starts with an ADR, and no implementation begins
before the repository owner approves it.** The full decision is
[ADR-0001](content/docs/maintain/adr/ADR-0001-adr-driven-development-workflow.mdx).

### Workflow

1. **Propose.** Copy [`content/docs/maintain/_templates/adr.mdx`](content/docs/maintain/_templates/adr.mdx) to
   `content/docs/maintain/adr/ADR-NNNN-kebab-title.mdx` using the *next free number* from
   [`content/docs/maintain/adr/index.mdx`](content/docs/maintain/adr/index.mdx). Set **`Status: Proposed`** and add the index
   row straight away, so ADRs in flight cannot collide on a number.
   **If the change reaches the UI, write its app flow in the same change**
   ([ADR-0008](content/docs/maintain/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx)):
   `content/docs/maintain/app-flow/<feature-slug>.mdx`. See *App flow* below.
2. **Stop.** Do not write application code. Tell the owner the ADR, and its app flow if it has
   one, are ready for review.
3. **Revise** in place while the owner has feedback — status stays `Proposed`.
   **People in an ADR are GitHub usernames**, written as a profile link:
   `[@puncoz](https://github.com/puncoz)` in `Deciders` and `Approved by`. The owner's is
   `puncoz`. If anyone else decides or approves and their username is not known, ask for it.
   The site shows such a link as a chip with the person's avatar (ADR-0020).
4. **On explicit approval only:** set `Status: Approved`, fill `Approved by: [@puncoz](https://github.com/puncoz)` (the approver's GitHub username)
   and `Approved on: <date>`, update the index row, *then* implement.
5. **Never** edit an approved ADR's Decision section. Supersede it with a new ADR and
   cross-link both files.

### Does my change need an ADR?

| Change | ADR? |
|---|---|
| New feature, route, site section, layout or navigation structure | **Yes** |
| How content is organised: per-ecosystem, per-package or per-project layout, versioning, i18n | **Yes** |
| Anything that decides how **private** project documentation is stored, built, served or searched | **Yes** |
| External integration (search, analytics, hosting, CI, a docs generator) | **Yes** |
| New dependency, or a change to build / lint / test tooling | **Yes** |
| Changing something an approved ADR already decided | **Yes — superseding ADR** |
| Departing from a content invariant (§6) | **Yes** |
| Cross-cutting conventions (layout, naming, error handling, styling, MDX components) | **Yes** |
| Writing or updating a package's or project's pages within the approved content conventions | No |
| Bug fix restoring documented behaviour, no decision changed | No |
| Typos, formatting, comments, copy | No |

Unclear which side the change falls on? It needs an ADR.

### App flow — required with every ADR that changes the UI

[ADR-0008](content/docs/maintain/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx). An ADR that adds or changes
anything a person sees — a page type, route, nav item, sidebar, search, dialog, or a page's
layout, controls or states — ships `content/docs/maintain/app-flow/<feature-slug>.mdx`, and the two are reviewed
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
[`content/docs/maintain/_templates/app-flow.mdx`](content/docs/maintain/_templates/app-flow.mdx).

## 3. Execution rules

- **Never commit.** No `git commit`, no `git push`, no rebase, no history rewriting, no
  branch switching. Leave every change in the working tree — the owner reviews the whole set
  and commits by hand. Reading git state (`status`, `diff`, `log`) is fine.
- **Hand the owner any command that changes more than this repository's files.** Agents may
  create, edit, update, move and delete files inside this repository for the agreed task, and
  run read-only commands plus the local verification (`bun run test`, `bun run lint`, `bun run types:check`,
  `bunx next build`). Before deleting or overwriting, look at the target, and name every path
  explicitly: never a path built from an empty or unchecked variable.
- **Installs and uninstalls for this project run after the owner's yes.** First say what is
  installed or removed (package and version, or skill and source), why, where it goes
  (`dependencies`, `devDependencies`, `.claude/skills/`) and the exact command. Run it only once
  the owner approves that list. `bun install` restoring the existing lockfile asks too.
- **Everything else goes to the owner to run**, with what it does: any git write, anything
  outside the repository (`~/`, global config, global installs, user-scope plugins), network
  writes, publishing, and skill scripts that download or launch a browser.
- **Stay inside this repository.** Never read, search or list anything outside it (another
  project, the home directory, dotfiles, global config) unless the owner asks for that place.
  When a task seems to need something outside, ask first. Using an approved skill counts as
  asked: invoking it, reading the reference files it points to, and running its approved
  scripts from its own folder (§12.2).
- **Dependencies are proposed, never added unasked.** For a new package or dependency, ask the
  owner with options (what it is, why, alternatives, size and licence). A dependency also needs
  an ADR (§2). Once the ADR and the owner's yes are in, the agent runs the install.
- **Don't stop for per-change review.** Once an ADR is approved, carry out *all* the work it
  covers, end to end. The owner reviews the finished set, not each step.
- **Keep docs in the same change.** An implementation is incomplete until `AGENTS.md`,
  `README.md`, the design documents and the ADR index reflect it (§8).
- **Keep tests in the same change.** A change is not complete without tests for its happy path
  and its obvious failure paths — small changes included
  ([ADR-0007](content/docs/maintain/adr/ADR-0007-tests-are-part-of-every-change.mdx)). A bug fix starts with a
  test that fails for the bug's reason.
- **Leave the managed Next.js block alone.** `next dev` rewrites the content between
  `<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->`. Never edit
  inside those markers; put project content below them.
- **Don't publish by accident.** `bun run build` also pushes every page to the live Algolia
  index (§5). Verify with `bunx next build` instead.
- **Use the skills — they do not outrank this file.** See §12.
- **Never guess — ask.** See §4.
- **Report honestly.** If something is blocked, unverified, or skipped, say so plainly,
  including anything taken on trust because it could not be checked.

## 4. Never guess — ask

[ADR-0004](content/docs/maintain/adr/ADR-0004-ask-never-guess.mdx). Picking something plausible and moving on
is the failure mode this rule exists to stop: the assumption looks finished, gives no signal
it was made, and is found late. In documentation a plausible wrong guess — an install command,
a function signature, a default value, a supported version — is published as fact and copied
into other people's code.

**First, decide which kind of question it is.**

| The question is… | Response |
|---|---|
| **Verifiable** — a framework API, a library's behaviour, what existing code does, what a config sets, what a documented package actually exports or requires | **Go and check.** Read `node_modules/next/dist/docs/`, the installed Fumadocs source and types, the config, or the documented package's own source and manifest. Never assert from memory what can be read — and don't ask the owner either. |
| **Undetermined** — product behaviour, scope, priority, naming, content structure, what is public and what is private, which trade-off to accept | **Ask.** |

If it is unclear which it is, check first; what survives checking is a real question.

**Every question carries:**

1. The decision in one line, and why the code and the documents cannot settle it.
2. **Two to four concrete options**, each with its actual consequence — not the same idea
   reworded.
3. **A recommendation, listed first and marked as such**, with the reason.
4. What follows from each: what gets built, what it costs, what it forecloses.

The owner should be able to answer by picking, not by writing a specification. **Always ask
with selectable options**, each with a label and a description, and leave room for the owner
to answer with an idea of their own instead (the question tool's "Other").
Never present an open question without options.

**Assumptions are never silent.** If work proceeds on an assumption, state it explicitly in
the response and write it into the ADR or design document where it shapes the design. An
assumption that lives only in the code is a guess.

**Ask at ADR time.** Most of these questions belong in the ADR's *Options considered* table,
before anything is built. If one surfaces mid-implementation: finish everything that does not
depend on the answer, then ask.

## 5. Stack and commands

What is installed **today** (verified from `package.json`, `node_modules` and the config files):

| Concern | In the repo |
|---|---|
| Framework | Next.js **16.4.2**, App Router, `src/app/`; `cacheComponents` and `partialPrefetching` on in `next.config.mjs` (ADR-0016) |
| Docs framework | Fumadocs: `fumadocs-core` 16.17.9, `fumadocs-mdx` 15.4.10, `fumadocs-ui` 16.17.9 (installed as `@fumadocs/base-ui`) |
| Content source | `defineDocs` from `fumadocs-mdx/macro` in `src/lib/source.ts`, reading `content/`; no `source.config.ts`; generated files in `.source/` (gitignored) |
| Catalogue | `src/lib/catalog-schema.ts` (meta schema with `catalog`, `name`, `version`, `channel`), `src/lib/catalog-plugin.ts` (build checks, line names and URL segments, typed roots), `src/lib/catalog.ts` (entries for pages and the home page), `src/lib/catalog-routes.ts` (line redirects in the proxy) — ADR-0013, ADR-0015 |
| Routes | `/` is `src/app/(home)/`; every page is `src/app/(site)/[...slug]/` at `/<slug>/…` (`docsRoute` is `''` in `src/lib/shared.ts`); `src/proxy.ts` acts only on catalogued paths — ADR-0015 |
| Look | Tokens on `:root` and `.dark` in `src/app/global.css`, mapped onto Fumadocs' `--color-fd-*`; site header, orrery theme switch (`src/components/theme-switch.tsx`, `useTheme` from `fumadocs-ui/provider/base`), docs typography, planet header, notices, planet row, orbit stations, trajectory and Horizon footer in `src/app/site.css`; planet and moon marks in `src/components/planet.tsx`; fonts Bricolage Grotesque, Onest and JetBrains Mono through `next/font/google` in `src/app/layout.tsx`; light/dark through next-themes (dark by default); visual system in `DESIGN.md` — ADR-0015, ADR-0017, ADR-0018 |
| Home page | `src/app/(home)/` and `src/components/home/`; styles in `src/app/(home)/home.css` (also the 404's) — ADR-0014, ADR-0016, ADR-0017 |
| Docs pages | Fumadocs notebook layout in `src/app/(site)/layout.tsx`, header `src/components/site-header.tsx` (shared with the home page), `src/components/docs/` (docs header, planet header, the planet row in `track-switch.tsx`, orbit stations in `orbit-station.tsx` passed as `sidebar.components`, the ADR constellation in `adr-constellation.tsx` with `src/lib/adr-status.ts`, the trajectory in `trajectory-toc.tsx` passed as `slots.toc` from the page, version notice), moon icons on the version menu, `src/lib/trajectory.ts` and `src/lib/reading-time.ts` (geometry, time left, reading time), `src/components/horizon-footer.tsx` below every page — ADR-0015, ADR-0017, ADR-0018, ADR-0019 |
| UI runtime | React 19.3 |
| Language | TypeScript 7, `strict`; `@/*` → `./src/*` |
| Styling | Tailwind CSS 4 through `@tailwindcss/postcss`; global styles in `src/app/global.css` |
| Diagrams | Archify source and HTML side by side in `diagrams/<project-slug>/`; served by `src/app/diagrams/[project]/[file]/route.ts` with the site shell `src/lib/diagram-shell.ts`; `<Diagram>` in `src/components/diagram.tsx` and `diagram-frame.tsx` (registered in `src/components/mdx.tsx`); the shape check and Markdown filter in `src/lib/remark-diagrams.ts` (wired in `src/lib/source.ts`); file checks in `src/lib/diagrams.ts`, run by the loader plugin `src/lib/diagrams-plugin.ts`; the CSP `sandbox` header for `/diagrams/:path*` in `next.config.mjs` — ADR-0011, ADR-0022 |
| Search | Algolia: `src/app/static.json/route.ts` emits the records (scope `tag` plus catalogue fields), `scripts/sync-content.ts` pushes them after `next build`; `src/lib/algolia.ts` is the search-only client used by `src/components/search.tsx`, the one search dialog (the home page's hero button opens it) |
| Linting | ESLint 9 + `eslint-config-next` (core-web-vitals); ignores `.claude/**` (agent skills, ADR-0009). **`bun run lint` does not run today:** `typescript-eslint` does not support TypeScript 7; fixing it needs its own ADR |
| Testing | `bun test` (Bun's built-in runner), tests beside the code as `*.test.ts(x)`; `@types/bun` 1.4.4 through `tsconfig.test.json`, which `tsconfig.json` leaves out so the site's own check never sees Bun's types; server components rendered with `react-dom/server`; client components not unit-tested until a DOM is chosen — ADR-0007, ADR-0021 |
| Package manager | Bun (`bun.lock`; 1.4.4 on the owner's machine). `scripts/sync-content.ts` runs on Node (v24) |

- **Read the installed docs first.** `node_modules/next/dist/docs/` holds the docs for the exact
  installed Next.js version. For Fumadocs, read the installed packages' source and type
  definitions. Use them, not recall.
- **Content is MDX in `content/<slug>/`.** Frontmatter is validated by `pageSchema` and
  `meta.json` files by `metaSchema` (`src/lib/source.ts`).

### Commands

| Task | Command |
|---|---|
| Install | `bun install` |
| Dev server | `bun run dev` |
| Build only (local verification) | `bunx next build` |
| Build **and publish the search index** | `bun run build` — `next build`, then pushes every page to Algolia |
| Start built app | `bun run start` |
| Test | `bun run test` — `bun test --no-env-file`, so `.env.local` stays out of tests |
| Type check | `bun run types:check` — `next typegen`, then `tsc --noEmit` for the site and for `tsconfig.test.json` |
| Lint | `bun run lint` |
| Add a dependency | `bun add <pkg>` — **an approved ADR and the owner's yes first; then the agent runs it** (§3) |

`bun run build` reads `.env.local` and writes to the live search index with
`ALGOLIA_WRITE_KEY`; never run it to verify a change. Run `bun run lint`,
`bun run types:check` and `bunx next build` before declaring work complete, and report the lint
failure above while it stands. Run `bun run test` with them.

## 6. Content invariants

**Proposed — for the owner to confirm.** Every ADR respects these, and departing from one
needs an ADR that says so.

1. **Private stays private.** Documentation for a private project never reaches a public
   surface: the site, the search index, `llms.txt` / `llms-full.txt`, `static.json`, per-page
   Markdown, Open Graph images, or a public repository. Until an ADR decides how private
   documentation is kept and served, **no private project content goes into
   `content/`** — today every page there is published on all of those surfaces.
2. **Documentation is checked against the code.** Install commands, signatures, options,
   defaults and supported versions are read from the documented package's source and
   manifest, never written from memory (§4).
3. **Every package page says which version it documents.** A version line's `version` states
   it on every page in the line, and in its Markdown (ADR-0013).
4. **Examples run.** A code example works against the version the page documents, with
   invented values; no real credentials, customer data or personal data.
5. **Every page is readable as Markdown.** The per-page Markdown route and `llms.txt` stay
   working for every page, so readers and tools can take the docs without the site.

## 7. Code style — comments

[ADR-0003](content/docs/maintain/adr/ADR-0003-code-comment-policy.mdx). **Comments explain *why*. The code
explains *what*. If the code is self-explanatory, write no comment at all.**

A comment is warranted only when the reasoning, trade-off, edge case or constraint cannot be
recovered from the code: why a workaround exists, why this approach beat the obvious one, why a
value is hardcoded, why an edge case is handled this way, a non-obvious external constraint
(a framework quirk, a third-party API limit, a browser limitation).

```ts
// Bad — restates what is visible
// add the page to the list
pages.push(page)

// Good — states what the code cannot
// Next.js writes it under `route-cache` when built with an adapter, like on Vercel
```

- **Prefer a reference to an ADR over prose** (`// Private pages are excluded here — ADR-00NN.`).
- **Keep them short** — a line or two, directly above what they explain. No paragraphs, no
  banners, no `=====` section headers.
- **Confusing code is not a comment problem.** Rewrite it.
- **Every branch takes a block.** `if`, `else`, `for`, `while` and `do` bodies are braced even
  for a single statement. ADR-0003's ESLint rule, `curly: ["error", "all"]`,
  is added by the ADR that makes `bun run lint` run again (the owner's choice); until then it is
  followed by hand.
- **Configuration files are different.** In `next.config.mjs`, `eslint.config.mjs`,
  `tsconfig.json`, `.env.example`, CI and deployment manifests, a comment **may describe what a
  key does**, not only why. Still short, still linking the ADR that governs the value.
  `.env.example` documents every variable and **never its value**.
- **Out of scope:** JSDoc/TSDoc on an exported public API, `@ts-expect-error` descriptions,
  pragmas and directives. Those stay.

## 8. Documentation duties

[ADR-0002](content/docs/maintain/adr/ADR-0002-living-design-documentation.mdx). The map of what lives where is
[`content/docs/maintain/index.mdx`](content/docs/maintain/index.mdx); each directory's `index.mdx` holds its own conventions.

### Three kinds of document

Everything lives under `content/`, and **everything there is published** (§6.1, §9).

| Kind | Where | Rule |
|---|---|---|
| **Package and project documentation** | `content/<slug>/`, except `content/docs/maintain/` | The product: what readers come for. Written and updated freely within the approved content conventions and the invariants (§6). |
| **Decisions** | `content/docs/maintain/adr/` | Immutable once approved. Superseded, never edited. |
| **Living design documents** | everything else under `content/docs/maintain/` | Describe this site **as it stands right now**, and are edited in place. |

This site's Maintain track is about this site only. A package's or project's own decisions
and design notes go in that package's or project's pages, not here.

**The one exception: design-tool context at the root.** By the owner's decision,
[`PRODUCT.md`](PRODUCT.md) sits at the repository root, where the impeccable skill reads it, with
its [`DESIGN.md`](DESIGN.md) (the home page's visual system) and `.impeccable/design.json`, and
so would hallmark's `.hallmark/` cache and build log. They are not published. They hold
product truth and the visual system only: decisions still go in ADRs, and design documents in
`content/docs/maintain/`. Keep `PRODUCT.md` a snapshot, like any living document.

### Format of a page

- **Every page under `content/` is `.mdx`** (ADR-0012), so a page can use an MDX component
  when it needs one. Write it as Markdown otherwise. MDX reads `<` and `{` in prose as JSX: put
  a `<slug>`-style placeholder in backticks or escape it (`\<slug>`), write void tags closed
  (`<br />`), and use `{/* … */}` instead of an HTML comment. Code blocks and frontmatter need
  no escaping.
- **Frontmatter `title`** (required by `pageSchema`) instead of an `#` heading; Fumadocs
  renders the title. `description` is optional.
- A folder's overview is its `index.mdx`. Order is in each folder's `meta.json`
  (`content/docs/maintain/meta.json` here).
- Links between pages are relative file paths that **start with `./` or `../`**
  (`./adr/index.mdx`, `../adr/ADR-0001-….mdx`). Only those are resolved to page URLs; a bare
  `adr/index.mdx` is left as a broken link.

### Living documents are snapshots, not changelogs

No revision tables. No "previously X, now Y". No strikethrough, no "new in v2". **What is no
longer true is deleted, not annotated.** Anyone opening the file sees the current picture and
nothing else — git and the ADRs hold the history.

### Write before building

With the feature's ADR, before implementation — then update during the build if the design
moves.

| Document | Directory | Required when |
|---|---|---|
| **App flow** | `content/docs/maintain/app-flow/` | **Any ADR that adds or changes something a person sees (§2, ADR-0008)** |
| PRD + user stories | `content/docs/maintain/prd/` | Any reader-facing feature |
| Architecture / HLD | `content/docs/maintain/architecture/` | A new module, content source, build step, background job or external integration |
| ERD | `content/docs/maintain/erd/` | Any persisted data — `erd/system.mdx` is created by the first ADR that adds some |
| DFD | `content/docs/maintain/dfd/` | Data crosses a trust boundary or reaches an external system (search, hosting, analytics, CI), or private content moves between processes |
| State diagram | `content/docs/maintain/state/` | An entity has more than two states, or guarded / timed transitions (a page's draft → published, a package version's lifecycle) |
| Sequence diagram | `content/docs/maintain/sequence/` | A flow spans several actors or systems, is async, or has failure/retry behaviour (build and index sync, docs generation from a package) |
| API spec | `content/docs/maintain/api/` | Any route handler or endpoint another client or system calls (`llms.txt`, `static.json`, per-page Markdown) |
| RBAC matrix | `content/docs/maintain/rbac/` | Visibility or permitted actions depend on who the reader is — private project documentation |
| Security analysis | `content/docs/maintain/security/` | The change introduces an attack surface worth its own analysis. `secrets.mdx` and `threat-model.mdx` are updated whenever they stop being accurate. |

Judgement applies — a small change may need none of them. **If it is unclear whether one is
required, write it.** Start from [`content/docs/maintain/_templates/`](content/docs/maintain/_templates/index.mdx).

**Diagrams and flows are made with Archify**, always: architecture, workflow, sequence, data
flow, lifecycle, ERD, class, tree and timeline diagrams. This is the owner's standing choice.
Use the project copy in `.claude/skills/archify`. Archify produces a standalone, interactive
HTML file.

- **Every diagram is Mermaid and Archify together** ([ADR-0022](content/docs/maintain/adr/ADR-0022-diagrams-show-archify-on-the-page-and-mermaid-in-markdown.mdx)):
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

### Always check these

| File | Update when |
|---|---|
| The living design documents | The code no longer matches them. An implementation is **not complete** while a design document contradicts it. |
| `AGENTS.md` (this file) | The way work is done changes — conventions, commands, structure, rules, stack |
| `README.md` | What the project is, how to run it, or how it is laid out changes |
| `PROJECT_AGENTS.md` | Anything changes how consuming repositories work here: folder layout, page format, invariants, git flow, commands, or a rule in this file they must follow. **Keep it in step with `AGENTS.md` in the same change.** |
| `content/docs/maintain/adr/index.mdx` | An ADR is written or changes status — keep the index and the next free number accurate |

## 9. Security and privacy

[ADR-0005](content/docs/maintain/adr/ADR-0005-security-as-a-standing-practice.mdx). This site will hold
documentation for **private projects** next to public packages. A flaw here is not a broken
page. It is a private project's architecture, internal API or client name published on the
open web, indexed by a search engine and copied into an LLM's training data — where it cannot
be taken back.

Security is a property of **every change**, not a pre-deploy event. Full documents live in
[`content/docs/maintain/security/`](content/docs/maintain/security/index.mdx).

### Never guess at a security decision

Whether a page is private, who may read it, whether a route is public, what goes to the search
provider, what a published example may contain — **the owner decides, and it is recorded**
(§4).

### Per-change check — only the rows the change touches

| If the change… | Check |
|---|---|
| Introduces or reads a secret / env var | Not a literal in source · **`NEXT_PUBLIC_` publishes to the world** · added to `content/docs/maintain/security/secrets.mdx` **and** `.env.example` |
| Adds a page to `content/` | Belongs to a public package or project (§6.1) · no secret, token, internal hostname, client name or personal data in text, examples or screenshots |
| Adds a route handler or endpoint | Says what it exposes, to whom · documented in `content/docs/maintain/api/` · private content excluded or authorization enforced server-side |
| Sends anything to a third party (search, analytics, hosting) | Exactly what is sent, minimised · recorded as a DFD boundary crossing · never private content without an approved ADR |
| Accepts input (search queries, URLs, MDX components that take props) | Validated · output encoded · no user-controlled HTML |
| Adds logging or error handling | **No secrets, tokens or personal data** in logs or client responses |

### Full audits at gates

The audits in [`content/docs/maintain/security/checklist.mdx`](content/docs/maintain/security/checklist.mdx) run **before the first
internet-reachable deployment** and **before each release** of the site. Findings are reported
as: what it is · where it is · how it would be exploited · the fix. Fix data exposure and
unauthorized access first, abuse and logic flaws second. **Findings go to the owner, not into
the maintainer documentation**, until they are fixed: those pages are published (ADR-0002).

### Principles that hold regardless of stack

- **No secret is ever a string literal** — not in source, config, comments, tests or docs.
- **Anything reaching the browser is public**, and so is everything in the search index: the
  search-only key can read every record.
- **Authorization is server-side, always.** Hiding a nav item or a page is not a permission.
- **Published is permanent.** Once a page has been served, indexed or crawled, removing it does
  not take it back.
- **Errors to clients are generic.**
- **A build that would publish refuses to run without the secrets it needs**, rather than
  publishing partially.

### Tool-specific rules

Algolia is adopted; its checks are in
[`content/docs/maintain/security/checklist.mdx`](content/docs/maintain/security/checklist.mdx#tool-specific-checks). **The ADR that
adopts a host, analytics, CI or an authentication provider adds its own checks** there.

## 10. Repository map

```
.
├── AGENTS.md            # this working agreement (CLAUDE.md imports it)
├── CLAUDE.md            # → @AGENTS.md
├── .claude/agent-skills/  # trusted, pinned agent skills — start at INDEX.md (§12, ADR-0009); not published
├── README.md            # project overview and getting started
├── PRODUCT.md           # product truth for UI work (impeccable reads it); not published (§8)
├── DESIGN.md            # the home page's visual system, with .impeccable/design.json; not published (§8)
├── PROJECT_AGENTS.md    # guide for repositories that include this one as a git submodule (§1)
├── content/             # PUBLISHED — every page readers see; one folder per entry, at /<slug> (ADR-0015)
│   ├── <project-slug>/  # a package or project: meta.json `catalog`, index.mdx, use/ (dev/ + named lines), maintain/
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
│   ├── proxy.ts         # catalogued paths only: line redirects (use/latest, unknown lines), then /<page>.md and Markdown negotiation
│   ├── app/             # App Router: layout.tsx (fonts, theme), global.css (tokens), site.css (header, theme switch,
│   │                    #   planet header, notices, planet row, stations, trajectory, footer), not-found.tsx (the 404),
│   │                    #   (home)/ (home page, home.css), (site)/[...slug]/ (every page, notebook layout),
│   │                    #   llms.txt, llms-full.txt, llms.mdx/[...slug]/, og/[...slug]/, static.json,
│   │                    #   diagrams/[project]/[file]/ (each Archify diagram with the site shell)
│   ├── components/      # site-header.tsx, theme-switch.tsx, planet.tsx (planet and moon marks),
│   │                    #   horizon-footer.tsx, footer-actions.tsx, mdx.tsx, diagram.tsx + diagram-frame.tsx, profile-link.tsx, search.tsx (search dialog),
│   │                    #   docs/ (docs header, planet header, track switch, orbit stations,
│   │                    #   ADR constellation, trajectory TOC, version notice),
│   │                    #   home/ (home header, hero, orbit map, search button, planet cards,
│   │                    #   beyond-the-belt + private-projects.ts, two sides, moon rows, terminal,
│   │                    #   assistant actions)
│   └── lib/             # source.ts (content loader), catalog*.ts (catalogue schema, checks, entries, redirects),
│                        #   rings.ts (ecosystem rings and kind names), trajectory.ts, reading-time.ts, adr-status.ts,
│                        #   search-scope.ts, algolia.ts, diagrams.ts + diagrams-plugin.ts (file checks), remark-diagrams.ts
│                        #   (shape check, Markdown filter), diagram-shell.ts, diagram-files.ts (ADR-0022),
│                        #   github-profile.ts (ADR-0020); tests beside the code, *.test.ts(x) (ADR-0021)
│                        #   shared.ts (site name, routes, GitHub)
├── diagrams/            # Archify diagrams, one pair each (ADR-0022)
│   └── <project-slug>/  # <slug>.json, the source (not served) · <slug>.html, PUBLISHED at /diagrams/ with the site shell
├── scripts/
│   └── sync-content.ts  # after next build: pushes static.json records to Algolia
├── .env.example         # every variable the site reads, names only (§9)
├── next.config.mjs      # Fumadocs MDX plugin, Cache Components, the sandbox header for /diagrams/
├── postcss.config.mjs   # Tailwind CSS 4
├── eslint.config.mjs    # eslint-config-next (core-web-vitals)
├── tsconfig.json        # strict; @/* → ./src/*; leaves out *.test.ts(x)
└── tsconfig.test.json   # the tests' check, with Bun's types (ADR-0021)
```

The system as built is described in [`content/docs/maintain/architecture/system.mdx`](content/docs/maintain/architecture/system.mdx).

## 11. Quick checklist

- [ ] Read `AGENTS.md`, [`content/docs/maintain/index.mdx`](content/docs/maintain/index.mdx) and the relevant ADRs.
- [ ] Which skills fit this task? Look them up in `.claude/agent-skills/INDEX.md`, load only those,
      and name them — process skills first (§12).
- [ ] Does this need an ADR? If yes — write it, `Status: Proposed`, index it, and stop.
- [ ] Does it change the UI? Then write `content/docs/maintain/app-flow/<feature>.mdx` with it.
- [ ] Any undetermined product, content or privacy decision? Ask with options and a
      recommendation (§4).
- [ ] Which design documents does §8 require? Write them with the ADR.
- [ ] ADR approved by the owner? Only then write code.
- [ ] Read the relevant `node_modules/next/dist/docs/` guide or Fumadocs source before writing
      code against them.
- [ ] Content invariants respected (§6)? Nothing private in `content/`.
- [ ] Complete the whole approved scope in one pass.
- [ ] Comments only where they explain *why* (§7).
- [ ] Security: run the per-change rows that apply (§9). Any doubt → ask, never assume.
- [ ] Living design documents updated in place to match the code.
- [ ] `AGENTS.md`, `README.md`, `content/docs/maintain/adr/index.mdx` updated as needed.
- [ ] Tests written or updated — happy path **and** the obvious failures (ADR-0007).
- [ ] `bun run test`, `bun run lint`, `bun run types:check` and `bunx next build` pass.
- [ ] Leave everything uncommitted for the owner's review.

## 12. Skills

[ADR-0006](content/docs/maintain/adr/ADR-0006-agent-skills-are-advisory.mdx). Contributors here — human and AI —
have a library of installed **skills**: packaged workflows for brainstorming, debugging,
technical writing, API design, UI work and more. **Use them.** Left alone, they go unused, and
the same task gets a rigorous treatment one day and an ad-hoc one the next.

They are recommendations about *method*. This file is *authority*.

### 12.1 Order of precedence

```
1. AGENTS.md and content/docs/maintain/   binding   — ADRs, design documents, this working agreement
2. Skills                advisory  — invoke freely; follow unless (1) says otherwise
3. Default behaviour     last      — only where neither of the above covers the situation
```

**A skill never grants permission this repository withholds:**

| No skill authorises… | Because |
|---|---|
| Writing application code before an approved ADR | §2 · ADR-0001 |
| `git commit`, `git push`, rebase, or switching branches | §3 |
| Adding a dependency, or changing build / lint / test tooling | §2 · §5 |
| A documentation layout other than `content/docs/maintain/` and `content/docs/maintain/_templates/`, including a skill's own spec or plan folder | §8 · ADR-0002 |
| Using a skill that is not in `.claude/agent-skills/`, or running a skill's scripts or CLI commands | §12.2 · ADR-0009 |
| Explanatory *what*-comments, banners, or `=====` section headers | §7 · ADR-0003 |
| Deciding a security, privacy or public-vs-private question on the owner's behalf | §4 · §9 · ADR-0004 · ADR-0005 |
| A `NEXT_PUBLIC_` variable, a third-party integration, or a secret's handling | §9 · ADR-0005 |
| Publishing: `bun run build`, a deploy, or any write to the search index | §3 · §5 |
| Asserting Next.js, React or Fumadocs behaviour from recall | §5 — read the installed docs and source |

An agent following a skill faithfully can produce work that looks disciplined, cites a
recognised process, and has quietly bypassed the gate this project exists around. The
violation is invisible in the diff, because the diff looks like good work.

### 12.2 Which skill, when — trusted skills only

[ADR-0009](content/docs/maintain/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx). The trusted skills for
this repository are **vendored** in [`.claude/agent-skills/`](.claude/agent-skills/INDEX.md) at pinned
commits: process skills (brainstorming, debugging, TDD, verification, code review), ADRs and
source-driven work, writing, front end, Next.js bundles, Algolia, security and
supply chain.
They sit outside `content/`, so they are not published, and outside `.claude/skills/`, so
Claude Code does not auto-load them.

- **Start at [`.claude/agent-skills/INDEX.md`](.claude/agent-skills/INDEX.md).** Find the row for the
  task and load **only** the one or two `SKILL.md` files it names. Never load the whole folder.
  This keeps the context small.
- **Apply the index's *Overrides*.** They state how each skill instruction that conflicts with
  this file is handled, in general (spec/plan folders, commits, worktrees, installs, scripts,
  secrets, live-fetched rules) and per skill.
- **The pinned copy wins.** When an installed plugin offers a skill of the same name, for
  example `superpowers:brainstorming`, follow the vendored copy and its overrides.
- **Untrusted skills are not used.** A skill outside `.claude/agent-skills/`, including one
  installed as a plugin on someone's machine, needs the owner's approval first. Ask with options
  (§4) and **always name the better-trusted alternatives**. The trust policy is in
  [`.claude/agent-skills/SOURCES.md`](.claude/agent-skills/SOURCES.md): trusted means trusted by many, from
  the owner of the package or library it covers, or from another source of high trust.
- **Approved installed skills.** The owner has also approved skill sets they installed,
  without vendoring them: **impeccable**, **ui-ux-pro-max**, the **taste skills**, **hallmark**
  (the project copy in `.claude/skills/hallmark`) and **Archify** (the project copy in
  `.claude/skills/archify`, always used for diagrams and flows, §8). Use them whenever UI or UX work calls for them, through the Skill tool, with the
  routing and overrides in `INDEX.md` § Approved installed skills. impeccable is the primary
  for UI work. Their local, read-only analysis scripts may run; anything that writes, calls the
  network or launches a browser asks first. Not every skill in those sets is routed. Which one
  builds the home page is decided in that page's ADR.
- **Grow the set as work needs it — but ask before downloading anything.** When a task would
  be better served by a skill that is not vendored (a new ecosystem, tool or integration),
  propose one. Searching registries and reading listings is fine; **cloning, downloading or
  vendoring a skill is not, until the owner says yes**. The request names the use case, two to
  four trusted candidates with source, trust basis and licence, and a recommendation (§4).
  On a yes, follow *Adding a skill* in `SOURCES.md`.
- **Skills' scripts and CLI commands are proposals.** They run only when the approved ADR covers
  them or the owner says yes.
- **Process skills come first** (brainstorming, systematic debugging, TDD, verification). They
  set the approach; implementation skills carry it out.
- Built-in Claude Code skills not in the folder (for example `claude-api`, `dataviz`) count as
  first-party and may be used, under this file.

### 12.3 Skills stop at the gate

```
brainstorming ──> ADR (Proposed) + design docs ──> OWNER APPROVES ──> domain skills implement
                                                          ▲
                                       nothing crosses this line without it
```

A skill whose workflow ends with "now implement" ends, here, at `Status: Proposed`.

### 12.4 Name the skill; report what you dropped

**Name it.** When a skill is invoked, say so, so the owner can see what method produced the
change.

**Report what you dropped.** When a rule above cuts a skill's workflow short, say which skill,
which step, and which rule overrode it.
