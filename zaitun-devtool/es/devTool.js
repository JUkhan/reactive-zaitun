var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import './devTool.css';
import DomModules from './modules';
var snabbdom = require('snabbdom');
var patch = snabbdom.init(DomModules);
var h = require('snabbdom/h').default;
var ResetComponent = 'DEV_TOOL_ResetComponent';
var ResetTool = 'DEV_TOOL_ResetTool';
var Action_Regenerate = 'DEV_TOOL_dec';
var LogPayload = 'DEV_TOOL_LogPayload';
var LogState = 'DEV_TOOL_LogState';
var Resize = 'DEV_TOOL_resize';
var SetAction = 'DEV_TOOL_setAction';
var selectAction = 'DEV_TOOL_SelectAction';
var Hide = 'DEV_TOOL_Hide';
var DevTool = /** @class */ (function () {
    //CM:ComponentManager
    function DevTool(CM) {
        this.CM = CM;
        this.isCollapsed = false;
        this.CM.devTool = this;
        this.initialize();
    }
    DevTool.prototype.initialize = function () {
        var _this = this;
        var elm = document.createElement('DIV');
        this.elm = elm;
        elm.setAttribute('class', 'dev-tool');
        var size = windowSize();
        this.height = size.height;
        elm.style.left = (size.width - 250) + 'px';
        elm.style.height = (size.height) + 'px';
        var elm2 = document.createElement('DIV');
        elm.appendChild(elm2);
        document.body.appendChild(elm);
        window.addEventListener('resize', function () {
            if (!_this.isCollapsed) {
                _this.setSize();
            }
            else {
                var size_1 = windowSize();
                elm.style.left = (size_1.width - 30) + 'px';
                elm.style.height = '20px';
            }
        }, false);
        window.addEventListener('scroll', function (e) {
            elm.style.top = document.body.scrollTop + 'px';
        }, false);
        render(this.init(), elm2, this);
    };
    DevTool.prototype.setSize = function () {
        var size = windowSize();
        this.elm.style.left = (size.width - 250) + 'px';
        this.elm.style.height = (size.height) + 'px';
        if (this.toolHandler) {
            this.toolHandler({
                type: Resize,
                payload: size.height
            });
        }
    };
    DevTool.prototype.reset = function () {
        this.toolHandler({
            type: ResetTool
        });
    };
    DevTool.prototype.setAction = function (action, model) {
        this.toolHandler({
            type: SetAction,
            payload: {
                action: action,
                model: model
            }
        });
    };
    DevTool.prototype.init = function () {
        return {
            height: this.height,
            hide: false,
            states: []
        };
    };
    DevTool.prototype.view = function (_a) {
        var _this = this;
        var model = _a.model, handler = _a.handler;
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
                        height: (model.height - 40) + 'px'
                    })
                }, model.states.map(function (item, index) { return _this.DebugStates(item, handler, index); }))
            ]);
    };
    DevTool.prototype.DebugStates = function (item, handler, index) {
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
        ]);
    };
    DevTool.prototype.update = function (model, action) {
        switch (action.type) {
            case ResetComponent:
                this.CM.reset();
                return Object.assign({}, model, {
                    states: []
                });
            case ResetTool:
                return {
                    height: model.height,
                    hide: model.hide,
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
                var typeArr = [];
                this.getType(action.payload.action, typeArr);
                var state = Object.assign({}, action.payload, {
                    actionType: typeArr.filter(function (action) { return action !== 'CHILD'; }).join('-')
                });
                model.states.push(state);
                if (model.states.length > 100) {
                    model.states.shift();
                }
                return Object.assign({}, model, {
                    states: model.states
                });
            case selectAction:
                model.states.forEach(function (ac) { return ac.selected = false; });
                action.payload.selected = true;
                return model;
            case Hide:
                this.isCollapsed = action.payload;
                if (action.payload) {
                    this.elm.style.left = (windowSize().width - 30) + 'px';
                    this.elm.style.height = '20px';
                }
                else {
                    this.setSize();
                }
                return __assign({}, model, { hide: action.payload });
            default:
                return model;
        }
    };
    DevTool.prototype.getType = function (action, typeArr) {
        var type = action.type;
        if (typeof type === 'symbol') {
            type = action.type.toString().replace('Symbol(', '');
            type = type.substr(0, type.length - 1);
        }
        typeArr.push(type);
        if (action.payload && action.payload.type) {
            this.getType(action.payload, typeArr);
            return;
        }
    };
    return DevTool;
}());
export { DevTool };
function render(initState, oldVnode, com) {
    var newVnode = com.view({
        model: initState,
        handler: function (event) {
            var newState = com.update(initState, event);
            render(newState, newVnode, com);
        }
    });
    patch(oldVnode, newVnode);
}
function windowSize() {
    var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], width = w.innerWidth || e.clientWidth || g.clientWidth, height = w.innerHeight || e.clientHeight || g.clientHeight;
    return {
        width: width,
        height: height
    };
}
export default DevTool;
//# sourceMappingURL=devTool.js.map