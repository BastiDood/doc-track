<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { assert } from '../../../../assert.ts';
    import { Staff as Api } from '../../../../api/staff.ts';
    import { Staff } from '~model/staff.ts';
    import { User } from '~model/user.ts';
    
    import { staffList } from '../../../../pages/dashboard/stores/StaffStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    import { topToastMessage } from '../../../../pages/dashboard/stores/ToastStore.ts';
    
    import Button from '../../Button.svelte';
    import PersonDelete from '../../../icons/PersonDelete.svelte';
    import { ButtonType, Events, IconColor } from '../../../types.ts';
    

    export let id: Staff['user_id'];
    export let office: Staff['office'];
    export let email: User['email'];

    const dispatch = createEventDispatcher();
    async function handleRemove() {
        try {
            await Api.remove({
                office: office,
                user_id: id,
            });
            await staffList.reload?.();
            dispatch(Events.Done);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>


<p>Are you sure you want to remove {email} from {$allOffices[office]}?</p>
<Button type={ButtonType.Danger} on:click={handleRemove}>
    <PersonDelete color={IconColor.White} alt="Remove Staff" on:click/>Remove Staff
</Button>
