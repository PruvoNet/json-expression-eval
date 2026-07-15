import {
    RuleFunctionsTable, Rule, FunctionsTable, Context, ResolvedConsequence,
    ValidationContext, RuleDefinition
} from '../types';
import { evaluate, validate } from './evaluator';
import { objectKeys } from './helpers';
import { isRuleFunction } from './typeGuards';
import { evaluateEngineConsequence } from './engineConsequenceEvaluator';

async function run<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore, CustomEngineRuleFuncRunOptions>(rules: Rule<ConsequencePayload, RF, C, F, Ignore,
                                                                  CustomEngineRuleFuncRunOptions>[],
                                            context: C, functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, validation: false, runOptions: CustomEngineRuleFuncRunOptions)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]>
async function run<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>, Ignore,
    CustomEngineRuleFuncRunOptions>(rules: Rule<ConsequencePayload, RF, C, F,
        Ignore, CustomEngineRuleFuncRunOptions>[], context: ValidationContext<C, Ignore>,
 functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, validation: true, runOptions: CustomEngineRuleFuncRunOptions)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]>
async function run<ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore, CustomEngineRuleFuncRunOptions>(rules: Rule<ConsequencePayload, RF,
                                                                  C, F, Ignore, CustomEngineRuleFuncRunOptions>[],
                                            context: C | ValidationContext<C, Ignore>, functionsTable: F,
 ruleFunctionsTable: RF, haltOnFirstMatch: boolean, validation: boolean, runOptions: CustomEngineRuleFuncRunOptions)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]> {
    const errors: ResolvedConsequence<ConsequencePayload>[] = [];
    for (const rule of rules) {
        const keys = objectKeys(rule);
        const key = keys[0];
        if (keys.length === 1 && key && isRuleFunction<ConsequencePayload, C, RF, CustomEngineRuleFuncRunOptions>(
            rule, ruleFunctionsTable, key)) {
            const consequence = await ruleFunctionsTable[key](rule[key], context as C, {
                custom: runOptions,
                validation,
            });
            if (consequence) {
                errors.push(consequence);
                if (haltOnFirstMatch && !validation) {
                    return errors;
                }
            }
        } else {
            // Type assertion needed because TypeScript can't narrow RequireOnlyOne union types
            const ruleDefinition = rule as RuleDefinition<ConsequencePayload, C, F, Ignore,
                CustomEngineRuleFuncRunOptions>;
            if (!ruleDefinition.condition) {
                throw new Error(`Missing condition for rule`);
            }
            if (!ruleDefinition.consequence) {
                throw new Error(`Missing consequence for rule`);
            }
            if (validation) {
                await validate<C, F, Ignore, CustomEngineRuleFuncRunOptions>(ruleDefinition.condition,
                    context as ValidationContext<C, Ignore>, functionsTable, runOptions);
                await evaluateEngineConsequence<ConsequencePayload, C, Ignore>(
                    context as C, ruleDefinition.consequence);
            } else {
                const ruleApplies = await evaluate<C, F, Ignore, CustomEngineRuleFuncRunOptions>(
                    ruleDefinition.condition, context as C, functionsTable, runOptions);
                if (ruleApplies) {
                    const consequence =
                        await evaluateEngineConsequence<ConsequencePayload, C, Ignore>(context as C,
                            ruleDefinition.consequence);
                    errors.push(consequence);
                    if (haltOnFirstMatch) {
                        return errors;
                    }
                }
            }
        }
    }
    return errors.length ? errors : undefined;
}

export const evaluateRules = async <ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore = never, CustomEngineRuleFuncRunOptions = undefined>(rules: Rule<ConsequencePayload,
      RF, C, F, Ignore, CustomEngineRuleFuncRunOptions>[], context: C, functionsTable: F, ruleFunctionsTable: RF,
 haltOnFirstMatch: boolean, runOptions: CustomEngineRuleFuncRunOptions)
    : Promise<void | ResolvedConsequence<ConsequencePayload>[]> => {
    return run<ConsequencePayload, C, RF, F, Ignore, CustomEngineRuleFuncRunOptions>(
        rules, context, functionsTable, ruleFunctionsTable, haltOnFirstMatch, false, runOptions);
}

export const validateRules = async <ConsequencePayload, C extends Context,
    RF extends RuleFunctionsTable<C, ConsequencePayload, CustomEngineRuleFuncRunOptions>,
    F extends FunctionsTable<C, CustomEngineRuleFuncRunOptions>,
    Ignore = never, CustomEngineRuleFuncRunOptions = undefined>(
        rules: Rule<ConsequencePayload, RF, C, F, Ignore, CustomEngineRuleFuncRunOptions>[],
        validationContext: ValidationContext<C, Ignore>,
 functionsTable: F, ruleFunctionsTable: RF, runOptions: CustomEngineRuleFuncRunOptions)
    : Promise<void> => {
    await run<ConsequencePayload, C, RF, F, Ignore, CustomEngineRuleFuncRunOptions>(
        rules, validationContext, functionsTable,
        ruleFunctionsTable, false, true, runOptions);
}
