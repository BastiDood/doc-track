<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events, IconSize } from '../../types.ts';
    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    import SendAlt from '../../icons/SendAlt.svelte';
    import CheckboxIndeterminateFilled from '../../icons/CheckboxIndeterminateFilled.svelte';

    const dispatch = createEventDispatcher();
    export let showMenu = false;
    export let iconSize = IconSize.Normal;
</script>

<ContextTemplate on:close bind:show={showMenu}>
    <ContextElement on:click={() => dispatch(Events.SendDocument)}>
        <div slot="contextIcon">
            <SendAlt size={iconSize} alt="Send Document" />
            Send Document
        </div>
    </ContextElement>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.TerminateDocument)}>
        <div slot="contextIcon">
            <CheckboxIndeterminateFilled size={iconSize} alt="Terminate Document" />
            Terminate Document
        </div>
    </ContextElement>
</ContextTemplate>
