/* tslint:disable:array-type */
import { Context, FunctionsTable, Primitive, StringPaths } from './evaluator';
import { FilterNever, Path, Split } from './utils';

type GetPartType<V> = V extends string ? 'string' : V extends number ? 'number' : V extends boolean ? 'boolean'
    : V extends Array<infer N> ? GetPartType<N> : never;

interface ExpressionFunctionPart<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    K extends keyof F, CustomEvaluatorFuncRunOptions> {
    type: GetPartType<Parameters<F[K]>[0]>;
    isArray: Parameters<F[K]>[0] extends Array<any> ? true : false;
    propertyPath: K;
    isFunction: true;
}

type ExpressionFunctionParts<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Extra extends object, CustomEvaluatorFuncRunOptions> = {
    [K in keyof F]: ExpressionFunctionPart<C, F, K, CustomEvaluatorFuncRunOptions> & Extra;
}

interface ExpressionContextPart<V, P extends string> {
    type: GetPartType<V>;
    isArray: false;
    propertyPath: P;
    isFunction: false;
}

type ExpressionContextParts<C extends Context, Extra extends object, Ignore> = {
    [K in StringPaths<C, Ignore>]:
    Path<C, Split<K, '.'>> extends Primitive
        ? ExpressionContextPart<Path<C, Split<K, '.'>>, K> & Extra
        : never;
}

export type ExpressionParts<C extends Context, F extends FunctionsTable<C, CustomEvaluatorFuncRunOptions>,
    Extra extends object, Ignore, CustomEvaluatorFuncRunOptions> =
    ExpressionFunctionParts<C, F, Extra, CustomEvaluatorFuncRunOptions> &
    FilterNever<ExpressionContextParts<C, Extra, Ignore>>;
