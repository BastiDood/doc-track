# Overview

The front-end is powered by the [Svelte] framework, written in [TypeScript], and bundled by [Parcel]. For more efficient dependency management, this projects uses the [pnpm] package manager. Such a stack requires the [Node.js] runtime.

[Node.js]: https://nodejs.org/en/
[Parcel]: https://parceljs.org/
[pnpm]: https://pnpm.io/
[Svelte]: https://svelte.dev/
[TypeScript]: https://www.typescriptlang.org/

# Building the Static Assets

```bash
# Install all production and development dependencies.
# The development dependencies are necessary for building
# the front-end application.
pnpm install

# Build the static assets to `/dist`. To open the file,
# run the back-end server and navigate to the pages.
pnpm build
```

# Copying
Available at COPYING.MD