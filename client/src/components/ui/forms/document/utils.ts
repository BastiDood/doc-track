import { DeferredSnapshot } from '../../../../../../model/src/api.ts';

export function upsert(store: DeferredSnapshot[], insert: DeferredSnapshot) {
    const maybeIndex = store.findIndex(snap => snap.doc === insert.doc);
    if (maybeIndex >= 0) store.splice(maybeIndex, 1);
    return [...store, insert];
}