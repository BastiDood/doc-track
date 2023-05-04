<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';
    import { staffList } from '../stores/StaffStore';
    import { allOffices } from '../stores/OfficeStore';

    import { IconSize, PersonPayload, RowType, Events } from '../../../components/types';
    import PersonRowLocal from '../../../components/ui/itemrow/PersonRowLocal.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import RemoveStaff from '../../../components/ui/forms/staff/RemoveStaff.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonContext from '../../../components/ui/contextdrawer/PersonContext.svelte';

    $: ({ currentOffice } = $dashboardState);
    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];

    let showContextMenu = false;
    let showLocalPermission = false;
    let showRemoveStaff = false;
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
                showRemoveStaff = true;
                break;
            default: break;
        }
    }
</script>

{#if currentOffice === null}
    You must select an office before accessing the Staff page.
{:else}
    {#await staffList.load()}
        <p>Loading staff page...</p>
    {:then}
        <h1>Staffs of {officeName}</h1>
        {#if $staffList === null}
            No staff belonging in {officeName}
        {:else}
            {#each $staffList as staff}
                <!-- Filtering removed staff -->
                {#if staff.permission !== 0}
                    <PersonRowLocal
                        {...staff}
                        office={currentOffice}
                        iconSize={IconSize.Large} 
                        on:overflowClick={overflowClickHandler} 
                    />
                {/if}
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

    <Modal title="Remove Staff" bind:showModal={showRemoveStaff}>
        {#if currentContext === null}
            Current user is not a staff of the selected office.
        {:else}
            <RemoveStaff payload={currentContext} />
        {/if}
    </Modal>
{/if}
