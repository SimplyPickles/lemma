<script lang="ts">
    import "../../../app.css";
    import { page } from "$app/state";
    import { tick } from "svelte";
    import { WikipediaAPI } from "$lib/api/wikipedia";
    import { parseArticle } from "$lib/article/parseArticle";
    import {
        getBlockAncestorIds,
        getCollapsibleHeadingIds,
        getHeadingAncestorIds,
    } from "$lib/article/articleNavigation";
    import type { ArticleBlock, ArticleHeading } from "$lib/article/types";
    import ArticleBreadcrumbs from "../../../components/article/ArticleBreadcrumbs.svelte";
    import ArticleContent from "../../../components/article/ArticleContent.svelte";
    import Navbar from "../../../components/Navbar.svelte";

    let title = $state("");
    let content = $state<ArticleBlock[]>([]);
    let breadcrumbs = $state<ArticleHeading[]>([]);
    let isLoading = $state(true);
    let skeletonWidths = $state<number[]>([]);

    let words = $state(0);
    let references = $state(0);
    let readingTime = $state(0);

    let scrollElement = $state("");
    let collapsedSections = $state<string[]>([]);
    let collapsedBreadcrumbs = $state<string[]>([]);
    let autoExpandedBreadcrumbs = $state<string[]>([]);
    let activeBreadcrumbId = $state("");
    let pageContainer: HTMLDivElement;

    function toggleSection(id: string) {
        if (collapsedSections.includes(id)) {
            collapsedSections = collapsedSections.filter((sectionId) => sectionId !== id);
        } else {
            collapsedSections = [...collapsedSections, id];
        }
    }

    function toggleBreadcrumb(id: string, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        (event.currentTarget as HTMLButtonElement).blur();

        autoExpandedBreadcrumbs = autoExpandedBreadcrumbs.filter((sectionId) => sectionId !== id);

        if (collapsedBreadcrumbs.includes(id)) {
            collapsedBreadcrumbs = collapsedBreadcrumbs.filter((sectionId) => sectionId !== id);
        } else {
            collapsedBreadcrumbs = [...collapsedBreadcrumbs, id];
        }
    }

    function getCollapsibleBreadcrumbIds() {
        return getCollapsibleHeadingIds(breadcrumbs);
    }

    function syncActiveBreadcrumbIntoView() {
        document.querySelector("#crumbs .breadcrumb.active")?.scrollIntoView({
            block: "nearest",
        });
    }

    function expandBreadcrumbForJump(id: string) {
        const idsToExpand = getHeadingAncestorIds(breadcrumbs, id);
        idsToExpand.add(id);

        collapsedBreadcrumbs = collapsedBreadcrumbs.filter((sectionId) => !idsToExpand.has(sectionId));
        autoExpandedBreadcrumbs = autoExpandedBreadcrumbs.filter((sectionId) => sectionId !== id);
    }

    function syncAutoExpandedBreadcrumbs(id: string) {
        const activeAncestors = getHeadingAncestorIds(breadcrumbs, id);
        const collapsedSet = new Set(collapsedBreadcrumbs);
        const autoExpandedSet = new Set(autoExpandedBreadcrumbs);

        for (const sectionId of autoExpandedSet) {
            if (!activeAncestors.has(sectionId)) {
                collapsedSet.add(sectionId);
                autoExpandedSet.delete(sectionId);
            }
        }

        for (const sectionId of activeAncestors) {
            if (collapsedSet.has(sectionId)) {
                collapsedSet.delete(sectionId);
                autoExpandedSet.add(sectionId);
            }
        }

        collapsedBreadcrumbs = [...collapsedSet];
        autoExpandedBreadcrumbs = [...autoExpandedSet];
    }

    function resetArticleScroll() {
        if (pageContainer) pageContainer.scrollTop = 0;
    }

    function getWikipediaSourceUrl(articleTitle: string) {
        return `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle.replaceAll(" ", "_"))}`;
    }

    function randomizeSkeletonWidths(seed: string) {
        let state = 2166136261;

        for (const character of seed) {
            state ^= character.charCodeAt(0);
            state = Math.imul(state, 16777619);
        }

        skeletonWidths = Array.from({ length: 8 }, () => {
            state = Math.imul(state, 1664525) + 1013904223;
            return 62 + ((state >>> 0) % 39);
        });
    }

    function updateActiveBreadcrumb() {
        let activeId = breadcrumbs[0]?.id ?? "";
        const scrollOffset = 140;

        for (const heading of breadcrumbs) {
            const element = document.getElementById(heading.id);
            if (!element) continue;

            if (element.getBoundingClientRect().top <= scrollOffset) {
                activeId = heading.id;
            } else {
                break;
            }
        }

        syncAutoExpandedBreadcrumbs(activeId);

        if (activeBreadcrumbId !== activeId) {
            activeBreadcrumbId = activeId;
            requestAnimationFrame(syncActiveBreadcrumbIntoView);
        }
    }

    function getAncestorSectionIds(id: string) {
        const sectionIndex = content.findIndex((block) => block.type === "heading" && block.heading.id === id);
        if (sectionIndex === -1) return new Set<string>();

        return getBlockAncestorIds(content, sectionIndex);
    }

    async function openBreadcrumb(id: string, event: MouseEvent) {
        event.preventDefault();

        expandBreadcrumbForJump(id);
        await tick();

        const ancestorSectionIds = getAncestorSectionIds(id);
        if (collapsedSections.some((sectionId) => ancestorSectionIds.has(sectionId))) {
            collapsedSections = collapsedSections.filter((sectionId) => !ancestorSectionIds.has(sectionId));
            await tick();
        }

        document.getElementById(id)?.scrollIntoView();
        activeBreadcrumbId = id;
        history.pushState(null, "", `#${id}`);
        requestAnimationFrame(syncActiveBreadcrumbIntoView);
    }

    $effect(() => {
        page.params.title;
        loadPage();
    });

    $effect(() => {
        if (scrollElement) {
            const element = document.getElementById(scrollElement);
            if (element) {
                element.scrollIntoView();
                activeBreadcrumbId = scrollElement;
            }
        }
    });

    async function loadPage() {
        resetArticleScroll();
        isLoading = true;
        randomizeSkeletonWidths(page.params.title ?? "");
        title = "";
        content = [];
        breadcrumbs = [];
        words = 0;
        references = 0;
        readingTime = 0;
        scrollElement = "";
        collapsedSections = [];
        collapsedBreadcrumbs = [];
        autoExpandedBreadcrumbs = [];

        try {
            const api = new WikipediaAPI();
            const pageContent = await api.getPageContent(page.params.title ?? "");
            const article = parseArticle(pageContent, page.url.hash);

            title = article.title;
            content = article.blocks;
            breadcrumbs = article.headings;
            words = article.stats.words;
            references = article.stats.links;
            readingTime = article.stats.readingMinutes;
            scrollElement = article.scrollTarget;
            document.title = `${title} • Lemma`;

            activeBreadcrumbId = breadcrumbs[0]?.id ?? "";
            collapsedBreadcrumbs = getCollapsibleBreadcrumbIds();
            syncAutoExpandedBreadcrumbs(activeBreadcrumbId);
        } finally {
            isLoading = false;
        }

        await tick();
        updateActiveBreadcrumb();
    }
</script>

<svelte:window onscroll={updateActiveBreadcrumb} />

<div id="pageContainer" bind:this={pageContainer} onscroll={updateActiveBreadcrumb}>
    <Navbar></Navbar>
    <title>{page.params.title} • Lemma</title>
    <div id="contentContainer">
        {#if isLoading}
            <div class="article-skeleton" aria-label="Loading article" aria-busy="true">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-meta"></div>
                <div class="skeleton skeleton-rule"></div>
                {#each skeletonWidths.slice(0, 5) as width}
                    <div class="skeleton skeleton-line" style={`--skeleton-width: ${width}%`}></div>
                {/each}
                <br />
                {#each skeletonWidths.slice(5) as width}
                    <div class="skeleton skeleton-line" style={`--skeleton-width: ${width}%`}></div>
                {/each}
            </div>
        {:else}
            <h1 id="title">{title}</h1>
            <div class="article-meta">
                <mini>{words} words · {references} links · {readingTime} min read</mini>
                <a class="source-link" href={getWikipediaSourceUrl(title)} target="_blank" rel="noreferrer"
                    >Wikipedia source ↗</a
                >
            </div>
            <hr />

            <ArticleContent blocks={content} collapsedSectionIds={collapsedSections} onToggleSection={toggleSection} />

            {#each { length: 12 }}
                <br />
            {/each}
        {/if}
    </div>

    {#if !isLoading}
        <ArticleBreadcrumbs
            {title}
            headings={breadcrumbs}
            activeId={activeBreadcrumbId}
            collapsedIds={collapsedBreadcrumbs}
            onToggle={toggleBreadcrumb}
            onOpen={openBreadcrumb}
        />
    {/if}
</div>

<style>
    #pageContainer {
        position: absolute;
        font-family: satoshi;
        width: 100%;
        height: 100%;

        left: 0;
        top: 0;
        overflow-x: hidden;
    }

    #contentContainer {
        position: absolute;

        width: min(50ch, calc(100vw - 4rem));
        max-width: 50ch;

        top: 2.5%;
        height: 100%;
        padding: 5%;
        left: calc(25% - 5ch);
        line-height: 2rem;
    }

    #title {
        width: calc(110% - 5vw);
    }

    .article-meta {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 1rem;
    }

    .source-link {
        flex: 0 0 auto;
        min-width: 8rem;
        font-family: gambetta;
        font-size: 0.78rem;
        text-align: center;
        opacity: 0.7;
    }

    .article-skeleton {
        padding-top: 1.25rem;
        opacity: 0;
        animation: appear 0.25s ease-out forwards;
    }

    @keyframes appear {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }

    .skeleton {
        background: linear-gradient(
            90deg,
            color-mix(in oklch, var(--secondary) 65%, transparent) 25%,
            color-mix(in oklch, var(--secondary) 35%, var(--page-bg)) 50%,
            color-mix(in oklch, var(--secondary) 65%, transparent) 75%
        );
        background-size: 200% 100%;
        border-radius: 6px;
        animation: skeleton-shimmer 1.4s ease-in-out infinite;
    }

    .skeleton-title {
        width: min(70%, 22rem);
        height: 2rem;
        margin-bottom: 0.85rem;
    }

    .skeleton-meta {
        width: min(42%, 12rem);
        height: 0.8rem;
        margin-top: -0.4rem;
        margin-bottom: 1.25rem;
    }

    .skeleton-rule {
        width: 100%;
        height: 2px;
        margin-top: 0;
        margin-bottom: 1.5rem;
    }

    .skeleton-line {
        width: var(--skeleton-width);
        height: 0.9rem;
        margin-bottom: 1.05rem;
    }

    @keyframes skeleton-shimmer {
        from {
            background-position: 200% 0;
        }

        to {
            background-position: -200% 0;
        }
    }

    hr {
        width: 100%;
    }

    #contentContainer {
        h1 {
            min-height: 2rem;
            margin-bottom: -0.25rem;
        }

        mini {
            font-size: 0.85rem;
            font-style: italic;
            font-weight: 450;
        }
    }

    @media (max-width: 1050px) {
        #contentContainer {
            left: 50%;
            transform: translateX(-50%);
            width: min(82vw, 50ch);
        }
    }

    @media (max-width: 640px) {
        #contentContainer {
            width: min(88vw, 50ch);
            padding: 7% 0 5%;
        }
    }
</style>
