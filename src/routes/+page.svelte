<script lang="ts">
    import { onMount } from "svelte";
    import "../app.css";
    import Searchbar from "../components/searchbar.svelte";
    import { WikipediaAPI } from "$lib/api/wikipedia";

    let words =
        `Lemma is a private, fast, and beautifully designed Wikipedia wrapper that makes exploring knowledge feel effortless. Lemma provides a clean, focused reading experience with instant access to the information you want, without noise or distractions.`.split(
            " ",
        );

    onMount(async () => {
        const api = new WikipediaAPI();
        // console.log(await api.getSearchTitles("potato"));
        console.log(await api.getPageContent("Potato"));
    });
</script>

<div id="hero">
    <title>Lemma</title>
    <h1>Lemma</h1>
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

        h1 {
            font-size: 3rem;
            text-align: center;
            margin-bottom: 0.35rem;
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

        h2 {
            text-align: center;
            font-family: "satoshi";
            opacity: 0.5;
            font-size: 0.9rem;
            width: 100%;
            font-weight: 450;
            margin-top: 6px;
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
</style>
