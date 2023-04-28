<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    import { IconColor } from '../../../types.ts';

    const dispatch = createEventDispatcher();
</script>

<p>Do you want to Subscribe to Push Notification?</p>
<Button on:click={() => dispatch('subscribe', true)}>
    <Checkmark color={IconColor.White} alt="Accept Push Notification"/>Subcribe
</Button>
