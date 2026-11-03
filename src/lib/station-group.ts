/**
 * The rule of ADR-0023: in each group of sibling stations, at most one is open. Kept free of React
 * so it is tested on its own; `src/components/docs/orbit-station.tsx` applies it.
 */

export type GroupEvent = { type: 'opened' | 'closed'; id: string };

/** The group's open station after one of its stations opens or closes. */
export function groupAfter(openId: string | null, event: GroupEvent): string | null {
  if (event.type === 'opened') {
    return event.id;
  }
  return openId === event.id ? null : openId;
}

/** Whether a station must close because another station holds its group. */
export function stationFollows(id: string, openId: string | null, open: boolean): 'close' | 'stay' {
  return open && openId !== null && openId !== id ? 'close' : 'stay';
}

/** On every page change a station opens when it holds the current page, and closes otherwise. */
export function stationOnPageChange(holdsCurrent: boolean): 'open' | 'close' {
  return holdsCurrent ? 'open' : 'close';
}
