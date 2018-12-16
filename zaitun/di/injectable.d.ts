export declare const Type: FunctionConstructor;
export interface Type<T> extends Function {
    new (...args: any[]): T;
}
export interface InjectableDecorator {
    (): any;
    (scope: 'application' | 'page'): any;
    (scope: 'application' | 'page', deps?: Type<any>[]): any;
    (scope: 'application' | 'page', deps?: Type<any>[], factory?: (...any: any[]) => any): any;
}
/**
 * Creates an injector for a given class.
 *
 * @param scope default scope is application.
 * @param deps you may provide external @Injectable dependency
 * @param factory you may provide custom factory to create instance.
 *
 */
export declare const Injectable: InjectableDecorator;
export declare abstract class Injector {
    static get<T>(token: Type<T>, notFoundValue?: T): T;
    static has(token: any): boolean;
    static getParams(token: any): any;
}
export declare function disposePageScopeInstance(): void;
export interface PageDecorator {
    (deps: Type<any>[]): any;
}
/**
 * This decorator only use for dependency injection and only for page component
 *
 * @param deps you must provide external @Injectable dependency
 *
 */
export declare const Page: PageDecorator;
