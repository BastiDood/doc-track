<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Office } from '../../../../api/office.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { officeList } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let officeId: number | undefined;

    async function handleSubmit(this: HTMLFormElement) {
        const input = this.elements.namedItem('officename');
        assert(input instanceof HTMLInputElement);
        assert(input.type === 'text');

        if (officeId === undefined) return;
        if (!this.reportValidity()) return;
        if (input.value === $officeList[officeId].name) return;

        try {
            // Create a pseudo-office element
            await Office.update({
                id: officeId,
                name: input.value
            });
            await officeList.reload?.();
            officeId = undefined;
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently editing an office as {$userSession.email}</p>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <OfficeSelect bind:oid={officeId} offices={$officeList} />
        <br />
        <p>Office ID: {officeId}</p>
        {#if officeId !== undefined}
            <TextInput
                required
                placeholder={$officeList[officeId].name}
                name="officename"
                label="Office Name:"
            />
            <Button submit><Checkmark alt="Edit Office"/> Edit Office</Button>
        {/if}
    </form>
</article>
