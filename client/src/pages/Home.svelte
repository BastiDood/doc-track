<script>
    import Button from '../components/ui/Button.svelte';

    import { register } from './register.ts';
    import { ButtonType } from '../components/types.ts';

    import Google from '../components/icons/Google.svelte';
    import Camera from '../components/icons/Camera.svelte';
    import Search from '../components/icons/Search.svelte';
</script>

<main>
    {#await register()}
        Waiting for service worker...
    {:then}
        <div class="middlecontainer">
            <img src="../assets/images/logo-background.png" alt="DocTrack Logo" class="image">
            <br>
            <h3>DocTrack: Document Tracking System</h3>
            <a href="/auth/login"><Button type={ButtonType.Primary}><Google />Log in with University of the Philippines Mail</Button></a>
            <div class="searchcontainer">
                <input type="text" placeholder="Enter tracking number here" class="trackingfield" />
                <Button type={ButtonType.Primary}><Camera /></Button>
                <Button type={ButtonType.Primary}><Search /></Button>
            </div>
        </div>
    {/await}
</main>

<style>
    .image {
        border-radius: 10pt;
    }
    .middlecontainer {
        text-align: center;
        padding: 5pt;
        border: 1pt;
        left: 50%;
        top: 50%;
        margin-top: -100pt;
        margin-left: -100pt;
        position: fixed;
        background-color: #ffb334;
    }
    .searchcontainer {
        padding: 5pt;
        margin-left: 0pt;
        margin-right: 0pt;
    }
    .trackingfield {
        width: calc(100% - 100px);;
        padding: 5pt;
        border: 1pt;
        border-radius: 5pt;
        margin-right: 5pt;
    }
    :global(body) {
        background-color: #1e31d6;
    }
</style>
