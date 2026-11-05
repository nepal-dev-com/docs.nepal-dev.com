import { afterAll, describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(import.meta.dir, '..', '..');
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf-8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
const historyScript = join(root, 'scripts', 'require-full-history.sh');

function run(command: string[], cwd: string, env: Record<string, string> = {}) {
  const result = Bun.spawnSync(command, { cwd, env: { PATH: process.env.PATH ?? '', HOME: cwd, ...env } });
  return { code: result.exitCode, stderr: result.stderr.toString() };
}

describe('vercel.json (ADR-0042, ADR-0043)', () => {
  test('deploys main only (ADR-0043 decision 1)', () => {
    expect(vercel.git.deploymentEnabled).toEqual({ '**': false, main: true });
  });

  test('main never decides on VERCEL_ENV, which cancelled every merge (ADR-0043 decision 1)', () => {
    expect(vercel).not.toHaveProperty('ignoreCommand');
  });

  test('sets nothing else that could skip or redirect a deployment', () => {
    expect(Object.keys(vercel).sort()).toEqual(['$schema', 'buildCommand', 'git', 'installCommand']);
    expect(Object.keys(vercel.git)).toEqual(['deploymentEnabled']);
  });

  const branchDeploys = (branch: string) => {
    const rules = Object.entries(vercel.git.deploymentEnabled as Record<string, boolean>);
    const matching = rules.filter(([glob]) => new Bun.Glob(glob).match(branch));
    // Vercel: a branch deploys when at least one rule it matches is true; unmatched branches deploy.
    return matching.length === 0 || matching.some(([, enabled]) => enabled);
  };

  test('only main matches a true rule', () => {
    expect(branchDeploys('main')).toBe(true);
    for (const branch of ['dev', 'feature/search', 'main-old', 'release/main', 'Main', 'staging']) {
      expect(branchDeploys(branch)).toBe(false);
    }
  });

  test('builds with the history check, then the owner\'s own command (decisions 3 and 4)', () => {
    expect(vercel.buildCommand).toBe('sh scripts/require-full-history.sh && bun run build');
  });

  test('installs with Vercel\'s Bun, from the lockfile exactly (ADR-0044)', () => {
    expect(vercel.installCommand).toBe('bun install --frozen-lockfile');
  });

  test('never fetches Bun through bunx, which fails on Vercel (ADR-0044)', () => {
    expect(vercel.installCommand).not.toContain('bunx');
    expect(vercel.buildCommand).not.toContain('bunx');
  });
  test('Node is pinned to 26 (ADR-0043 decision 3)', () => {
    expect(pkg.engines).toEqual({ node: '26.x' });
  });
});

describe('require-full-history.sh (ADR-0042 decision 4)', () => {
  const work = mkdtempSync(join(tmpdir(), 'ndv-history-'));
  const origin = join(work, 'origin');
  const git = (cwd: string, ...args: string[]) => {
    const { code, stderr } = run(['git', ...args], cwd);
    if (code !== 0) {
      throw new Error(`git ${args.join(' ')} failed: ${stderr}`);
    }
  };

  // Two commits, so a depth-1 clone really cuts history.
  run(['mkdir', origin], work);
  git(origin, 'init', '--quiet');
  for (const n of [1, 2]) {
    writeFileSync(join(origin, 'page.mdx'), `version ${n}\n`);
    git(origin, 'add', 'page.mdx');
    git(origin, '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '--quiet', '-m', `commit ${n}`);
  }
  git(work, 'clone', '--quiet', `file://${origin}`, 'full');
  git(work, 'clone', '--quiet', '--depth=1', `file://${origin}`, 'shallow');

  afterAll(() => rmSync(work, { recursive: true, force: true }));

  test('passes in a full clone', () => {
    expect(run(['sh', historyScript], join(work, 'full')).code).toBe(0);
  });

  test('fails in a shallow clone, naming VERCEL_DEEP_CLONE', () => {
    const { code, stderr } = run(['sh', historyScript], join(work, 'shallow'));
    expect(code).toBe(1);
    expect(stderr).toContain('VERCEL_DEEP_CLONE');
    expect(stderr).toContain('ADR-0042');
  });

  test('fails outside a git repository', () => {
    const plain = mkdtempSync(join(work, 'plain-'));
    expect(run(['sh', historyScript], plain).code).toBe(1);
  });
});
