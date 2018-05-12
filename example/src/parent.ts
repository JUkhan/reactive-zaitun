import { Action, ViewObj } from 'zaitun';
import {div, h3} from 'zaitun/dom';

import Counter from './counter';

const COUNTER_UPDATE = 'counterUpdate';
const INC_AT = 'incAt';
const DEC_AT = 'decAt';

function init() {
    return { counter: Counter.init(), incAt: null, decAt: null };
}

function view({ model, dispatch, router }:ViewObj) {
    return div([
        h3('Parent Component'),
        div(model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        div(model.decAt ? 'Last decremented at: ' + model.decAt : ''),
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
