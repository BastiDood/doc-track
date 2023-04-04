<script lang="ts">
    import Modal from '../Modal.svelte'
    import { User } from '../../../api/user.ts'
    import { User as UserModel } from '../../../../../model/src/user.ts'
    import { Global } from '../../../../../model/src/permission.ts'
    import { userSession } from '../../../pages/dashboard/stores/UserStore.ts'

    import Button from '../Button.svelte';
    import Edit from '../../icons/Edit.svelte';
    import Close from '../../icons/Close.svelte';

    
    export let currentUser: UserModel;
    export let showModal = false;
    let permsVal = currentUser.permission;

    function recomputePerms() {
            // Get every checkbox and change temp permission to the perms sum
            permsVal = 0;
            document.getElementsByName('globalperms').forEach(node => {
                if (!(node instanceof HTMLInputElement)) return;
                if (node.checked) permsVal += +node.value;
            });
    }
    async function handleSubmit() { 
        // Recompute permissions before submitting
        recomputePerms();

        //No point in handling no-changes.
        if (currentUser.permission == permsVal) return;
 
        try {
            //Rebuild pseudo-user object
            await User.setPermission({
            id: currentUser.id,
            permission: permsVal,
            });

            await userSession.reload()
            showModal = false;
        } catch (err) {
            //TODO: No permission handler
            alert(err);
        }
    }

</script>

<Modal title="Edit Global Permissions" bind:showModal>
    <h2> {currentUser.name} </h2>
    <p> {currentUser.email}: {currentUser.id}</p>
    <p> current(server side): {currentUser.permission}, newperms: {permsVal}</p>
    <form id="globalpermsform" on:submit={handleSubmit} on:change={recomputePerms}>
        {#each Object.keys(Global) as globalperm}
            {#if isNaN(+globalperm)}
                <label>
                    <input type=checkbox 
                    name='globalperms'
                    checked={!!(permsVal & Global[globalperm])}
                    value={Global[globalperm]}>
                    {globalperm}
                </label>
                <br>
            {/if}
        {/each}
    </form>
    <div slot = "buttons">
        <Button on:click={handleSubmit}> 
            <Edit alt="Modify Staff"/> Modify Staff 
        </Button>
        <Button on:click={() => showModal = false}> 
            <Close alt="Cancel Changes"/> Cancel Changes 
        </Button>
    </div>
</Modal>