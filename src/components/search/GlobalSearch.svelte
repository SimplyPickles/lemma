<script lang="ts">
    import Searchbar from "./Searchbar.svelte";
    import { onMount } from "svelte";

    let visible = $state(false);

    function toggleSearch() {
        visible = !visible;
    }

    function handleKeyDown(event: KeyboardEvent) {
        // Cmd+K (macOS) or Ctrl+K (Windows/Linux)
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            toggleSearch();
        }

        // Optional: close with Escape
        if (event.key === "Escape" || event.key === "Enter") {
            visible = false;
        }
    }

    function click(event: MouseEvent) {
        if ((event.target as HTMLElement).id !== "searchbar" && (event.target as HTMLElement).id !== "searchbar-item") {
            visible = false;
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("click", click);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("click", click);
        };
    });
</script>

<div id="global-search" class:visible class:hidden={!visible}>
    {#each Array(12) as _}
        <br />
    {/each}

    <Searchbar />
</div>

<style>
    #global-search {
        z-index: 10;
        position: fixed;
        inset: 0;

        background: rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(4px);

        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
    }

    #global-search.visible {
        opacity: 1;
        pointer-events: auto;
    }

    #global-search.hidden {
        opacity: 0;
        pointer-events: none;
    }
</style>
