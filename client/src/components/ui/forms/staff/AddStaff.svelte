<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    import type { Staff } from '~model/staff.ts';
    import type { User } from '~model/user.ts';

    import { assert } from '../../../../assert.ts';
    import { Staff as Api } from '../../../../api/staff.ts';
    import { Events, IconColor, ToastType } from '../../../types.ts';

    import { staffList } from '../../../../stores/StaffStore.ts';
    import { topToastMessage } from '../../../../stores/ToastStore.ts';

    import Button from '../../Button.svelte';
    import PersonAdd from '../../../icons/PersonAdd.svelte';
    import TextInput from '../../TextInput.svelte';

    export let office: Staff['office'];

    let uid: User['id'] = '';

    const dispatch = createEventDispatcher();
    async function handleAdd(this: HTMLFormElement) {
        if (!this.reportValidity()) return;
        assert(uid);

        try {
            if (await Api.add(uid, office)) {
                await staffList.reload?.();
                topToastMessage.enqueue({
                    type: ToastType.Success,
                    title: 'Staff Member Added',
                    body: 'You have successfully added a new staff member.',
                });
                dispatch(Events.Done);
            } else
                topToastMessage.enqueue({
                    title: 'Unknown User',
                    body: 'The user does not exist in the system.',
                });
        } catch (err) {
            assert(err instanceof Error);
            topToastMessage.enqueue({ title: err.name, body: err.message });
        }
    }
</script>

<form on:submit|self|preventDefault|stopPropagation={handleAdd}>
    <TextInput name="user-id" label="User ID:" bind:value={uid} />
    <Button submit>
        <PersonAdd color={IconColor.White} alt="icon for removing a staff member" />
        Add Existing User to Staff
    </Button>
</form>
