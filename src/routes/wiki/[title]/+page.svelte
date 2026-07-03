<script lang="ts">
    import "../../../app.css";
    import { page } from "$app/state";
    import { onMount, tick } from "svelte";
    import { WikipediaAPI } from "$lib/api/wikipedia";
    import { include } from "rolldown/filter";

    let title = $state("");
    let content = $state([]);
    let breadcrumbs = $state([]);
    let firstImg = $state("");

    let words = $state(0);
    let references = $state(0);
    let readingTime = $state(0);

    let scrollElement = $state("");

    $effect(() => {
        page.params.title;
        loadPage();
    });

    $effect(() => {
        if (scrollElement) {
            let element = document.getElementById(scrollElement);
            if (element) {
                element.scrollIntoView();
            }
        }
    });

    async function loadPage() {
        words = 0;
        references = 0;
        readingTime = 0;

        const api = new WikipediaAPI();
        let pageContent = await api.getPageContent(page.params.title);
        title = pageContent.title;
        document.title = `${title} • Lemma`;

        let fetchedContent = pageContent.text["*"]
            .replace(/<style [^>]+>.+<\/style>/g, "")
            .replace(/<span class="mw-editsection">.+<\/span>/g, "");

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
                content.push([element.tagName, element.textContent, element.href]);
                references += 1;
            } else if (element.tagName.includes("H")) {
                let hash = page.url.hash.replace("#", "");
                if (hash === element.id) {
                    scrollElement = hash;
                }

                content.push([element.tagName, element.textContent, element.id]);
                breadcrumbs.push([element.textContent, element.id]);
                words += element.textContent.split(" ").length;
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
    }
</script>

<div id="pageContainer">
    <title>{page.params.title} • Lemma</title>
    <!-- <div id="navbar">Lemma</div> -->
    <div id="contentContainer">
        <h1 id="title">{title}</h1>
        <mini>{words} words · {references} links · {parseInt(words / 200)} min read</mini>
        <hr />

        {#each content as section, i}
            {#if section[0] === "IMG"}
                {#if i > 0 && content[i - 1][0] !== "IMG"}
                    <br />
                {/if}

                <img alt src={section[1]} class="img" />

                {#if !(i > 0 && i < content.length && content[i - 1][0] !== "IMG" && content[i + 1][0] !== "IMG")}
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
                    <button class="chev"><img alt src="/icon/chev_open.svg" class="icon" /></button>{section[1]}
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
        {/each}

        {#each { length: 12 }}
            <br />
        {/each}
    </div>

    <div id="breadcrumbs">
        <b>{title}</b>
        <br />
        {#each breadcrumbs as crumb}
            <a href="#{crumb[1].replaceAll(' ', '_')}">{crumb[0]}</a>
            <br />
        {/each}
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
        pointer-events: none;

        height: 80%;

        width: fit-content;
        max-width: calc(30% - 5ch - 10%);
        min-width: calc(30% - 5ch - 10%);

        b {
            font-size: 1.2rem;
        }

        a {
            color: var(--color);
            pointer-events: all;
        }

        a:focus {
            outline: none;
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
