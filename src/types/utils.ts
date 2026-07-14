// Basic types
export type Primitive = boolean | string | number | bigint | symbol | undefined | null;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type BuiltIn = Function | Error | Date | RegExp | Generator |
    { readonly [Symbol.toStringTag]: string };

// List utilities
export type List<T = any> = readonly T[];

// Any utilities
export type Cast<A1, A2> = A1 extends A2 ? A1 : A2;
export type Keys<A> = A extends readonly any[]
    ? Exclude<keyof A, keyof any[]> | number
    : keyof A;
// Compute forces TypeScript to eagerly resolve/flatten a composed type into a
// single object literal. The homomorphic mapped type does the flattening; no
// `& {}`/`& unknown` intersection is needed (those are erased and only add noise).
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Compute<A> = A extends Function ? A : { [K in keyof A]: A[K] };

// String utilities
export type Split<S extends string, D extends string> =
    S extends `${infer Head}${D}${infer Tail}`
        ? [Head, ...Split<Tail, D>]
        : [S];

export type Join<T extends readonly string[], D extends string> =
    T extends []
        ? ''
        : T extends [infer Only extends string]
            ? Only
            : T extends [infer First extends string, ...infer Rest extends string[]]
                ? `${First}${D}${Join<Rest, D>}`
                : string;

// At - get type at key K from object A (handles unions properly)
type At<A, K extends PropertyKey> =
    A extends readonly any[]
        ? number extends A['length']
            ? K extends number | `${number}`
                ? A[number] | undefined
                : undefined
            : K extends keyof A
                ? A[K]
                : undefined
        : unknown extends A
            ? unknown
            : K extends keyof A
                ? A[K]
                : undefined;

// Object utilities - Path using At to handle unions properly.
// `_Path` walks the path to the leaf type; `Path` then materializes the result
// through `extends infer X` so the alias resolves to a concrete leaf. Without
// this boundary, comparing two `Path<...>` instantiations makes TypeScript
// recurse structurally through the nested `_Path<...>` calls, which blows the
// relation stack (TS2321) / instantiation depth (TS2589) on deep contexts.
type _Path<O, P extends readonly PropertyKey[]> =
    P extends []
        ? O
        : P extends [infer Head extends PropertyKey, ...infer Tail extends PropertyKey[]]
            ? _Path<At<O, Head>, Tail>
            : never;
export type Path<O, P extends readonly PropertyKey[]> =
    _Path<O, P> extends infer X ? X : never;

export type FilterNever<T extends object> = {
    [K in keyof T as T[K] extends never ? never : K]: T[K]
};

// ============================================
// RequireOnlyOne - matching ts-toolbelt Object.Either (strict) exactly
// ============================================

// Pick helper - matches ts-toolbelt's _Pick
type _Pick<O extends object, K extends PropertyKey> = {
    [P in keyof O & K]: O[P];
};

// Omit helper - matches ts-toolbelt's _Omit
type _Omit<O extends object, K extends PropertyKey> = _Pick<O, Exclude<keyof O, K>>;

// OptionalFlat - matches ts-toolbelt's OptionalFlat
type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
};

// Either helper - matches ts-toolbelt's __Either
type __Either<O extends object, K extends PropertyKey> =
    _Omit<O, K> & { [P in K]: _Pick<O, P> }[K];

// Strict - matches ts-toolbelt's _Strict.
// Makes a union not allow excess properties by adding the sibling keys as
// optional `never`s to each member.
type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<Record<Exclude<_U extends unknown ? keyof _U : never, keyof U>, never>>
    : never;

// EitherStrict - matches ts-toolbelt's EitherStrict = Strict<__Either>, where
// Strict = ComputeRaw<_Strict<...>>. The `Compute` wrap flattens each union member
// into a single object literal; it is required for the produced `Expression` type to
// be *structurally identical* (not merely behaviorally equivalent) to the ts-toolbelt
// output. `Compute` uses a bare homomorphic mapped type (no `& unknown`), which
// flattens identically to ts-toolbelt's `ComputeRaw` while staying lint-clean.
type EitherStrict<O extends object, K extends PropertyKey> = Compute<_Strict<__Either<O, K>>>;

// Final RequireOnlyOne - matches ts-toolbelt's Object.Either (strict mode)
export type RequireOnlyOne<T extends object, K extends keyof T = keyof T> =
    T extends unknown ? EitherStrict<T, K> : never;
