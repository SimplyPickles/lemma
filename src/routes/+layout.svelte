<script lang="ts">
    import { page } from "$app/state";
    import favicon from "$lib/assets/favicon.svg";

    let { children } = $props();

    const description =
        "Lemma is a private, fast, and beautifully designed Wikipedia reader for exploring knowledge without the noise.";
    let canonicalUrl = $derived(`${page.url.origin}${page.url.pathname}`);
    let socialImageUrl = $derived(`${page.url.origin}/og-image.png`);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <link rel="canonical" href={canonicalUrl} />
    <meta name="description" content={description} />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Lemma" />
    <meta property="og:title" content="Lemma — A better way to read Wikipedia" />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:image" content={socialImageUrl} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Lemma — Explore knowledge without the noise" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Lemma — A better way to read Wikipedia" />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={socialImageUrl} />
    <meta name="twitter:image:alt" content="Lemma — Explore knowledge without the noise" />
</svelte:head>

{@render children()}
