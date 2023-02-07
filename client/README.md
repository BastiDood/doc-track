# Overview

The front-end is powered by the [Svelte] framework, written in [TypeScript], and bundled by [Parcel]. For more efficient dependency management, this projects uses the [pnpm] package manager. Such a stack requires the [Node.js] runtime.

[Node.js]: https://nodejs.org/en/
[Parcel]: https://parceljs.org/
[pnpm]: https://pnpm.io/
[Svelte]: https://svelte.dev/
[TypeScript]: https://www.typescriptlang.org/

# Environment Variables

**Name** | **Description** | **Required**
-------- | --------------- | :----------:
`VAPID_PUB_KEY` | [Vapid public key][vapid] which will be used to subscribe to the [Web Push API]. | &#x2714;

[vapid]: https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/
[Web Push API]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API

# Running the Development Server

```bash
# If you have not yet run this command before, place the
# public key into the `VAPID_PUB_KEY` variable. Otherwise,
# skip this step.
pnpm dlx web-push generate-vapid-keys

# Set up environment variables.
VAPID_PUB_KEY=

# Install all production and development dependencies.
# The development dependencies are necessary for building
# the front-end application.
pnpm install

# Build the static assets to `/dist`. To open the file,
# run the back-end server and navigate to the pages.
pnpm build
```
