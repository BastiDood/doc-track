<script>
    import DoctrackSus from '../../../components/doctrack/DoctrackSus.svelte';
</script>

<div>
    <DoctrackSus />
    <h2>Hey, how did you end up here?</h2>
    <p>You are accessing an invalid route! Click the Hamburger icon on the top left corner.</p>
    <b>Hurry before Mr. Doctrack gets angry!</b>
</div>

<style>
    b {
        color: red;
    }

    div {
        text-align: center;
        margin-top: var(--spacing-large);

    }
</style>
