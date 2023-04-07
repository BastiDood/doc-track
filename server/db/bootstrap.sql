\prompt 'Google User ID: ' id

-- Initialize the first superuser with stub data. When they first log into the system,
-- the server should upsert the stub data with the real data from Google's servers.
INSERT INTO users VALUES (:id, 'Superuser', 'admin@doctrack.io', 'https://doctrack.io/superuser.png', 511::bit(9)::GlobalPermission);
