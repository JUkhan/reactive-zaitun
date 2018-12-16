"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = Function;
var Injectable_map = new Map();
var Page_map = new Map();
/**
 * Creates an injector for a given class.
 *
 * @param scope default scope is application.
 * @param deps you may provide external @Injectable dependency
 * @param factory you may provide custom factory to create instance.
 *
 */
exports.Injectable = function (scope, deps, factory) {
    scope = scope || 'application';
    return function (target, propertyKey, descriptor) {
        if (!Injectable_map.has(target)) {
            Injectable_map.set(target, {
                scope: scope,
                factory: function () {
                    var args = resolveDeps(deps || []);
                    return typeof factory === 'function' ? factory.apply(void 0, args) : new (target.bind.apply(target, [void 0].concat(args)))();
                },
                value: null
            });
        }
    };
};
function resolveDeps(deps) {
    return deps.map(function (token) { return resolveToken(token); });
}
function resolveToken(token) {
    var injector_data = Injectable_map.get(token);
    if (!injector_data) {
        throw new Error(token + " is not declared as @Injectable");
    }
    if (injector_data.value === null) {
        injector_data.value = injector_data.factory();
    }
    return injector_data.value;
}
var Injector = /** @class */ (function () {
    function Injector() {
    }
    Injector.get = function (token, notFoundValue) {
        return resolveToken(token);
    };
    Injector.has = function (token) {
        return Injectable_map.has(token);
    };
    Injector.getParams = function (token) {
        var injector_data = Page_map.get(token);
        if (injector_data) {
            return injector_data.factory();
        }
        return [];
    };
    ;
    return Injector;
}());
exports.Injector = Injector;
function disposePageScopeInstance() {
    Injectable_map.forEach(function (value, key) {
        if (value.scope === 'page') {
            value.value = null;
        }
    });
}
exports.disposePageScopeInstance = disposePageScopeInstance;
/**
 * This decorator only use for dependency injection and only for page component
 *
 * @param deps you must provide external @Injectable dependency
 *
 */
exports.Page = function (deps) {
    return function (target, propertyKey, descriptor) {
        if (!Page_map.has(target)) {
            Page_map.set(target, {
                factory: function () {
                    var args = resolveDeps(deps || []);
                    return args;
                }
            });
        }
    };
};
//# sourceMappingURL=injectable.js.map