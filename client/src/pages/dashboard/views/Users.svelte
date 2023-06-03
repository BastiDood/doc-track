<script lang="ts">
    import { User } from '~model/user.ts';

    import { assert } from '../../../assert.ts';
    import { IconSize, ContainerType } from '../../../components/types.ts';

    import { topToastMessage } from '../../../stores/ToastStore.ts';
    import { userList } from '../../../stores/UserStore.ts';
    
    import Button from '../../../components/ui/Button.svelte';
    import Container from '../../../components/ui/Container.svelte';
    import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PageUnavailable from '../../../components/ui/PageUnavailable.svelte';
    import PersonRowGlobal from '../../../components/ui/itemrow/PersonRowGlobal.svelte';

    interface Context {
        id: User['id'],
        permissions: User['permission'],
        showEdit: boolean,
    }

    let ctx = null as Context | null;
    let showUnprev = false;

    function openEdit(id: User['id'], permissions: User['permission']) {
        ctx = { id: id, permissions: permissions, showEdit: true };
    }

    function resetContext() {
        ctx = null;
    }

    const usersReady = userList.load().catch(err => {
        assert(err instanceof Error);
        topToastMessage.enqueue({ title: err.name, body: err.message });
        throw err;
    });
</script>

{#await usersReady}
    <p>Loading users page...</p>
{:then}
    <header>
        <h1>Users</h1>    
        <Button on:click={() => {showUnprev = !showUnprev;}}>{showUnprev ? 'Hide' : 'Show'} Unprivileged Users</Button>
    </header>
    <Container ty={ContainerType.Divider}>
        <h2>System Operators</h2>
        <Container ty={ContainerType.Enumeration}>
            {@const admins = $userList.filter(u => u.permission > 0)}
            {#each admins as { id, name, email, picture, permission } (id)}
                <PersonRowGlobal
                    {id}
                    {name}
                    {email}
                    {picture}
                    {permission}
                    iconSize={IconSize.Large} 
                    on:overflowClick={openEdit.bind(null, id, permission)} 
                />
            {:else}
                <p>No users exist.</p>
            {/each}
        </Container>
    </Container>
    {#if showUnprev}
        <Container ty={ContainerType.Divider}>
            <h2>Unprivileged Users</h2>
            <Container ty={ContainerType.Enumeration}>
                {@const users = $userList.filter(u => u.permission === 0)}
                {#each users as { id, name, email, picture, permission } (id)}
                    <PersonRowGlobal
                        {id}
                        {name}
                        {email}
                        {picture}
                        {permission}
                        iconSize={IconSize.Large} 
                        on:overflowClick={openEdit.bind(null, id, permission)} 
                    />
                {:else}
                    <p>No users exist.</p>
                {/each}
            </Container>
        </Container>
    {/if}
    
{:catch err}
    <PageUnavailable {err} />
{/await}

{#if ctx === null} 
    <!-- Do not display anything! -->
{:else if ctx.showEdit}
    <Modal title="Edit Global Permissions" showModal on:close={resetContext}>
        <GlobalPermissions 
            on:done={resetContext}
            id={ctx.id}
            permission={ctx.permissions}    
        />
    </Modal>
{/if}

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
