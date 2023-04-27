<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';

    import { IconColor } from '../../../types.ts';

    const dispatch = createEventDispatcher();

    function unsubscribe() {
        dispatch('unsubscribe', {
            isSubscribed: false 
        });
    }
</script>

<p>Do you want to Unsubscribe to Push Notification?</p>
<Button on:click={unsubscribe}>
    <Checkmark color={IconColor.White} alt="Accept Push Notification" on:click/>Unsubscribe
</Button>

