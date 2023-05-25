import { writable } from '@square/svelte-store';
import { ToastType } from '../components/types.ts';

export interface Toast {
    title: string;
    body: string;
    type?: ToastType;
    timeout?: number;
}

const { subscribe, set } = writable(null as Omit<Toast, 'timeout'> | null);

const messages: Toast[] = [];
let handler: number | null = null;

function advance() {
    handler = null;
    messages.shift();
    // eslint-disable-next-line no-use-before-define
    bootstrap();
}

function bootstrap() {
    const first = messages.at(0);
    if (typeof first === 'undefined') {
        set(null);
        return;
    }

    const { title, body, type, timeout } = first;
    set({ title, body, type });
    handler = setTimeout(advance, timeout ?? 3000);
}

/**
 * This store handles the toast messages being displayed to the user.
 * 
 * # Store Details
 * - Allows components to prompt a toast message to the user by passing a {@linkcode Toast} object to the `enqueue` method.
 * - Dismisses the current presented message through `dismiss`.
 * 
 * # Methods
 * - `enqueue` => Adds a toast message object to the queue.
 * - `dismiss` => Dismisses the currently displayed toast message object.
 */
export const topToastMessage = {
    subscribe,
    enqueue(toast: Toast) {
        toast.type ??= ToastType.Error;
        if (messages.push(toast) === 1) bootstrap();
    },
    dismiss() {
        if (handler !== null) clearTimeout(handler);
        advance();
    },
};