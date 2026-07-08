import { encodeSchemaURL, SCHEMA } from "./schemas";

export type WikipediaSearchResult = {
  title: string;
  description: string;
  thumbnail: string;
};

type WikipediaQuickSearchPage = {
  title: string;
  description?: string;
  thumbnail?: {
    url?: string;
  };
};

export class WikipediaAPI {
  async getSearchTitles(query: string) {
    const url = encodeSchemaURL(SCHEMA.Search, query);
    const res = await fetch(url);
    const json = JSON.parse(await res.text());

    let titles = [];
    for (let i = 0; i < json.query.search.length; i++) {
      titles.push(json.query.search[i].title);
    }
    return titles;
  }

  async getSearchResults(query: string): Promise<WikipediaSearchResult[]> {
    const url = encodeSchemaURL(SCHEMA.QuickSearch, query);
    const res = await fetch(url);
    const json = JSON.parse(await res.text());

    return (json.pages ?? []).map((page: WikipediaQuickSearchPage) => ({
      title: page.title,
      description: page.description ?? "Open article",
      thumbnail: page.thumbnail?.url ?? "",
    }));
  }

  async getPageContent(query: string) {
    const url = encodeSchemaURL(SCHEMA.Page, query);
    const res = await fetch(url);
    const json = JSON.parse(await res.text());

    return json.parse;
  }
}
