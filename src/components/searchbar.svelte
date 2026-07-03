<div id="search">
    <img src="icon/search.svg" class="icon" alt="search icon" />
    <input placeholder="Search articles, people, places..." />
</div>

<style>
    #search {
        position: relative;
        width: 90%;
        height: 48px;
        margin-left: 5%;
        background: var(--bg-color);
        border: solid 1px rgba(0, 0, 0, 0.15);
        border-radius: 16px;
        box-shadow: 0px 2px 2px var(--shadow-color);

        img {
            position: absolute;
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
</style>
