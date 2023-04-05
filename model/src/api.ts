import { z } from 'zod';

import { BarcodeSchema } from './barcode.ts';
import { BatchSchema } from './batch.ts';
import { CategorySchema } from './category.ts';
import { DocumentSchema } from './document.ts';
import { OfficeSchema } from './office.ts';
import { SnapshotSchema, StatusSchema } from './snapshot.ts';
import { StaffSchema } from './staff.ts';
import { UserSchema } from './user.ts';

export const MinBatchSchema = z.object({
    batch: BatchSchema.shape.id,
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

export const SummarySchema = z.object({
    status: StatusSchema,
    amount: z.coerce.bigint().positive(),
});
export type Summary = z.infer<typeof SummarySchema>;

export const MetricsSchema = z.record(StatusSchema, SummarySchema.shape.amount);
export type Metrics = z.infer<typeof MetricsSchema>;

export const FullSessionSchema = UserSchema
    .omit({ permission: true })
    .extend({
        global_perms: z.string().transform(bits => parseInt(bits, 2)).pipe(UserSchema.shape.permission),
        local_perms: z.record(
            z.string().transform(oid => parseInt(oid, 10)).pipe(OfficeSchema.shape.id),
            z.string().transform(bits => parseInt(bits, 2)).pipe(StaffSchema.shape.permission),
        ),
    });
export type FullSession = z.infer<typeof FullSessionSchema>;
