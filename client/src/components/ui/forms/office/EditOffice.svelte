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

    let currId: OfficeModel['id'] | null = null;
    let currName: OfficeModel['name'] | null = null;

    // eslint-disable-next-line no-extra-parens
    $: currName = $officeList.find(office => office.id === currId)?.name ?? null;
    
    async function handleSubmit(this: HTMLFormElement) {
        const input = this.elements.namedItem('officename');
        assert(input instanceof HTMLInputElement);
        assert(input.type === 'text');

        if (currId === null || typeof currName !== 'string') return;
        if (!this.reportValidity()) return;
        if (input.value === currName) return;

        try {
            // Create a pseudo-office element
            await Office.update({
                id: currId,
                name: input.value,
            });
            await officeList.reload?.();

            // eslint-disable-next-line require-atomic-updates
            currId = null;
            // eslint-disable-next-line require-atomic-updates
            currName = null;

            this.reset();
        } catch (err) {
            // TODO: No permission handler
            console.error(err);
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
            {#if typeof currId !== 'number'}
                <p>Office ID: {currId}</p>
                {#if currName !== null}
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
