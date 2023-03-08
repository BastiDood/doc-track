<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import CheckboxIndeterminateFilled from '../icons/CheckboxIndeterminateFilled.svelte';
    import DocumentBlank from '../icons/DocumentBlank.svelte';
    import RowTemplate from './RowTemplate.svelte';
    import SendAlt from '../icons/SendAlt.svelte';

    import { IconSize, RowEvent, RowType } from '../types.ts';

    export let iconSize = IconSize.Normal;
    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();
    const rowEvent: RowEvent = {
        type: RowType.Inbox,
        data: { id },
    };
</script>

<RowTemplate iconSize={iconSize} on:overflowclick={() => dispatch('overflowclick', rowEvent)}>
    <DocumentBlank size={iconSize} slot="displayIcon"/>
    {title} ID: {id} Category: {category}
    <div slot="actionIcons">
        <SendAlt size={iconSize} on:click = {() => dispatch('sendDocument', rowEvent)} />
        <CheckboxIndeterminateFilled size={iconSize} on:click = {() => dispatch('terminateDocument', rowEvent)} />
    </div>
</RowTemplate>
