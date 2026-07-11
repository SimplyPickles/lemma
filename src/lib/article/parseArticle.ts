import {
  EXCLUDED_CONTENT_SELECTOR,
  getBestImageSrc,
  getHeadingLevel,
  isArticleHeadingTag,
  isBlockedArticleImage,
} from "./articleUtils";
import type { ArticleBlock, ArticleHeading, ParsedArticle, WikipediaPageContent } from "./types";

export function parseArticle(pageContent: WikipediaPageContent, hash: string): ParsedArticle {
  const fetchedContent = pageContent.text["*"]
    .replace(new RegExp("<style [^>]+>.+</style>", "g"), "")
    .replace(new RegExp('<span class="mw-editsection">.+</span>', "g"), "");
  const root = document.createElement("div");
  root.innerHTML = fetchedContent;
  root.querySelectorAll(EXCLUDED_CONTENT_SELECTOR).forEach((element) => element.remove());

  const contentRoot = root.children[0];
  if (contentRoot) {
    for (const child of Array.from(contentRoot.children)) {
      if (["plainlist", "infobox", "sidebar"].some((name) => child.classList.contains(name))) child.remove();
    }
  }
  root.querySelectorAll('img[alt*="Edit"]').forEach((image) => image.remove());

  let selectors = "p, h1, h2, h3, h4, h5, h6, ul, ol, img";
  if (root.textContent?.startsWith("Redirect")) selectors += ", a";

  const blocks: ArticleBlock[] = [];
  const headings: ArticleHeading[] = [];
  const headingStack: ArticleHeading[] = [];
  let firstImage = "";
  let words = 0;
  let links = 0;
  let scrollTarget = "";
  const targetHash = hash.replace("#", "");

  for (const element of root.querySelectorAll(selectors)) {
    const tag = element.tagName;
    const isReferenceList =
      tag === "OL" && (element.classList.contains("references") || element.closest(".reflist") !== null);
    const isNestedList = (tag === "UL" || tag === "OL") && element.parentElement?.closest("li") !== null;
    const isImageInsideList = tag === "IMG" && element.closest("li") !== null;
    if (element.closest(EXCLUDED_CONTENT_SELECTOR) !== null && !isReferenceList) continue;
    if (isImageInsideList) continue;

    if (tag === "IMG") {
      const image = element as HTMLImageElement;
      if (!firstImage) firstImage = image.src;
      else {
        const src = getBestImageSrc(image);
        if (!isBlockedArticleImage(src)) blocks.push({ type: "image", src, alt: image.alt });
      }
    } else if (tag === "P" && element.textContent.trim()) {
      blocks.push({ type: "paragraph", html: element.innerHTML });
      words += element.textContent.split(" ").length;
      links += element.innerHTML.split("<a").length;
    } else if (tag === "A") {
      blocks.push({ type: "link", text: element.textContent ?? "", href: (element as HTMLAnchorElement).href });
      links += 1;
    } else if (isArticleHeadingTag(tag)) {
      const level = getHeadingLevel(tag);
      while (headingStack.at(-1) && headingStack.at(-1)!.level >= level) headingStack.pop();
      const parent = headingStack.at(-1);
      const heading: ArticleHeading = {
        id: element.id,
        text: element.textContent ?? "",
        tag,
        level,
        parentId: parent?.id ?? null,
        childIds: [],
      };
      parent?.childIds.push(heading.id);
      headingStack.push(heading);
      headings.push(heading);
      blocks.push({ type: "heading", heading });
      words += heading.text.split(" ").length;
      if (targetHash === heading.id) scrollTarget = targetHash;
    } else if ((tag === "UL" || tag === "OL") && !isNestedList && element.textContent.trim()) {
      blocks.push({ type: "list", tag, ordered: tag === "OL", html: element.innerHTML });
      words += element.textContent.split(" ").length;
      links += element.querySelectorAll("a").length;
    }
  }

  return {
    title: pageContent.title,
    blocks,
    headings,
    firstImage,
    stats: { words, links, readingMinutes: Math.floor(words / 200) },
    scrollTarget,
  };
}
