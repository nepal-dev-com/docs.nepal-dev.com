---
name: nepal-dev-project-layout
description: "For a consuming repository documenting its package or project in the Nepal Dev Verse docs submodule: where everything goes (content/[project-slug]/ and diagrams/[project-slug]/), the catalogue entry in meta.json, the overview and sidebar order, and a project made of several repositories. Read before creating a project folder, editing a meta.json or catalog, or working on a multi-repository project."
---

# nepal-dev-project-layout

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `PROJECT_AGENTS.md`. Links are relative to this file.

## First

- Edit only `content/<project-slug>/` and `diagrams/<project-slug>/`. Anything else is a change to the site: propose it.
- The slug, the list of repositories, their ids and which one is primary are agreed with the owner. Don't invent them.
- `visibility` must be `public`. A private repository is listed without `url`, or not at all: ask the owner.
- `featured` is the owner's call.
- On a multi-repository project, only the primary repository edits the shared files.

## Where everything goes (`PROJECT_AGENTS.md` §3)

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
  ([ADR-0025](../../content/docs/maintain/adr/ADR-0025-the-overview-has-the-same-sidebar-as-its-tracks.mdx)).
  Don't add a page of your own to lead back to it.
- **Order pages with `pages`** in a folder's `meta.json`, listing page and folder names.
- **Group a long track with separators.** A `"---Label---"` entry in `pages` draws a small label
  over the folders after it
  ([ADR-0027](../../content/docs/maintain/adr/ADR-0027-the-sidebar-is-a-scale-ladder-with-one-lifted-orbit.mdx)).
  Use it when a track has more than five or so folders, and put top-level pages before the first
  one.

## A project with several repositories (`PROJECT_AGENTS.md` §6)

A project made of several repositories, such as a frontend, a backend and an API, is still one
folder, one overview and one planet
([ADR-0024](../../content/docs/maintain/adr/ADR-0024-a-project-can-span-several-repositories.mdx)).
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
