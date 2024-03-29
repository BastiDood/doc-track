CREATE EXTENSION pgcrypto;

-- See `https://developers.google.com/identity/protocols/oauth2#size` for token sizes (in bytes).
-- Authorization Code: 256
-- Access Token:       2048
-- Refresh Token:      512
CREATE DOMAIN GoogleUserId AS VARCHAR(255) NOT NULL;
CREATE DOMAIN AuthorizationCode AS VARCHAR(256) NOT NULL;

CREATE DOMAIN Email AS VARCHAR(32) NOT NULL;
CREATE DOMAIN Expiration AS TIMESTAMPTZ NOT NULL CHECK(VALUE > NOW());
CREATE DOMAIN LocalPermission AS BIT VARYING(12) NOT NULL DEFAULT B'0';
CREATE DOMAIN GlobalPermission AS BIT VARYING(8) NOT NULL DEFAULT B'0';

-- Push Subscription Endpoint
CREATE DOMAIN Endpoint AS VARCHAR(1024) NOT NULL;

-- Document Status
CREATE TYPE DocStatus AS ENUM ('Register', 'Send', 'Receive', 'Terminate');

CREATE TABLE users(
    -- Google-assigned globally unique key.
    id GoogleUserId,
    name VARCHAR(40) NOT NULL,
    email Email UNIQUE,
    picture VARCHAR(256) NOT NULL,
    permission GlobalPermission,
    PRIMARY KEY (id)
);

-- Pending OAuth logins. Must expire periodically.
CREATE TABLE pending(
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    nonce BYTEA NOT NULL DEFAULT gen_random_bytes(64),
    expiration Expiration DEFAULT NOW() + INTERVAL '15 minutes',
    PRIMARY KEY (id)
);

-- Validated OAuth login.
CREATE TABLE session(
    id UUID NOT NULL,
    user_id GoogleuserId REFERENCES users (id),
    expiration Expiration,
    PRIMARY KEY (id)
);

CREATE TABLE office(
    id SMALLSERIAL NOT NULL,
    name VARCHAR(20) NOT NULL,
    PRIMARY KEY (id)
    -- More office information to add later...
);

CREATE TABLE staff(
    user_id GoogleUserId REFERENCES users (id),
    office SMALLINT NOT NULL REFERENCES office (id),
    permission LocalPermission,
    PRIMARY KEY (user_id, office)
);

CREATE TABLE batch(
    id SERIAL NOT NULL,
    generator GoogleUserId,
    office SMALLINT NOT NULL,
    creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (generator, office) REFERENCES staff (user_id, office)
);

CREATE TABLE barcode(
    code UUID NOT NULL DEFAULT gen_random_uuid(),
    batch INTEGER NOT NULL REFERENCES batch (id),
    PRIMARY KEY (code)
);

CREATE TABLE category(
    id SMALLSERIAL NOT NULL,
    name VARCHAR(20) UNIQUE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id)
);

CREATE TABLE document(
    id UUID NOT NULL REFERENCES barcode (code),
    category SMALLINT NOT NULL REFERENCES category (id),
    title VARCHAR(40) NOT NULL,
    data BYTEA NOT NULL,
    mime VARCHAR(128) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE snapshot(
    creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    doc UUID NOT NULL REFERENCES document (id),
    evaluator GoogleUserId NOT NULL REFERENCES users (id),
    target SMALLINT
        REFERENCES office (id)
        DEFAULT NULL
        CHECK((status != 'Terminate' AND target is NOT NULL) or (status = 'Terminate' AND target is NULL)),
    status DocStatus NOT NULL DEFAULT 'Register',
    remark VARCHAR(32) NOT NULL,
    PRIMARY KEY (creation, doc)
);

CREATE TABLE subscription(
    endpoint Endpoint,
    expiration Expiration,
    auth BYTEA NOT NULL,
    p256dh BYTEA NOT NULL,
    PRIMARY KEY (endpoint)
);

CREATE TABLE notification(
    sub Endpoint REFERENCES subscription (endpoint) ON DELETE CASCADE,
    doc UUID NOT NULL REFERENCES document (id),
    PRIMARY KEY (sub, doc)
);

CREATE TABLE invitation(
    office SMALLSERIAL NOT NULL REFERENCES office (id),
    email Email,
    permission LocalPermission NOT NULL,
    creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (office, email)
);

CREATE TYPE CategoryDeprecation AS (name VARCHAR(20), deleted BOOLEAN);

CREATE FUNCTION delete_or_else_deprecate_category(category_id category.id%TYPE) RETURNS BOOLEAN AS $$
    DECLARE
        deleted BOOLEAN;
    BEGIN
        DELETE FROM category WHERE id = category_id RETURNING TRUE INTO deleted;
        RETURN deleted;
    EXCEPTION
        WHEN foreign_key_violation THEN
            UPDATE category SET active = FALSE WHERE id = category_id RETURNING FALSE INTO deleted;
            RETURN deleted;
    END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION delete_or_else_retire_staff(uid staff.user_id%TYPE, oid staff.office%TYPE) RETURNS BOOLEAN AS $$
    DECLARE
        deleted BOOLEAN;
    BEGIN
        DELETE FROM staff WHERE user_id = uid AND office = oid RETURNING TRUE INTO deleted;
        RETURN deleted;
    EXCEPTION
        WHEN foreign_key_violation THEN
            UPDATE staff SET permission = B'0' WHERE user_id = uid AND office = oid RETURNING FALSE INTO deleted;
            RETURN deleted;
    END;
$$ LANGUAGE plpgsql;
