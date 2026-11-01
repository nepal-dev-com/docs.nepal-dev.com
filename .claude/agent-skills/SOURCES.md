# Agent skills — sources

Provenance and trust policy for the skills in this folder
([ADR-0009](../../content/docs/maintain/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx)).
Which skill to load for which task is in [`INDEX.md`](./INDEX.md).

## Trust policy

A skill is vendored only when it is **trusted** and **clean**.

**Trusted** — at least one of:

- **The owner of what it covers.** An official skill from the maintainer of a package, library
  or service this site uses (Next.js, Algolia, …).
- **Trusted by many.** A widely adopted repository with substantial, visible use, from a
  recognised individual or organisation.
- **Otherwise high trust.** A maintainer with an established security or engineering
  reputation, such as a security research firm or the vendor of the agent itself.

**Clean** — all of:

- **Licensed.** A licence that permits copying. Attribution and share-alike terms are honoured
  for the files they cover.
- **Scanned.** Every `SKILL.md` read in full, and every supporting file scanned, for command
  execution, network calls, credential handling and instruction-override text. Findings are
  neutralised by an override in [`INDEX.md`](./INDEX.md), or the skill is rejected.
- **Pinned.** Copied at a specific upstream commit, unmodified, with JavaScript/TypeScript files
  omitted so lint and the build ignore the folder.

When an untrusted skill is proposed, the owner is asked with options, and the request names the
better-trusted alternatives (`AGENTS.md` §12.2).

## Layout

`<owner>-<repository>/<path in that repository>`. Upstream paths are kept, so a skill's own
relative links (`../../references/…`) still resolve. Each source folder holds the upstream
licence file, where the repository has one.

## Sources

| Folder | Repository | Commit | Date | Licence | Trust basis | Skills |
|---|---|---|---|---|---|---|
| `obra-superpowers` | [obra/superpowers](https://github.com/obra/superpowers) | `2ce8aa15d05bd57213e6f746f953aafb7ded7a8b` | 2026-10-21 | MIT (`LICENSE`) | Trusted by many: ~310k stars; the most widely used process-skill library for coding agents | brainstorming, systematic-debugging, test-driven-development, verification-before-completion, requesting-code-review, receiving-code-review |
| `addyosmani-agent-skills` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | `8bfcc1f9916f2eea55494d8c1fa7f4bde867dd9e` | 2026-10-30 | MIT (`LICENSE`) | Trusted by many: ~112k stars; Addy Osmani | documentation-and-adrs, source-driven-development, security-and-hardening (+ `references/security-checklist.md`) |
| `vercel-labs-agent-skills` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `1a2c79d4e6c4a2283dc2c614b6538cbe1ed5ca62` | 2026-10-27 | MIT, stated in the README; **no `LICENSE` file in the repository** | Owner: Vercel maintains Next.js; ~33k stars | writing-guidelines, web-design-guidelines, react-best-practices |
| `vercel-labs-writing-guidelines` | [vercel-labs/writing-guidelines](https://github.com/vercel-labs/writing-guidelines) | `83e2316b034cf572400513538e4e4da01c4cc742` | 2026-06-01 | MIT (`LICENSE`) | Owner: Vercel. The rules writing-guidelines fetches at run time, pinned | `command.md` snapshot |
| `vercel-labs-web-interface-guidelines` | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | `434b7f91364665f2f733b310ec54809bf8f37937` | 2026-10-05 | MIT (`LICENSE`) | Owner: Vercel; ~1.1k stars. The rules web-design-guidelines fetches at run time, pinned | `command.md` snapshot |
| `vercel-nextjs` | [vercel/next.js](https://github.com/vercel/next.js) (`skills/`) | `746212d43aab1d20e05ba532628c40b91197a142` | 2026-10-31 | MIT (`license.md`) | Owner: the Next.js repository itself | next-bundle-optimizer |
| `anthropics-skills` | [anthropics/skills](https://github.com/anthropics/skills) | `ca45fc496a3436251f191354091d557da31c15b5` | 2026-10-28 | Apache-2.0 (the skill's own `LICENSE.txt`) | High trust: Anthropic, the vendor of Claude Code; ~185k stars | frontend-design |
| `mattpocock-skills` | [mattpocock/skills](https://github.com/mattpocock/skills) | `a496f5513d4a4cf889bc48e189e579f4b0bdf6aa` | 2026-10-29 | MIT (`LICENSE`) | Trusted by many: ~307k stars; Matt Pocock, TypeScript educator | writing-for-agents |
| `trailofbits-skills` | [trailofbits/skills](https://github.com/trailofbits/skills) | `2be6433b39e009cd2b6fd3be1895f6b1faa5af9a` | 2026-10-28 | CC-BY-SA-4.0 (`LICENSE`): attribution and share-alike apply to these files | High trust: Trail of Bits, security research firm; ~7.9k stars | supply-chain-risk-auditor |
| `algolia-skills` | [algolia/skills](https://github.com/algolia/skills) | `476d5c32dd249940ab7a7ded3330d9cfb0199ac3` | 2026-10-30 | MIT (`LICENSE`) | Owner: Algolia's official skills, for the search service this site uses. Few stars; trusted as the vendor | algolia-data-modeling, algolia-index-configuration, algolia-audit |

### What was read

- **In full:** every `SKILL.md` above, `SKILL-MECHANICS.md` (writing-for-agents), and both
  `command.md` snapshots.
- **Scanned** for command execution, network calls, credentials and override text: every other
  vendored file, including the 72 `rules/*.md` of react-best-practices, the Algolia and Next.js
  `references/`, and the supply-chain auditor's Python scripts. Nothing instructs an agent to
  override its instructions, hide actions or read secrets. One finding is handled by an override:
  the auditor reads `gh auth token` and calls registry, advisory and GitHub APIs.

## Omitted files

| Source | Omitted | Why |
|---|---|---|
| obra-superpowers | `skills/brainstorming/scripts/` (`server.cjs`, `helper.js`, `start-server.sh`, `stop-server.sh`, `frame-template.html`) | JavaScript, and a local server for the optional visual companion |
| obra-superpowers | `skills/systematic-debugging/condition-based-waiting-example.ts` | TypeScript; the technique is in `condition-based-waiting.md` |
| algolia-skills | `skills/*/evals/` | Test prompts for the skill authors; not used at run time |
| trailofbits-skills | The plugin's `README.md`, `.claude-plugin/`, `evals/` | Packaging and tests, outside the skill folder |
| all | Everything in each repository not listed under *Skills* | Not selected |

## Rejected candidates

| Candidate | Why not |
|---|---|
| obra/superpowers `writing-plans`, `executing-plans` | Commit after each step and depend on subagent task scripts. The ADR's implementation notes are the plan here (`AGENTS.md` §3) |
| obra/superpowers `using-git-worktrees`, `finishing-a-development-branch`, `subagent-driven-development`, `using-superpowers` | Branches, worktrees, merges and commits are not done here (`AGENTS.md` §3); `using-superpowers` is replaced by `INDEX.md` |
| anthropics/skills `doc-coauthoring` | No licence on the skill |
| vercel-labs/next-skills (`next-best-practices`) | Moved upstream; the installed `node_modules/next/dist/docs/` is the authority for this exact version |
| vercel/next.js `next-dev-loop` | Needs the dev server's `/_next/mcp` endpoint and a browser automation tool |
| vercel/next.js `next-cache-components-optimizer`, `next-partial-prefetching-optimizer` | Cache Components and partial prefetching are not used by this site |
| fuma-nama/fumadocs | Ships no public skill (only an internal `.cursor/skills/radix-base-ui-sync`); the installed Fumadocs source is read directly |
| Tailwind CSS, React, TypeScript, ESLint | No official skill exists |
| algolia/skills `algolia-discovery-planning`, `algolia-events-insights`, `algolia-release-qa`, `algolia-instantsearch-ui` and the rest | Net-new or ecommerce builds, Insights events and InstantSearch, none of which this site uses; `algolia-cli` and `algolia-mcp` perform live account operations |
| plannotator/effective-html `html-wireframe`, `html-prototype` | Removed on the owner's decision, 2026-11-01: app flows show screens as Mermaid `block-beta` wireframes only |
| trailofbits/skills, other plugins | Smart contracts, C/C++, fuzzing and binary analysis; not relevant |

## Approved installed skills

Not vendored, so not pinned or scanned in full: the owner installed these and approved them for
UI and UX work on 2026-10-31. Their `SKILL.md` files and script entry points were reviewed as
installed on that date; the routing and overrides are in
[`INDEX.md`](./INDEX.md#approved-installed-skills). Re-review after an update.

| Set | Installed as (version on 2026-10-31) | Author and repository, as stated | Licence, as stated | Reviewed |
|---|---|---|---|---|
| impeccable | Plugin `impeccable@impeccable` 4.6.0 (engine 0.1.15), user scope; user skill `~/.claude/skills/impeccable` (engine 0.1.18) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (the marketplace added); docs at impeccable.style | Apache-2.0 (the marketplace repository's `LICENSE`) | `SKILL.md`, `init.md`, `hooks.md`, the launcher; references pattern-scanned. The launcher downloads its engine only when the bundled binary is missing, checked against `engine-checksums.txt` |
| ui-ux-pro-max | Plugin `ui-ux-pro-max@ui-ux-pro-max-skill` 2.15.0, project scope | NextLevelBuilder, [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT (`LICENSE`, "Copyright (c) 2024 Next Level Builder") | Main `SKILL.md` in full; the six sibling skills' frontmatter and workflows; scripts' commands, inputs and outputs. `search.py` is local, reads bundled CSVs, makes no network calls. The `design` scripts call Gemini, Atlas Cloud and MuAPI |
| taste skills | v2 in `.claude/skills/design-taste-frontend` (project); the family in `~/.claude/skills/`, linked from the owner's dotfiles | Leonxlnx, [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (named in the v2 `assets.mjs`) | None found in the installed copies. Its README notes that library photographs come from Lorem Picsum under the Unsplash licence, and that media found by `assets.mjs` keep their own licences | v2 `SKILL.md` and `README.md` in full, its scripts skimmed for network, browser and file writes; the other members' `SKILL.md` files for purpose and mandates |
| Archify | 3.2.0 in `.claude/skills/archify` (project), installed by the owner on 2026-10-31 from archify.si | tt-a1i, [tt-a1i/archify](https://github.com/tt-a1i/archify); NOTICE also credits Cocoon AI | Apache-2.0 (`LICENSE`, `NOTICE`); `LICENSE-MIT` covers parts derived from Cocoon AI | `SKILL.md` in full; `bin/` and `scripts/` skimmed for network, browser, process and file writes. Needs Node 18+, installs nothing. `finalize`, `browser-check` and `visual-check` launch the installed Chrome headless with a temporary profile; `preview` starts a local server; `open-artifact` opens the browser; the update check fetches `tt-a1i.github.io/archify/skill-updates/archify/stable.json` and caches it in `~/Library/Caches/archify-skill`. The delivered HTML is self-contained (checked on 3.2.0: no external resources, no network calls, `localStorage` only for theme and motion); its `.delivery.json` receipt holds absolute local paths |
| hallmark | v2.0.0 in `.claude/skills/hallmark` (project), installed by the owner on 2026-10-31 | "Hallmark contributors" (`LICENSE`); [Nutlope/hallmark](https://github.com/Nutlope/hallmark), named in `scripts/theme.mjs`; "Powered by Together AI" | MIT (`LICENSE`) | `SKILL.md` in full; every script skimmed for network, browser, install and file writes. No script installs packages. The render tier needs `puppeteer-core` and Chrome. `imagegen.mjs` calls `api.together.xyz` with `TOGETHER_API_KEY`; `theme.mjs photos --save` fetches from Wikimedia Commons; `install-hook.mjs` writes `.claude/settings.json` |

Family membership of the user-scope taste skills rests on a shared install time and shared
wording, not on a manifest. `hallmark` is a separate project, approved on its own (row below).

## Adding a skill

New skills are added as work needs them, for a specific use case. **Nothing is cloned,
downloaded or copied until the owner says yes.**

1. **Propose.** Name the use case and why no vendored skill covers it. Searching registries and
   reading their listings is fine. Offer two to four trusted candidates, each with repository,
   trust basis, licence and what it would add, and a recommendation listed first (`AGENTS.md`
   §4). Name better-trusted alternatives to any weaker candidate.
2. **Wait for the owner's yes.** Downloading a candidate to inspect it counts as downloading.
3. **Vendor.** Clone at a specific commit into the session scratchpad, read `SKILL.md` in full,
   scan the rest against the policy above, and copy it unmodified to
   `<owner>-<repository>/<upstream path>` with its licence, omitting JavaScript/TypeScript.
   If the scan finds something the owner did not see in step 1, stop and report it.
4. **Record.** Add the source row, omissions and anything rejected here; add the task row and
   any overrides to [`INDEX.md`](./INDEX.md).
5. Leave the change uncommitted for the owner's review.

## Updating

1. Read the upstream diff between the pinned commit and the new one in full.
2. Re-run the scan above on everything that changed.
3. Replace the vendored files, update the commit and date in the table, and adjust
   [`INDEX.md`](./INDEX.md) if a skill's scope or the overrides changed.
4. Confirm no `.js`, `.cjs`, `.mjs`, `.ts`, `.tsx` or `.jsx` file is vendored.
5. Leave the change uncommitted for the owner's review.
