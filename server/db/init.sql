CREATE EXTENSION pgcrypto;

-- See `https://developers.google.com/identity/protocols/oauth2#size` for token sizes (in bytes).
-- Authorization Code: 256
-- Access Token:       2048
-- Refresh Token:      512
CREATE DOMAIN GoogleUserId AS VARCHAR(255) NOT NULL;
CREATE DOMAIN AuthorizationCode AS VARCHAR(256) NOT NULL;
CREATE DOMAIN AccessToken AS VARCHAR(2048) NOT NULL;

-- Expiration Times
CREATE DOMAIN Expiration AS TIMESTAMPTZ NOT NULL CHECK(VALUE > NOW());

-- Permission Bits
CREATE DOMAIN Permission AS BIT VARYING(3) NOT NULL;

-- Push Subscription Endpoint
CREATE DOMAIN Endpoint AS VARCHAR(50) NOT NULL;

-- Document Status
CREATE TYPE DocStatus AS ENUM ('Register', 'Send', 'Receive', 'Terminate');

CREATE TABLE users(
    -- Google-assigned globally unique key.
    id GoogleUserId,
    name VARCHAR(40) NOT NULL,
    email VARCHAR(20) NOT NULL,
    permission Permission,
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
    access_token AccessToken,
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
    permission Permission,
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
    PRIMARY KEY (id)
);

CREATE TABLE document(
    id UUID NOT NULL REFERENCES barcode (code),
    category SMALLINT NOT NULL REFERENCES category (id),
    title VARCHAR(40) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE snapshot(
    creation TIMESTAMPTZ DEFAULT NOW(),
    doc UUID NOT NULL REFERENCES document (id),
    target SMALLINT REFERENCES office (id) CHECK((status = 'Send' AND target IS NOT NULL) OR (target IS NULL)),
    evaluator GoogleUserId NOT NULL REFERENCES users (id),
    status DocStatus NOT NULL,
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
    sub Endpoint REFERENCES subscription (endpoint),
    doc UUID NOT NULL REFERENCES document (id),
    PRIMARY KEY (sub, doc)
);

CREATE TABLE invitation(
    office SMALLSERIAL NOT NULL REFERENCES office (id),
    email VARCHAR(20) NOT NULL,
    permission Permission NOT NULL,
    creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (office, email)
);
