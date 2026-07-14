// Type-level benchmark fixture. Compiled in isolation by benchmark.spec.ts with
// `tsc --extendedDiagnostics`; NOT part of the package build (excluded in tsconfig.json)
// and NOT executed by vitest. It exercises the heaviest type-machinery paths:
//   - deep + wide context path extraction (Paths / StringPaths / PropertyCompareOps)
//   - ExpressionHandler construction with a nested and/or/not expression
//   - ValidationContext (deep NonNullable)
//   - a cross-context `or` assignment (the comparison-heavy scenario that used to blow
//     the relation stack — TS2321 "Excessive stack depth comparing Path<?, P>")
import { ExpressionHandler, ValidationContext } from '../../index';
import { Expression } from '../../types/evaluator';

interface Leaf {
    a: string; b: number; c: boolean; d: string; e: number; f: boolean;
    g: string | null; h: number | undefined; i: 'x' | 'y' | 'z'; j: string; k: number; l: boolean;
}
interface A4 extends Leaf { n: Leaf; o?: { p: number | null; q: string } }
interface A3 extends Leaf { n: A4 }
interface A2 extends Leaf { n: A3 }
interface A1 extends Leaf { n: A2 }
interface Ctx extends Leaf { n: A1 }

// A structurally-similar but distinct context so the `or` below forces a real
// structural comparison of two Expression types (not an identity short-circuit).
interface Leaf2 {
    a: string; b: number; c: boolean; d: string; e: number; f: boolean;
    g: string | null; h: number | undefined; i: 'x' | 'y' | 'z'; j: string; k: number; l: boolean;
}
interface B4 extends Leaf2 { n: Leaf2; o?: { p: number | null; q: string } }
interface B3 extends Leaf2 { n: B4 }
interface B2 extends Leaf2 { n: B3 }
interface B1 extends Leaf2 { n: B2 }
interface Ctx2 extends Leaf2 { n: B1 }

type F = {
    fn1: (a: string, ctx: Ctx) => boolean;
    fn2: (a: number, ctx: Ctx) => boolean;
};
type Custom = { dryRun: boolean };
declare const fns: F;

const handler = new ExpressionHandler<Ctx, F, never, Custom>({
    and: [
        { 'n.n.n.a': { eq: 's' } },
        { or: [{ b: { gt: 5 } }, { fn1: 'x' }, { not: { 'n.n.c': { eq: true } } }] },
        { 'n.n.b': { neq: { ref: 'n.n.n.b' } } },
    ],
}, fns);

type E1 = Expression<Ctx, F, never, Custom>;
type E2 = Expression<Ctx2, {}, never, undefined>;
declare const e1a: E1;
declare const e1b: E1;
const crossOr: E2 = { or: [e1a, e1b] };

declare const vc: ValidationContext<Ctx>;

export { handler, crossOr, vc };
