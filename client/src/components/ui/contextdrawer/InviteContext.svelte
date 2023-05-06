<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, InvitePayload, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';

    import Close from '../../icons/Close.svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    export let payload: InvitePayload;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate bind:show>
    <ContextElement on:click={() => dispatch(Events.RemoveInvitation, payload)}>
        <div slot="contextIcon">
            <Close size={iconSize} alt="Cancel Invitation" />
            Revoke invite of <b>{payload.email}</b>
        </div>
    </ContextElement>
</ContextTemplate>
