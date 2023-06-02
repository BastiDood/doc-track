<script lang="ts">
    import { Staff } from '~model/staff.ts';
    import { User } from '~model/user.ts';

    import { assert } from '../../../assert.ts';
    import { IconColor, IconSize, ContainerType } from '../../../components/types.ts';

    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { staffList } from '../../../stores/StaffStore.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';

    import Button from '../../../components/ui/Button.svelte';
    import Container from '../../../components/ui/Container.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PageUnavailable from '../../../components/ui/PageUnavailable.svelte';
    import PersonAdd from '../../../components/icons/PersonAdd.svelte';
    import PersonContextLocal from '../../../components/ui/contextdrawer/PersonContextLocal.svelte';
    import PersonDelete from '../../../components/icons/PersonDelete.svelte';
    import PersonRowLocal from '../../../components/ui/itemrow/PersonRowLocal.svelte';
    import RemoveStaff from '../../../components/ui/forms/staff/RemoveStaff.svelte';

    enum ActiveMenu {
        EditStaff,
        RemoveStaff,
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

    const staffReady = staffList.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

{#if currentOffice === null}
    <p>You must select an office before accessing the Staff page.</p>
{:else}
    {#await staffReady}
        <p>Loading staff page...</p>
    {:then}
        <header>
            <h1>Staffs of {officeName}</h1>
            <Button>
                <PersonAdd color={IconColor.White} alt="icon for adding an existing user"></PersonAdd>
                Add Existing User
            </Button>
        </header>
        <Container ty={ContainerType.Enumeration}>
            {@const staff = $staffList.filter(s => s.permission !== 0)}
            {#each staff as { id, name, email, permission, picture } (id)}
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
                <p>No staff members exist in "{officeName}".</p>
            {/each}
        </Container>
    {:catch err}
        <PageUnavailable {err} />
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
