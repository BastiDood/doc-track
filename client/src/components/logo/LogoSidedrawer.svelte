<script lang="ts">
    import './../icons/icon-styles.css';
    export let alt: string;

    const iconUrl = new URL('../../assets/icons/LogoMain.svg', import.meta.url);
</script>

<img id='logo' {alt} src="{iconUrl.pathname}" on:click on:keydown />


<style>
    #logo {
        width: 60%;
        height: 60%;
    }
</style>