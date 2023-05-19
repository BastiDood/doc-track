export function register() {
    return navigator.serviceWorker.register(new URL('sw.ts', import.meta.url), {
        type: 'module',
        scope: '/',
    });
}
