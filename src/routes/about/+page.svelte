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
            <mini>Why was Lemma made?</mini>
        </div>
        <hr />

        <p style="--i: 0">
            Lemma is a private, fast Wikipedia reader built for calm, focused browsing. It strips away visual clutter
            and presents articles in a clean custom layout with strong typography and lightweight navigation.
        </p>

        <br />
        <h3 style="--i: 1">Why it exists</h3>
        <p style="--i: 1">
            Lemma is designed for quick lookups, deeper reading, and browsing Wikipedia without the usual noise. It’s
            meant to feel private, fast, and pleasant enough that reading becomes the default.
        </p>

        <h5 style="--i: 2">What does it do?</h5>
        <p style="--i: 2">
            Lemma fetches Wikipedia articles directly from public endpoints, extracts readable content, and renders it
            in a distraction-free reader. It includes article stats, images, headings, links, and section navigation for
            longer pages.
        </p>

        <h5 style="--i: 3">Built for reading</h5>
        <p style="--i: 3">
            The interface uses a soft neutral background, local fonts, subtle shadows, and a centered reading width to
            keep the experience quiet and easy on the eyes. The goal is simple: make exploring knowledge feel
            effortless.
        </p>

        <br />
        <h3 style="--i: 4">The Stack</h3>
        <p style="--i: 4">
            Lemma is built with SvelteKit, Svelte 5, Vite, TypeScript, and Bun. It uses client-side Wikipedia requests,
            so there’s no API key, backend proxy, or server-side cache.
        </p>
        <p style="--i: 4">
            The app is organized around reusable UI components and route-based pages for the landing screen, search,
            errors, and article readers.
        </p>

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

    h3,
    h5 {
        opacity: 0;
        animation: text-appear 0.4s ease-out forwards;
        animation-delay: calc(var(--i) * 0.1s);
    }

    p {
        opacity: 0;
        animation: text-appear 0.4s ease-out forwards;
        animation-delay: calc(var(--i) * 0.1s);
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

    @keyframes appear {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }

    @keyframes text-appear {
        0% {
            opacity: 0;
            filter: blur(4px);
            transform: translateY(12px);
        }

        100% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
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
