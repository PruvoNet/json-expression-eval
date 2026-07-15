import { ValidationContext } from '../../index';
import { expectAssignable, expectNotAssignable } from 'tsd';

// Regression test for NonNullable (deep) stripping through optional / nullable
// OBJECT properties. Before the fix, `SomeObject | undefined` failed the
// `extends object` guard and its nested nullables were left un-stripped, so
// `deep.inner.leaf` stayed `number | undefined` instead of `number`.
type DeepCtx = {
    userId: string;
    maybe?: {
        inner: {
            leaf: number | undefined;
        };
    };
    nullableObj: {
        val: string | null;
    } | undefined;
};

type VC = ValidationContext<DeepCtx>;

// A fully-populated, fully non-null context is a valid ValidationContext.
expectAssignable<VC>({
    userId: 'a',
    maybe: { inner: { leaf: 5 } },
    nullableObj: { val: 'x' },
});

// Deeply nested leaf behind an optional object must be non-null.
expectNotAssignable<VC>({
    userId: 'a',
    maybe: { inner: { leaf: undefined } },
    nullableObj: { val: 'x' },
});

// Leaf behind a nullable object must be non-null.
expectNotAssignable<VC>({
    userId: 'a',
    maybe: { inner: { leaf: 5 } },
    nullableObj: { val: null },
});

// The optional object itself becomes required in a ValidationContext.
expectNotAssignable<VC>({
    userId: 'a',
    nullableObj: { val: 'x' },
});

// The nullable object itself becomes required (cannot be undefined).
expectNotAssignable<VC>({
    userId: 'a',
    maybe: { inner: { leaf: 5 } },
    nullableObj: undefined,
});
