import { Action, ViewObj } from 'zaitun';
import { span, button } from 'zaitun/dom';

const INCREMENT = 'inc';
const DECREMENT = 'dec';
const LAZY = 'lazy';

function init() {
    return { count: 0, msg: '' };
}

function view({ model, dispatch }: ViewObj) {
    return span([
        button({
            on: {
                click: e => dispatch({ type: INCREMENT }, true)
            }
        }, '+'),
        button({
            on: {
                click: e => dispatch({ type: LAZY }, true)
            }
        }, '+ (Async)'),
        button({
            on: {
                click: e => dispatch({ type: DECREMENT }, true)
            }
        },'-'),
        span(model.msg || model.count)
    ]);
}
function update(model: any, action: Action) {
    switch (action.type) {
        case INCREMENT:
            return { count: model.count + 1, msg: '' };
        case DECREMENT:
            return { count: model.count - 1, msg: '' };
        case LAZY:
            return { ...model, msg: 'loading...' };
        default:
            return model;
    }
}
export default {
    init,
    view,
    update,
    actions: { INCREMENT, DECREMENT, LAZY }
};
