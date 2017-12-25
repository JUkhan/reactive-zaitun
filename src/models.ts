import {Router} from './router';
import {DevTool} from './devTool/devTool';
export interface RouteOptions {
    path: string;
    component?: any;
    loadComponent?: any;
    canActivate?: Function | any;
    canDeactivate?: Function | any;
    cache?: boolean;
    effects?:any[],
    loadEffects?:any[],    
    cacheStrategy?: 'session' | 'local' | 'default';
    data?: (params: { [key: string]: any }) => Promise<any> | { [key: string]: any };
    [key: string]: any;
}
export interface ActiveRoute {
    routeParams: { [key: string]: any },
    path: string,
    navPath: string,
    data?: any
}

export interface Action {
    type: any;
    payload?: any;
    dispatch?: Dispatch;
}
export interface Component {
    init?: (dispatch: Dispatch, params: any, router?: Router) => any;
    view: (obj: { model: any, dispatch: Dispatch, router?: Router }) => any;
    update?: (model: any, action: Action, router?: Router) => any;
    afterViewRender?: (dispatch: Dispatch, router: Router, state: any, ) => void;
    onDestroy?: () => void;
    router?: Router;
    afterChildRender?: (dispatch: Dispatch, router: Router, state: any, ) => void;
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

export type Dispatch=(action: Action, broadcast?:boolean)=> void;
export interface ViewObj{
    model:any;
    dispatch:Dispatch;
    router?:Router;
}
export interface BootstrapOptions{
    containerDom: string | Element;
    mainComponent: any;
    routes?: RouteOptions[];
    activePath?: string;
    devTool?: boolean;
    locationStrategy?: 'hash' | 'history';
    baseUrl?: string;
    cacheStrategy?: 'session' | 'local' | 'default';
}