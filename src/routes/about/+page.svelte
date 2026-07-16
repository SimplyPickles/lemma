<script lang="ts">
    import "../../app.css";
    import Navbar from "../../components/Navbar.svelte";
</script>

<Navbar></Navbar>
<div id="pageContainer">
    <title>About • Lemma</title>
    <div id="contentContainer">
        <h1 id="title">About Lemma</h1>
        <div class="article-meta">
            <mini>Why I built Lemma?</mini>
        </div>
        <hr />

        <p>
            Lemma is a private, fast Wikipedia reader built for calm, focused browsing. It strips away visual clutter
            and presents articles in a clean custom layout with strong typography and lightweight navigation.
        </p>
        <br />

        <h3>Why it exists</h3>
        <p>
            Lemma is designed for quick lookups, deeper reading, and browsing Wikipedia without the usual noise. It’s
            meant to feel private, fast, and pleasant enough that reading becomes the default.
        </p>

        <br />
        <h5>What does it do?</h5>
        <p>
            Lemma fetches Wikipedia articles directly from public endpoints, extracts readable content, and renders it
            in a distraction-free reader. It includes article stats, images, headings, links, and section navigation for
            longer pages.
        </p>
        <br />

        <h5>Built for reading</h5>
        <p>
            The interface uses a soft neutral background, local fonts, subtle shadows, and a centered reading width to
            keep the experience quiet and easy on the eyes. The goal is simple: make exploring knowledge feel
            effortless.
        </p>
        <br />

        <h3>Stack</h3>
        <p>
            Lemma is built with SvelteKit, Svelte 5, Vite, TypeScript, and Bun. It uses client-side Wikipedia requests,
            so there’s no API key, backend proxy, or server-side cache.
        </p>
        <p>
            The app is organized around reusable UI components and route-based pages for the landing screen, search,
            errors, and article readers.
        </p>
        <br />

        {#each { length: 12 }}
            <br />
        {/each}
    </div>
</div>

<style>
    #pageContainer {
        position: fixed;
        font-family: default-sans;
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
        font-family: default-serif;
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
