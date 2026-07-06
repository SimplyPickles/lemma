<script lang="ts">
    import "../../../app.css";
    import { page } from "$app/state";
    import { tick } from "svelte";
    import { WikipediaAPI } from "$lib/api/wikipedia";

    type ContentSection = [string, string, string?];
    type Breadcrumb = [string, string, string];

    let title = $state("");
    let content = $state<ContentSection[]>([]);
    let breadcrumbs = $state<Breadcrumb[]>([]);
    let firstImg = $state("");

    let words = $state(0);
    let references = $state(0);
    let readingTime = $state(0);

    let scrollElement = $state("");
    let collapsedSections = $state<string[]>([]);
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

    function getBreadcrumbClass(tag: string, id: string) {
        return `breadcrumb breadcrumb-${tag.toLowerCase()}${activeBreadcrumbId === id ? " active" : ""}`;
    }

    function syncActiveBreadcrumbIntoView() {
        document.querySelector("#crumbs .breadcrumb.active")?.scrollIntoView({
            block: "nearest",
        });
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

        if (activeBreadcrumbId !== activeId) {
            activeBreadcrumbId = activeId;
            requestAnimationFrame(syncActiveBreadcrumbIntoView);
        }
    }

    function getParentH2IdFromIndex(index: number) {
        for (let i = index; i >= 0; i--) {
            const section = content[i];

            if (section[0] === "H2") {
                return section[2] ?? "";
            }
        }

        return "";
    }

    function getParentH2Id(id: string) {
        const sectionIndex = content.findIndex((section) => section[2] === id);
        if (sectionIndex === -1) return "";

        return getParentH2IdFromIndex(sectionIndex);
    }

    function isHiddenByCollapsedH2(index: number) {
        if (content[index][0] === "H2") return false;

        const parentH2Id = getParentH2IdFromIndex(index);
        if (!parentH2Id) return false;

        return collapsedSections.includes(parentH2Id);
    }

    async function openBreadcrumb(id: string, event: MouseEvent) {
        event.preventDefault();

        const parentH2Id = getParentH2Id(id);
        if (parentH2Id && collapsedSections.includes(parentH2Id)) {
            collapsedSections = collapsedSections.filter((sectionId) => sectionId !== parentH2Id);
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
        words = 0;
        references = 0;
        readingTime = 0;
        firstImg = "";
        collapsedSections = [];

        const api = new WikipediaAPI();
        let pageContent = await api.getPageContent(page.params.title ?? "");
        title = pageContent.title;
        document.title = `${title} • Lemma`;

        let fetchedContent = pageContent.text["*"]
            .replace(new RegExp("<style [^>]+>.+</style>", "g"), "")
            .replace(new RegExp('<span class="mw-editsection">.+</span>', "g"), "");

        let elem = document.createElement("div");
        elem.innerHTML = fetchedContent;
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

        let selectors = "p, h1, h2, h3, ul, ol, img";
        if (elem.textContent.startsWith("Redirect")) {
            selectors += ", a";
        }

        let elements = elem.querySelectorAll(selectors);

        breadcrumbs = [];
        content = [];
        for (const element of elements) {
            if (element.tagName === "IMG") {
                if (firstImg.length === 0) {
                    firstImg = (element as HTMLImageElement).src;
                } else {
                    const isBlockedImage = (src: string) =>
                        ["Symbol_category_class", "Question_book-new", "Wikisource-logo"].some((pattern) =>
                            src.includes(pattern),
                        );

                    const src = (element as HTMLImageElement).src;
                    if (!isBlockedImage(src)) {
                        content.push(["IMG", src]);
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
            } else if (element.tagName === "UL") {
                if (element.parentElement?.parentElement?.tagName !== "DIV") {
                    if (
                        !Array.from(element.parentElement?.classList ?? []).some((cls) => cls.includes("bar")) ||
                        element.innerHTML.includes("collapsable-list")
                    ) {
                        content.push([element.tagName, element.innerHTML]);
                        words += element.textContent.split(" ").length;
                    }
                }
            }
        }

        activeBreadcrumbId = breadcrumbs[0]?.[1] ?? "";
        await tick();
        updateActiveBreadcrumb();
    }
</script>

<svelte:window onscroll={updateActiveBreadcrumb} />

<div id="pageContainer" bind:this={pageContainer} onscroll={updateActiveBreadcrumb}>
    <title>{page.params.title} • Lemma</title>
    <!-- <div id="navbar">Lemma</div> -->
    <div id="contentContainer">
        <h1 id="title">{title}</h1>
        <mini>{words} words · {references} links · {Math.floor(words / 200)} min read</mini>
        <hr />

        {#each content as section, i}
            {#if !isHiddenByCollapsedH2(i)}
                {#if section[0] === "IMG"}
                    {#if i > 0 && content[i - 1][0] !== "IMG"}
                        <br />
                    {/if}

                    <img alt="" src={section[1]} class="img" />

                    {#if !(i > 0 && i < content.length - 1 && content[i - 1][0] !== "IMG" && content[i + 1][0] !== "IMG")}
                        <br />
                    {/if}
                    <br />
                {:else if section[0] === "P"}
                    <p>
                        {@html section[1]}
                    </p>
                    {#if i < content.length - 1 && content[i + 1][0] === "P"}<br />{/if}
                {:else if section[0] === "H1"}
                    <h1 id={section[2]}>{section[1]}</h1>
                {:else if section[0] === "H2"}
                    <h2 id={section[2]}>
                        <br />
                        <button
                            class="chev"
                            type="button"
                            aria-label={isSectionCollapsed(section[2] ?? "") ? "Expand section" : "Collapse section"}
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
                        </button>{section[1]}
                    </h2>
                {:else if section[0] === "H3"}
                    <h3 id={section[2]}>{section[1]}</h3>
                {:else if section[0] === "H4"}
                    <h4 id={section[2]}>{section[1]}</h4>
                {:else if section[0] === "H5"}
                    <h5 id={section[2]}>{section[1]}</h5>
                {:else if section[0] === "H6"}
                    <h6 id={section[2]}>{section[1]}</h6>
                {:else if section[0] === "A"}
                    <a href={section[2]}>{section[1]}</a>
                {:else if section[0] === "UL"}
                    <ul>
                        {@html section[1]}
                    </ul>
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
                {#each breadcrumbs as crumb}
                    <a
                        class={getBreadcrumbClass(crumb[2], crumb[1])}
                        href="#{crumb[1].replaceAll(' ', '_')}"
                        onclick={(event) => openBreadcrumb(crumb[1], event)}>{crumb[0]}</a
                    >
                {/each}
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
        left: calc(30% - 5ch - 10%);
        line-height: 2rem;
    }

    #navbar {
        position: fixed;
        width: 100%;
        height: 68px;
        background: var(--page-bg);
        z-index: 10;
        left: 0;
        top: 0;
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

        #crumbFrame::before,
        #crumbFrame::after {
            content: "";
            position: absolute;
            left: 0;
            right: 14px;
            z-index: 2;
            height: 2.5rem;
            pointer-events: none;
        }

        #crumbFrame::before {
            top: 0;
            background: linear-gradient(var(--page-bg), transparent);
        }

        #crumbFrame::after {
            bottom: 0;
            background: linear-gradient(transparent, var(--page-bg));
        }

        #crumbs {
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 1.25rem 14px 1.25rem 0;
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

        .breadcrumb {
            display: block;
            line-height: 1.25rem;
            margin-bottom: 0.25rem;
            opacity: 0.8;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .breadcrumb:hover {
            opacity: 1;
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

    .img {
        border-radius: 9px;
        display: inline-block;
        transition: 0.2s ease;
        cursor: pointer;
        transform-origin: center;
        border: solid rgba(0, 0, 0, 0.1) 0.5px;
        outline: solid var(--secondary) 1.5px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 12px 1px;
        max-width: 100%;
        opacity: 0.9;
    }

    .img:hover {
        transform: scale(1.015);
        opacity: 1;
    }

    p {
        text-align: justify;
    }

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
</style>
