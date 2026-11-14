import { describe, expect, test } from 'bun:test';
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, relative } from 'node:path';
import { agentDocsProblems, skillFrontmatter, skillsRoot, type AgentDocs, type AgentSkill, type SkillLink } from './agent-docs';

const root = join(import.meta.dir, '..', '..');

function findSkills(dir: string): AgentSkill[] {
  const skills: AgentSkill[] = [];
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const path = `${dir}/${entry.name}`;
    const file = join(root, path, 'SKILL.md');
    if (existsSync(file)) {
      skills.push({ path, ...skillFrontmatter(readFileSync(file, 'utf8')) });
      continue;
    }
    skills.push(...findSkills(path));
  }
  return skills;
}

function readLinks(dir: string): SkillLink[] {
  if (!existsSync(join(root, dir))) {
    return [];
  }
  return readdirSync(join(root, dir)).map((name) => {
    const path = join(root, dir, name);
    if (!lstatSync(path).isSymbolicLink() || !existsSync(path)) {
      return { name, target: null };
    }
    return { name, target: relative(realpathSync(root), realpathSync(path)) };
  });
}

const repository = (): AgentDocs => ({
  agents: readFileSync(join(root, 'AGENTS.md'), 'utf8'),
  project: readFileSync(join(root, 'PROJECT_AGENTS.md'), 'utf8'),
  skills: findSkills(skillsRoot),
  claudeLinks: readLinks('.claude/skills'),
  agentsLinks: readLinks('.agents/skills'),
});

const sections = (last: number) => Array.from({ length: last }, (_, i) => `## ${i + 1}. Section`).join('\n\n');

const sample = (): AgentDocs => ({
  agents: `${sections(12)}\n\n| write a diagram | \`nepal-dev-diagrams\` |`,
  project: sections(14),
  skills: [
    { path: '.agent-skills/nepal-dev-diagrams', name: 'nepal-dev-diagrams', description: 'Read before writing a diagram.' },
    { path: '.agent-skills/acme-skills/skills/debugging', name: 'debugging', description: 'Use when debugging.' },
  ],
  claudeLinks: [
    { name: 'nepal-dev-diagrams', target: '.agent-skills/nepal-dev-diagrams' },
    { name: 'debugging', target: '.agent-skills/acme-skills/skills/debugging' },
  ],
  agentsLinks: [{ name: 'nepal-dev-diagrams', target: '.agent-skills/nepal-dev-diagrams' }],
});

describe('the working agreement and its skills (ADR-0045 decision 14)', () => {
  test('the repository has no problem', () => {
    expect(agentDocsProblems(repository())).toEqual([]);
  });

  test('the repository has its own skills, and every skill is linked for Claude Code', () => {
    const docs = repository();
    expect(docs.skills.filter((skill) => skill.path.startsWith(`${skillsRoot}/nepal-dev-`)).length).toBeGreaterThanOrEqual(9);
    expect(docs.claudeLinks.length).toBe(docs.skills.length);
  });

  test('a sound sample has no problem', () => {
    expect(agentDocsProblems(sample())).toEqual([]);
  });

  test('a missing numbered section is reported in each file', () => {
    const docs = sample();
    docs.agents = docs.agents.replace('## 8. Section', '## Documentation');
    docs.project = docs.project.replace('## 14. Section', '');
    const problems = agentDocsProblems(docs);
    expect(problems).toContainEqual(expect.stringContaining('AGENTS.md has no section "## 8."'));
    expect(problems).toContainEqual(expect.stringContaining('PROJECT_AGENTS.md has no section "## 14."'));
  });

  test('a skill the router names must exist', () => {
    const docs = sample();
    docs.project += '\n| release | `nepal-dev-project-versions` |';
    expect(agentDocsProblems(docs)).toContainEqual(expect.stringContaining('.agent-skills/nepal-dev-project-versions/SKILL.md does not exist'));
  });

  test('a pattern such as nepal-dev-project-* is not taken for a skill', () => {
    const docs = sample();
    docs.agents += '\nThe `nepal-dev-*` skills, `nepal-dev-project-*` and `nepal-dev-<topic>`.';
    expect(agentDocsProblems(docs)).toEqual([]);
  });

  test('an in-house skill needs a matching name and a description', () => {
    const docs = sample();
    docs.skills[0] = { path: '.agent-skills/nepal-dev-diagrams', name: 'diagrams' };
    const problems = agentDocsProblems(docs);
    expect(problems).toContainEqual(expect.stringContaining('its name is "diagrams", not "nepal-dev-diagrams"'));
    expect(problems).toContainEqual(expect.stringContaining('has no description'));
  });

  test('an in-house skill no router names is reported', () => {
    const docs = sample();
    docs.agents = sections(12);
    expect(agentDocsProblems(docs)).toContainEqual(expect.stringContaining('nepal-dev-diagrams is not named in AGENTS.md or PROJECT_AGENTS.md'));
  });

  test('a missing, broken or misdirected link is reported', () => {
    const missing = sample();
    missing.claudeLinks = missing.claudeLinks.slice(0, 1);
    missing.agentsLinks = [];
    expect(agentDocsProblems(missing)).toEqual([
      '.agents/skills/nepal-dev-diagrams is not a link to .agent-skills/nepal-dev-diagrams',
      '.claude/skills/debugging is not a link to .agent-skills/acme-skills/skills/debugging',
    ]);

    const broken = sample();
    broken.claudeLinks[1] = { name: 'debugging', target: null };
    expect(agentDocsProblems(broken)).toContainEqual('.claude/skills/debugging is not a link to a skill in .agent-skills/');

    const outside = sample();
    outside.claudeLinks.push({ name: 'stray', target: 'node_modules/stray' });
    expect(agentDocsProblems(outside)).toContainEqual('.claude/skills/stray is not a link to a skill in .agent-skills/');
  });

  test('the prefix on a vendored skill is reported, by folder or by name', () => {
    const docs = sample();
    docs.skills.push({ path: '.agent-skills/acme-skills/skills/nepal-dev-fake', name: 'fake', description: 'x' });
    docs.skills.push({ path: '.agent-skills/acme-skills/skills/plain', name: 'nepal-dev-plain', description: 'x' });
    docs.claudeLinks.push({ name: 'nepal-dev-fake', target: '.agent-skills/acme-skills/skills/nepal-dev-fake' });
    docs.claudeLinks.push({ name: 'plain', target: '.agent-skills/acme-skills/skills/plain' });
    const problems = agentDocsProblems(docs);
    expect(problems).toContainEqual(expect.stringContaining('.agent-skills/acme-skills/skills/nepal-dev-fake uses the nepal-dev- prefix'));
    expect(problems).toContainEqual(expect.stringContaining('.agent-skills/acme-skills/skills/plain uses the nepal-dev- prefix'));
  });
});

describe('skillFrontmatter', () => {
  test('reads a plain and a quoted value', () => {
    expect(skillFrontmatter('---\nname: nepal-dev-diagrams\ndescription: "Diagrams: read first."\n---\n\nBody')).toEqual({
      name: 'nepal-dev-diagrams',
      description: 'Diagrams: read first.',
    });
  });

  test('gives nothing for a file without frontmatter', () => {
    expect(skillFrontmatter('# A skill\n\nname: not-frontmatter')).toEqual({ name: undefined, description: undefined });
  });
});
