# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Package users** — developers installing, evaluating or upgrading one of Puncoz Nepal's
  open-source packages (npm, PHP / Composer, and other ecosystems). They arrive mid-task, from
  a registry page, a README or a search, looking for an install command, an API, an option, a
  default or a supported version.
- **Maintainers** — the people who look after a package or project: they need its
  architecture, local setup, tests, release process and contribution notes. Each package and
  project has a Maintain track for them beside the Use track (owner's decision, 2026-10-31).
- **Project stakeholders** — collaborators, clients or teammates reading the documentation of
  Puncoz Nepal's public and private projects.
- **The owner, as reference** — Puncoz Nepal's own single source of truth across everything
  they maintain.
- **AI tools and agents** — LLMs and coding agents that read the documentation as Markdown,
  through `llms.txt`, `llms-full.txt` and each page's Markdown route, without the site.

## Product Purpose

One documentation site for everything Puncoz Nepal builds and publishes: open-source packages
and libraries for any ecosystem, and public and private projects. Success is a reader finding
an answer they can trust and act on (a command that works, a signature that matches the
installed version) without leaving for the source code.

## Positioning

- **One home, every ecosystem.** Every package and project in one place with the same
  structure, whether it ships to npm, Packagist or elsewhere. A package's README or registry
  page covers only itself.
- **Checked and versioned.** Install commands, signatures, options, defaults and supported
  versions are read from the package's own source and manifest, and every package page states
  the version it documents.
- **Readable by machines.** Every page is also clean Markdown and part of `llms.txt`, so people
  and tools can take the documentation without the site.
- **A portfolio of the work.** Seen together, the documentation also shows what Puncoz Nepal
  builds, as well as how to use it.

## Operating Context

- Readers usually come from a package registry, a GitHub README, a search engine or an AI
  assistant, often in the middle of writing code.
- Search is Algolia, opened from the docs layout.
- Every page is published on several surfaces at once: the site, the search index,
  `llms.txt` / `llms-full.txt`, per-page Markdown and Open Graph images.
- The site's own decisions and design documents are published as the "Documentation" project
  at `/docs/documentation`.

## Capabilities and Constraints

- Built on Fumadocs (Next.js App Router). Pages are Markdown/MDX files in `content/docs/`.
- **Private stays private.** Private project documentation must never reach a public surface.
  How it is stored, served and searched is undecided; until an ADR decides it, no private
  project content is added.
- Every change starts with an ADR approved by the owner; UI changes also ship an app flow
  (`AGENTS.md`).
- Packages carry released and unreleased versions, and npm packages in particular can have
  live demos. How they are laid out (tracks, version lines, demos) is proposed in ADR-0013.
- Signed-out visitors see nothing of private projects: no name, no count, no placeholder
  (owner's decision, 2026-10-31). Sign-in will use WorkOS, in a later ADR.
- Undecided: the site's final name, and the GitHub link in the header (today the scaffold's).

## Brand Commitments

- Owner and author: Puncoz Nepal.
- Working name: **Puncoz Docs**. The final name will include neither the owner's name nor
  "docs"; it is not chosen yet. No logo, voice guide or identity assets exist yet.
- Craft bar: the documentation of **Stripe, Linear and Resend** (owner's choice, 2026-10-31).
- Look: cool, modern and technical, with motion and graphics; search is the first thing a reader
  uses (owner's steer, 2026-10-31). Not wanted: a warm, earthy palette, or a hero that makes the
  reader choose between options before they can search. The design decisions inside that steer
  are delegated to the builder and recorded in ADR-0014.

## Evidence on Hand

- No package or project is documented yet. The home page and the two pages under `/docs` are
  scaffold placeholders.
- No testimonials, usage figures, download counts or case studies are on hand. Don't
  fabricate any; a package's registry figures may be cited only once read from the registry.

## Product Principles

1. **Accuracy is the product.** A page that matches its version beats a page that covers more.
2. **Same shape everywhere.** A reader who has used one package's docs can find their way in
   any other, whatever the ecosystem.
3. **Every page stands on its own.** Each one works as Markdown without the site, for people
   and for tools.
4. **Private never leaks.** Whether something is public is decided by the owner and recorded,
   never assumed.
5. **The collection is the showcase.** The body of documented work is the evidence; no claims
   beyond it.
