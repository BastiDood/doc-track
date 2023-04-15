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
`PG_USER` | Provided username when logging into [PostgreSQL]. | &#x274c; | `postgres`
`PG_PASSWORD` | Provided password when logging into [PostgreSQL]. | &#x274c; |
`PG_DATABASE` | Default database in the [PostgreSQL] instance. | &#x274c; | `doctrack`
`PG_POOL` | Maximum number of pooled connections reserved by the [PostgreSQL] client. | &#x274c; | `4`
`VAPID_PUB_KEY` | [VAPID public key][vapid] which will be used to interact with the [Web Push API]. | &#x2714; |
`VAPID_PRV_KEY` | [VAPID private key][vapid] which will be used to subscribe to the [Web Push API]. | &#x2714; |
`VAPID_EMAIL` | [VAPID email][vapid] which will be used to inform the sender if the push service failed to send notifications. | &#x2714; |

[vapid]: https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/
[Web Push API]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
[Google Cloud Console]: https://console.cloud.google.com/

# Running the Application

To start the PostgreSQL instance, run the following setup script.

```bash
# Initialize the database at the `data` folder (see `-D` flag).
# The root user will be named `postgres` (see `-U` flag).
# User will be prompted to set a new password (see `-W` flag).
deno task init

# Start the PostgreSQL database server.
deno task db
```

In a separate terminal, run the following script to start the Deno server proper.

```bash
# Set up the database template.
deno task template

# Clone the previous template into a new database named `doctrack`. We may re-run
# this command whenever # we want to restore to a blank state of the database so
# that we don't have to keep re-initializing the database.
deno task create

# We must then initialize the root superuser. Note that this step will prompt you
# for your unique Google User ID. If you do not know your ID yet, feel free to
# provide a dummy value for now, then login to DocTrack, check the server logs for
# your Google ID, and finally reinitialize the database with the correct value.
deno task bootstrap

# If you have not yet run this command before, place the
# public and private keys into the `VAPID_PUB_KEY` and the
# `VAPID_PRV_KEY` environment variables, respectively.
pnpm dlx web-push generate-vapid-keys

# Set up (example) environment variables.
PORT=3000
GOOGLE_ID=
GOOGLE_SECRET=
OAUTH_REDIRECT=http://localhost:3000/auth/callback
HOSTED_GSUITE_DOMAIN=up.edu.ph
PG_HOSTNAME=127.0.0.1
PG_DATABASE=doctrack
PG_PASSWORD=
PG_USER=postgres
PG_PORT=5432
VAPID_PUB_KEY=
VAPID_PRV_KEY=
VAPID_EMAIL=

# Starts the server at `0.0.0.0:3000`.
deno task start
```
