<script lang="ts">
    let {
        title,
        desc = "",
        imgsrc = "",
        href,
        active = false,
    } = $props<{
        title: string;
        desc?: string;
        imgsrc?: string;
        href: string;
        active?: boolean;
    }>();

    function getInitials(value: string) {
        const words = value.trim().split(/\s+/).filter(Boolean);

        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }

        return value.trim().slice(0, 2).toUpperCase();
    }
</script>

<a class:active class="res" {href}>
    {#if imgsrc}
        <img alt="" src={imgsrc} />
    {:else}
        <span class="placeholder" aria-hidden="true">{getInitials(title)}</span>
    {/if}
    <span class="title">{title}</span>
    {#if desc}
        <span class="desc">{desc}</span>
    {/if}
</a>

<style>
    .res {
        position: relative;
        display: block;
        cursor: pointer;
        user-select: none;
        width: 96%;
        min-height: 40px;
        margin-left: 2%;
        color: inherit;
        text-decoration: none;
        border-radius: 10px;
    }

    .res:hover,
    .res.active,
    .res:focus-visible {
        background: color-mix(in oklch, var(--secondary) 35%, transparent);
    }

    .title {
        position: absolute;
        top: 0;
        left: 44px;
        right: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-family: gambetta;
        font-size: 1.1rem;
    }

    .desc {
        position: absolute;
        bottom: 1px;
        left: 44px;
        right: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.85rem;
        font-weight: 350;
        opacity: 0.75;
    }

    img,
    .placeholder {
        position: absolute;
        left: 3.5px;
        top: 3.5px;
        width: 32px;
        height: 32px;
        border-radius: 7px;
        border: solid rgba(0, 0, 0, 0.1) 0.5px;
        outline: solid var(--secondary) 0.5px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 12px 1px;
        background: var(--secondary);
    }

    img {
        object-fit: cover;
    }

    .placeholder {
        display: grid;
        place-items: center;
        font-family: gambetta;
        font-size: 0.9rem;
        font-weight: 600;
        opacity: 0.8;
    }
</style>
