<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    import { IconColor } from '../../../types.ts';

	const dispatch = createEventDispatcher();

    function subscribe() {
        dispatch('subscribe', {
			isSubscribed: true 
		});
    }
</script>

<p>Do you want to Subscribe to Push Notification?</p>
<Button on:click={subscribe}>
    <Checkmark color={IconColor.White} alt="Accept Push Notification"/>Subcribe
</Button>