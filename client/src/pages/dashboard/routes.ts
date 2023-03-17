import Barcodes from './views/Barcodes.svelte';
import Drafts from './views/Drafts.svelte';
import Inbox from './views/Inbox.svelte';
import ManageAdministrators from './views/ManageAdministrators.svelte';
import ManageGlobalSettings from './views/ManageGlobalSettings.svelte';
import ManageInvites from './views/ManageInvites.svelte';
import ManageStaff from './views/ManageStaff.svelte';
import Metrics from './views/Metrics.svelte';
import Outbox from './views/Outbox.svelte';

export default {
    '/barcodes': Barcodes,
    '/drafts': Drafts,
    '/inbox': Inbox,
    '/manage-administrators': ManageAdministrators,
    '/manage-global-settings': ManageGlobalSettings,
    '/manage-invites': ManageInvites,
    '/manage-staff': ManageStaff,
    '/metrics': Metrics,
    '/outbox': Outbox,
};