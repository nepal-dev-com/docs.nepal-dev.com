import { describe, expect, test } from 'bun:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { VFile } from 'vfile';
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms';
import { markdownFilter, remarkDiagrams } from './remark-diagrams';

// The same parse as the site's MDX pipeline: Markdown with MDX syntax.
async function check(value: string, path = '/repo/content/example-cli/use/dev/internals.mdx') {
  const processor = unified().use(remarkParse).use(remarkMdx).use(remarkDiagrams);
  const file = new VFile({ value, path });
  await processor.run(processor.parse(file), file);
}

async function markdown(value: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkLLMs, { _data: true, filterElement: markdownFilter });
  const file = new VFile({ value });
  await processor.run(processor.parse(file), file);
  return String(file.data.markdown);
}

const fence = '```mermaid\nflowchart LR\n  Parser --> Router\n```';
const diagram = (body: string, attributes = 'src="/diagrams/example-cli/request-flow.html" title="Request flow"') =>
  `# Internals\n\n<Diagram ${attributes}>\n\n${body}\n\n</Diagram>\n`;

describe('remarkDiagrams', () => {
  test('a <Diagram> holding one Mermaid fence passes', async () => {
    await expect(check(diagram(fence))).resolves.toBeUndefined();
  });

  test('other code blocks pass', async () => {
    await expect(check('```ts\nconst a = 1;\n```\n\n````mdx\n' + fence + '\n````\n')).resolves.toBeUndefined();
  });

  test('a bare Mermaid fence fails, naming the shape', async () => {
    await expect(check(`# Internals\n\n${fence}\n`)).rejects.toThrow(/must sit inside <Diagram/);
  });

  test('a bare Mermaid fence nested in another element fails', async () => {
    await expect(check(`<Callout>\n\n${fence}\n\n</Callout>\n`)).rejects.toThrow(/must sit inside <Diagram/);
  });

  test('templates may keep a bare fence', async () => {
    await expect(check(`${fence}\n`, '/repo/content/docs/maintain/_templates/sequence.mdx')).resolves.toBeUndefined();
  });

  test('a <Diagram> without a fence, with two, or with other content fails', async () => {
    await expect(check(diagram('Some text.'))).rejects.toThrow(/exactly one/);
    await expect(check(diagram(`${fence}\n\n${fence}`))).rejects.toThrow(/exactly one/);
    await expect(check(diagram(`${fence}\n\nA note.`))).rejects.toThrow(/exactly one/);
    await expect(check(diagram('```ts\nconst a = 1;\n```'))).rejects.toThrow(/exactly one/);
  });

  test('a <Diagram> without a plain src or title, or with a bad src, fails', async () => {
    await expect(check(diagram(fence, 'title="Request flow"'))).rejects.toThrow(/needs src=/);
    await expect(check(diagram(fence, 'src={url} title="Request flow"'))).rejects.toThrow(/needs src=/);
    await expect(check(diagram(fence, 'src="/diagrams/example-cli/request-flow.html"'))).rejects.toThrow(/needs a title/);
    await expect(check(diagram(fence, 'src="/diagrams/example-cli/request-flow.html" title=" "'))).rejects.toThrow(/needs a title/);
    await expect(check(diagram(fence, 'src="https://evil.example/a.html" title="x"'))).rejects.toThrow(/outside \/diagrams\//);
  });

  test('<HtmlEmbed> fails with the way forward', async () => {
    await expect(check('<HtmlEmbed src="/diagrams/docs/a.html" title="A" />\n')).rejects.toThrow(/write a <Diagram>/);
  });
});

describe('markdownFilter', () => {
  test('Markdown keeps the Mermaid fence and drops the tag', async () => {
    const text = await markdown(diagram(fence));
    expect(text).toContain(fence);
    expect(text).not.toContain('<Diagram');
    expect(text).not.toContain('/diagrams/');
  });

  test('other elements are kept as they are', () => {
    expect(markdownFilter({ type: 'mdxJsxFlowElement', name: 'Callout' })).toBe(true);
    expect(markdownFilter({ type: 'paragraph' })).toBe(true);
    expect(markdownFilter({ type: 'mdxJsxFlowElement', name: 'Diagram' })).toBe('children-only');
  });
});
