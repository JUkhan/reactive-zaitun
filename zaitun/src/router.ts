
import {
    ActiveRoute,
    ViewObj,
    RouteOptions,
    BootstrapOptions,
    Action,
    IComponentManager,
    Dispatch,
    Location,
    AppState,
    TestResult
} from './models';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { captureClicks } from './captureClicks';
import { h } from "zaitun-dom";

export class Router {
    public activeRoute: ActiveRoute = <ActiveRoute>{};
    public history: any;
    private effectManager: { effect: () => any, subscription: (any) => any };
    constructor(private options: BootstrapOptions, public CM: IComponentManager) {

        this.setEffect();
        this.renderMainComponent();

        if (!Array.isArray(this.options.routes)) {
            this.options.routes = [];
        }
        if (this.options.routes.length > 0) {
            this.initRoutes();
        }
    }
    private setEffect() {

        if (this.options.effectManager && typeof this.options.effectManager === 'function') {
            this.effectManager = new this.options.effectManager();
            this._subject = this.effectManager.effect();
            this._subject.subscribe();
            this.effect$ = this.effectManager.subscription(this._subject);
        }
        else {
            this.effectManager = null;
        }
    }
    private initRoutes() {

        if (!this.options.locationStrategy) {
            this.options.locationStrategy = 'hash';
        }
        if (!this.options.hashOrHistoryOrMemoryOptions) {
            this.options.hashOrHistoryOrMemoryOptions = { hashType: 'noslash' };
        }

        this.history = this.options.locationStrategy === 'hash' ?
            createHashHistory(this.options.hashOrHistoryOrMemoryOptions) :
            this.options.locationStrategy === 'history' ?
                createBrowserHistory(this.options.hashOrHistoryOrMemoryOptions) :
                createMemoryHistory(this.options.hashOrHistoryOrMemoryOptions);

        /*const unlisten =*/ this.history.listen((location: Location, action) => {
            this.render(this.getRoute(location), location);
        });

        captureClicks((location: Location) => {
            this.destroy(this.getRoute(location), location);
        });

        if (!this.clearSlashes(this.history.location.pathname)) {
            let loc: any = { pathname: this.options.activePath, search: '' };
            this.destroy(this.getRoute(loc), loc);
        } else {
            this.history.replace(this.history.location.pathname + this.history.location.search);
        }

    }
    effectInstance() {
        return this.effectManager ? this.effectManager.subscription(this._subject) : null;
    }
    test(): Router {
        this.CM._isTestEnable = true;
        return this;
    }
    whenAction(action: Action, callback: (res: TestResult) => void, broadcast = false) {
        this.CM._testCallback = callback;
        this.dispatch(action, broadcast);

    }
    private clearSlashes(path: any) {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

    private renderMainComponent() {
        this.CM.router = this;
        this.CM.run(this.options.mainComponent);
        if (typeof this.options.devTool==='function') {
            new this.options.devTool(this.CM);
        }
    }
    private destroy(route: RouteOptions, location: Location) {
        if (this.history.location.pathname + this.history.location.search === location.pathname + location.search) {
            return;
        }
        this.CM.canActivate(route, (isActive: boolean) => {
            if (isActive) {
                this.CM.destroy(location, (cbLocation: any) => {
                    this.history.push(location.pathname + location.search);
                });
            }
        });
    }

    private render(route: RouteOptions, location: Location) {

        route.routeParams = this.getRouteParams(route, location);
        route.navPath = this.clearSlashes(location.pathname) + location.search
        this.activeRoute = {
            routeParams: route.routeParams,
            path: route.path,
            navPath: route.navPath
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
    private getRoute(location: Location): any {
        let keys, match, hash;
        hash = this.clearSlashes(location.pathname);
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
        return {
            path: location.pathname + location.search,
            component: {
                view() {
                    return h('div.com-not-found',
                        { style: { backgroundColor: 'gray', color: 'white', padding: '4px' } },
                        'Component not found at ' + location.pathname + location.search);
                }
            }
        };
    }
    private getRouteParams(route: RouteOptions, location: Location) {
        let keys: any, match: any, routeParams: any = {};
        keys = route.path.match(/:([^\/]+)/g);
        if (keys) {
            match = location.pathname.match(new RegExp(this.clearSlashes(route.path).replace(/:([^\/]+)/g, "([^\/]*)")));
            if (match) {
                match.shift();
                match.forEach((value: any, ia: number) => {
                    routeParams[keys[ia].replace(":", "")] = isNaN(value) ? value : Number(value);
                });
            }
        }
        if (location.search.startsWith('?')) {
            routeParams.search = location.search.substr(1)
                .split('&').reduce((a, n) => {
                    let d = n.split('=');
                    a[d[0]] = isNaN(<any>d[1]) ? d[1] : Number(d[1]);
                    return a;
                }, {});
        }
        return routeParams;
    }

    public getAppState(): AppState {
        return this.CM.getAppState();
    }
    public addEffect(effectCallback: (effect$: any) => any) {
        if (this.effect$) {
            return this.effect$.addEffect(effectCallback);
        }
        return null;
    }
    public addEffectService(effect_service_class: any) {
        new effect_service_class(this);
        return this;
    }
    private unsubscribeAllEffect() {
        if (this.effect$) {
            this.effect$.unsubscribe();
            this.effect$ = this.effectManager.subscription(this._subject);
        }
    }
    public rootDispatch: Function;

    public add = function (route: RouteOptions) {
        this.routes.push(route);
    }
    public remove(pathName: string) {
        this.options.routes = this.options.routes.filter(it => {
            return it.path !== pathName;
        });
    }
    public navigate(path: any) {
        const location: Location = { pathname: path, search: '' }
        this.destroy(this.getRoute(location), location);
    }
    public dispatch: (action: Action, broadcast?: boolean) => void;
    
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
        return (action: Action, brodcast: boolean = false) => {
            action.dispatch = _dispatch;
            _dispatch(action);
            if (this.effectManager && brodcast) {
                this._subject.dispatch(action);
            }
        }
    }
    private effect$: any;
    private _subject: any;
}

export default Router;