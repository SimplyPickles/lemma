import type { ArticleHeadingTag } from "./types";

export const EXCLUDED_CONTENT_SELECTOR = [
  ".infobox",
  ".sidebar",
  ".navbox",
  ".metadata",
  ".ambox",
  ".hatnote",
  ".mw-editsection",
  "table",
].join(", ");

export function normalizeImageSrc(src: string): string {
  return src.startsWith("//") ? `https:${src}` : src;
}

export function getHigherResolutionWikimediaImageSrc(src: string, targetWidth = 960): string {
  const normalizedSrc = normalizeImageSrc(src);

  try {
    const url = new URL(normalizedSrc);
    if (url.hostname !== "upload.wikimedia.org" || !url.pathname.includes("/thumb/")) {
      return normalizedSrc;
    }

    const pathParts = url.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const resizedFileName = fileName.replace(/^\d+px-/, `${targetWidth}px-`);
    return `${url.origin}${pathParts.slice(0, -1).join("/")}/${resizedFileName}`;
  } catch {
    return normalizedSrc;
  }
}

export function getBestImageSrc(image: HTMLImageElement): string {
  const candidates = image.srcset
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);

  return getHigherResolutionWikimediaImageSrc(candidates.at(-1) ?? image.src);
}

export function isArticleHeadingTag(tag: string): tag is ArticleHeadingTag {
  return /^H[1-6]$/.test(tag);
}

export function isFoldableHeadingTag(tag: string): tag is ArticleHeadingTag {
  return /^H[1-4]$/.test(tag);
}

export function getHeadingLevel(tag: ArticleHeadingTag): number {
  return Number(tag.slice(1));
}

export function isBlockedArticleImage(src: string): boolean {
  return ["Symbol_category_class", "Question_book-new", "Wikisource-logo"].some((pattern) =>
    src.includes(pattern),
  );
}
