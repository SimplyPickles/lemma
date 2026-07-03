export enum SCHEMA {
  Search,
  QuickSearch,
  Page,
  Media,
}

export const SCHEMA_KEY = {
  [SCHEMA.Search]: `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&srnamespace=0&format=json&origin=*`,
  [SCHEMA.QuickSearch]: `https://en.wikipedia.org/w/rest.php/v1/search/title?q={query}&limit=5`,
  [SCHEMA.Page]: `https://en.wikipedia.org/w/api.php?action=parse&page={query}&prop=text&format=json&origin=*`,
  [SCHEMA.Media]: `https://en.wikipedia.org/api/rest_v1/page/media-list/{query}`,
};

export function encodeSchemaURL(id: SCHEMA, query: string) {
  const base_url = SCHEMA_KEY[id];
  const url = base_url.replace("{query}", encodeURIComponent(query));

  return url;
}
