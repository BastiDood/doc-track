<script lang="ts">
    import { assert } from '../../../../assert.ts';
    import { createEventDispatcher } from 'svelte';

    import { Office as OfficeModel } from '~model/office.ts';

    import { Office } from '../../../../api/office.ts';
    import { Events, IconColor, ToastType } from '../../../types.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { topToastMessage } from '../../../../pages/dashboard/stores/ToastStore.ts';

    export let currId: OfficeModel['id'];
    let currName: OfficeModel['name'] | undefined;

    const dispatch = createEventDispatcher();

    async function handleSubmit(this: HTMLFormElement) {
        if (typeof currName !== 'string') return;
        if (!this.reportValidity()) return;

        try {
            // Create a pseudo-office element
            await Office.update({
                id: currId,
                name: currName,
            });
            await allOffices.reload?.();
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Office Edit',
                body: 'You successfully edited an office.',
            });
            this.reset();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        } finally {
            dispatch(Events.Done);
        }
    }
</script>

<form on:submit|preventDefault|stopPropagation={handleSubmit}>   
    <TextInput
        required
        placeholder="Name"
        name="officename"
        label="Office Name:"
        bind:value={currName}
    />
    <Button submit><Checkmark color={IconColor.White} alt="Edit Office" /> Edit Office</Button> 
</form>
