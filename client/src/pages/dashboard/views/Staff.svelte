<script lang="ts">
    import type { StaffMember } from '~model/api.ts';

    import { assert } from '../../../assert.ts';
    import { IconColor, IconSize, ContainerType } from '../../../components/types.ts';

    import { dashboardState } from '../../../stores/DashboardState.ts';
    import { staffList } from '../../../stores/StaffStore.ts';
    import { allOffices } from '../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../stores/ToastStore.ts';

    import AddStaff from '../../../components/ui/forms/staff/AddStaff.svelte';
    import Button from '../../../components/ui/Button.svelte';
    import Container from '../../../components/ui/Container.svelte';
    import LocalPermissions from '../../../components/ui/forms/permissions/LocalPermissions.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PageUnavailable from '../../../components/ui/PageUnavailable.svelte';
    import PersonAdd from '../../../components/icons/PersonAdd.svelte';
    import PersonContextLocal from '../../../components/ui/contextdrawer/PersonContextLocal.svelte';
    import PersonRowLocal from '../../../components/ui/itemrow/PersonRowLocal.svelte';
    import RemoveStaff from '../../../components/ui/forms/staff/RemoveStaff.svelte';

    enum SelectedMenu {
        EditLocalPermissions,
        RemoveStaff,
    }

    type ExtraContext = { selected: SelectedMenu | null }
    let ctx = false as ExtraContext & Omit<StaffMember, 'picture' | 'name'> | boolean;

    $: ({ currentOffice } = $dashboardState);
    $: officeName = currentOffice === null ? 'No office name.' : $allOffices[currentOffice];

    function openEditLocalPermissions() {
        assert(typeof ctx === 'object');
        ctx.selected = SelectedMenu.EditLocalPermissions;
        ctx = ctx;
    }

    function openRemoveStaff() {
        assert(typeof ctx === 'object');
        ctx.selected = SelectedMenu.RemoveStaff;
        ctx = ctx;
    }

    function resetContext() {
        ctx = false;
    }

    const staffReady = staffList.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });

    let showUnprev = false;
</script>

{#if currentOffice === null}
    <p>You must select an office before accessing the Staff page.</p>
{:else}
    {#await staffReady}
        <p>Loading staff page...</p>
    {:then}
        <header>
            <h1>Staffs of {officeName}</h1>
            <div>
                <Button on:click={() => (ctx = true)}>
                    <PersonAdd color={IconColor.White} alt="icon for adding an existing user"></PersonAdd>
                    Add Existing User
                </Button>
                {#if !showUnprev}
                <Button on:click={() => {showUnprev = true;}}>Show Inactive Staff</Button>
                {/if}
            </div>
        </header>
        <Container ty={ContainerType.Divider}>
            <h2>Active Staff</h2>
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
                        on:overflowClick={() => (ctx = { id, email, permission, selected: null })} 
                    />
                {:else}
                    <p>No staff members exist in "{officeName}".</p>
                {/each}
            </Container>
        </Container>
        {#if showUnprev}
            <Container ty={ContainerType.Divider}>
                <h2>Inactive Staff</h2>
                <Container ty={ContainerType.Enumeration}>
                    {@const staff = $staffList.filter(s => s.permission === 0)}
                    {#each staff as { id, name, email, permission, picture } (id)}
                        <PersonRowLocal
                            {id}
                            {email}
                            {name}
                            {permission}
                            {picture}
                            office={currentOffice}
                            iconSize={IconSize.Large} 
                            on:overflowClick={() => (ctx = { id, email, permission, selected: null })} 
                        />
                    {:else}
                        <p>No staff inactive staff members exist in "{officeName}".</p>
                    {/each}
                </Container>
            </Container>
        {/if}
    {:catch err}
        <PageUnavailable {err} />
    {/await}
    {#if typeof ctx === 'object'}
        {#if ctx.selected === SelectedMenu.EditLocalPermissions}
            <Modal showModal on:close={resetContext} title="Edit Local Permissions">
                <LocalPermissions
                    on:done={resetContext}
                    officeId={currentOffice}
                    permission={ctx.permission}
                    userId={ctx.id}
                    email={ctx.email}
                />
            </Modal>
        {:else if ctx.selected === SelectedMenu.RemoveStaff}
            <Modal showModal on:close={resetContext} title="Remove Staff">
                <RemoveStaff
                    on:done={resetContext}
                    office={currentOffice} 
                    id={ctx.id}
                    email={ctx.email}
                />
            </Modal>
        {:else if ctx.selected === null}
            <PersonContextLocal
                show
                on:close={resetContext}
                on:editLocalPermission={openEditLocalPermissions}
                on:removeStaff={openRemoveStaff}
            />
        {/if}
    {:else if ctx}
        <Modal showModal on:close={resetContext} title="Add Existing User">
            <AddStaff on:done={resetContext} office={currentOffice} />
        </Modal>
    {/if}
{/if}

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    div {
        display: flex;
        align-items: column;
    }
</style>