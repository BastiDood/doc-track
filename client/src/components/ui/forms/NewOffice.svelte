<script lang="ts">
    import { assert } from '../../../assert.ts';

    import { Office } from '../../../api/office.ts';
    import { userSession } from '../../../pages/dashboard/stores/UserStore.ts';
    import { officeList } from '../../../pages/dashboard/stores/OfficeStore.ts';

    import TextInput from '../TextInput.svelte';
    import Button from '../Button.svelte';
    import Checkmark from '../../icons/Checkmark.svelte';

    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('officename');
        assert(node instanceof HTMLInputElement);
        assert(node.type === 'text');
        
        if (!node.value) return;
        
        try {
            await Office.create(node.value);
            await officeList.reload?.();
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently adding an office as {$userSession.email}</p>

<section>
    {#each $officeList as office}
        <p>{office.id}: {office.name}</p>
    {:else}
        No offices available
    {/each}
</section>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <TextInput 
            placeholder="New Office Name"
            name="officename"
            label="New Office Name:"
        />
        <Button submit><Checkmark alt="Create New Office"/> New Office</Button>
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
