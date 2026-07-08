<script lang="ts">
    import { goto } from "$app/navigation";
    import { WikipediaAPI, type WikipediaSearchResult } from "$lib/api/wikipedia";
    import Result from "./result.svelte";

    const api = new WikipediaAPI();
    const debounceMs = 200;
    const maxResults = 5;

    let query = $state("");
    let results = $state<WikipediaSearchResult[]>([]);
    let isLoading = $state(false);
    let errorMessage = $state("");
    let activeIndex = $state(-1);
    let searchRequestId = 0;
    let debounceTimer: ReturnType<typeof setTimeout>;

    function getArticlePath(title: string) {
        return `/wiki/${encodeURIComponent(title.trim().replaceAll(" ", "_"))}`;
    }

    function clearResults() {
        results = [];
        activeIndex = -1;
        errorMessage = "";
    }

    function scheduleSearch() {
        clearTimeout(debounceTimer);
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            isLoading = false;
            clearResults();
            return;
        }

        debounceTimer = setTimeout(() => search(trimmedQuery), debounceMs);
    }

    async function search(searchQuery: string) {
        const requestId = ++searchRequestId;
        isLoading = true;
        errorMessage = "";

        try {
            const searchResults = await api.getSearchResults(searchQuery);
            if (requestId !== searchRequestId) return;

            results = searchResults.slice(0, maxResults);
            activeIndex = results.length > 0 ? 0 : -1;
        } catch {
            if (requestId !== searchRequestId) return;

            results = [];
            activeIndex = -1;
            errorMessage = "Couldn't load results. Try again.";
        } finally {
            if (requestId === searchRequestId) {
                isLoading = false;
            }
        }
    }

    function openArticle(title = query) {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;

        goto(getArticlePath(trimmedTitle));
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter") {
            event.preventDefault();
            openArticle(results[activeIndex]?.title ?? query);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (results.length > 0) {
                activeIndex = Math.min(activeIndex + 1, results.length - 1);
            }
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (results.length > 0) {
                activeIndex = Math.max(activeIndex - 1, 0);
            }
        } else if (event.key === "Escape") {
            query = "";
            clearResults();
        }
    }
</script>

<div id="search">
    <div id="searchbar">
        <img src="/icon/search.svg" class="icon" alt="" aria-hidden="true" />
        <input
            placeholder="Search articles, people, places..."
            bind:value={query}
            oninput={scheduleSearch}
            onkeydown={handleKeydown}
            aria-label="Search Wikipedia articles"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={results.length > 0 || isLoading || !!errorMessage}
        />
    </div>

    {#if query.trim().length > 0 && (results.length > 0 || isLoading || errorMessage)}
        <div id="results" role="listbox" aria-label="Search results">
            {#if isLoading}
                <p class="status">Searching…</p>
            {:else if errorMessage}
                <p class="status error">{errorMessage}</p>
            {:else}
                {#each results as result, i}
                    <Result
                        title={result.title}
                        desc={result.description}
                        imgsrc={result.thumbnail}
                        href={getArticlePath(result.title)}
                        active={i === activeIndex}
                    />
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    #search {
        position: relative;
        width: 90%;
        margin-left: 5%;
        height: fit-content;
    }

    #searchbar {
        position: relative;
        background: var(--bg-color);
        border: solid 1px rgba(0, 0, 0, 0.15);
        border-radius: 16px;
        box-shadow: 0px 2px 2px var(--shadow-color);
        width: 100%;
        height: 48px;
        z-index: 2;

        img {
            position: absolute;
            user-select: none;
            width: 32px;
            height: 32px;
            left: 6px;
            top: 8px;
        }

        input {
            position: absolute;
            background: none;
            border: none;
            left: 42px;
            top: 11px;
            height: 24px;
            width: calc(100% - 62px);
            font-size: 0.9rem;
            color: var(--text-color, inherit);
        }

        input:focus {
            outline: none;
        }
    }

    #results {
        position: absolute;
        top: calc(48px + 12px);
        left: 0;
        width: 100%;
        display: grid;
        gap: 10px;
        padding: 12px 0;
        background: color-mix(in oklch, var(--bg-color) 92%, transparent);
        border: solid 1px rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        box-shadow: 0px 8px 24px var(--shadow-color);
        backdrop-filter: blur(8px);
        z-index: 1;
    }

    .status {
        margin: 0;
        padding: 0 16px;
        font-size: 0.9rem;
        opacity: 0.7;
    }

    .error {
        color: oklch(0.5 0.18 25);
        opacity: 1;
    }
</style>
