# puncoz-packages-docs

> One place for the documentation of everything Puncoz Nepal builds: open-source packages and
> libraries across ecosystems, and public and private projects.

**Status:** the Fumadocs scaffold, with placeholder pages. No package or project is documented
yet. · **Owner:** Puncoz Nepal

---

## What this covers

- **Open-source packages and libraries** — npm packages, PHP / Composer packages, and packages
  and libraries for any other ecosystem.
- **Projects** — public ones, and private ones.

How content is organised per ecosystem, package and project, how versions are handled, and how
private project documentation is kept away from the public site are open decisions. Each one
arrives through its own ADR. Until the private-documentation ADR is approved, **no private
project content goes into `content/docs/`**: everything there is published to the site, the
search index and `llms.txt`.

---

## Tech stack

| | |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16.4.2 (App Router) |
| Docs framework | [Fumadocs](https://fumadocs.dev) — `fumadocs-core` / `fumadocs-ui` 16.17.9, `fumadocs-mdx` 15.4.10 |
| Content | MDX in `content/docs/` |
| UI | React 19.3 |
| Language | TypeScript 7 (strict) |
| Styling | Tailwind CSS 4 |
| Search | [Algolia](https://www.algolia.com), synced after each production build |
| For LLMs | `llms.txt`, `llms-full.txt`, and every page as Markdown (`/docs/<page>.md`) |
| Linting | ESLint 9 + `eslint-config-next` |
| Package manager | [Bun](https://bun.sh) |

---

## Getting started

Requires [Bun](https://bun.sh), and a Node.js that runs TypeScript files directly (the search
sync script runs on Node; the owner's machine has v24).

1. **Install.**

   ```bash
   bun install
   ```

2. **Configure search.** Create `.env.local` with the three Algolia variables listed in
   [`content/docs/documentation/security/secrets.md`](content/docs/documentation/security/secrets.md). `.env.local` is gitignored; never
   commit it.

3. **Run.**

   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The docs are at `/docs`.

### Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the development server |
| `bunx next build` | Production build only — use this to check a change |
| `bun run build` | Production build, **then push every page to the live Algolia index** |
| `bun run start` | Serve the production build |
| `bun run types:check` | Generate route types and type-check |
| `bun run lint` | Lint with ESLint |

---

## Project structure

```
.
├── AGENTS.md            # working agreement — read before contributing (CLAUDE.md imports it)
├── CLAUDE.md            # → @AGENTS.md
├── PRODUCT.md           # who the site is for and what it must do — read by UI design skills
├── PROJECT_AGENTS.md    # for project repositories that include this one as a git submodule
├── .claude/agent-skills/  # trusted agent skills, pinned; INDEX.md says which to load when
├── content/docs/        # every published page
│   └── documentation/   # the "Documentation" project: this site's own docs — index.md is the map
│       ├── adr/         # Architecture Decision Records — immutable once approved
│       ├── app-flow/    # Mermaid flows + screen wireframes, with every UI-changing ADR
│       ├── prd/         # product requirements + user stories
│       ├── architecture/  # high-level design
│       ├── dfd/         # data flow diagrams
│       ├── erd/         # persisted data, once there is any
│       ├── state/       # state machines
│       ├── sequence/    # sequence diagrams
│       ├── api/         # route handler contracts
│       ├── rbac/        # access matrices
│       ├── security/    # threat model, classification, secrets, audit checklist
│       └── _templates/  # a starting point for each document type
├── src/
│   ├── proxy.ts         # Markdown versions of pages
│   ├── app/             # home, docs pages, llms.txt, OG images, search records
│   ├── components/      # MDX components, search dialog
│   └── lib/             # content loader, site settings, shared layout
├── scripts/
│   └── sync-content.ts  # pushes search records to Algolia after a build
├── next.config.mjs
├── eslint.config.mjs
└── tsconfig.json
```

This site documents itself too: **Documentation** (`content/docs/documentation/`, at
`/docs/documentation`) is a Fumadocs root folder with its own sidebar tab, holding the site's
decisions and design documents. Like every other page, it is published.

---

## How we work

**Every feature and functional change starts with an ADR, and no implementation begins until
the repository owner has approved it.**

1. Write an ADR in [`content/docs/documentation/adr/`](content/docs/documentation/adr/index.md) from
   [`_templates/adr.md`](content/docs/documentation/_templates/adr.md) with `Status: Proposed`, alongside the design
   documents the change needs (app flow, PRD, DFD, RBAC…).
2. The owner reviews it, and it is revised in place until it is right.
3. On approval the status becomes `Approved`, with the approver and date recorded.
4. Only then is the change implemented, in full, with tests and every affected document updated
   in the same pass. Nothing is committed by agents; the owner reviews and commits.

An approved ADR's decision is never rewritten; a change of mind is a new ADR that supersedes it.
Design documents work the opposite way: they are **living snapshots**, edited in place.
Writing a package's pages within the approved content conventions needs no ADR.

Anything genuinely undetermined is raised as a question with options and a recommendation,
not settled by assumption ([ADR-0004](content/docs/documentation/adr/ADR-0004-ask-never-guess.md)).

Contributors — human or AI — read [`AGENTS.md`](AGENTS.md) first. It is the authoritative
working agreement for this repository.

### Documenting a project from its own repository

Project and package repositories include this repository as a **git submodule** and write
their pages into their own folder, `content/docs/<project-slug>/`. Their agents follow
[`PROJECT_AGENTS.md`](PROJECT_AGENTS.md): edit only that folder, never commit inside the submodule,
public projects only for now
([ADR-0010](content/docs/documentation/adr/ADR-0010-projects-document-themselves-through-a-submodule.md)).

### Skills

Agent **skills** — packaged workflows for brainstorming, debugging, writing, security review and
more — are vendored from trusted sources in [`.claude/agent-skills/`](.claude/agent-skills/INDEX.md),
pinned to reviewed commits: Next.js, Algolia, Vercel, Anthropic, Trail of Bits and widely used
community libraries. Agents read [`INDEX.md`](.claude/agent-skills/INDEX.md) and load only
the skills a task needs; [`SOURCES.md`](.claude/agent-skills/SOURCES.md) records where each comes from. Skills from anywhere else need the owner's approval
([ADR-0009](content/docs/documentation/adr/ADR-0009-trusted-agent-skills-are-vendored.md)). Skills are advice about
*method*, not authority: **`AGENTS.md` and `content/docs/documentation/` outrank every skill**
([ADR-0006](content/docs/documentation/adr/ADR-0006-agent-skills-are-advisory.md)).

### Documentation

[`content/docs/documentation/index.md`](content/docs/documentation/index.md) is the map: what each directory holds, which documents a
change requires, and the conventions for each. Diagrams — including screen wireframes — are
Mermaid, so they render on GitHub and diff as text; on the site they show as code until a
Mermaid renderer is adopted.

### Security and privacy

This site will document private projects next to public packages, so security is a property of
every change rather than a pre-deploy event. Every ADR carries a mandatory security section; the
threat model, data classification, secrets inventory and audit checklist live in
[`content/docs/documentation/security/`](content/docs/documentation/security/index.md).

> **If a secret is ever committed, rotate it immediately.** Removing it from the working tree,
> or from git history, is not enough. Treat any value that was pushed as compromised from that
> moment. The same holds for private content: once published or indexed, treat it as public.

### Decisions

| ADR | Title | Status |
|---|---|---|
| [0001](content/docs/documentation/adr/ADR-0001-adr-driven-development-workflow.md) | Every change starts with an approved ADR | Proposed |
| [0002](content/docs/documentation/adr/ADR-0002-living-design-documentation.md) | Design documents are living snapshots, published as the Documentation project | Proposed |
| [0003](content/docs/documentation/adr/ADR-0003-code-comment-policy.md) | Comments explain why; every branch takes a block | Proposed |
| [0004](content/docs/documentation/adr/ADR-0004-ask-never-guess.md) | Resolve ambiguity by asking, never by guessing | Proposed |
| [0005](content/docs/documentation/adr/ADR-0005-security-as-a-standing-practice.md) | Security and privacy are a standing practice | Proposed |
| [0006](content/docs/documentation/adr/ADR-0006-agent-skills-are-advisory.md) | Agent skills are advisory; this repository's documentation is binding | Proposed |
| [0007](content/docs/documentation/adr/ADR-0007-tests-are-part-of-every-change.md) | Tests are part of every change | Proposed |
| [0008](content/docs/documentation/adr/ADR-0008-a-ui-change-ships-an-app-flow.md) | A UI change ships an app flow, drawn in Mermaid | Proposed |
| [0009](content/docs/documentation/adr/ADR-0009-trusted-agent-skills-are-vendored.md) | Trusted agent skills are vendored in `.claude/agent-skills/`, routed by an index | Proposed |
| [0010](content/docs/documentation/adr/ADR-0010-projects-document-themselves-through-a-submodule.md) | Projects document themselves here through a git submodule, one root folder each | Proposed |
