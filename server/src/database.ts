import { assert, assertEquals, assertInstanceOf, assertStrictEquals, unreachable } from 'asserts';
import { range } from 'itertools';
import { Pool, PoolClient, PostgresError } from 'postgres';
import { z } from 'zod';

import {
    type AllCategories,
    type AllInbox,
    type AllOffices,
    type AllOutbox,
    type BarcodeMetrics,
    type FullSession,
    type GeneratedBatch,
    type InboxEntry,
    type MinBatch,
    type PaperTrail,
    type PushNotification,
    type StaffMember,
    AllCategoriesSchema,
    AllInboxSchema,
    AllOfficesSchema,
    AllOutboxSchema,
    BarcodeAssignmentError,
    BarcodeMetricsSchema,
    FullSessionSchema,
    InboxEntrySchema,
    InsertSnapshotError,
    MinBatchSchema,
    PaperTrailSchema,
    PushNotificationSchema,
    StaffMemberSchema,
} from '~model/api.ts';

import { type Barcode, BarcodeSchema } from '~model/barcode.ts';
import { type Batch, BatchSchema, } from '~model/batch.ts';
import { type Category, CategorySchema } from '~model/category.ts';
import type { Document } from '~model/document.ts';
import { type Invitation, InvitationSchema } from '~model/invitation.ts';
import { type Metrics, MetricsSchema } from '~model/metrics.ts';
import { type Office, OfficeSchema } from '~model/office.ts';
import { type Pending, PendingSchema } from '~model/pending.ts';
import { type Session, SessionSchema } from '~model/session.ts';
import { type Snapshot, SnapshotSchema } from '~model/snapshot.ts';
import { type PushSubscription, type PushSubscriptionJson, PushSubscriptionSchema } from '~model/subscription.ts';
import { type Staff, StaffSchema } from '~model/staff.ts';
import { type User, UserSchema } from '~model/user.ts';

type InvalidatedPending = {
    valid: false;
    data: Omit<Pending, 'id'>;
}

type InvalidatedSession = {
    valid: true;
    data: Omit<Session, 'id'>;
}

const DeprecationSchema = z.object({ result: z.boolean().nullable() });

const Bitstring = z.string().transform(bits => parseInt(bits, 2));
const PostgresFullSession = FullSessionSchema.extend({
    global_perms: Bitstring.pipe(FullSessionSchema.shape.global_perms),
    local_perms: z.record(z.string().transform(num => parseInt(num, 10)), Bitstring).pipe(FullSessionSchema.shape.local_perms),
});

export class Database {
    #client: PoolClient;

    private constructor(client: PoolClient) {
        this.#client = client;
    }

    static async fromPool(pool: Pool) {
        const client = await pool.connect();
        await client.connect();
        return new Database(client);
    }

    release() {
        this.#client.release();
    }

    /** Checks whether the current session ID maps to a fully valid session (i.e., went through OAuth). */
    async checkValidSession(sid: Session['id']): Promise<boolean> {
        const { rows } = await this.#client.queryObject`SELECT 1 FROM session WHERE id = ${sid}`;
        return rows.length > 0;
    }

    /** Generates a new pending session. */
    async generatePendingSession(): Promise<Pending> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject('INSERT INTO pending DEFAULT VALUES RETURNING *');
        assert(rest.length === 0);
        return PendingSchema.parse(first);
    }

    /** Upgrades a pending session into a valid session. Returns the now-invalidated pending session details. */
    async upgradeSession({ id, user_id, expiration }: Session): Promise<Omit<Pending, 'id'> | null> {
        const transaction = this.#client.createTransaction('upgrade', { isolation_level: 'serializable' });
        await transaction.begin();

        const { rows: [ first, ...rest ] } = await transaction
            .queryObject`DELETE FROM pending WHERE id = ${id} RETURNING nonce,expiration`;
        assertStrictEquals(rest.length, 0);
        if (first === undefined) {
            await transaction.rollback();
            return null;
        }

        const old = PendingSchema.pick({ nonce: true, expiration: true }).parse(first);
        const { rowCount } = await transaction
            .queryArray`INSERT INTO session (id,user_id,expiration) VALUES (${id},${user_id},${expiration.toISOString()})`;
        assertStrictEquals(rowCount, 1);

        await transaction.commit();
        return old;
    }

    async invalidateSession(sid: Pending['id'] & Session['id']): Promise<InvalidatedPending | InvalidatedSession | null> {
        const transaction = this.#client.createTransaction('invalidate', { isolation_level: 'serializable' });

        await transaction.begin();
        const { rows: [ pendingFirst, ...pendingRest ] } = await transaction
            .queryObject`DELETE FROM pending WHERE id = ${sid} RETURNING nonce,expiration`;
        assertStrictEquals(pendingRest.length, 0);
        const { rows: [ sessionFirst, ...sessionRest ] } = await transaction
            .queryObject`DELETE FROM session WHERE id = ${sid} RETURNING user_id,expiration`;
        assertStrictEquals(sessionRest.length, 0);
        await transaction.commit();

        const pending = PendingSchema.omit({ id: true }).optional().parse(pendingFirst);
        const session = SessionSchema.omit({ id: true }).optional().parse(sessionFirst);

        if (pending === undefined) {
            if (session === undefined)
                return null;
            return { valid: true, data: session };
        }

        assert(session === undefined);
        return { valid: false, data: pending };
    }

    /** Gets the invitation list given office and returns the list of invited emails */
    async getInvitationList(office: Office['id']): Promise<Invitation[]> {
        const { rows } = await this.#client
            .queryObject`SELECT * FROM invitation WHERE office = ${office}`;
        return InvitationSchema
            .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
            .array()
            .parse(rows);
    }

    /** Upserts a user to the invite list and returns the creation date. */
    async upsertInvitation({ office, email, permission }: Omit<Invitation, 'creation'>): Promise<Invitation['creation'] | null> {
        const permBits = permission.toString(2);
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO invitation (office,email,permission)
                SELECT * FROM (SELECT ${office}::SMALLINT,${email},${permBits}::LocalPermission) AS data
                    WHERE NOT EXISTS (SELECT 1 FROM users AS u WHERE u.email = ${email}) LIMIT 1
                ON CONFLICT (office,email) DO UPDATE SET permission = ${permBits}, creation = DEFAULT
                RETURNING creation`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : InvitationSchema.pick({ creation: true }).parse(first).creation;
    }

    /** Removes an email from an office's list of invited users. */
    async revokeInvitation(office: Invitation['office'], email: Invitation['email']): Promise<Omit<Invitation, 'office' | 'email'> | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`DELETE FROM invitation WHERE office = ${office} AND email = ${email} RETURNING permission,creation`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : InvitationSchema
                .omit({ office: true, email: true })
                .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
                .parse(first);
    }

    /**
     * If a user already exists in the database, simply update their information (in which
     * case `null` is returned). Otherwise, we delete all of the invites of the specified user
     * and return an array of the office IDs to which the user is invited.
     */
    async insertInvitedUser({ id, name, email, picture }: Omit<User, 'permission'>): Promise<Pick<Invitation, 'office' | 'permission'>[] | null> {
        const transaction = this.#client.createTransaction('registration', { isolation_level: 'serializable' });
        await transaction.begin();

        const updateResult = await transaction
            .queryArray`UPDATE users SET name = ${name}, email = ${email}, picture = ${picture} WHERE id = ${id}`;
        assert(updateResult.rowCount !== undefined);

        // User already exists
        if (updateResult.rowCount === 1) {
            await transaction.commit();
            return null;
        }

        // Check the invite list first
        assertStrictEquals(updateResult.rowCount, 0);
        const { rows } = await transaction
            .queryObject`DELETE FROM invitation WHERE email = ${email} RETURNING office,permission`;
        const invites = InvitationSchema
            .pick({ office: true, permission: true })
            .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
            .array().parse(rows);

        // Add the user into the system
        const insertResult = await transaction
            .queryArray`INSERT INTO users (id,name,email,picture) VALUES (${id},${name},${email},${picture})`;
        assertStrictEquals(insertResult.rowCount, 1);

        // Add the user to all offices to which they are invited (if any)
        for (const { office, permission } of invites) {
            const bits = permission.toString(2);
            const staffResult = await transaction
                .queryArray`INSERT INTO staff (user_id,office,permission) VALUES (${id},${office},${bits})`;
            assertStrictEquals(staffResult.rowCount, 1);
        }

        await transaction.commit();
        return invites;
    }

    /** Gets all of the current staff members for a given office ID. */
    async getStaff(oid: Office['id']): Promise<StaffMember[]> {
        const { rows } = await this.#client
            .queryObject`SELECT u.id,u.name,u.email,u.picture,s.permission FROM staff AS s INNER JOIN users AS u ON s.user_id = u.id WHERE s.office = ${oid}`;
        return StaffMemberSchema
            .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
            .array()
            .parse(rows);
    }

    /**
     * Deletes a {@linkcode Staff} if there are no batches referencing it.
     * Otherwise, it is internally marked as "retired" (i.e., all permissions
     * will be revoked).
     *
     * @returns `true` if successfully deleted
     */
    async removeStaff(uid: Staff['user_id'], oid: Staff['office']): Promise<boolean | null> {
        // TODO: Add Tests for Deletion Case
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT delete_or_else_retire_staff(${uid},${oid}) AS result`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : DeprecationSchema.parse(first).result;
    }

    /** Sets the office-local permissions of a {@linkcode User}. */
    async setStaffPermissions(uid: Staff['user_id'], oid: Staff['office'], perms: Staff['permission']): Promise<boolean> {
        // TODO: Check if valid permissions
        const { rowCount } = await this.#client
            .queryArray`UPDATE staff SET permission = ${perms.toString(2)}::LocalPermission WHERE user_id = ${uid} AND office = ${oid}`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
    }

    /** Sets the system-global permissions of a {@linkcode User}. */
    async setUserPermissions(id: User['id'], perms: User['permission']): Promise<boolean> {
        const { rowCount } = await this.#client
            .queryArray`UPDATE users SET permission = ${perms.toString(2)}::GlobalPermission WHERE id = ${id}`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
    }

    /**
     * Blindly creates a new batch of barcodes. No validation of previous batches is performed.
     * This allows the use case where an admin requires a forced generation of new batches for printing.
     */
    async generateBatch({ office, generator }: Pick<Batch, 'office' | 'generator'>): Promise<GeneratedBatch> {
        const transaction = this.#client.createTransaction('batch');
        await transaction.begin();

        // TODO: Check User Permissions

        const { rows: [ first, ...rest ] } = await transaction
            .queryObject`INSERT INTO batch (office,generator) VALUES (${office},${generator}) RETURNING id,creation`;
        assertStrictEquals(rest.length, 0);

        const { id, creation } = BatchSchema.omit({ office: true, generator: true }).parse(first);

        // TODO: Let the Operator decide how many barcodes are pre-allocated per batch.
        const codes: Barcode['code'][] = [];
        for (const _ of range(10)) {
            const { rows: [ first, ...rest ] } = await transaction
                .queryObject`INSERT INTO barcode (batch) VALUES (${id}) RETURNING code`;
            assertStrictEquals(rest.length, 0);
            codes.push(BarcodeSchema.pick({ code: true }).parse(first).code);
        }

        await transaction.commit();
        return { id, creation, codes };
    }

    /** Returns a list of earliest available {@linkcode Batch} of {@linkcode Barcode} IDs (relative to an {@linkcode Office}). */
    async getEarliestAvailableBatch(oid: Office['id']): Promise<MinBatch | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`WITH _ AS (SELECT id,creation FROM batch WHERE office = ${oid}),
                candidates AS (SELECT batch,creation, bar.code AS doc
                    FROM _ INNER JOIN barcode AS bar ON _.id = bar.batch
                    LEFT JOIN document AS d ON bar.code = d.id WHERE d.id IS NULL)
                SELECT batch,MIN(creation) AS creation,coalesce(array_agg(doc),'{}') AS codes FROM candidates GROUP by batch LIMIT 1`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : MinBatchSchema.parse(first);
    }

    /**
     * Assigns a {@linkcode Barcode} to a newly uploaded {@linkcode Document}.
     * @returns `null` if the barcode has already been reserved
     * @returns creation date if successfully added
     */
    async assignBarcodeToDocument(
        { id, category, title }: Document,
        { evaluator, remark, target }: Pick<Snapshot, 'evaluator' | 'remark' | 'target'>,
    ): Promise<Snapshot['creation'] | BarcodeAssignmentError> {
        // TODO: Do Actual Document Upload
        try {
            const { rows: [ first, ...rest ] } = await this.#client
                .queryObject`WITH results AS (INSERT INTO document (id,category,title) VALUES (${id},${category},${title}) RETURNING id)
                    INSERT INTO snapshot (doc,evaluator,remark,target) VALUES ((SELECT id from results),${evaluator},${remark},${target}) RETURNING creation`;
            assertStrictEquals(rest.length, 0);
            return SnapshotSchema.pick({ creation: true }).parse(first).creation;
        } catch (err) {
            assertInstanceOf(err, PostgresError);
            const { fields: { code, constraint } } = err;
            switch (code) {
                case '23505':
                    assertEquals(constraint, 'document_pkey');
                    return BarcodeAssignmentError.AlreadyAssigned;
                case '23503':
                    switch (constraint) {
                        case 'document_id_fkey': return BarcodeAssignmentError.BarcodeNotFound;
                        case 'document_category_fkey': return BarcodeAssignmentError.CategoryNotFound;
                        case 'snapshot_evaluator_fkey': return BarcodeAssignmentError.EvaluatorNotFound;
                        default: break;
                    }
                // falls through
                default:
                    unreachable();
            }
        }
    }

    async insertSnapshot({ doc, target, evaluator, status, remark }: Omit<Snapshot, 'creation'>): Promise<PushNotification | InsertSnapshotError> {
        try {
            const { rows: [ first, ...rest ] } = await this.#client
                .queryObject`WITH _ AS (INSERT INTO snapshot (doc,target,evaluator,status,remark)
                    VALUES (${doc},${target},${evaluator},${status},${remark}) RETURNING *)
                    SELECT creation,status,d.title,u.name AS eval,o.name AS target
                    FROM _ INNER JOIN document AS d ON doc = d.id INNER JOIN users AS u ON evaluator = u.id LEFT JOIN office AS o ON target = o.id LIMIT 1`;
            assertStrictEquals(rest.length, 0);
            return PushNotificationSchema.parse(first);
        } catch (err) {
            // Lint is ignored due to false positive.
            assertInstanceOf(err, PostgresError);
            const { fields: { code, constraint } } = err;
            switch (code) {
                // deno-lint-ignore no-fallthrough
                case '23503':
                    // foreign_key_violation
                    switch (constraint) {
                        case 'snapshot_doc_fkey': return InsertSnapshotError.DocumentNotFound;
                        case 'snapshot_target_fkey': return InsertSnapshotError.TargetNotFound;
                        case 'snapshot_evaluator_fkey': return InsertSnapshotError.EvaluatorNotFound;
                        default: unreachable();
                    }
                case '23514':
                    // check_violation
                    assertEquals(constraint, 'snapshot_check');
                    return InsertSnapshotError.InvalidStatus; 
                default: unreachable();
            }
        }
    }

    async getPaperTrail(doc: Document['id']): Promise<PaperTrail[]> {
        const { rows } = await this.#client
            .queryObject`SELECT s.creation,s.status,s.target,s.remark,d.title,c.name AS category,u.name,u.email,u.picture
                FROM snapshot AS s
                    INNER JOIN users AS u ON s.evaluator = u.id
                    INNER JOIN document AS d ON s.doc = d.id
                    INNER JOIN category AS c ON d.category = c.id
                WHERE s.doc = ${doc} ORDER BY s.creation ASC`;
        return PaperTrailSchema.array().parse(rows);
    }

    /** Gets a list of {@linkcode InboxEntry} such that they were registered from the given office.  */
    async getDossier(oid: Office['id']): Promise<InboxEntry[]> {
        const { rows } = await this.#client
            .queryObject`SELECT s.doc,d.title,c.name AS category,s.creation FROM snapshot AS s
                INNER JOIN document AS d ON s.doc = d.id
                INNER JOIN category AS c ON d.category = c.id
                INNER JOIN barcode AS bar ON s.doc = bar.code
                INNER JOIN batch AS bat ON bar.batch = bat.id
            WHERE s.status = 'Register' AND bat.office = ${oid}
            ORDER BY s.creation DESC`;
        return InboxEntrySchema.array().parse(rows);
    }

    async getInbox(oid: Office['id']): Promise<AllInbox> {
        const { rows: [first, ...rest] } = await this.#client
            .queryObject`
            WITH mostRecentSnap AS (
                SELECT doc, MAX(creation) AS creation FROM snapshot
                GROUP BY doc
            ), incoming AS (
                SELECT m.doc, m.creation, d.title, c.name AS category, status, target FROM mostRecentSnap AS m
                    INNER JOIN snapshot AS s ON m.creation = s.creation
                    INNER JOIN document AS d ON s.doc = d.id
                    INNER JOIN category AS c ON d.category = c.id
                WHERE target = ${oid} AND (status = 'Send' OR status = 'Receive')
                ORDER BY s.creation DESC
            ), tup AS (
                SELECT status, json_agg(json_build_object('doc', doc, 'creation', creation, 'title', title, 'category', category)) AS info from incoming 
                GROUP BY status
            )
            SELECT json_build_object(
                'pending', coalesce((SELECT info FROM tup WHERE status = 'Send'),'[]'),
                'accept', coalesce((SELECT info FROM tup WHERE status = 'Receive'),'[]')
            ) AS result`;
        assertStrictEquals(rest.length, 0);
        return z.object({ result: AllInboxSchema }).parse(first).result;
    }

    async getOutbox(oid: Office['id']): Promise<AllOutbox> {
        const { rows : [first, ...rest] } = await this.#client
            .queryObject`
            WITH mostRecentSnaps AS (
                SELECT doc,MAX(creation) AS creation FROM snapshot
                GROUP BY doc
            ), register AS (
                SELECT status,json_agg(json_build_object('doc', m.doc, 'creation', m.creation, 'title', d.title, 'category', c.name ,'status', status, 'target', target)) AS info FROM mostRecentSnaps as m
                    INNER JOIN snapshot AS s ON m.creation = s.creation
                    INNER JOIN document AS d ON m.doc = d.id
                    INNER JOIN category AS c ON d.category = c.id
                WHERE status = 'Register' AND target = ${oid}
                GROUP BY status
            ), notAccept AS (
                SELECT s.doc, s.creation, status, target FROM mostRecentSnaps as m
                    INNER JOIN snapshot AS s ON m.creation = s.creation 
                WHERE status = 'Send' AND target != ${oid}
            ), mostRecentRecieved AS (
                SELECT doc, MAX(creation) AS creation, status FROM snapshot
                WHERE status = 'Receive' OR status = 'Register'
                GROUP BY doc, creation, status
            ),  mostRecentRecievedSnap AS (
                SELECT m.doc, m.creation, m.status, s.target FROM mostRecentRecieved as m
                    INNER JOIN snapshot as s ON m.creation = s.creation
                WHERE target = ${oid}
            ), backwardResolve AS (
                SELECT n.status AS status, json_agg(json_build_object('doc', m.doc, 'creation', n.creation, 'title', d.title, 'category', c.name, 'status', n.status, 'target', n.target)) AS info FROM mostRecentRecievedSnap AS m
                    INNER JOIN notAccept AS n ON n.doc = m.doc
                    INNER JOIN document AS d ON m.doc = d.id
                    INNER JOIN category AS c ON d.category = c.id
                GROUP BY n.status
            )
            SELECT json_build_object(
                'ready', coalesce((SELECT info FROM register WHERE status = 'Register'), '[]'),
                'pending', coalesce((SELECT info FROM backwardResolve WHERE status = 'Send'), '[]')
            ) as result`;
        assertStrictEquals(rest.length, 0);
        return z.object({ result: AllOutboxSchema }).parse(first).result;
    }
    /**
     * # Assumption
     * The user has sufficient permissions to add a new system-wide category.
     */
    async createCategory(name: Category['name']): Promise<Category['id'] | null> {
        // TODO: Add Tests for Duplicate Entries
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO category (name) VALUES (${name}) ON CONFLICT DO NOTHING RETURNING id`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : CategorySchema.pick({ id: true }).parse(first).id;
    }

    /** Gets a list of all the active categories in the system. */
    async getAllCategories(): Promise<AllCategories> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`WITH _ AS (SELECT active, json_agg(json_build_object('id', id, 'name', name)) AS info FROM category GROUP BY active)
                SELECT json_build_object(
                    'active', coalesce((SELECT info FROM _ WHERE active), '[]'),
                    'retire', coalesce((SELECT info FROM _ WHERE NOT active), '[]')
                ) AS result`;
        assertStrictEquals(rest.length, 0);
        return z.object({ result: AllCategoriesSchema }).parse(first).result;
    }

    /**
     * Returns `true` if successfully renamed the category.
     *
     * # Assumption
     * The user has sufficient permissions to add a new system-wide category.
     */
    async renameCategory({ id, name }: Pick<Category, 'id' | 'name'>): Promise<boolean> {
        const { rowCount } = await this.#client
            .queryObject`UPDATE category SET name = ${name} WHERE id = ${id}`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
    }

    /**
     * Deletes a {@linkcode Category} if there are no documents referencing it.
     * Otherwise, it is internally marked as "deprecated".
     *
     * # Assumption
     * The user has sufficient permissions to add a new system-wide category.
     */
    async deleteCategory(id: Category['id']): Promise<boolean | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT delete_or_else_deprecate_category(${id}) AS result`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : DeprecationSchema.parse(first).result;
    }

    /** Reactivates a {@linkcode Category}. */
    async activateCategory(id: Category['id']): Promise<Category['name'] | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`UPDATE category SET active = DEFAULT WHERE id = ${id} RETURNING name`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : CategorySchema.pick({ name: true }).parse(first).name;
    }

    /** Register a push subscription to be used later for notifying a user. */
    async pushSubscription({ endpoint, expiration, auth, p256dh }: PushSubscriptionJson) {
        // TODO: Add Tests
        const expires = expiration?.toISOString() || 'infinity';
        const { rowCount } = await this.#client
            .queryArray`INSERT INTO subscription (endpoint,expiration,auth,p256dh)
                VALUES (${endpoint},${expires},${auth},${p256dh})
                ON CONFLICT (endpoint) DO UPDATE SET expiration = ${expires}`;
        assertStrictEquals(rowCount, 1);
    }

    /** Hooks a subscription to a valid document. Returns `false` if already added previously. */
    async hookSubscription(sub: PushSubscription['endpoint'], doc: Document['id']): Promise<boolean> {
        // TODO: Add Tests with Document Bindings
        const { rowCount } = await this.#client
            .queryArray`INSERT INTO notification (sub,doc) VALUES (${sub},${doc}) ON CONFLICT (sub,doc) DO NOTHING`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
    }

    /** Gets all of the associated subscriptions to a document. */
    async getSubscriptionsForDocument(did: Document['id']): Promise<Omit<PushSubscription, 'expiration'>[]> {
        // TODO: Add Tests
        const { rows } = await this.#client
            .queryObject`SELECT s.endpoint,s.auth,s.p256dh
                FROM notification AS n INNER JOIN subscription AS s ON n.sub = s.endpoint
                WHERE n.doc = ${did} AND NOW() < s.expiration`;
        return PushSubscriptionSchema.omit({ expiration: true }).array().parse(rows);
    }

    async getUsers(): Promise<User[]> {
        const { rows } = await this.#client
            .queryObject('SELECT id,name,email,picture,permission FROM users');
        return UserSchema
            .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
            .array()
            .parse(rows);
    }

    /** Returns the user associated with the valid session ID. */
    async getUserFromSession(sid: Session['id']): Promise<User | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT u.* FROM session AS s INNER JOIN users AS u ON s.user_id = u.id WHERE s.id = ${sid} LIMIT 1`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : UserSchema
                .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
                .parse(first);
    }

    /** Returns the local permissions of the session in the provided office. */
    async getStaffFromSession(sid: Session['id'], oid: Office['id']): Promise<Pick<Staff, 'user_id' | 'permission'> | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT user_id,permission FROM session INNER JOIN staff USING (user_id)
                WHERE session.id = ${sid} AND staff.office = ${oid} LIMIT 1`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : StaffSchema
                .pick({ user_id: true, permission: true })
                .extend({ permission: z.string().transform(p => parseInt(p, 2)) })
                .parse(first);
    }

    /** Get full session information (including global and local permissions). */
    async getFullSessionInfo(sid: Session['id']): Promise<FullSession | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`WITH result AS (SELECT u.id,u.name,u.email,u.picture,u.permission AS global_perms
                FROM session AS s INNER JOIN users AS u ON s.user_id = u.id WHERE s.id = ${sid} LIMIT 1),
                lookup AS (SELECT s.office,s.permission FROM staff AS s WHERE s.user_id = (SELECT id FROM result))
                SELECT result.*,json_object(ARRAY(SELECT office::TEXT FROM lookup), ARRAY(SELECT permission::TEXT FROM lookup)) AS local_perms FROM result`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : PostgresFullSession.parse(first);
    }

    /** Get all offices from the system. */
    async getAllOffices(): Promise<AllOffices> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject("SELECT coalesce(json_object_agg(id,name),'{}') AS result FROM office;");
        assertStrictEquals(rest.length, 0);
        return z.object({ result: AllOfficesSchema }).parse(first).result;
    }

    /** @deprecated Adds a new office to the system. */
    async createOffice(name: Office['name']): Promise<Office['id']> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO office (name) VALUES (${name}) RETURNING id`;
        assertStrictEquals(rest.length, 0);
        return OfficeSchema.pick({ id: true }).parse(first).id;
    }

    /** Adds a new office to the system. Assumes that the `admin` is a valid user ID. */
    async createOfficeWithSuperuser(admin: User['id'], name: Office['name']): Promise<Office['id']> {
        // Create new office
        const transaction = this.#client.createTransaction('office_superuser');
        await transaction.begin();
        const { rows: [ first, ...rest ] } = await transaction
            .queryObject`INSERT INTO office (name) VALUES (${name}) RETURNING id`;
        assertStrictEquals(rest.length, 0);

        // Add first superuser of the office
        const { id } = OfficeSchema.pick({ id: true }).parse(first);
        const { rowCount } = await transaction
            .queryArray`INSERT INTO staff (user_id,office,permission) VALUES (${admin},${id},4095::bit(12)::LocalPermission)`;

        assertStrictEquals(rowCount, 1);

        await transaction.commit();
        return id;
    }

    /** Update office information. Returns `true` if successful. */
    async updateOffice({ id, name }: Office): Promise<boolean> {
        const { rowCount } = await this.#client.queryArray`UPDATE office SET name = ${name} WHERE id = ${id}`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
    }

    async generateBarcodeSummary(oid: Office['id']): Promise<BarcodeMetrics> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`WITH _ AS (SELECT code FROM barcode AS bar INNER JOIN batch AS bat ON bar.batch = bat.id WHERE bat.office = ${oid}),
                codes AS (SELECT id FROM _ LEFT JOIN document AS d ON id = code)
                SELECT json_build_object(
                    'assigned',coalesce((SELECT COUNT(id) FROM codes),0),
                    'pending',coalesce((SELECT SUM(CASE WHEN id IS NULL THEN 1 ELSE 0 END) FROM codes),0)
                ) AS result`;
        assertStrictEquals(rest.length, 0);
        return z.object({ result: BarcodeMetricsSchema }).parse(first).result;
    }

    /** Generate a user-centric summary of the metrics (across all offices). */
    async generateUserSummary(uid: User['id']): Promise<Metrics> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`WITH _ AS (SELECT status,COUNT(status) AS amount FROM snapshot WHERE evaluator = ${uid} GROUP BY status)
                SELECT coalesce(json_object_agg(status,amount),'{}') AS result FROM _`;
        assertStrictEquals(rest.length, 0);
        return z.object({ result: MetricsSchema }).parse(first).result;
    }

    async generateLocalSummary(oid: Office['id']): Promise<Metrics> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`
            WITH officeTarget AS (
                SELECT s.status,COUNT(s.status) AS amount
                    FROM snapshot as s
                WHERE (s.status = 'Register' OR s.status = 'Receive') AND s.target = ${oid}
                GROUP BY s.status
            ), backTarget AS (
                SELECT creation,doc,target,status 
                    FROM snapshot as s
                WHERE s.status = 'Terminate' OR s.status = 'Send'
            ), actualTarget AS (
                SELECT b.doc,b.creation AS actualCreate,b.status AS actualStatus,MAX(s.creation) as backCreate FROM snapshot as s
                    INNER JOIN backTarget AS b ON s.doc = b.doc
                WHERE s.creation < b.creation
                GROUP BY b.doc,actualCreate,actualStatus
            ), increment AS (
                SELECT actualStatus,COUNT(actualStatus) AS amount FROM actualTarget
                    INNER JOIN snapshot AS s ON backcreate = s.creation
                WHERE s.target = ${oid}
                GROUP BY actualStatus
            ), combine AS (
                SELECT * FROM increment
                UNION
                SELECT * FROM officeTarget
            ) SELECT coalesce(json_object_agg(actualStatus,amount),'{}') AS result FROM combine;`;
        assertStrictEquals(rest.length, 0);
        return z.object({ result: MetricsSchema }).parse(first).result;
    }

    async generateGlobalSummary(): Promise<Metrics> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject("WITH _ AS (SELECT status,COUNT(status) AS amount FROM snapshot GROUP BY status) SELECT coalesce(json_object_agg(status,amount),'{}') AS result FROM _");
        assertStrictEquals(rest.length, 0);
        return z.object({ result: MetricsSchema }).parse(first).result;
    }
}
