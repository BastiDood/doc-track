<script lang="ts">
  import { InputType } from '../types.ts';
  export let type = InputType.Primary;
  export let placeholder = '';
  export let name: string;
  export let isRoundedBorder = true;
</script>

<label for={name}><slot></slot></label>
<input {type} {placeholder} {name} class:round-border={isRoundedBorder} />

<style>
  @import url('../../pages/vars.css');

  input {
    border: var(--primary-color) 2px solid;
    padding: var(--spacing-small) var(--spacing-normal);
  }

  .round-border {
    border-radius: var(--border-radius);
  }
</style>
