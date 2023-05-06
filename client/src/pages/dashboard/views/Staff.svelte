<script lang="ts">
    import { dashboardState } from '../stores/DashboardState';
    import { staffList } from '../stores/StaffStore';
    import { allOffices } from '../stores/OfficeStore';

    import { IconSize, PersonPayload, RowType, Events } from '../../../components/types';
    import PersonRowLocal from '../../../components/ui/itemrow/PersonRowLocal.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import RemoveStaff from '../../../components/ui/forms/staff/RemoveStaff.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonContextLocal from '../../../components/ui/contextdrawer/PersonContextLocal.svelte';

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
        {#each $staffList.filter(s => s.permission !== 0) as staff (staff.id)}
            <PersonRowLocal
                {...staff}
                office={currentOffice}
                iconSize={IconSize.Large} 
                on:overflowClick={overflowClickHandler} 
            />
        {:else}
            No staff members exist in "{officeName}".
        {/each}
    {/await}

    {#if currentContext?.ty === RowType.Person}
        <PersonContextLocal
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
