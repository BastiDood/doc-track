import { assert, unreachable } from 'asserts';
import { range } from 'itertools';
import { Pool, PoolClient } from 'postgres';

import { Barcode, BarcodeSchema } from './model/db/barcode.ts';
import type { Document } from './model/db/document.ts';
import type { Session } from './model/db/session.ts';
import type { PushSubscription } from './model/db/subscription.ts';

import { type Batch, BatchSchema } from './model/db/batch.ts';
import { type Invitation, InvitationSchema } from './model/db/invitation.ts';
import { type Office, OfficeSchema } from './model/db/office.ts';
import { type Pending, PendingSchema } from './model/db/pending.ts';
import { type User, UserSchema } from './model/db/user.ts';
import { type Category, CategorySchema } from './model/db/category.ts';

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
    async checkValidSession(sid: string): Promise<boolean> {
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

    /** Gets the nonce of a pending session. If no such session exists, an empty array is returned. */
    async getPendingSessionNonce(sid: string): Promise<Pending['nonce']> {
        const { rows: [ first, ...rest ] } = await this.#client.queryObject`SELECT nonce FROM pending WHERE id = ${sid} LIMIT 1`;
        assert(rest.length === 0);
        return first === undefined
            ? new Uint8Array
            : PendingSchema.pick({ nonce: true }).parse(first).nonce;
    }

    /** Upgrades a pending session into a valid session. */
    async upgradeSession({ id, user_id, expiration, access_token }: Session) {
        const transaction = this.#client.createTransaction('upgrade', { isolation_level: 'serializable' });
        await transaction.begin();
        await transaction.queryArray`DELETE FROM pending WHERE id = ${id}`;
        await transaction
            .queryArray`INSERT INTO session (id,user_id,expiration,access_token) VALUES (${id},${user_id},${expiration.toISOString()},${access_token})`;
        await transaction.commit();
    }

    /** Upserts a user to the invite list and returns the creation date. */
    async upsertInvitation({ office, email, permission }: Omit<Invitation, 'creation'>): Promise<Invitation['creation']> {
        const { rows: [ first, ...rest ] } = await this.#client.queryObject`
            INSERT INTO invitation (office,email,permission)
                VALUES (${office},${email},${permission})
                ON CONFLICT (office,email) DO UPDATE SET permission = ${permission}, creation = DEFAULT
                RETURNING creation`;
        assert(rest.length === 0);
        return InvitationSchema.pick({ creation: true }).parse(first).creation;
    }

    /**
     * If a user already exists in the database, simply update their information (in which
     * case `null` is returned). Otherwise, we delete all of the invites of the specified user
     * and return an array of the office IDs to which the user is invited.
     */
    async insertInvitedUser({ id, name, email }: User): Promise<Office['id'][] | null> {
        const transaction = this.#client.createTransaction('registration', { isolation_level: 'serializable' });
        await transaction.begin();

        const { rowCount } = await transaction
            .queryArray`UPDATE users SET name = ${name}, email = ${email} WHERE id = ${id}`;
        assert(rowCount !== undefined);

        // User already exists
        if (rowCount === 1) {
            await transaction.commit();
            return null;
        }

        // Check the invite list first
        assert(rowCount === 0);
        const { rows } = await transaction
            .queryObject`DELETE FROM invitation WHERE email = ${email} RETURNING office,permission`;
        const invites = InvitationSchema.pick({ office: true, permission: true }).array().parse(rows);

        // Add the user into the system
        await transaction.queryArray`INSERT INTO users (id,name,email) VALUES (${id},${name},${email})`;

        // Add the user to all the offices (if any)
        for (const { office, permission } of invites)
            await transaction.queryArray`INSERT INTO staff (user_id,office,permission) VALUES (${id},${office},${permission})`;

        await transaction.commit();
        return invites.map(i => i.office);
    }

    /** Blindly creates a new batch of barcodes. */
    async generateBatch(user: Batch['generator'], office: Batch['office']): Promise<Pick<Batch, 'id' | 'creation'> & { codes: Barcode['code'][] }> {
        // TODO: Add Tests

        const transaction = this.#client.createTransaction('batch');
        await transaction.begin();

        // TODO: Check User Permissions
        // TODO: Check Previous Batches
        const { rows: [ first, ...rest ] } = await transaction.queryObject`INSERT INTO batch (generator,office) VALUES (${user},${office}) RETURNING id,creation`;
        assert(rest.length === 0);

        const { id, creation } = BatchSchema.pick({ id: true, creation: true }).parse(first);

        // TODO: Let the Operator decide how many barcodes are pre-allocated per batch.
        const codes: Barcode['code'][] = [];
        for (const _ of range(10)) {
            const { rows: [ first, ...rest ] } = await transaction
                .queryObject`INSERT INTO barcode (batch) VALUES (${id}) RETURNING code`;
            assert(rest.length === 0);
            codes.push(BarcodeSchema.pick({ code: true }).parse(first).code);
        }

        await transaction.commit();
        return { id, creation, codes };
    }

    /**
     * # Assumption
     * The user has sufficient permissions to add a new system-wide category.
     */
    async createCategory(name: Category['name']): Promise<Category['id']> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO category (name) VALUES (${name}) RETURNING id`;
        assert(rest.length === 0);
        return CategorySchema.pick({ id: true }).parse(first).id;
    }

    /** Gets a list of all the categories in the system. */
    async getAllCategories(): Promise<Category[]> {
        const { rows } = await this.#client.queryObject('SELECT id,name FROM category');
        return CategorySchema.array().parse(rows);
    }

    /**
     * Returns `true` if successfully renamed the category.
     *
     * # Assumption
     * The user has sufficient permissions to add a new system-wide category.
     */
    async renameCategory({ id, name }: Category): Promise<boolean> {
        const { rowCount } = await this.#client
            .queryObject`UPDATE category SET name = ${name} WHERE id = ${id}`;
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
    async deleteCategory(id: Category['id']): Promise<Category['name']> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`DELETE FROM category WHERE id = ${id} RETURNING name`;
        assert(rest.length === 0);
        return CategorySchema.pick({ name: true }).parse(first).name;
    }

    /** Register a push subscription to be used later for notifying a user. */
    async pushSubscription({ endpoint, expirationTime }: PushSubscription) {
        // TODO: Add Tests with Document Bindings
        const expires = expirationTime?.toISOString() || 'infinity';
        const { rowCount } = await this.#client
            .queryArray`INSERT INTO subscription (endpoint,expiration) VALUES (${endpoint},${expires}) ON CONFLICT DO UPDATE SET expiration = ${expires}`;
        assert(rowCount === 1);
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
    async getUserFromSession(sid: string): Promise<Omit<User, 'id'> | null> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`SELECT u.name, u.email FROM session AS s INNER JOIN users AS u ON s.user = u.id WHERE s.id = ${sid} LIMIT 1`;
        assert(rest.length === 0);
        return first === undefined
            ? null
            : UserSchema.omit({ id: true }).parse(first);
    }

    /** Adds a new office to the system. */
    async createOffice(name: string): Promise<Office['id']> {
        const { rows: [ first, ...rest ] } = await this.#client
            .queryObject`INSERT INTO office (name) VALUES (${name}) RETURNING id`;
        assert(rest.length === 0);
        return OfficeSchema.pick({ id: true }).parse(first).id;
    }
}
