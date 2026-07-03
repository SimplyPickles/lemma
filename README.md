# Lemma

Lemma is a private, fast, and beautifully designed Wikipedia reader that makes exploring knowledge feel effortless. It provides a clean reading experience with focused typography, lightweight navigation, and direct access to Wikipedia article content without the usual visual clutter.

The app fetches Wikipedia articles, extracts the readable content, and presents it in a calm custom layout with local fonts, article stats, images, headings, links, and section navigation.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit)
- [Svelte 5](https://svelte.dev/)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) for dependency install and scripts

## Structure

```text
src/
  components/
    searchbar.svelte          # Search input UI
  lib/
    api/
      schemas.ts              # Wikipedia endpoint URL templates
      wikipedia.ts            # Wikipedia API wrapper
  routes/
    +page.svelte              # Landing page
    +error.svelte             # Error/404 page
    search/+page.svelte       # Search page layout
    wiki/[title]/+page.svelte # Article reader route
static/
  font/                       # Local Gambetta and Satoshi fonts
  icon/                       # Search and chevron SVG icons
```

## Getting started

Install dependencies:

```sh
bun install
```

Start the development server:

```sh
bun run dev
```

Open the app in your browser at the local URL printed by Vite, usually `http://localhost:5173`.

To start the dev server and open the browser automatically:

```sh
bun run dev
 -- --open
```

## Available scripts

```sh
bun run dev          # Start the Vite/SvelteKit dev server
bun run build        # Build a production version
bun run preview      # Preview the production build locally
bun run check        # Run SvelteKit sync and svelte-check
bun run check:watch  # Run svelte-check in watch mode
```

## Reading articles

Articles are served through the dynamic route:

```text
/wiki/[title]
```

For example:

```text
/wiki/Potato
/wiki/Alan_Turing
/wiki/Svelte
```

When an article loads, Lemma requests the parsed Wikipedia page, filters out non-reading elements, and renders the main content in its own layout.

## Wikipedia API integration

Lemma talks directly to public Wikipedia endpoints from the browser:

- Search titles: `action=query&list=search`
- Page content: `action=parse&prop=text`
- Media list endpoint available in the schema definitions

The API wrapper lives in `src/lib/api/wikipedia.ts`, with endpoint templates in `src/lib/api/schemas.ts`.

Because requests are client-side, users connect directly to Wikipedia. Lemma does not require an API key, backend proxy, or server-side cache.

## Design notes

Lemma’s interface is intentionally quiet:

- soft neutral page background,
- custom serif headings,
- clean sans-serif body text,
- subtle shadows and borders,
- animated copy on landing and error pages,
- focused article width for readability,
- persistent section navigation for longer articles.

Global visual styles live in `src/app.css`, while route-specific layout and animation styles live alongside each Svelte route.

## Deployment

The project uses `@sveltejs/adapter-auto`, which supports several common deployment platforms automatically. If deploying to a platform that needs a specific adapter, install and configure the matching SvelteKit adapter.

Build for production with:

```sh
bun run build
```

Preview the production build with:

```sh
bun run preview
```

## Future enhancements

Planned improvements include:

- connecting the search bar to live Wikipedia results,
- expanding the `/search` page into a full results experience,
- improving redirect, missing-page, and disambiguation handling,
- refining mobile and small-screen layouts,
- adding stronger HTML sanitization around article rendering,
- adding tests
  for the API wrapper and article parser.
