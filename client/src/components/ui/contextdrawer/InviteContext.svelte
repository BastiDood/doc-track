<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';

    import Close from '../../icons/Close.svelte';

    const dispatch = createEventDispatcher();
    export let show = false as boolean;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate on:close bind:show>
    <ContextElement on:click={() => dispatch(Events.RemoveInvitation)}>
        <div slot="contextIcon">
            <Close size={iconSize} alt="Cancel Invitation" />
            Cancel Invitation
        </div>
    </ContextElement>
</ContextTemplate>
