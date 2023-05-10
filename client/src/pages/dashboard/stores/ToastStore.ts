import { writable } from '@square/svelte-store';

export interface Toast {
    title: string;
    body: string;
    timeout?: number;
}

const { subscribe, set } = writable(null as Omit<Toast, 'timeout'> | null);

const messages: Toast[] = [];
let handler: number | null = null;
function bootstrap() {
    const first = messages.at(0);
    if (typeof first === 'undefined') {
        set(null);
        return;
    }

    const { title, body, timeout } = first;
    set({ title, body });
    handler = setTimeout(() => {
        handler = null;
        messages.shift();
        bootstrap();
    }, timeout ?? 3000);
}

export const topToastMessage = {
    subscribe,
    enqueue(toast: Toast) {
        if (messages.push(toast) === 1) bootstrap();
    },
    dismiss() {
        if (handler !== null) clearTimeout(handler);
        handler = null;
        bootstrap();
    },
};
