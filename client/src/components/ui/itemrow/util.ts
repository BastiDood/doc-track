import { Document } from '~model/document';

export function goToTrackingPage(id: Document['id']) {
    window.location.href = `/track?id=${id}`;
}