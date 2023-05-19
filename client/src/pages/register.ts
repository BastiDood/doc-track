export function register(): Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), {
        type: 'module',
        scope: '/',
    });
}
