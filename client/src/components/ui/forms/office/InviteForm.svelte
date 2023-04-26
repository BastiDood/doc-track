<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Office as OfficeModel } from '../../../../../../model/src/office.ts';

    import { Office } from '../../../../api/office.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import { Invite } from '../../../../api/invite.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currId: OfficeModel['id'] | null = null;
    let currName: OfficeModel['name'] | null = null;

    // eslint-disable-next-line no-extra-parens
    $: currName = currId === null ? null : $allOffices[currId] ?? null;

    async function handleSubmit(this: HTMLFormElement) {
        const input = this.elements.namedItem('officename');
        assert(input instanceof HTMLInputElement);
        assert(input.type === 'text');

        if (currId === null || typeof currName !== 'string') return;
        if (!this.reportValidity()) return;
        if (input.value === currName) return;

        try {
            // await Invite.add({
            //     email: input.value,
            //     officeId: currId
            // });
            await allOffices.reload?.();

            // eslint-disable-next-line require-atomic-updates
            currId = null;
            // eslint-disable-next-line require-atomic-updates
            currName = null;

            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently inviting a user as {$userSession?.email}</p>
<article>
    {#if Object.getOwnPropertyNames($allOffices).length === 0}
        No offices to edit.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
            <OfficeSelect bind:oid={currId} offices={$allOffices} />
            <br />
                <p>Office ID: {currId}</p>
                {#if currName !== null}
                    <TextInput
                        required
                        placeholder={currName}
                        name="email@up.edu.ph"
                        label="Email:"
                    />
                    <Button submit><Checkmark alt="Invite User"/>Invite User</Button> 
                {/if}
        </form>
    {/if}
</article>
