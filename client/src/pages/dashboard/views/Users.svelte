<script lang="ts">
    import { userList } from '../stores/UserStore';

    import { IconSize } from '../../../components/types';
    import { User } from '~model/user';
    import PersonRowGlobal from '../../../components/ui/itemrow/PersonRowGlobal.svelte';
    import GlobalPermissions from '../../../components/ui/forms/permissions/GlobalPermissions.svelte';
    import Modal from '../../../components/ui/Modal.svelte';
    import PersonContextGlobal from '../../../components/ui/contextdrawer/PersonContextGlobal.svelte';

    interface Context {
        id: User['id'],
        permissions: User['permission'],
        context: boolean,
        showEdit: boolean,
    }

    let ctx = null as Context | null;

    function openContext(id: User['id'], permissions: User['permission']) {
        ctx = { id: id, permissions: permissions, context: true, showEdit: false };
    }

    function openEditGlobal(ctxcpy: Context) {
        ctxcpy.context = false;
        ctxcpy.showEdit = true;
        ctx = ctxcpy;
    }
    function resetContext() {
        ctx = null;
    }
</script>

{#await userList.load()}
    <p>Loading users page...</p>
{:then}
    <h1>Users</h1>
    {#each $userList.filter(u => u.permission !== 0) as user (user.id)}
        <PersonRowGlobal
            {...user}
            iconSize={IconSize.Large} 
            on:overflowClick={openContext.bind(null, user.id, user.permission)} 
        />
    {:else}
        No users exist.
    {/each}
{/await}
{#if ctx === null} 
    <!-- Do not display anything! -->
{:else if ctx.showEdit}
    <Modal title="Edit Global Permissions" showModal>
        <GlobalPermissions 
            on:done={resetContext}
            id={ctx.id}
            permission={ctx.permissions}    
        />
    </Modal>
{:else if ctx.context}
    <PersonContextGlobal
        show
        on:close={resetContext}
        on:editGlobalPermission={openEditGlobal.bind(null, ctx)}
    />
{/if}


