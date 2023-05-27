const { href: ICON_URL } = new URL('./assets/logo/DocTrack-256x256.png', import.meta.url);

/** Attempts to send a notification. Repeatedly prompts the user until they explicitly accept or reject. */
export async function sendNotification(title: string, options?: NotificationOptions) {
    let perm = Notification.permission;
    for (;;) {
        switch (perm) {
            case 'granted':
                return new Notification(title, {
                    lang: 'EN',
                    icon: ICON_URL,
                    ...options,
                });
            case 'denied': return null;
            case 'default':
            default: break;
        }
        perm = await Notification.requestPermission();
    }
}
