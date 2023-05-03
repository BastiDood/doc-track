<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, InvitePayload, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextMenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    import Close from '../../icons/Close.svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    export let payload: InvitePayload;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate bind:show={show}>
    <p>You are removing the invitation for <b>{payload.email}.</b></p>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.RemoveInvitation, payload)}>
        <div slot="contextIcon">
            <Close size={iconSize} alt="Cancel Invitation" />
            Revoke invite
        </div>
    </ContextElement>
    <ContextDivider />
</ContextTemplate>