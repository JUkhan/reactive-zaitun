import { Router, h, ViewObj, Dispatch, Action } from '../../src/index';
import 'rxjs/add/operator/mergeMap';
import { empty } from 'rxjs/observable/empty';
import counter from './counter';

const CHILD = Symbol('CHILD');
const INC_AT = 'incAt';
const DEC_AT = 'decAt';

function init() {
    return {
        incAt: null,
        decAt: null,
        menu: [
            { path: 'page1', text: 'Page1' },
            { path: 'page2', text: 'page2' },
            { path: 'page3/7/My favourite fruits?dox=12 sdd&foo=123', text: 'page3' },
            { path: 'counter', text: 'Counter' },
            { path: 'parent', text: 'Parent' }
        ]
    };
}
function afterChildRender(dispatch:Dispatch, router: Router) {
    router
        .addEffect(eff =>
            eff.whenAction(counter.actions.INCREMENT).mergeMap(action => {
                dispatch({ type: INC_AT, payload: new Date().toUTCString() });               
                return empty();
            })
        )
        .addEffect(eff =>
            eff.whenAction(counter.actions.DECREMENT).mergeMap(action => {
                dispatch({ type: DEC_AT, payload: new Date().toUTCString() });                
                return empty();
            })
        );
}
function view({ model, dispatch, router }:ViewObj) {
    return h('div', [
        topMenu(model.menu, router),
        h('h3', 'Root Component'),
        h('div', model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        h('div', model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        h(
            'div',
            router.viewChild({
                model: model.child,
                router,
                dispatch: action => dispatch({ type: CHILD, payload: action })
            })
        )
    ]);
}

function update(model, action:Action, router:Router) {
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

function topMenu(model, router:Router) {

    return h(
        'nav',
        [           
            h(
                'div.nav-wrapper',[
                h('a.brand-logo.right', { props: { href: '#/counter' } }, 'Zaitun'),
                h(
                    'ul.left.hide-on-med-and-down',
                    model.map(nav =>
                        h(
                            'li.nav-item',
                            {
                                class: {
                                    active:
                                        router.activeRoute.navPath === nav.path
                                }
                            },
                            [
                                h(
                                    'a.nav-link',
                                    { props: { href:  nav.path } },
                                    nav.text
                                )
                            ]
                        )
                    )
                )
                ])
        ]
    );
}

export default { init, view, update, afterChildRender };
