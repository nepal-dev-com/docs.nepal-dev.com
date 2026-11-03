import { expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const app = import.meta.dir;

// Turbopack hangs the root not-found on the children of a first-layer route group, inside that
// group's layout; a layout there would stand around the 404. One group deeper, it is replaced.
test('the docs layout is below the first-layer route group, so the 404 replaces it', () => {
  expect(existsSync(join(app, '(site)/layout.tsx'))).toBe(false);
  expect(existsSync(join(app, '(site)/(docs)/layout.tsx'))).toBe(true);
  expect(existsSync(join(app, '(site)/(docs)/[...slug]/page.tsx'))).toBe(true);
});
