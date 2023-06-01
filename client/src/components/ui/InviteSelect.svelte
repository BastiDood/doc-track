<script lang="ts">
    import type { Invitation } from '../../../../model/src/invitation.ts';
    export let invites: Pick<Invitation, 'email' | 'permission'>[];
    export let value: Invitation['email'] | undefined;
</script>

<section>
    {#each invites as { email, permission } (email)}
        <label>
            <input type="radio" name="selected-invite" bind:group={value} value={email}>{email} ({permission.toString(2).padStart(9, '0')})
        </label>
    {/each}
</section>

<style>
    @import url('../../pages/vars.css');

    input {
        cursor: pointer;
    }

    section {
        overflow-y: scroll;
        border: var(--spacing-tiny) solid;
        height: 50vh;
    }
</style>
