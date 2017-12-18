import { Router } from './router';
import { BootstrapOptions } from './bootstrap';
import { RouteOptions } from './index';
import { DevTool } from './devTool/devTool';

declare const require: any;
const snabbdom = require('snabbdom');
const patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);
const h = require('snabbdom/h').default; // helper function

export interface Action {
    type: any;
    payload?: any;
    dispatch?: Function;
}
export interface Component {
    init?: (dispatch: Function, params: any, router?: Router) => any;
    view: (obj: { model: any, dispatch: Function, router?: Router }) => any;
    update?: (model: any, action: Action, router?: Router) => any;
    afterViewRender?: (dispatch: Function, router: Router, state: any, ) => void;
    onDestroy?: () => void;
    router?: Router
}
export interface IComponentManager {
    router: Router;
    devTool: DevTool;
    json_parse: (data: string) => any;
    json_stringify: (data: any) => any;
    reset: () => void;
    updateByModel: (model: any) => void;
    runChild: (route: RouteOptions) => void;
    run: (component: Component) => void;
    canActivate: (route: RouteOptions, callback: Function) => void;
    destroy: (path: any, callback: Function) => void;
    getAppState: () => any;
    child: Component;
    _isTestEnable?: boolean;
    _testCallback?: (data: any) => void;
}
export function ComponentManager(boptions: BootstrapOptions) {
    let mcom: Component = <Component>{},
        model: any = {},
        params: any = null,
        key = '',
        cacheObj = {},
        active_route: RouteOptions = <RouteOptions>{},
        vnode: any = boptions.containerDom,
        options: BootstrapOptions = boptions,
        rootDispatch: any,
        that = this;

    this.router = null;
    this.devTool = null;
    this._isTestEnable = false;
    this._testCallback;
    this.getAppState = function () { return model; }
    function getEmptyCom(): Component {
        return {
            init: function () {
                return {};
            },
            view: function (obj) {
                return h('div.com-loading', 'loading...');
            },
            update: function () {
                return {};
            }
        };
    }
    that.child = getEmptyCom();
    function initMainComponent(component: any, router: Router) {
        if (typeof component === 'object') {
            mcom = component;
        } else if (typeof component === 'function') {
            mcom = new component();
            mcom.router = router;
        }
        validateCom(mcom);
        rootDispatch = router.bindEffect(dispatch);
        that.router.dispatch = rootDispatch;
        that._isTestEnable = false;
        router.rootDispatch = rootDispatch;
    }
    function validateCom(com: any) {

        if (typeof com.init !== 'function') {
            com.init = function () {
                return {};
            };
        }
        if (typeof com.view !== 'function') {
            throw new Error('Component must have a view function.');
        }
    }
    function initChildComponent(component: any, router: Router) {

        if (typeof component === 'object') {
            that.child = component;
        }
        else if (typeof component === 'function') {
            that.child = new component();
            that.child.router = router;
        }
        validateCom(that.child);
        that._isTestEnable = false;
    }

    function updateUI() {
        const newVnode = mcom.view({
            model: model,
            dispatch: rootDispatch,
            router: that.router
        });
        vnode = patch(vnode, newVnode);
    }

    function dispatch(action: Action) {
        model = mcom.update(model, action, that.router);
        updateUI();
        if (that._isTestEnable) {
            that._testCallback({ model, action });
        }
        if (that.devTool) {
            that.devTool.setAction(action, model);
        }
        if (active_route.cache && active_route.cacheUpdate_perStateChange) {
            setComponentToCache(key, that.child, model.child);
        }
    }
    function fireDestroyEvent(path: string, callback: Function) {
        const tid = setTimeout(function () {
            callback(path);
            clearTimeout(tid);
        }, 0);
        if (key) {
            setComponentToCache(key, that.child, model.child);
        }
        if (typeof that.child.onDestroy === 'function') {
            that.child.onDestroy();
        }

    }
    function isInCache(key: string): any[] {
        const data = key ? getCacheData() : {},
            hasCache = !!(key && data[key]),
            res: any[] = [hasCache];
        if (hasCache) {
            res.push(data[key]);
        }
        return res;
    }
    function setComponentToCache(key: any, instance: any, state: any) {
        const data = getCacheData();
        data[key] = {
            //instance: instance,
            state: state
        };
        if (getCacheStrategy() === 'session') {
            sessionStorage.setItem('app_cache', that.json_stringify(data));
        } else if (getCacheStrategy() === 'local') {
            localStorage.setItem('app_cache', that.json_stringify(data));
        } else {
            cacheObj = data;
        }
    }

    function getCacheData() {
        if (getCacheStrategy() === 'session') {
            return that.json_parse(sessionStorage.getItem('app_cache') || '{}');
        } else if (getCacheStrategy() === 'local') {
            return that.json_parse(localStorage.getItem('app_cache') || '{}');
        }
        return cacheObj;
    }
    function getCacheStrategy() {
        return active_route.cacheStrategy ? active_route.cacheStrategy : options.cacheStrategy;
    }
    this.json_parse = function (data: any) {
        return JSON.parse(data);
    }
    this.json_stringify = function (data: any) {
        return JSON.stringify(data);
    }
    this.reset = function () {
        model = mcom.init(rootDispatch, params, this.router);
        if (typeof that.child.init === 'function') {
            model.child = that.child.init(that.router.dispatch, params, that.router);
        }
        updateUI();
    }
    this.updateByModel = function (_model: any) {
        model = _model;
        updateUI();
    }
    function loadCom(route: RouteOptions) {
        route.loadComponent().then((com: any) => {
            runChildHelper(com.default, route);
        });
    }
    function runChildHelper(component: Component, route: RouteOptions) {
        active_route = route;
        params = route.routeParams;
        key = route.cache ? route.navPath : '';
        initChildComponent(component, that.router);
        const cd = isInCache(key);
        model.child = cd[0] ? cd[1].state : that.child.init(that.router.dispatch, route.routeParams, that.router);
        updateUI();
        if (typeof that.child.afterViewRender === 'function') {
            that.child.afterViewRender(that.router.dispatch, that.router, model);
        }
        if (that.devTool) {
            that.devTool.reset();
        }
        Array.isArray(route.effects) && route.effects.forEach(service=>that.router.addEffectService(service));
        Array.isArray(route.loadEffects) && route.loadEffects.forEach(loadEffectService);
        
    }
    function loadEffectService(service) {
        service().then(ef => {
            that.router.addEffectService(ef.default);
        });
    }
    this.runChild = function (route: RouteOptions) {
        if (typeof route.loadComponent === 'function') {
            that.child = getEmptyCom();
            updateUI();
            loadCom(route);
        } else {
            runChildHelper(route.component, route);
        }
    }
    this.run = function (component: any) {
        initMainComponent(component, that.router);
        model = mcom.init(rootDispatch, that.router);
        updateUI();
        if (typeof mcom.afterViewRender === 'function') {
            mcom.afterViewRender(rootDispatch, that.router, model);
        }
    }
    this.canActivate = function (route: RouteOptions, callback: Function) {
        try {
            if (typeof route.canActivate === 'function') {
                var ref = new route.canActivate();
                if (typeof ref.canActivate === 'function') {
                    var res = ref.canActivate(Router);
                    if (typeof res === 'object' && res.then) {
                        res.then(function (val: any) {
                            callback(val);
                        });
                    } else {
                        callback(res);
                    }
                } else {
                    callback(true);
                }
            } else {
                callback(true);
            }
        } catch (e) {
            callback(false);
        }
    }
    this.destroy = function (path: string, callback: Function) {
        try {
            if (that.child && typeof active_route.canDeactivate === 'function') {
                let ref = new active_route.canDeactivate();
                if (typeof ref.canDeactivate === 'function') {
                    let res = ref.canDeactivate(that.child, Router);
                    if (typeof res === 'object' && res.then) {
                        res.then(function (val: any) {
                            if (val) {
                                fireDestroyEvent(path, callback);
                            }
                        });
                    } else if (res) {
                        fireDestroyEvent(path, callback);
                    }
                } else {
                    fireDestroyEvent(path, callback);
                }
            } else {
                fireDestroyEvent(path, callback);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

}

export default ComponentManager;
