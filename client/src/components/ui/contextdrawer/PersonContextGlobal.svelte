<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, PersonPayload, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';

    import Edit from '../../icons/Edit.svelte';

    const dispatch = createEventDispatcher();
    export let show = false as boolean;
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
