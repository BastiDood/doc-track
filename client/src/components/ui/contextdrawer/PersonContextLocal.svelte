<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    import Edit from '../../icons/Edit.svelte';
    import PersonDelete from '../../icons/PersonDelete.svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate on:close bind:show={show}>
    <ContextElement on:click={() => dispatch(Events.EditLocalPermission)}>
        <div slot="contextIcon">
            <Edit size={iconSize} alt="Edit Local Permissions" />
            Edit Local Permissions
        </div>
    </ContextElement>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.RemoveStaff)}>
        <div slot="contextIcon">
            <PersonDelete size={iconSize} alt="Remove Staff" />
            Remove Staff
        </div>
    </ContextElement>
</ContextTemplate>