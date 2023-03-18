<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import CheckboxIndeterminateFilled from '../icons/CheckboxIndeterminateFilled.svelte';
    import DocumentBlank from '../icons/DocumentBlank.svelte';
    import RowTemplate from './RowTemplate.svelte';
    import SendAlt from '../icons/SendAlt.svelte';

    import { IconSize, ContextPayload, RowType, Events } from '../types.ts';

    export let iconSize = IconSize.Normal;
    export let id: string;
    export let category: number;
    export let title: string;

    const dispatch = createEventDispatcher();
    const rowEvent: ContextPayload = {
        type: RowType.Inbox,
        id: id,
    };
</script>

<RowTemplate {iconSize} on:overflowclick={() => dispatch(Events.OverflowClick, rowEvent)}>
    <DocumentBlank size={iconSize} slot="displayIcon" />
    <p>
        {title} ID: {id} Category: {category}
    </p>
    <div slot="actionIcons">
        <SendAlt size={iconSize} on:click={() => dispatch(Events.SendDocument, rowEvent)} />
        <CheckboxIndeterminateFilled size={iconSize} on:click={() => dispatch(Events.TerminateDocument, rowEvent)} />
    </div>
</RowTemplate>
