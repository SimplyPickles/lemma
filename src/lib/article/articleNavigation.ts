import type { ArticleBlock, ArticleHeading } from "./types";

export function findHeading(headings: readonly ArticleHeading[], id: string): ArticleHeading | undefined {
  return headings.find((heading) => heading.id === id);
}

export function getHeadingAncestorIds(headings: readonly ArticleHeading[], id: string): Set<string> {
  const ancestors = new Set<string>();
  let heading = findHeading(headings, id);

  while (heading?.parentId) {
    if (ancestors.has(heading.parentId)) break;
    ancestors.add(heading.parentId);
    heading = findHeading(headings, heading.parentId);
  }

  return ancestors;
}

export function headingHasChildren(heading: ArticleHeading): boolean {
  return heading.childIds.length > 0;
}

export function getCollapsibleHeadingIds(headings: readonly ArticleHeading[]): string[] {
  return headings.filter(headingHasChildren).map((heading) => heading.id);
}

export function isHeadingHiddenByCollapsed(
  heading: ArticleHeading,
  headings: readonly ArticleHeading[],
  collapsedIds: ReadonlySet<string> | readonly string[],
): boolean {
  const collapsed = collapsedIds instanceof Set ? collapsedIds : new Set(collapsedIds);
  return [...getHeadingAncestorIds(headings, heading.id)].some((id) => collapsed.has(id));
}

export function getBlockAncestorIds(
  blocks: readonly ArticleBlock[],
  blockIndex: number,
): Set<string> {
  const ancestors = new Set<string>();
  const block = blocks[blockIndex];
  let childLevel = block?.type === "heading" ? block.heading.level : 7;

  for (let index = blockIndex - 1; index >= 0; index -= 1) {
    const candidate = blocks[index];
    if (candidate.type !== "heading" || candidate.heading.level > 4) continue;
    if (candidate.heading.level < childLevel) {
      ancestors.add(candidate.heading.id);
      childLevel = candidate.heading.level;
    }
  }

  return ancestors;
}

export function isBlockHiddenByCollapsed(
  blocks: readonly ArticleBlock[],
  blockIndex: number,
  collapsedIds: ReadonlySet<string> | readonly string[],
): boolean {
  const collapsed = collapsedIds instanceof Set ? collapsedIds : new Set(collapsedIds);
  return [...getBlockAncestorIds(blocks, blockIndex)].some((id) => collapsed.has(id));
}
