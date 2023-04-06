<script lang="ts">
    import { assert } from "../../../assert.ts";

    import { userSession } from "../../../pages/dashboard/stores/UserStore.ts";
    import Button from "../Button.svelte";
    
    async function generateBarcodes() {
        console.log($userSession)
    }
</script>

<p>You are currently trying to generate a barcode as {$userSession.email}</p>
<p>Selected Office to Generate to: </p>
<Button on:click={generateBarcodes}> Generate Barcodes for </Button>