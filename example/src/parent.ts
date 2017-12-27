import { h, Action, ViewObj } from '../../src/index';
import Counter from './counter';

const COUNTER_UPDATE = 'counterUpdate';
const INC_AT = 'incAt';
const DEC_AT = 'decAt';

function init() {
    return { counter: Counter.init(), incAt: null, decAt: null };
}

function view({ model, dispatch, router }:ViewObj) {
    return h('div', [
        h('h3', 'Parent Component'),
        h('div', model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        h('div', model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        Counter.view({
            model: model.counter,
            dispatch: router.bindEffect(action =>
                dispatch({ type: COUNTER_UPDATE, payload: action })
            )
        })
    ]);
}

function update(model, action: Action) {
    switch (action.type) {
        case COUNTER_UPDATE:
            return {
                ...model,
                counter: Counter.update(model.counter, action.payload)
            };
        case INC_AT:
            return { ...model, incAt: action.payload };
        case DEC_AT:
            return { ...model, decAt: action.payload };
        default:
            return model;
    }
}

export default {
    init,
    view,
    update,
    actions: { COUNTER_UPDATE, INC_AT, DEC_AT }
};
