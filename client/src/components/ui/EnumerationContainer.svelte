<section>
    <slot></slot>
</section>

<style>
    @import url('../../pages/vars.css');

    section {
        margin: var(--spacing-normal);
        padding: var(--spacing-normal);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-small);
        border: var(--spacing-x-small) solid var(--primary-color);
        box-shadow: var(--spacing-small) var(--spacing-small) var(--spacing-small) 0px var(--shadow-color);
        border-radius: var(--border-radius);
        background-color: var(--dashboard-sidedrawer);
    }
</style>