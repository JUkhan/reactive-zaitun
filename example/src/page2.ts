import { Action, ViewObj, Router } from 'zaitun';
import { div, h4, a, input, ul, li, span } from 'zaitun/dom';

import { from} from 'rxjs';
import {
    map,
    debounceTime,
    tap,
    filter,
    switchMap,
    distinctUntilChanged
} from 'rxjs/operators';


const SEARCH = 'search';
const SEARCH_RESULT = 'search result';

function init() {
    return { data: null, search: '', msg: '' }
}

function afterViewRender(dispatch, router: Router) {

    router.addEffect(eff$ =>
        eff$.whenAction(SEARCH)
            .pipe(
            debounceTime(500),
            distinctUntilChanged(),
            filter((action:Action) => action.payload.length > 1),
            switchMap((action:Action) =>
                from(
                    fetch(`https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=${action.payload}&limit=5`)
                        .then(res => res.json()))
                    .pipe(
                    tap(console.log),
                    map(res => ({ ...action, type: SEARCH_RESULT, payload: res }))
                    )
            ))
    )
}

function view({ model, dispatch }: ViewObj) {
    var res = [];
    if (model.data) {
        res.push(div('.card', div('.card-body', [
            h4('.card-title', model.data[0]),
            ul('.list-group', model.data[1].map(_ => li('.list-group-item.list-group-item-success', _))),
            ul('.list-group', model.data[2].map(_ => li('.list-group-item.list-group-item-info', _))),
            div('.list-group', model.data[3].map(_ => a('.list-group-item.list-group-item-action', { props: { href: _ } }, _)))
        ])));

    }
    return div([
        input({
            props: { type: 'text', value: model.search, placeholder: 'wiki search...' },
            on: { input: (ev: any) => dispatch({ type: SEARCH, payload: ev.target.value }, true) }
        }
        ),
        span(model.msg),
        div(res)
    ]);
}

function update(model, action: Action) {
    switch (action.type) {
        case SEARCH: return { ...model, search: action.payload, msg: action.payload ? 'loading...' : '' }
        case SEARCH_RESULT: return { ...model, data: action.payload, msg: '' }
        default: return model;
    }
}

export default { init, view, update, afterViewRender };
