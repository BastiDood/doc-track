/** Attempts to send a notification. Repeatedly prompts the user until they explicitly accept or reject. */
export async function sendNotification(title: string, options?: NotificationOptions) {
    let perm = Notification.permission;
    for (;;) {
        switch (perm) {
            case 'granted': return new Notification(title, options);
            case 'denied': return null;
            case 'default':
            default: break;
        }
        perm = await Notification.requestPermission();
    }
}
