import { BuiltIn, Cast, Keys, List, Primitive } from './utils';

type UnionOf<A> =
    A extends List
        ? A[number]
        : Exclude<A[keyof A], undefined>

// The accumulated path `[...P, k]` is a tuple of PropertyKeys (never nullable),
// so wrapping it in a NonNullable helper (as the ts-toolbelt version did) is a
// no-op — the bare tuple is structurally identical and avoids an instantiation
// at every path leaf.
type _PathsRequired<O, P extends List, Ignore, K extends PropertyKey> = UnionOf<{
    [k in keyof O]: k extends K ?
        O[k] extends BuiltIn | Primitive | Ignore ? [...P, k] :
            [Keys<O[k]>] extends [never] ? [...P, k] :
                12 extends P['length'] ? [...P, k] :
                    _PathsRequired<O[k], [...P, k], Ignore, K> : never
}>

export type Paths<O, P extends List = [], Ignore = never, K extends PropertyKey = PropertyKey> =
    _PathsRequired<O, P, Ignore, K> extends infer X
        ? Cast<X, List<K>>
        : never
