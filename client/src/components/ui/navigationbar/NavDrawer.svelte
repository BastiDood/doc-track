<script>
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
@import url(../../../pages/global.css);

    nav {
        background-color: var(--nav-bg);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: absolute;
        left: 0;
        top: 75px;
        z-index: 0;
        transition: left var(--animation-length);
        height: 100%;
    }
    nav.show {
        left: -100%;
    }
  
    a {
        border-left: var(--spacing-normal) solid transparent;
        color: initial;
        display: block;
        padding: var(--spacing-normal);
        width: 175pt;
        text-decoration: none;
        user-select: none;
        transition: background-color var(--animation-length), border-left var(--animation-length);
    }

    a:hover {
        background-color: #eee;
        
    }

    .selected {
        border-right: var(--spacing-normal) solid var(--nav-bg);
    }

    input[type="submit"] {
        background-color: var(--bg-color);
        border-left: var(--spacing-normal) solid transparent;
        cursor: pointer;
        margin: 0;
        padding: var(--spacing-normal);
        text-align: initial;
        transition: background-color var(--animation-length);
        width: 100%;
    }

    input[type="submit"]:hover {
        background-color: #aaa;
    }
</style>
