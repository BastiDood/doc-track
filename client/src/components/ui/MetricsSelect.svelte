<script lang="ts">
    import { MetricsMode } from '../types.ts';
    export let value: MetricsMode | undefined;
</script>

<select required bind:value>
    <option value={MetricsMode.User}>User Summary</option>
    <option value={MetricsMode.Local}>Local Summary</option>
    <option value={MetricsMode.Global}>Global Summary</option>
</select>

<style>
    select {
        padding: var(--spacing-small) var(--spacing-normal);
        border: var(--spacing-tiny) solid var(--shadow-color);
        border-radius: var(--border-radius);
        background: var(--dashboard-bg);
        box-shadow: 0 var(--spacing-tiny) var(--spacing-small) -0.0625em var(--shadow-color);
        cursor: pointer;
        font-size: var(--normal);
        transition: all var(--animation-length) ease;
    }

    select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 var(--spacing-tiny) rgba(var(--primary-color), 0.2);
    }
</style>
