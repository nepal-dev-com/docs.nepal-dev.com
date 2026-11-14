import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..', '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('the licences (ADR-0046 decisions 1 and 2)', () => {
  test('the code is MIT, held by nepal-dev.com and contributors', () => {
    const licence = read('LICENSE');
    expect(licence).toStartWith('MIT License');
    expect(licence).toContain('Copyright (c) 2026 nepal-dev.com and contributors');
    expect(JSON.parse(read('package.json')).license).toBe('MIT');
  });

  test('the documentation is CC BY 4.0, with the legal code whole', () => {
    const licence = read('LICENSE-CONTENT');
    expect(licence).toStartWith('Attribution 4.0 International');
    expect(licence).toContain('Creative Commons Attribution 4.0 International Public License');
    expect(licence).toContain('Section 8 -- Interpretation.');
  });

  test('a project that writes pages here is told how they are licensed', () => {
    expect(read('PROJECT_AGENTS.md')).toContain('[CC BY 4.0](LICENSE-CONTENT)');
  });
});

describe('the community files (ADR-0046 decisions 4 to 9)', () => {
  test('the README links each of them, and the licences', () => {
    const readme = read('README.md');
    for (const file of ['CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'LICENSE', 'LICENSE-CONTENT', 'AGENTS.md', 'PROJECT_AGENTS.md']) {
      expect(existsSync(join(root, file))).toBe(true);
      expect(readme).toContain(`](${file})`);
    }
  });

  test('every relative link in the README and the contributing guide leads to a file', () => {
    for (const file of ['README.md', 'CONTRIBUTING.md', 'SECURITY.md']) {
      const links = [...read(file).matchAll(/\]\((?!https?:|#|mailto:)([^)#]+)(?:#[^)]*)?\)/g)].map((match) => match[1]);
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(`${file} → ${link}: ${existsSync(join(root, link))}`).toBe(`${file} → ${link}: true`);
      }
    }
  });

  test('the code of conduct names where reports go, and no placeholder is left', () => {
    const conduct = read('CODE_OF_CONDUCT.md');
    expect(conduct).toContain('version 2.1');
    expect(conduct).toContain('https://github.com/puncoz');
    expect(conduct).not.toContain('INSERT CONTACT METHOD');
  });

  test('security reports are private, and no email address is published', () => {
    const policy = read('SECURITY.md');
    expect(policy).toContain('/security/advisories/new');
    for (const file of ['SECURITY.md', 'CODE_OF_CONDUCT.md', 'CONTRIBUTING.md', 'README.md']) {
      expect(read(file)).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
    }
  });

  test('GitHub has the forms and the owner', () => {
    expect(readdirSync(join(root, '.github/ISSUE_TEMPLATE')).sort()).toEqual(['bug.yml', 'config.yml', 'docs.yml', 'proposal.yml']);
    expect(read('.github/ISSUE_TEMPLATE/config.yml')).toContain('blank_issues_enabled: false');
    expect(read('.github/CODEOWNERS')).toContain('* @puncoz');
    expect(existsSync(join(root, '.github/PULL_REQUEST_TEMPLATE.md'))).toBe(true);
  });
});
