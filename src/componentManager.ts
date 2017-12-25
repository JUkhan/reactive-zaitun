import { Router } from './router';
import { RouteOptions } from './models';
import { Component, Action, BootstrapOptions } from './models';

declare const require: any;
const snabbdom = require('snabbdom');
const patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);
const h = require('snabbdom/h').default; // helper function

export function ComponentManager(boptions: BootstrapOptions) {
    var mcom: Component = <Component>{},
        model: any = {},
        params: any = null,
        key = '',
        cacheObj = {},
        active_route: RouteOptions = <RouteOptions>{},
        vnode: any = boptions.containerDom,
        options: BootstrapOptions = boptions,
        rootDispatch: any,
        root_com_cache_id = 'rootid',
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
        if (active_route.cache || (options.cacheStrategy === 'local' || options.cacheStrategy === 'session')) {
            setComponentToCache(key, model);
        }
    }
    function fireDestroyEvent(path: string, callback: Function) {
        const tid = setTimeout(function () {
            callback(path);
            clearTimeout(tid);
        }, 0);
        if (key) {
            setComponentToCache(key, model);
        }
        if (typeof that.child.onDestroy === 'function') {
            that.child.onDestroy();
        }

    }   
    
    function setComponentToCache(key: any, state: any) {

        if (active_route.cache) {
            if (getCacheStrategy() === 'session') {
                sessionStorage.setItem(key, that.json_stringify(state.child));
            } else if (getCacheStrategy() === 'local') {
                localStorage.setItem(key, that.json_stringify(state.child));
            } else {
                cacheObj[key] = state.child;
            }
        }
        let obj = { ...state };
        obj.child = null;
        if (options.cacheStrategy === 'session') {
            sessionStorage.setItem(root_com_cache_id, that.json_stringify(obj));
        } else if (options.cacheStrategy === 'local') {
            localStorage.setItem(root_com_cache_id, that.json_stringify(obj));
        }
        else {
            cacheObj[root_com_cache_id] = obj;
        }


    }

    function getCacheData(key: any) {
        if (getCacheStrategy() === 'session') {
            return that.json_parse(sessionStorage.getItem(key));
        } else if (getCacheStrategy() === 'local') {
            return that.json_parse(localStorage.getItem(key));
        }
        return cacheObj[key];
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
        if (key) {            
            model.child =  getCacheData(key) ||
                that.child.init(that.router.dispatch, route.routeParams, that.router);
        } else {
            model.child = that.child.init(that.router.dispatch, route.routeParams, that.router);
        }

        updateUI();
        if (typeof that.child.afterViewRender === 'function') {
            that.child.afterViewRender(that.router.dispatch, that.router, model);
        }
        if (typeof mcom.afterChildRender === 'function') {
            mcom.afterChildRender(rootDispatch, that.router, model);
        }
        if (that.devTool) {
            that.devTool.reset();
        }
        Array.isArray(route.effects) && route.effects.forEach(service => that.router.addEffectService(service));
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
        model =getCacheData(root_com_cache_id)|| mcom.init(rootDispatch, that.router);
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
