
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
interface PageResolveDef {    
    factory: (...any) => any;
}
const Injectable_map = new Map<Type<any>, InjectorDef>();
const Page_map= new Map<Type<any>, PageResolveDef>();
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
    static getParams(token:any) {
        var injector_data = Page_map.get(token);
        if(injector_data){            
            return injector_data.factory();
        }
        return [];
    };
}
export function disposePageScopeInstance() {
    Injectable_map.forEach((value, key) => {
        if (value.scope === 'page') {
            value.value = null;
        }
    });
}
export interface PageDecorator{
    (deps: Type<any>[]): any;
}
/**
 * This decorator only use for dependency injection and only for page component
 * 
 * @param deps you must provide external @Injectable dependency 
 *
 */
export const Page:PageDecorator=(deps)=>{
    return function (target, propertyKey, descriptor) {
        if(!Page_map.has(target)){
            Page_map.set(target,{
                factory:function(){
                    var args = resolveDeps(deps || []);
                    return args;
                }
            })
        }
    }
}
