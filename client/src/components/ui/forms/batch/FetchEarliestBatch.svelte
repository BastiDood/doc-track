<script lang="ts">
  import { Batch } from '../../../../api/batch.ts';
  import { Office } from '../../../../api/office.ts';
  import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
  import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';
  import { Office as OfficeModel } from '../../../../../../model/src/office.ts';

  import TextInput from '../../TextInput.svelte';
  import Button from '../../Button.svelte';
  import Checkmark from '../../../icons/Checkmark.svelte';
  import OfficeSelect from '../../OfficeSelect.svelte';

  let currId: OfficeModel['id'] | null = null;
  let currName: OfficeModel['name'] | null = null;

  $: currName = currId === null ? null : $allOffices[currId] ?? null;


  async function handleFetch() {
      if (currId === null || typeof currName !== 'string') return;
      
      try {
          console.log(await Batch.getEarliestBatch(currId));
      }
      catch (err) {
          // TODO: error message
          alert(err);
      }
  }

</script>

<p>You are currently viewing that batch of barcodes as {$userSession?.email}</p>
<article>
  {#if Object.getOwnPropertyNames($allOffices).length === 0}
      No office where a new batch of barcodes will be viewed
  {:else}
      <form on:submit|preventDefault|stopPropagation={handleFetch}>   
          <OfficeSelect bind:oid={currId} offices={$allOffices} />
          <br />
          {#if currName !== null}
              <Button submit><Checkmark alt="Download Barcodes"/>Download</Button> 
          {/if}
      </form>
  {/if}
</article>
