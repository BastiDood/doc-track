import { writable } from '@square/svelte-store';

export interface Toast {
    title: string;
    body: string;
    timeout?: number;
}

const { subscribe, set } = writable(null as Omit<Toast, 'timeout'> | null);

let messages: Toast[] = [];
let handler: number | null = null;
function bootstrap() {
    let first = messages[0];
    if (first === undefined) {
        set(null);
        return;
    }

    const { title, body, timeout } = first;
    set({ title, body });
    handler = setTimeout(() => {
        handler = null;
        [first, ...messages] = messages;
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
