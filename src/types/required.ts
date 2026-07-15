import { BuiltIn } from './utils';

type _NonNullable<O, Ignore> = {
    // Strip null/undefined first, then recurse only into the resulting object.
    // Checking `O[K] extends object` directly would fail for `SomeObject | undefined`
    // (the union is not assignable to `object`), leaving nested nullables un-stripped.
    [K in keyof O]-?: O[K] extends BuiltIn | Ignore
        ? O[K]
        : globalThis.NonNullable<O[K]> extends object
            ? _NonNullable<globalThis.NonNullable<O[K]>, Ignore>
            : globalThis.NonNullable<O[K]>
}

export type NonNullable<O extends object, Ignore = never> =
    O extends unknown
        ? _NonNullable<O, Ignore>
        : never
