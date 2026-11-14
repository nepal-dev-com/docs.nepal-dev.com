const pinned = /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/;

/** What breaks ADR-0047 decisions 1 and 5 in one workflow file. */
export function workflowProblems(file: string, text: string): string[] {
  const problems: string[] = [];
  const code = text
    .split('\n')
    .map((line) => line.replace(/(^|\s)#.*$/, ''))
    .join('\n');

  for (const match of code.matchAll(/^\s*(?:- )?uses:\s*(\S+)/gm)) {
    if (!pinned.test(match[1])) {
      problems.push(`${file}: ${match[1]} is not pinned to a full commit SHA`);
    }
  }
  if (!/^permissions:\n {2}contents: read\n(?! )/m.test(code)) {
    problems.push(`${file}: top-level permissions must be exactly "contents: read"`);
  }
  for (const match of code.matchAll(/^\s+([a-z-]+): write\b/gm)) {
    if (match[1] !== 'security-events') {
      problems.push(`${file}: no job may have "${match[1]}: write"`);
    }
  }
  if (code.includes('pull_request_target')) {
    problems.push(`${file}: pull_request_target runs a fork's change with the repository's token`);
  }
  if (/\bsecrets\./.test(code)) {
    problems.push(`${file}: no workflow reads a secret`);
  }
  if (/\b(?:bun|npm|pnpm|yarn)\s+run\s+build\b/.test(code) || /sync-content|\bvercel\b/.test(code)) {
    problems.push(`${file}: a workflow never publishes; the check is "bunx next build"`);
  }
  const count = (pattern: RegExp) => (code.match(pattern) ?? []).length;
  if (count(/persist-credentials: false/g) !== count(/uses:\s*actions\/checkout@/g)) {
    problems.push(`${file}: every checkout sets "persist-credentials: false"`);
  }
  const jobs = (code.split(/^jobs:\n/m)[1]?.match(/^ {2}[\w-]+:\s*$/gm) ?? []).length;
  if (jobs === 0 || count(/^ {4}timeout-minutes: \d+/gm) !== jobs) {
    problems.push(`${file}: every job has a timeout`);
  }
  return problems;
}

/** What breaks ADR-0047 decision 6 in `.github/dependabot.yml`. */
export function dependabotProblems(text: string): string[] {
  const problems: string[] = [];
  const blocks = text.split(/^ {2}- package-ecosystem: /m).slice(1);
  const ecosystems = blocks.map((block) => block.split('\n')[0].trim());
  if (ecosystems.join(',') !== 'bun,github-actions') {
    problems.push(`dependabot.yml updates "${ecosystems.join(', ')}", not bun and github-actions`);
  }
  for (const block of blocks) {
    const name = block.split('\n')[0].trim();
    if (!/^ {4}directory: \/$/m.test(block) || /^ {4}directories:/m.test(block)) {
      problems.push(`dependabot.yml: ${name} must update the root only, so no vendored skill's manifest is touched`);
    }
    if (!/^ {6}interval: weekly$/m.test(block)) {
      problems.push(`dependabot.yml: ${name} is not weekly`);
    }
    if (!/^ {4}cooldown:\n {6}default-days: ([7-9]|\d{2,})$/m.test(block)) {
      problems.push(`dependabot.yml: ${name} has no cooldown of seven days or more`);
    }
    if (!/^ {4}groups:$/m.test(block)) {
      problems.push(`dependabot.yml: ${name} is not grouped`);
    }
  }
  return problems;
}
