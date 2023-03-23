import Barcodes from './Barcodes.svelte';
import Drafts from './Drafts.svelte';
import Inbox from './Inbox.svelte';
import ManageAdministrators from './Admins.svelte';
import ManageGlobalSettings from './Settings.svelte';
import ManageInvites from './Invites.svelte';
import ManageStaff from './Staff.svelte';
import Metrics from './Metrics.svelte';
import Outbox from './Outbox.svelte';

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
