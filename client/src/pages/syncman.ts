import { z } from 'zod';

// HACK: SyncManager is not properly defined ANYWHERE. See https://stackoverflow.com/questions/69786676/how-to-use-service-worker-background-sync-with-typescript
export interface SyncManager {
    getTags(): Promise<string[]>;
    register(tag: string): Promise<void>;
}

declare global {
    interface ServiceWorkerRegistration {
        readonly sync: SyncManager;
    }

    interface SyncEvent extends ExtendableEvent {
        readonly lastChance: boolean;
        readonly tag: string;
    }

    interface ServiceWorkerGlobalScopeEventMap {
        sync: SyncEvent;
    }

    // eslint-disable-next-line init-declarations
    let SyncEvent: {
      prototype: SyncEvent;
        new(type: string, eventInitDict?: ExtendableEvent): SyncEvent;
  };
}

export const DeferredFetchSchema = z.object({
    credentials: z.string(),
    url: z.string().url(),
    method: z.string(),
    headers: (z.string().array().length(2)).array(),
    body: z.string(),
});

export type DeferredFetch = z.infer<typeof DeferredFetchSchema>
