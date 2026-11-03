# Documenting a project here — guide for consuming repositories

This repository, **puncoz-packages-docs**, is **Nepal Dev Verse**, the documentation platform for
packages and projects by Nepalese developers all over the world, part of
[nepal-dev.com](https://nepal-dev.com). Project and package repositories include it as a **git submodule** and write their
own documentation into it. This guide is for the people and AI agents working in those
repositories: what to maintain, where each thing goes, and how versions and diagrams work.

> **Status.** The convention is set out in
> [ADR-0010](content/docs/maintain/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx),
> and the shape of your folder in
> [ADR-0013](content/docs/maintain/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx)
> and
> [ADR-0015](content/docs/maintain/adr/ADR-0015-every-entry-lives-at-the-root-in-one-shape-and-one-look.mdx),
> all **Approved**.

Everything outside your project's folders is governed by [`AGENTS.md`](AGENTS.md), this
repository's working agreement. Where this guide is silent, `AGENTS.md` applies.

**In short:**

- You maintain **two sets of docs**: **Use**, for people using it, and **Maintain**, for people
  who look after it (§4).
- You edit **only two folders**: `content/<project-slug>/` and `diagrams/<project-slug>/` (§3).
- **Use is versioned, Maintain is not** (§5).
- **Every diagram is Mermaid and Archify together**, on every page, in both tracks (§8).
- **Every page has a `description`**, and the build fails without one. Search and share cards follow
  from it and from where the page sits, automatically (§4.4, §7).
- **Everything is published.** Nothing private goes here (§2).
- **You edit; a human commits** (§10).

## 1. Add this to your project's `AGENTS.md` or `CLAUDE.md`

Replace `<submodule-path>` with where the submodule is mounted (for example `docs`) and
`<project-slug>` with your project's folder name (§3).

```markdown
## Documentation (git submodule)

`<submodule-path>/` is the puncoz-packages-docs repository, where this project's documentation
is published. Before changing anything in it, read `<submodule-path>/PROJECT_AGENTS.md` and follow
it. In short: edit only `<submodule-path>/content/<project-slug>/` and
`<submodule-path>/diagrams/<project-slug>/`; keep both the Use docs (for users, versioned) and the
Maintain docs (for maintainers, not versioned) current in the same change as the code; give every
diagram both a Mermaid fence and its Archify view; give every page a frontmatter `description`,
written for someone reading a search result; never commit, push or switch branches inside the
submodule; never put private content there; ask the owner when anything is unclear.
```

**A project with several repositories** (§6) adds two lines, with `<repository-id>` this
repository's `id` in the project's catalogue:

```markdown
This repository is `<repository-id>` in `<project-slug>`'s catalogue (primary: yes or no). Edit
only `content/<project-slug>/use/<repository-id>/` (inside each line, when the project has lines),
`content/<project-slug>/maintain/<repository-id>/` and `diagrams/<project-slug>/<repository-id>-*`;
only the primary repository edits the project's shared files.
```

## 2. Public only, for now

Every file under `content/` and every diagram's HTML is **published**: on the website, in the
search index, in `llms.txt` / `llms-full.txt`, as per-page Markdown, in `sitemap.xml`, in the
page's structured data and on its share image. Published is permanent. **That includes the Maintain
track**: maintainer docs are public too.

**`noindex` is not privacy.** A `dev` page is left out of search results (§4.4), and it can still be
read by anyone with the link, in `llms-full.txt` and in the site's search. Nothing here keeps a page
private, so there is no setting to look for.

- **A private project adds nothing here.** Keep its documentation in its own repository until
  an ADR here decides how private documentation is kept and served (`AGENTS.md` §6.1).
- **A public project's pages carry nothing internal**: no secrets, tokens, internal hostnames,
  client names, personal data, or private code copied from your repository.
- **Unsure whether something is public? Ask the owner.** Never decide it yourself.

## 3. Where everything goes

Each project or package has one folder, **`content/<project-slug>/`**, published at
**`/<project-slug>`**, and its diagrams in **`diagrams/<project-slug>/`**. Those two are yours.

A package, which always has version lines:

```
content/<project-slug>/
├── meta.json              # title, description and the `catalog` entry (§3.1)
├── index.mdx              # the overview, at /<project-slug>
├── use/                   # USER DOCS (§4.1), one folder per version (§5)
│   ├── meta.json          # {"title": "Use"}; optional "pages" orders the older lines
│   ├── dev/               # unreleased work on the default branch, at /<project-slug>/use/dev
│   │   ├── meta.json      # {"title": "dev", "version": "4.0.0-dev", "channel": "dev"}
│   │   ├── index.mdx
│   │   └── ...
│   ├── v3/                # a released line; the folder name is yours
│   │   ├── meta.json      # {"name": "v3.2", "version": "3.2.0", "channel": "latest"} → /<project-slug>/use/v3.2
│   │   └── ...
│   └── lts-2/             # an older line
│       ├── meta.json      # {"name": "2.x LTS", "version": "2.9.1", "channel": "legacy"} → /<project-slug>/use/2.x-lts
│       └── ...
└── maintain/              # MAINTAINER DOCS (§4.2), not versioned: the default branch
    ├── meta.json          # {"title": "Maintain"}; optional "pages" orders the sidebar
    ├── adr/               # your ADRs, if you keep them: index.mdx + ADR-NNNN-*.mdx
    └── ...                # architecture, local setup, tests, releasing, contributing

diagrams/<project-slug>/
├── request-flow.json      # the Archify source (not served)
└── request-flow.html      # the checked Archify view, published at /diagrams/<project-slug>/request-flow.html
```

A project without releases has the same shape, with its pages directly in `use/`. With releases
it uses `dev/` and one released line (§5). A project of several repositories adds a folder per
repository (§6).

**The address follows the folder:**

| File | Address |
|---|---|
| `content/<slug>/index.mdx` | `/<slug>` |
| `content/<slug>/use/<line>/<page>.mdx` | `/<slug>/use/<line's URL segment>/<page>` |
| `content/<slug>/use/<page>.mdx` (a project without lines) | `/<slug>/use/<page>` |
| `content/<slug>/maintain/<page>.mdx` | `/<slug>/maintain/<page>` |
| `content/<slug>/maintain/adr/index.mdx` | `/<slug>/maintain/adr` |
| `diagrams/<slug>/<diagram>.html` | `/diagrams/<slug>/<diagram>.html` |

**Rules for the folders:**

- **The slug is agreed with the owner** when the folder is first created. Don't invent one.
  `docs` is taken: it is this site.
- **Edit only your folders.** A change anywhere else, such as another project's pages, `src/`,
  configuration, dependencies, `AGENTS.md` or this site's own pages in `content/docs/`, is a change
  to the site itself. It goes through this repository's ADR process (`AGENTS.md` §2): propose it,
  don't make it.
- **Writing and updating pages inside your folders needs no ADR**, as long as they follow this
  guide.

### 3.1 The catalogue entry

The root `meta.json` carries the entry that the home page, search and `llms.txt` are built from:

```json
{
  "title": "lodestar",
  "description": "Keyboard-first command palette for React.",
  "catalog": {
    "kind": "package",
    "ecosystem": "npm",
    "visibility": "public",
    "repository": "https://github.com/example/lodestar",
    "registry": "https://www.npmjs.com/package/lodestar",
    "featured": false
  }
}
```

- `kind` is `package` or `project`.
- `ecosystem` is `npm`, `composer`, `pypi`, `go`, `cargo` or `other`: required for a package,
  optional for a project.
- `visibility` must be `public`.
- `repository` and `registry` are optional `https` URLs. A project of several repositories uses
  `repositories` instead (§6).
- `featured` (default `false`) is the owner's call: ask.

### 3.2 The overview and the sidebar

- **`index.mdx` is the overview, and every track's sidebar starts with it.** The sidebar lists it
  as *Overview*, first in each Use line (or in `use/` when it has no lines) and in `maintain/`,
  and the overview itself shows the sidebar of your Use track, or of Maintain when there is no Use
  ([ADR-0025](content/docs/maintain/adr/ADR-0025-the-overview-has-the-same-sidebar-as-its-tracks.mdx)).
  Don't add a page of your own to lead back to it.
- **Order pages with `pages`** in a folder's `meta.json`, listing page and folder names.
- **Group a long track with separators.** A `"---Label---"` entry in `pages` draws a small label
  over the folders after it
  ([ADR-0027](content/docs/maintain/adr/ADR-0027-the-sidebar-is-a-scale-ladder-with-one-lifted-orbit.mdx)).
  Use it when a track has more than five or so folders, and put top-level pages before the first
  one.

## 4. Two sets of docs to maintain

**Every package and project maintains both.** They have different readers, so a page belongs in
exactly one. The test: does the reader need your repository open? If not, it is Use. If so, it is
Maintain.

The build lets a track be missing, and the switch between them then hides it. That is only for a
track with nothing to say yet, such as a brand-new project. It is not a way to skip one.

### 4.1 Use: docs for users

**Who:** people installing, calling or operating what you built, who have not read its source.
**Where:** `content/<project-slug>/use/`, inside the version line it describes (§5).

| Page | What it holds | Suggested place |
|---|---|---|
| Getting started | Install command, smallest working example, requirements | `getting-started.mdx` |
| Guides | How to do each real task, one task to a page | `guides/` |
| API or reference | Every public function, option, command and default | `api/` |
| Configuration | Every setting, its default and its effect | `configuration.mdx` |
| Upgrading and release notes | What changed in this version and how to move to it | `release-notes.mdx` |

The file names are suggestions. Use the ones that suit the package, and leave out what does not
apply. No `demo.mdx` yet: demos wait for their own ADR.

Everything here is checked against that version's code (§7).

### 4.2 Maintain: docs for maintainers

**Who:** people changing the code, reviewing it, releasing it or taking it over.
**Where:** `content/<project-slug>/maintain/`. It has no version lines and describes the default
branch as it stands.

| Page or folder | What it holds |
|---|---|
| `architecture/` | How it is built: modules, boundaries, why it is shaped this way |
| `local-setup.mdx` | Getting a working checkout: prerequisites, commands, sample data with invented values |
| `testing.mdx` | How to run the tests and what they must cover |
| `releasing.mdx` | How a release is cut, including the docs' part (§5.2) |
| `contributing.mdx` | How changes are proposed, reviewed and merged |
| `adr/` | Your decisions, if you keep them (below) |
| `app-flow/`, `prd/`, `api/`, `dfd/`, `sequence/`, `state/`, `erd/`, `rbac/`, `security/` | Design documents, when the project needs them |

The names are suggestions, like those in §4.1, except `adr/`, which the sidebar looks for.

**Start from the templates** in
[`content/docs/maintain/_templates/`](content/docs/maintain/_templates/index.mdx): copy one into
your own `maintain/` folder and fill it in. Each Mermaid fence in a template is bare, and only
that folder is allowed to do so: once copied, each one needs its `<Diagram>` and Archify view (§8).
Each template's `description` is a placeholder, and the build can't tell: replace it with your own.

**Two kinds of Maintain page:**

- **Living documents** describe things as they stand now, and are edited in place. No revision
  tables, no "previously X, now Y". What is no longer true is deleted; git and the ADRs hold the
  history.
- **ADRs** record a decision and are not rewritten once approved. A new ADR supersedes an old one,
  and both link to each other.

**ADRs go in a folder named `adr`.** The sidebar shows such a folder as a constellation, one moon
per ADR phased by its status
([ADR-0019](content/docs/maintain/adr/ADR-0019-adr-folders-show-as-a-constellation-in-the-sidebar.mdx)).
Title each `ADR-NNNN — …` and keep the template's `- **Status:** Approved` line (Approved,
Proposed, Superseded or Rejected) near the top. The folder's `index.mdx` is the full list.

**People in an ADR are GitHub usernames**, written as a profile link:
`- **Deciders:** [@puncoz](https://github.com/puncoz)` and the same for `Approved by`. The
owner's username is `puncoz`. When a decider's or approver's GitHub username is not already known
(in your project's existing ADRs or from the owner), ask for it. Never write a display name in its
place, and never guess a username.

### 4.3 When to update which

Update the docs **in the same change as the code**:

| You changed… | Update |
|---|---|
| Public behaviour, an API, an option, a default or an install step | Use, in `use/dev/` (or `use/` on a project without lines) |
| Internals, the build, the tests, the release process | Maintain |
| A decision worth keeping | A new ADR in `maintain/adr/` |
| A flow that a diagram shows | The diagram's Mermaid **and** its Archify view (§8) |
| Something released | §5.2 |

### 4.4 What search engines and share cards get

Everything here is automatic. It comes from where the page sits and from its frontmatter, so you
write no metadata and no tags ([ADR-0035](content/docs/maintain/adr/ADR-0035-every-page-is-ready-for-search-and-sharing.mdx)).
The one thing you write is the page's `description` (§7).

| Your page | In search | Canonical link | In `sitemap.xml` |
|---|---|---|---|
| The overview, or a page in an unversioned `use/` | Yes | Itself | Yes |
| A page in the `latest` line | Yes | Itself | Yes |
| A page in `maintain/` | Yes | Itself | Yes |
| A page in a `legacy` line, with the same path in `latest` | Yes | **That page in `latest`** | No |
| A page in a `legacy` line, with no such page in `latest` | Yes | Itself | Yes |
| A page in `use/dev/` | No, `noindex, follow` | None | No |
| A page in a folder named `_templates` | No, `noindex, follow` | None | No |

So **a package with only `dev` is out of search until its first release**, apart from its overview and
Maintain. Keep a page's path the same from one line to the next: that is how an older page finds its
counterpart in `latest`.

From the same facts, each page also gets:

- **A title** with the page, its entry and the site: `Install — lodestar — Nepal Dev Verse` on `latest`,
  `Install — lodestar 2.x LTS — Nepal Dev Verse` on an older line, `lodestar — Nepal Dev Verse` on the overview.
- **A share image at 1200 by 630**, drawn at build: the brand mark, your entry's planet, its name, the
  track, the line with its moon, then the page's title and description. Don't add your own.
- **Structured data**: `TechArticle` and breadcrumbs on a page, and on an overview `SoftwareSourceCode`
  with your repository and latest version from the catalogue. A page that is `noindex`, or whose
  canonical link is another page, carries none.

Search only sees your pages once the site has an address (`SITE_URL`, set by the owner). A local build
without it says `noindex` on every page, which is expected. Canonical links and sitemaps are hints:
nothing here promises a ranking.

## 5. Versions

**Only the Use track is versioned.** Maintain and the overview have one copy.

### 5.1 Lines

A version line is a folder in `use/`, with `version` and `channel` in its `meta.json`.

| Channel | Means | Folder | Address | Who has it |
|---|---|---|---|---|
| `dev` | Unreleased work on the default branch | Always `use/dev/` | Always `/<project-slug>/use/dev` | Packages, and projects that ship releases |
| `latest` | The current release | Your choice | From its `name` | Exactly one, once anything is released |
| `legacy` | An older release still documented | Your choice | From its `name` | Packages only |

- **`version` is the exact version the line documents**, read from your manifest: `3.2.0`,
  `4.0.0-dev`. The site prints it on every page of the line and in its Markdown, so don't repeat it
  by hand on each page.
- **`name` is what readers see**: any string the package uses, such as `v1.0`, `4.x` or `2024 LTS`.
  Without it the folder name is used. `dev` has no `name` of its own.
- **The URL segment comes from the name:** lowercase, spaces as `-`, other characters outside
  `a-z 0-9 . _ -` dropped. `2.x LTS` gives `2.x-lts`.
- **A package with only `dev` is unreleased.**
- **A package has lines from the start**: its `use/` holds only line folders, no pages directly.
- **Older lines** are listed in the version menu in `use/meta.json` `pages` order, otherwise newest
  version first.
- **The site adds the notices itself**: pages on `dev` and on older lines say so and link to the
  latest. Don't write your own banner.
- **A released line keeps describing its version.** Correct mistakes in it; new behaviour goes in
  `dev/`.
- **Search follows the channel** (§4.4): `latest` is indexed, an older page points search engines at
  the same path in `latest`, and `dev` stays out. Changing a `channel` is all it takes.

**A project is unversioned by default**: its `use/` holds pages directly. A project that ships
releases has `use/dev/` and at most one released line (`channel: "latest"`), never `legacy` lines:
older versions are for packages
([ADR-0024](content/docs/maintain/adr/ADR-0024-a-project-can-span-several-repositories.mdx)).

### 5.2 Releasing

**A package:**

1. Copy `use/dev/` to a new folder, for example `use/v4/`.
2. In the new folder's `meta.json`, set its `name`, its `version` and `channel: "latest"`.
3. In the previous `latest` line's `meta.json`, set `channel: "legacy"`.
4. In `use/dev/meta.json`, set the next `version`, and keep working in `dev/`.

**A project** copies `dev/` to the new released line and removes the previous one.

### 5.3 Links that don't go stale

- **Link to `/<project-slug>/use/latest/…`** from your README and registry page. It redirects to
  the line marked `latest`, or to `dev` before the first release.
- **A link to a line that no longer exists** redirects to the same path in `latest`.
- **`/<project-slug>/use`** opens the first page of the latest line.

## 6. A project with several repositories

A project made of several repositories, such as a frontend, a backend and an API, is still one
folder, one overview and one planet
([ADR-0024](content/docs/maintain/adr/ADR-0024-a-project-can-span-several-repositories.mdx)).
Each repository includes this submodule and writes its own folders. Both sets of docs (§4) apply to
each repository.

```json
"catalog": {
  "kind": "project",
  "visibility": "public",
  "repositories": [
    { "id": "frontend", "name": "Frontend", "url": "https://github.com/example/acme-web", "primary": true },
    { "id": "backend", "name": "Backend", "url": "https://github.com/example/acme-server" },
    { "id": "api", "name": "API" }
  ]
}
```

- **`repositories`** replaces `repository`: two or more, on a project only. `id` is the
  repository's folder name: lowercase letters, digits and hyphens, unique, not `dev`, `latest`,
  `adr` or a line's URL segment. `name` is what readers see (the `id` without it). `url` is an
  optional `https` URL. Exactly one repository has `primary: true`.
- **A private repository** is listed without `url`, or not at all: listing it publishes its name
  and location. Ask the owner.
- **Folders.** Each repository's pages go in `use/<id>/` and `maintain/<id>/`; either may be
  missing. With lines, the folders sit inside each line: `use/dev/<id>/`, `use/<line>/<id>/`.
  Pages about the whole project (an architecture across the repositories) sit beside them. A
  repository folder shows as a sidebar station titled with the repository's `name`, unless its
  `meta.json` sets a `title`.

  ```
  content/acme/
  ├── meta.json        # catalog.repositories: frontend (primary), backend, api
  ├── index.mdx
  ├── use/
  │   ├── frontend/
  │   ├── backend/
  │   └── api/
  └── maintain/
      ├── architecture.mdx
      ├── frontend/
      ├── backend/
      └── api/
  ```

- **Who edits what.** The **primary** repository edits the root `meta.json`, `index.mdx`,
  `use/meta.json`, `maintain/meta.json`, each line's `meta.json`, every page outside a
  repository folder, and does releases. **Every other repository** edits only its own folders
  and its diagrams, named `diagrams/<project-slug>/<id>-<slug>.json` and `.html`. Need a change
  outside your folders? Ask the primary repository's maintainers or the owner. The build cannot
  check this rule; keep to it.
- **The list of repositories, their ids and which one is primary** are agreed with the owner,
  like the slug.

## 7. What every page must do

These are this site's content invariants (`AGENTS.md` §6):

1. **Checked against the code.** Install commands, signatures, options, defaults and supported
   versions are read from your repository's source and manifest, never written from memory.
2. **States the version it documents.** A line's `version` does this for every page in it (§5.1).
3. **Examples run** against that version, with invented values.
4. **Readable as Markdown.** Plain Markdown and the MDX components registered in
   `src/components/mdx.tsx` only: Fumadocs' defaults and `<Diagram>`. Another component is a
   site change (§3). Every diagram's Markdown is its Mermaid.

Format:

- **Every page is `.mdx`.** Write Markdown, plus a registered component where it helps. In
  prose, MDX reads `<` and `{` as JSX: put a `<slug>`-style placeholder in backticks or escape
  it (`\<slug>`), close void tags (`<br />`), and use `{/* … */}` for comments.
- **Frontmatter `title` and `description` are both required**, on every page in every track and line.
  Fumadocs renders the title, so don't repeat it as an `#` heading. The description shows under the
  title on the page, in search results and on the share image; the build fails without one (§9).
- **Write the description for someone reading a search result:** one or two plain sentences, about
  160 characters at most, saying what the page is for, read from the page itself. Name the thing, not
  the document: "Add lodestar to a React project and open the command palette with one hook.", not
  "This page describes installation." No space words, keyword lists or version numbers, which the
  site adds itself.
- **Links between pages are relative paths that start with `./` or `../`**
  (`./getting-started.mdx`). Only those resolve to page URLs.
- **No binary or externally hosted images.** Draw it as a diagram (§8). The one exception is
  automatic: a GitHub profile link, `[@user](https://github.com/user)`, shows as a chip with the
  avatar loaded from GitHub (ADR-0020).

## 8. Diagrams: Mermaid and Archify, always together

**Every page that has a diagram embeds both**, in Use and in Maintain, with no exceptions
([ADR-0022](content/docs/maintain/adr/ADR-0022-diagrams-show-archify-on-the-page-and-mermaid-in-markdown.mdx)).
Architecture, flows, sequences, states, data flows, ERDs, class diagrams, trees, timelines and
screen wireframes are all diagrams.

| Version | Where it shows | Lives in |
|---|---|---|
| **Archify** | On the page: the interactive view readers see | `diagrams/<project-slug>/<slug>.html`, with its source `<slug>.json` |
| **Mermaid** | Copy Markdown, `/<page>.md`, `llms-full.txt`, GitHub | A fence inside the page's `<Diagram>` |

Both show the same thing, and **both change in the same change**. A Mermaid fence alone, or an
Archify file alone, fails the build.

### 8.1 Steps

Archify is the skill in this repository at `.claude/skills/archify`. Its schemas are in
`.claude/skills/archify/schemas/`. Run everything from the submodule root.

1. **Write the Mermaid** for the diagram.
2. **Write the Archify candidate**, showing the same nodes and links, in a working folder under
   `.archify/` (gitignored). Use the type that fits: `architecture`, `workflow`, `sequence`,
   `dataflow`, `lifecycle`, `erd`, `class`, `tree`, `timeline` or `waterfall`. Use Archify's classic
   style: no `visual_preset`.
3. **Deliver and check it**, without the browser gate:

   ```sh
   node .claude/skills/archify/bin/archify.mjs deliver <type> <candidate.json> <output.html> --quality showcase --json
   node .claude/skills/archify/bin/archify.mjs check <output.html> --require-provenance
   ```

   Don't run `finalize`, `browser-check` or `visual-check`, whatever the skill's own steps say: they
   launch Chrome. Run them only if the owner asks. Never upgrade Archify; tell the owner when it
   reports an update.
4. **Publish the pair**: copy the candidate and the checked HTML, byte for byte, to
   `diagrams/<project-slug>/<slug>.json` and `<slug>.html`. The `<slug>` is lowercase letters,
   digits and hyphens. Never copy a `*.delivery*.json` receipt or any other working file: they hold
   local paths.
5. **Then embed it in the page**, with the Mermaid fence and nothing else inside the `<Diagram>`:

   ````mdx
   <Diagram src="/diagrams/<project-slug>/request-flow.html" title="Request flow">

   ```mermaid
   flowchart LR
     Parser --> Router --> Handler
   ```

   </Diagram>
   ````

Keep that order. If a running `next dev` sees a page before its diagram's files exist, it fails on
every page until it next reloads the content. Saving a page usually clears it; if not, restart it.

The site does the rest: the frame fits the diagram, follows the site's theme, starts Live, and
shows only the diagram and its controls.

### 8.2 Screens

**Screens are `block-beta` wireframes**, phone width first, with invented sample values, each with
its Archify view: an `architecture` diagram drawn from the Mermaid, its boxes inside a labelled
phone-screen region, one per screen. Name them `<feature>-screen-<n>`. No HTML prototypes or HTML
wireframes.

### 8.3 What the build refuses

The build fails, naming the page or file, on:

- a Mermaid fence outside a `<Diagram>`;
- a `<Diagram>` without a plain `src` and `title`, or without exactly one Mermaid fence;
- a `src` outside `/diagrams/<project-slug>/<slug>.html`, or without its file;
- an HTML without its JSON, a JSON without its HTML, or an HTML no page uses;
- anything else in `diagrams/`, anything in `public/diagrams/`, and a receipt.

A diagram of anything private never goes in `diagrams/`: its HTML is published.

## 9. What the build checks in your folders

The build fails, naming the file, on:

- a page directly in `content/`, or a folder without a `catalog`;
- an invalid or non-`public` `catalog`, or a wrong `repositories` list (§6);
- a slug that is not lowercase letters, digits and hyphens, or is reserved: `api`, `auth`,
  `callback`, `sign-in`, `sign-out`, `og`, `apple-icon`, `search`, `static`, `assets`, `public`, `diagrams`,
  `_next`;
- a line without `version` or `channel`;
- `channel: "dev"` anywhere but `use/dev/`, or `use/dev/` with another channel;
- a name whose segment is empty, `dev`, `latest` or ends in `.md`, or two lines with the same
  segment;
- pages directly in a versioned `use/`;
- two `latest` lines, `legacy` lines without a `latest`, or a `legacy` line in a project;
- a page with no `description`, naming every such page (§7);
- any diagram problem in §8.3.

Fix the folder rather than working around the check.

## 10. Git: edit only

- **Never commit, push, rebase or switch branches inside the submodule**, and never move the
  project's submodule pointer. A human does that.
- **Before editing**, check the submodule is current (read-only):
  `git -C <submodule-path> status` and `git -C <submodule-path> log -1 --oneline`. If it is
  behind or detached, give the human the update command instead of running it:

  ```sh
  git -C <submodule-path> switch main && git -C <submodule-path> pull
  ```

- **When done**, list the files you changed and give the human these commands to run:

  ```sh
  git -C <submodule-path> add content/<project-slug> diagrams/<project-slug>
  git -C <submodule-path> commit -m "docs(<project-slug>): <what changed>"
  git -C <submodule-path> push
  git add <submodule-path>
  git commit -m "docs: update documentation submodule"
  ```

## 11. Commands you may run, and commands you hand over

- **Stay in scope.** Read only your own project and this submodule. Never read, search or list
  anything outside them (other projects, the home directory, dotfiles, global config) unless the
  owner asks for that place.
- **Run freely:** read-only commands, such as `git status`, `git diff`, `git log`, `ls`,
  `grep` and reading files; commands that create, edit, move or delete files inside your own
  folders; and the Archify commands in §8.1. Look at a target before deleting or overwriting it,
  and name every path explicitly.
- **Hand to the human:** anything that installs, commits, pushes, changes files outside your
  folders or publishes. That includes `bun install` and `bun add` inside the submodule: they
  change the whole site's lockfile, not only your folder.
- **Verify** with `bunx next build` from the submodule root, once dependencies are installed;
  `bun run test` runs the site's unit tests.
  **Never run `bun run build`**: it also pushes every page to the live search index.
- **No new dependency** in this repository without an ADR and the owner's approval.

## 12. Never guess: ask

When something is undetermined, such as a slug, whether something is public, structure, naming,
which version to document, or a person's GitHub username for an ADR, ask the owner. Don't pick a
plausible answer. Every question gives two to four concrete options, each with a description of
what it means, and a recommendation listed first. The owner may also answer with an idea of their
own.

## 13. Before you hand over

- [ ] Only `content/<project-slug>/` and `diagrams/<project-slug>/` changed (on a project of several
      repositories, only your own parts of them, §6).
- [ ] Nothing private, internal or real in the pages or the diagrams (§2).
- [ ] User-facing changes are in Use, in the right line; maintainer-facing changes are in Maintain
      (§4).
- [ ] Commands, signatures, options, defaults and versions were read from the code (§7).
- [ ] A line's `version` matches the manifest, and its `channel` is right (§5).
- [ ] Every diagram has its Mermaid inside a `<Diagram>` and its Archify `.json` and `.html` (§8).
- [ ] Links between pages start with `./` or `../` (§7).
- [ ] Every page has a `description`, written for a search result (§7).
- [ ] `bunx next build` passes, or you said it was not run and why.
- [ ] The human has the list of changed files and the commands in §10.

## 14. Keep this guide current

When the way consuming repositories work here changes, this file changes in the same change, and
so does `AGENTS.md`.
