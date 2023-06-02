<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Office } from '../../../../api/office.ts';
    import { IconColor, ToastType } from '../../../types.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    import { allOffices } from '../../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';
    import { userOffices, userSession } from '../../../../stores/UserStore.ts';

    async function handleSubmit(this: HTMLFormElement) {
        const node = this.elements.namedItem('officename');
        assert(node instanceof HTMLInputElement);
        assert(node.type === 'text');
    
        if (!node.value) return;
    
        try {
            await Office.create(node.value);
            await userOffices.reload?.(); // Reloads all relevant stores
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Office Creation',
                body: 'You successfully created a new office.',
            });
            this.reset();
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<p>You are currently adding an office as {$userSession?.email}</p>

<section>
    {#each Object.entries($allOffices) as [id, name] (id)}
        <p>{id}: {name}</p>
    {:else}
        <p>No offices available.</p>
    {/each}
</section>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <TextInput 
            placeholder="New Office Name"
            name="officename"
            label="New Office Name:"
        />
        <Button submit>
            <Checkmark color={IconColor.White} alt="Create New Office"/>
            New Office
        </Button>
    </form>
</article>

<style>
    section {
        overflow-y: scroll;
        border: var(--spacing-tiny) solid;
        height: 50vh;
    }
</style>
