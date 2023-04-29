<script lang="ts">
    import { Office as OfficeModel } from '../../../../../../model/src/office.ts';

    import { Office } from '../../../../api/office.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { IconColor } from '../../../types.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currId: OfficeModel['id'] | null = null;
    let currName: OfficeModel['name'] | undefined;

    async function handleSubmit(this: HTMLFormElement) {
        if (currId === null || typeof currName !== 'string') return;
        if (!this.reportValidity()) return;

        try {
            // Create a pseudo-office element
            await Office.update({
                id: currId,
                name: currName,
            });
            await allOffices.reload?.();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently editing an office as {$userSession?.email}</p>
<article>
    {#if Object.getOwnPropertyNames($allOffices).length === 0}
        No offices to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
            <OfficeSelect bind:oid={currId} offices={$allOffices} />
            <br />
            <TextInput
                required
                placeholder="Name"
                name="officename"
                label="Office Name:"
                bind:value={currName}
            />
            <Button submit><Checkmark color={IconColor.White} alt="Edit Office" /> Edit Office</Button> 
        </form>
    {/if}
</article>
