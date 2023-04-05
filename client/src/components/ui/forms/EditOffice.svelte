<script lang="ts">
    import { assert } from '../../../assert.ts';

    import { Office } from '../../../api/office.ts';
    import { InputType } from '../../types.ts';
    import { userSession } from '../../../pages/dashboard/stores/UserStore.ts';
    import { officeList } from '../../../pages/dashboard/stores/OfficeStore.ts';

    import TextInput from '../TextInput.svelte';
    import Button from '../Button.svelte';
    import Checkmark from '../../icons/Checkmark.svelte';

    async function handleSubmit(this: HTMLFormElement) {
        const elOfficeId = this.elements.namedItem('officeid');
        const elOfficeName = this.elements.namedItem('officename')
        
        assert(elOfficeId instanceof HTMLInputElement);
        assert(elOfficeName instanceof HTMLInputElement);
        assert(elOfficeId.type === 'number')
        assert(elOfficeName.type === 'text');
        
        
        if (!elOfficeId.value || !elOfficeName.value) return;
        
        try {
            // Create a pseudo-office element
            await Office.update({
                id: elOfficeId.value,
                name: elOfficeName.value
            });
            await officeList.reload?.();
            this.reset();
        }
        catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }

</script>

<p>You are currently editing an office {$userSession.email}</p>

<section>
    <!--TODO: Replace with dropdown selection implementation-->
    {#if (!$officeList)}
        No offices avaialble
    {:else}
        {#each $officeList as office}
            <p data-id={office.id} data-name={office.name}>{office.id}: {office.name}</p>
        {/each}
    {/if}
</section>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <TextInput 
            placeholder="New Office ID"
            type = {InputType.Number}
            name="officeid"
            label="Office ID:"
        />
        <TextInput 
            placeholder="Office Name"
            name="officename"
            label="Office Name:"
        />
        <Button submit><Checkmark alt="Edit Office"/> Edit Office </Button>
    </form>
</article>


<style>
    @import url('../../../pages/vars.css');
    section {
        overflow-y: scroll;
        border: var(--spacing-tiny) solid;
        height: 50vh;
    }
</style>
