export const skillsRoot = '.agent-skills';
export const inHousePrefix = 'nepal-dev-';

export interface AgentSkill {
  /** The skill's folder, from the repository root: `.agent-skills/nepal-dev-diagrams`. */
  path: string;
  name?: string;
  description?: string;
}

export interface SkillLink {
  /** The entry's name in the links folder. */
  name: string;
  /** Where it resolves to, from the repository root; `null` when it is not a symlink or is broken. */
  target: string | null;
}

export interface AgentDocs {
  agents: string;
  project: string;
  skills: AgentSkill[];
  claudeLinks: SkillLink[];
  agentsLinks: SkillLink[];
}

const folderOf = (path: string) => path.slice(path.lastIndexOf('/') + 1);

const isInHouse = (skill: AgentSkill) => skill.path === `${skillsRoot}/${folderOf(skill.path)}` && folderOf(skill.path).startsWith(inHousePrefix);

/** `name` and `description` from a SKILL.md's frontmatter; a quoted value is unquoted. */
export function skillFrontmatter(text: string): { name?: string; description?: string } {
  const block = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
  const field = (key: string) => {
    const raw = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm').exec(block)?.[1].trim();
    if (!raw) {
      return undefined;
    }
    if (raw.startsWith('"')) {
      try {
        return String(JSON.parse(raw));
      } catch {
        return raw;
      }
    }
    return raw;
  };
  return { name: field('name'), description: field('description') };
}

function missingSections(file: string, text: string, last: number): string[] {
  const problems: string[] = [];
  for (let n = 1; n <= last; n++) {
    if (!new RegExp(`^## ${n}\\. `, 'm').test(text)) {
      problems.push(`${file} has no section "## ${n}."; other documents cite it by number (ADR-0045 decision 4)`);
    }
  }
  return problems;
}

/** Everything that breaks the split between the two guides and their skills (ADR-0045 decision 14). */
export function agentDocsProblems(docs: AgentDocs): string[] {
  const problems = [...missingSections('AGENTS.md', docs.agents, 12), ...missingSections('PROJECT_AGENTS.md', docs.project, 14)];
  // The lookahead leaves out the patterns the guides also write: `nepal-dev-*`, `nepal-dev-project-*`, `nepal-dev-<topic>`.
  const routed = new Set(`${docs.agents}\n${docs.project}`.match(/nepal-dev-[a-z0-9]+(?:-[a-z0-9]+)*(?![a-z0-9-])/g) ?? []);
  const inHouse = docs.skills.filter(isInHouse);
  const inHouseNames = new Set(inHouse.map((skill) => folderOf(skill.path)));
  const skillPaths = new Set(docs.skills.map((skill) => skill.path));
  const target = (links: SkillLink[], name: string) => links.find((link) => link.name === name)?.target;

  for (const name of routed) {
    if (!inHouseNames.has(name)) {
      problems.push(`${name} is named in AGENTS.md or PROJECT_AGENTS.md, and ${skillsRoot}/${name}/SKILL.md does not exist`);
    }
  }

  for (const skill of inHouse) {
    const folder = folderOf(skill.path);
    if (skill.name !== folder) {
      problems.push(`${skill.path}/SKILL.md: its name is "${skill.name ?? ''}", not "${folder}"`);
    }
    if (!skill.description) {
      problems.push(`${skill.path}/SKILL.md has no description`);
    }
    if (!routed.has(folder)) {
      problems.push(`${folder} is not named in AGENTS.md or PROJECT_AGENTS.md, so no task reaches it`);
    }
    if (target(docs.agentsLinks, folder) !== skill.path) {
      problems.push(`.agents/skills/${folder} is not a link to ${skill.path}`);
    }
  }

  for (const skill of docs.skills) {
    const folder = folderOf(skill.path);
    const takesPrefix = folder.startsWith(inHousePrefix) || (skill.name ?? '').startsWith(inHousePrefix);
    if (takesPrefix && !isInHouse(skill)) {
      problems.push(`${skill.path} uses the ${inHousePrefix} prefix, which is for this project's own skills at the top of ${skillsRoot}/`);
    }
    if (target(docs.claudeLinks, folder) !== skill.path) {
      problems.push(`.claude/skills/${folder} is not a link to ${skill.path}`);
    }
  }

  for (const [folder, links] of [
    ['.claude/skills', docs.claudeLinks],
    ['.agents/skills', docs.agentsLinks],
  ] as const) {
    for (const link of links) {
      if (link.target === null || !skillPaths.has(link.target)) {
        problems.push(`${folder}/${link.name} is not a link to a skill in ${skillsRoot}/`);
      }
    }
  }

  return problems;
}
