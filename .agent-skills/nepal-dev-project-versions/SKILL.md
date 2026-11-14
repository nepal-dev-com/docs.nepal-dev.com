---
name: nepal-dev-project-versions
description: "For a consuming repository versioning its User guide docs in the Nepal Dev Verse docs submodule: version lines (dev, latest, legacy), the version, channel and name fields in a line's meta.json, URL segments, how to cut a release, and links that do not go stale. Read before creating or changing a version line, releasing, or linking to a versioned page."
---

# nepal-dev-project-versions

Part of this repository's working agreement (ADR-0045): as binding as `AGENTS.md`, which holds the rules every task needs. The text below is the depth of the sections named in each heading; a `§N` in it is a section of `PROJECT_AGENTS.md`. Links are relative to this file.

## First

- Only the User guide is versioned. The Maintainer guide and the overview have one copy.
- `version` is the exact version the line documents, read from the manifest.
- Exactly one `latest` line once anything is released; `dev` is always `user-guide/dev/`.
- A project has `dev` and at most one released line, never `legacy` lines.
- A released line keeps describing its version; new behaviour goes in `dev/`.

## Versions (`PROJECT_AGENTS.md` §5)

**Only the User guide is versioned.** The Maintainer guide and the overview have one copy.

### 5.1 Lines

A version line is a folder in `user-guide/`, with `version` and `channel` in its `meta.json`.

| Channel | Means | Folder | Address | Who has it |
|---|---|---|---|---|
| `dev` | Unreleased work on the default branch | Always `user-guide/dev/` | Always `/<project-slug>/user-guide/dev` | Packages, and projects that ship releases |
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
- **A package has lines from the start**: its `user-guide/` holds only line folders, no pages directly.
- **Older lines** are listed in the version menu in `user-guide/meta.json` `pages` order, otherwise newest
  version first.
- **The site adds the notices itself**: pages on `dev` and on older lines say so and link to the
  latest. Don't write your own banner.
- **A released line keeps describing its version.** Correct mistakes in it; new behaviour goes in
  `dev/`.
- **Search follows the channel** (§4.4): `latest` is indexed, an older page points search engines at
  the same path in `latest`, and `dev` stays out. Changing a `channel` is all it takes.

**A project is unversioned by default**: its `user-guide/` holds pages directly. A project that ships
releases has `user-guide/dev/` and at most one released line (`channel: "latest"`), never `legacy` lines:
older versions are for packages
([ADR-0024](../../content/docs/maintainer-guide/adr/ADR-0024-a-project-can-span-several-repositories.mdx)).

### 5.2 Releasing

**A package:**

1. Copy `user-guide/dev/` to a new folder, for example `user-guide/v4/`.
2. In the new folder's `meta.json`, set its `name`, its `version` and `channel: "latest"`.
3. In the previous `latest` line's `meta.json`, set `channel: "legacy"`.
4. In `user-guide/dev/meta.json`, set the next `version`, and keep working in `dev/`.

**A project** copies `dev/` to the new released line and removes the previous one.

### 5.3 Links that don't go stale

- **Link to `/<project-slug>/user-guide/latest/…`** from your README and registry page. It redirects to
  the line marked `latest`, or to `dev` before the first release.
- **A link to a line that no longer exists** redirects to the same path in `latest`.
- **`/<project-slug>/user-guide`** opens the first page of the latest line.
