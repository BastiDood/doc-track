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
  button {
    margin: 5px;
    padding: 10px;
    border-radius: 10px;
    border: 0;
    cursor: pointer;
    color: white;
  }

  button:hover {
    filter:contrast(1.5);
  }
</style>