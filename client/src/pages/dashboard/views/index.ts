import Barcodes from './Barcodes.svelte';
import Dossier from './Dossier.svelte';
import Inbox from './Inbox.svelte';
import ManageUsers from './Users.svelte';
import ManageCategories from './Categories.svelte';
import ManageGlobalSettings from './Settings.svelte';
import ManageInvites from './Invites.svelte';
import ManageStaff from './Staff.svelte';
import Metrics from './Metrics.svelte';
import Outbox from './Outbox.svelte';
import Sandbox from './Sandbox.svelte';

export default {
    '/barcodes': Barcodes,
    '/categories': ManageCategories,
    '/dossier': Dossier,
    '/inbox': Inbox,
    '/users': ManageUsers,
    '/settings': ManageGlobalSettings,
    '/invites': ManageInvites,
    '/staff': ManageStaff,
    '/metrics': Metrics,
    '/outbox': Outbox,
    '/sandbox': Sandbox,
};
