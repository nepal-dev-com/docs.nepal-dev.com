# Contributing to Nepal Dev Verse

Thank you for helping. This guide is for people; [`AGENTS.md`](AGENTS.md) is the authoritative
working agreement, for people and AI agents alike. Where the two differ, `AGENTS.md` is right, and
the difference is a bug in this file.

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

| You want to… | Do this |
|---|---|
| Report a bug or a wrong page | Open an [issue](https://github.com/nepal-dev-com/docs.nepal-dev.com/issues/new/choose) |
| Propose a feature or a change to how the site works | Open a **proposal** issue first. It leads to an ADR |
| Document your own package or project | Read [Document your package or project](#document-your-package-or-project) |
| Fix a typo, a broken link or a bug | Open a pull request |
| Report a vulnerability or leaked private content | Follow [`SECURITY.md`](SECURITY.md). Never a public issue |

## The one rule that surprises people: the ADR gate

**Every feature and functional change starts with an Architecture Decision Record, and nothing is
built until the owner approves it**
([ADR-0001](content/docs/maintain/adr/ADR-0001-adr-driven-development-workflow.mdx)). A pull request
with unapproved feature code will be asked to start again from a proposal.

1. **Propose.** Open a proposal issue. Once the idea has a shape, an ADR is written in
   [`content/docs/maintain/adr/`](content/docs/maintain/adr/index.mdx) from the
   [template](content/docs/maintain/_templates/adr.mdx), with `Status: Proposed`. A change a person
   can see also ships its app flow.
2. **Review.** The maintainer reviews it, and it is revised in place.
3. **Approve.** The maintainer marks it `Approved`.
4. **Build.** Only then is it implemented, in full.

An approved ADR's decision is never rewritten; a change of mind is a new ADR that supersedes it.

**No ADR is needed for** a bug fix that restores documented behaviour, typo, formatting and copy
fixes, and pages for a package or project within the approved conventions. Unsure? Ask in an issue.
The full table is in [`AGENTS.md` §2](AGENTS.md).

## Set up

You need [Bun](https://bun.sh).

```bash
git clone https://github.com/<your-username>/docs.nepal-dev.com.git
cd docs.nepal-dev.com
bun install
cp .env.example .env.local
bun run dev
```

`.env.local` can stay empty for local work. Never commit it.

## Before you open a pull request

```bash
bun run test
bun run types:check
bunx next build
```

- **Never run `bun run build`.** It pushes every page to the live search index. `bunx next build`
  is the check.
- `bun run lint` does not run today (`typescript-eslint` does not support TypeScript 7 yet). That
  is known; you need not fix it.
- **Tests are part of the change**: the happy path and the obvious failures. A bug fix starts with a
  test that fails for the bug's reason
  ([ADR-0007](content/docs/maintain/adr/ADR-0007-tests-are-part-of-every-change.mdx)).
- **Documentation is part of the change.** The design documents in `content/docs/maintain/` describe
  the site as it stands now; update them in place, and delete what is no longer true
  ([ADR-0002](content/docs/maintain/adr/ADR-0002-living-design-documentation.mdx)).
- **New dependencies need an ADR** and the maintainer's yes.
- **Comments explain why, never what**, and every branch takes braces
  ([ADR-0003](content/docs/maintain/adr/ADR-0003-code-comment-policy.mdx)).
- **Ask, don't guess.** When something is undetermined (scope, naming, whether something is public),
  ask in the issue or the pull request
  ([ADR-0004](content/docs/maintain/adr/ADR-0004-ask-never-guess.mdx)).

## Pull requests

- Branch from `main` in your fork, and keep one change to a pull request.
- Fill in the pull request template. Link the issue and the approved ADR.
- **There is no preview deployment.** Only `main` deploys, and a pull request from a fork is never
  built by the host ([ADR-0042](content/docs/maintain/adr/ADR-0042-only-main-deploys-straight-to-production-on-vercel.mdx)).
  The maintainer checks your branch locally.
- **Merging publishes at once**: the site and the search index, straight to production. So the
  maintainer merges, and reviews with that in mind.

## Writing pages

- Every page is `.mdx` with frontmatter `title` and `description`. The description is one or two
  plain sentences, about 160 characters, written for someone reading a search result. The build
  fails without one.
- Links between pages are relative paths that start with `./` or `../`.
- Every diagram is a Mermaid fence inside a `<Diagram>`, with its Archify view in `diagrams/`. No
  images.
- Commands, signatures, options, defaults and versions are read from the code, never written from
  memory. Examples run, with invented values.
- **Everything is published and published is permanent.** No secrets, tokens, internal hostnames,
  client names or personal data, in text, examples or diagrams. Nothing from a private project.

The details are in
[`.agent-skills/nepal-dev-docs-duties/SKILL.md`](.agent-skills/nepal-dev-docs-duties/SKILL.md) and
[`.agent-skills/nepal-dev-diagrams/SKILL.md`](.agent-skills/nepal-dev-diagrams/SKILL.md).

## Document your package or project

Your package or project documents itself from its own repository, through a git submodule of this
one, in its own two folders: `content/<slug>/` and `diagrams/<slug>/`.

1. Open a proposal issue to agree the slug with the maintainer.
2. Add this repository as a submodule of yours.
3. Follow [`PROJECT_AGENTS.md`](PROJECT_AGENTS.md).

Public projects only, for now.

## Working with an AI agent

Agents are welcome, under the same rules. Point yours at [`AGENTS.md`](AGENTS.md): it tells the
agent which of this project's skills in [`.agent-skills/`](.agent-skills/INDEX.md) to read for a
task. Two rules matter most: an agent never commits or pushes here, and never runs
`bun run build`. You review what it wrote, and you are responsible for the pull request.

## Licence of your contribution

By contributing you agree that your code is licensed under the [MIT licence](LICENSE), and your
pages and diagrams under [CC BY 4.0](LICENSE-CONTENT)
([ADR-0046](content/docs/maintain/adr/ADR-0046-the-code-is-mit-the-docs-are-cc-by-and-the-repository-gets-its-community-files.mdx)).
