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

**How it is laid out** ([ADR-0045](content/docs/maintainer-guide/adr/ADR-0045-agents-md-keeps-the-standing-rules-and-in-house-skills-hold-the-rest.mdx)). This file holds the rules every task needs. The depth
is in this project's own skills, `.agent-skills/nepal-dev-<topic>/SKILL.md`. They are part of this
working agreement and as binding as this file. **Before starting a task, check it against the table
in §11 and read every skill it names, in full.** Where a section below says **Depth:**, the skill it
names holds the rest of that section.

**The skills folder.** Every skill is in `.agent-skills/`. `.claude/skills/` holds a link to each one
for Claude Code, and `.agents/skills/` a link to each `nepal-dev-*` skill. If your tool has its own
project skills folder and it holds no `nepal-dev-*` links, link each `.agent-skills/nepal-dev-*`
folder into it with a relative symlink, reload your skills, then start the task. A link always
points inside this repository. If your tool has no skills folder, or a link cannot be made, read the
`SKILL.md` files directly. A skill your tool does not list is still read from its path in §11.

> **Status.** The working agreement is set out in ADR-0001 to ADR-0010, all **Approved** by the
> owner on 2026-11-01, and ADR-0045, approved on 2026-11-14. The content invariants (§6) are still
> for the owner to confirm.

## 1. What this project is

**puncoz-packages-docs** is **Nepal Dev Verse**, the documentation platform for everything
Nepalese developers all over the world build and publish, part of
[nepal-dev.com](https://nepal-dev.com) (ADR-0036). Its owner is nepal-dev.com. Puncoz Nepal maintains it and acts for the owner: in this
file, *the owner* reviews, approves and decides through `puncoz` (ADR-0039). It holds:

- **Open-source packages and libraries** — npm packages, PHP / Composer packages, and packages
  and libraries for any other ecosystem.
- **Projects**, both **public** and **private**.

It is a [Fumadocs](https://fumadocs.dev) site on Next.js. Every page a reader sees is a file in
`content/`, and every package or project is a folder there, `content/<slug>/`, published at
`/<slug>` ([ADR-0015](content/docs/maintainer-guide/adr/ADR-0015-every-entry-lives-at-the-root-in-one-shape-and-one-look.mdx)).
This site is one project among them: **Nepal Dev Verse Docs**, slug `docs`, at `content/docs/`. Its own
decisions and design documents are its Maintainer guide, `content/docs/maintainer-guide/`, published at
`/docs/maintainer-guide` (§8).

- **Consumed as a git submodule.** The owner's project and package repositories include this
  repository as a submodule and write their own pages into it, each in its own folders
  `content/<project-slug>/` and `diagrams/<project-slug>/`, keeping both its User guide and its Maintainer guide
  docs current. Their guide is [`PROJECT_AGENTS.md`](PROJECT_AGENTS.md)
  ([ADR-0010](content/docs/maintainer-guide/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx)).
  If you are working here from a consuming repository, read that first.
- The overview and getting started are in [`README.md`](README.md). The map of this site's
  maintainer documentation is
  [`content/docs/maintainer-guide/index.mdx`](content/docs/maintainer-guide/index.mdx).

**Depth:** `.agent-skills/nepal-dev-site-picture/SKILL.md` holds the site as it stands today: the
current state, one shape for every entry, the solar system, the home page, Cache Components,
analytics, deploys, search and sharing, diagrams, and what is not published. Read it before
changing anything under `src/`.

## 2. The ADR gate — non-negotiable

**Every feature and functional change starts with an ADR, and no implementation begins
before the repository owner approves it.** The full decision is
[ADR-0001](content/docs/maintainer-guide/adr/ADR-0001-adr-driven-development-workflow.mdx).

### Workflow

1. **Propose.** Write the ADR from the template with the next free number, `Status: Proposed`, and
   add its index row straight away. If the change reaches the UI, write its app flow in the same
   change (ADR-0008).
2. **Stop.** Do not write application code. Tell the owner the ADR, and its app flow if it has one,
   are ready for review.
3. **Revise** in place while the owner has feedback; status stays `Proposed`.
4. **On explicit approval only:** mark it `Approved`, with who and when, update the index row,
   *then* implement.
5. **Never** edit an approved ADR's Decision section. Supersede it with a new ADR.

**Depth:** `.agent-skills/nepal-dev-adr-workflow/SKILL.md` holds each step in full (the template,
the file name, people as GitHub usernames, the approval fields) and what an app flow must show.
Read it before writing, revising or approving an ADR or an app flow.

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
  (`dependencies`, `devDependencies`, `.agent-skills/`) and the exact command. Run it only once
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
  ([ADR-0007](content/docs/maintainer-guide/adr/ADR-0007-tests-are-part-of-every-change.mdx)). A bug fix starts with a
  test that fails for the bug's reason.
- **Leave the managed Next.js block alone.** `next dev` rewrites the content between
  `<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->`. Never edit
  inside those markers; put project content below them.
- **Don't publish by accident.** `bun run build` also pushes every page to the live Algolia
  index (§5). Verify with `bunx next build` instead. A push to `main` publishes the site and the
  index on Vercel (ADR-0042), so it is the owner's alone; never run `vercel` or `vercel --prod`.
  GitHub Actions only checks: no workflow publishes, reads a secret, or uses `pull_request_target`,
  and every action is pinned to a commit SHA (ADR-0047).
- **Use the skills — they do not outrank this file.** See §12.
- **Never guess — ask.** See §4.
- **Report honestly.** If something is blocked, unverified, or skipped, say so plainly,
  including anything taken on trust because it could not be checked.

## 4. Never guess — ask

[ADR-0004](content/docs/maintainer-guide/adr/ADR-0004-ask-never-guess.mdx). Picking something plausible and moving on
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

**Depth:** `.agent-skills/nepal-dev-stack-and-map/SKILL.md` holds what is installed today, concern
by concern, with the file for each (framework, Fumadocs, catalogue, routes, look, home page, docs
pages, diagrams, search, analytics, linting, testing, hosting), and the full repository map. Read
it before looking for where something lives, or touching config, dependencies, routes or the build.

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
| Build **and publish the search index** | `bun run build` — `next build`, then pushes every page to Algolia; run by Vercel on each push to `main` (ADR-0042) |
| Start built app | `bun run start` |
| Test | `bun run test` — `bun test --no-env-file`, so `.env.local` stays out of tests |
| Type check | `bun run types:check` — `next typegen`, then `tsc --noEmit` for the site and for `tsconfig.test.json` |
| Lint | `bun run lint` |
| Add a dependency | `bun add <pkg>` — **an approved ADR and the owner's yes first; then the agent runs it** (§3) |

`bun run build` reads `.env.local` (on Vercel, the Production environment) and writes to the live
search index with `ALGOLIA_WRITE_KEY`; never run it to verify a change. Run `bun run lint`,
`bun run types:check` and `bunx next build` before declaring work complete, and report the lint
failure above while it stands. Run `bun run test` with them.

## 6. Content invariants

**Proposed — for the owner to confirm.** Every ADR respects these, and departing from one
needs an ADR that says so.

1. **Private stays private.** Documentation for a private project never reaches a public
   surface: the site, the search index, `llms.txt` / `llms-full.txt`, `static.json`, per-page
   Markdown, share images, `sitemap.xml`, `robots.txt`, structured data, or a public repository.
   `noindex` is not privacy: a `noindex` page is still published and readable. Until an ADR decides how private
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

[ADR-0003](content/docs/maintainer-guide/adr/ADR-0003-code-comment-policy.mdx). **Comments explain *why*. The code
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

[ADR-0002](content/docs/maintainer-guide/adr/ADR-0002-living-design-documentation.mdx). The map of what lives where is
[`content/docs/maintainer-guide/index.mdx`](content/docs/maintainer-guide/index.mdx); each directory's `index.mdx` holds its own conventions.

- **Everything under `content/` is published** (§6.1, §9).
- **Docs and tests are part of the same change** (§3). An implementation is not complete while a
  design document, this file, `README.md`, `PROJECT_AGENTS.md` or the ADR index contradicts it.
- **Decisions are immutable once approved; living design documents describe the site as it stands
  right now.**
- **Every page is `.mdx`, with frontmatter `title` and `description`.** The build fails without a
  description.
- **Every diagram is Mermaid and Archify together**, a Mermaid fence inside a `<Diagram>`
  (ADR-0022). No HTML prototypes or HTML wireframes.
- **No binary or externally hosted images**, apart from the avatar in a GitHub profile chip
  (ADR-0020).

### Living documents are snapshots, not changelogs

No revision tables. No "previously X, now Y". No strikethrough, no "new in v2". **What is no
longer true is deleted, not annotated.** Anyone opening the file sees the current picture and
nothing else — git and the ADRs hold the history.

**Depth:**

- `.agent-skills/nepal-dev-docs-duties/SKILL.md`: the three kinds of document, the design-tool files
  at the root, the format of a page, which design documents a change requires (*Write before
  building*) and the files to check before finishing (*Always check these*). Read it before adding
  or editing a page under `content/`, and before finishing any implementation.
- `.agent-skills/nepal-dev-diagrams/SKILL.md`: how to run Archify, how to publish a diagram, and
  what the build rejects. Read it before writing or changing a diagram, a flow or a wireframe.

## 9. Security and privacy

[ADR-0005](content/docs/maintainer-guide/adr/ADR-0005-security-as-a-standing-practice.mdx). This site will hold
documentation for **private projects** next to public packages. A flaw here is not a broken
page. It is a private project's architecture, internal API or client name published on the
open web, indexed by a search engine and copied into an LLM's training data — where it cannot
be taken back.

Security is a property of **every change**, not a pre-deploy event. Full documents live in
[`content/docs/maintainer-guide/security/`](content/docs/maintainer-guide/security/index.mdx).

### Never guess at a security decision

Whether a page is private, who may read it, whether a route is public, what goes to the search
provider, what a published example may contain — **the owner decides, and it is recorded**
(§4).

**Depth:** `.agent-skills/nepal-dev-security-check/SKILL.md` holds the per-change check (secrets
and env vars, new pages, route handlers, third parties, input, logging), the full audits at gates,
and the tool-specific rules. Read it before a change touches any of those. **Findings go to the
owner, not into the maintainer documentation**, until they are fixed: those pages are published.

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

## 10. Repository map

```
.
├── AGENTS.md, CLAUDE.md   # this working agreement; CLAUDE.md imports it
├── PROJECT_AGENTS.md      # guide for repositories that include this one as a git submodule (§1)
├── .agent-skills/         # every skill: nepal-dev-* (this project's own), vendored, installed; INDEX.md (§12)
├── .claude/skills/, .agents/skills/   # links into .agent-skills/, nothing else (ADR-0045)
├── README.md, PRODUCT.md, DESIGN.md   # overview; product truth and visual system (not published, §8)
├── CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md   # for people on GitHub; they add no rule (ADR-0046)
├── .github/               # issue forms, PR template, CODEOWNERS; workflows/ (checks only) and dependabot.yml (ADR-0047)
├── LICENSE, LICENSE-CONTENT   # MIT for code; CC BY 4.0 for content/ and diagrams/ (ADR-0046)
├── content/               # PUBLISHED: every page readers see; one folder per entry, at /<slug>
│   └── docs/maintainer-guide/     # this site's own decisions (adr/) and design documents
├── diagrams/              # Archify diagrams, one pair each; the HTML is PUBLISHED
├── src/                   # app/ (routes), components/, lib/; tests beside the code
├── scripts/               # sync-content.ts (publishes the search index), require-full-history.sh
└── vercel.json, next.config.mjs, .env.example, tsconfig*.json, eslint.config.mjs
```

**Depth:** `.agent-skills/nepal-dev-stack-and-map/SKILL.md` holds the full map, file by file.

The system as built is described in [`content/docs/maintainer-guide/architecture/system.mdx`](content/docs/maintainer-guide/architecture/system.mdx).

## 11. Quick checklist

**Check the task against every row. Read each skill a row names, in full, before the work it
covers.** The rows are binding (ADR-0045). The skills are in `.agent-skills/<name>/SKILL.md`.

| Before you… | Read |
|---|---|
| propose, write, revise or approve an ADR or an app flow | `nepal-dev-adr-workflow` |
| change anything under `src/`, or need to know how the site looks or behaves today | `nepal-dev-site-picture` |
| look for where something lives, or touch config, dependencies, routes or the build | `nepal-dev-stack-and-map` |
| add or edit a page under `content/`, or finish any implementation | `nepal-dev-docs-duties` |
| write or change a diagram, a flow or a wireframe, or touch `diagrams/` | `nepal-dev-diagrams` |
| touch a secret, an env var, a route handler, a third party, input, logging, or a page's privacy | `nepal-dev-security-check` |
| work here from a consuming repository | [`PROJECT_AGENTS.md`](PROJECT_AGENTS.md), and the `nepal-dev-project-*` skills it names |

A typo or copy fix that touches none of these needs none of them. After a long conversation is
summarised, read the skill again before relying on it.

- [ ] Read `AGENTS.md`, [`content/docs/maintainer-guide/index.mdx`](content/docs/maintainer-guide/index.mdx) and the relevant ADRs.
- [ ] Read every `nepal-dev-*` skill the table above names for this task, in full.
- [ ] Which vendored or installed skills fit this task? Look them up in `.agent-skills/INDEX.md`,
      load only the one or two it names, and name them — process skills first (§12).
- [ ] Does this need an ADR? If yes — write it, `Status: Proposed`, index it, and stop.
- [ ] Does it change the UI? Then write `content/docs/maintainer-guide/app-flow/<feature>.mdx` with it.
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
- [ ] `AGENTS.md`, `README.md`, `content/docs/maintainer-guide/adr/index.mdx` updated as needed.
- [ ] Tests written or updated — happy path **and** the obvious failures (ADR-0007).
- [ ] `bun run test`, `bun run types:check` and `bunx next build` pass; `bun run lint` is run and its
      known failure reported while it stands (§5).
- [ ] Leave everything uncommitted for the owner's review.

## 12. Skills

[ADR-0006](content/docs/maintainer-guide/adr/ADR-0006-agent-skills-are-advisory.mdx). Contributors here — human and AI —
have a library of installed **skills**: packaged workflows for brainstorming, debugging,
technical writing, API design, UI work and more. **Use them.** Left alone, they go unused, and
the same task gets a rigorous treatment one day and an ad-hoc one the next.

They are recommendations about *method*. This file is *authority*.

### 12.1 Order of precedence

```
1. AGENTS.md and content/docs/maintainer-guide/   binding   — ADRs, design documents, this working agreement,
                                                     and its own nepal-dev-* skills (ADR-0045)
2. Other skills          advisory  — vendored and installed; invoke freely; follow unless (1) says otherwise
3. Default behaviour     last      — only where neither of the above covers the situation
```

**A skill never grants permission this repository withholds:**

| No skill authorises… | Because |
|---|---|
| Writing application code before an approved ADR | §2 · ADR-0001 |
| `git commit`, `git push`, rebase, or switching branches | §3 |
| Adding a dependency, or changing build / lint / test tooling | §2 · §5 |
| A documentation layout other than `content/docs/maintainer-guide/` and `content/docs/maintainer-guide/_templates/`, including a skill's own spec or plan folder | §8 · ADR-0002 |
| Using a skill that is not in `.agent-skills/`, or running a skill's scripts or CLI commands | §12.2 · ADR-0009 |
| Explanatory *what*-comments, banners, or `=====` section headers | §7 · ADR-0003 |
| Deciding a security, privacy or public-vs-private question on the owner's behalf | §4 · §9 · ADR-0004 · ADR-0005 |
| A `NEXT_PUBLIC_` variable, a third-party integration, or a secret's handling | §9 · ADR-0005 |
| Publishing: `bun run build`, a deploy, or any write to the search index | §3 · §5 |
| Asserting Next.js, React or Fumadocs behaviour from recall | §5 — read the installed docs and source |

An agent following a skill faithfully can produce work that looks disciplined, cites a
recognised process, and has quietly bypassed the gate this project exists around. The
violation is invisible in the diff, because the diff looks like good work.

### 12.2 Which skill, when — trusted skills only

[ADR-0009](content/docs/maintainer-guide/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx),
[ADR-0045](content/docs/maintainer-guide/adr/ADR-0045-agents-md-keeps-the-standing-rules-and-in-house-skills-hold-the-rest.mdx). Every skill is in [`.agent-skills/`](.agent-skills/INDEX.md), outside
`content/`, so none is published. `.claude/skills/` links to each, so Claude Code lists them.
There are three kinds:

- **This project's own, `nepal-dev-*`.** Part of this working agreement, and binding. Routed in §11.
- **Vendored**, at pinned commits, from trusted sources: process skills (brainstorming, debugging,
  TDD, verification, code review), ADRs and source-driven work, writing, front end, Next.js
  bundles, Algolia, security and supply chain. Advisory.
- **Installed by the owner and approved:** **impeccable**, **ui-ux-pro-max**, the **taste
  skills**, **hallmark** and **Archify** (always used for diagrams and flows, §8). Advisory.
  impeccable is the primary for UI work.

The rules:

- **Start at [`.agent-skills/INDEX.md`](.agent-skills/INDEX.md).** Find the row for the task and
  load **only** the one or two `SKILL.md` files it names. Never load the whole folder.
- **Read the overrides before following a vendored or installed skill, however it loaded**: from
  the index, from your tool's skill list, or by itself. They are in `INDEX.md` § Overrides, in
  general and per skill, and they state how each skill instruction that conflicts with this file
  is handled.
- **The pinned copy wins.** When an installed plugin offers a skill of the same name, for example
  `superpowers:brainstorming`, follow the copy in `.agent-skills/` and its overrides.
- **Untrusted skills are not used.** A skill outside `.agent-skills/`, including one installed as a
  plugin on someone's machine, needs the owner's approval first. Ask with options (§4) and always
  name the better-trusted alternatives.
- **Ask before downloading anything.** Searching registries and reading listings is fine; cloning,
  downloading or vendoring a skill is not, until the owner says yes.
- **Skills' scripts and CLI commands are proposals.** They run only when the approved ADR covers
  them or the owner says yes. The approved installed skills' local, read-only analysis scripts may
  run; anything that writes, calls the network or launches a browser asks first.
- **Process skills come first** (brainstorming, systematic debugging, TDD, verification). They set
  the approach; implementation skills carry it out.
- **The `nepal-dev-` prefix is this project's alone.** No vendored or installed skill takes it.
- Built-in Claude Code skills not in the folder (for example `claude-api`, `dataviz`) count as
  first-party and may be used, under this file.

**Depth:** [`.agent-skills/INDEX.md`](.agent-skills/INDEX.md) § How skills are used here holds
these rules in full: the trust policy, the approved installed skills, growing the set, and adding
one. Where each skill comes from is in [`.agent-skills/SOURCES.md`](.agent-skills/SOURCES.md).

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
