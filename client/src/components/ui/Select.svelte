<script lang="ts">
    export let options: Array<string> = [];
    export let index = 0;
    export let value;

    $: value = options[index];
</script>

<select bind:value={index}>
    {#each options as option, i}
        <option value={i}> {options[i]}</option>
    {/each}
</select>