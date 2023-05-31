export class InsufficientPermissions extends Error {
    constructor() {
        super('insufficient permissions');
    }
}

export class NoActiveOffice extends Error {
    constructor() {
        super('no active office was selected');
    }
}

export class InvalidInput extends Error {
    constructor() {
        super('invalid input');
    }
}

export class TooLarge extends Error {
    constructor() {
        super('payload is too large');
    }
}

export class DeferredSnap extends Error {
    constructor() {
        super('snapshot is deffered');
    }
}

export class UncachedFetch extends Error {
    constructor() {
        super('resource was not cached and is unavailable offline');
    }
}

export class InvalidSession extends Error {
    constructor() {
        super('invalid or expired session');
    }
}

export class BadContentNegotiation extends Error {
    constructor() {
        super('content negotiation failed');
    }
}

export class AlreadyMember extends Error {
    constructor() {
        super('user is already a member of the office');
    }
}

export class UnexpectedStatusCode extends Error {
    constructor() {
        super('unexpected status code');
    }
}
