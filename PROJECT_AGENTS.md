# Documenting a project here — guide for consuming repositories

This repository, **puncoz-packages-docs**, is the documentation site for everything Puncoz
Nepal builds. Project and package repositories include it as a **git submodule** and write their
own documentation into it. This guide is for the people and AI agents working in those
repositories.

> **Status.** The convention below is set out in
> [ADR-0010](content/docs/maintain/adr/ADR-0010-projects-document-themselves-through-a-submodule.mdx),
> **Approved**. The shape of your folder (§3) is
> [ADR-0013](content/docs/maintain/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx),
> **Approved**.

Everything outside your project's folder is governed by [`AGENTS.md`](AGENTS.md), this
repository's working agreement. Where this guide is silent, `AGENTS.md` applies.

## 1. Add this to your project's `AGENTS.md` or `CLAUDE.md`

Replace `<submodule-path>` with where the submodule is mounted (for example `docs`) and
`<project-slug>` with your project's folder name (§3).

```markdown
## Documentation (git submodule)

`<submodule-path>/` is the puncoz-packages-docs repository, where this project's documentation
is published. Before changing anything in it, read `<submodule-path>/PROJECT_AGENTS.md` and follow
it. In short: edit only `<submodule-path>/content/<project-slug>/`; never commit, push or
switch branches inside the submodule; never put private content there; ask the owner when
anything is unclear.
```

## 2. Public only, for now

Every file under `content/` is **published**: on the website, in the search index, in
`llms.txt` / `llms-full.txt`, as per-page Markdown and as Open Graph images. Published is
permanent.

- **A private project adds nothing here.** Keep its documentation in its own repository until
  an ADR here decides how private documentation is kept and served (`AGENTS.md` §6.1).
- **A public project's pages carry nothing internal**: no secrets, tokens, internal hostnames,
  client names, personal data, or private code copied from your repository.
- **Unsure whether something is public? Ask the owner.** Never decide it yourself.

## 3. Where your pages go

Each project or package has one folder: **`content/<project-slug>/`**, published at
**`/<project-slug>`**. Its shape is fixed by
[ADR-0013](content/docs/maintain/adr/ADR-0013-packages-and-projects-share-one-catalogue-shape.mdx) and
[ADR-0015](content/docs/maintain/adr/ADR-0015-every-entry-lives-at-the-root-in-one-shape-and-one-look.mdx):
an overview, a **Use** track for people using it and a **Maintain** track for people who look
after it. A package's Use track has one folder per documented version, called a **line**.

```
content/<project-slug>/
├── meta.json          # title, description and the `catalog` entry (below)
├── index.mdx          # the overview, at /<project-slug>
├── use/
│   ├── meta.json      # {"title": "Use"}; optional "pages" orders the older lines
│   ├── dev/           # unreleased work in progress on the default branch, at /<project-slug>/use/dev
│   │   ├── meta.json  # {"title": "dev", "version": "4.0.0-dev", "channel": "dev"}
│   │   ├── index.mdx
│   │   └── ...
│   ├── v3/            # a released line; the folder name is yours
│   │   ├── meta.json  # {"name": "v3.2", "version": "3.2.0", "channel": "latest"} → /<project-slug>/use/v3.2
│   │   └── ...
│   └── lts-2/         # an older line
│       └── meta.json  # {"name": "2.x LTS", "version": "2.9.1", "channel": "legacy"} → /<project-slug>/use/2.x-lts
└── maintain/          # not versioned: describes the default branch
    ├── meta.json      # {"title": "Maintain"}
    ├── adr/           # your ADRs, if you keep them: index.mdx + ADR-NNNN-*.mdx
    └── ...            # architecture, local setup, tests, releasing, contributing
```

**Keep ADRs in a folder named `adr`.** The sidebar shows such a folder as a constellation, one
moon per ADR phased by its status
([ADR-0019](content/docs/maintain/adr/ADR-0019-adr-folders-show-as-a-constellation-in-the-sidebar.mdx)).
Title each `ADR-NNNN — …` and keep the template's `- **Status:** Approved` line (Approved,
Proposed, Superseded or Rejected) near the top; the folder's `index.mdx` is the full list.

**People in an ADR are GitHub usernames**, written as a profile link:
`- **Deciders:** [@puncoz](https://github.com/puncoz)` and the same for `Approved by`. The
owner's username is `puncoz`. When you add or approve an ADR and a decider's or approver's
GitHub username is not already known (in your project's existing ADRs or from the owner), ask
for it; never write a display name in its place and never guess a username.

The root `meta.json` carries the catalogue entry that the home page, search and `llms.txt` are
built from:

```json
{
  "title": "lodestar",
  "description": "Keyboard-first command palette for React.",
  "root": true,
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

- `kind` is `package` or `project`. `ecosystem` is required for a package: `npm`, `composer`,
  `pypi`, `go`, `cargo` or `other`. `visibility` must be `public`. `repository` and `registry`
  are optional `https` URLs. `featured` (default `false`) is the owner's call: ask.
- **A line's `version` is the exact version it documents**, read from your manifest (§4), and
  its `channel` is `latest`, `dev` or `legacy`.
- **`use/dev/` is the work in progress**: always that folder, always `channel: "dev"`, always at
  `/<project-slug>/use/dev`. A package with only `dev` is unreleased.
- **A released line is named in its `meta.json`.** `name` is any string the package uses, such as
  `v1.0`, `4.x` or `2024 LTS`; without it the folder name is used. The URL segment is the name
  in lowercase, spaces as `-`, other characters outside `a-z 0-9 . _ -` dropped. A released
  package has exactly one `latest` line. Older lines are `legacy`; the version menu lists them in
  `use/meta.json` `pages` order, otherwise newest version first.
- **Releasing:** copy `dev/` to a new folder, give it a `name`, its `version` and
  `channel: "latest"`, mark the previous `latest` `legacy`, and keep working in `dev/`. A link to
  a line that no longer exists redirects to the same path in `latest`.
- **A project is unversioned by default**: its `use/` holds pages directly. A project that ships
  releases may use lines like a package.
- **Either track may be missing**; the Use | Maintain switch then hides it.
- **Link to `/<project-slug>/use/latest/…`** from your README and registry page. It
  redirects to the line marked `latest`, so the link never goes stale.
- **No `demo.mdx` yet.** Demos wait for their own ADR.
- **Diagrams sit beside your folder**
  ([ADR-0022](content/docs/maintain/adr/ADR-0022-diagrams-show-archify-on-the-page-and-mermaid-in-markdown.mdx)):
  the Archify candidate and its HTML side by side, `diagrams/<project-slug>/<slug>.json` and
  `diagrams/<project-slug>/<slug>.html`. That folder is yours too.
- **The build checks the shape** and fails, naming the file, on: a page directly in
  `content/`, a folder without a `catalog`, an invalid or non-`public` `catalog`, a slug that is
  not lowercase letters, digits and hyphens or is reserved (`api`, `auth`, `callback`, `sign-in`,
  `sign-out`, `og`, `search`, `static`, `assets`, `public`, `diagrams`, `_next`), a line without `version` or
  `channel`, `channel: "dev"` anywhere but `use/dev/` (or `use/dev/` with another channel), a
  name whose segment is empty, `dev`, `latest` or ends in `.md`, two lines with the same
  segment, pages directly in a versioned `use/`, two `latest` lines, and `legacy` lines without
  a `latest`. Fix the folder rather than working around the check.
- **The slug is agreed with the owner** when the folder is first created. Don't invent one.
  `docs` is taken: it is this site.
- **Edit only your folders**: `content/<project-slug>/` and `diagrams/<project-slug>/`. A change anywhere else, such as another project's pages, `src/`,
  configuration, dependencies, `AGENTS.md` or this site's own pages in `content/docs/`, is a change to the
  site itself. It goes through this repository's ADR process (`AGENTS.md` §2): propose it, don't
  make it.
- Writing and updating pages inside your folder needs no ADR, as long as it follows this guide.

## 4. What every page must do

These are this site's content invariants (`AGENTS.md` §6):

1. **Checked against the code.** Install commands, signatures, options, defaults and supported
   versions are read from your repository's source and manifest, never written from memory.
2. **States the version it documents.** The line's `version` does this for every page in it:
   the site prints it under the description and in the page's Markdown.
3. **Examples run** against that version, with invented values.
4. **Readable as Markdown.** Plain Markdown and the MDX components registered in
   `src/components/mdx.tsx` only: Fumadocs' defaults and `<Diagram>`. Another component is a
   site change (§3). Every diagram's Markdown is its Mermaid.

Format:

- **Every page is `.mdx`.** Write Markdown, plus a registered component where it helps. In
  prose, MDX reads `<` and `{` as JSX: put a `<slug>`-style placeholder in backticks or escape
  it (`\<slug>`), close void tags (`<br />`), and use `{/* … */}` for comments.
- Frontmatter `title` is required (`pageSchema` in `src/lib/source.ts`). Fumadocs renders it,
  so don't repeat it as an `#` heading.
- Links between pages are relative paths that **start with `./` or `../`**
  (`./getting-started.mdx`). Only those resolve to page URLs.
- **Diagrams and flows: always Archify**, the skill installed in this repository at
  `.claude/skills/archify`. It produces a standalone HTML file. **Every diagram is Mermaid and
  Archify together**: a Mermaid fence inside a `<Diagram>` (below). The page shows only the
  Archify view; Copy Markdown, `/<page>.md` and `llms-full.txt` carry only the Mermaid.
  Run it without the browser gate, from the submodule root, with working files in `.archify/`:

  ```sh
  node .claude/skills/archify/bin/archify.mjs deliver <type> <candidate.json> <output.html> --quality showcase --json
  node .claude/skills/archify/bin/archify.mjs check <output.html> --require-provenance
  ```

  Don't run `finalize`, `browser-check` or `visual-check` (they launch Chrome) unless the owner
  asks. Never upgrade Archify; tell the owner when it reports an update.
- **Screens are `block-beta` wireframes**, phone width first, each with its Archify view: an
  `architecture` diagram drawn from the Mermaid, its boxes inside a labelled phone-screen region,
  one per screen. No HTML prototypes or HTML wireframes.
- **Publish a diagram** (ADR-0022): put the candidate (Archify's classic style: no
  `visual_preset`) and the checked HTML, byte for byte, in `diagrams/<project-slug>/` as
  `<slug>.json` and `<slug>.html`. Never copy a `*.delivery*.json` receipt: it holds local
  paths. Wrap the diagram's Mermaid fence, with nothing else inside:

  ````mdx
  <Diagram src="/diagrams/<project-slug>/request-flow.html" title="Request flow">

  ```mermaid
  flowchart LR
    Parser --> Router --> Handler
  ```

  </Diagram>
  ````

  The site does the rest: the frame fits the diagram, follows the site's theme, starts Live, and
  shows only the diagram and its controls. The build fails, naming the page or file, on a
  Mermaid fence outside a `<Diagram>`, a `<Diagram>` without a plain `src` and `title` or
  without exactly one Mermaid fence, a `src` outside `/diagrams/<project-slug>/<slug>.html` or
  without its file, an HTML without its JSON or used by no page, anything in
  `public/diagrams/`, and a receipt. A diagram of anything private never goes in `diagrams/`:
  its HTML is published.
- No binary or externally hosted images. The one exception is automatic: a GitHub profile link,
  `[@user](https://github.com/user)`, shows as a chip with the avatar loaded from GitHub
  (ADR-0020).

## 5. Git: edit only

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
  git -C <submodule-path> add content/<project-slug>
  git -C <submodule-path> commit -m "docs(<project-slug>): <what changed>"
  git -C <submodule-path> push
  git add <submodule-path>
  git commit -m "docs: update documentation submodule"
  ```

## 6. Commands you may run, and commands you hand over

- **Stay in scope.** Read only your own project and this submodule. Never read, search or list
  anything outside them (other projects, the home directory, dotfiles, global config) unless the
  owner asks for that place.
- **Run freely:** read-only commands, such as `git status`, `git diff`, `git log`, `ls`,
  `grep` and reading files; and commands that create, edit, move or delete files inside your
  own folder. Look at a target before deleting or overwriting it, and name every path
  explicitly.
- **Hand to the human:** anything that installs, commits, pushes, changes files outside your
  folder or publishes. That includes `bun install` and `bun add` inside the submodule: they
  change the whole site's lockfile, not only your folder.
- **Verify** with `bunx next build` from the submodule root, once dependencies are installed;
  `bun run test` runs the site's unit tests.
  **Never run `bun run build`**: it also pushes every page to the live search index.
- **No new dependency** in this repository without an ADR and the owner's approval.

## 7. Never guess: ask

When something is undetermined, such as a slug, whether something is public, structure, naming,
which version to document, or a person's GitHub username for an ADR, ask the owner. Don't pick a plausible answer. Every question
gives two to four concrete options, each with a description of what it means, and a
recommendation listed first. The owner may also answer with an idea of their own.

## 8. Keep this guide current

When the way consuming repositories work here changes, this file changes in the same change, and
so does `AGENTS.md`.
