<script lang="ts">
  import { dashboardState } from '../stores/DashboardState';
  import { staffList } from '../stores/StaffStore';
  import { allOffices } from '../stores/OfficeStore';

  import { IconSize, PersonPayload, RowType, Events } from '../../../components/types';
  import PersonRowGlobal from '../../../components/ui/itemrow/PersonRowGlobal.svelte';
  import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
  import Modal from '../../../components/ui/Modal.svelte';
  import PersonContextGlobal from '../../../components/ui/contextdrawer/PersonContextGlobal.svelte';

  $: ({ currentOffice } = $dashboardState);
  $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];

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

{#if currentOffice === null}
    You must select an office before accessing the Users page.
    {:else}
    {#await staffList.load()}
        <p>Loading users page...</p>
    {:then}
        <h1>Users of {officeName}</h1>
        {#if $staffList === null}
            No users belonging in {officeName}
        {:else}
            {#each $staffList as staff}
                <!-- Filtering removed staff -->
                {#if staff.permission !== 0}
                    <PersonRowGlobal
                        {...staff}
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
            Current user is not a staff of the selected office.
        {:else}
            <GlobalPermissions payload={currentContext} />
        {/if}
    </Modal>
{/if}
