<script lang="ts">
    import { onMount } from "svelte";
    import "../app.css";
    import Searchbar from "../components/search/searchbar.svelte";
    import { WikipediaAPI } from "$lib/api/wikipedia";
    import Navbar from "../components/navbar.svelte";

    let words =
        `Lemma is a private, fast, and beautifully designed Wikipedia wrapper that makes exploring knowledge feel effortless. Lemma provides a clean, focused reading experience with instant access to the information you want, without noise or distractions.`.split(
            " ",
        );
</script>

<div id="hero">
    <title>Lemma</title>
    <Navbar></Navbar>
    <div id="header">
        <span class="char" style="--i: 0" aria-hidden="true">L</span>
        <span class="char" style="--i: 1" aria-hidden="true">e</span>
        <span class="char" style="--i: 2" aria-hidden="true">m</span>
        <span class="char" style="--i: 3" aria-hidden="true">m</span>
        <span class="char" style="--i: 4" aria-hidden="true">a</span>
    </div>
    <p>
        {#each words as w, i}
            <span style="animation-delay: {i * 0.005}s">{w}{i < words.length - 1 ? " " : ""}</span>
        {/each}
    </p>

    <br />
    <br />
    <Searchbar></Searchbar>
</div>

<style>
    #hero {
        position: absolute;

        width: 55%;

        top: 15%;
        left: 22.5%;

        br {
            user-select: none;
        }

        #header {
            font-size: 3rem;
            font-family: gambetta;
            text-align: center;
            margin-bottom: 0.35rem;
            user-select: none;

            .char {
                animation: font-weight-wave 0.8s ease-in-out;
                animation-delay: calc(0.5s + var(--i) * 0.02s);

                display: inline-block;
                margin-left: -0.35rem;
                margin-right: -0.35rem;
                font-weight: 250;
            }
        }

        p {
            text-align: justify;
            max-width: 50ch;
            margin: 0 auto;

            span {
                opacity: 0;
                animation: appear 1.5s forwards;
            }
        }
    }

    @keyframes appear {
        0% {
            opacity: 0;
            filter: blur(1px);
        }

        100% {
            opacity: 1;
        }
    }

    @keyframes font-weight-wave {
        0%,
        100% {
            font-weight: 250;
        }

        50% {
            font-weight: 500;
        }
    }
</style>
