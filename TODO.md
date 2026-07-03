# TODO

A prioritized list of useful and necessary improvements for Lemma.

## High priority

- [ ] Fix the current Svelte check error in `src/routes/wiki/[title]/+page.svelte`.
- [ ] Wire `Searchbar` input to actual search behavior.
  - [ ] Capture user input.
  - [ ] Submit on `Enter`.
  - [ ] Navigate directly to `/wiki/[title]` for exact/article-style queries.
  - [ ] Consider routing general searches to `/search?q=...`.
- [ ] Build out `/search` into a real results page.
  - [ ] Read the query from the URL.
  - [ ] Fetch Wikipedia search results.
  - [ ] Display titles and short snippets.
  - [ ] Link each result to `/wiki/[title]`.
- [ ] Add loading, error, and empty states for article and search requests.
- [ ] Handle missing pages and failed Wikipedia API responses gracefully.
- [ ] Remove leftover debugging code from the landing page, including the `console.log` article fetch.

## Article rendering

- [ ] Sanitize or safely transform Wikipedia HTML before rendering with `{@html ...}`.
- [ ] Improve redirect handling.
- [ ] Detect and present disambiguation pages more clearly.
- [ ] Preserve useful article elements that are currently skipped, such as ordered lists, tables, blockquotes, captions, and math where appropriate.
- [ ] Improve reference/link counting so it counts real article links rather than raw `<a` occurrences.
- [ ] Reset `firstImg` when navigating between wiki pages.
- [ ] Improve heading anchor behavior and scrolling for hash links.
- [ ] Make section chevrons functional.
  - [ ] Collapse and expand sections.
  - [ ] Swap between open and closed chevron icons.
- [ ] Convert internal Wikipedia links to Lemma routes where possible.
  - Example: `/wiki/Alan_Turing` instead of navigating to wikipedia.org.
- [ ] Add article-level metadata, such as source link and last edited date if available.

## Search experience

- [ ] Add autocomplete suggestions using Wikipedia title search.
- [ ] Support keyboard navigation through suggestions.
- [ ] Add debouncing for search requests.
- [ ] Highlight matching terms in search results.
- [ ] Add a clear button for the search input.
- [ ] Preserve search query state in the URL.
- [ ] Add search result loading and no-results states.

## UI and design

- [ ] Improve responsive layout for phones and tablets.
- [ ] Adjust article width and breadcrumb behavior on smaller screens.
- [ ] Add a top navigation/header for returning home and searching from article pages.
- [ ] Add dark mode support.
- [ ] Improve focus states and keyboard accessibility.
- [ ] Add skip links for screen reader and keyboard users.
- [ ] Add accessible labels to interactive icon buttons.
- [ ] Review color contrast across the theme.
- [ ] Add a polished home-page example or featured article link.

## Performance

- [ ] Cache recently fetched article content in memory during a session.
- [ ] Avoid reparsing article HTML when revisiting the same page.
- [ ] Lazy-load article images.
- [ ] Consider limiting very large articles or progressively rendering sections.
- [ ] Remove unused imports and CSS selectors.
- [ ] Audit bundle size after major UI/API changes.

## Code quality

- [ ] Add explicit TypeScript types for parsed article content entries.
- [ ] Replace array-based content tuples with named objects.
  - Example: `{ type: 'paragraph', html: string }`.
- [ ] Move article parsing logic out of `+page.svelte` into a reusable library module.
- [ ] Add a dedicated Wikipedia API response type layer.
- [ ] Add error handling around `fetch` and JSON parsing.
- [ ] Normalize formatting across Svelte, TypeScript, and CSS files.
- [ ] Remove unused imports, including any imports that are not referenced.
- [ ] Consider adding a formatter such as Prettier.
- [ ] Consider adding linting with ESLint.

## Testing

- [ ] Add tests for `encodeSchemaURL`.
- [ ] Add tests for `WikipediaAPI` with mocked fetch responses.
- [ ] Add tests for article parsing once parsing is moved into a library module.
- [ ] Add component tests for `Searchbar`.
- [ ] Add route-level tests for article, search, and error pages.
- [ ] Add a basic CI workflow that runs:
  - [ ] `bun install`
  - [ ] `bun run check`
  - [ ] tests, once added
  - [ ] `bun run build`

## Deployment and production readiness

- [ ] Choose and configure a deployment adapter if the target platform is not covered by `adapter-auto`.
- [ ] Add environment-specific deployment notes to `README.md`.
- [ ] Add metadata tags for title, description, and social previews.
- [ ] Add a production favicon and app icons if needed.
- [ ] Review `robots.txt` and indexing behavior.
- [ ] Add error reporting or lightweight client-side diagnostics if desired.
- [ ] Document Wikipedia API/privacy implications clearly for users.

## Nice-to-have features

- [ ] Save recently viewed articles locally.
- [ ] Add bookmarks/favorites.
- [ ] Add article sharing buttons.
- [ ] Add copy-link-to-section support.
- [ ] Add reading progress indicator.
- [ ] Add estimated finish time.
- [ ] Add font size and theme controls.
- [ ] Add command palette for search and navigation.
- [ ] Add offline/read-later support.
- [ ] Add multi-language Wikipedia support.
