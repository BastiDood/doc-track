<script lang="ts">
    import { dashboardState, dashboardSetter } from '../../../pages/dashboard/stores/DashboardState.ts';

    import type { User } from '../../../../../model/src/user.ts';
    import { Office } from '~model/office.ts';
    import { userOffices } from '../../../pages/dashboard/stores/UserStore.ts';

    import Hamburger from '../../icons/Hamburger.svelte';
    import OfficeSelect from '../OfficeSelect.svelte';

    export let show = false;
    export let user: User;
    let selectedOffice: Office['id'] | null = null;

    // eslint-disable-next-line no-unused-expressions
    $: selectedOffice ? dashboardSetter.setOffice(selectedOffice) : null;
</script>

<nav id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="icon"><Hamburger bind:open={show} on:click={() => (show = !show)} /></span>
    {#if Object.getOwnPropertyNames($userOffices).length === 0}
        No office detected!
    {:else}
        <OfficeSelect offices={$userOffices} bind:oid={selectedOffice}/>
    {/if}
    <p>DocTrack</p>
    <nav id="profilenav">
        <span>{user.name}</span>
        <span><img src={user.picture} alt="{user.name[0]}" /></span>
    </nav>
</nav>

<style>
    @import url('../../../pages/vars.css');

    p {
        font-size: var(--large);
        font-weight: bold;
    }

    #icon {
        cursor: pointer;
    }

    img {
        border-radius: 50%;
        display: block;
        height: 2rem;
    }

    #navcontainer {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-small);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    #profilenav {
        align-content: center;
        background-color: var(--primary-color);
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-small);
        align-items: center;
        padding: var(--spacing-small);
    }
</style>
