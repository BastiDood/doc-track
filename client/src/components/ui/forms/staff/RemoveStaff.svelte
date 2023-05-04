<script lang="ts">
    import { Staff } from '../../../../api/staff.ts';
    import { staffList } from '../../../../pages/dashboard/stores/StaffStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
    
    import Button from '../../Button.svelte';
    import PersonDelete from '../../../icons/PersonDelete.svelte';
    import { ButtonType, IconColor, PersonPayload } from '../../../types.ts';

    export let payload: PersonPayload;

    async function handleRemove() {
        try {
            await Staff.remove({
                office: payload.office,
                user_id: payload.id,
            });
            await staffList.reload?.();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>


<p>Are you sure you want to remove {payload.email} from {$allOffices[payload.office]}?</p>
<Button type={ButtonType.Danger} on:click={handleRemove}>
    <PersonDelete color={IconColor.White} alt="Remove Staff" on:click/>Remove Staff
</Button>
