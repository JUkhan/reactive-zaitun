import { h, Action, ViewObj} from '../../src/index';

const INCREMENT = 'inc';
const DECREMENT = 'dec';
const LAZY = 'lazy';

function init() {
    return { count: 0, msg: '' };
}

function view({ model, dispatch }: ViewObj) {
    return h('span', [
        h(
            'button',
            { on: { click: e => dispatch({ type: INCREMENT }, true) } },
            '+'
        ),
        h(
            'button',
            { on: { click: e => dispatch({ type: LAZY }, true) } },
            '+ (Async)'
        ),
        h(
            'button',
            { on: { click: e => dispatch({ type: DECREMENT }, true) } },
            '-'
        ),
        h('span', model.msg || model.count)
    ]);
}
function update(model: any, action: Action) {
    switch (action.type) {
        case INCREMENT:
            return { count: model.count + 1, msg: '' };
        case DECREMENT:
            return { count: model.count - 1, msg: '' };
        case LAZY:
            return { ...model, msg: 'loaading...' };
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
