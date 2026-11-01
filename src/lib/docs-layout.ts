/**
 * Options the docs layout passes to Fumadocs' `DocsLayout`. The site header's orrery switch is the
 * only theme control (ADR-0017), so Fumadocs' own switch, drawn in the phone sidebar drawer, is off.
 */
export const docsLayoutChrome = {
  themeSwitch: { enabled: false },
} as const;
