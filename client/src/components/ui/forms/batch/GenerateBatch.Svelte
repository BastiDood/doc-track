<script lang="ts">
<<<<<<< HEAD
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
</script>

<p>You successfully generated a new batch as {$userSession?.email}</p>
=======
    import { Batch } from '../../../../api/batch.ts';
    import { Office } from '../../../../api/office.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { Office as OfficeModel } from '../../../../../../model/src/office.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currId: OfficeModel['id'] | null = null;
    let currName: OfficeModel['name'] | null = null;

    $: currName = currId === null ? null : $allOffices[currId] ?? null;

    async function handleGenerate() {
        if (currId === null || typeof currName !== 'string') return;
        
        try {
            console.log(await Batch.generate(currId));
            currId = null;
        }
        catch (err) {
            // TODO: error message
            alert(err);
        }
    }

</script>

<p>You are currently generating a new batch of barcodes{$userSession?.email}</p>
<article>
    {#if Object.getOwnPropertyNames($allOffices).length === 0}
        No office where a new batch of barcodes will be generated
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleGenerate}>   
            <OfficeSelect bind:oid={currId} offices={$allOffices} />
            <br />
            {#if currName !== null}
                <Button submit><Checkmark alt="Generate Barcode"/>Generate</Button> 
            {/if}
        </form>
    {/if}
</article>
>>>>>>> e3bb7b9 (feat(client): add initial GenerateBatch form component)
