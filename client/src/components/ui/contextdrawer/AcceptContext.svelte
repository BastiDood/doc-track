<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, ContextPayload, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    import Checkmark from '../../icons/Checkmark.svelte';
    import Close from '../../icons/Close.svelte';
    import Camera from '../../icons/Camera.svelte';

    const dispatch = createEventDispatcher();
    export let show = false;
    export let payload: ContextPayload;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate bind:show={show}>
    <ContextElement on:click={() => dispatch(Events.AcceptDocument, payload)}>
        <div slot="contextIcon">
            <Checkmark size={iconSize} alt="Accept Document"/>
            Accept Document
        </div>
    </ContextElement>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.DeclineDocument, payload)}>
        <div slot="contextIcon">
            <Close size={iconSize} alt="Decline Document"/>
            Decline Document
        </div>
    </ContextElement>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.Camera, payload)}>
        <div slot="contextIcon">
            <Camera size={iconSize} alt="Select an Image"/>
            Take a Picture / Choose a Image
        </div>
    </ContextElement>
</ContextTemplate>