import { z } from 'zod';

import { BarcodeSchema } from './barcode.ts';
import { BatchSchema } from './batch.ts';
import { CategorySchema } from './category.ts';
import { DocumentSchema } from './document.ts';
import { OfficeSchema } from './office.ts';
import { SnapshotSchema } from './snapshot.ts';
import { StaffSchema } from './staff.ts';
import { UserSchema } from './user.ts';

export const MinBatchSchema = z.object({
    batch: BatchSchema.shape.id,
    creation: BatchSchema.shape.creation,
    codes: BarcodeSchema.shape.code.array(),
});

export type MinBatch = z.infer<typeof MinBatchSchema>;

export const GeneratedBatchSchema = BatchSchema
    .omit({ office: true, generator: true })
    .and(z.object({ codes: BarcodeSchema.shape.code.array() }))

export type GeneratedBatch = z.infer<typeof GeneratedBatchSchema>;

export enum InsertSnapshotError {
    DocumentNotFound,
    EvaluatorNotFound,
    TargetNotFound,
    InvalidStatus,
}

export const InsertSnapshotErrorSchema = z.nativeEnum(InsertSnapshotError);

export enum BarcodeAssignmentError {
    AlreadyAssigned,
    BarcodeNotFound,
    CategoryNotFound,
    EvaluatorNotFound,
}

export const BarcodeAssignmentErrorSchema = z.nativeEnum(BarcodeAssignmentError);

export const PaperTrailSchema = SnapshotSchema
    .pick({ creation: true, status: true, target: true, remark: true })
    .extend({ category: CategorySchema.shape.name })
    .and(DocumentSchema.pick({ title: true }))
    .and(UserSchema.pick({ name: true, email: true, picture: true }));

export type PaperTrail = z.infer<typeof PaperTrailSchema>;

export const InboxEntrySchema = SnapshotSchema
    .pick({ creation: true })
    .extend({
        doc: DocumentSchema.shape.id,
        category: CategorySchema.shape.name,
    })
    .and(DocumentSchema.pick({ title: true }));

export type InboxEntry = z.infer<typeof InboxEntrySchema>;

export const OutboxEntrySchema = SnapshotSchema
    .pick({ creation: true, status: true, target: true})
    .extend({
        doc: DocumentSchema.shape.id,
        category: CategorySchema.shape.name
    })
    .and(DocumentSchema.pick({ title: true }));

export type OutboxEntry = z.infer<typeof OutboxEntrySchema>

export const AllInboxSchema = z.object({
    pending: InboxEntrySchema.array(),
    accept: InboxEntrySchema.array()
})
export type AllInbox = z.infer<typeof AllInboxSchema>

export const AllOutboxSchema = z.object({
    ready: OutboxEntrySchema.array(),
    accept: OutboxEntrySchema.array()
})
export type AllOutbox = z.infer<typeof AllOutboxSchema>

export const AllOfficesSchema = z.record(OfficeSchema.shape.id, OfficeSchema.shape.name);
export type AllOffices = z.infer<typeof AllOfficesSchema>;

export const FullSessionSchema = UserSchema
    .omit({ permission: true })
    .extend({
        global_perms: UserSchema.shape.permission,
        local_perms: z.record(z.coerce.number().pipe(OfficeSchema.shape.id), StaffSchema.shape.permission),
    });
export type FullSession = z.infer<typeof FullSessionSchema>;

const WithoutActiveSchema = CategorySchema.pick({ id: true, name: true }).array();
export const AllCategoriesSchema = z.object({
    active: WithoutActiveSchema,
    retire: WithoutActiveSchema,
});

export type AllCategories = z.infer<typeof AllCategoriesSchema>;
