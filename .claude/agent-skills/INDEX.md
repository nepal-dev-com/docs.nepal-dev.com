# Agent skills — index

The router for this repository's trusted skills
([ADR-0009](../../content/docs/documentation/adr/ADR-0009-trusted-agent-skills-are-vendored.mdx)).
Where each skill comes from and why it is trusted is in [`SOURCES.md`](./SOURCES.md).

**How to use this file**

1. Find the row for the task below.
2. Load **only** the one or two `SKILL.md` files it names, and only the supporting files the
   row or that `SKILL.md` points to. Never read the whole folder.
3. Apply the [overrides](#overrides): the general ones always, the per-skill ones for the skill
   you loaded.
4. Name the skill in your response, and report any step an override cut short
   (`AGENTS.md` §12.4).

**Precedence:** `AGENTS.md` and `content/docs/documentation/` (ADRs, design documents) are binding.
These skills are advisory. A skill never grants a permission the repository withholds
(`AGENTS.md` §12.1).

These skills are vendored here, not in `.claude/skills/`, so Claude Code does not auto-load
them. They are read through this index on purpose. When an installed plugin offers a skill with
the same name, for example `superpowers:brainstorming`, the pinned copy here wins.

Five skill sets are the exception: **impeccable**, **ui-ux-pro-max**, the **taste skills**,
**hallmark** and **Archify** are installed by the owner and approved for use here, without
being vendored. They are invoked as installed, with the Skill tool, and their overrides are in
[Approved installed skills](#approved-installed-skills).

Paths below are relative to this file.

## Which skill, when

### Process — they set the approach, so load them first

| Task | Load |
|---|---|
| Any new feature, route, section, layout or content convention: shaping the idea before the ADR | [brainstorming](./obra-superpowers/skills/brainstorming/SKILL.md) |
| Writing or revising an ADR or a design document | [documentation-and-adrs](./addyosmani-agent-skills/skills/documentation-and-adrs/SKILL.md) |
| Writing code or a docs page against a framework or package API (Next.js, Fumadocs, React, a documented package) | [source-driven-development](./addyosmani-agent-skills/skills/source-driven-development/SKILL.md) |
| A bug, failing build, failing type check or unexpected behaviour | [systematic-debugging](./obra-superpowers/skills/systematic-debugging/SKILL.md) |
| Implementing an approved ADR | [test-driven-development](./obra-superpowers/skills/test-driven-development/SKILL.md) |
| About to say work is done, fixed or passing | [verification-before-completion](./obra-superpowers/skills/verification-before-completion/SKILL.md) |
| Getting a finished change reviewed | [requesting-code-review](./obra-superpowers/skills/requesting-code-review/SKILL.md) |
| Responding to review feedback | [receiving-code-review](./obra-superpowers/skills/receiving-code-review/SKILL.md) |

### Writing

| Task | Load |
|---|---|
| Reader-facing prose: package and project pages, the home page, UI text, error messages | [writing-guidelines](./vercel-labs-agent-skills/skills/writing-guidelines/SKILL.md) + its rules snapshot [`command.md`](./vercel-labs-writing-guidelines/command.md) |
| Instructions an agent reads: `AGENTS.md`, this index, a skill, a prompt | [writing-for-agents](./mattpocock-skills/skills/productivity/writing-for-agents/SKILL.md) |

### UI and front end

| Task | Load |
|---|---|
| Shaping a new page, screen or flow before its ADR: the brief, its states, the app flow | `impeccable` → `shape` (installed) |
| Designing or building a visible page, layout or component (after its ADR and app flow are approved) | `impeccable` (installed): the build flow, then `craft-floor.md` before editing. Fallback when it is unavailable: [frontend-design](./anthropics-skills/skills/frontend-design/SKILL.md) |
| Refining existing UI: typography, layout, colour, copy, responsiveness, edge cases, motion | `impeccable` → `typeset`, `layout`, `colorize`, `clarify`, `adapt`, `harden`, `animate`, `polish`, `quieter`, `distill` (installed) |
| Recording the site's current visual system | `impeccable` → `document`, which writes the root `DESIGN.md` (installed) |
| Looking up a UX or accessibility rule, a palette, a font pairing, or Next.js / Tailwind UI guidance | `ui-ux-pro-max:ui-ux-pro-max` (installed): its `search.py` with `--stack nextjs` |
| Art direction for the home page or a showcase page (not documentation pages) | Decided in that page's ADR: it compares `impeccable`, `hallmark` and taste `design-taste-frontend` (project copy), and the owner picks one. None builds before then. `minimalist-ui` (installed) informs restraint |
| Reviewing UI for accessibility, interaction, forms, focus, motion and layout | `impeccable` → `audit` and `critique` (installed) + [web-design-guidelines](./vercel-labs-agent-skills/skills/web-design-guidelines/SKILL.md) with its rules snapshot [`command.md`](./vercel-labs-web-interface-guidelines/command.md) |
| Auditing an existing UI for generic, templated or "AI-made" design | taste skill `redesign-existing-projects` (installed), audit only; or `hallmark audit <path>` (installed, project copy) when the owner names hallmark |
| Writing or reviewing React components: server/client split, data fetching, re-renders | [react-best-practices](./vercel-labs-agent-skills/skills/react-best-practices/SKILL.md), then only the `rules/*.md` files that match |
| Slow page start, large client bundle, duplicate browser dependencies | [next-bundle-optimizer](./vercel-nextjs/skills/next-bundle-optimizer/SKILL.md) |

### Diagrams and flows

| Task | Load |
|---|---|
| **Any** diagram or flow: architecture, workflow, sequence, data flow, lifecycle, ERD, class, tree, timeline (always) | `archify` (installed, project copy in `.claude/skills/archify`), plus the Mermaid version the page keeps (`AGENTS.md` §8) |
| An app flow's screens as a low-fidelity wireframe: structure, hierarchy, navigation, click-through | [html-wireframe](./plannotator-effective-html/skills/html-wireframe/SKILL.md) |
| An app flow's screens as a working prototype: states, input, feedback, recovery | [html-prototype](./plannotator-effective-html/skills/html-prototype/SKILL.md) |

### Search (Algolia)

| Task | Load |
|---|---|
| Shaping the records `static.json` emits, or what fields reach the index | [algolia-data-modeling](./algolia-skills/skills/algolia-data-modeling/SKILL.md) |
| Index settings: searchable attributes, ranking, facets, typo tolerance, synonyms | [algolia-index-configuration](./algolia-skills/skills/algolia-index-configuration/SKILL.md) |
| Reviewing the existing search setup, or "search got worse" | [algolia-audit](./algolia-skills/skills/algolia-audit/SKILL.md), then the two above as it routes |

### Security

| Task | Load |
|---|---|
| A route handler, env var, secret, user input, third-party call or private-content decision (`AGENTS.md` §9) | [security-and-hardening](./addyosmani-agent-skills/skills/security-and-hardening/SKILL.md) |
| A full pre-deploy or pre-release audit | security-and-hardening + [`references/security-checklist.md`](./addyosmani-agent-skills/references/security-checklist.md), alongside `content/docs/documentation/security/checklist.mdx` |
| Adding or upgrading a dependency, or auditing the dependency tree | [supply-chain-risk-auditor](./trailofbits-skills/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md) |

No row fits? Use default behaviour under `AGENTS.md`. If a skill would serve the task better,
propose one to the owner, and ask before downloading or adding anything (`AGENTS.md` §12.2,
[`SOURCES.md` § Adding a skill](./SOURCES.md#adding-a-skill)). Built-in Claude Code skills are first-party and may
be used.

## Overrides

### General — apply to every skill

| A skill says… | Here |
|---|---|
| Write the spec or plan to its own folder (`docs/superpowers/specs/`, `docs/decisions/`, `plans/`, …) | Write it as an ADR and its design documents under `content/docs/documentation/` (ADR-0002) |
| Commit, push, open a PR, or create a branch or worktree | Don't. Leave the change in the working tree (`AGENTS.md` §3) |
| Proceed to implementation after the plan or design | Stop at `Status: Proposed` until the owner approves (`AGENTS.md` §12.3) |
| Install a package, a global CLI or another skill (`npx skills add`, `npx …`, `bunx …` setup) | Only with an approved ADR or the owner's yes (`AGENTS.md` §2, §12.2) |
| Run its bundled scripts (`.sh`, `.py`, `uv run …`) | Only with an approved ADR or the owner's yes |
| Provision an account, or write or use a secret | Never on the owner's behalf (`AGENTS.md` §9) |
| Fetch its rules from a URL at run time | Read the pinned local snapshot named in the row (ADR-0009) |
| Build, deploy or sync the search index to verify | Use `bunx next build`; never `bun run build` (`AGENTS.md` §5) |
| Use `npm`, `pnpm` or `yarn` commands | Use the Bun equivalents in `AGENTS.md` §5 |
| Add explanatory comments or section banners | Comments explain why only (`AGENTS.md` §7) |
| Hand off to a skill that is not in this folder | Not available. Do the step under `AGENTS.md`, or ask the owner |

### Per skill

| Skill | Override |
|---|---|
| brainstorming | The "design doc" is a Proposed ADR plus the design documents `AGENTS.md` §8 requires, and an app flow if the UI changes (ADR-0008). Its hard gate is the owner approving that ADR. After approval, do **not** invoke `writing-plans`: the ADR's *Implementation notes* are the plan, carried out in one pass (`AGENTS.md` §3). The visual companion is unavailable (its scripts are not vendored). |
| documentation-and-adrs | ADRs live in `content/docs/documentation/adr/`, from `_templates/adr.mdx`, numbered from `adr/index.mdx`. Its approval states, immutability and supersession follow ADR-0001. Its README and comment advice yields to `AGENTS.md` §5 commands and §7 comments. |
| source-driven-development | The primary source is what is installed: `node_modules/next/dist/docs/`, Fumadocs' source and types in `node_modules`, and a documented package's own source and manifest (`AGENTS.md` §4, §6.2). Web documentation is a fallback, cited, and pinned to the installed version. |
| systematic-debugging | `find-polluter.sh` runs only with the owner's yes. `condition-based-waiting-example.ts` is not vendored; the technique is in `condition-based-waiting.md`. A bug fix starts with a failing test (ADR-0007). |
| test-driven-development | Examples use `npm test`. No test runner is installed yet; use the one ADR-0007 approves, through Bun. Until then, record the manual check that stands in for each test and say so. |
| verification-before-completion | The verification set is `bun run lint`, `bun run types:check` and `bunx next build` (`AGENTS.md` §5). Report a failing check with its output; never claim success without it. |
| requesting-code-review | Work is uncommitted, so there are no SHAs. Review the working tree: `git diff`, plus `git status --porcelain` for untracked files. Fill `code-reviewer.md` with that diff and the ADR as the requirements. |
| receiving-code-review | Feedback that would change an approved ADR's decision needs a superseding ADR, not an edit. |
| writing-guidelines | Read `./vercel-labs-writing-guidelines/command.md` instead of fetching it. Skip the Vercel-specific rules: `meta.contentType`, `meta.category` and `meta.navLabel`, dashboard deep links, product links, model strings, ACME screenshots, `vercel/examples` and the PR process. Where a rule contradicts a convention this repository already uses (hard-wrapped Markdown, em dashes in titles, `<slug>` placeholders in the Documentation project), keep the repository's convention. Adopting the rule instead, or an MDX component such as `<Steps/>`, is a cross-cutting convention change and needs an ADR (`AGENTS.md` §2, §8). |
| writing-for-agents | `agents/openai.yaml` is for another agent runtime; ignore it. |
| html-wireframe, html-prototype | Used for app flows (ADR-0008), with the page keeping its Mermaid wireframes. The look comes from this site's prototype theme once ADR-0011 defines it: that is "the project's established design language" in html-prototype's order of authority, so don't invent a per-prototype direction. `design-artifact` is not vendored; skip the steps that read it. *Verify and hand off* opens a browser: don't, unless the owner asks; list the checks left unverified instead, as html-prototype allows. Deliver the file where ADR-0011 says, never into `content/docs/`, and until it is approved keep it in `.prototypes/` (gitignored) and give the owner the path. `agents/openai.yaml` is for another agent runtime; ignore it. |
| frontend-design | Applies only after the UI change's ADR and app flow are approved (ADR-0008). New fonts, icon sets or libraries are dependencies and need an ADR. Use the existing Tailwind 4 and Fumadocs UI setup. |
| web-design-guidelines | Read `./vercel-labs-web-interface-guidelines/command.md` instead of fetching it. Findings on an unapproved change go into its app flow, not into code. Its *Content & Copy* rules (Title Case headings) contradict writing-guidelines (sentence case). No convention is decided yet, so raise it with the owner (`AGENTS.md` §4). |
| react-best-practices | Load `SKILL.md`, then only the `rules/*.md` files whose topic matches. `AGENTS.md` and `README.md` inside that skill are the compiled full rule set and upstream notes; don't load them. |
| next-bundle-optimizer | Audit mode by default. Use `bunx next …` and `bunx node …` for `pnpm exec`. Write exports to the session scratchpad, not `/tmp` or the repository. `next analyze --output` builds but does not publish; `bun run build` does, so never use it. The linked companion skills (`next-cache-components-optimizer`, `next-partial-prefetching-optimizer`, `next-dev-loop`) are not vendored; don't install them. Fix mode needs the owner's request or an approved ADR. |
| algolia-data-modeling | This index serves documentation pages, not a catalogue: skip the ecommerce, variant and merchandising sections. The "index contract" is a design document in `content/docs/documentation/` (architecture, with the DFD and API pages), written with the ADR that changes the records, not `algolia/index-contract.md`. A record field reaches every reader of the search-only key (`AGENTS.md` §9). |
| algolia-index-configuration | Recommends; does not write. A settings change to the live index is publishing and needs the owner's yes. |
| algolia-audit | Live reads and writes go through `algolia-cli` or `algolia-mcp`, which are not vendored: ask the owner first. Never use `ALGOLIA_WRITE_KEY`. `algolia-events-insights` and `algolia-release-qa` are not vendored. Report findings to the owner in the `AGENTS.md` §9 format, not into published pages. |
| security-and-hardening | Findings go to the owner, not into the Documentation project, until fixed (`AGENTS.md` §9). Whether a page or route is public is the owner's decision (`AGENTS.md` §4). |
| supply-chain-risk-auditor | Its scripts run only with the owner's yes. They call registry, advisory and GitHub APIs and read `gh auth token`. `bun.lock` is not parsed, so only `package.json`'s direct dependencies are assessed, at their pinned or latest versions, with no transitive sweep; say so in the report. Output goes to the session scratchpad, and the report to the owner. |

## Approved installed skills

The owner approved these on 2026-10-31 for UI and UX work ("use them whenever required").
They are **not vendored or pinned**: they update with the owner's installs, so re-check this
table when one is updated. **When a skill is installed both in this project
(`.claude/skills/`) and at user level, use the project copy.** Where they come from is in
[`SOURCES.md`](./SOURCES.md#approved-installed-skills).

| Set | Installed as | Use here | Not routed (don't use without asking) |
|---|---|---|---|
| impeccable | Plugin `impeccable@impeccable` (user scope) and the user skill `~/.claude/skills/impeccable` | Primary for UI work: `shape`, the build flow, refinement commands, `audit`, `critique`, `document`, the design hook | `live`, `generate`, `overdrive`, `onboard`; comp-first builds (no image generation here) |
| ui-ux-pro-max | Plugin `ui-ux-pro-max@ui-ux-pro-max-skill` (project scope, `.claude/settings.json`) | `ui-ux-pro-max:ui-ux-pro-max` search and its reference rules; `ui-ux-pro-max:design-system` references for token structure | `design`, `brand`, `banner-design`, `slides`, `ui-styling` |
| taste skills (Leonxlnx/taste-skill) | v2 in this project's `.claude/skills/design-taste-frontend`; the rest in `~/.claude/skills/` | `design-taste-frontend` (the project copy), `minimalist-ui`, `redesign-existing-projects` | `design-taste-frontend-v1`, `gpt-taste`, `high-end-visual-design`, `industrial-brutalist-ui`, `stitch-design-taste`, `image-to-code`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit`, `full-output-enforcement` |
| Archify (tt-a1i/archify) | v3.2.0, project copy in `.claude/skills/archify` | Every diagram and flow: `deliver` + `check` | `finalize`, `browser-check`, `visual-check`, `preview`, `open-artifact`, explainer pages, the update snooze/ignore commands |
| hallmark (Nutlope/hallmark) | v2.0.0 in this project's `.claude/skills/hallmark`. The older v1.1.0 in `~/.claude/skills/hallmark` is not used here | Its Floor and gates as a design checklist; `audit` and `redesign` reports when the owner names hallmark; a home-page candidate in that page's ADR | Building pages, `theme.mjs scaffold`, `imagegen.mjs`, `install.mjs`, `install-hook.mjs`, the lock-the-system `design.md` |

### Overrides for the approved installed skills

The [general overrides](#general--apply-to-every-skill) apply to these too. In particular:
code waits for an approved ADR and app flow (ADR-0001, ADR-0008), and a new dependency, font,
icon set or image source needs its own ADR.

**Scripts.** Running a skill's local, read-only analysis is covered by the owner's approval:
`impeccable context`, `impeccable detect` and the design hook; `ui-ux-pro-max` `search.py`
without `--persist`; taste-skill `lint.mjs`; hallmark's static `sloplint.mjs <files>` (without
`--render` or `--before`). Anything else asks first: a script that writes
files, calls the network, launches a browser or server, or writes outside the repository.

| Skill | Override |
|---|---|
| impeccable | `PRODUCT.md`, `DESIGN.md` and `.impeccable/` live at the repository root by the owner's decision (`AGENTS.md` §8); they are not published, and decisions still go in ADRs. "Finish the job" applies inside an approved ADR's scope, not before it. A `shape` brief becomes the ADR's app flow in `content/docs/documentation/app-flow/`, not a separate file. Documentation pages are the **Read** mode; the home page's mode is the owner's call, recorded in its ADR. `typeset` and `colorize` recommend fonts and colours, but adding a font file or a font service is a dependency. `live` injects a script into page source, runs a local helper and may edit the CSP, so it runs only with the owner's yes, and its injection is removed before work ends. If the engine binary is missing, ask before the launcher downloads it. The skill copy (engine 0.1.18) and the plugin copy that runs the hook (engine 0.1.15) can drift; `/impeccable doctor` reports it. |
| ui-ux-pro-max | Never use `--persist`: its `design-system/<slug>/` files sit outside the allowed locations, and the visual system belongs in `DESIGN.md`. Pass `--stack nextjs` or `--stack html-tailwind`. Its shadcn guidance assumes Radix components; Fumadocs UI has its own, so check against the installed Fumadocs source. Google Fonts pairings it suggests are proposals for an ADR. Keep private project names out of search queries. Never edit the plugin's files, even when a script fails. |
| design-taste-frontend (project copy) | For the home page and showcase surfaces only; documentation pages follow impeccable's Read mode. `draw.mjs` writes `.taste-skill/` and `~/.taste-skill/history.json`, `assets.mjs` downloads third-party media into `assets/`, and `inspect.mjs` and `scenes.mjs` launch headless Chrome: each needs the owner's yes. Its required motion layer, picture quota, fonts and icon libraries are ADR decisions, not defaults. "Decide instead of asking" yields to `AGENTS.md` §4. Some files its `SKILL.md` names (`library/scenes.json`, scene demos) are not in the installed copy. |
| minimalist-ui | Use its restraint, hierarchy and spacing; its fonts (Geist, Inter), icon sets and picsum placeholder images are proposals for an ADR. |
| redesign-existing-projects | Audit and report only; font and icon swaps it recommends are ADR decisions. |
| archify | Always used for diagrams and flows; the page keeps a Mermaid version alongside. Deliver without the browser gate (owner's decision): `deliver <type> <candidate.json> <output.html> --quality showcase --json`, then `check <output.html> --require-provenance`. `finalize`, `browser-check` and `visual-check` launch headless Chrome, so they run only when the owner asks, for a broken diagram; say "automated checks passed, no browser check" when reporting. The update check inside `deliver` fetches a manifest from tt-a1i.github.io and caches it in `~/Library/Caches/archify-skill`; it is allowed, but an upgrade needs the owner's yes. Working folders go in `.archify/` (gitignored). Its HTML stays out of `content/docs/` and `public/` until the display ADR (ADR-0011) is approved; give the owner the path. Never write the `[archify explainer: …]` line into a global rules file such as `~/.claude/CLAUDE.md`, and don't make explainer pages unless asked. Don't run `doctor` or `demo` unasked. |
| hallmark | It may write only `.hallmark/` at the repository root (its preflight cache and build log), by the owner's decision. No scaffold `tokens.css` or `base.css`, and no stamp at the top of `src/app/global.css`: tokens stay in `global.css`, changed only through an ADR. Never `design.md` / `DESIGN.md`: it reads impeccable's `DESIGN.md` as the locked system. So hallmark advises and audits, and impeccable writes the code. Its own scope rule holds too: never on an existing design unless the owner names hallmark. The render tier (`sloplint --render`, `capture.mjs`, `picture.mjs`) launches Chrome through `puppeteer-core`; ask before each run, and `puppeteer-core` is a dependency: an ADR and the owner's yes before installing it. `theme.mjs photos --save` downloads from Wikimedia Commons, and `imagegen.mjs` calls Together AI with `TOGETHER_API_KEY`: each needs the owner's yes, and generated or found images are an ADR question. `install-hook.mjs` would write a hook into `.claude/settings.json`; that is the owner's call. Its "go ahead and I will infer" yields to `AGENTS.md` §4: ask with options. Floor rule 16's "run sloplint before handing back" means the static run; say so if the render tier did not run. |
