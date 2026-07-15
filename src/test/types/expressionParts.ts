/* eslint-disable prefer-const */
import { ExpressionParts } from '../../types';
import { Compute } from '../../types/utils';

interface ExpressionContext {
    str: string;
    num: number;
    bool: boolean;
    nested: {
        value: number;
        nested2: {
            value2: string;
        };
    };
}

type ExpressionFunction = {
    strFn: (a: string, context: { str: string }) => boolean;
    numFn: (a: number, context: { str: string }) => boolean;
    boolFn: (a: boolean, context: { str: string }) => boolean;
    strArrFn: (a: string[], context: { str: string }) => boolean;
    numArrFn: (a: number[], context: { str: string }) => boolean;
    boolArrFn: (a: boolean[], context: { str: string }) => boolean;
};

type Result = Compute<ExpressionParts<ExpressionContext, ExpressionFunction, {}, never, {dryRun: boolean}>>;

type Expected = {
    'nested.value': {
        isArray: false,
        isFunction: false,
        propertyPath: 'nested.value',
        type: 'number',
    },
    'nested.nested2.value2': {
        isArray: false,
        isFunction: false,
        propertyPath: 'nested.nested2.value2',
        type: 'string',
    },
    str: {
        isArray: false,
        isFunction: false,
        propertyPath: 'str',
        type: 'string',
    },
    strFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'strFn',
        type: 'string',
    },
    strArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'strArrFn',
        type: 'string',
    },
    num: {
        isArray: false,
        isFunction: false,
        propertyPath: 'num',
        type: 'number',
    },
    numFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'numFn',
        type: 'number',
    },
    numArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'numArrFn',
        type: 'number',
    },
    bool: {
        isArray: false,
        isFunction: false,
        propertyPath: 'bool',
        type: 'boolean',
    },
    boolFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'boolFn',
        type: 'boolean',
    },
    boolArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'boolArrFn',
        type: 'boolean',
    },
};

declare let r: Result;
declare let e: Expected;

r = e;
e = r;

type ResultExtended = Compute<ExpressionParts<ExpressionContext, ExpressionFunction, { description: string }, never,
    {dryRun: boolean}>>;

type ExpectedExtended = {
    'nested.value': {
        isArray: false,
        isFunction: false,
        propertyPath: 'nested.value',
        type: 'number',
        description: string,
    },
    'nested.nested2.value2': {
        isArray: false,
        isFunction: false,
        propertyPath: 'nested.nested2.value2',
        type: 'string',
        description: string,
    },
    str: {
        isArray: false,
        isFunction: false,
        propertyPath: 'str',
        type: 'string',
        description: string,
    },
    strFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'strFn',
        type: 'string',
        description: string,
    },
    strArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'strArrFn',
        type: 'string',
        description: string,
    },
    num: {
        isArray: false,
        isFunction: false,
        propertyPath: 'num',
        type: 'number',
        description: string,
    },
    numFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'numFn',
        type: 'number',
        description: string,
    },
    numArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'numArrFn',
        type: 'number',
        description: string,
    },
    bool: {
        isArray: false,
        isFunction: false,
        propertyPath: 'bool',
        type: 'boolean',
        description: string,
    },
    boolFn: {
        isArray: false,
        isFunction: true,
        propertyPath: 'boolFn',
        type: 'boolean',
        description: string,
    },
    boolArrFn: {
        isArray: true,
        isFunction: true,
        propertyPath: 'boolArrFn',
        type: 'boolean',
        description: string,
    },
};

declare let rExt: ResultExtended;
declare let eExt: ExpectedExtended;

rExt = eExt;
eExt = rExt;
