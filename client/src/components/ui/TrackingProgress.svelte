<script lang="ts">
    import type { PaperTrail } from '~model/api.ts';
    import { Status } from '../../../../model/src/snapshot';

    export let trail: PaperTrail[];

    $: registerDate = trail
        .find(trail => trail.status === Status.Register)
        ?.creation
        .toDateString();
    $: inSystemDate = trail
        .find(trail => trail.status === Status.Send || trail.status === Status.Terminate)
        ?.creation
        .toDateString();
    $: terminateDate = trail
        .find(trail => trail.status === Status.Terminate)
        ?.creation
        .toDateString();
</script>

<section class="justify-content-between">
    <div class="completed">
        <p class="is-complete"></p>
        <p>Registered<br><span>{registerDate ?? 'Pending'}</span></p>
    </div>
    <div class:completed={inSystemDate ?? terminateDate}>
        <p class="is-complete"></p>
        <p>In System<br><span>{inSystemDate ?? 'Pending'}</span></p>
    </div>
    <div class:completed={terminateDate}>
        <p class="is-complete"></p>
        <p>Terminated<br><span>{terminateDate ?? 'Pending'}</span></p>
    </div>
</section>

<style>
    section {
        display: flex;
    }

    div {
        text-align: center;
        width: 33vw;
        position: relative;
        display: block;
    }

    p {
        color: var(--offline-color);
    }

    .is-complete {
        position: relative;
        border-radius: 50%;
        height: 3rem;
        width: 3rem;
        border: 0 solid var(--dashboard-sidedrawer);
        background-color: var(--pending-bg);
        margin: 0 auto;
    }

    .completed > .is-complete {
        border-color: var(--success-bg);
        border-width: 0;
        background-color: var(--success-bg);
    }

    div.completed > p {
        color: var(--text-color);
    }

    div::before {
        content: '';
        display: block;
        height: 0.5rem;
        width: 30vw;
        background-color: var(--pending-bg);
        top: 1.5rem;
        position: absolute;
        left: -15vw;
        z-index: 0;
    }

    div:first-child::before{
        display: none;
    }

    div.completed::before{
        background-color: var(--success-bg);
    }
</style>
