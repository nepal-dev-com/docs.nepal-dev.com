# Nepal Dev Verse

> One place for the documentation of everything Nepalese developers all over the world build:
> open-source packages and libraries across ecosystems, and public and private projects. Part of
> [nepal-dev.com](https://nepal-dev.com).

- **Status:** the site is built, and its own documentation, **Nepal Dev Verse Docs**, is the only
  entry so far, so the home page shows its empty states.
- **Repository:** [`nepal-dev-com/docs.nepal-dev.com`](https://github.com/nepal-dev-com/docs.nepal-dev.com)

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
is that system beside the site's search, with a zoom out to the wider Verse (ADR-0029), then a
planet card for every package and project, and private projects beyond an asteroid belt, shown
with invented names. Every page ends with the Himalayan Horizon footer (ADR-0037). On docs pages
([ADR-0018](content/docs/maintain/adr/ADR-0018-docs-pages-get-orbit-stations-a-trajectory-and-the-full-horizon.mdx))
the sidebar is a scale ladder (ADR-0027): top-level pages, grouped sections, and only the open section as a card, one open at a time (ADR-0023); an overview has the
same sidebar as its Use pages (or Maintain pages), with *Overview* first in every track (ADR-0025); and "On this page" is a curved
trajectory with a probe at your reading position and the minutes left.

How private project documentation is kept away from the public site is still open, and demos
wait for their own ADR. Until the private-documentation ADR is approved, **no private project content
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
| Hosting | [Vercel](https://vercel.com), `main` only, straight to production; no previews (ADR-0042) |
| Search | [Algolia](https://www.algolia.com), synced after each production build |
| Analytics | [Vercel Web Analytics](https://vercel.com/docs/analytics) and Speed Insights, cookieless; Google Analytics 4 with Consent Mode v2 and a *Privacy choices* banner (ADR-0041) |
| For LLMs | `llms.txt`, `llms-full.txt`, and every page as Markdown (`/<page>.md`) |
| Search engines and sharing | Canonical links, `robots.txt`, `sitemap.xml`, JSON-LD and a designed share image per page, all from the content |
| Linting | ESLint 9 + `eslint-config-next` |
| Testing | `bun test`, tests beside the code |
| Package manager | [Bun](https://bun.sh) |

---

## Getting started

Requires [Bun](https://bun.sh), and a Node.js that runs TypeScript files directly (the search
sync script runs on Node, and v24 is known to work).

1. **Install.**

   ```bash
   bun install
   ```

2. **Configure.** Copy `.env.example` to `.env.local` and fill in `SITE_URL` and the three Algolia
   variables, described in [`content/docs/maintain/security/secrets.mdx`](content/docs/maintain/security/secrets.mdx).
   `SITE_URL` is the site's public address, `https://docs.nepal-dev.com` (ADR-0036). Without it
   every page is `noindex` and `bun run build` refuses to publish. `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   is optional: leave it empty locally, so no Google Analytics, banner or footer link is rendered;
   it belongs in the host's Production environment. `.env.local` is gitignored; never commit it.

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

### Deploy

Vercel deploys `main` only, straight to production on the custom domain (ADR-0042, ADR-0043).
Every commit on `main`, pushed or merged, runs `bun run build` on Vercel (Node 26), which publishes
the site and the search index together. Other branches get no deployment; a fork's pull request
asks for authorization, which is never given; production never comes from `vercel --prod`.
`vercel.json` holds the rules. To roll back, push a `git revert` to `main`: Vercel's Instant Rollback
restores the pages but not the search index.

The Vercel project, set once by the owner:

- Production branch `main`. *Automatically expose System Environment Variables* on. *Ignored
  Build Step* set to *Automatic*.
- In the Production environment only: `SITE_URL`, the three Algolia variables (`ALGOLIA_WRITE_KEY`
  marked *Sensitive*), `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `VERCEL_DEEP_CLONE=true`. Preview and
  Development hold nothing.
- Deployment Protection *Standard Protection*, Build Logs and Source Protection, and Git Fork
  Protection on; Web Analytics and Speed Insights on (ADR-0041); the custom domain added, matching
  `SITE_URL`.

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
│   ├── proxy.ts         # version-line redirects, Markdown versions of pages, and the 404 for unknown paths
│   ├── app/             # home, every page at /<slug>/…, llms.txt, share images, robots, sitemap, search records, tokens
│   ├── components/      # site header, MDX components, search dialog, docs/ (scale strip, hero, track switch, version banners), home/
│   └── lib/             # content loader, catalogue schema and checks, search client, site settings
├── assets/              # the nepal-dev.com logo as supplied, not served
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
the repository owner has approved it.** The owner is nepal-dev.com, which approves through its
maintainer.

1. Write an ADR in [`content/docs/maintain/adr/`](content/docs/maintain/adr/index.mdx) from
   [`_templates/adr.mdx`](content/docs/maintain/_templates/adr.mdx) with `Status: Proposed`, alongside the design
   documents the change needs (app flow, PRD, DFD, RBAC…).
2. The owner reviews it, and it is revised in place until it is right.
3. On approval the status becomes `Approved`, with the approver and date recorded.
4. Only then is the change implemented, in full, with tests and every affected document updated
   in the same pass. Nothing is committed by agents; the owner reviews and commits.

An approved ADR's decision is never rewritten; a change of mind is a new ADR that supersedes it.
The one exception was a single rewording of the site's earlier names (ADR-0038).
Design documents work the opposite way: they are **living snapshots**, edited in place.
Writing a package's pages within the approved content conventions needs no ADR.

Every decision and its status is listed in the
[ADR index](content/docs/maintain/adr/index.mdx).

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
