# puncoz-packages-docs

> One place for the documentation of everything Puncoz Nepal builds: open-source packages and
> libraries across ecosystems, and public and private projects.

**Status:** the site is **Puncoz Verse**; its own documentation is **Puncoz Verse Docs** (ADR-0028). The catalogue shape, root addresses, one site-wide
look with a light/dark switch, the Verse mark, a still sky on every page, the scale strip, the Verse view and the planet morph (ADR-0029), and the home page's release map are built; no package or project
is documented yet besides this site itself, so the home page shows its empty states.
· **Owner:** [Puncoz Nepal](https://puncoz.com)

---

## What this covers

- **Open-source packages and libraries** — npm packages, PHP / Composer packages, and packages
  and libraries for any other ecosystem.
- **Projects** — public ones, and private ones.

Every package and project is a folder `content/<slug>/`, published at `/<slug>`, with the same
shape ([ADR-0013](content/docs/maintain/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx),
[ADR-0015](content/docs/maintain/adr/ADR-0015-every-entry-lives-at-the-root-in-one-shape-and-one-look.mdx)):
- an overview, opening with a planet header;
- a **Use** track for people using it, with one folder per documented version: `dev/` for the
  unreleased work in progress, and released lines named in their `meta.json` (`v1.0`,
  `2024 LTS`, any string);
- a **Maintain** track for the people who look after it, not versioned.

A project keeps at most `dev` and one released line; older lines are for packages. A project
made of several repositories (a frontend, a backend, an API) is still one folder, with a folder
per repository in each track
([ADR-0024](content/docs/maintain/adr/ADR-0024-a-project-can-span-several-repositories.mdx)).

This site is one of them: project `docs`, whose Maintain track holds its own decisions and
design documents at `/docs/maintain`. The build checks the shape.
`/<slug>/use/latest/…` always redirects to the current release. The whole site is one solar
system ([ADR-0017](content/docs/maintain/adr/ADR-0017-the-whole-site-is-one-solar-system.mdx)):
packages and projects are planets, version lines are moons, Use and Maintain are a planet's day
and night sides. The home page
([ADR-0014](content/docs/maintain/adr/ADR-0014-home-page-is-a-search-first-release-map.mdx),
[ADR-0016](content/docs/maintain/adr/ADR-0016-home-search-is-the-fumadocs-dialog-and-private-projects-render-server-side.mdx))
is that system beside the site's search, then a planet card for every package and project, and
private projects beyond an asteroid belt. On docs pages
([ADR-0018](content/docs/maintain/adr/ADR-0018-docs-pages-get-orbit-stations-a-trajectory-and-the-full-horizon.mdx))
the sidebar is a scale ladder (ADR-0027): top-level pages, grouped sections, and only the open section as a card, one open at a time (ADR-0023); an overview has the
same sidebar as its Use pages (or Maintain pages), with *Overview* first in every track (ADR-0025); and "On this page" is a curved
trajectory with a probe at your reading position and the minutes left.

How private project documentation is kept away from the public site is still open, and demos
wait for ADR-0011. Until the private-documentation ADR is approved, **no private project content
goes into `content/`**: everything there is published to the site, the search index and
`llms.txt`, and the build refuses a catalogue entry that is not `public`.

---

## Tech stack

| | |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16.4.2 (App Router, Cache Components) |
| Docs framework | [Fumadocs](https://fumadocs.dev) — `fumadocs-core` / `fumadocs-ui` 16.17.9, `fumadocs-mdx` 15.4.10 |
| Content | MDX in `content/<slug>/` |
| UI | React 19.3 |
| Language | TypeScript 7 (strict) |
| Styling | Tailwind CSS 4 |
| Search | [Algolia](https://www.algolia.com), synced after each production build |
| For LLMs | `llms.txt`, `llms-full.txt`, and every page as Markdown (`/<page>.md`) |
| Search engines and sharing | Canonical links, `robots.txt`, `sitemap.xml`, JSON-LD and a designed share image per page, all from the content |
| Linting | ESLint 9 + `eslint-config-next` |
| Testing | `bun test`, tests beside the code |
| Package manager | [Bun](https://bun.sh) |

---

## Getting started

Requires [Bun](https://bun.sh), and a Node.js that runs TypeScript files directly (the search
sync script runs on Node; the owner's machine has v24).

1. **Install.**

   ```bash
   bun install
   ```

2. **Configure.** Copy `.env.example` to `.env.local` and fill in `SITE_URL` (the site's public
   address; without it every page is `noindex`) and the three Algolia variables, described in [`content/docs/maintain/security/secrets.mdx`](content/docs/maintain/security/secrets.mdx).
   `.env.local` is gitignored; never commit it.

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
| `bun run test` | Unit tests with Bun's built-in runner, without loading `.env` files |
| `bun run types:check` | Generate route types and type-check the site and the tests |
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
├── content/             # every published page, one folder per package or project, at /<slug>
│   ├── <project-slug>/  # catalogue entry, overview, use/ (dev/ + named lines), maintain/;
│   │                    #   one folder per repository in each track for a multi-repository project
│   └── docs/            # this site as a project, at /docs
│       └── maintain/    # its Maintain track: this site's own docs — index.mdx is the map
│           ├── adr/         # Architecture Decision Records — immutable once approved
│           ├── app-flow/    # Mermaid flows + screen wireframes, with every UI-changing ADR
│           ├── prd/         # product requirements + user stories
│           ├── architecture/  # high-level design
│           ├── dfd/         # data flow diagrams
│           ├── erd/         # persisted data, once there is any
│           ├── state/       # state machines
│           ├── sequence/    # sequence diagrams
│           ├── api/         # route handler contracts
│           ├── rbac/        # access matrices
│           ├── security/    # threat model, classification, secrets, audit checklist
│           └── _templates/  # a starting point for each document type
├── src/
│   ├── proxy.ts         # version-line redirects and Markdown versions of pages
│   ├── app/             # home, every page at /<slug>/…, llms.txt, share images, robots, sitemap, search records, tokens
│   ├── components/      # site header, MDX components, search dialog, docs/ (scale strip, hero, track switch, version banners), home/
│   └── lib/             # content loader, catalogue schema and checks, search client, site settings
├── diagrams/            # Archify diagrams: the candidate JSON (not served) and the HTML, served sandboxed at /diagrams/
├── scripts/
│   └── sync-content.ts  # pushes search records to Algolia after a build
├── .env.example         # every variable the site reads, names only
├── next.config.mjs      # Fumadocs MDX plugin, Cache Components, the sandbox header for /diagrams/, noindex on machine-readable routes
├── eslint.config.mjs
├── tsconfig.json
└── tsconfig.test.json   # the tests' type check, with Bun's types
```

This site documents itself too: the `docs` project's **Maintain** track
(`content/docs/maintain/`, at `/docs/maintain`) holds the site's decisions and design documents.
Like every other page, it is published.

---

## How we work

**Every feature and functional change starts with an ADR, and no implementation begins until
the repository owner has approved it.**

1. Write an ADR in [`content/docs/maintain/adr/`](content/docs/maintain/adr/index.mdx) from
   [`_templates/adr.mdx`](content/docs/maintain/_templates/adr.mdx) with `Status: Proposed`, alongside the design
   documents the change needs (app flow, PRD, DFD, RBAC…).
2. The owner reviews it, and it is revised in place until it is right.
3. On approval the status becomes `Approved`, with the approver and date recorded.
4. Only then is the change implemented, in full, with tests and every affected document updated
   in the same pass. Nothing is committed by agents; the owner reviews and commits.

An approved ADR's decision is never rewritten; a change of mind is a new ADR that supersedes it.
Design documents work the opposite way: they are **living snapshots**, edited in place.
Writing a package's pages within the approved content conventions needs no ADR.

Anything genuinely undetermined is raised as a question with options and a recommendation,
not settled by assumption ([ADR-0004](content/docs/maintain/adr/ADR-0004-ask-never-guess.mdx)).

Contributors — human or AI — read [`AGENTS.md`](AGENTS.md) first. It is the authoritative
working agreement for this repository.

### Documenting a project from its own repository

Project and package repositories include this repository as a **git submodule** and write
their pages into their own folders, `content/<project-slug>/` and `diagrams/<project-slug>/`, keeping
both a Use track for users and a Maintain track for maintainers. Their agents follow
[`PROJECT_AGENTS.md`](PROJECT_AGENTS.md): edit only those folders, never commit inside the submodule,
public projects only for now
([ADR-0010](content/docs/maintain/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx)).
In a project of several repositories each repository edits its own folders, and the primary one
the shared files (ADR-0024).

### Skills

Agent **skills** — packaged workflows for brainstorming, debugging, writing, security review and
more — are vendored from trusted sources in [`.claude/agent-skills/`](.claude/agent-skills/INDEX.md),
pinned to reviewed commits: Next.js, Algolia, Vercel, Anthropic, Trail of Bits and widely used
community libraries. Agents read [`INDEX.md`](.claude/agent-skills/INDEX.md) and load only
the skills a task needs; [`SOURCES.md`](.claude/agent-skills/SOURCES.md) records where each comes from. Skills from anywhere else need the owner's approval
([ADR-0009](content/docs/maintain/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx)). Skills are advice about
*method*, not authority: **`AGENTS.md` and `content/docs/maintain/` outrank every skill**
([ADR-0006](content/docs/maintain/adr/ADR-0006-agent-skills-are-advisory.mdx)).

### Documentation

[`content/docs/maintain/index.mdx`](content/docs/maintain/index.mdx) is the map: what each directory holds, which documents a
change requires, and the conventions for each. Diagrams and flows are made with
[Archify](https://github.com/tt-a1i/archify), app-flow screens included. Each diagram is a
`<Diagram>` around its Mermaid version: the page shows the Archify view, fitted to the diagram,
in the site's colours and moving; Copy Markdown, `/<page>.md` and `llms-full.txt` carry the
Mermaid, so the docs stay readable as Markdown, render on GitHub and diff as text. The build
fails on a bare Mermaid fence (ADR-0022). Pages are `.mdx` (ADR-0012), so they can embed
components where needed.

### Security and privacy

This site will document private projects next to public packages, so security is a property of
every change rather than a pre-deploy event. Every ADR carries a mandatory security section; the
threat model, data classification, secrets inventory and audit checklist live in
[`content/docs/maintain/security/`](content/docs/maintain/security/index.mdx).

> **If a secret is ever committed, rotate it immediately.** Removing it from the working tree,
> or from git history, is not enough. Treat any value that was pushed as compromised from that
> moment. The same holds for private content: once published or indexed, treat it as public.

### Decisions

| ADR | Title | Status |
|---|---|---|
| [0001](content/docs/maintain/adr/ADR-0001-adr-driven-development-workflow.mdx) | Every change starts with an approved ADR | Approved |
| [0002](content/docs/maintain/adr/ADR-0002-living-design-documentation.mdx) | Design documents are living snapshots, published as this site's Maintain track | Approved |
| [0003](content/docs/maintain/adr/ADR-0003-code-comment-policy.mdx) | Comments explain why; every branch takes a block | Approved |
| [0004](content/docs/maintain/adr/ADR-0004-ask-never-guess.mdx) | Resolve ambiguity by asking, never by guessing | Approved |
| [0005](content/docs/maintain/adr/ADR-0005-security-as-a-standing-practice.mdx) | Security and privacy are a standing practice | Approved |
| [0006](content/docs/maintain/adr/ADR-0006-agent-skills-are-advisory.mdx) | Agent skills are advisory; this repository's documentation is binding | Approved |
| [0007](content/docs/maintain/adr/ADR-0007-tests-are-part-of-every-change.mdx) | Tests are part of every change | Approved |
| [0008](content/docs/maintain/adr/ADR-0008-a-ui-change-ships-an-app-flow.mdx) | A UI change ships an app flow, drawn in Mermaid | Approved |
| [0009](content/docs/maintain/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx) | Trusted agent skills are vendored in `.claude/agent-skills/`, routed by an index | Approved |
| [0010](content/docs/maintain/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx) | Projects document themselves here through a git submodule, one folder each | Approved |
| [0011](content/docs/maintain/adr/ADR-0011-archify-diagrams-are-embedded-from-sandboxed-html.mdx) | Archify diagrams are embedded in pages from sandboxed HTML files | Approved |
| [0012](content/docs/maintain/adr/ADR-0012-every-page-is-mdx.mdx) | Every page in `content/docs` is MDX | Approved |
| [0013](content/docs/maintain/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx) | Packages and projects share one catalogue shape: two tracks, version lines and demos | Approved |
| [0014](content/docs/maintain/adr/ADR-0014-home-page-is-a-search-first-release-map.mdx) | The home page is a search-first map of every release | Approved |
| [0015](content/docs/maintain/adr/ADR-0015-every-entry-lives-at-the-root-in-one-shape-and-one-look.mdx) | Every package and project lives at the root, in one shape and one look | Approved |
| [0016](content/docs/maintain/adr/ADR-0016-home-search-is-the-fumadocs-dialog-and-private-projects-render-server-side.mdx) | Home search is the Fumadocs dialog, and private projects render server-side | Approved |
| [0017](content/docs/maintain/adr/ADR-0017-the-whole-site-is-one-solar-system.mdx) | The whole site is one solar system | Approved |
| [0018](content/docs/maintain/adr/ADR-0018-docs-pages-get-orbit-stations-a-trajectory-and-the-full-horizon.mdx) | Docs pages get orbit stations, a trajectory and the full horizon | Approved |
| [0019](content/docs/maintain/adr/ADR-0019-adr-folders-show-as-a-constellation-in-the-sidebar.mdx) | ADR folders show as a constellation in the sidebar | Approved |
| [0020](content/docs/maintain/adr/ADR-0020-people-in-adrs-are-github-usernames-shown-as-profile-chips.mdx) | People in ADRs are GitHub usernames, shown as profile chips | Approved |
| [0021](content/docs/maintain/adr/ADR-0021-tests-run-with-bun-test.mdx) | Tests run with Bun's built-in test runner | Approved |
| [0022](content/docs/maintain/adr/ADR-0022-diagrams-show-archify-on-the-page-and-mermaid-in-markdown.mdx) | Diagrams show their Archify view on the page and their Mermaid in Markdown | Approved |
| [0023](content/docs/maintain/adr/ADR-0023-sidebar-stations-open-one-at-a-time.mdx) | Sidebar stations open one at a time | Approved |
| [0024](content/docs/maintain/adr/ADR-0024-a-project-can-span-several-repositories.mdx) | A project can span several repositories | Approved |
| [0025](content/docs/maintain/adr/ADR-0025-the-overview-has-the-same-sidebar-as-its-tracks.mdx) | The overview has the same sidebar as its tracks | Approved |
| [0026](content/docs/maintain/adr/ADR-0026-the-moon-picker-on-an-overview-opens-a-lines-first-page.mdx) | The moon picker on an overview opens a line's first page | Approved |
| [0027](content/docs/maintain/adr/ADR-0027-the-sidebar-is-a-scale-ladder-with-one-lifted-orbit.mdx) | The sidebar is a scale ladder with one lifted orbit | Approved |
| [0028](content/docs/maintain/adr/ADR-0028-the-site-is-named-puncoz-verse.mdx) | The site is named Puncoz Verse | Approved |
