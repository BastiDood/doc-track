<script lang="ts">
    import { userList } from '../stores/UserStore';

    import { IconSize, PersonPayload, RowType, Events } from '../../../components/types';
    import PersonRowGlobal from '../../../components/ui/itemrow/PersonRowGlobal.svelte';
    import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonContextGlobal from '../../../components/ui/contextdrawer/PersonContextGlobal.svelte';

    let showContextMenu = false;
    let showGlobalPermission = false;
    let currentContext = null as PersonPayload | null;

    function overflowClickHandler(e: CustomEvent<PersonPayload>) {
        currentContext = e.detail;
        showContextMenu = true;
    }

    function contextMenuHandler(e: CustomEvent<PersonPayload>) {
        switch (e.type) {
            case Events.EditGlobalPermission:
                showGlobalPermission = true;
                break;
            default: break;
        }
    }
</script>

{#await userList.load()}
    <p>Loading users page...</p>
{:then}
    <h1>Users</h1>
    {#if $userList.length === 0}
        No users exist
    {:else}
        {#each $userList as user}
            <!-- Filtering removed users -->
            {#if user.permission !== 0}
                <PersonRowGlobal
                    {...user}
                    iconSize={IconSize.Large} 
                    on:overflowClick={overflowClickHandler} 
                />
            {/if}
        {/each}
    {/if}
{/await}

{#if currentContext?.ty === RowType.Person}
    <PersonContextGlobal
        bind:show={showContextMenu}
        payload={currentContext} 
        on:editGlobalPermission={contextMenuHandler}
        on:removeStaff={contextMenuHandler}
    />
{/if}

<Modal title="Edit Global Permissions" bind:showModal={showGlobalPermission}>
    {#if currentContext === null}
        Current user is non existent
    {:else}
        <GlobalPermissions payload={currentContext} />
    {/if}
</Modal>
