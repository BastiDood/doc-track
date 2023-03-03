<script lang="ts">
  import { ButtonType } from "../types.ts";
  let type: ButtonType = ButtonType.Danger;
</script>

<button class:primary={type === ButtonType.Primary} class:secondary={type === ButtonType.Secondary} class:danger={type === ButtonType.Danger}>
  <slot>My Button</slot>
</button>

<style>
  button {
    margin: 5px;
    padding: 10px;
    border-radius: 10px;
    color: white;
  }

  .primary {
    background-color: #4040f2;
  }

  .secondary {
    background-color: #0d0d54;
  }

  .danger {
    background-color: #ca1717;
  }
  
</style>