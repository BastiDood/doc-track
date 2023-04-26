<script lang="ts">
    import { assert } from '../../../../assert.ts';
    import { Document as Api } from '../../../../api/document.ts';

    import { earliestBatch } from '../../../../pages/dashboard/stores/BatchStore.ts';
    import { categoryList } from '../../../../pages/dashboard/stores/CategoryStore.ts';
    import { dashboardState } from '../../../../pages/dashboard/stores/DashboardState.ts';

    import type { Category } from '../../../../.../../../../model/src/category.ts';
    import type { Document } from '../../../../.../../../../model/src/document.ts';
    import type { Snapshot } from '../../../../.../../../../model/src/snapshot.ts';

    import Button from '../../Button.svelte';
    import BarcodeSelect from '../../BarcodeSelect.svelte';
    import CategorySelect from '../../CategorySelect.svelte';
    import TextInput from '../../TextInput.svelte';

    let id: Document['id'] | null = null;
    let category: Category['id'] | null = null;
    let title: Document['title'] = '';
    let remark: Snapshot['remark'] = '';

    async function handleSubmit(this: HTMLFormElement) {
        const oid = $dashboardState.currentOffice;
        if (oid === null || id === null || category === null) return;

        const result = await Api.create(oid, { id, title, category }, remark);
        assert(result instanceof Date);
        // TODO: handle error states
    }
</script>

{#if $earliestBatch === null}
    No available barcodes.
{:else}
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <BarcodeSelect bind:code={id} barcodes={$earliestBatch.codes}></BarcodeSelect>
        <TextInput placeholder="Document Title..." name="title" label="Title"></TextInput>
        <CategorySelect bind:catId={category} categories={$categoryList.active} />
        <TextInput placeholder="Remarks..." name="remark" label="Remark" required={false}></TextInput>
        <Button submit>Create Document</Button>
    </form>
{/if}
