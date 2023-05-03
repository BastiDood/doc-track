<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, PersonPayload, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    import Search from '../../icons/Search.svelte';
    import Edit from '../../icons/Edit.svelte';
    import Close from '../../icons/Close.svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    export let payload: PersonPayload;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate bind:show={show}>
    <ContextElement on:click={() => dispatch(Events.EditLocalPermission, payload)}>
        <div slot="contextIcon">
            <Edit size={iconSize} alt="Edit Local Permissions" />
            Edit Local Permissions
        </div>
    </ContextElement>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.RemoveStaff, payload)}>
        <div slot="contextIcon">
            <Close size={iconSize} alt="Remove Staff" />
            Remove Staff
        </div>
    </ContextElement>
</ContextTemplate>