<script lang="ts">
  import './button.css';
  import { ButtonType } from '../types.ts';
  export let type: ButtonType = ButtonType.Primary;
</script>

<button 
  class={type}
  on:click>
  <slot>{type}</slot>
</button>

<style>
  @import url('../../pages/global.css');

  button {
    margin: 5px;
    padding: 10px;
    border-radius: var(--border-radius);
    border: 0;
    cursor: pointer;
    color: white;
  }

  button:hover {
    filter: contrast(1.5);
  }
</style>