<script lang="ts">
    import { Status } from '../../../../model/src/snapshot';
    export let value: Status | undefined;
    export let disabled = false as boolean;
</script>

<select required {disabled} bind:value>
    <option value={Status.Register}>Register</option>
    <option value={Status.Send}>Send</option>
    <option value={Status.Receive}>Receive</option>
    <option value={Status.Terminate}>Terminate</option>
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
