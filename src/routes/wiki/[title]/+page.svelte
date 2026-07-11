<script lang="ts">
    import "../../../app.css";
    import { page } from "$app/state";
    import { tick } from "svelte";
    import { WikipediaAPI } from "$lib/api/wikipedia";
    import Navbar from "../../../components/Navbar.svelte";

    type ContentSection = [string, string, string?];
    type Breadcrumb = [string, string, string];

    const excludedContentSelector = [
        ".infobox",
        ".sidebar",
        ".navbox",
        ".metadata",
        ".ambox",
        ".hatnote",
        ".mw-editsection",
        "table",
    ].join(", ");

    let title = $state("");
    let content = $state<ContentSection[]>([]);
    let breadcrumbs = $state<Breadcrumb[]>([]);
    let firstImg = $state("");

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

    function isSectionCollapsed(id: string) {
        return collapsedSections.includes(id);
    }

    function getAdjacentImages(index: number) {
        const images: ContentSection[] = [];

        for (let i = index; i < content.length && content[i][0] === "IMG"; i++) {
            images.push(content[i]);
        }

        return images;
    }

    function normalizeImageSrc(src: string) {
        if (src.startsWith("//")) return `https:${src}`;
        return src;
    }

    function getHigherResolutionWikimediaImageSrc(src: string) {
        const normalizedSrc = normalizeImageSrc(src);
        const targetWidth = 960;

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

    function getBestImageSrc(image: HTMLImageElement) {
        const srcsetCandidates = image.srcset
            .split(",")
            .map((candidate) => candidate.trim().split(/\s+/)[0])
            .filter(Boolean);
        const largestSrcsetCandidate = srcsetCandidates.at(-1);

        return getHigherResolutionWikimediaImageSrc(largestSrcsetCandidate ?? image.src);
    }

    function isHeading(tag: string) {
        return /^H[1-6]$/.test(tag);
    }

    function isFoldableHeading(tag: string) {
        return /^H[1-4]$/.test(tag);
    }

    function getHeadingElement(tag: string) {
        return tag.toLowerCase();
    }

    function getHeadingLevel(tag: string) {
        return Number(tag.replace("H", ""));
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

    function isBreadcrumbCollapsed(id: string) {
        return collapsedBreadcrumbs.includes(id);
    }

    function breadcrumbHasChildren(index: number, breadcrumbList = breadcrumbs) {
        const level = getHeadingLevel(breadcrumbList[index][2]);

        for (let i = index + 1; i < breadcrumbList.length; i++) {
            const nextLevel = getHeadingLevel(breadcrumbList[i][2]);

            if (nextLevel <= level) return false;
            if (nextLevel > level) return true;
        }

        return false;
    }

    function getCollapsibleBreadcrumbIds(breadcrumbList = breadcrumbs) {
        return breadcrumbList
            .filter((_, index) => breadcrumbHasChildren(index, breadcrumbList))
            .map((crumb) => crumb[1]);
    }

    function isBreadcrumbHidden(index: number) {
        let childLevel = getHeadingLevel(breadcrumbs[index][2]);

        for (let i = index - 1; i >= 0; i--) {
            const ancestorLevel = getHeadingLevel(breadcrumbs[i][2]);

            if (ancestorLevel < childLevel) {
                if (collapsedBreadcrumbs.includes(breadcrumbs[i][1])) {
                    return true;
                }

                childLevel = ancestorLevel;
            }
        }

        return false;
    }

    function getBreadcrumbClass(tag: string, id: string) {
        return `breadcrumb breadcrumb-${tag.toLowerCase()}${activeBreadcrumbId === id ? " active" : ""}`;
    }

    function syncActiveBreadcrumbIntoView() {
        document.querySelector("#crumbs .breadcrumb.active")?.scrollIntoView({
            block: "nearest",
        });
    }

    function getBreadcrumbAncestorIds(id: string) {
        const index = breadcrumbs.findIndex((crumb) => crumb[1] === id);
        if (index === -1) return new Set<string>();

        const ancestors = new Set<string>();
        let childLevel = getHeadingLevel(breadcrumbs[index][2]);

        for (let i = index - 1; i >= 0; i--) {
            const ancestorLevel = getHeadingLevel(breadcrumbs[i][2]);

            if (ancestorLevel < childLevel) {
                ancestors.add(breadcrumbs[i][1]);
                childLevel = ancestorLevel;
            }
        }

        return ancestors;
    }

    function expandBreadcrumbForJump(id: string) {
        const idsToExpand = getBreadcrumbAncestorIds(id);
        idsToExpand.add(id);

        collapsedBreadcrumbs = collapsedBreadcrumbs.filter((sectionId) => !idsToExpand.has(sectionId));
        autoExpandedBreadcrumbs = autoExpandedBreadcrumbs.filter((sectionId) => sectionId !== id);
    }

    function syncAutoExpandedBreadcrumbs(id: string) {
        const activeAncestors = getBreadcrumbAncestorIds(id);
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

    function updateActiveBreadcrumb() {
        let activeId = breadcrumbs[0]?.[1] ?? "";
        const scrollOffset = 140;

        for (const crumb of breadcrumbs) {
            const element = document.getElementById(crumb[1]);
            if (!element) continue;

            if (element.getBoundingClientRect().top <= scrollOffset) {
                activeId = crumb[1];
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

    function getAncestorSectionIdsFromIndex(index: number) {
        const ancestors = new Set<string>();
        const section = content[index];
        let childLevel = isHeading(section[0]) ? getHeadingLevel(section[0]) : 7;

        for (let i = index - 1; i >= 0; i--) {
            const ancestor = content[i];
            if (!isFoldableHeading(ancestor[0])) continue;

            const ancestorLevel = getHeadingLevel(ancestor[0]);
            if (ancestorLevel < childLevel) {
                const ancestorId = ancestor[2];
                if (ancestorId) ancestors.add(ancestorId);
                childLevel = ancestorLevel;
            }
        }

        return ancestors;
    }

    function getAncestorSectionIds(id: string) {
        const sectionIndex = content.findIndex((section) => section[2] === id);
        if (sectionIndex === -1) return new Set<string>();

        return getAncestorSectionIdsFromIndex(sectionIndex);
    }

    function isHiddenByCollapsedSection(index: number) {
        const ancestorIds = getAncestorSectionIdsFromIndex(index);

        return collapsedSections.some((sectionId) => ancestorIds.has(sectionId));
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
            let element = document.getElementById(scrollElement);
            if (element) {
                element.scrollIntoView();
                activeBreadcrumbId = scrollElement;
            }
        }
    });

    async function loadPage() {
        resetArticleScroll();
        words = 0;
        references = 0;
        readingTime = 0;
        firstImg = "";
        scrollElement = "";
        collapsedSections = [];
        collapsedBreadcrumbs = [];
        autoExpandedBreadcrumbs = [];

        const api = new WikipediaAPI();
        let pageContent = await api.getPageContent(page.params.title ?? "");
        title = pageContent.title;
        document.title = `${title} • Lemma`;

        let fetchedContent = pageContent.text["*"]
            .replace(new RegExp("<style [^>]+>.+</style>", "g"), "")
            .replace(new RegExp('<span class="mw-editsection">.+</span>', "g"), "");

        let elem = document.createElement("div");
        elem.innerHTML = fetchedContent;

        elem.querySelectorAll(excludedContentSelector).forEach((element) => element.remove());

        for (const child of elem.children[0].children) {
            if (
                child.classList.contains("plainlist") ||
                child.classList.contains("infobox") ||
                child.classList.contains("sidebar")
            ) {
                child.remove();
            }
        }

        let images = elem.querySelectorAll('img[alt*="Edit"]');
        images.forEach((img) => img.remove());

        let selectors = "p, h1, h2, h3, h4, h5, h6, ul, ol, img";
        if (elem.textContent.startsWith("Redirect")) {
            selectors += ", a";
        }

        let elements = elem.querySelectorAll(selectors);

        breadcrumbs = [];
        content = [];
        for (const element of elements) {
            const isReferenceList =
                element.tagName === "OL" &&
                (element.classList.contains("references") || element.closest(".reflist") !== null);
            const isNestedList =
                (element.tagName === "UL" || element.tagName === "OL") && element.parentElement?.closest("li") !== null;
            const isExcludedElement = element.closest(excludedContentSelector) !== null;

            if (isExcludedElement && !isReferenceList) continue;

            if (element.tagName === "IMG") {
                if (firstImg.length === 0) {
                    firstImg = (element as HTMLImageElement).src;
                } else {
                    const isBlockedImage = (src: string) =>
                        ["Symbol_category_class", "Question_book-new", "Wikisource-logo"].some((pattern) =>
                            src.includes(pattern),
                        );

                    const image = element as HTMLImageElement;
                    const src = getBestImageSrc(image);
                    if (!isBlockedImage(src)) {
                        content.push(["IMG", src, image.alt]);
                    }
                }
            } else if (element.tagName === "P") {
                if (element.textContent.trim().length > 0) {
                    content.push([element.tagName, element.innerHTML]);
                    words += element.textContent.split(" ").length;
                    references += element.innerHTML.split("<a").length;
                }
            } else if (element.tagName === "A") {
                content.push([element.tagName, element.textContent ?? "", (element as HTMLAnchorElement).href]);
                references += 1;
            } else if (element.tagName.includes("H")) {
                let hash = page.url.hash.replace("#", "");
                if (hash === element.id) {
                    scrollElement = hash;
                }

                content.push([element.tagName, element.textContent ?? "", element.id]);
                breadcrumbs.push([element.textContent ?? "", element.id, element.tagName]);
                words += (element.textContent ?? "").split(" ").length;
            } else if (element.tagName === "UL" || element.tagName === "OL") {
                if (!isNestedList && element.textContent.trim().length > 0) {
                    content.push([element.tagName, element.innerHTML]);
                    words += element.textContent.split(" ").length;
                    references += element.querySelectorAll("a").length;
                }
            }
        }

        activeBreadcrumbId = breadcrumbs[0]?.[1] ?? "";
        collapsedBreadcrumbs = getCollapsibleBreadcrumbIds();
        autoExpandedBreadcrumbs = [];
        syncAutoExpandedBreadcrumbs(activeBreadcrumbId);
        await tick();
        updateActiveBreadcrumb();
    }
</script>

<svelte:window onscroll={updateActiveBreadcrumb} />

<div id="pageContainer" bind:this={pageContainer} onscroll={updateActiveBreadcrumb}>
    <Navbar></Navbar>
    <title>{page.params.title} • Lemma</title>
    <div id="contentContainer">
        <h1 id="title">{title}</h1>
        <mini>{words} words · {references} links · {Math.floor(words / 200)} min read</mini>
        <hr />

        {#each content as section, i}
            {#if !isHiddenByCollapsedSection(i)}
                {#if section[0] === "IMG"}
                    {#if i === 0 || content[i - 1][0] !== "IMG"}
                        {@const adjacentImages = getAdjacentImages(i)}
                        <figure class={`wiki-images ${adjacentImages.length > 1 ? "adjacent-images" : ""}`}>
                            {#each adjacentImages as image}
                                <img alt={image[2] ?? ""} src={image[1]} loading="lazy" decoding="async" />
                            {/each}
                        </figure>
                    {/if}
                {:else if section[0] === "P"}
                    <p>
                        {@html section[1]}
                    </p>
                    {#if i < content.length - 1 && content[i + 1][0] === "P"}<br />{/if}
                {:else if isHeading(section[0])}
                    {#if section[0] === "H1"}<br />{/if}
                    <svelte:element this={getHeadingElement(section[0])} id={section[2]}>
                        {#if section[0] === "H2"}<br />{/if}
                        {#if isFoldableHeading(section[0])}
                            <button
                                class="chev"
                                type="button"
                                aria-label={isSectionCollapsed(section[2] ?? "")
                                    ? "Expand section"
                                    : "Collapse section"}
                                aria-expanded={!isSectionCollapsed(section[2] ?? "")}
                                onclick={() => toggleSection(section[2] ?? "")}
                            >
                                <img
                                    alt=""
                                    src={isSectionCollapsed(section[2] ?? "")
                                        ? "/icon/chev_close.svg"
                                        : "/icon/chev_open.svg"}
                                    class="icon"
                                />
                            </button>
                        {/if}{section[1]}
                    </svelte:element>
                {:else if section[0] === "A"}
                    <a href={section[2]}>{section[1]}</a>
                {:else if section[0] === "UL"}
                    <ul>
                        {@html section[1]}
                    </ul>
                {:else if section[0] === "OL"}
                    <ol>
                        {@html section[1]}
                    </ol>
                {/if}
            {/if}
        {/each}

        {#each { length: 12 }}
            <br />
        {/each}
    </div>

    <div id="breadcrumbs">
        <b>{title}</b>
        <div id="crumbFrame">
            <div id="crumbs">
                {#each breadcrumbs as crumb, i}
                    {#if !isBreadcrumbHidden(i)}
                        <div class="breadcrumb-row">
                            {#if breadcrumbHasChildren(i)}
                                <button
                                    class="breadcrumb-fold"
                                    type="button"
                                    aria-label={isBreadcrumbCollapsed(crumb[1])
                                        ? "Expand breadcrumb section"
                                        : "Collapse breadcrumb section"}
                                    aria-expanded={!isBreadcrumbCollapsed(crumb[1])}
                                    onclick={(event) => toggleBreadcrumb(crumb[1], event)}
                                >
                                    <img
                                        alt=""
                                        src={isBreadcrumbCollapsed(crumb[1])
                                            ? "/icon/chev_close.svg"
                                            : "/icon/chev_open.svg"}
                                        style={`--chevron-icon: url(${isBreadcrumbCollapsed(crumb[1]) ? "/icon/chev_close.svg" : "/icon/chev_open.svg"})`}
                                        class="icon"
                                    />
                                </button>
                            {:else}
                                <span class="breadcrumb-fold-spacer"></span>
                            {/if}
                            <a
                                class={getBreadcrumbClass(crumb[2], crumb[1])}
                                href="#{crumb[1].replaceAll(' ', '_')}"
                                onclick={(event) => openBreadcrumb(crumb[1], event)}>{crumb[0]}</a
                            >
                        </div>
                    {/if}
                {/each}
                <div class="crumb-spacer" aria-hidden="true"></div>
            </div>
        </div>
    </div>
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

        max-width: 50ch;

        top: 2.5%;
        height: 100%;
        padding: 5%;
        left: calc(25% - 5ch);
        line-height: 2rem;
    }

    #breadcrumbs {
        position: fixed;

        left: 32px;
        top: 100px;

        height: 80%;

        width: fit-content;
        max-width: calc(30% - 5ch - 10%);
        min-width: calc(30% - 5ch - 10%);
        overflow: hidden;

        b {
            display: block;
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
        }

        #crumbFrame {
            position: relative;
            height: calc(100% - 2.5rem);
            overflow: hidden;
        }

        #crumbs {
            scroll-behavior: smooth;
            overscroll-behavior: contain;
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 0 14px 4rem 0;
            scroll-padding: 2.5rem 0 4rem;
            scrollbar-gutter: stable;
        }

        a {
            width: 80%;
            color: var(--color);
            pointer-events: all;
        }

        a:focus {
            outline: none;
        }

        .breadcrumb-row {
            display: flex;
            align-items: flex-start;
            gap: 0.2rem;
            min-width: 0;
        }

        .breadcrumb-fold,
        .breadcrumb-fold-spacer {
            flex: 0 0 1rem;
            width: 1rem;
            height: 1.25rem;
            margin: 0;
        }

        .breadcrumb-fold {
            display: grid;
            place-items: center;
            border: none;
            padding: 0;
            background: none;
            color: var(--color);
            cursor: pointer;
            opacity: 0.75;
        }

        .breadcrumb-fold:hover {
            opacity: 1;
        }

        .breadcrumb-fold:focus,
        .breadcrumb-fold:focus-visible {
            outline: none;
        }

        .breadcrumb-fold img {
            width: 0.95rem;
            height: 0.95rem;
            background: currentColor;
            mask: var(--chevron-icon) center / contain no-repeat;
            -webkit-mask: var(--chevron-icon) center / contain no-repeat;
        }

        .breadcrumb {
            display: block;
            line-height: 1.25rem;
            margin-bottom: 0.25rem;
            opacity: 0.8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            min-width: 0;
        }

        .breadcrumb:hover {
            opacity: 1;
        }

        .crumb-spacer {
            height: 3rem;
        }

        .breadcrumb.active {
            color: oklch(0.45 0.18 var(--hue));
            font-weight: 700;
            opacity: 1;
            text-decoration-color: oklch(0.45 0.18 var(--hue) / 45%);
        }

        .breadcrumb-h1 {
            font-size: 1rem;
            font-weight: 650;
            margin-left: 0;
        }

        .breadcrumb-h2 {
            font-size: 0.95rem;
            font-weight: 600;
            margin-left: 0.35rem;
        }

        .breadcrumb-h3 {
            font-size: 0.85rem;
            font-weight: 500;
            margin-left: 0.9rem;
        }

        .breadcrumb-h4 {
            font-size: 0.78rem;
            font-weight: 450;
            margin-left: 1.35rem;
        }

        .breadcrumb-h5 {
            font-size: 0.72rem;
            font-weight: 425;
            margin-left: 1.75rem;
        }

        .breadcrumb-h6 {
            font-size: 0.68rem;
            font-weight: 400;
            margin-left: 2.1rem;
        }
    }

    #firstImg {
        height: 160px;
    }

    #title {
        width: calc(110% - 5vw);
    }

    hr {
        animation: animate-hr 0.25s ease forwards;
        animation-delay: 0.25s;
        opacity: 0;
    }

    @keyframes animate-hr {
        0% {
            width: 0%;
            opacity: 0;
            margin-right: 100%;
        }
        100% {
            opacity: 1;
        }
    }

    .chev {
        position: relative;
        border: none;
        background: none;
        cursor: pointer;

        width: 1.5rem;
        height: 1.5rem;
        margin-right: 0.5rem;
        margin-left: -2rem;

        img {
            position: absolute;

            left: -12.5%;
            top: calc(-12.5% + 2px);

            width: 125%;
        }
    }

    .wiki-images {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.8rem;
        margin: 1.5rem 0;
        flex-wrap: wrap;
    }

    .wiki-images img {
        border-radius: 9px;
        display: block;
        transition: 0.2s ease;
        cursor: pointer;
        transform-origin: center;
        border: solid rgba(0, 0, 0, 0.1) 0.5px;
        outline: solid var(--secondary) 0.5px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 12px 1px;
        max-width: 100%;
        max-height: 70vh;
        height: auto;
        object-fit: contain;
        opacity: 0.9;
    }

    .wiki-images.adjacent-images img {
        flex: 0 1 calc(50% - 0.4rem);
        min-width: min(12rem, 100%);
        max-width: calc(50% - 0.4rem);
    }

    .wiki-images img:hover {
        transform: scale(1.015);
        opacity: 1;
    }

    #contentContainer {
        h1 {
            min-height: 2rem;
            margin-bottom: -0.25rem;
            animation: popup 0.75s ease forwards;
            animation-delay: 0.25s;
            opacity: 0;
        }

        mini {
            font-size: 0.85rem;
            font-style: italic;
            font-weight: 450;
            animation: popup 0.75s ease forwards;
        }

        :global(sup.reference),
        :global(.mw-ref) {
            line-height: 0;
        }

        :global(sup.reference a),
        :global(.mw-ref a) {
            line-height: 0;
        }
    }

    @keyframes popup {
        0% {
            opacity: 0;
            filter: blur(1px);
            transform: translateY(3px);
        }

        100% {
            opacity: 1;
        }
    }

    @media (max-width: 1050px) {
        #contentContainer {
            left: 50%;
            transform: translateX(-50%);
            width: min(82vw, 50ch);
        }

        #breadcrumbs {
            left: 0;
            top: 96px;
            width: 280px;
            min-width: 280px;
            max-width: 280px;
            height: min(72%, 620px);
            padding: 0.9rem 0.85rem;
            background: color-mix(in oklch, var(--page-bg) 92%, white 8%);
            border: solid 1px var(--secondary);
            border-left: none;
            border-radius: 0 9px 9px 0;
            box-shadow: 0 8px 24px var(--shadow-color);
            transform: translateX(calc(-100% + 34px));
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;
            z-index: 20;
        }

        #breadcrumbs:hover,
        #breadcrumbs:focus-within {
            transform: translateX(0);
            box-shadow: 0 12px 32px var(--shadow-color);
        }

        #breadcrumbs::after {
            content: "Sections";
            position: absolute;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            right: 7px;
            top: 1rem;
            bottom: 1rem;
            display: grid;
            place-items: center;
            color: var(--color);
            font-family: satoshi;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            opacity: 0.55;
            pointer-events: none;
            text-transform: uppercase;
        }

        #breadcrumbs:hover::after,
        #breadcrumbs:focus-within::after {
            opacity: 0;
        }

        #breadcrumbs b,
        #breadcrumbs #crumbFrame {
            width: calc(100% - 34px);
            opacity: 0;
            transition:
                opacity 0.15s ease,
                width 0.2s ease;
        }

        #breadcrumbs:hover b,
        #breadcrumbs:hover #crumbFrame,
        #breadcrumbs:focus-within b,
        #breadcrumbs:focus-within #crumbFrame {
            width: 100%;
            opacity: 1;
        }
    }

    @media (max-width: 640px) {
        #contentContainer {
            width: min(88vw, 50ch);
            padding: 7% 0 5%;
        }

        #breadcrumbs {
            top: 72px;
            width: min(82vw, 280px);
            min-width: min(82vw, 280px);
            max-width: min(82vw, 280px);
            height: 60%;
        }

        .wiki-images.adjacent-images img {
            flex-basis: 100%;
            max-width: 100%;
        }
    }
</style>
