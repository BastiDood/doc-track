# Overview

The back-end API is powered by the [Deno] runtime for [TypeScript]. The database management system is provided by [PostgreSQL].

[Deno]: https://deno.land/
[TypeScript]: https://www.typescriptlang.org/
[PostgreSQL]: https://www.postgresql.org/

# Environment Variables

**Name** | **Description** | **Required** | **Default**
-------- | --------------- | :----------: | ----------:
`PORT` | Network port to bind to when listening for new connections. | &#x2714; |
`GOOGLE_ID` | Client ID obtained from the [Google Cloud Console]. | &#x2714; |
`GOOGLE_SECRET` | Client secret obtained from the [Google Cloud Console]. | &#x2714; |
`OAUTH_REDIRECT` | OAuth 2.0 redirect URI set from the [Google Cloud Console]. | &#x2714; |
`HOSTED_GSUITE_DOMAIN` | Specifically allowed GSuite organization domain. | &#x2714;
`PG_HOSTNAME` | IP host name of the [PostgreSQL] instance. | &#x274c; | `127.0.0.1`
`PG_PORT` | Port number of the [PostgreSQL] instance. | &#x274c; | `5432`
`PG_USER` | Provided username when logging into [PostgreSQL]. | &#x2714; |
`PG_PASSWORD` | Provided password when logging into [PostgreSQL]. | &#x2714; |
`PG_DATABASE` | Default database in the [PostgreSQL] instance. | &#x274c; | `doctrack`
`PG_POOL` | Maximum number of pooled connections reserved by the [PostgreSQL] client. | &#x274c; | `4`
`VAPID_PRV_KEY` | [Vapid private key][vapid] which will be used to subscribe to the [Web Push API]. | &#x2714; |

[vapid]: https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/
[Web Push API]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
[Google Cloud Console]: https://console.cloud.google.com/

# Running the Server

```bash
# Initialize the database at the `data` folder (see `-D` flag).
# The root user will be named `postgres` (see `-U` flag).
# User will be prompted to set a new password (see `-W` flag).
initdb -D data -U postgres -W

# Run the SQL initialization script.
psql -U postgres -W -f db/init.sql

# If you have not yet run this command before, place the
# private key into the `VAPID_PRV_KEY` variable. Otherwise,
# skip this step.
pnpm dlx web-push generate-vapid-keys

# Start the PostgreSQL database server.
pg_ctl -D data start

# Set up (example) environment variables.
PORT=3000
GOOGLE_ID=
GOOGLE_SECRET=
OAUTH_REDIRECT=http://localhost:3000/callback
HOSTED_GSUITE_DOMAIN=up.edu.ph
PG_HOSTNAME=127.0.0.1
PG_DATABASE=doctrack
PG_PASSWORD=
PG_USER=
PG_PORT=5432
VAPID_PRV_KEY=

# Starts the server at `0.0.0.0:3000`.
deno task start

# Stop the PostgreSQL database server when done.
pg_ctl -D data stop
```
