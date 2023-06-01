<script lang="ts">
    import { PaperTrail } from "~model/api";
    import { Status } from "../../../../model/src/snapshot";

    export let trail: PaperTrail[];

    const registerDate = trail.find(trail => trail.status == Status.Register)?.creation;
    const inSystemDate = trail.find(trail => trail.status == Status.Send || trail.status == Status.Terminate)?.creation;
    const terminateDate = trail.find(trail => trail.status == Status.Terminate)?.creation;
</script>
<section>
    <div>
        <div class="row justify-content-between">
            <div class="track" class:completed={registerDate||inSystemDate||terminateDate}>
                <span class="is-complete"></span>
                <p>Registered<br><span>{registerDate?.toDateString() ?? 'Pending'}</span></p>
            </div>
            <div class="track" class:completed={inSystemDate||terminateDate}>
                <span class="is-complete"></span>
                <p>In System<br><span>{inSystemDate?.toDateString() ?? 'Pending'}</span></p>
            </div>
            <div class="track" class:completed={terminateDate}>
                <span class="is-complete"></span>
                <p>Terminated<br><span>{terminateDate?.toDateString() ?? 'Pending'}</span></p>
            </div>
        </div>
    </div>
</section>


  <style>
    .row {
        display: flex;
        flex-direction: row;
    }
    .track{
        text-align: center;
        width: 33vw;
        position: relative;
        display: block;
    }
    .track .is-complete{
        display: block;
        position: relative;
        border-radius: 50%;
        height: 3rem;
        width: 3rem;
        border: 0px solid var(--dashboard-sidedrawer);
        background-color: var(--pending-bg);
        margin: 0 auto;
    }
    .track.completed .is-complete{
        border-color: var(--success-bg);
        border-width: 0px;
        background-color: var(--success-bg);
    }
    .track.completed .is-complete:after {
        border-color: white;
        border-width: 0px 3px 3px 0;
        width: 7px;
        left: 11px;
        opacity: 1;
    }
    .track p {
        margin-top: 8px;
        margin-bottom: 0;
        line-height: 20px;
    }
    .track.completed p{color: var(--text-color);}
    .track p{color: var(--offline-color);}
    .track::before {
        content: '';
        display: block;
        height: 3px;
        width: 30vw;
        background-color: var(--pending-bg);
        top: 1.5rem;
        position: absolute;
        left: -15vw;
        z-index: 0;
    }
    .track:first-child:before{display: none;}
    .track.completed:before{background-color: var(--success-bg);}

  </style>