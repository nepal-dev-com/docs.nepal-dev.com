import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dependabotProblems, workflowProblems } from './github-automation';

const root = join(import.meta.dir, '..', '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

const sha = 'a'.repeat(40);
const workflow = `name: CI

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@${sha} # v1.0.0
        with:
          persist-credentials: false
      # Never \`bun run build\`.
      - run: bunx next build
`;

const dependabot = `version: 2

updates:
  - package-ecosystem: bun
    directory: /
    schedule:
      interval: weekly
    cooldown:
      default-days: 7
    groups:
      all:
        patterns: ['*']

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    cooldown:
      default-days: 7
    groups:
      all:
        patterns: ['*']
`;

describe('the workflows (ADR-0047 decisions 1 to 5)', () => {
  test('the repository has ci.yml and codeql.yml, and neither has a problem', () => {
    const files = readdirSync(join(root, '.github/workflows')).sort();
    expect(files).toEqual(['ci.yml', 'codeql.yml']);
    for (const file of files) {
      expect(workflowProblems(file, read(`.github/workflows/${file}`))).toEqual([]);
    }
  });

  test('CI runs the tests, the type check and the build, from the frozen lockfile', () => {
    const ci = read('.github/workflows/ci.yml');
    for (const step of ['bun install --frozen-lockfile', 'bun run test', 'bun run types:check', 'bunx next build']) {
      expect(ci).toContain(`- run: ${step}\n`);
    }
    expect(ci).toContain('fail-on-severity: moderate');
  });

  test('CI uses the Bun the tests are typed for, and the Node the site asks for', () => {
    const ci = read('.github/workflows/ci.yml');
    const manifest = JSON.parse(read('package.json'));
    expect(ci).toContain(`bun-version: ${manifest.devDependencies['@types/bun']}\n`);
    expect(ci).toContain(`node-version: ${manifest.engines.node.replace('.x', '')}\n`);
  });

  test('a sound sample has no problem', () => {
    expect(workflowProblems('ci.yml', workflow)).toEqual([]);
  });

  test('an action pinned by tag or branch is reported', () => {
    for (const ref of ['v7', 'main', 'a1b2c3d']) {
      expect(workflowProblems('ci.yml', workflow.replace(`@${sha}`, `@${ref}`))).toContainEqual(expect.stringContaining('not pinned'));
    }
  });

  test('missing or wider permissions are reported', () => {
    expect(workflowProblems('ci.yml', workflow.replace('permissions:\n  contents: read\n', ''))).toContainEqual(expect.stringContaining('top-level permissions'));
    expect(workflowProblems('ci.yml', workflow.replace('contents: read', 'contents: write'))).toContainEqual(expect.stringContaining('top-level permissions'));
    expect(workflowProblems('ci.yml', workflow.replace('contents: read\n', 'contents: read\n  pull-requests: write\n'))).toContainEqual(
      expect.stringContaining('top-level permissions'),
    );
    const job = workflow.replace('    timeout-minutes: 15\n', '    timeout-minutes: 15\n    permissions:\n      contents: write\n');
    expect(workflowProblems('ci.yml', job)).toContainEqual(expect.stringContaining('"contents: write"'));
  });

  test('a job may upload code scanning results, and nothing else', () => {
    const job = workflow.replace('    timeout-minutes: 15\n', '    timeout-minutes: 15\n    permissions:\n      security-events: write\n');
    expect(workflowProblems('codeql.yml', job)).toEqual([]);
  });

  test('pull_request_target and a secret are reported', () => {
    expect(workflowProblems('ci.yml', workflow.replace('pull_request:', 'pull_request_target:'))).toContainEqual(expect.stringContaining('pull_request_target'));
    expect(workflowProblems('ci.yml', `${workflow}        env:\n          KEY: \${{ secrets.ALGOLIA_WRITE_KEY }}\n`)).toContainEqual(expect.stringContaining('reads a secret'));
  });

  test('a step that publishes is reported, and a comment about it is not', () => {
    for (const step of ['bun run build', 'node scripts/sync-content.ts', 'bunx vercel --prod']) {
      expect(workflowProblems('ci.yml', workflow.replace('bunx next build', step))).toContainEqual(expect.stringContaining('never publishes'));
    }
  });

  test('a checkout that keeps its credentials and a job without a timeout are reported', () => {
    expect(workflowProblems('ci.yml', workflow.replace('persist-credentials: false', 'fetch-depth: 0'))).toContainEqual(expect.stringContaining('persist-credentials'));
    expect(workflowProblems('ci.yml', workflow.replace('    timeout-minutes: 15\n', ''))).toContainEqual(expect.stringContaining('timeout'));
  });
});

describe('Dependabot (ADR-0047 decision 6)', () => {
  test('the repository file has no problem, and leaves Bun and Node majors to the owner', () => {
    const file = read('.github/dependabot.yml');
    expect(dependabotProblems(file)).toEqual([]);
    expect(file).toContain("- dependency-name: '@types/bun'\n");
    expect(file).toContain("- dependency-name: '@types/node'\n        update-types: ['version-update:semver-major']");
    expect(file).toContain('update-types: [minor, patch]');
  });

  test('a sound sample has no problem', () => {
    expect(dependabotProblems(dependabot)).toEqual([]);
  });

  test('a missing or extra ecosystem is reported', () => {
    expect(dependabotProblems(dependabot.replace('package-ecosystem: bun', 'package-ecosystem: npm'))).toContainEqual(expect.stringContaining('not bun and github-actions'));
    expect(dependabotProblems(dependabot.split('\n\n').slice(0, 2).join('\n\n'))).toContainEqual(expect.stringContaining('not bun and github-actions'));
  });

  test('a folder other than the root is reported', () => {
    expect(dependabotProblems(dependabot.replace('directory: /', 'directory: /.agent-skills/archify'))).toContainEqual(expect.stringContaining('bun must update the root only'));
    expect(dependabotProblems(dependabot.replace('directory: /', "directories: ['**/*']"))).toContainEqual(expect.stringContaining('root only'));
  });

  test('another cadence, a short or missing cooldown, and no grouping are reported', () => {
    expect(dependabotProblems(dependabot.replace('interval: weekly', 'interval: daily'))).toContainEqual('dependabot.yml: bun is not weekly');
    expect(dependabotProblems(dependabot.replace('default-days: 7', 'default-days: 3'))).toContainEqual(expect.stringContaining('bun has no cooldown'));
    expect(dependabotProblems(dependabot.replace('    cooldown:\n      default-days: 7\n', ''))).toContainEqual(expect.stringContaining('bun has no cooldown'));
    expect(dependabotProblems(dependabot.replace("    groups:\n      all:\n        patterns: ['*']\n", ''))).toContainEqual('dependabot.yml: bun is not grouped');
  });
});
