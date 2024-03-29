<script lang="ts">
    import './../itemrow/chip-style.css';

    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';
    import { isOnline } from '../../../stores/NetState.ts';
    import { deferredSnaps } from '../../../stores/DeferredStore.ts';
    
    import Button from '../../../components/ui/Button.svelte';
    import Hamburger from '../../icons/Hamburger.svelte';
    import Logout from '../../icons/Logout.svelte';
    import ProfileLogout from './ProfileLogout.svelte';
    import ChevronLeft from '../../icons/ChevronLeft.svelte';
    import DoctrackWink from '../../doctrack/DoctrackWink.svelte';

    import { ButtonType, IconColor } from '../../../components/types.ts';
    import type { User } from '../../../../../model/src/user.ts';

    // eslint-disable-next-line no-undefined
    export let user = undefined as User | undefined;
    export let open = false;

    $: maybeOfficeName = $dashboardState.currentOffice === null
        ? null
        : $allOffices[$dashboardState.currentOffice];
    $: officeName = maybeOfficeName ?? '';
</script>

<nav class:offline={!$isOnline} id="navcontainer" on:click|stopPropagation on:keypress>
    <span id="icon">
        {#if typeof user === 'undefined'}
            <span on:keydown on:click = {() => window.history.back()}>
                <ChevronLeft color={IconColor.White} alt="Return to previous page" /><b>Back</b>
            </span>
        {:else}
            <Hamburger bind:open on:click={() => (open = !open)} /> 
            <span id="title" class:offline={!$isOnline}>
                <a href="#/">
                    <DoctrackWink alt="DocTrack Logo" />
                </a>
            </span>
        {/if}
        {#await deferredSnaps.load()}
            <span>🔄</span>
        {:then}
            {#if $deferredSnaps.length > 0}
                <span>{$deferredSnaps.length} ⚠️</span>    
            {/if}
        {/await}
        {#if officeName}
            <span class="chip background">{officeName}</span>
        {/if}
    </span>
    <slot></slot>
    <nav id="profilenav">
        {#if typeof user === 'undefined'} 
            <a href="/">
                <Button type={ButtonType.Secondary}>
                    <Logout alt="Return to the main Login screen" /> Back to Main Page
                </Button>
            </a>
        {:else}
            <ProfileLogout picture={user.picture} />
        {/if}
    </nav>
</nav>

<style>
    @import url('../../../pages/vars.css');

    .background {
        background-color: var(--secondary-color);
    }

    span {
        color: white;
    }

    #icon {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--spacing-small);
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

    #navcontainer.offline {
        background-color: var(--offline-color);
    }

    #title.offline::after {
        content: ' *';
    }

    #profilenav {
        align-content: center;
        background-color: inherit;
        display: flex;
        justify-content: flex-end;
        gap: var(--spacing-small);
        align-items: center;
        padding: var(--spacing-small);
    }
</style>
