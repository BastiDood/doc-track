import { DeferredSnapshot } from '~model/api';
import { Document } from '~model/document';

export function goToTrackingPage(id: Document['id']) {
    window.location.href = `/track?id=${id}`;
}

export function markDeferred(store: DeferredSnapshot[], doc: Document['id']) {
    return store.findIndex(def=> def.doc === doc) >= 0;
}