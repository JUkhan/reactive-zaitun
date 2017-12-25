
import { IComponentManager, Action } from '../models';
declare const require: any;
const snabbdom = require('snabbdom');
const patch = snabbdom.init([ // Init patch function with chosen modules
    require('snabbdom/modules/class').default, // makes it easy to toggle classes
    require('snabbdom/modules/props').default, // for setting properties on DOM elements
    require('snabbdom/modules/style').default, // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners').default, // attaches event listeners
]);
const h = require('snabbdom/h').default; // helper function

const ResetComponent = 'DEV_TOOL_ResetComponent';
const ResetTool = 'DEV_TOOL_ResetTool';
const Action_Regenerate = 'DEV_TOOL_dec';
const LogPayload = 'DEV_TOOL_LogPayload';
const LogState = 'DEV_TOOL_LogState';
const Resize = 'DEV_TOOL_resize';
const SetAction = 'DEV_TOOL_setAction';
const selectAction = 'DEV_TOOL_SelectAction';
const Hide = 'DEV_TOOL_Hide';

export class DevTool {
    height: number;
    toolHandler: any;
    //CM:ComponentManager
    constructor(private CM: IComponentManager) {
        this.CM.devTool = this;
        this.initialize();
    }
    elm: any;
    isCollapsed: boolean = false;
    initialize() {
        const elm = document.createElement('DIV');
        this.elm = elm;
        elm.setAttribute('class', 'dev-tool');
        const size = windowSize();
        this.height = size.height;
        elm.style.left = (size.width - 250) + 'px';
        elm.style.height = (size.height) + 'px';
        const elm2 = document.createElement('DIV');
        elm.appendChild(elm2);
        document.body.appendChild(elm);
        window.addEventListener('resize', () => {
            if (!this.isCollapsed) {
                this.setSize();
            } else {
                const size = windowSize();
                elm.style.left = (size.width - 30) + 'px';
                elm.style.height = '20px';
            }
        }, false);
        window.addEventListener('scroll', (e) => {
            elm.style.top = document.body.scrollTop + 'px';
        }, false);

        render(this.init(), elm2, this);

    }
    setSize() {
        const size = windowSize();
        this.elm.style.left = (size.width - 250) + 'px';
        this.elm.style.height = (size.height) + 'px';
        if (this.toolHandler) {
            this.toolHandler({
                type: Resize,
                payload: size.height
            });
        }
    }
    reset() {
        this.toolHandler({
            type: ResetTool
        });
    }
    setAction(action: any, model: any) {
        this.toolHandler({
            type: SetAction,
            payload: {
                action,
                model
            }
        })
    }
    init() {
        return {
            height: this.height,
            hide: false,
            states: []
        };
    }
    view({
        model,
        handler
    }) {
        this.toolHandler = handler;
        return model.hide ?
            h('button', {
                on: {
                    click: handler.bind(null, {
                        type: Hide, payload: false
                    })
                },
                props: { title: 'Expand the dev tool' }
            }, '<<') :
            h('div.tool-body', [
                h('div.tool-header', [
                    h('button', {
                        on: {
                            click: handler.bind(null, {
                                type: ResetComponent
                            })
                        }
                    }, 'Reset'),
                    h('button.tool-hideBtn', {
                        on: {
                            click: handler.bind(null, {
                                type: Hide, payload: true
                            })
                        },
                        props: { title: 'Collapse the dev tool' }
                    }, '>>')
                ]),
                h('div.tool-states', {
                    style: ({
                        payload: (model.height - 40) + 'px'
                    })
                },
                    model.states.map((item, index) => this.DebugStates(item, handler, index))
                )
            ]);
    }
    DebugStates(item, handler, index) {
        return h('div.tool-view', {
            key: index,
            class: ({
                'selected-action': item.selected
            }),
            on: {
                click: handler.bind(null, {
                    type: selectAction,
                    payload: item
                })
            }
        }, [h('div', [
            h('button', {
                on: {
                    click: handler.bind(null, {
                        type: Action_Regenerate,
                        payload: item
                    })
                }
            }, item.actionType)
        ]),
        h('div.tool-view-buttons', [
            h('button', {
                on: {
                    click: handler.bind(null, {
                        type: LogPayload,
                        payload: item
                    })
                }
            }, 'Log Action'),
            h('span.tool-space', ''),
            h('button', {
                on: {
                    click: handler.bind(null, {
                        type: LogState,
                        payload: item
                    })
                }
            }, 'Log State')
        ])
            ])
    }
    update(model, action: Action) {

        switch (action.type) {
            case ResetComponent:
                this.CM.reset();
                return Object.assign({}, model, {
                    states: []
                });
            case ResetTool:
                return {
                    height: model.height,
                    hide:model.hide,
                    states: []
                };

            case Action_Regenerate:
                console.log(action.payload.model);
                this.CM.updateByModel(action.payload.model);
                return model;
            case LogPayload:
                console.log(action.payload.action);
                return model;
            case LogState:
                console.log(action.payload.model);
                return model;
            case Resize:
                return Object.assign({}, model, {
                    height: action.payload
                });
            case SetAction:
                const typeArr = [];
                this.getType(action.payload.action, typeArr);
                const state = Object.assign({}, action.payload, {
                    actionType: typeArr.filter(action => action !== 'CHILD').join('-')
                });
                return Object.assign({}, model, {
                    states: [...model.states, state]
                });
            case selectAction:
                model.states.forEach(ac => ac.selected = false);
                action.payload.selected = true;
                return model;
            case Hide:
                this.isCollapsed = action.payload;
                if (action.payload) {
                    this.elm.style.left = (windowSize().width - 30) + 'px';
                    this.elm.style.height = '20px';
                } else {
                    this.setSize();
                }
                return { ...model, hide: action.payload };
            default:
                return model;
        }
    }
    getType(action, typeArr) {
        var type = action.type;
        if (typeof type === 'symbol') {
            type = action.type.toString().replace('Symbol(', '');
            type = type.substr(0, type.length - 1);
        }
        typeArr.push(type);
        for (let prop in action) {
            if (typeof action[prop] === 'object' && action[prop].type) {
                this.getType(action[prop], typeArr);
                return;
            }
        }
    }

}



function render(initState, oldVnode, com) {
    const newVnode = com.view({
        model: initState,
        handler: event => {
            const newState = com.update(initState, event);
            render(newState, newVnode, com);
        }
    });
    patch(oldVnode, newVnode);
}

function windowSize() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        width = w.innerWidth || e.clientWidth || g.clientWidth,
        height = w.innerHeight || e.clientHeight || g.clientHeight;
    return {
        width,
        height
    };
}

export default DevTool;