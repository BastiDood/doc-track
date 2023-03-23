<script>
    import NavQuery from './NavQuery.svelte';

    export let show = false;
    export let navItems;

    let selected;
</script>

<nav class:show={!show}>
  <div>
        {#each navItems as item} 
            <a href={`#/${item.href}`} on:click={() => {selected = item.href}} class={selected == item.href ? "selected" : ""}>
                {item.label}
            </a>
      {/each}
  </div>
  <form method="POST" action="/auth/logout">
      <input type="submit" value="Logout" />
  </form>
</nav>
<style>
    :global(body) {
        padding: 0;
    }

    nav {
        --acc-color: blue;
        background-color: #ccc;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: absolute;
        left: 0;
        top: 75px;
        z-index: 0;
        transition: left 0.3s;
        height: 100%;
    }
    nav.show {
        left: -100%;
    }
  
    a {
        border-left: 0.5rem solid transparent;
        color: initial;
        display: block;
        padding: 0.5rem;
        width: 175pt;
        text-decoration: none;
        user-select: none;
        transition: background-color 0.2s, border-left 0.2s;
    }

    a:hover {
        background-color: #eee;
        
    }

    .selected {
        border-right: 0.5rem solid var(--acc-color);
    }

    input[type="submit"] {
        background-color: var(--bg-color);
        border-left: 0.5rem solid transparent;
        cursor: pointer;
        margin: 0;
        padding: 0.5rem;
        text-align: initial;
        transition: background-color 0.2s;
        width: 100%;
    }

    input[type="submit"]:hover {
        background-color: #aaa;
    }
</style>