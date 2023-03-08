<script lang="ts">
  import { InputType } from '../types.ts';
  export let type: InputType = InputType.Primary;
  export let placeholder = '';
  export let name: string;
  export let isRoundedBorder = true;
</script>

<label for={name}><slot></slot></label>
<input type={type} placeholder={placeholder} id={name} class='{isRoundedBorder ? 'round-border' : ''}'/>

<style>
  input {
    border: #4040f2 2px solid;
    padding: 5px 8px;
  }

  .round-border {
    border-radius: 15px;
  }
</style>