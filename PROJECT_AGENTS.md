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
The owner is nepal-dev.com, and `puncoz` decides and approves for it: *ask the owner* in this guide
means ask `puncoz`.

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

**How this guide is laid out** ([ADR-0045](content/docs/maintain/adr/ADR-0045-agents-md-keeps-the-standing-rules-and-in-house-skills-hold-the-rest.mdx)). This file holds the rules every task needs.
The depth is in this repository's own skills, `.agent-skills/nepal-dev-<topic>/SKILL.md`, next to
this file (from your repository: `<submodule-path>/.agent-skills/…`). They are part of this guide
and as binding as it. **Before starting, check your task against the table in §13 and read every
skill it names, in full.** Where a section says **Depth:**, the skill it names holds the rest of
that section, with its numbered subsections (§3.1, §4.4, §5.2, §8.1 and so on).

**The skills for you** are the three `nepal-dev-project-*` skills and `nepal-dev-diagrams`. The other
`nepal-dev-*` skills, and everything else in `.agent-skills/`, are for work on the site itself: leave
them. Claude Code may list a skill by itself once it has read or edited a file in the submodule
(`.claude/skills/` there links to each), and some only after a matching file is touched. Don't wait
for that: read the `SKILL.md` from its path, as any other tool does. Don't add anything to your own
repository's skills folder for this without your repository's owner.

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
track**: maintainer docs are public too. Every page's address and title also reach the site's analytics,
Vercel Web Analytics and Google Analytics (ADR-0041).

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

**Rules for the folders:**

- **The slug is agreed with the owner** when the folder is first created. Don't invent one.
  `docs` is taken: it is this site.
- **Edit only your folders.** A change anywhere else, such as another project's pages, `src/`,
  configuration, dependencies, `AGENTS.md` or this site's own pages in `content/docs/`, is a change
  to the site itself. It goes through this repository's ADR process (`AGENTS.md` §2): propose it,
  don't make it.
- **Writing and updating pages inside your folders needs no ADR**, as long as they follow this
  guide.

**Depth:** `.agent-skills/nepal-dev-project-layout/SKILL.md` holds the folder tree for a package
and a project, the address each file gets, the catalogue entry in the root `meta.json` (§3.1), and
the overview and sidebar order (§3.2). Read it before creating a folder or editing a `meta.json`.

## 4. Two sets of docs to maintain

**Every package and project maintains both.** They have different readers, so a page belongs in
exactly one. The test: does the reader need your repository open? If not, it is Use. If so, it is
Maintain.

The build lets a track be missing, and the switch between them then hides it. That is only for a
track with nothing to say yet, such as a brand-new project. It is not a way to skip one.

### 4.3 When to update which

Update the docs **in the same change as the code**:

| You changed… | Update |
|---|---|
| Public behaviour, an API, an option, a default or an install step | Use, in `use/dev/` (or `use/` on a project without lines) |
| Internals, the build, the tests, the release process | Maintain |
| A decision worth keeping | A new ADR in `maintain/adr/` |
| A flow that a diagram shows | The diagram's Mermaid **and** its Archify view (§8) |
| Something released | §5.2 |

**Depth:** `.agent-skills/nepal-dev-project-pages/SKILL.md` holds which pages Use holds (§4.1),
which pages Maintain holds, its templates, living documents and ADRs, and how people are named in an
ADR (§4.2), and what search engines and share cards get (§4.4). Read it before writing or editing
any page.

## 5. Versions

**Only the Use track is versioned.** Maintain and the overview have one copy.

**Depth:** `.agent-skills/nepal-dev-project-versions/SKILL.md` holds the lines and their channels,
`version` and `name`, and URL segments (§5.1), how to release (§5.2), and links that don't go stale
(§5.3). Read it before creating or changing a version line, releasing, or linking to a versioned
page.

## 6. A project with several repositories

A project made of several repositories, such as a frontend, a backend and an API, is still one
folder, one overview and one planet
([ADR-0024](content/docs/maintain/adr/ADR-0024-a-project-can-span-several-repositories.mdx)).
Each repository includes this submodule and writes its own folders. Both sets of docs (§4) apply to
each repository.

- **Only the primary repository edits the project's shared files** and does releases. Every
  other repository edits only its own folders and its diagrams.
- **The list of repositories, their ids and which one is primary** are agreed with the owner,
  like the slug. **A private repository** is listed without `url`, or not at all: ask the owner.

**Depth:** `.agent-skills/nepal-dev-project-layout/SKILL.md` holds the `repositories` list, the
folders for each repository, and who edits what, in full. Read it before working on a project of
several repositories.

## 7. What every page must do

These are this site's content invariants (`AGENTS.md` §6):

1. **Checked against the code.** Install commands, signatures, options, defaults and supported
   versions are read from your repository's source and manifest, never written from memory.
2. **States the version it documents.** A line's `version` does this for every page in it (§5.1).
3. **Examples run** against that version, with invented values.
4. **Readable as Markdown.** Plain Markdown and the MDX components registered in
   `src/components/mdx.tsx` only: Fumadocs' defaults and `<Diagram>`. Another component is a
   site change (§3). Every diagram's Markdown is its Mermaid.

**Depth:** `.agent-skills/nepal-dev-project-pages/SKILL.md` holds the format: `.mdx` and its
escaping, the required `title` and `description` and how to write the description, relative links,
and images. Read it before writing or editing any page.

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

A diagram of anything private never goes in `diagrams/`: its HTML is published. No HTML prototypes
or HTML wireframes.

**Depth:** `.agent-skills/nepal-dev-diagrams/SKILL.md` holds the steps and the Archify commands
(§8.1), screens as wireframes (§8.2), and what the build refuses (§8.3). Read it before writing or
changing a diagram, a flow or a wireframe. Run only the Archify commands it gives.

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

- **When done**, list the files you changed and give the human these commands to run. **Pushing the
  submodule to `main` publishes at once**: Vercel builds the site and updates the search index from it,
  with no preview first (ADR-0042). Check with `bunx next build` before handing these over.

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

**Which skills to read.** Check the task against every row, and read each skill a row names, in
full, before the work it covers. The rows are binding. The skills are in
`.agent-skills/<name>/SKILL.md`, next to this file.

| Before you… | Read |
|---|---|
| create your folder, or edit a `meta.json`, the catalogue entry or the sidebar order | `nepal-dev-project-layout` |
| work on a project made of several repositories | `nepal-dev-project-layout` |
| write or edit any page, in Use or in Maintain, or an ADR of your project | `nepal-dev-project-pages` |
| create or change a version line, release, or link to a versioned page | `nepal-dev-project-versions` |
| write or change a diagram, a flow or a wireframe, or touch `diagrams/` | `nepal-dev-diagrams` |

**The checklist.**

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
