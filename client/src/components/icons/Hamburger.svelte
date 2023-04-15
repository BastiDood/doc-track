<!-- Code is from the Official Svelte page: https://svelte.dev/repl/03f0be0c4dc54eb4af5a168f644f5c31?version=3.19.1 -->
<script>
    export let open = false;
</script>

<button class:open on:click={() => (open = !open)}>
    <svg width="32" height="24">
        <line id="top" x1="0" y1="2"  x2="32" y2="2" />
        <line id="middle" x1="0" y1="12" x2="24" y2="12" />
        <line id="bottom" x1="0" y1="22" x2="32" y2="22" />
    </svg>
</button>

<style>
    button {
        background: none; 
        border: none;
        cursor: pointer;
        padding: 0;
        scale: 0.75;
    }

    svg {
        background-color: none;
        transform: scale(0.7);
        transition: transform 0.3s ease-in-out;
    }

    svg > line {
        stroke: currentColor;
        stroke-width: 3;
        transition: transform 0.3s ease-in-out;
    }

    #top {
        transform: translate(6px, 0px) rotate(45deg);
    }

    #middle {
        opacity: 0;
    }

    #bottom {
        transform: translate(-12px, 9px) rotate(-45deg);
    }
</style>
