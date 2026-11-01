import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { HtmlEmbed } from '@/components/html-embed';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    HtmlEmbed,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
