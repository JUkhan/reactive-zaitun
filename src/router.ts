import { DevTool } from "./devTool/devTool";
import { Effect, EffectSubscription } from './effect';
import {ActiveRoute, ViewObj, RouteOptions, BootstrapOptions, Action, IComponentManager, Dispatch} from './models';

export class Router {
    private originalUrl = window.location.origin;
    private _fap = '';
    public activeRoute: ActiveRoute=<ActiveRoute>{};

    constructor(private options: BootstrapOptions, public CM: IComponentManager) {
        this.originalUrl = window.location.origin;
        this._subject = new Effect();
        this._subject.subscribe();
        this.effect$=new EffectSubscription(this._subject);
        this.init();
    }
    effectInstance(){
        return new EffectSubscription(this._subject);
    }
    test(): Promise<Router> {
        return new Promise<Router>(accept => {
            setTimeout(() => {
                this.CM._isTestEnable = true;
                accept(this);
            }, 0);

        });
    }
    whenAction(action: Action, callback, broadcast=false) {
        this.CM._testCallback = callback;
        this.dispatch(action, broadcast);

    }
    private clearSlashes(path: any) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

    private attach() {
        this.CM.router = this;
        this.CM.run(this.options.mainComponent);
        if (this.options.devTool) {
            new DevTool(this.CM);
        }
    }

    private getFragment() {
        let fragment = '';
        if (this.options.locationStrategy === 'history') {
            fragment = window.location.href.replace(this.originalUrl + this.options.baseUrl, '');
        } else {
            let match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : '';
        }
        if (!fragment && this.options.activePath) { fragment = this.options.activePath; }
        return this.clearSlashes(fragment);
    }

    private listen() {
        let checkCalled = false, that = this;
        window.addEventListener("popstate", ev => {
            checkCalled = true;
            that.check(that.getFragment());
        }, false);
        window.addEventListener("hashchange", ev => {
            if (!checkCalled) {
                that.check(that.getFragment());
            }
            checkCalled = false;
        }, false);

        Array.from(document.querySelectorAll('a')).forEach(it => {
            it.addEventListener('click', (ev) => {
                ev.preventDefault();
                if (that.clearSlashes(it.href) === that.clearSlashes(window.location.href)) {
                    return;
                }
                if (it.href.indexOf('#') &&
                    window.location.href.indexOf('#') === -1 &&
                    window.location.href.replace(/#(.*)$/, '') + '#' + that._fap === it.href) {
                    return;
                }
                that.destroy(it.href, that.getRoute(it.href));
            }, false);
        });
    }

    private destroy(path: any, route: RouteOptions) {

        this.CM.canActivate(route, (isActive: boolean) => {
            if (isActive) {
                route._ca_checked = true;
                this.CM.destroy(path, (path: string) => {
                    if (this.options.locationStrategy === 'hash') {
                        window.location.href = path;
                    } else {
                        path = path.replace(this.originalUrl + this.options.baseUrl, '');
                        history.pushState({
                            x: 1
                        }, '', this.options.baseUrl + this.clearSlashes(path));
                        this.check(path);
                    }
                });
            }
        });
    }
    private getRoute(hash: any): any {
        let keys, match;
        if (hash.indexOf('#') !== -1) {
            match = hash.match(/#(.*)$/);
            hash = match ? match[1] : '';
        } else if (this.options.locationStrategy === 'history') {
            hash = hash.replace(this.originalUrl + this.options.baseUrl, '');
        }
        hash = this.clearSlashes(hash);
        for (let i = 0, max = this.options.routes.length; i < max; i++) {
            if (this.clearSlashes(this.options.routes[i].path) === hash) {
                return this.options.routes[i];
            }
            keys = this.options.routes[i].path.match(/:([^\/]+)/g);
            if (keys) {
                match = hash.match(new RegExp(this.clearSlashes(this.options.routes[i].path).replace(/:([^\/]+)/g, "([^\/]*)")));
                if (match) {
                    return this.options.routes[i];
                }
            }
        }
        return {};
    }
    private check(hash: any) {
        let keys: any, match: any, routeParams: any;
        for (let i = 0, max = this.options.routes.length; i < max; i++) {
            if (this.clearSlashes(this.options.routes[i].path) === hash) {
                this.render(this.options.routes[i], null, hash);
                return;
            }
            keys = this.options.routes[i].path.match(/:([^\/]+)/g);
            if (keys) {
                routeParams = {}
                match = hash.match(new RegExp(this.clearSlashes(this.options.routes[i].path).replace(/:([^\/]+)/g, "([^\/]*)")));
                if (match) {
                    match.shift();
                    match.forEach((value: any, ia: number) => {
                        routeParams[keys[ia].replace(":", "")] = value;
                    });
                    this.render(this.options.routes[i], routeParams, hash);
                    return;
                }
            }
        }

    }

    private setActivePath(path: any) {
        if (path) {
            if (!this._fap) {
                this._fap = path[0] === '/' ? path : '/' + path;
            }
            this.check(this.clearSlashes(this.getFragment() || path));
        }
    }

    private render(route: RouteOptions, routeParams: any, url: any) {
        routeParams = routeParams || {};
        if (route._ca_checked) {
            this.renderHelper(route, routeParams, url);
        } else {
            this.CM.canActivate(route, (isActive: boolean) => {
                if (isActive) {
                    this.renderHelper(route, routeParams, url);
                }
            });
        }

    }

    private renderHelper(route: RouteOptions, routeParams: any, url: any) {        
        route._ca_checked = false;
        route.routeParams = routeParams;
        route.navPath = url;
        this.activeRoute = {
            routeParams: routeParams,
            path: route.path,
            navPath: url
        };
        this.unsubscribeAllEffect();        
        if (typeof route.data === 'function') {
            const res = route.data(route.routeParams) as Promise<any>;
            typeof res.then === 'function' && res.then(res => {
                this.activeRoute.data = res;                
                this.CM.runChild(route);
            });
        } else {
            this.activeRoute.data = route.data || {};            
            this.CM.runChild(route);
        }

    }
    public getAppState(){
        return this.CM.getAppState();
    }
    public addEffectService(effect_service_class:any){
        new effect_service_class(this.effect$, this);
        return this;
    }
    private unsubscribeAllEffect(){
        this.effect$.unsubscribe();
        this.effect$=new EffectSubscription(this._subject);
    }
    public rootDispatch:Function;
    private init() {

        if (!Array.isArray(this.options.routes)) {
            this.options.routes = [];
        }
        this.options.locationStrategy = this.options.locationStrategy == 'history' && !!(history.pushState) ? 'history' : 'hash';
        this.options.baseUrl = this.options.baseUrl ? '/' + this.clearSlashes(this.options.baseUrl) + '/' : '/';

        this.attach();
        this.listen();
        this.setActivePath(this.options.activePath);

    }
    public add = function (route: RouteOptions) {
        this.routes.push(route);
    }
    public remove(pathName: string) {
        this.options.routes = this.options.routes.filter(it => {
            return it.path !== pathName;
        });
    }
    public navigate(path: any) {
        var tid = setTimeout(() => {
            path = path ? path : '';
            if (this.options.locationStrategy === 'history') {
                history.pushState(null, null, this.options.baseUrl + this.clearSlashes(path));
                this.destroy(this.options.baseUrl + this.clearSlashes(path), this.getRoute(path));
            } else {
                this.destroy(window.location.href.replace(/#(.*)$/, '') + '#' + path, this.getRoute(path));
            }
            clearTimeout(tid);
        }, 0);
        return this;
    }
    public dispatch: (action: Action, broadcast?:boolean) => void;
    public viewChild(obj: ViewObj): any {
        obj.dispatch = this.bindEffect(obj.dispatch);
        this.dispatch = obj.dispatch;
        return this.CM.child.view(obj);
    }

    public updateChild(model: any, action: Action) {
        return this.CM.child.update(model, action);
    }
    public bindEffect(dispatch: Dispatch): Dispatch {
        let _dispatch = dispatch;
        return (action: Action, brodcast:boolean=false) => {
            action.dispatch = _dispatch;
            _dispatch(action);
            brodcast && this._subject.dispatch(action);
        }
    }    
    public effect$: EffectSubscription;
    private _subject: Effect;
}

export default Router;