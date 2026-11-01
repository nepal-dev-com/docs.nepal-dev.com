/** ADR-0019: what the sidebar's constellation knows about each ADR. Pure functions. */

export type AdrStatus = 'approved' | 'proposed' | 'superseded' | 'rejected' | 'unknown';

const STATUS = /\*{0,2}Status:\*{0,2}\s*`?(approved|proposed|superseded|rejected)\b/i;

/** The status from the template's `**Status:**` line, as fumadocs-mdx structures it for search. */
export function adrStatus(data: { contents: { content: string }[] }): AdrStatus {
  for (const block of data.contents) {
    const match = STATUS.exec(block.content);
    if (match) {
      return match[1].toLowerCase() as AdrStatus;
    }
  }
  return 'unknown';
}

/** The number in an `ADR-NNNN — …` title, else the page's place in its folder. */
export function adrNumber(title: string, position: number): number {
  const match = /ADR-(\d+)/i.exec(title);
  return match ? Number(match[1]) : position;
}

/** The title without its `ADR-NNNN —` prefix, for the readout beside the number. */
export function adrShortTitle(title: string): string {
  return title.replace(/^\s*ADR-\d+\s*[—–:-]\s*/i, '');
}

/** True for a folder named `adr`, from its path under `content/`. */
export function isAdrFolder(folderPath: string | undefined): boolean {
  return folderPath?.split('/').at(-1) === 'adr';
}
