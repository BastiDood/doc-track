<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Office as OfficeModel } from '../../../../../../model/src/office.ts';

    import { Office } from '../../../../api/office.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { officeList } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currId: OfficeModel['id'] | null;
    let currName: OfficeModel['name'] | undefined;

    $: currName = $officeList.find(office => office.id === currId)?.name;
    
    async function handleSubmit(this: HTMLFormElement) {
        const input = this.elements.namedItem('officename');
        assert(input instanceof HTMLInputElement);
        assert(input.type === 'text');

        if (currId === null || currName === undefined) return;
        if (!this.reportValidity()) return;
        if (input.value === currName) return;

        try {
            // Create a pseudo-office element
            await Office.update({
                id: currId,
                name: input.value
            });
            await officeList.reload?.();
            currId = null;
            currName = undefined;
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently editing an office as {$userSession.email}</p>
<article>
    {#if $officeList.length === 0}
        No offices to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
            <OfficeSelect bind:oid={currId} offices={$officeList} />
            <br />
            {#if currId !== null}
                <p>Office ID: {currId}</p>
                {#if currName !== undefined}
                    <TextInput
                        required
                        placeholder={currName}
                        name="officename"
                        label="Office Name:"
                    />
                    <Button submit><Checkmark alt="Edit Office"/> Edit Office</Button> 
                {/if}
            {/if}
        </form>
    {/if}
</article>
