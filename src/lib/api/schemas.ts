export type Schema = "search" | "quickSearch" | "page" | "media";

const SCHEMA_URLS: Record<Schema, string> = {
  search:
    "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&srnamespace=0&format=json&origin=*",
  quickSearch: "https://en.wikipedia.org/w/rest.php/v1/search/title?q={query}&limit=5",
  page: "https://en.wikipedia.org/w/api.php?action=parse&page={query}&prop=text&format=json&origin=*",
  media: "https://en.wikipedia.org/api/rest_v1/page/media-list/{query}",
};

export function encodeSchemaURL(id: Schema, query: string): string {
  return SCHEMA_URLS[id].replace("{query}", encodeURIComponent(query));
}
