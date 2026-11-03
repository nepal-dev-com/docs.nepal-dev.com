import { WORDS_PER_MINUTE } from '@/lib/trajectory';

interface Structured {
  headings: { content: string }[];
  contents: { content: string }[];
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * A page's reading time in minutes, from the text fumadocs-mdx structures for search
 * (ADR-0018 decision 3). Code blocks are not part of that text, so they don't count.
 */
export function readingMinutes(data: Structured): number {
  const words = [...data.headings, ...data.contents].reduce((sum, block) => sum + countWords(block.content), 0);
  return words / WORDS_PER_MINUTE;
}
