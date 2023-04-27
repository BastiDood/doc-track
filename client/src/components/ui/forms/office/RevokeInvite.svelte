<script lang='ts'>
    import { assert } from '../../../../assert.ts';
    import { Invite } from '../../../../api/invite.ts';

    import type { Office as OfficeModel } from '../../../../../../model/src/office.ts';
    import type { User } from '../../../../../../model/src/user.ts';

    import { userSession } from '../../../../pages/dashboard/stores/UserStore.ts';
    import { allOffices } from '../../../../pages/dashboard/stores/OfficeStore.ts';

    import Button from '../../Button.svelte';
    import Checkmark from '../../../icons/Checkmark.svelte';
    import OfficeSelect from '../../OfficeSelect.svelte';

    let currOid: OfficeModel['id'] | null = null;
    let currEmail: User['email'] | null = null;

    async function handleSubmit(this: HTMLFormElement) {
        // Email validation
        const emailInput = this.elements.namedItem('inputemail');
        assert(emailInput instanceof HTMLInputElement);
        assert(emailInput.type === 'email');

        // Checks validity of office
        if (currOid === null || currEmail === null) return;
        if (!this.reportValidity()) return;

        try {
            await Invite.revoke({ office: currOid, email: currEmail });
            this.reset();
        } catch (err) {
            // TODO: No permission handler
            alert(err);
        }
    }
</script>

<p>You are currently inviting a user as {$userSession?.email}</p>
<article>
    {#if Object.getOwnPropertyNames($allOffices).length === 0}
        Invite unavailable as there are no offices available.
    {:else}
        <form on:submit|preventDefault|stopPropagation={handleSubmit}>   
            <OfficeSelect bind:oid={currOid} offices={$allOffices} />
            {#if typeof currOid === 'number'}
                <br />
                <section>
                    {#await Invite.getList(currOid)}
                        <span>Loading invites...</span>
                    {:then invites}
                        {#each invites as invite (invite.email)}
                            <div class="select-mail" on:click={() => (currEmail = invite.email)} on:keydown>
                                <p>{invite.email} (Permission: {invite.permission.toString(2).padStart(9, '0')})</p>
                            </div>
                        {:else}
                            No invites available...
                        {/each}
                    {/await}
                </section>
                <br />
                <label>
                    Email
                    <input type="email" name="inputemail" placeholder="email@example.com" required readonly bind:value={currEmail} />
                </label>
                <Button submit><Checkmark alt="Revoke invite" />Revoke Invite</Button> 
            {/if}
        </form>
    {/if}
</article>

<style>
    @import url('../../../../pages/vars.css');

    input {
        border: var(--primary-color) 2px solid;
        border-radius: var(--border-radius);
        padding: var(--spacing-small) var(--spacing-normal);
    }
    
    section {
        overflow-y: scroll;
        border: var(--spacing-tiny) solid;
        height: 50vh;
    }

    .select-mail {
        padding: var(--spacing-tiny);
        margin: var(--spacing-tiny);
    }

    .select-mail:hover {
        background-color: lightgray;
    }
</style>
