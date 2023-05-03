<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';
    import { currentUser } from '../stores/UserStore';
    import { staffList } from '../stores/StaffStore';

    import { IconSize, PersonPayload, RowType, Events } from '../../../components/types';
    import PersonRowLocal from '../../../components/ui/itemrow/PersonRowLocal.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonContext from '../../../components/ui/contextdrawer/PersonContext.svelte';

    $: ({ currentOffice } = $dashboardState);

    let showContextMenu = false;
    let showLocalPermission = false;
    let currentContext = null as PersonPayload | null;

    function overflowClickHandler(e: CustomEvent<PersonPayload>) {
        currentContext = e.detail;
        showContextMenu = true;
    }

    function contextMenuHandler(e: CustomEvent<PersonPayload>) {
        switch (e.type) {
            case Events.EditLocalPermission:
                showLocalPermission = true;
                break;
            case Events.RemoveStaff:
                // To implement modal for confirming removing staff
                break;
            default: break;
        }
    }

    async function handleRemoveStaff() {
        await 
    }
</script>

{#if currentOffice === null}
    You must select an office before accessing the Staff page.
{:else}
    {#await staffList.load()}
        <p>Loading staff page...</p>
    {:then}
        <h1>Staffs of Office {currentOffice}</h1>
        {#if staffList === null}
            No staff belonging in Office {currentOffice}
        {:else}
            {#each $staffList as staff}
            <PersonRowLocal
                {...staff}
                office={currentOffice}
                iconSize={IconSize.Large} 
                on:overflowClick={overflowClickHandler} 
            />
            {/each}
        {/if}
    {/await}

    {#if currentContext?.ty === RowType.Person}
        <PersonContext
            bind:show={showContextMenu}
            payload={currentContext} 
            on:editLocalPermission={contextMenuHandler}
            on:removeStaff={contextMenuHandler}
        />
    {/if}

    <Modal title="Edit Local Permissions" bind:showModal={showLocalPermission}>
        {#if currentContext === null}
            Current user is not a staff of the selected office.
        {:else}
            <LocalPermissions payload={currentContext} />
        {/if}
    </Modal>

{/if}
