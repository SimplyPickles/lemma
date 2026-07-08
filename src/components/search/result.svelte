<script lang="ts">
    let { title, desc, imgsrc } = $props();
</script>

<div class="res">
    <img alt="" src={imgsrc} />
    <a>{title}</a>
    <br />
    <b>{desc}</b>
</div>

<style>
    .res {
        position: relative;
        cursor: pointer;
        user-select: none;
        width: 96%;
        margin-left: 2%;
        height: 32px;

        a {
            position: absolute;
            top: -4px;
            left: 40px;
            font-size: 1.1rem;
        }

        b {
            position: absolute;
            bottom: -4px;
            left: 40px;
            font-size: 0.9rem;
            font-weight: 350;
            opacity: 0.75;
        }

        img {
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            border: solid rgba(0, 0, 0, 0.1) 0.5px;
            outline: solid var(--secondary) 0.5px;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 12px 1px;
            background: var(--secondary);
        }
    }

    .res:hover {
        a {
            transition: none;
            font-family: gambetta;
            text-decoration-color: oklch(0.5 0.175 var(--hue) / 0%);
        }
    }
</style>
