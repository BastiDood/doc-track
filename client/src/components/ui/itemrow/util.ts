import { Document } from '~model/document';

export function redirectHandler(id: Document['id']) {
    window.location.href = `/track?id=${id}`;
}