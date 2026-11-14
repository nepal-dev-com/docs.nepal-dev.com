---
name: nepal-dev-docs-duties
description: "Writing or updating documentation in the Nepal Dev Verse docs repository: the three kinds of document, the format of an .mdx page (frontmatter title and description, links, MDX escaping), living documents as snapshots, which design documents a change requires, and which files to check before finishing. Read before adding or editing any page under content/, and before declaring any implementation complete."
paths:
  - "content/**"
---

# nepal-dev-docs-duties

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `AGENTS.md`. Links are relative to this file.

## First

- Everything under `content/` is published. Nothing private goes there.
- Every page is `.mdx` with frontmatter `title` and `description`; the build fails without a description.
- Links between pages start with `./` or `../`.
- Living documents are snapshots: what is no longer true is deleted, not annotated.
- An implementation is not complete while a design document, `AGENTS.md`, `README.md`, `PROJECT_AGENTS.md` or the ADR index contradicts it.

## Documentation duties (`AGENTS.md` §8)

[ADR-0002](../../content/docs/maintainer-guide/adr/ADR-0002-living-design-documentation.mdx). The map of what lives where is
[`content/docs/maintainer-guide/index.mdx`](../../content/docs/maintainer-guide/index.mdx); each directory's `index.mdx` holds its own conventions.

### Three kinds of document

Everything lives under `content/`, and **everything there is published** (§6.1, §9).

| Kind | Where | Rule |
|---|---|---|
| **Package and project documentation** | `content/<slug>/`, except `content/docs/maintainer-guide/` | The product: what readers come for. Written and updated freely within the approved content conventions and the invariants (§6). |
| **Decisions** | `content/docs/maintainer-guide/adr/` | Immutable once approved. Superseded, never edited (one rewording of earlier names, ADR-0038). |
| **Living design documents** | everything else under `content/docs/maintainer-guide/` | Describe this site **as it stands right now**, and are edited in place. |

This site's Maintainer guide is about this site only. A package's or project's own decisions
and design notes go in that package's or project's pages, not here.

**The one exception: design-tool context at the root.** By the owner's decision,
[`PRODUCT.md`](../../PRODUCT.md) sits at the repository root, where the impeccable skill reads it, with
its [`DESIGN.md`](../../DESIGN.md) (the home page's visual system) and `.impeccable/design.json`, and
so would hallmark's `.hallmark/` cache and build log. They are not published. They hold
product truth and the visual system only: decisions still go in ADRs, and design documents in
`content/docs/maintainer-guide/`. Keep `PRODUCT.md` a snapshot, like any living document.

### Format of a page

- **Every page under `content/` is `.mdx`** (ADR-0012), so a page can use an MDX component
  when it needs one. Write it as Markdown otherwise. MDX reads `<` and `{` in prose as JSX: put
  a `<slug>`-style placeholder in backticks or escape it (`\<slug>`), write void tags closed
  (`<br />`), and use `{/* … */}` instead of an HTML comment. Code blocks and frontmatter need
  no escaping.
- **Frontmatter `title`** (required by `pageSchema`) instead of an `#` heading; Fumadocs
  renders the title.
- **Frontmatter `description` is required** (ADR-0035): the build fails and names any page without
  one. One or two plain sentences, about 160 characters at most, for someone reading a search result,
  saying what the page is for. It shows under the title, in results and on the share image.
- A folder's overview is its `index.mdx`. Order is in each folder's `meta.json`
  (`content/docs/maintainer-guide/meta.json` here).
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
| **App flow** | `content/docs/maintainer-guide/app-flow/` | **Any ADR that adds or changes something a person sees (§2, ADR-0008)** |
| PRD + user stories | `content/docs/maintainer-guide/prd/` | Any reader-facing feature |
| Architecture / HLD | `content/docs/maintainer-guide/architecture/` | A new module, content source, build step, background job or external integration |
| ERD | `content/docs/maintainer-guide/erd/` | Any persisted data — `erd/system.mdx` is created by the first ADR that adds some |
| DFD | `content/docs/maintainer-guide/dfd/` | Data crosses a trust boundary or reaches an external system (search, hosting, analytics, CI), or private content moves between processes |
| State diagram | `content/docs/maintainer-guide/state/` | An entity has more than two states, or guarded / timed transitions (a page's draft → published, a package version's lifecycle) |
| Sequence diagram | `content/docs/maintainer-guide/sequence/` | A flow spans several actors or systems, is async, or has failure/retry behaviour (build and index sync, docs generation from a package) |
| API spec | `content/docs/maintainer-guide/api/` | Any route handler or endpoint another client or system calls (`llms.txt`, `static.json`, per-page Markdown) |
| RBAC matrix | `content/docs/maintainer-guide/rbac/` | Visibility or permitted actions depend on who the reader is — private project documentation |
| Security analysis | `content/docs/maintainer-guide/security/` | The change introduces an attack surface worth its own analysis. `secrets.mdx` and `threat-model.mdx` are updated whenever they stop being accurate. |

Judgement applies — a small change may need none of them. **If it is unclear whether one is
required, write it.** Start from [`content/docs/maintainer-guide/_templates/`](../../content/docs/maintainer-guide/_templates/index.mdx).

## Always check these (`AGENTS.md` §8)

### Always check these

| File | Update when |
|---|---|
| The living design documents | The code no longer matches them. An implementation is **not complete** while a design document contradicts it. |
| `AGENTS.md` (this file) | The way work is done changes — conventions, commands, structure, rules, stack |
| `README.md` | What the project is, how to run it, or how it is laid out changes |
| `PROJECT_AGENTS.md` | Anything changes how consuming repositories work here: folder layout, page format, invariants, git flow, commands, or a rule in this file they must follow. **Keep it in step with `AGENTS.md` in the same change.** |
| `content/docs/maintainer-guide/adr/index.mdx` | An ADR is written or changes status — keep the index and the next free number accurate |
