---
name: Puncoz Docs
description: Site visual system. Graphite and teal, a turning map of every release, one search everywhere.
colors:
  graphite-ground: "#0a0c10"
  graphite-ground-2: "#0f1218"
  graphite-panel: "#141821"
  graphite-panel-2: "#1a1f2a"
  graphite-line: "#232937"
  graphite-line-2: "#323a4c"
  frost-ink: "#e9ecf2"
  steel-muted: "#9ba4b6"
  steel-faint: "#7f889e"
  signal-teal: "#3ddbb6"
  signal-teal-ink: "#04120e"
  signal-teal-soft: "rgb(61 219 182 / 0.13)"
  eco-npm: "#ff6f61"
  eco-composer: "#a394ff"
  eco-pypi: "#ffd166"
  eco-go: "#56cdf2"
  eco-cargo: "#f0a86a"
  star: "#ffe2a8"
  night: "#1b2130"
  shadow: "rgb(0 0 0 / 0.6)"
  shadow-near: "rgb(0 0 0 / 0.12)"
  graphite-ground-light: "#f6f7f9"
  graphite-ground-2-light: "#eef0f4"
  graphite-panel-light: "#ffffff"
  graphite-panel-2-light: "#f1f3f7"
  graphite-line-light: "#dde1e9"
  graphite-line-2-light: "#c4cbd8"
  frost-ink-light: "#0d1016"
  steel-muted-light: "#4f586b"
  steel-faint-light: "#5f6880"
  signal-teal-light: "#077a63"
  signal-teal-ink-light: "#ffffff"
  signal-teal-soft-light: "rgb(7 122 99 / 0.1)"
  eco-npm-light: "#d4382b"
  eco-composer-light: "#5b48e0"
  eco-pypi-light: "#9a6d00"
  eco-go-light: "#0a7fa6"
  eco-cargo-light: "#a8541c"
  star-light: "#e08a00"
  night-light: "#dfe3ea"
  shadow-light: "rgb(13 16 22 / 0.12)"
  shadow-near-light: "rgb(13 16 22 / 0.08)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 1.4rem + 3.4vw, 4.4rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 650
    letterSpacing: "-0.02em"
  wordmark:
    fontFamily: "Bricolage Grotesque, Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.95rem + 0.3vw, 1.15rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  label:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  search-input:
    fontFamily: "Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "16px"
    fontWeight: 500
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  data-sm:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  hairline: "2px"
  nested-xs: "5px"
  nested-sm: "7px"
  nested-md: "9px"
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  full: "50%"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section: "112px"
components:
  search-bar:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    typography: "{typography.search-input}"
    rounded: "{rounded.xl}"
    padding: "8px 14px 8px 18px"
    height: "60px"
  kbd:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.steel-muted}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.xs}"
    padding: "2px 7px"
  button-ghost:
    textColor: "{colors.steel-muted}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  button-ghost-hover:
    textColor: "{colors.frost-ink}"
  window:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.steel-muted}"
    rounded: "{rounded.xl}"
  assist-panel:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.xl}"
    padding: "28px"
  planet-card:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    typography: "{typography.data}"
    rounded: "{rounded.xl}"
    padding: "20px 22px 22px"
  private-card:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.xl}"
    padding: "18px"
  planet-header:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.xl}"
    padding: "24px 26px"
  version-notice:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  horizon-surface:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.steel-muted}"
    padding: "10px 16px 40px"
  orbit-station:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "0 4px 5px"
  constellation:
    textColor: "{colors.steel-muted}"
    typography: "{typography.body-sm}"
    padding: "2px 10px 11px"
  trajectory:
    textColor: "{colors.steel-muted}"
    typography: "{typography.body-sm}"
    width: "268px"
  theme-switch:
    textColor: "{colors.signal-teal}"
    rounded: "{rounded.sm}"
    width: "40px"
    height: "36px"
  orbit-tooltip:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    width: "180px"
---

# Design System: Puncoz Docs

**Scope.** The whole site: the home page, every documentation page and the 404. The tokens live on `:root` (light) and `.dark` (dark) in `src/app/global.css`, which also maps Fumadocs' own `--color-fd-*` colours onto them; the fonts are loaded once in `src/app/layout.tsx`; the shared header, theme switch, planet header, notices, the sidebar's planet row and orbit stations, the trajectory and the Horizon footer are styled in `src/app/site.css`; the home page's sections and the 404 in `src/app/(home)/home.css`. The planet and moon marks are drawn by `src/components/planet.tsx`. Docs pages use the Fumadocs notebook layout under that header. The reasons are in ADR-0014 to ADR-0019 (`content/docs/maintain/adr/`); this file only records how the built site looks.

## Overview

**Creative North Star: "One Solar System"**

The site is one small solar system, calm graphite space with one moving part. The star is the maker, Puncoz Nepal. Each ecosystem is an orbit; a package is a solid planet in its ecosystem's colour, its night side shaded away from the star; a project is a ringed planet. Each documented version line is a moon: full for the latest release, a crescent for an older one, a dashed new moon for `dev`. A planet's day side is Use, its night side Maintain. The home page's hero is the system itself, turning slowly beside the headline and the large search button; every later surface (cards, the planet header, the sidebar, the notices, the footer, the 404) reuses the same marks without explaining them again.

The surface is cool, technical and quiet: near-black graphite (dark is the default theme) or cool paper in light, hairline borders, one teal accent, a warm star, and colour reserved for the ecosystems. Density is moderate: generous section gaps, tight facts inside a card. Depth is soft and rare; only things that float (the search button, windows, the tooltip) lift off the ground.

**Key Characteristics:**
- Graphite neutrals with a single signal-teal accent and a warm star; ecosystem hues mark shapes, never text.
- Three faces with fixed jobs: Bricolage Grotesque for display, Onest for reading and controls, JetBrains Mono for data only.
- One metaphor carrying real data: planets are entries, moons are version lines, sides are tracks.
- One authored motion moment, the turning system; everything else is a short, single response.
- Every state readable without scripts and without motion.

## Colors

Cool graphite neutrals in a nine-step stack, one teal signal, a warm star, an unlit night face, and a five-hue ecosystem set that only ever fills planets, moons and strokes. Dark values are the frontmatter's plain keys; light values carry the `-light` suffix.

### Primary
- **Signal Teal** (`signal-teal` / `signal-teal-light`): the one accent. Focus outlines, the caret, text selection (with `signal-teal-ink` on top), the search button's focus border and halo, the latest release's full moon, the current page's planet dot in the sidebar and contents, the theme switch's lit face, the Use buttons, the footer horizon's atmosphere rim, the terminal prompt and cursor, and forward links.
- **Teal Wash** (`signal-teal-soft` / `signal-teal-soft-light`): the focus halo around the search button.

### Secondary
- **Star** (`star` / `star-light`, `--home-star`): the star in the hero, the footer's horizon and the 404, its glow (`--home-star-glow`), the sun in the theme switch, the day side's sun, the brand mark's light and the closing line's underline. Never text.
- **Night** (`night` / `night-light`, `--home-night`): a planet's unlit face: the theme switch's planet, private planets, older-release crescents, the terminator planet.
- **Ecosystem set** (`eco-npm`, `eco-composer`, `eco-pypi`, `eco-go`, `eco-cargo` and their `-light` pairs): one hue per ecosystem, for planets, their moons on the hero and the ring of a card's sky wash. The "other" ecosystem reuses Steel Muted; projects reuse Frost Ink and are ringed. Against the page ground each hue measures 4.2:1 or more.

### Neutral
- **Graphite Ground** (`graphite-ground`): the page.
- **Graphite Ground 2** (`graphite-ground-2`): recessed fills: a card's sky, private cards, keyboard keys, the selected terminal tab, the assistant panel, the night side, the sidebar's planet chip and day/night track, version notices, the footer's surface.
- **Graphite Panel** (`graphite-panel`): raised surfaces: the search button, cards, the planet header, windows, the tooltip, the day side, the selected side in the sidebar switch.
- **Graphite Panel 2** (`graphite-panel-2`): hover fills on links in lists.
- **Graphite Line / Line 2** (`graphite-line`, `graphite-line-2`): hairline borders; Line 2 is the stronger border on floating panels and dashed private cards, the hover border, orbits and the moon track.
- **Frost Ink** (`frost-ink`): primary text.
- **Steel Muted** (`steel-muted`): secondary text, descriptions, nav links at rest, older moons, unreleased moon strokes.
- **Steel Faint** (`steel-faint`): hints, placeholder text, fact-sheet labels, moon labels' versions, terminal tabs at rest, asteroids and stars.
- **Shadow** (`shadow`) and **Shadow near** (`shadow-near`): see Elevation & Depth.

Measured: every text colour is 4.5:1 or more against Graphite Ground and Graphite Panel in both themes; the tightest pair, Steel Faint on Graphite Panel, is 5.0:1 in dark and 5.6:1 in light. The star and night tokens are never used for text.

### Named Rules
**The One Signal Rule.** Teal is the only accent. If something needs to stand out and it is not focus, the latest release, the current page, the lit face or a forward link, it gets weight or size, not colour. The star is light, not an accent: it lights things and is never a control's colour.

**The Shapes, Not Words Rule.** Ecosystem hues fill planets, moons and strokes. Text beside them is always Frost Ink, Steel Muted or Steel Faint, and every coloured mark has a text equivalent (the planet's name and kind, a legend label, or the card that restates the system).

**The Token-Only Surface Rule.** The browser's own surfaces (selection, caret, scrollbar, focus ring), the SVG marks and the canvas read their colours from the tokens; the canvas re-reads them when the theme changes.

## Typography

**Display Font:** Bricolage Grotesque, optical-size axis on (falls back to Onest, then the system sans)
**Body Font:** Onest (with the system sans)
**Data Font:** JetBrains Mono (with `ui-monospace`, SF Mono, Menlo), tabular numerals

**Character:** a characterful grotesque with tight tracking for headings, a plain, open sans for reading, and a coding mono that appears only where the content is literally data.

### Hierarchy
- **Display** (700, fluid 2.4rem to 4.4rem, line-height 1, -0.04em): the hero headline, at most 12 characters wide, its second half in Steel Muted; the 404 heading (2rem to 3.2rem).
- **Closing** (650, fluid 1.7rem to 3rem, 1.08, -0.035em): the footer's closing line, centred, 22 characters wide at most.
- **Headline** (650, fluid 1.8rem to 2.6rem, 1.08, -0.03em): section headings, at most 18 characters wide; Private projects at 1.6rem to 2.2rem.
- **Side title** (650, 1.3rem, -0.02em): Use and Maintain in Two sides; the assistant panel's heading at 1.35rem.
- **Wordmark** (600, 17px, -0.01em): the brand name in the header.
- **Lead** (400, fluid 1rem to 1.15rem): the hero subline, at most 44 characters wide.
- **Body** (400, 16px, 1.6): base text; section paragraphs cap at 46 characters.
- **Body small** (400, 14 to 14.5px): card and private descriptions, side lists, version notices, header nav.
- **Search placeholder** (400, 17px; 16px under 860px): the search button's text.
- **Caption** (400, 13 to 13.5px): kinds, fact-sheet labels, card links, legends, footer links.
- **Data** (500, 20px, -0.02em): a card's name; 16px on private names; 15px in moon rows; 14.5px in the sidebar chip; 14px in the footer and tooltip; 1.6 to 2.3rem in the planet header.
- **Data small** (400 to 500, 10.5 to 12.5px): fact-sheet values, moon labels in drawings, moon names and versions, terminal tabs, keyboard keys, the window chrome caption, the private meta line.

### Named Rules
**The Data Voice Rule.** JetBrains Mono is for package names, versions, URLs, commands, code and counts, nothing else. Headings, buttons with words on them and prose stay in Onest or Bricolage.

**The Tight Display Rule.** Display and headline faces track negative (-0.04em to -0.01em, never tighter than -0.04em) and balance their lines; text faces keep default tracking.

## Layout

A single centred column: 1180px maximum, 24px side padding. The hero fills most of the first screen (up to 860px, 94% of the small viewport) with the system as a full-bleed canvas: on desktop the text column (headline, subline, a 520px search button and the legend) sits on the left and the star at 70% of the width; at 860px and below the system takes the top 310px and the text follows below it. A hairline closes the hero.

The cards follow 96px below (64px on phones), in a grid of 330px minimum columns with 20px gaps, with no heading on screen. The asteroid belt sits 96px below the cards, then the Private projects head and its 260px-minimum grid. Sections below sit 112px apart (88px under 860px), each opening with a head row: the heading left, a short paragraph right, 32px above the content. Two sides is a 1fr · 120px · 1fr band; Every moon is rows with a 150px name column; Read it anywhere is a 1:1 split. The Horizon footer sits 140px below the last section.

At 860px and below every multi-column block becomes one column, the header nav, the search key hint and the legend are hidden, the terminator column drops out and moon-row names stack above their moons.

## Elevation & Depth

Flat by default, with soft drop shadows only on surfaces that float over the system or frame a window. Every far shadow uses the Shadow token, a large blur and a negative spread. The sticky header is the one translucent surface: the page ground at 80% with a saturating 12px backdrop blur, gaining a hairline once the page scrolls.

### Shadow Vocabulary
- **Search lift** (`0 22px 60px -22px shadow, 0 2px 6px shadow-near`): the search button at rest.
- **Search focus** (`0 24px 70px -20px shadow, 0 0 0 4px teal wash`): the search button on keyboard focus.
- **Window** (`0 30px 80px -30px shadow`): the terminal window.
- **Tooltip** (`0 18px 40px -16px shadow`): the system's tooltip.
- **Raised side** (`0 1px 4px shadow-near`): the selected side in the sidebar's sun and moon switch.
- **Glow** (`0 0 0 3px` teal at 22%): the current page's planet on its station's arc; the trajectory's probe carries the same glow drawn in SVG.
- **Side tip** (`0 4px 12px shadow`): the sun and moon buttons' tooltip.

### Named Rules
**The Float-Only Rule.** A surface gets a shadow only if it sits over something or frames a window. Cards lift 2px on hover by transform, not by shadow.

## Shapes

Gently rounded rectangles in a short ladder: 6px for keys, terminal tabs and focus outlines; 7px for the selected side inside the 10px sidebar track and for its tooltip; 8px for small buttons, links and sidebar rows; 10px for the tooltip, the planet chip, notices and a station's header; 12px for the no-script link and orbit stations; 14px for the search button, cards, private cards, the planet header, Two sides, windows and the assistant panel. Circles are reserved for meaning: planets, moons, the star, a page's moon dot, the trajectory's dots and probe, the brand mark and the window chrome's three dots.

Borders are 1px hairlines. Line style carries meaning: **dashed** marks the unreleased `dev` line (its orbit and its new moon), on cards and orbits private projects, and the unread stretch of the trajectory; a **ring** marks a project; a **crescent** marks an older release.

The brand mark is a ringed planet in Frost Ink with a teal body and a small star-coloured light: the system in miniature.

### Named Rules
**The Mark Means Rule.** A ring means project, a full moon the latest release, a crescent an older release, a dashed new moon `dev`, a lock private. Never use any of them for decoration.

## Components

### Search button (signature control)
- **Character:** the one large, confident control, shaped like a field. It is a button: click, Enter or Space opens the site's Fumadocs search dialog, as `⌘K` does on every page. It also opens the 404.
- **Shape and fill:** Graphite Panel, 14px corners, Line 2 border, Search lift shadow, 60px tall (56px under 860px), a muted search icon, "Search packages, projects and pages" in Steel Faint, and a `⌘K` key (hidden under 860px).
- **Hover:** the border warms toward teal and the button rises 1px. **Focus:** teal border and the Teal Wash halo.
- **Search dialog:** Fumadocs' own, coloured by the site tokens.

### The system (hero canvas)
- The star: a 9px star-coloured disc with a soft glow, "Puncoz Nepal" in data under it. Orbits are 1px ellipses tilted to 0.36 of their width in Line 2.
- Packages are 7px discs in their ecosystem colour with the half facing away from the star shaded; projects are 6px Graphite Ground discs with an ecosystem stroke and a tilted ring. Every planet is labelled in 12px data, brighter in front. Moons circle each planet on faint orbits: solid for released lines (older ones dimmer), dashed and hollow for `dev`.
- Pointing at a planet slows the system to 15% and shows the tooltip (Graphite Panel, Line 2 border, 10px corners: name, description, kind · latest · "click to open"); clicking opens the overview.
- The legend under the search button: package, project, moon = version, dashed = unreleased, each with its drawn mark.

### Planet card
- Graphite Panel, hairline border, 14px corners. A 168px sky on Graphite Ground 2 with a wash of the ecosystem colour from the top right, drawing the planet with one tilted orbit per line and its labelled moon. Below, 20px by 22px: the name in Data (the whole card is its link), the kind with its planet mark, the description, a fact sheet (Latest, In development, Older; labels in Steel Faint, values in data small) and the links: Use → in teal, Maintain and Demo as hairline buttons.
- Hover: the border tints with the ecosystem colour, the card rises 2px and the moons turn 8°.

### Private projects
- An asteroid belt (a seeded scatter of Steel Faint dots around a hairline) divides them from the cards. Each private card is Graphite Ground 2 with a dashed Line 2 border: a 56px night planet on a dashed orbit, a crescent of light; the name in data with a 13px lock (read as "private"); a description; a data-small meta line (client or internal · tracks).
- Empty: a dashed empty orbit with a dot, then "No private projects in orbit yet." and one muted line, in a dashed box.

### Two sides of every planet
- A band with a hairline border and 14px corners: the day side on Graphite Panel (title with a star-coloured sun), the night side on Graphite Ground 2 (title with a muted moon), each listing real pages; between them a 96px planet split by its terminator, half in the entry's ecosystem colour, half Night, on a ground split the same way.

### Every moon, released or not
- Rows separated by hairlines: the entry's name in data, then its moons on a Line 2 track, oldest first, each a 28px phase mark with its name (teal for the latest) and version in data small, linking to that line. A legend names the three phases.

### Windows and the assistant panel
- **Terminal:** Graphite Panel, Line 2 border, 14px corners, Window shadow; chrome with three dots and tabs (`page.md`, `llms.txt`, `Accept`); 13.5px data, teal prompt, a blinking teal block cursor; a tab types its command once.
- **Assistant panel:** flat on Graphite Ground 2, hairline border, 14px corners, 28px padding, with Fumadocs' own Copy Markdown button and Open menu and a teal "See it on a page" link.

### Buttons
- **Ghost:** 14px Onest, Steel Muted, hairline border, 8px corners, 6px by 10px, with an optional 16px stroked icon. Hover: Frost Ink and Line 2.
- **Theme switch (orrery):** a 40 by 36px ghost holding a 32px drawing: a tilted orbit in Line 2, a star-coloured sun with rays on it, and a planet whose lit face is teal over a Night disc. In light the sun stands front-left and the face is fully lit; in dark the sun moves behind, top-right, at 85% size, and a mask leaves a teal crescent. Both move over 0.5s with the site's ease, instantly under reduced motion. Its tooltip, Graphite Panel with a Line 2 border, repeats its name in short ("Night side · switch to day").

### Planet header
- Opens every overview: Graphite Panel, hairline border, 14px corners, a wash of the ecosystem colour from the right. Text on the left (kind with its mark, the name in Data at 1.6 to 2.3rem, the description, the fact sheet, Use → in teal and hairline Maintain, Registry ↗, Repository ↗); on the right a 280px drawing of the planet and its labelled moons. One column under 720px.

### Docs pages
- The Fumadocs notebook layout below the shared header, coloured by the site tokens. Headings h1 to h3 use the Display face at -0.02em; body, sidebar and contents keep the Text face, code the Data face. The sidebar sits on Graphite Panel.
- The sidebar opens with the **planet row**: the **planet chip** (planet mark, name in data, kind) linking to the overview, then two 32px icon buttons in a 10px Graphite Ground 2 track, a drawn **sun** for Use and a **moon** for Maintain (the selected one raised on Graphite Panel, its sun star-coloured; a small tooltip names each). On Use, the **moon picker** follows: Fumadocs' version menu with each line's phase mark as its icon.
- **Orbit stations.** Each folder is a Graphite Panel card with a hairline border and 12px corners; the station holding the current page is open and its border takes 45% of the ecosystem colour, the others are closed. Its header: an 18px orbit glyph (a tilted ring, a faint core and a planet that fills with the ecosystem colour in the current station), the name in 13.5px Text 500, a page count in an 11.5px Data pill, the chevron. Its pages are 13.5px Text rows, 30px in from the left, each with a 7px hollow moon dot on one hairline arc that bows outward. The current page is a 10px teal planet with its glow, its row tinted with 10% of the ecosystem colour, in Frost Ink 500. A nested folder is a smaller station without a card; a dotted rule carries a separator's label.
- **The ADR constellation.** A folder named `adr` shows, inside its open station, a grid of 24px cells, one per ADR, each holding a 12px moon phased by status: full teal approved, dashed new moon proposed, crescent superseded, a faint ring rejected or unknown. The current ADR is a 12px teal planet ringed in the panel colour and then the ecosystem colour. Under it: a two-line readout (the number in 12.5px Data, Frost Ink; the title in 12.5px Text, muted), previous and next in 12.5px Data with 13px arrows, "All N decisions" in teal, and an 11px legend with 10px moons.
- **"On this page" is a trajectory.** A header row ("On this page" in 13px Text 500, the minutes left in 12px Data, tabular). Below, the headings in 13px Text, indented by depth (6, 18 and 26px dot offsets), with one curved path through a 6px dot each: the stretch read solid teal (1.6px), the stretch ahead a dashed Line 2 hairline with hollow dots. A 12px probe, a teal planet with a glow and a shaded night side, rides the path at the reading position. "Back to top ↑" in 12.5px under the list once the reader passes the first heading. On phones the bar under the header shows a 20px progress ring with the probe on it, the current heading and the minutes left.
- **Version line:** on the latest line, a 14px full moon and "Documents ‹name› ‹version›" in muted 14px. **Notice:** on `dev` and older lines, a Graphite Ground 2 box with a Line 2 border and 10px corners, the line's 22px moon, a bold lead ("In development." or "Older version."), the version and a teal link to the latest line.

### Navigation
- **Header:** one header on every page. Sticky, 60px, translucent; the brand mark and wordmark left, 14px muted nav links, a spacer, then on docs pages a 240px search button with a ⌘K key, a ghost GitHub button and the theme switch. Under 860px the nav, labels and key hide, search and GitHub become 36px icon buttons, and docs pages add a menu button.
- **Horizon footer:** on the home page and the 404, the closing line ("Everything here orbits one maker: Puncoz Nepal.", the name underlined in the star colour, linking to puncoz.com), then a 170 to 260px scene: faint stars, the star rising with its glow behind the curved edge of a planet whose ground fades from Graphite Panel to Graphite Ground 2, with a thin teal atmosphere rim. Then the surface, on Graphite Ground 2: one link per public planet (its mark and name in data, teal on hover), a row of Search ⌘K, `llms.txt`, `llms-full.txt`, GitHub and "Back to orbit ↑" in muted 14px, and the credit in Steel Faint. Docs pages show only the surface, below a hairline, across the full width, with "Back to top".

### The 404
- "This page drifted out of orbit.": a 420px drawing of a planet that has left its dashed orbit around the star, the Display heading, one muted line, the search button and a teal "Back to the system →", under the home page's header and above the full footer.

### Motion
- **The system** is the one authored moment: the inner orbit turns once in about 90s, outer ones slower; moons circle their planets; it slows to 15% under the pointer and pauses when off-screen or in a hidden tab.
- Supporting motion is short and single: the terminal and assistant panel rise 18px and un-blur over 0.8s once, each terminal tab types once, cards rise 2px and turn their moons on hover, the theme switch's sun and shadow move. One ease throughout, an exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`), animating transform, opacity, blur or canvas only.
- Under reduced motion the system is drawn once and redraws only on change, the terminal does not type, the cursor does not blink, the theme switch changes instantly, Back to orbit jumps, and nothing enters or turns.
- Without scripts every section is visible, the canvas is absent, and the search button is replaced by a link to the cards on a Graphite Panel with 12px corners.

### Named Rules
**The One Orbit Rule.** The system is the only continuous motion. New motion is a single, short response to arrival or input, never a second loop.

**The Visible-By-Default Rule.** Content is hidden for an entrance only after scripts run; with no scripts or with reduced motion, everything is already in place.

## Do's and Don'ts

### Do:
- **Do** take every colour from the `--home-*` tokens, in both themes, including canvas strokes, SVG marks, selection, caret, scrollbar and focus.
- **Do** keep text on Frost Ink, Steel Muted or Steel Faint; check new pairs against Graphite Ground and Graphite Panel at 4.5:1 or more.
- **Do** draw planets, moons, suns, locks and phases from `src/components/planet.tsx` or as inline SVG; give each a text equivalent.
- **Do** use the marks with their one meaning on every page: ring for project, full moon for latest, crescent for older, dashed new moon for `dev`, sun for Use, moon for Maintain.
- **Do** use JetBrains Mono for package names, versions, URLs, commands, code and counts, with tabular numerals.
- **Do** ship a reduced-motion state and a no-script state with every new animation.

### Don't:
- **Don't** set text in an ecosystem colour or the star colour, or let colour alone distinguish an ecosystem.
- **Don't** add a second accent or a second continuous animation.
- **Don't** use emoji or text glyphs as icons; draw the mark.
- **Don't** put a shadow on a surface that does not float or frame a window.
- **Don't** use monospace for headings, prose or button labels.
