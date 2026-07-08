<script lang="ts">
    import { WikipediaAPI } from "$lib/api/wikipedia";
    import Result from "./result.svelte";

    let inputBox: HTMLInputElement;
    let results: any[] = $state([]);
    async function input() {
        const api = new WikipediaAPI();

        if (inputBox.value.trim().length > 0) {
            results = await api.getSearchTitles(inputBox.value.trim());
        }
    }
</script>

<div id="search">
    <div id="searchbar">
        <img src="icon/search.svg" class="icon" alt="search icon" />
        <input placeholder="Search articles, people, places..." bind:this={inputBox} oninput={input} />
    </div>
    <div id="results">
        {#each results as result}
            <Result title={result} desc="hi" imgsrc=""></Result>
        {/each}
    </div>
</div>

<style>
    #search {
        position: relative;
        width: 90%;
        margin-left: 5%;
        height: fit-content;

        #searchbar {
            position: absolute;
            left: 0;
            top: 0;
            background: var(--bg-color);
            border: solid 1px rgba(0, 0, 0, 0.15);
            border-radius: 16px;
            box-shadow: 0px 2px 2px var(--shadow-color);
            width: 100%;
            height: 48px;

            img {
                position: absolute;
                user-select: none;
                width: 32px;
                height: 32px;

                left: 6px;
                top: 8px;
            }

            input {
                position: absolute;
                background: none;
                border: none;
                left: 42px;
                top: 11px;
                height: 24px;
                width: calc(100% - 62px);
                font-size: 0.9rem;
            }

            input:focus {
                outline: none;
            }
        }

        #results {
            position: absolute;
            top: calc(48px + 16px);
            width: 100%;
        }
    }
</style>
