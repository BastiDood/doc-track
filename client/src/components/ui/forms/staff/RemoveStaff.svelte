<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { Staff } from '~model/staff.ts';
    import type { User } from '~model/user.ts';

    import { assert } from '../../../../assert.ts';
    import { Staff as Api } from '../../../../api/staff.ts';
    import { ButtonType, Events, IconColor, ToastType } from '../../../types.ts';

    import { staffList } from '../../../../stores/StaffStore.ts';
    import { allOffices } from '../../../../stores/OfficeStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';

    import Button from '../../Button.svelte';
    import PersonDelete from '../../../icons/PersonDelete.svelte';

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
            topToastMessage.enqueue({
                type: ToastType.Success,
                title: 'Staff Removal',
                body: 'You have successfully removed a staff.',
            });
            dispatch(Events.Done);
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<p>Are you sure you want to remove {email} from {$allOffices[office]}?</p>
<Button type={ButtonType.Danger} on:click={handleRemove}>
    <PersonDelete color={IconColor.White} alt="Remove Staff" on:click />
    Remove Staff
</Button>
