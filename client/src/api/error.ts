export class InsufficientPermissions extends Error {
    constructor() {
        super('insufficient permissions');
    }
}

export class InvalidInput extends Error {
    constructor() {
        super('invalid input');
    }
}

export class InvalidSession extends Error {
    constructor() {
        super('invalid or expired session');
    }
}

export class UnexpectedStatusCode extends Error {
    constructor() {
        super('unexpected status code');
    }
}
