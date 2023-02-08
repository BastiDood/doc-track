import { assert, assertStrictEquals, assertInstanceOf, unreachable } from 'asserts';
import { range } from 'itertools';
import { Pool, PoolClient, PostgresError } from 'postgres';
import { z } from 'zod';

import type { Document } from './model/db/document.ts';
import type { PushSubscription } from './model/db/subscription.ts';

import { type Barcode, BarcodeSchema } from './model/db/barcode.ts';
import { type Batch, BatchSchema, BatchId } from './model/db/batch.ts';
import { type Category, CategorySchema } from './model/db/category.ts';
import { type Invitation, InvitationSchema } from './model/db/invitation.ts';
import { type Office, OfficeSchema } from './model/db/office.ts';
import { type Pending, PendingSchema } from './model/db/pending.ts';
import { type Session, SessionSchema } from './model/db/session.ts';
import { type Staff, StaffSchema } from './model/db/staff.ts';
import { type User, UserSchema } from './model/db/user.ts';

type InvalidatedPending = {
    valid: false;
    data: Omit<Pending, 'id'>;
}

type InvalidatedSession = {
    valid: true;
    data: Omit<Session, 'id'>;
}

const MinBatchSchema = z.object({
    batch: BatchId,
    codes: BarcodeSchema.shape.code.array(),
});

export type MinBatch = z.infer<typeof MinBatchSchema>;

type GeneratedBatch = Omit<Batch, 'office' | 'generator'> & { codes: Barcode['code'][] };

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
    async upgradeSession({ id, user_id, expiration, access_token }: Session): Promise<Omit<Pending, 'id'>> {
        const transaction = this.#client.createTransaction('upgrade', { isolation_level: 'serializable' });
        await transaction.begin();

        const { rows: [ first, ...rest ] } = await transaction
            .queryObject`DELETE FROM pending WHERE id = ${id} RETURNING nonce,expiration`;
        assertStrictEquals(rest.length, 0);
        const old = PendingSchema.omit({ id: true }).parse(first);

        const { rowCount } = await transaction.queryArray`
            INSERT INTO session (id,user_id,expiration,access_token)
                VALUES (${id},${user_id},${expiration.toISOString()},${access_token})`;
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
            .queryObject`DELETE FROM session WHERE id = ${sid} RETURNING user_id,expiration,access_token`;
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

    /** Upserts a user to the invite list and returns the creation date. */
    async upsertInvitation({ office, email, permission }: Omit<Invitation, 'creation'>): Promise<Invitation['creation']> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO invitation (office,email,permission)
                VALUES (${office},${email},${permission})
                ON CONFLICT (office,email) DO UPDATE SET permission = ${permission}, creation = DEFAULT
                RETURNING creation`;
        assertStrictEquals(rest.length, 0);
        return InvitationSchema.pick({ creation: true }).parse(first).creation;
    }

    /** Removes an email from an office's list of invited users. */
    async revokeInvitation(office: Invitation['office'], email: Invitation['email']): Promise<Omit<Invitation, 'office' | 'email'> | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`DELETE FROM invitation WHERE office = ${office} AND email = ${email} RETURNING permission,creation`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : InvitationSchema.omit({ office: true, email: true }).parse(first);
    }

    /**
     * If a user already exists in the database, simply update their information (in which
     * case `null` is returned). Otherwise, we delete all of the invites of the specified user
     * and return an array of the office IDs to which the user is invited.
     */
    async insertInvitedUser({ id, name, email, permission }: User): Promise<Office['id'][] | null> {
        const transaction = this.#client.createTransaction('registration', { isolation_level: 'serializable' });
        await transaction.begin();

        const { rowCount } = await transaction
            .queryArray`UPDATE users SET name = ${name}, email = ${email}, permission = ${permission} WHERE id = ${id}`;
        assert(rowCount !== undefined);

        // User already exists
        if (rowCount === 1) {
            await transaction.commit();
            return null;
        }

        // Check the invite list first
        assertStrictEquals(rowCount, 0);
        const { rows } = await transaction
            .queryObject`DELETE FROM invitation WHERE email = ${email} RETURNING office,permission`;
        const invites = InvitationSchema.pick({ office: true, permission: true }).array().parse(rows);

        // Add the user into the system
        await transaction.queryArray`INSERT INTO users (id,name,email,permission) VALUES (${id},${name},${email},${permission})`;

        // Add the user to all the offices (if any)
        for (const { office, permission } of invites)
            await transaction.queryArray`INSERT INTO staff (user_id,office,permission) VALUES (${id},${office},${permission})`;

        await transaction.commit();
        return invites.map(i => i.office);
    }

    /** Adds a pre-existing user to the staff of an office. */
    async upsertUserToStaff({ user_id, office, permission }: Staff) {
        // TODO: Add Tests
        const { rowCount } = await this.#client
            .queryArray`INSERT INTO staff (user_id,office,permission)
                VALUES (${user_id},${office},${permission})
                ON CONFLICT (user_id,office) DO UPDATE SET permission = ${permission}`;
        assertStrictEquals(rowCount, 1);
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

    /** Returns a list of oldest available {@linkcode Barcode} IDs. */
    async getEarliestAvailableBatch(): Promise<MinBatch | null> {
        // TODO: Add Tests
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT MIN(b.batch),coalesce(array_agg(b.code),'{}') AS codes
                FROM barcode b LEFT JOIN document d ON b.code = d.id
                WHERE d.id IS NULL
                GROUP BY b.batch`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : MinBatchSchema.parse(first);
    }

    /** Assigns a {@linkcode Barcode} to a newly uploaded {@linkcode Document}. If the barcode has already been reserved, return `false`. */
    async assignBarcodeToDocument({ id, category, title }: Document): Promise<boolean> {
        // TODO: Do Actual Document Upload
        const { rowCount } = await this.#client
            .queryObject`INSERT INTO document (id,category,title) VALUES (${id},${category},${title}) ON CONFLICT DO NOTHING`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
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
    async getActiveCategories(): Promise<Pick<Category, 'id' | 'name'>[]> {
        const { rows } = await this.#client.queryObject('SELECT id,name FROM category WHERE active');
        return CategorySchema.pick({ id: true, name: true }).array().parse(rows);
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

    async #deleteOrElseDeprecateCategory(id: Category['id']): Promise<{ deleted: boolean, rows: unknown[] }> {
        try {
            const { rows } = await this.#client
                .queryObject`DELETE FROM category WHERE id = ${id} RETURNING name`;
            return { rows, deleted: true };
        } catch (err) {
            assertInstanceOf(err, PostgresError);
            const { rows } = await this.#client
                .queryObject`UPDATE category SET active = FALSE WHERE id = ${id} RETURNING name`;
            return { rows, deleted: false };
        }
    }

    /**
     * Deletes a {@linkcode Category} if there are no documents referencing it.
     * Otherwise, it is internally marked as "deprecated".
     *
     * # Assumption
     * The user has sufficient permissions to add a new system-wide category.
     */
    async deleteCategory(id: Category['id']): Promise<{ name: Category['name'], deleted: boolean } | null> {
        const { rows: [ first, ...rest ], deleted } = await this.#deleteOrElseDeprecateCategory(id);
        assert(rest.length === 0);

        if (first === undefined) return null;
        const { name } = CategorySchema.pick({ name: true }).parse(first);
        return { name, deleted };
    }

    async activateCategory(id: Category['id']): Promise<Category['name'] | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`UPDATE category SET active = TRUE WHERE id = ${id} RETURNING name`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : CategorySchema.pick({ name: true }).parse(first).name;
    }

    /** Register a push subscription to be used later for notifying a user. */
    async pushSubscription({ endpoint, expirationTime, auth, p256dh }: PushSubscription) {
        // TODO: Add Tests
        // TODO: Convert keys to bit strings
        // TODO: Add Tests with Document Bindings
        const expires = expirationTime?.toISOString() || 'infinity';
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
            .queryArray`INSERT INTO subscription (sub,doc) VALUES (${sub},${doc}) ON CONFLICT (sub,doc) DO NOTHING`;
        switch (rowCount) {
            case 0: return false;
            case 1: return true;
            default: unreachable();
        }
    }

    /** Returns the user associated with the valid session ID. */
    async getUserFromSession(sid: Session['id']): Promise<User | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT u.* FROM session AS s INNER JOIN users AS u ON s.user_id = u.id WHERE s.id = ${sid} LIMIT 1`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : UserSchema.parse(first);
    }

    /** Returns the local permissions of the session in the provided office. */
    async getPermissionsFromSession(sid: Session['id'], office: Office['id']): Promise<Staff['permission'] | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT permission FROM session INNER JOIN staff USING (user_id) WHERE session.id = ${sid} AND staff.office = ${office} LIMIT 1`;
        assertStrictEquals(rest.length, 0);
        return first === undefined
            ? null
            : StaffSchema.pick({ permission: true }).parse(first).permission;
    }

    /** Adds a new office to the system. */
    async createOffice(name: Office['name']): Promise<Office['id']> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO office (name) VALUES (${name}) RETURNING id`;
        assertStrictEquals(rest.length, 0);
        return OfficeSchema.pick({ id: true }).parse(first).id;
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
}
