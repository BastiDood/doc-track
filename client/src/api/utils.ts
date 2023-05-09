import { DeferredSnapshot } from "~model/api";

export function upsert(store: DeferredSnapshot[], insert: DeferredSnapshot) {
    const maybeIndex = store.findIndex(snap => {
        return snap.doc === insert.doc;
    })
    if (maybeIndex >= 0) store.splice(maybeIndex, 1);
    return [...store, insert];
}