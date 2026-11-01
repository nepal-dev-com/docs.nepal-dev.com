import { describe, expect, test } from 'bun:test';
import { docsLayoutChrome } from './docs-layout';

describe('docs layout chrome', () => {
  test("Fumadocs' own theme switch is off; the header's orrery switch is the only one", () => {
    expect(docsLayoutChrome.themeSwitch.enabled).toBe(false);
  });
});
