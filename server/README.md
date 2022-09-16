# Overview

The back-end API is powered by the [Deno] runtime for [TypeScript].

[Deno]: https://deno.land/
[TypeScript]: https://www.typescriptlang.org/

# Environment Variables

**Name** | **Description** | **Required**
-------- | --------------- | :----------:
`PORT` | Network port to bind to when listening for new connections. | &#x2714;

# Running the Server

```bash
# Set up environment variables.
PORT=3000

# Starts the server at `0.0.0.0:3000`.
deno task start
```
