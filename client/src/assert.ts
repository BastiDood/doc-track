export function assert(condition: boolean, message: string = 'assertion failed'): asserts condition {
    if (!condition) throw new Error(message);
}
