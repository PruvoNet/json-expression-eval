import { Join, Path, RequireOnlyOne, Split } from './utils';
import { Paths } from './paths';
import { NonNullable as NonNullableDeep } from './required';

export type FuncCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    K extends keyof F, CustomEvaluatorFuncRunOptions> =
    Awaited<Parameters<F[K]>[0]>;

export type StringPaths<O extends object, Ignore> = any extends O ?
    never : (any extends Ignore ? never : Join<Paths<O, [], Ignore | any[], string>, '.'>);

export type Primitive = string | number | boolean;

export type PropertyPathsOfType<C extends Context, Ignore, V extends Primitive> = {
    [K in StringPaths<C, Ignore>]:
    NonNullable<Extract<Path<C, Split<K, '.'>>, V>> extends V ? 1 : 0;
};

export type ExtractPropertyPathsOfType<T extends Record<string, 1 | 0>> = {
    [K in keyof T]: T[K] extends 1 ? K : never
}[keyof T];

export type PropertyRef<C extends Context, Ignore, V extends Primitive> = {
    ref: ExtractPropertyPathsOfType<PropertyPathsOfType<C, Ignore, V>>
}

export type MathOps = '+' | '-' | '*' | '/' | '%' | 'pow';

export interface MathOp<C extends Context, Ignore> {
    op: MathOps;
    rhs: number | PropertyRef<C, Ignore, number>;
    lhs: number | PropertyRef<C, Ignore, number>;
}

export type CompareValue<C extends Context, Ignore, V extends Primitive> =
    V | PropertyRef<C, Ignore, V> | (V extends number ? MathOp<C, Ignore> : never);

export type NumberCompareValue<C extends Context, Ignore> =
    number | PropertyRef<C, Ignore, number> | MathOp<C, Ignore>;

export interface EqualCompareOp<C extends Context, Ignore, V extends Primitive> {
    eq: CompareValue<C, Ignore, V>;
}

export interface NotEqualCompareOp<C extends Context, Ignore, V extends Primitive> {
    neq: CompareValue<C, Ignore, V>;
}

export interface InqCompareOp<C extends Context, Ignore, V extends Primitive> {
    inq: CompareValue<C, Ignore, V>[];
}

export interface NinCompareOp<C extends Context, Ignore, V extends Primitive> {
    nin: CompareValue<C, Ignore, V>[];
}

export interface BetweenCompareOp<C extends Context, Ignore> {
    between: readonly [NumberCompareValue<C, Ignore>, NumberCompareValue<C, Ignore>];
}

export interface GtCompareOp<C extends Context, Ignore> {
    gt: NumberCompareValue<C, Ignore>;
}

export interface GteCompareOp<C extends Context, Ignore> {
    gte: NumberCompareValue<C, Ignore>;
}

export interface LtCompareOp<C extends Context, Ignore> {
    lt: NumberCompareValue<C, Ignore>;
}

export interface LteCompareOp<C extends Context, Ignore> {
    lte: NumberCompareValue<C, Ignore>;
}

export interface RegexCompareOp<C extends Context, Ignore> {
    regexp: string | PropertyRef<C, Ignore, string>;
}

export interface RegexiCompareOp<C extends Context, Ignore> {
    regexpi: string | PropertyRef<C, Ignore, string>;
}

export interface ExistsCompareOp {
    exists: boolean;
}

export type FuncCompares<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    CustomEvaluatorFuncRunOptions> = {
    [K in keyof F]: FuncCompareOp<C, F, K, CustomEvaluatorFuncRunOptions>;
}

export type NumberCompareOps<C extends Context, Ignore, V extends Primitive> =
    V extends number ? BetweenCompareOp<C, Ignore> |
        GtCompareOp<C, Ignore> |
        GteCompareOp<C, Ignore> |
        LtCompareOp<C, Ignore> |
        LteCompareOp<C, Ignore> : never;

export type StringCompareOps<C extends Context, Ignore, V extends Primitive> =
    V extends string ? RegexCompareOp<C, Ignore> | RegexiCompareOp<C, Ignore> : never;

export type ExtendedCompareOp<C extends Context, Ignore, V extends Primitive> =
    EqualCompareOp<C, Ignore, V> | NotEqualCompareOp<C, Ignore, V> | InqCompareOp<C, Ignore, V> |
    NinCompareOp<C, Ignore, V> | NumberCompareOps<C, Ignore, V> | StringCompareOps<C, Ignore, V> |
    ExistsCompareOp;

type ExtractPrimitive<T> = Extract<NonNullable<T>, Primitive>;

export type PropertyCompareOps<C extends Context, Ignore> = {
    [K in StringPaths<C, Ignore>]:
    ExtractPrimitive<Path<C, Split<K, '.'>>> extends never ?
        ExistsCompareOp :
        (Extract<Path<C, Split<K, '.'>>, Primitive | undefined> |
            ExtendedCompareOp<C, Ignore, ExtractPrimitive<Path<C, Split<K, '.'>>>>)
};

export interface AndCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    and: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[];
}

export interface OrCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    or: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>[];
}

export interface NotCompareOp<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    not: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>;
}

export { RequireOnlyOne };

export type FullExpression<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> =
    NotCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions> &
    OrCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions> &
    AndCompareOp<C, F, Ignore, CustomEvaluatorFuncRunOptions> &
    FuncCompares<C, F, CustomEvaluatorFuncRunOptions> &
    PropertyCompareOps<C, Ignore>;

export type Expression<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> =
    RequireOnlyOne<FullExpression<C, F, Ignore, CustomEvaluatorFuncRunOptions>>;

export type EvaluatorFuncRunOptions<CustomEvaluatorFuncRunOptions = undefined> = {
    custom: CustomEvaluatorFuncRunOptions;
    validation: boolean;
}
export type Func<T, CustomEvaluatorFuncRunOptions> = (
    param: any, context: T, runOptions: EvaluatorFuncRunOptions<CustomEvaluatorFuncRunOptions>) =>
    boolean | Promise<boolean>;

export type FunctionsTable<T, CustomEvaluatorFuncRunOptions> = Record<string, Func<T, CustomEvaluatorFuncRunOptions>>;

export type Context = Record<string, any>;

export type ValidationContext<C extends Context, Ignore = never> = NonNullableDeep<C, Ignore>;

export interface EvaluationResult<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Ignore, CustomEvaluatorFuncRunOptions> {
    result: boolean;
    reason: Expression<C, F, Ignore, CustomEvaluatorFuncRunOptions>;
}
