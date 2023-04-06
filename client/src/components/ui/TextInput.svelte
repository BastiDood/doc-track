<script lang="ts">
    import { InputType } from '../types.ts';

    export let type: InputType = InputType.Text;
    export let placeholder = '';
    export let disabled = false;
    export let name: string;
    export let label: string;
    export let value: string = '';
</script>

<label>
    {label}
    <input {type} {placeholder} {name} {disabled} {value} />
</label>

<style>
    @import url('../../pages/vars.css');

    input {
        border: var(--primary-color) 2px solid;
        padding: var(--spacing-small) var(--spacing-normal);
        border-radius: var(--border-radius);
    }
</style>
