# puncoz-packages-docs

> One place for the documentation of everything Puncoz Nepal builds: open-source packages and
> libraries across ecosystems, and public and private projects.

**Status:** **Puncoz Docs** (a working name). The catalogue shape and the search-first home page
are built; no package or project is documented yet, so the home page shows its empty states.
· **Owner:** Puncoz Nepal

---

## What this covers

- **Open-source packages and libraries** — npm packages, PHP / Composer packages, and packages
  and libraries for any other ecosystem.
- **Projects** — public ones, and private ones.

Every package and project has the same shape
([ADR-0013](content/docs/documentation/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx)):
- an overview;
- a **Use** track for people using it, with one folder per documented major version (`v3/`,
  plus `next/` for an unreleased one);
- a **Maintain** track for the people who look after it.

The build checks that shape. `/docs/<slug>/use/latest/…` always redirects to the current
release. The home page
([ADR-0014](content/docs/documentation/adr/ADR-0014-home-page-is-a-search-first-release-map.mdx))
is a map of every release with one search field in front of it.

How private project documentation is kept away from the public site is still open, and demos
wait for ADR-0011. Until the private-documentation ADR is approved, **no private project content
goes into `content/docs/`**: everything there is published to the site, the search index and
`llms.txt`, and the build refuses a catalogue entry that is not `public`.

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
   [`content/docs/documentation/security/secrets.mdx`](content/docs/documentation/security/secrets.mdx). `.env.local` is gitignored; never
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
| `bun run lint` | Lint with ESLint — **does not run today**: `typescript-eslint` does not support TypeScript 7 |

---

## Project structure

```
.
├── AGENTS.md            # working agreement — read before contributing (CLAUDE.md imports it)
├── CLAUDE.md            # → @AGENTS.md
├── PRODUCT.md           # who the site is for and what it must do — read by UI design skills
├── DESIGN.md            # the home page's visual system: colours, type, components, motion
├── PROJECT_AGENTS.md    # for project repositories that include this one as a git submodule
├── .claude/agent-skills/  # trusted agent skills, pinned; INDEX.md says which to load when
├── content/docs/        # every published page
│   ├── <project-slug>/  # one folder per package or project: catalogue entry, use/, maintain/
│   └── documentation/   # the "Documentation" project: this site's own docs — index.mdx is the map
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
│   ├── proxy.ts         # version-line redirects and Markdown versions of pages
│   ├── app/             # home, docs pages, llms.txt, OG images, search records
│   ├── components/      # MDX components, search dialog, docs/ (track switch, version banners), home/
│   └── lib/             # content loader, catalogue schema and checks, search client, site settings
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

1. Write an ADR in [`content/docs/documentation/adr/`](content/docs/documentation/adr/index.mdx) from
   [`_templates/adr.mdx`](content/docs/documentation/_templates/adr.mdx) with `Status: Proposed`, alongside the design
   documents the change needs (app flow, PRD, DFD, RBAC…).
2. The owner reviews it, and it is revised in place until it is right.
3. On approval the status becomes `Approved`, with the approver and date recorded.
4. Only then is the change implemented, in full, with tests and every affected document updated
   in the same pass. Nothing is committed by agents; the owner reviews and commits.

An approved ADR's decision is never rewritten; a change of mind is a new ADR that supersedes it.
Design documents work the opposite way: they are **living snapshots**, edited in place.
Writing a package's pages within the approved content conventions needs no ADR.

Anything genuinely undetermined is raised as a question with options and a recommendation,
not settled by assumption ([ADR-0004](content/docs/documentation/adr/ADR-0004-ask-never-guess.mdx)).

Contributors — human or AI — read [`AGENTS.md`](AGENTS.md) first. It is the authoritative
working agreement for this repository.

### Documenting a project from its own repository

Project and package repositories include this repository as a **git submodule** and write
their pages into their own folder, `content/docs/<project-slug>/`. Their agents follow
[`PROJECT_AGENTS.md`](PROJECT_AGENTS.md): edit only that folder, never commit inside the submodule,
public projects only for now
([ADR-0010](content/docs/documentation/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx)).

### Skills

Agent **skills** — packaged workflows for brainstorming, debugging, writing, security review and
more — are vendored from trusted sources in [`.claude/agent-skills/`](.claude/agent-skills/INDEX.md),
pinned to reviewed commits: Next.js, Algolia, Vercel, Anthropic, Trail of Bits and widely used
community libraries. Agents read [`INDEX.md`](.claude/agent-skills/INDEX.md) and load only
the skills a task needs; [`SOURCES.md`](.claude/agent-skills/SOURCES.md) records where each comes from. Skills from anywhere else need the owner's approval
([ADR-0009](content/docs/documentation/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx)). Skills are advice about
*method*, not authority: **`AGENTS.md` and `content/docs/documentation/` outrank every skill**
([ADR-0006](content/docs/documentation/adr/ADR-0006-agent-skills-are-advisory.mdx)).

### Documentation

[`content/docs/documentation/index.mdx`](content/docs/documentation/index.mdx) is the map: what each directory holds, which documents a
change requires, and the conventions for each. Diagrams and flows are made with
[Archify](https://github.com/tt-a1i/archify), and app-flow prototypes with the vendored
effective-html skills in this site's prototype theme. Every page also keeps a Mermaid version,
so it stays readable as Markdown, renders on GitHub and diffs as text. Pages are `.mdx`
(ADR-0012), so they can embed components where needed.

### Security and privacy

This site will document private projects next to public packages, so security is a property of
every change rather than a pre-deploy event. Every ADR carries a mandatory security section; the
threat model, data classification, secrets inventory and audit checklist live in
[`content/docs/documentation/security/`](content/docs/documentation/security/index.mdx).

> **If a secret is ever committed, rotate it immediately.** Removing it from the working tree,
> or from git history, is not enough. Treat any value that was pushed as compromised from that
> moment. The same holds for private content: once published or indexed, treat it as public.

### Decisions

| ADR | Title | Status |
|---|---|---|
| [0001](content/docs/documentation/adr/ADR-0001-adr-driven-development-workflow.mdx) | Every change starts with an approved ADR | Proposed |
| [0002](content/docs/documentation/adr/ADR-0002-living-design-documentation.mdx) | Design documents are living snapshots, published as the Documentation project | Proposed |
| [0003](content/docs/documentation/adr/ADR-0003-code-comment-policy.mdx) | Comments explain why; every branch takes a block | Proposed |
| [0004](content/docs/documentation/adr/ADR-0004-ask-never-guess.mdx) | Resolve ambiguity by asking, never by guessing | Proposed |
| [0005](content/docs/documentation/adr/ADR-0005-security-as-a-standing-practice.mdx) | Security and privacy are a standing practice | Proposed |
| [0006](content/docs/documentation/adr/ADR-0006-agent-skills-are-advisory.mdx) | Agent skills are advisory; this repository's documentation is binding | Proposed |
| [0007](content/docs/documentation/adr/ADR-0007-tests-are-part-of-every-change.mdx) | Tests are part of every change | Proposed |
| [0008](content/docs/documentation/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx) | A UI change ships an app flow, drawn in Mermaid | Proposed |
| [0009](content/docs/documentation/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx) | Trusted agent skills are vendored in `.claude/agent-skills/`, routed by an index | Proposed |
| [0010](content/docs/documentation/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx) | Projects document themselves here through a git submodule, one root folder each | Proposed |
| [0011](content/docs/documentation/adr/ADR-0011-diagrams-and-prototypes-are-embedded-from-sandboxed-html.mdx) | Archify diagrams and HTML prototypes are embedded in pages from sandboxed HTML files | Proposed |
| [0012](content/docs/documentation/adr/ADR-0012-every-page-is-mdx.mdx) | Every page in `content/docs` is MDX | Approved |
| [0013](content/docs/documentation/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx) | Packages and projects share one catalogue shape: two tracks, version lines and demos | Approved |
| [0014](content/docs/documentation/adr/ADR-0014-home-page-is-a-search-first-release-map.mdx) | The home page is a search-first map of every release | Approved |
