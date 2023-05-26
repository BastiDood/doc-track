<script lang="ts">
    import { fade } from 'svelte/transition';

    
    import './../icons/icon-styles.css';
    export let alt: string;

    // Replace the next lines to generate an icon.
    const iconUrl = new URL('../../assets/icons/LogoMain.svg', import.meta.url);
</script>
<div id='logo-container'>
<img id='logo' {alt} src="{iconUrl.pathname}" on:click on:keydown in:fade={{delay: 100, duration: 1000}} />
{#each 'DOCTRACK' as char, i}
    <span class="letter-doctrack" in:fade={{delay: 500 + i * 150, duration: 150}}>{char}</span>
{/each}
<br>
<span class='letter-description' in:fade={{delay: 2000, duration: 200}}><b>Document Tracking System</b></span>
</div>

<style>
    @import url('../../pages/vars.css');
    #logo-container {
        position: relative;
    }

    #logo {
        width: 100%;
        height: 100%;
        max-width: 512px;
    }

    .letter-doctrack {
        font-size: 3rem;
        font-weight: 700;
        top: 50%;
        text-align: center;
        color: var(--primary-color);
        margin: var(--spacing-small);
    }

    .letter-description {
        font-size: 1.5rem;
        font-weight: 400;
        top: 50%;
        text-align: center;
        color: var(--text-color);
    }
</style>