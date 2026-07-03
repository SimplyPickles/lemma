<script lang="ts">
    import "../app.css";

    const homeMessages = ["Go back home", "Return to ground zero", "Take me back", "Home sweet home"];

    const homeText = homeMessages[Math.floor(Math.random() * homeMessages.length)];

    let words =
        `We couldn’t find what you were looking for. The page may have been moved, renamed, or no longer exists. Try going back or heading to the homepage.`.split(
            " ",
        );
</script>

<div id="container">
    <title>404</title>
    <h1>404</h1>

    <p>
        {#each words as w, i}
            <span style="animation-delay: {i * 0.005}s">{w}{i < words.length - 1 ? " " : ""}</span>
        {/each}
    </p>

    <br />
    <a href="/">{homeText}</a>
</div>

<style>
    #container {
        position: absolute;

        width: 55%;

        top: 15%;
        left: 22.5%;

        h1 {
            font-size: 3rem;
            text-align: center;
            margin-bottom: 0.35rem;
            animation: popup 0.5s forwards;
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

        a {
            opacity: 0;
            animation: popup 0.5s forwards;
            animation-delay: 0.75s;
        }

        text-align: center;
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

    @keyframes popup {
        0% {
            opacity: 0;
            filter: blur(1px);
            transform: translateY(6px);
        }

        100% {
            opacity: 1;
        }
    }
</style>
