<script lang="ts">
    import { isBlockHiddenByCollapsed } from "$lib/article/articleNavigation";
    import { isFoldableHeadingTag } from "$lib/article/articleUtils";
    import type { ArticleBlock, ImageBlock } from "$lib/article/types";

    interface Props {
        blocks: ArticleBlock[];
        collapsedSectionIds: string[];
        onToggleSection: (id: string) => void;
    }

    let { blocks, collapsedSectionIds, onToggleSection }: Props = $props();
    let copiedHeadingId = $state("");
    let copiedResetTimer: ReturnType<typeof setTimeout>;

    async function copySectionLink(id: string) {
        const url = new URL(window.location.href);
        url.hash = id;

        await navigator.clipboard.writeText(url.toString());
        copiedHeadingId = id;
        clearTimeout(copiedResetTimer);
        copiedResetTimer = setTimeout(() => {
            copiedHeadingId = "";
        }, 1600);
    }

    function isSectionCollapsed(id: string) {
        return collapsedSectionIds.includes(id);
    }

    function getAdjacentImages(index: number) {
        const images: ImageBlock[] = [];

        for (let i = index; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.type !== "image") break;
            images.push(block);
        }

        return images;
    }

    function isHiddenByCollapsedSection(index: number) {
        return isBlockHiddenByCollapsed(blocks, index, collapsedSectionIds);
    }
</script>

{#each blocks as section, i}
    {#if !isHiddenByCollapsedSection(i)}
        {#if section.type === "image"}
            {#if i === 0 || blocks[i - 1].type !== "image"}
                {@const adjacentImages = getAdjacentImages(i)}
                <figure class={`wiki-images ${adjacentImages.length > 1 ? "adjacent-images" : ""}`}>
                    {#each adjacentImages as image}
                        <img alt={image.alt} src={image.src} loading="lazy" decoding="async" />
                    {/each}
                </figure>
            {/if}
        {:else if section.type === "paragraph"}
            <p>
                {@html section.html}
            </p>
        {:else if section.type === "heading"}
            {#if section.heading.tag === "H1"}<br />{/if}
            <svelte:element this={section.heading.tag.toLowerCase()} id={section.heading.id}>
                {#if section.heading.tag === "H2"}<br />{/if}
                {#if isFoldableHeadingTag(section.heading.tag)}
                    <button
                        class="chev"
                        type="button"
                        aria-label={isSectionCollapsed(section.heading.id) ? "Expand section" : "Collapse section"}
                        aria-expanded={!isSectionCollapsed(section.heading.id)}
                        onclick={() => onToggleSection(section.heading.id)}
                    >
                        <img
                            alt=""
                            src={isSectionCollapsed(section.heading.id)
                                ? "/icon/chev_close.svg"
                                : "/icon/chev_open.svg"}
                            class="icon"
                        />
                    </button>
                {/if}{section.heading.text}
                <button
                    class="copy-section"
                    class:copied={copiedHeadingId === section.heading.id}
                    type="button"
                    aria-label={`Copy link to ${section.heading.text}`}
                    title={copiedHeadingId === section.heading.id ? "Copied!" : "Copy link to section"}
                    onclick={() => copySectionLink(section.heading.id)}
                >
                    {copiedHeadingId === section.heading.id ? "Copied!" : "#"}
                </button>
            </svelte:element>
        {:else if section.type === "link"}
            <a href={section.href}>{section.text}</a>
        {:else if section.type === "list" && section.ordered}
            <ol>
                {@html section.html}
            </ol>
        {:else if section.type === "list"}
            <ul>
                {@html section.html}
            </ul>
        {/if}
    {/if}
{/each}

<style>
    .chev {
        transition:
            filter 0.15s,
            opacity 0.3s;

        position: relative;
        border: none;
        background: none;
        cursor: pointer;

        width: 1.5rem;
        height: 1.5rem;
        margin-right: 0.5rem;
        margin-left: -2rem;
    }

    @media (max-width: 600px) {
        .chev {
            position: absolute;
            right: 0;
        }
    }

    .chev:active {
        filter: blur(2px);
        opacity: 0.5;
    }

    .chev img {
        position: absolute;

        left: -12.5%;
        top: calc(-12.5% + 2px);

        width: 125%;
    }

    .copy-section {
        margin-left: 0.5rem;
        padding: 0.1rem 0.3rem;
        border: none;
        background: none;
        color: inherit;
        font-family: gambetta;
        font-size: 1rem;
        font-weight: 500;
        line-height: 1;
        cursor: pointer;
        opacity: 0;
        vertical-align: middle;
        transition: opacity 0.15s ease;

        @media (max-width: 600px) {
            opacity: 0.5;
        }
    }

    :global(h1:hover) .copy-section,
    :global(h2:hover) .copy-section,
    :global(h3:hover) .copy-section,
    :global(h4:hover) .copy-section,
    :global(h5:hover) .copy-section,
    :global(h6:hover) .copy-section,
    .copy-section:focus-visible,
    .copy-section.copied {
        opacity: 0.5;
    }

    .copy-section.copied {
        color: oklch(0.45 0.18 var(--hue));
        animation: copy-confirm 0.2s ease-in;
    }

    @keyframes copy-confirm {
        0% {
            opacity: 0;
            filter: blur(2px);
        }

        100% {
            transform: translateY(0) scale(1);
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
        transform-origin: center;
        border: solid rgba(0, 0, 0, 0.1) 0.5px;
        outline: solid var(--secondary) 0.5px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 12px 1px;
        max-width: 100%;
        max-height: 70dvh;
        height: auto;
        object-fit: contain;
    }

    .wiki-images.adjacent-images img {
        flex: 0 1 calc(50% - 0.4rem);
        min-width: min(12rem, 100%);
        max-width: calc(50% - 0.4rem);
    }

    :global(ul:has(> li img)),
    :global(ol:has(> li img)) {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(11rem, 100%), 1fr));
        gap: 1.25rem;
        margin: 1.5rem 0;
        padding: 0;
    }

    :global(li:has(img)) {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        width: auto !important;
        margin: 0 !important;
        padding: 0;
        list-style: none;
        line-height: 1.4;
    }

    :global(li:has(img) .thumb),
    :global(li:has(img) .thumbinner),
    :global(li:has(img) .gallerybox) {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        background: none !important;
    }

    :global(li:has(img) img) {
        display: block;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 9px;
        border: solid rgba(0, 0, 0, 0.1) 0.5px;
        outline: solid var(--secondary) 0.5px;
        box-shadow: rgba(0, 0, 0, 0.1) 0 0 12px 1px;
    }

    :global(li:has(img) .gallerytext),
    :global(li:has(img) .thumbcaption) {
        padding: 0 !important;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    :global(li:has(img) p) {
        margin: 0;
    }

    :global(sup.reference),
    :global(.mw-ref) {
        line-height: 0;
    }

    :global(sup.reference a),
    :global(.mw-ref a) {
        line-height: 0;
    }

    @media (max-width: 640px) {
        .wiki-images.adjacent-images img {
            flex-basis: 100%;
            max-width: 100%;
        }
    }
</style>
