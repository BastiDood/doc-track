<script lang="ts">
    import { assert } from '../../../../assert.ts';

    import { Office } from '../../../../api/office.ts';
    import { Office as OfficeModel} from '../../../../../../model/src/office.ts'
    import { InputType } from '../../../types.ts';
    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { officeList } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import TextInput from '../../TextInput.svelte';
    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let officeID: number;
    let officeName: string;

    async function handleSubmit(this: HTMLFormElement) {
        const elOfficeName = this.elements.namedItem('officename');

        assert(elOfficeName instanceof HTMLInputElement);
        assert(elOfficeName.type === 'text');

        if (!officeID || !elOfficeName.value || elOfficeName.value === officeName) return;
        
        try {
            // Create a pseudo-office element
            await Office.update({
                id: officeID,
                name: elOfficeName.value
            });
            await officeList.reload?.();
            officeID = 0;
            officeName = '';
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently editing an office {$userSession.email}</p>
<section>
    
</section>
<article>
    <form on:submit|preventDefault|stopPropagation={handleSubmit}>
        <OfficeSelect bind:index={officeID} bind:value={officeName} options={$officeList}/>
        <br>
        <TextInput
            placeholder="New Office ID"
            type = {InputType.Number}
            name="officeid"
            label="Office ID:"
            bind:value={officeID}
            disabled={true}
        />
        <TextInput 
            placeholder="Office Name"
            name="officename"
            label="Office Name:"
            bind:value={officeName}
        />
        <Button submit><Checkmark alt="Edit Office"/> Edit Office</Button>
    </form>
</article>

<style>
    @import url('../../../../pages/vars.css');
</style>
