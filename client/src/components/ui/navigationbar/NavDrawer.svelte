<script>
  export let show = false;
  export let navItems;
</script>

<nav class:show={show}>
  <div>
        {#each navItems as item} 
            <a href={`#/${item.href}`}>{item.label}</a>
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
      top: 70px;
      z-index: 50;
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
      text-decoration: none;
      transition: background-color 0.2s, border-left 0.2s;
  }
  
  a:hover {
      background-color: #eee;
      border-left: 0.5rem solid var(--acc-color);
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