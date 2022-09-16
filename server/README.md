# Overview

The back-end API is powered by the [Deno] runtime for [TypeScript].

[Deno]: https://deno.land/
[TypeScript]: https://www.typescriptlang.org/

# Environment Variables

**Name** | **Description** | **Required**
-------- | --------------- | :----------:
`PORT` | Network port to bind to when listening for new connections. | &#x2714;
`VAPID_PRV_KEY` | [Vapid private key][vapid] which will be used to subscribe to the [Web Push API]. | &#x2714;

[vapid]: https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/
[Web Push API]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

# Running the Server

```bash
# If you have not yet run this command before, place the
# private key into the `VAPID_PRV_KEY` variable. Otherwise,
# skip this step.
pnpm dlx web-push generate-vapid-keys

# Set up environment variables.
PORT=3000
VAPID_PRV_KEY=

# Starts the server at `0.0.0.0:3000`.
deno task start
```
