<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import { Events } from '../../types.ts';

    import Add from '../../icons/Add.svelte';
    import Edit from '../../icons/Edit.svelte';

    import ContextTemplate from '../contextmenu/ContextTemplate.svelte';
    import ContextElement from '../contextmenu/ContextElement.svelte';
    import ContextDivider from '../contextmenu/ContextDivider.svelte';

    export let showMenu = false;

    const dispatch = createEventDispatcher();
</script>

<ContextTemplate on:close bind:show={showMenu}>
    <ContextElement on:click={() => dispatch(Events.RemoveCategory)}>
        <Add slot="contextIcon" alt="Remove Category" />
        Remove Category
    </ContextElement>
    <ContextDivider />
    <ContextElement on:click={() => dispatch(Events.RenameCategory)}>
        <Edit slot="contextIcon" alt="Rename Category" />
        Rename Category
    </ContextElement>
</ContextTemplate>
