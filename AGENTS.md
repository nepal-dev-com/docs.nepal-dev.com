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

> **Status.** The working agreement is set out in ADR-0001 to ADR-0010, all **Proposed**. Until
> the owner approves them, treat them as the intended rules: follow them, and raise any
> disagreement as a question.

## 1. What this project is

**puncoz-packages-docs** is the documentation site for everything its owner, Puncoz Nepal,
builds and publishes:

- **Open-source packages and libraries** — npm packages, PHP / Composer packages, and packages
  and libraries for any other ecosystem.
- **Projects**, both **public** and **private**.

It is a [Fumadocs](https://fumadocs.dev) site on Next.js. Every page a reader sees is a file in
`content/docs/`. This site's own decisions and design documents are one project among them:
**Documentation**, a Fumadocs root folder at `content/docs/documentation/`, published at
`/docs/documentation` with its own sidebar tab (§8).

- **Consumed as a git submodule.** The owner's project and package repositories include this
  repository as a submodule and write their own pages into it, each in its own root folder
  `content/docs/<project-slug>/`. Their guide is [`PROJECT_AGENTS.md`](PROJECT_AGENTS.md)
  ([ADR-0010](content/docs/documentation/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx)).
  If you are working here from a consuming repository, read that first.
- The overview and getting started are in [`README.md`](README.md). The map of the
  Documentation project is
  [`content/docs/documentation/index.mdx`](content/docs/documentation/index.mdx).

**Current state:** the Fumadocs scaffold, unchanged. A placeholder home page at `/`, two
placeholder pages under `/docs` (`content/docs/index.mdx`, `content/docs/test.mdx`), Algolia
search, `llms.txt` / `llms-full.txt`, per-page Markdown and Open Graph images. The site name
(`appName = 'My App'`) and the GitHub link (`gitConfig`) in `src/lib/shared.ts` are still the
scaffold's placeholders. **No package or project is documented yet.** Each will get a root
folder `content/docs/<project-slug>/` (ADR-0010); how pages are structured inside a folder, and
versioning, are not decided yet.

## 2. The ADR gate — non-negotiable

**Every feature and functional change starts with an ADR, and no implementation begins
before the repository owner approves it.** The full decision is
[ADR-0001](content/docs/documentation/adr/ADR-0001-adr-driven-development-workflow.mdx).

### Workflow

1. **Propose.** Copy [`content/docs/documentation/_templates/adr.mdx`](content/docs/documentation/_templates/adr.mdx) to
   `content/docs/documentation/adr/ADR-NNNN-kebab-title.mdx` using the *next free number* from
   [`content/docs/documentation/adr/index.mdx`](content/docs/documentation/adr/index.mdx). Set **`Status: Proposed`** and add the index
   row straight away, so ADRs in flight cannot collide on a number.
   **If the change reaches the UI, write its app flow in the same change**
   ([ADR-0008](content/docs/documentation/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx)):
   `content/docs/documentation/app-flow/<feature-slug>.mdx`. See *App flow* below.
2. **Stop.** Do not write application code. Tell the owner the ADR, and its app flow if it has
   one, are ready for review.
3. **Revise** in place while the owner has feedback — status stays `Proposed`.
4. **On explicit approval only:** set `Status: Approved`, fill `Approved by: Puncoz Nepal`
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

[ADR-0008](content/docs/documentation/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx). An ADR that adds or changes
anything a person sees — a page type, route, nav item, sidebar, search, dialog, or a page's
layout, controls or states — ships `content/docs/documentation/app-flow/<feature-slug>.mdx`, and the two are reviewed
together. It shows:

- **entry points**: where a person reaches the feature from, and who does not see it;
- **the flow**: the screens and the transitions between them, made with Archify, plus its
  Mermaid flowchart version (§8);
- **one wireframe per screen**, as a Mermaid `block-beta` diagram with invented sample values,
  at phone width first; and, when clicking through or seeing states would settle a question,
  an HTML wireframe or prototype (§8);
- **each screen's states**: empty, loading, not found, refused, error, degraded, success.

Not needed for a bug fix, for content within the approved conventions, or for an ADR that
changes nothing visible. Unsure whether a person would notice? Write it. Template:
[`content/docs/documentation/_templates/app-flow.mdx`](content/docs/documentation/_templates/app-flow.mdx).

## 3. Execution rules

- **Never commit.** No `git commit`, no `git push`, no rebase, no history rewriting, no
  branch switching. Leave every change in the working tree — the owner reviews the whole set
  and commits by hand. Reading git state (`status`, `diff`, `log`) is fine.
- **Hand the owner any command that changes more than this repository's files.** Agents may
  create, edit, update, move and delete files inside this repository for the agreed task, and
  run read-only commands plus the local verification (`bun run lint`, `bun run types:check`,
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
  ([ADR-0007](content/docs/documentation/adr/ADR-0007-tests-are-part-of-every-change.mdx)). A bug fix starts with a
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

[ADR-0004](content/docs/documentation/adr/ADR-0004-ask-never-guess.mdx). Picking something plausible and moving on
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
| Framework | Next.js **16.4.2**, App Router, `src/app/` |
| Docs framework | Fumadocs: `fumadocs-core` 16.17.9, `fumadocs-mdx` 15.4.10, `fumadocs-ui` 16.17.9 (installed as `@fumadocs/base-ui`) |
| Content source | `defineDocs` from `fumadocs-mdx/macro` in `src/lib/source.ts`, reading `content/docs/`; no `source.config.ts`; generated files in `.source/` (gitignored) |
| UI runtime | React 19.3 |
| Language | TypeScript 7, `strict`; `@/*` → `./src/*` |
| Styling | Tailwind CSS 4 through `@tailwindcss/postcss`; global styles in `src/app/global.css` |
| Search | Algolia: `src/app/static.json/route.ts` emits the records, `scripts/sync-content.ts` pushes them after `next build`, `src/components/search.tsx` queries with the search-only key |
| Linting | ESLint 9 + `eslint-config-next` (core-web-vitals); ignores `.claude/**` (agent skills, ADR-0009) |
| Testing | None installed — chosen by its own ADR (ADR-0007) |
| Package manager | Bun (`bun.lock`; 1.4.4 on the owner's machine). `scripts/sync-content.ts` runs on Node (v24) |

- **Read the installed docs first.** `node_modules/next/dist/docs/` holds the docs for the exact
  installed Next.js version. For Fumadocs, read the installed packages' source and type
  definitions. Use them, not recall.
- **Content is MDX in `content/docs/`.** Frontmatter is validated by `pageSchema` and
  `meta.json` files by `metaSchema` (`src/lib/source.ts`).

### Commands

| Task | Command |
|---|---|
| Install | `bun install` |
| Dev server | `bun run dev` |
| Build only (local verification) | `bunx next build` |
| Build **and publish the search index** | `bun run build` — `next build`, then pushes every page to Algolia |
| Start built app | `bun run start` |
| Type check | `bun run types:check` — `next typegen && tsc --noEmit` |
| Lint | `bun run lint` |
| Add a dependency | `bun add <pkg>` — **an approved ADR and the owner's yes first; then the agent runs it** (§3) |

`bun run build` reads `.env.local` and writes to the live search index with
`ALGOLIA_WRITE_KEY`; never run it to verify a change. Run `bun run lint`,
`bun run types:check` and `bunx next build` before declaring work complete.

## 6. Content invariants

**Proposed — for the owner to confirm.** Every ADR respects these, and departing from one
needs an ADR that says so.

1. **Private stays private.** Documentation for a private project never reaches a public
   surface: the site, the search index, `llms.txt` / `llms-full.txt`, `static.json`, per-page
   Markdown, Open Graph images, or a public repository. Until an ADR decides how private
   documentation is kept and served, **no private project content goes into
   `content/docs/`** — today every page there is published on all of those surfaces.
2. **Documentation is checked against the code.** Install commands, signatures, options,
   defaults and supported versions are read from the documented package's source and
   manifest, never written from memory (§4).
3. **Every package page says which version it documents.**
4. **Examples run.** A code example works against the version the page documents, with
   invented values; no real credentials, customer data or personal data.
5. **Every page is readable as Markdown.** The per-page Markdown route and `llms.txt` stay
   working for every page, so readers and tools can take the docs without the site.

## 7. Code style — comments

[ADR-0003](content/docs/documentation/adr/ADR-0003-code-comment-policy.mdx). **Comments explain *why*. The code
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
  for a single statement. ADR-0003 enforces this with ESLint `curly: ["error", "all"]` once it
  is approved.
- **Configuration files are different.** In `next.config.mjs`, `eslint.config.mjs`,
  `tsconfig.json`, `.env.example`, CI and deployment manifests, a comment **may describe what a
  key does**, not only why. Still short, still linking the ADR that governs the value.
  `.env.example` documents every variable and **never its value**.
- **Out of scope:** JSDoc/TSDoc on an exported public API, `@ts-expect-error` descriptions,
  pragmas and directives. Those stay.

## 8. Documentation duties

[ADR-0002](content/docs/documentation/adr/ADR-0002-living-design-documentation.mdx). The map of what lives where is
[`content/docs/documentation/index.mdx`](content/docs/documentation/index.mdx); each directory's `index.mdx` holds its own conventions.

### Three kinds of document

Everything lives under `content/docs/`, and **everything there is published** (§6.1, §9).

| Kind | Where | Rule |
|---|---|---|
| **Package and project documentation** | `content/docs/` outside `documentation/` | The product: what readers come for. Written and updated freely within the approved content conventions and the invariants (§6). |
| **Decisions** | `content/docs/documentation/adr/` | Immutable once approved. Superseded, never edited. |
| **Living design documents** | everything else under `content/docs/documentation/` | Describe this site **as it stands right now**, and are edited in place. |

The **Documentation** project is about this site only. A package's or project's own decisions
and design notes go in that package's or project's pages, not here.

**The one exception: design-tool context at the root.** By the owner's decision,
[`PRODUCT.md`](PRODUCT.md) sits at the repository root, where the impeccable skill reads it, and
so would its `DESIGN.md` and `.impeccable/` once written, and hallmark's `.hallmark/` cache and
build log. They are not published. They hold
product truth and the visual system only: decisions still go in ADRs, and design documents in
`content/docs/documentation/`. Keep `PRODUCT.md` a snapshot, like any living document.

### Format of a page

- **Every page under `content/docs/` is `.mdx`** (ADR-0012), so a page can use an MDX component
  when it needs one. Write it as Markdown otherwise. MDX reads `<` and `{` in prose as JSX: put
  a `<slug>`-style placeholder in backticks or escape it (`\<slug>`), write void tags closed
  (`<br />`), and use `{/* … */}` instead of an HTML comment. Code blocks and frontmatter need
  no escaping.
- **Frontmatter `title`** (required by `pageSchema`) instead of an `#` heading; Fumadocs
  renders the title. `description` is optional.
- A folder's overview is its `index.mdx`. Order and the root-folder setting are in
  `content/docs/documentation/meta.json`.
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
| **App flow** | `content/docs/documentation/app-flow/` | **Any ADR that adds or changes something a person sees (§2, ADR-0008)** |
| PRD + user stories | `content/docs/documentation/prd/` | Any reader-facing feature |
| Architecture / HLD | `content/docs/documentation/architecture/` | A new module, content source, build step, background job or external integration |
| ERD | `content/docs/documentation/erd/` | Any persisted data — `erd/system.mdx` is created by the first ADR that adds some |
| DFD | `content/docs/documentation/dfd/` | Data crosses a trust boundary or reaches an external system (search, hosting, analytics, CI), or private content moves between processes |
| State diagram | `content/docs/documentation/state/` | An entity has more than two states, or guarded / timed transitions (a page's draft → published, a package version's lifecycle) |
| Sequence diagram | `content/docs/documentation/sequence/` | A flow spans several actors or systems, is async, or has failure/retry behaviour (build and index sync, docs generation from a package) |
| API spec | `content/docs/documentation/api/` | Any route handler or endpoint another client or system calls (`llms.txt`, `static.json`, per-page Markdown) |
| RBAC matrix | `content/docs/documentation/rbac/` | Visibility or permitted actions depend on who the reader is — private project documentation |
| Security analysis | `content/docs/documentation/security/` | The change introduces an attack surface worth its own analysis. `secrets.mdx` and `threat-model.mdx` are updated whenever they stop being accurate. |

Judgement applies — a small change may need none of them. **If it is unclear whether one is
required, write it.** Start from [`content/docs/documentation/_templates/`](content/docs/documentation/_templates/index.mdx).

**Diagrams and flows are made with Archify**, always: architecture, workflow, sequence, data
flow, lifecycle, ERD, class, tree and timeline diagrams. This is the owner's standing choice.
Use the project copy in `.claude/skills/archify`. Archify produces a standalone, interactive
HTML file.

- **Every page also keeps a Mermaid version** in a fenced block: flows, sequences, states, ERDs
  and screen wireframes (`block-beta`). The page then stays readable as Markdown (§6.5),
  renders on GitHub and diffs as text.
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
- **Prototypes and HTML wireframes of an app flow's screens** are made with the vendored
  `html-wireframe` (structure, navigation, click-through) and `html-prototype` (states, input,
  feedback) skills, in this site's prototype theme, phone width first. The Mermaid
  `block-beta` wireframe stays in the page. Working files go in `.prototypes/` (gitignored).
- **How this HTML is stored and shown on the site is decided by its own ADR**, because it is a
  UI change: ADR-0011, proposed (embedded with an `<HtmlEmbed>` component in a sandboxed
  frame). Until it is approved, the site shows the Mermaid version as highlighted code, and
  Archify and prototype files stay out of `content/docs/` and `public/`: save them outside the
  published folders and give the owner the path.
- No binary or externally hosted images.

### Always check these

| File | Update when |
|---|---|
| The living design documents | The code no longer matches them. An implementation is **not complete** while a design document contradicts it. |
| `AGENTS.md` (this file) | The way work is done changes — conventions, commands, structure, rules, stack |
| `README.md` | What the project is, how to run it, or how it is laid out changes |
| `PROJECT_AGENTS.md` | Anything changes how consuming repositories work here: folder layout, page format, invariants, git flow, commands, or a rule in this file they must follow. **Keep it in step with `AGENTS.md` in the same change.** |
| `content/docs/documentation/adr/index.mdx` | An ADR is written or changes status — keep the index and the next free number accurate |

## 9. Security and privacy

[ADR-0005](content/docs/documentation/adr/ADR-0005-security-as-a-standing-practice.mdx). This site will hold
documentation for **private projects** next to public packages. A flaw here is not a broken
page. It is a private project's architecture, internal API or client name published on the
open web, indexed by a search engine and copied into an LLM's training data — where it cannot
be taken back.

Security is a property of **every change**, not a pre-deploy event. Full documents live in
[`content/docs/documentation/security/`](content/docs/documentation/security/index.mdx).

### Never guess at a security decision

Whether a page is private, who may read it, whether a route is public, what goes to the search
provider, what a published example may contain — **the owner decides, and it is recorded**
(§4).

### Per-change check — only the rows the change touches

| If the change… | Check |
|---|---|
| Introduces or reads a secret / env var | Not a literal in source · **`NEXT_PUBLIC_` publishes to the world** · added to `content/docs/documentation/security/secrets.mdx` **and** `.env.example` |
| Adds a page to `content/docs/` | Belongs to a public package or project (§6.1) · no secret, token, internal hostname, client name or personal data in text, examples or screenshots |
| Adds a route handler or endpoint | Says what it exposes, to whom · documented in `content/docs/documentation/api/` · private content excluded or authorization enforced server-side |
| Sends anything to a third party (search, analytics, hosting) | Exactly what is sent, minimised · recorded as a DFD boundary crossing · never private content without an approved ADR |
| Accepts input (search queries, URLs, MDX components that take props) | Validated · output encoded · no user-controlled HTML |
| Adds logging or error handling | **No secrets, tokens or personal data** in logs or client responses |

### Full audits at gates

The audits in [`content/docs/documentation/security/checklist.mdx`](content/docs/documentation/security/checklist.mdx) run **before the first
internet-reachable deployment** and **before each release** of the site. Findings are reported
as: what it is · where it is · how it would be exploited · the fix. Fix data exposure and
unauthorized access first, abuse and logic flaws second. **Findings go to the owner, not into
the Documentation project**, until they are fixed: those pages are published (ADR-0002).

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
[`content/docs/documentation/security/checklist.mdx`](content/docs/documentation/security/checklist.mdx#tool-specific-checks). **The ADR that
adopts a host, analytics, CI or an authentication provider adds its own checks** there.

## 10. Repository map

```
.
├── AGENTS.md            # this working agreement (CLAUDE.md imports it)
├── CLAUDE.md            # → @AGENTS.md
├── .claude/agent-skills/  # trusted, pinned agent skills — start at INDEX.md (§12, ADR-0009); not published
├── README.md            # project overview and getting started
├── PRODUCT.md           # product truth for UI work (impeccable reads it); not published (§8)
├── PROJECT_AGENTS.md    # guide for repositories that include this one as a git submodule (§1)
├── content/docs/        # PUBLISHED — every page readers see
│   ├── index.mdx, test.mdx  # scaffold placeholders
│   └── documentation/   # the "Documentation" project (root folder): this site's own docs
│       ├── meta.json    # title, root: true, page order
│       ├── index.mdx    # documentation map — what lives where
│       ├── _templates/  # a starting point for each document type
│       ├── adr/         # binding decisions — immutable once approved
│       ├── app-flow/    # Mermaid flows + screen wireframes, one per feature — with every UI-changing ADR
│       ├── prd/         # product requirements + user stories
│       ├── architecture/  # high-level design
│       ├── dfd/         # data flow diagrams
│       ├── erd/         # persisted data, once there is any
│       ├── state/       # state machines / lifecycles
│       ├── sequence/    # sequence diagrams
│       ├── api/         # route handler and endpoint contracts
│       ├── rbac/        # access matrices (public vs private documentation)
│       └── security/    # threat model, data classification, secrets, audit checklist
├── src/
│   ├── proxy.ts         # serves /docs/<page>.md, and Markdown when the request prefers it
│   ├── app/             # App Router: (home)/, docs/[[...slug]]/, llms.txt, llms-full.txt,
│   │                    #   llms.mdx/docs/, og/docs/, static.json
│   ├── components/      # mdx.tsx (MDX components), search.tsx (Algolia search dialog)
│   └── lib/             # source.ts (content loader), shared.ts (site name, routes, GitHub), layout.shared.tsx
├── scripts/
│   └── sync-content.ts  # after next build: pushes static.json records to Algolia
├── next.config.mjs      # Fumadocs MDX plugin
├── postcss.config.mjs   # Tailwind CSS 4
├── eslint.config.mjs    # eslint-config-next (core-web-vitals)
└── tsconfig.json        # strict; @/* → ./src/*
```

The system as built is described in [`content/docs/documentation/architecture/system.mdx`](content/docs/documentation/architecture/system.mdx).

## 11. Quick checklist

- [ ] Read `AGENTS.md`, [`content/docs/documentation/index.mdx`](content/docs/documentation/index.mdx) and the relevant ADRs.
- [ ] Which skills fit this task? Look them up in `.claude/agent-skills/INDEX.md`, load only those,
      and name them — process skills first (§12).
- [ ] Does this need an ADR? If yes — write it, `Status: Proposed`, index it, and stop.
- [ ] Does it change the UI? Then write `content/docs/documentation/app-flow/<feature>.mdx` with it.
- [ ] Any undetermined product, content or privacy decision? Ask with options and a
      recommendation (§4).
- [ ] Which design documents does §8 require? Write them with the ADR.
- [ ] ADR approved by the owner? Only then write code.
- [ ] Read the relevant `node_modules/next/dist/docs/` guide or Fumadocs source before writing
      code against them.
- [ ] Content invariants respected (§6)? Nothing private in `content/docs/`.
- [ ] Complete the whole approved scope in one pass.
- [ ] Comments only where they explain *why* (§7).
- [ ] Security: run the per-change rows that apply (§9). Any doubt → ask, never assume.
- [ ] Living design documents updated in place to match the code.
- [ ] `AGENTS.md`, `README.md`, `content/docs/documentation/adr/index.mdx` updated as needed.
- [ ] Tests written or updated — happy path **and** the obvious failures (ADR-0007).
- [ ] `bun run lint`, `bun run types:check` and `bunx next build` pass.
- [ ] Leave everything uncommitted for the owner's review.

## 12. Skills

[ADR-0006](content/docs/documentation/adr/ADR-0006-agent-skills-are-advisory.mdx). Contributors here — human and AI —
have a library of installed **skills**: packaged workflows for brainstorming, debugging,
technical writing, API design, UI work and more. **Use them.** Left alone, they go unused, and
the same task gets a rigorous treatment one day and an ad-hoc one the next.

They are recommendations about *method*. This file is *authority*.

### 12.1 Order of precedence

```
1. AGENTS.md and content/docs/documentation/   binding   — ADRs, design documents, this working agreement
2. Skills                advisory  — invoke freely; follow unless (1) says otherwise
3. Default behaviour     last      — only where neither of the above covers the situation
```

**A skill never grants permission this repository withholds:**

| No skill authorises… | Because |
|---|---|
| Writing application code before an approved ADR | §2 · ADR-0001 |
| `git commit`, `git push`, rebase, or switching branches | §3 |
| Adding a dependency, or changing build / lint / test tooling | §2 · §5 |
| A documentation layout other than `content/docs/documentation/` and `content/docs/documentation/_templates/`, including a skill's own spec or plan folder | §8 · ADR-0002 |
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

[ADR-0009](content/docs/documentation/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx). The trusted skills for
this repository are **vendored** in [`.claude/agent-skills/`](.claude/agent-skills/INDEX.md) at pinned
commits: process skills (brainstorming, debugging, TDD, verification, code review), ADRs and
source-driven work, writing, front end, prototypes, Next.js bundles, Algolia, security and
supply chain.
They sit outside `content/docs/`, so they are not published, and outside `.claude/skills/`, so
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
