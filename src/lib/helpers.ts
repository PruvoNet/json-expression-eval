export const getFromPath = <O extends object>(obj: O, path: string)
    : { value: any, exists: boolean } => {
    const keys = path.split('.');
    let exists = keys.length > 0;
    const value = keys.reduce((acc: any, key: PropertyKey) => {
        const accessible = acc !== null && acc !== undefined;
        exists = exists && accessible && key in acc;
        return accessible ? acc[key] : undefined;
    }, obj);
    return { value, exists };
};

export const objectKeys = Object.keys as <T>(o: T) => (Extract<keyof T, string>)[];

export const assertUnreachable = <T = never>(x: never, message: string): T => {
    throw new Error(message);
};

export function contextNumberAssertion(key: string, value: any): asserts value is number {
    if (typeof value !== 'number') {
        throw new Error(`Invalid context - ${key} must be a number`);
    }
}

export function contextStringAssertion(key: string, value: any): asserts value is string {
    if (typeof value !== 'string') {
        throw new Error(`Invalid context - ${key} must be a string`);
    }
}

export function expressionNumberAssertion(key: string, value: any): asserts value is number {
    if (typeof value !== 'number') {
        throw new Error(`Invalid expression - ${key} must be a number`);
    }
}

export function expressionStringAssertion(key: string, value: any): asserts value is string {
    if (typeof value !== 'string') {
        throw new Error(`Invalid expression - ${key} must be a string`);
    }
}
