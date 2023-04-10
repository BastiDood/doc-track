export function assert(condition: any, message = 'assertion failed'): asserts condition {
    if (!condition) throw new Error(message);
}
