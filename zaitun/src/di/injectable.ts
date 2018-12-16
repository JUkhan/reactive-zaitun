
export const Type = Function;
export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export interface InjectableDecorator {
    (): any;
    (scope: 'application' | 'page'): any;
    (scope: 'application' | 'page', deps?: Type<any>[]): any;
    (scope: 'application' | 'page', deps?: Type<any>[], factory?: (...any) => any): any;

}
interface InjectorDef {
    scope: 'application' | 'page';
    factory: (...any) => any;
    value: any;

}
const Injectable_map = new Map<Type<any>, InjectorDef>();
/**
 * Creates an injector for a given class.
 *
 * @param scope default scope is application.
 * @param deps you may provide external @Injectable dependency
 * @param factory you may provide custom factory to create instance.
 * 
 */
export const Injectable: InjectableDecorator = (scope?, deps?, factory?) => {
    scope = scope || 'application';
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!Injectable_map.has(target)) {
            Injectable_map.set(target, {
                scope,
                factory: () => {
                    let args = resolveDeps(deps || []);
                    return typeof factory === 'function' ? factory(...args) : new target(...args);
                },
                value: null
            });
        }

    }
}
function resolveDeps(deps: Type<any>[]) {
    return deps.map(token => resolveToken(token));
}

function resolveToken(token: Type<any>) {
    let injector_data = Injectable_map.get(token);
    if (!injector_data) {
        throw new Error(`${token} is not declared as @Injectable`);
    }
    if (injector_data.value === null) {
        injector_data.value = injector_data.factory();
    }
    return injector_data.value;
}
export abstract class Injector {
    static get<T>(token: Type<T>, notFoundValue?: T): T {
        return resolveToken(token);
    }
    static has(token: any){
        return Injectable_map.has(token);
    }
}
export function disposePageScopeInstance() {
    Injectable_map.forEach((value, key) => {
        if (value.scope === 'page') {
            value.value = null;
        }
    });
}
