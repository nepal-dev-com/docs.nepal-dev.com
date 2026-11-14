---
name: nepal-dev-project-pages
description: "For a consuming repository writing pages in the Nepal Dev Verse docs submodule: the two sets of docs (Use for users, Maintain for maintainers), which pages each holds, ADRs in an adr folder, when to update which, what search engines and share cards get, and what every page must do (checked against the code, frontmatter title and description, relative links, MDX format). Read before writing or editing any page of a project or package."
---

# nepal-dev-project-pages

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `PROJECT_AGENTS.md`. Links are relative to this file.

## First

- Every package and project maintains both Use and Maintain, in the same change as the code.
- Commands, signatures, options, defaults and versions are read from the code, never written from memory.
- Every page is `.mdx` with `title` and `description`; the build fails without a description.
- People in an ADR are GitHub usernames as profile links. Never guess one.
- No binary or externally hosted images. Nothing private, internal or real in a page.

## Two sets of docs to maintain (`PROJECT_AGENTS.md` §4)

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
[`content/docs/maintain/_templates/`](../../content/docs/maintain/_templates/index.mdx): copy one into
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
([ADR-0019](../../content/docs/maintain/adr/ADR-0019-adr-folders-show-as-a-constellation-in-the-sidebar.mdx)).
Title each `ADR-NNNN — …` and keep the template's `- **Status:** Approved` line (Approved,
Proposed, Superseded or Rejected) near the top. The folder's `index.mdx` is the full list.

**People in an ADR are GitHub usernames**, written as a profile link:
`- **Deciders:** [@puncoz](https://github.com/puncoz)` and the same for `Approved by`.
The owner is nepal-dev.com, and `puncoz` decides and approves for it. When a decider's or approver's GitHub username is not already known
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
write no metadata and no tags ([ADR-0035](../../content/docs/maintain/adr/ADR-0035-every-page-is-ready-for-search-and-sharing.mdx)).
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

## What every page must do (`PROJECT_AGENTS.md` §7)

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
