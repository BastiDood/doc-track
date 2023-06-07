<script>
    import DoctrackSus from '../../../components/doctrack/DoctrackSus.svelte';
</script>

<div>
    <div id="doctrack-logo">
        <DoctrackSus />
    </div>
    <h2>Hey, how did you end up here?</h2>
    <p>You are accessing an invalid route! Click the Hamburger icon on the top left corner.</p>
    <b>Hurry before Mr. DocTrack gets angry!</b>
</div>

<style>
    b {
        color: red;
    }

    div {
        text-align: center;
    }

    #doctrack-logo {
        display: block;
        margin: 0 auto;
        max-width: 50svw;
    }
</style>
