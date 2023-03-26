import Barcodes from './Barcodes.svelte';
import Drafts from './Drafts.svelte';
import Inbox from './Inbox.svelte';
import ManageAdministrators from './Admins.svelte';
import ManageGlobalSettings from './Settings.svelte';
import ManageInvites from './Invites.svelte';
import ManageStaff from './Staff.svelte';
import Metrics from './Metrics.svelte';
import Outbox from './Outbox.svelte';
import Sandbox from './Sandbox.svelte';

export default {
    '/barcodes': Barcodes,
    '/drafts': Drafts,
    '/inbox': Inbox,
    '/admin': ManageAdministrators,
    '/settings': ManageGlobalSettings,
    '/invites': ManageInvites,
    '/staff': ManageStaff,
    '/metrics': Metrics,
    '/outbox': Outbox,
    '/sandbox': Sandbox,
};
