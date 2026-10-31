# Documenting a project here — guide for consuming repositories

This repository, **puncoz-packages-docs**, is the documentation site for everything Puncoz
Nepal builds. Project and package repositories include it as a **git submodule** and write their
own documentation into it. This guide is for the people and AI agents working in those
repositories.

> **Status.** The convention below is set out in
> [ADR-0010](content/docs/documentation/adr/ADR-0010-projects-document-themselves-through-a-submodule.md),
> **Proposed**. Until the owner approves it, treat it as the intended rule and raise any
> disagreement as a question.

Everything outside your project's folder is governed by [`AGENTS.md`](AGENTS.md), this
repository's working agreement. Where this guide is silent, `AGENTS.md` applies.

## 1. Add this to your project's `AGENTS.md` or `CLAUDE.md`

Replace `<submodule-path>` with where the submodule is mounted (for example `docs`) and
`<project-slug>` with your project's folder name (§3).

```markdown
## Documentation (git submodule)

`<submodule-path>/` is the puncoz-packages-docs repository, where this project's documentation
is published. Before changing anything in it, read `<submodule-path>/PROJECT_AGENTS.md` and follow
it. In short: edit only `<submodule-path>/content/docs/<project-slug>/`; never commit, push or
switch branches inside the submodule; never put private content there; ask the owner when
anything is unclear.
```

## 2. Public only, for now

Every file under `content/docs/` is **published**: on the website, in the search index, in
`llms.txt` / `llms-full.txt`, as per-page Markdown and as Open Graph images. Published is
permanent.

- **A private project adds nothing here.** Keep its documentation in its own repository until
  an ADR here decides how private documentation is kept and served (`AGENTS.md` §6.1).
- **A public project's pages carry nothing internal**: no secrets, tokens, internal hostnames,
  client names, personal data, or private code copied from your repository.
- **Unsure whether something is public? Ask the owner.** Never decide it yourself.

## 3. Where your pages go

Each project or package has one folder: **`content/docs/<project-slug>/`**. It is a Fumadocs
root folder, so it gets its own entry in the sidebar's switcher.

```
content/docs/<project-slug>/
├── meta.json      # {"title": "...", "description": "...", "root": true, "pages": ["index", ...]}
├── index.mdx      # the project's overview — frontmatter `title` (required), `description`
└── ...            # further pages and subfolders
```

- **The slug is agreed with the owner** when the folder is first created. Don't invent one.
- **Edit only your folder.** A change anywhere else, such as another project's pages, `src/`,
  configuration, dependencies, `AGENTS.md` or the Documentation project, is a change to the
  site itself. It goes through this repository's ADR process (`AGENTS.md` §2): propose it, don't
  make it.
- Writing and updating pages inside your folder needs no ADR, as long as it follows this guide.

## 4. What every page must do

These are this site's content invariants (`AGENTS.md` §6):

1. **Checked against the code.** Install commands, signatures, options, defaults and supported
   versions are read from your repository's source and manifest, never written from memory.
2. **States the version it documents.**
3. **Examples run** against that version, with invented values.
4. **Readable as Markdown.** Plain Markdown and the MDX components registered in
   `src/components/mdx.tsx` (Fumadocs' defaults) only. Another component is a site change
   (§3).

Format:

- Frontmatter `title` is required (`pageSchema` in `src/lib/source.ts`). Fumadocs renders it,
  so don't repeat it as an `#` heading.
- Links between pages are relative paths that **start with `./` or `../`**
  (`./getting-started.mdx`). Only those resolve to page URLs.
- Diagrams are Mermaid in fenced code blocks; no binary or externally hosted images.

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
  git -C <submodule-path> add content/docs/<project-slug>
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
  `grep` and reading files.
- **Hand to the human:** anything that installs, deletes, moves, commits, pushes, writes outside
  your folder or publishes. That includes `bun install` and `bun add` inside the submodule.
- **Verify** with `bunx next build` from the submodule root, once dependencies are installed.
  **Never run `bun run build`**: it also pushes every page to the live search index.
- **No new dependency** in this repository without an ADR and the owner's approval.

## 7. Never guess: ask

When something is undetermined, such as a slug, whether something is public, structure, naming,
or which version to document, ask the owner. Don't pick a plausible answer. Every question
gives two to four concrete options, each with a description of what it means, and a
recommendation listed first. The owner may also answer with an idea of their own.

## 8. Keep this guide current

When the way consuming repositories work here changes, this file changes in the same change, and
so does `AGENTS.md`.
