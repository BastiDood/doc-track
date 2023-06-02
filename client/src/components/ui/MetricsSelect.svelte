<script lang="ts">
    import { MetricsMode } from '../types.ts';
    import { checkAllPerms } from './forms/permissions/util.ts';
    import { Global, Local } from '../../../../model/src/permission.ts';
    import { User } from '~model/user.ts';
    import { Staff } from '~model/staff.ts';

    export let value: MetricsMode | undefined;
    export let localPermission: Staff['permission'];
    export let globalPermission: User['permission'];
</script>

<select required bind:value>
    <option value={MetricsMode.User}>User Summary</option>
    {#if checkAllPerms(localPermission, Local.ViewMetrics)}
        <option value={MetricsMode.Local}>Local Summary</option>
    {/if}
    {#if checkAllPerms(globalPermission, Global.ViewMetrics)}
        <option value={MetricsMode.Global}>Global Summary</option>
    {/if}
</select>

<style>
    select {
        padding: var(--spacing-small) var(--spacing-normal);
        border: var(--spacing-tiny) solid var(--shadow-color);
        border-radius: var(--border-radius);
        background: var(--dashboard-bg);
        box-shadow: 0 var(--spacing-tiny) var(--spacing-small) -0.0625em var(--shadow-color);
        cursor: pointer;
        transition: all var(--animation-length) ease;
    }

    select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 var(--spacing-tiny) rgba(var(--primary-color), 0.2);
    }
</style>
