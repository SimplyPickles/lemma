export type ArticleHeadingTag = "H1" | "H2" | "H3" | "H4" | "H5" | "H6";
export type ArticleListTag = "UL" | "OL";

export interface ArticleHeading {
  id: string;
  text: string;
  tag: ArticleHeadingTag;
  level: number;
  parentId: string | null;
  childIds: string[];
}

export interface ParagraphBlock {
  type: "paragraph";
  html: string;
}

export interface HeadingBlock {
  type: "heading";
  heading: ArticleHeading;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
}

export interface LinkBlock {
  type: "link";
  text: string;
  href: string;
}

export interface ListBlock {
  type: "list";
  tag: ArticleListTag;
  ordered: boolean;
  html: string;
}

export type ArticleBlock = ParagraphBlock | HeadingBlock | ImageBlock | LinkBlock | ListBlock;

export interface ArticleStats {
  words: number;
  links: number;
  readingMinutes: number;
}

export interface ParsedArticle {
  title: string;
  blocks: ArticleBlock[];
  headings: ArticleHeading[];
  firstImage: string;
  stats: ArticleStats;
  scrollTarget: string;
}

export interface WikipediaPageContent {
  title: string;
  text: {
    "*": string;
  };
}
