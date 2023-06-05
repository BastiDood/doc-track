<script>
    const logoAngry = new URL('../../../assets/icons/doctrack-sus.svg', import.meta.url);
</script>

<div>
    <img src="{logoAngry.pathname}" alt="Doctrack sus logo" />
    <h2>Hey, how did you end up here?</h2>
    <p>You are accessing an invalid route! Click the Hamburger icon on the top left corner.</p>
    <b>Hurry before Mr. Doctrack gets angry!</b>
</div>

<style>
    b {
        color: red;
    }
    
    img {
        max-width: 300px;
        user-select: none;
    }

    div {
        text-align: center;
    }
</style>
