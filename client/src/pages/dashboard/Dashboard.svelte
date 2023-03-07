
<script>
    import { register } from '../register.ts';
    import { Session } from '../../api/session.ts';

    const ready = register();

    const promise = Session.getUser().then(u => u.name);
    
</script>

<main>

    {#await promise}
        Loading User...
    {:then name}
        <!-- FIXME: Cookies and Session ID -->
        Hello, {name}!
    {/await}
</main>
