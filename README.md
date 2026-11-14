# Nepal Dev Verse

One place for the documentation of everything Nepalese developers all over the world build:
open-source packages and libraries across ecosystems, and projects. Part of
[nepal-dev.com](https://nepal-dev.com).

**[docs.nepal-dev.com](https://docs.nepal-dev.com)** ·
[How it works](content/docs/maintain/index.mdx) ·
[Decisions](content/docs/maintain/adr/index.mdx) ·
[Contributing](CONTRIBUTING.md)

> **Status.** The site is built. Its own documentation, **Nepal Dev Verse Docs**, is the only entry so
> far, so the home page shows its empty states. Private projects are not supported yet: everything in
> this repository is published.

## Contents

- [What it is](#what-it-is)
- [Features](#features)
- [Quick start](#quick-start)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Document your package or project](#document-your-package-or-project)
- [Contributing](#contributing)
- [Maintainers and contributors](#maintainers-and-contributors)
- [Security](#security)
- [Licence](#licence)

## What it is

A documentation site where every package and project gets the same shape, at `/<slug>`:

- an **overview**;
- a **Use** track for the people using it, with one folder per documented version: `dev` for
  unreleased work, and released lines such as `v1.0` or `2024 LTS`;
- a **Maintain** track for the people who look after it: architecture, decisions, how to release.

Each entry is a folder, `content/<slug>/`, written in MDX. The build checks the shape, and
`/<slug>/use/latest/…` always redirects to the current release. This site is one of the entries:
project `docs`, whose Maintain track holds its own design documents and decisions at
[`/docs/maintain`](content/docs/maintain/index.mdx).

The whole site is drawn as one solar system: packages and projects are planets, version lines are
moons, and Use and Maintain are a planet's day and night sides
([ADR-0017](content/docs/maintain/adr/ADR-0017-the-whole-site-is-one-solar-system.mdx)).

## Features

- **Packages for any ecosystem** (npm, Composer, PyPI, Go, Cargo and others) and **projects**,
  including a project made of several repositories.
- **Versioned user docs**: `dev`, the latest release and older lines, with a notice on every page
  that is not the latest.
- **Search** across everything, scoped to a package or a version, with [Algolia](https://www.algolia.com).
- **Readable without the site**: `llms.txt`, `llms-full.txt`, and every page as Markdown at `/<page>.md`.
- **Diagrams twice**: an interactive [Archify](https://github.com/tt-a1i/archify) view on the page,
  and its Mermaid source in the Markdown, so docs render on GitHub and diff as text.
- **Ready for search engines and sharing**: canonical links, `sitemap.xml`, structured data and a
  share image for every page, all from the content.
- **Checked before it ships**: tests, types, build, dependency review and CodeQL on every pull
  request, and weekly dependency updates from Dependabot.
- **Privacy first**: cookieless analytics by default, and Google Analytics only with consent.

### Built with

| | |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, Cache Components), React 19 |
| Docs framework | [Fumadocs](https://fumadocs.dev) |
| Language and styling | TypeScript 7 (strict), Tailwind CSS 4 |
| Search | [Algolia](https://www.algolia.com), synced after each production build |
| Hosting | [Vercel](https://vercel.com): `main` only, straight to production |
| Package manager and tests | [Bun](https://bun.sh) |

Exact versions are in [`package.json`](package.json). How the parts fit together is in the
[system architecture](content/docs/maintain/architecture/system.mdx).

## Quick start

You need [Bun](https://bun.sh), and a Node.js that runs TypeScript files directly for the search
sync script (v24 is known to work; production uses Node 26).

```bash
git clone https://github.com/nepal-dev-com/docs.nepal-dev.com.git
cd docs.nepal-dev.com
bun install
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The site's own docs are at `/docs`.

`.env.local` can stay empty for local work, and search then finds nothing. `SITE_URL` and the three Algolia variables are needed
only to publish, and `NEXT_PUBLIC_GA_MEASUREMENT_ID` belongs in production alone. Each variable is
described in [`.env.example`](.env.example) and in the
[secrets inventory](content/docs/maintain/security/secrets.mdx). `.env.local` is gitignored; never
commit it.

## Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start the development server |
| `bunx next build` | Production build only. **Use this to check a change** |
| `bun run test` | Unit tests with Bun's built-in runner |
| `bun run types:check` | Generate route types and type-check the site and the tests |
| `bun run lint` | Lint with ESLint. Does not run today: `typescript-eslint` does not support TypeScript 7 |
| `bun run start` | Serve the production build |
| `bun run build` | Production build, **then push every page to the live search index**. Vercel runs it; don't |

> **`bun run build` publishes.** It writes to the live Algolia index. To verify a change, run
> `bunx next build`.

Every pull request is checked by GitHub Actions: the tests, the type check, the build, a review of new
dependencies, and CodeQL. It only checks, and holds no secret
([ADR-0047](content/docs/maintain/adr/ADR-0047-github-checks-every-pull-request-and-dependabot-proposes-the-updates.mdx)).

Every commit on `main` deploys straight to production on Vercel, the site and the search index
together, with no preview. Other branches and forks get no deployment. The settings are in
[`vercel.json`](vercel.json) and the
[architecture's deployment section](content/docs/maintain/architecture/system.mdx#deployment)
([ADR-0042](content/docs/maintain/adr/ADR-0042-only-main-deploys-straight-to-production-on-vercel.mdx)).

## Project structure

```
.
├── content/             # every published page: one folder per package or project, at /<slug>
│   ├── <slug>/          # meta.json (catalogue entry), index.mdx, use/ (versions), maintain/
│   └── docs/            # this site as a project, at /docs
│       └── maintain/    # its design documents, and adr/ for its decisions
├── diagrams/            # Archify diagrams: source JSON and the published HTML
├── src/
│   ├── app/             # routes: home, every page, llms.txt, share images, sitemap, search records
│   ├── components/      # header, search, docs and home components
│   ├── lib/             # content loader, catalogue checks, SEO, search client; tests beside the code
│   └── proxy.ts         # version redirects, Markdown versions of pages, the 404
├── scripts/             # the search index sync
├── assets/              # the nepal-dev.com logo as supplied
├── AGENTS.md            # the working agreement: read before contributing (CLAUDE.md imports it)
├── PROJECT_AGENTS.md    # the guide for repositories that document themselves here
├── .agent-skills/       # skills for AI agents: this project's own (nepal-dev-*) and trusted third-party ones
├── .github/             # issue forms, pull request template, CODEOWNERS, CI workflows, Dependabot
├── CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
└── LICENSE, LICENSE-CONTENT
```

The full map, file by file, is in
[`.agent-skills/nepal-dev-stack-and-map/SKILL.md`](.agent-skills/nepal-dev-stack-and-map/SKILL.md).

## Document your package or project

A package or project documents itself from its own repository. It includes this repository as a
**git submodule** and writes into its own two folders, `content/<slug>/` and `diagrams/<slug>/`,
keeping its Use and Maintain docs current in the same change as its code
([ADR-0010](content/docs/maintain/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx)).

1. Agree a slug with the maintainer: open a
   [proposal](https://github.com/nepal-dev-com/docs.nepal-dev.com/issues/new/choose).
2. Add this repository as a submodule of yours.
3. Follow [`PROJECT_AGENTS.md`](PROJECT_AGENTS.md), written for both people and AI agents.

Public projects only, for now. Nothing private goes into `content/`: every page there reaches the
site, the search index and `llms.txt`.

## Contributing

Contributions are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first; the short version:

- **Every feature and functional change starts with an ADR**, and nothing is built until the owner
  approves it ([ADR-0001](content/docs/maintain/adr/ADR-0001-adr-driven-development-workflow.mdx)).
  Open a proposal before writing code. Bug fixes, typo fixes and pages within the approved
  conventions need no ADR.
- **Tests and documentation ship in the same change** as the code.
- **Anything undetermined is asked, not assumed**
  ([ADR-0004](content/docs/maintain/adr/ADR-0004-ask-never-guess.mdx)).
- [`AGENTS.md`](AGENTS.md) is the authoritative working agreement, for people and AI agents alike.
  Its depth is in the `nepal-dev-*` skills in [`.agent-skills/`](.agent-skills/INDEX.md), which an
  agent reads only when a task calls for them
  ([ADR-0045](content/docs/maintain/adr/ADR-0045-agents-md-keeps-the-standing-rules-and-in-house-skills-hold-the-rest.mdx)).

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Maintainers and contributors

The owner is nepal-dev.com, the community this site is part of. It is maintained by
[Puncoz Nepal (@puncoz)](https://github.com/puncoz), who reviews and approves changes for the owner
([ADR-0039](content/docs/maintain/adr/ADR-0039-nepal-dev-com-owns-the-site-and-puncoz-approves-for-it.mdx)).

Everyone who has contributed is on the
[contributors page](https://github.com/nepal-dev-com/docs.nepal-dev.com/graphs/contributors). Thank you.

## Security

Report a vulnerability, or private content that reached a public page, **privately**: see
[`SECURITY.md`](SECURITY.md). Never open a public issue for it.

If a secret is ever committed, rotate it at once. Removing it from the working tree or from git
history is not enough. The threat model, secrets inventory and audit checklist are in
[`content/docs/maintain/security/`](content/docs/maintain/security/index.mdx).

## Licence

- **Code:** [MIT](LICENSE).
- **Documentation**, the pages in `content/` and the diagrams in `diagrams/`:
  [Creative Commons Attribution 4.0 International](LICENSE-CONTENT). Code examples inside a page are MIT.
- **Not covered by either:** the third-party skills in `.agent-skills/`, each under the licence in
  its own folder ([sources](.agent-skills/SOURCES.md)), and the nepal-dev.com name and logo.

Copyright © 2026 nepal-dev.com and contributors
([ADR-0046](content/docs/maintain/adr/ADR-0046-the-code-is-mit-the-docs-are-cc-by-and-the-repository-gets-its-community-files.mdx)).
