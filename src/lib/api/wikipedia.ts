import { encodeSchemaURL, SCHEMA } from "./schemas";

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

  async getPageContent(query: string) {
    const url = encodeSchemaURL(SCHEMA.Page, query);
    const res = await fetch(url);
    const json = JSON.parse(await res.text());

    return json.parse;
  }
}
