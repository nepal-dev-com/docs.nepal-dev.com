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

describe('vercel.json (ADR-0042)', () => {
  test('deploys main only (decision 2)', () => {
    expect(vercel.git.deploymentEnabled).toEqual({ '**': false, main: true });
  });

  test('builds with the history check, then the owner\'s own command (decisions 3 and 4)', () => {
    expect(vercel.buildCommand).toBe('sh scripts/require-full-history.sh && bun run build');
  });

  test('installs with Bun 1.4.4 from the lockfile exactly (decision 5)', () => {
    expect(vercel.installCommand).toBe('bunx bun@1.4.4 install --frozen-lockfile');
  });

  test('Node is pinned to 24 (decision 5)', () => {
    expect(pkg.engines).toEqual({ node: '24.x' });
  });
});

describe('ignoreCommand (ADR-0042 decision 2)', () => {
  // Exit 1 lets Vercel build; exit 0 cancels the deployment.
  test('builds production', () => {
    expect(run(['sh', '-c', vercel.ignoreCommand], root, { VERCEL_ENV: 'production' }).code).toBe(1);
  });

  test('cancels everything else', () => {
    const others: Record<string, string>[] = [{ VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }, { VERCEL_ENV: '' }, {}];
    for (const env of others) {
      expect(run(['sh', '-c', vercel.ignoreCommand], root, env).code).toBe(0);
    }
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
