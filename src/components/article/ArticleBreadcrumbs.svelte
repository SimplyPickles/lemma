<script lang="ts">
    import { headingHasChildren, isHeadingHiddenByCollapsed } from "$lib/article/articleNavigation";
    import type { ArticleHeading } from "$lib/article/types";

    interface Props {
        title: string;
        headings: ArticleHeading[];
        activeId: string;
        collapsedIds: string[];
        onToggle: (id: string, event: MouseEvent) => void;
        onOpen: (id: string, event: MouseEvent) => void;
    }

    let { title, headings, activeId, collapsedIds, onToggle, onOpen }: Props = $props();

    function isCollapsed(id: string) {
        return collapsedIds.includes(id);
    }

    function getBreadcrumbClass(heading: ArticleHeading) {
        return `breadcrumb breadcrumb-${heading.tag.toLowerCase()}${activeId === heading.id ? " active" : ""}`;
    }
</script>

<div id="breadcrumbs">
    <b>{title}</b>
    <div id="crumbFrame">
        <div id="crumbs">
            {#each headings as heading}
                {#if !isHeadingHiddenByCollapsed(heading, headings, collapsedIds)}
                    <div class="breadcrumb-row">
                        {#if headingHasChildren(heading)}
                            <button
                                class="breadcrumb-fold"
                                type="button"
                                aria-label={isCollapsed(heading.id)
                                    ? "Expand breadcrumb section"
                                    : "Collapse breadcrumb section"}
                                aria-expanded={!isCollapsed(heading.id)}
                                onclick={(event) => onToggle(heading.id, event)}
                            >
                                <img
                                    alt=""
                                    src={isCollapsed(heading.id) ? "/icon/chev_close.svg" : "/icon/chev_open.svg"}
                                    style={`--chevron-icon: url(${isCollapsed(heading.id) ? "/icon/chev_close.svg" : "/icon/chev_open.svg"})`}
                                    class="icon"
                                />
                            </button>
                        {:else}
                            <span class="breadcrumb-fold-spacer"></span>
                        {/if}
                        <a
                            class={getBreadcrumbClass(heading)}
                            href="#{heading.id.replaceAll(' ', '_')}"
                            onclick={(event) => onOpen(heading.id, event)}>{heading.text}</a
                        >
                    </div>
                {/if}
            {/each}
            <div class="crumb-spacer" aria-hidden={true}></div>
        </div>
    </div>
</div>

<style>
    #breadcrumbs {
        position: fixed;

        left: 32px;
        top: 100px;

        height: 80%;

        width: fit-content;
        max-width: calc(30% - 5ch - 10%);
        min-width: calc(30% - 5ch - 10%);
        overflow: visible;
        animation: breadcrumbs-fade-in 0.45s ease both;

        b {
            display: block;
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
        }

        #crumbFrame {
            position: relative;
            height: calc(100% - 2.5rem);
            overflow: visible;
        }

        #crumbs {
            box-sizing: border-box;
            width: 100%;
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

    @keyframes breadcrumbs-fade-in {
        from {
            opacity: 0;
            filter: blur(2px);
        }

        to {
            opacity: 1;
            filter: blur(0);
        }
    }

    /* small screen breadcrumbs */
    @media (max-width: 1050px) {
        #breadcrumbs {
            left: 0;
            top: 96px;
            width: 280px;
            min-width: 280px;
            max-width: 280px;
            max-height: min(72%, 620px);
            padding: 0.9rem 0.85rem;
            background: color-mix(in oklch, var(--page-bg) 92%, white 8%);
            border: solid 1px var(--secondary);
            border-left: none;
            border-radius: 0 9px 9px 0;
            box-shadow: 0 8px 24px var(--shadow-color);
            transform: translateX(calc(-100% + 34px));
            transition: 0.15s ease-in;
            z-index: 20;
        }

        @media (max-width: 600px) {
            #breadcrumbs {
                margin-top: 60dvh;
                bottom: 96px;
                max-height: 32px;
            }

            #breadcrumbs:hover,
            #breadcrumbs:focus-within {
                animation: openblur 0.3s ease;
                max-height: min(72%, 620px);
                margin-top: calc(80dvh - min(72%, 620px) * 1.5);
            }
        }

        #breadcrumbs:hover,
        #breadcrumbs:focus-within {
            transform: translateX(0);
            box-shadow: 0 12px 32px var(--shadow-color);
        }

        #breadcrumbs::after {
            content: "Sections";
            @media (max-width: 600px) {
                content: "Sec";
            }
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
        }

        #breadcrumbs:hover b,
        #breadcrumbs:hover #crumbFrame,
        #breadcrumbs:focus-within b,
        #breadcrumbs:focus-within #crumbFrame {
            width: 100%;
            opacity: 1;
        }
    }

    /* large screen breadcrumbs */
    @media (max-width: 640px) {
        #breadcrumbs {
            top: 72px;
            width: min(82vw, 280px);
            min-width: min(82vw, 280px);
            max-width: min(82vw, 280px);
            height: 60%;
        }
    }

    @keyframes openblur {
        0% {
            filter: blur(4px);
            opacity: 0;
        }

        60% {
            filter: blur(1px);
        }

        100% {
            filter: blur(0px);
        }
    }
</style>
