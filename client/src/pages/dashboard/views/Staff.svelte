<script lang="ts">
    import { dashboardState } from '../../../stores/DashboardState';
    import { staffList } from '../../../stores/StaffStore';
    import { allOffices } from '../../../stores/OfficeStore';
    import { topToastMessage } from '../../../stores/ToastStore';
    import { Staff } from '~model/staff';
    import { User } from '~model/user';
    import { assert } from '../../../assert';

    import { IconSize } from '../../../components/types';
    import PersonRowLocal from '../../../components/ui/itemrow/PersonRowLocal.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import RemoveStaff from '../../../components/ui/forms/staff/RemoveStaff.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonContextLocal from '../../../components/ui/contextdrawer/PersonContextLocal.svelte';

    enum ActiveMenu {
        EditStaff,
        RemoveStaff
    }

    interface Context {
        id: Staff['user_id'],
        office: Staff['office'],
        email: User['email'],
        permission: Staff['permission'],
        showContext: boolean,
        activeMenu: ActiveMenu | null;
    }

    $: ({ currentOffice } = $dashboardState);
    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];


    let ctx = null as Context | null;

    function openContextMenu(id: Staff['user_id'], office: Staff['office'], email: User['email'], permission: Staff['permission']) {
        ctx = { id: id, office: office, email: email, permission: permission, showContext: true, activeMenu: null };
    }

    function openEditStaff(ctxcpy: Context) {
        ctxcpy.showContext = false;
        ctxcpy.activeMenu = ActiveMenu.EditStaff;
        ctx = ctxcpy;
    }

    function openRemoveStaff(ctxcpy: Context) {
        ctxcpy.showContext = false;
        ctxcpy.activeMenu = ActiveMenu.RemoveStaff;
        ctx = ctxcpy;
    }

    function resetContext() {
        ctx = null;
    }

    $: staffs = staffList.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        return Promise.reject();
    });
</script>

{#if currentOffice === null}
    You must select an office before accessing the Staff page.
{:else}
    {#await staffs}
        <p>Loading staff page...</p>
    {:then}
        <h1>Staffs of {officeName}</h1>
        {#each $staffList.filter(s => s.permission !== 0) as { id, name, email, permission, picture } (id)}
            <PersonRowLocal
                {id}
                {email}
                {name}
                {permission}
                {picture}
                office={currentOffice}
                iconSize={IconSize.Large} 
                on:overflowClick={openContextMenu.bind(null, id, currentOffice, email, permission)} 
            />
        {:else}
            No staff members exist in "{officeName}".
        {/each}
    {/await}
{/if}

{#if ctx === null}
    <!-- Do not render anything! -->
{:else if ctx.activeMenu === ActiveMenu.EditStaff}
    <Modal title="Edit Local Permissions" showModal>
        <LocalPermissions
            on:done={resetContext}
            officeId={ctx.office}
            permission={ctx.permission}
            userId={ctx.id}
            email={ctx.email}
        />
    </Modal>
{:else if ctx.activeMenu === ActiveMenu.RemoveStaff}
    <Modal title="Remove Staff" showModal>
        <RemoveStaff
            on:done={resetContext}
            id={ctx.id}
            office={ctx.office} 
            email={ctx.email}
        />
    </Modal>
{:else if ctx.showContext}
    <PersonContextLocal
        on:close={resetContext}
        show
        on:editLocalPermission={openEditStaff.bind(null, ctx)}
        on:removeStaff={openRemoveStaff.bind(null, ctx)}
    />
{/if}
