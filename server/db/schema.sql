-- See `https://developers.google.com/identity/protocols/oauth2#size` for token sizes (in bytes).
-- Authorization Code: 256
-- Access Token:       2048
-- Refresh Token:      512
CREATE DOMAIN GoogleUserId AS VARCHAR(255) NOT NULL;
CREATE DOMAIN AuthorizationCode AS VARCHAR(256) NOT NULL;
CREATE DOMAIN AccessToken AS VARCHAR(2048) NOT NULL;

-- Expiration Times
CREATE DOMAIN Expiration AS TIMESTAMPTZ NOT NULL CHECK(VALUE > NOW());

-- Document Status
CREATE TYPE DocStatus AS ENUM ('Register', 'Send', 'Receive', 'Terminate');

CREATE TABLE user(
    -- Google-assigned globally unique key.
    id GoogleUserId PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    email VARCHAR(20) NOT NULL
);

-- Pending OAuth logins. Must expire periodically.
CREATE TABLE pending(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    nonce BYTEA NOT NULL DEFAULT gen_random_bytes(64),
    expiration Expiration DEFAULT NOW() + INTERVAL '15 minutes'
);

-- Validated OAuth login.
CREATE TABLE session(
    id uuid NOT NULL PRIMARY KEY,
    user VARCHAR(255) NOT NULL REFERENCES user (id),
    expiration Expiration,
    access_token AccessToken,
);

CREATE TABLE office(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
    -- More office information to add later...
);

CREATE TABLE staff(
    user GoogleUserId PRIMARY KEY REFERENCES user (id),
    office SMALLINT NOT NULL PRIMARY KEY REFERENCES office (id),
    permission BIT(3) NOT NULL
);

CREATE TABLE batch(
    id SERIAL NOT NULL PRIMARY KEY,
    generator GoogleUserId REFERENCES user (id),
    creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE barcode(
    code uuid NOT NULL PRIMARY KEY,
    batch INTEGER NOT NULL REFERENCES batch (id)
);

CREATE TABLE category(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(20) UNIQUE NOT NULL,
);

CREATE TABLE document(
    id uuid NOT NULL PRIMARY KEY REFERENCES barcode (code),
    category SMALLINT NOT NULL REFERENCES category (id),
    title VARCHAR(40) NOT NULL,
    file LO
);

CREATE TABLE snapshot(
    creation TIMESTAMPTZ PRIMARY KEY DEFAULT NOW(),
    doc uuid NOT NULL PRIMARY KEY REFERENCES document (id),
    target SMALLINT REFERENCES office (id) CHECK((status = 'Send' AND target IS NOT NULL) OR (target IS NULL)),
    evaluator GoogleUserId NOT NULL REFERENCES user (id),
    status DocStatus NOT NULL,
    remark VARCHAR(32)
);

CREATE TABLE subscription(
    id SERIAL NOT NULL PRIMARY KEY,
    endpoint VARCHAR(50) NOT NULL,
    expiration Expiration
);

CREATE TABLE notification(
    sub INTEGER NOT NULL PRIMARY KEY REFERENCES subscription (id),
    doc uuid NOT NULL PRIMARY KEY REFERENCES document (id)
);

CREATE TABLE invitation(
    office SMALLSERIAL NOT NULL PRIMARY KEY REFERENCES office (id),
    email VARCHAR(20) NOT NULL PRIMARY KEY,
    permission BIT(3) NOT NULL,
    creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
