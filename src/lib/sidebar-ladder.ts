import type * as PageTree from 'fumadocs-core/page-tree';

/** Pages in a folder and its sub-folders, each sub-folder's index counted as one. */
export function countPages(folder: PageTree.Folder): number {
  return folder.children.reduce((sum, node) => {
    if (node.type === 'page') {
      return sum + 1;
    }
    if (node.type === 'folder') {
      return sum + (node.index ? 1 : 0) + countPages(node);
    }
    return sum;
  }, 0);
}

/**
 * A page's body on the scale ladder: a landmark at a track's top level, a satellite inside an
 * orbit (ADR-0027 decisions 1 and 4).
 */
export function pageBody(inOrbit: boolean): 'landmark' | 'satellite' {
  return inOrbit ? 'satellite' : 'landmark';
}

/**
 * A folder's body: an orbit, or a plain orbit link when it holds only its index page
 * (ADR-0027 decision 6).
 */
export function folderBody(folder: PageTree.Folder): 'orbit' | 'orbit-link' {
  return folder.index && countPages(folder) === 0 ? 'orbit-link' : 'orbit';
}
