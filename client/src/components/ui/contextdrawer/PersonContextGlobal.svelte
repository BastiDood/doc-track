<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, PersonPayload, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    import Edit from '../../icons/Edit.svelte';
    import PersonDelete from '../../icons/PersonDelete.svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    export let payload: PersonPayload;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate bind:show={show}>
    <ContextElement on:click={() => dispatch(Events.EditGlobalPermission, payload)}>
        <div slot="contextIcon">
            <Edit size={iconSize} alt="Edit Local Permissions" />
            Edit Global Permissions
        </div>
    </ContextElement>
</ContextTemplate>