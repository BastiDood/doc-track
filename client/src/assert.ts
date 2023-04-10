export function assert(condition: unknown, message = 'assertion failed'): asserts condition {
    if (!condition) throw new Error(message);
}
