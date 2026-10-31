---
name: Puncoz Docs
description: Home page visual system. Graphite and teal, search first, a turning map of every release.
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
  shadow-light: "rgb(13 16 22 / 0.12)"
  shadow-near-light: "rgb(13 16 22 / 0.08)"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Onest, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 1.3rem + 4.2vw, 4.8rem)"
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
    padding: "8px 14px 8px 20px"
    height: "64px"
  search-chip:
    backgroundColor: "{colors.signal-teal-soft}"
    textColor: "{colors.frost-ink}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.sm}"
    padding: "4px 4px 4px 9px"
  try-suggestion:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.steel-muted}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.sm}"
    padding: "5px 10px"
  try-suggestion-hover:
    textColor: "{colors.frost-ink}"
  results-panel:
    backgroundColor: "{colors.graphite-panel}"
    rounded: "{rounded.xl}"
    padding: "8px"
  result-row:
    textColor: "{colors.frost-ink}"
    rounded: "9px"
    padding: "10px 12px"
  result-row-selected:
    backgroundColor: "{colors.graphite-panel-2}"
  tag:
    textColor: "{colors.steel-muted}"
    typography: "{typography.data-sm}"
    rounded: "{rounded.xs}"
    padding: "2px 6px"
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
  segmented-control:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.steel-muted}"
    rounded: "{rounded.lg}"
    padding: "4px"
  segmented-knob:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    rounded: "9px"
  catalogue-item:
    textColor: "{colors.frost-ink}"
    typography: "{typography.data}"
    padding: "18px 4px"
  window:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.steel-muted}"
    rounded: "{rounded.xl}"
  card-row:
    backgroundColor: "{colors.graphite-ground-2}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  orbit-tooltip:
    backgroundColor: "{colors.graphite-panel}"
    textColor: "{colors.frost-ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    width: "180px"
---

# Design System: Puncoz Docs

**Scope.** Everything here applies to the home page only: the tokens live on the `.home` scope (light values on `.home`, dark on `.dark .home`) in `src/app/global.css`, the component styles in `src/app/(home)/home.css`, the fonts in `src/app/(home)/layout.tsx`. Documentation pages under `/docs` still use Fumadocs' default neutral theme with Inter and are not described by this file. The reasons behind every choice below are in ADR-0014 (`content/docs/documentation/adr/ADR-0014-home-page-is-a-search-first-release-map.mdx`); this file only records how the built page looks.

## Overview

**Creative North Star: "The Release Map"**

The home page is a calm graphite instrument with one moving part: a slowly turning orbital map of every documented release, and a search field held in front of it. Each ecosystem is an elliptical ring, each package or project a body on it, each documented version a small moon. The search field is the page's one control, and when a reader types, the map answers: matching bodies light up and the rest dim. Everything below the hero restates the map as plain, ruled text a reader can scan and a screen reader can read.

The surface is cool, technical and quiet: near-black graphite (dark is the default theme) or cool paper in light, hairline rules instead of boxes, one teal accent, and colour reserved for the ecosystems the map is about. Density is moderate: generous section gaps, tight rows inside a list. Depth is soft and rare; only things that float (the search field, its results, preview windows, the tooltip) lift off the ground.

**Key Characteristics:**
- Graphite neutrals with a single signal-teal accent; ecosystem hues mark shapes, never text.
- Three faces with fixed jobs: Bricolage Grotesque for display, Onest for reading and controls, JetBrains Mono for data only.
- Ruled lists over cards; panels only for things that float or frame a preview.
- One authored motion moment, the orbit; everything else is a short, single entrance.
- Every state readable without scripts and without motion.

## Colors

Cool graphite neutrals in a nine-step stack, one teal signal, and a five-hue ecosystem set that only ever fills dots, bodies and ring strokes. Dark values are the frontmatter's plain keys; light values carry the `-light` suffix.

### Primary
- **Signal Teal** (`signal-teal` / `signal-teal-light`): the one accent. Focus outlines, the caret, text selection (with `signal-teal-ink` on top), the search field's focus border and halo, matched characters in results, the latest-version node and the drawn line on the version rails, the terminal prompt and cursor, list-point markers, card icons, and the "open" links in results and previews.
- **Teal Wash** (`signal-teal-soft` / `signal-teal-soft-light`): the translucent fill behind search chips and the focus halo around the search field.

### Secondary
- **Ecosystem set** (`eco-npm`, `eco-composer`, `eco-pypi`, `eco-go`, `eco-cargo` and their `-light` pairs): one hue per ecosystem, used for map bodies, moons, a lit ring's stroke, and the dots in the catalogue and legend. The "other" ecosystem reuses Steel Muted; projects reuse Frost Ink and are drawn hollow. Against the page ground each hue measures 4.2:1 or more.

### Neutral
- **Graphite Ground** (`graphite-ground`): the page.
- **Graphite Ground 2** (`graphite-ground-2`): recessed fills: keyboard keys, suggestion buttons, the segmented control's track, link cards, and the catalogue row's hover wash.
- **Graphite Panel** (`graphite-panel`): raised surfaces: the search field, the results list, preview windows, the tooltip, the segmented control's knob.
- **Graphite Panel 2** (`graphite-panel-2`): the selected result row and the active link in a preview's sidebar.
- **Graphite Line / Line 2** (`graphite-line`, `graphite-line-2`): hairline rules and resting borders; Line 2 is the stronger border on floating panels, the hover border, the unlit orbit rings and the version-rail baseline.
- **Frost Ink** (`frost-ink`): primary text.
- **Steel Muted** (`steel-muted`): secondary text, descriptions, nav links at rest, tags.
- **Steel Faint** (`steel-faint`): hints, placeholder text, result group labels, the window chrome caption.
- **Shadow** (`shadow`): the colour of every far shadow; see Elevation & Depth.
- **Shadow near** (`shadow-near`): the tight contact shadow under the search field.

Measured: every text colour is 4.5:1 or more against Graphite Ground and Graphite Panel in both themes; the tightest pair, Steel Faint on Graphite Panel, is 5.0:1 in dark and 5.6:1 in light.

### Named Rules
**The One Signal Rule.** Teal is the only accent on the page. If something needs to stand out and it is not focus, a match, the latest release or a forward link, it gets weight or size, not colour.

**The Shapes, Not Words Rule.** Ecosystem hues fill dots, bodies, moons and ring strokes. Text beside them is always Frost Ink or Steel Muted, and every coloured mark has a text equivalent (a legend label, or a screen-reader-only ecosystem name in the catalogue).

**The Token-Only Surface Rule.** The browser's own surfaces (selection, caret, scrollbar, focus ring) and the canvas read their colours from the tokens; the map re-reads them when the theme changes.

## Typography

**Display Font:** Bricolage Grotesque, optical-size axis on (falls back to Onest, then the system sans)
**Body Font:** Onest (with the system sans)
**Data Font:** JetBrains Mono (with `ui-monospace`, SF Mono, Menlo), tabular numerals

**Character:** a characterful grotesque with tight tracking for headings, a plain, open sans for reading, and a coding mono that appears only where the content is literally data.

### Hierarchy
- **Display** (700, fluid 2.4rem to 4.8rem, line-height 1, -0.04em): the hero headline only, balanced, at most 13 characters wide; its second half is set in Steel Muted for emphasis by tone, not style.
- **Headline** (650, fluid 1.8rem to 2.6rem, 1.08, -0.03em): section headings, at most 18 characters wide, balanced.
- **Title** (650, 24px, -0.02em): the page title inside a preview window.
- **Wordmark** (600, 17px, -0.01em): the brand name in the header.
- **Lead** (400, fluid 1rem to 1.15rem): the hero subline, at most 52 characters wide.
- **Body** (400, 16px, 1.6): base text; section ledes cap at 44 to 46 characters.
- **Body small** (400, 14px): descriptions in catalogue rows, preview bodies, link-card text, header nav.
- **Search input** (400, 18px; 16px under 860px so phones do not zoom).
- **Caption** (400, 13px): the Try row, the package name beside a result, the results footer link, catalogue row links, the rail legend.
- **Label** (400, 12px): legend, result group labels, result footer hints. Sentence case, no tracking.
- **Data** (500, 16px, -0.01em): package names in the catalogue; 15px on version-rail names; 14px in the tooltip and the count.
- **Data small** (400 to 500, 12 to 13px): tags, chips, suggestion buttons, keyboard keys, version labels on the rails, the window chrome caption, the preview's version picker.

### Named Rules
**The Data Voice Rule.** JetBrains Mono is for package names, versions, URLs, commands, code and counts, nothing else. Headings, buttons with words on them and prose stay in Onest or Bricolage.

**The Tight Display Rule.** Display and headline faces track negative (-0.04em to -0.01em, never tighter than -0.04em) and balance their lines; text faces keep default tracking.

## Layout

A single centred column: 1180px maximum, 24px side padding. The hero fills most of the first screen (up to 900px, 96% of the small viewport; 88% under 860px) with the orbit map as a full-bleed canvas behind a centred stack: headline, subline, search field (720px wide at most), the "Try" suggestion row, and the ecosystem legend. A hairline closes the hero.

Sections below sit 112px apart (88px under 860px); the footer sits 128px below the last section. Each section opens with a head row: the heading left, a short paragraph or a count right, wrapping on narrow screens, 32px above the content. Inside sections the composition varies with the content: a two-column ruled catalogue (40px gutter), a 5:7 split of copy and preview window (48px gap), stacked version rails (150px name column), and a 1:1 split of terminal and link cards (24px gap).

At 860px and below every multi-column block becomes one column, the header nav, keyboard hints and map legend are hidden, the preview window's sidebar becomes a wrapping row above its body, and version-rail names stack above their rails.

The spacing rhythm is tight inside groups (4 to 14px) and generous between them (24 to 48px), with the section step (112px) well above everything else.

## Elevation & Depth

Flat by default, with soft drop shadows only on surfaces that float above the map or frame a preview. Every far shadow uses the Shadow token, a large blur and a negative spread, so it reads as distance rather than an outline. The sticky header is the one translucent surface: the page ground at 80% with a saturating 12px backdrop blur, gaining a hairline bottom border once the page scrolls.

### Shadow Vocabulary
- **Search lift** (`0 22px 60px -22px shadow, 0 2px 6px shadow-near`): the search field at rest.
- **Search focus** (`0 24px 70px -20px shadow, 0 0 0 4px teal wash`): the search field while focused, with its border turned teal.
- **Dropdown** (`0 30px 80px -20px shadow`): the results list.
- **Window** (`0 30px 80px -30px shadow`): preview and terminal windows.
- **Tooltip** (`0 18px 40px -16px shadow`): the orbit tooltip.
- **Knob** (`0 2px 8px shadow`): the segmented control's sliding knob.

### Named Rules
**The Float-Only Rule.** A surface gets a shadow only if it sits over something (the map, the page) or frames a preview. Rows, tags, chips and link cards stay flat and separate by border or tone.

## Shapes

Gently rounded rectangles in a short ladder: 6px for tags, keys and focus outlines; 8px for chips, small buttons and suggestions; 10px for the tooltip and card icons; 12px for the segmented track and the no-script link; 14px for the search field, results list, windows and link cards. Nested surfaces step their radius down from their container: a 9px knob and 9px result rows inside 12px and 14px parents, the 7px version box in the preview sidebar, and the 5px remove button inside a chip. The 2px square marks the tracks preview's list points. Circles are reserved for meaning: ecosystem dots (8px, 10px in the catalogue), map bodies and moons, the brand mark, and the window chrome's three dots.

Borders are 1px hairlines throughout. Line style carries meaning: a **dashed** stroke marks an unreleased (`next`) line, on tags, rail segments, rail nodes and orbit moons alike; a **hollow** shape marks a project (an outlined dot in the catalogue, an outlined body in the map; its ring is solid like the others, because a broken stroke means unreleased). The brand mark is a tilted ellipse in Frost Ink with a teal dot at its centre, the map in miniature.

### Named Rules
**The Hollow and Dashed Rule.** Hollow means project; dashed means not released yet. Never use either for decoration.

## Components

### Search field (signature control)
- **Character:** the one large, confident control on the page.
- **Shape and fill:** Graphite Panel, 14px corners, Line 2 border, Search lift shadow, 64px tall (56px under 860px), a muted search icon on the left and keyboard hints on the right.
- **Focus:** the border turns teal and the Teal Wash halo appears, eased over 0.3s.
- **Chips:** an ecosystem chosen in the field becomes a chip inside it: Teal Wash fill, teal border at 45%, data-small text, a 20px muted remove button that darkens on hover. Chips pop in (scale from 0.8 over 0.35s).
- **Placeholder:** Steel Faint. While idle, it types real queries as a demonstration until the reader takes the field; not under reduced motion.
- **Try row:** centred suggestion buttons below the field in data-small on Graphite Ground 2 with a hairline border; on hover the text turns Frost Ink, the border strengthens and the button rises 1px.

### Results list
- A Graphite Panel dropdown 8px below the field, 14px corners, Line 2 border, Dropdown shadow, 440px maximum height. It fades and settles 6px into place when opened.
- Group labels in Label/Steel Faint; rows are a three-column grid (marker, title and package, trailing meta), 9px corners, the selected row on Graphite Panel 2. Matched characters are teal, unhighlighted.
- A footer under a hairline carries keyboard hints and a teal "see all" link pushed right. Empty and loading states use a muted note.

### Orbit map
- Full-bleed canvas behind the hero content, crosshair cursor. Rings are 1px ellipses tilted to 0.34 of their width, in Line 2 at half opacity; a ring with a matching body takes its ecosystem colour while searching.
- Bodies are 5px dots in their ecosystem colour (projects hollow), scaled and brightened by depth; moons orbit them on faint ellipses, dashed and hollow for unreleased lines. A lit body grows and shows its name in data-small Frost Ink.
- Hovering slows the orbit and shows the tooltip: Graphite Panel, Line 2 border, 10px corners, data name, muted description and version tags; it fades and rises 4px into place.
- With nothing documented, a faint set of rings keeps the hero's shape.

### Tags
- Data-small, Steel Muted, 1px Line border, 6px corners. Variants: dashed border for an unreleased `next` line; teal text and a 40% teal border for the accent variant.

### Buttons
- **Ghost:** 14px Onest, Steel Muted, hairline border, 8px corners, 6px by 10px, with an optional 16px stroked icon (1.75 stroke). Hover: Frost Ink text and Line 2 border.
- **Count button:** the same treatment at 13px, beside the catalogue count.
- **Segmented control:** a two-option track on Graphite Ground 2 with 12px corners and 4px inset; options in 15px Onest, muted, with 16px icons; the selected option is Frost Ink over a Graphite Panel knob that slides across in 0.45s.

### Catalogue (ruled list)
- Two columns of rows separated by hairlines, opened by a hairline on top; no boxes. Each row: a 10px ecosystem dot, the package name in Data with a teal hover, a muted description, small icon links, and right-aligned version tags (latest, then `next`).
- Hover washes the row from Graphite Ground 2 to transparent, left to right.
- Empty and no-match states are a single muted sentence across both columns.

### Windows
- Graphite Panel, Line 2 border, 14px corners, Window shadow, clipped. A chrome bar in data-small Steel Faint carries three 10px Line 2 dots and a caption.
- **Track preview:** a 210px sidebar (version picker in a hairline box, page links that fill Graphite Panel 2 when active) beside a body with a Title and a teal "open" link. Switching tracks cross-fades the body with a 6px blur and an 8px rise.
- **Terminal:** 13.5px data at 1.75 line-height, muted output, Frost Ink command, teal prompt and an 8 by 16px teal block cursor that blinks. It types its command once when it enters view.

### Version rails
- One row per package: the name in Data at 15px, then an SVG rail: a Line 2 baseline, the released span drawn in teal from left to right once (1.6s), hollow Line 2 nodes with the latest filled teal, and the unreleased segment and node dashed in Steel Muted. Version labels in data-small, the latest in Frost Ink. A legend below repeats the three line styles.

### Link cards
- Flat rows on Graphite Ground 2 with a hairline border and 14px corners, 20px padding: a 38px Graphite Panel icon tile with a teal 18px stroked icon, a 16px semibold title and a muted body-small line. Hover strengthens the border.

### Navigation
- **Header:** sticky, 60px tall, translucent with backdrop blur; wordmark and brand mark left, 14px muted nav links (Frost Ink on hover), a spacer, then a ghost GitHub button. The nav hides under 860px.
- **Footer:** 14px muted text and links under a hairline, wrapping.

### Motion
- **The orbit** is the one authored moment: the inner ring turns once in about 100s, outer rings slower; it slows to 15% under the pointer and pauses when off-screen or in a hidden tab. Search highlights ease in and out over about 300ms.
- Supporting motion is short and single: section parts rise 18px and un-blur over 0.8s once, the rails draw once, the terminal types once, chips pop, the track preview cross-fades. All of it uses one ease, an exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`), and animates transform, opacity, blur, stroke offset or canvas only.
- Under reduced motion the orbit is drawn once and redraws only on change, the placeholder and terminal do not type, the cursor and chips do not animate, and nothing enters, draws or slides.
- Without scripts every section is visible, the map is absent, and the search field is replaced by a "Browse the documentation" link on a Graphite Panel with 12px corners.

### Named Rules
**The One Orbit Rule.** The map is the only continuous motion on the page. New motion is a single, short response to arrival or input, never a second loop.

**The Visible-By-Default Rule.** Content is hidden for an entrance only after scripts run; with no scripts or with reduced motion, everything is already in place.

## Do's and Don'ts

### Do:
- **Do** take every colour from the `--home-*` tokens, in both themes, including canvas strokes, selection, caret, scrollbar and focus.
- **Do** keep text on Frost Ink, Steel Muted or Steel Faint; check new pairs against Graphite Ground and Graphite Panel at 4.5:1 or more.
- **Do** give every coloured or drawn mark a text equivalent: a legend label, a screen-reader name, or the catalogue row that restates the map.
- **Do** mark unreleased lines dashed and projects hollow wherever versions or entries are drawn.
- **Do** use JetBrains Mono for package names, versions, URLs, commands, code and counts, with tabular numerals.
- **Do** ship a reduced-motion state and a no-script state with every new animation.

### Don't:
- **Don't** set text in an ecosystem colour, or let colour alone distinguish an ecosystem.
- **Don't** add a second accent or a second continuous animation.
- **Don't** turn the catalogue into a grid of boxed cards; rows are separated by hairlines.
- **Don't** put a shadow on a surface that does not float or frame a preview.
- **Don't** use monospace for headings, prose or button labels.
- **Don't** apply these tokens or faces to the documentation pages; they keep Fumadocs' neutral theme and Inter until their own ADR.
