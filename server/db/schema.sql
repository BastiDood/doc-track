-- See `https://developers.google.com/identity/protocols/oauth2#size` for token sizes (in bytes).
-- Authorization Code: 256
-- Access Token:       2048
-- Refresh Token:      512

CREATE TABLE user(
    -- Google-assigned globally unique key.
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    first_name VARCHAR(20) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(20) NOT NULL
);

-- Pending OAuth logins. Must expire within five minutes.
CREATE TABLE pending(
    id UUID NOT NULL PRIMARY KEY,
    authorization_code VARCHAR(256) NOT NULL,
    nonce BIGINT NOT NULL
);

-- Validated OAuth login.
CREATE TABLE session(
    id UUID NOT NULL PRIMARY KEY,
    creation TIMESTAMP NOT NULL,
    expiration TIMESTAMP NOT NULL,
    access_token VARCHAR(2048) NOT NULL,
    refresh_token VARCHAR(512),
    user VARCHAR(255) NOT NULL REFERENCES user(id)
);

CREATE TABLE office(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
    -- More office information to add later...
);

CREATE TABLE staff(
    user VARCHAR(255) NOT NULL PRIMARY KEY REFERENCES user(id),
    office SMALLINT NOT NULL PRIMARY KEY REFERENCES office(id)
);

CREATE TABLE batch(
    id SERIAL NOT NULL PRIMARY KEY,
    creation TIMESTAMP NOT NULL,
    generator VARCHAR(255) NOT NULL REFERENCES user(id),
);

CREATE TABLE barcode(
    code INTEGER NOT NULL PRIMARY KEY,
    batch INTEGER NOT NULL REFERENCES batch(id)
);

CREATE TABLE category(
    id SMALLSERIAL NOT NULL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

CREATE TABLE document(
    id INTEGER NOT NULL PRIMARY KEY REFERENCES barcode(code),
    title VARCHAR(40) NOT NULL,
    category SMALLINT NOT NULL REFERENCES category(id),
    file LO
);

CREATE TABLE snapshot(
    doc INTEGER NOT NULL PRIMARY KEY REFERENCES document(id),
    creation TIMESTAMP NOT NULL PRIMARY KEY,
    evaluator VARCHAR(255) NOT NULL REFERENCES user(id),
    status INTEGER NOT NULL,
    remark VARCHAR(32)
);

CREATE TABLE subscription(
    id SERIAL NOT NULL PRIMARY KEY,
    endpoint VARCHAR(50) NOT NULL,
    expiration TIMESTAMP NOT NULL
);

CREATE TABLE notification(
    sub INTEGER NOT NULL PRIMARY KEY REFERENCES subscription(id),
    doc INTEGER NOT NULL PRIMARY KEY REFERENCES document(id)
);
