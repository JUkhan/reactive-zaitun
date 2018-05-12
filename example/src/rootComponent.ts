import { Router, ViewObj, Dispatch, Action } from 'zaitun';
import { div, h3, nav, a, ul, li } from 'zaitun/dom';


import { mergeMap } from 'rxjs/operators';
import { empty } from 'rxjs';
import counter from './counter';
import appService from './appService';
import { juForm } from './ui/juForm';
import {Effect} from 'zaitun-effect';


const CHILD = Symbol('CHILD');
const INC_AT = 'incAt';
const DEC_AT = 'decAt';
var popup: juForm = new juForm();

function getPopupOptions() {
    return {
        viewMode: 'popup',
        title: 'Popup Title',
        name: 'alert-popup',
        size: 'sm',
        inputs: [
            { type: 'vnode', vnode: model => appService.msg }
        ]
    }
}

function init() {

    return {
        popup: {
            options: getPopupOptions(),
            data: {}
        },
        incAt: null,
        decAt: null,
        menu: [
            { path: 'page1', text: 'Page1' },
            { path: 'page2', text: 'page2' },
            { path: 'page3/5/My favourite fruits', text: 'page3' },
            { path: 'counter', text: 'Counter' },
            { path: 'parent', text: 'Parent' },
            { path: 'form', text: 'Form Examples' },
            { path: 'grid', text: 'Grid Examples' },
            { path: 'dispute', text: 'Dispute' },
            { path: 'chart', text: 'Chart' },
            { path: 'fiber', text: 'Fiber Examples' },
        ]
    };
}
function afterChildRender(dispatch: Dispatch, router: Router) {
    router
        .addEffect((eff:Effect) =>
            eff.whenAction(counter.actions.INCREMENT)
                .pipe(
                    mergeMap(action => {
                        dispatch({ type: INC_AT, payload: new Date().toLocaleTimeString() });
                        return empty();
                    }))
        )
        .addEffect((eff:Effect) =>
            eff.whenAction(counter.actions.DECREMENT)
                .pipe(
                    mergeMap(action => {
                        dispatch({ type: DEC_AT, payload: new Date().toLocaleTimeString() });
                        return empty();
                    }))
        );
    appService.setPopup(popup);
}
 function  view({ model, dispatch, router }: ViewObj) {
    return div([
        topMenu(model.menu, router),
        h3('Root Component'),
        div(model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        div(model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        div(router.viewChild({
                model: model.child,
                router,
                dispatch: action => dispatch({ type: CHILD, payload: action })
            })
        ),
        popup.view({ model: model.popup, dispatch, router })
    ]);
}

function update(model, action: Action, router: Router) {
    switch (action.type) {
        case CHILD:
            return {
                ...model,
                child: router.updateChild(model.child, action.payload)
            };
        case INC_AT:
            return { ...model, incAt: action.payload };
        case DEC_AT:
            return { ...model, decAt: action.payload };
        default:
            return model;
    }
}

function topMenu(model, router) {
    return nav('.navbar.navbar-expand-sm.bg-dark navbar-dark',
        [
            a('.navbar-brand', { props: { href: '/counter' } }, 'Zaitun'),
            ul('.navbar-nav', model.map(nav => li('.nav-item', {
                class: { active: router.activeRoute.navPath === nav.path }
            },
                a('.nav-link', { props: { href: nav.path } }, nav.text)
            )
            )
            )
        ]);

}

export default { init, view, update, afterChildRender };
