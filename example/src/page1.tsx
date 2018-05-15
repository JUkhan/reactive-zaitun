import { ViewObj, Router, Action } from 'zaitun';
import { html } from 'snabbdom-jsx';

import { of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';
import { Effect} from 'zaitun-effect';



function init() {
    
    return { boxList: [] }
}
function afterViewRender(dispatch, router: Router) {
    router.
        addEffect((eff: Effect) =>
            eff.whenAction('mousemove')
                .pipe(
                    delay(0),
                    mergeMap((action: Action) => {
                        const ev = action.payload;
                        action.payload = {
                            key: Math.floor(Math.random() * 1000000),
                            style: {
                                opacity: '0', transition: 'opacity 1s',
                                delayed: { opacity: '1' },
                                remove: { opacity: '0' },
                                width: '20px',
                                height: '20px',
                                top: (ev.clientY - 7) + 'px',
                                left: (ev.clientX - 12) + 'px',
                                position: 'absolute',
                                backgroundColor: `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`,
                                borderRadius: '.4em',
                                boxShadow: `-7px -8px 6px -7px rgba(${random(0, 255)},${random(0, 255)},${random(0, 255)},0.75)`
                            }
                        };
                        action.type = 'new-box'
                        return of(action);
                    })
                )
        );
}
function random(low, high) {
    return Math.floor(Math.random() * (high - low + 1)) + low;
}
function view({ model, dispatch }: ViewObj) {
    return <div on-mousemove={ev => dispatch({ type: 'mousemove', payload: ev }, true)}
        style={{ width: '100%', height: '400px', border: '#ddd 1px solid' }}>
        {model.boxList.map(box => <div key={box.key} style={box.style}></div>)}
    </div>
}

function update(model, action) {
    switch (action.type) {
        case 'new-box':
            model.boxList.push(action.payload);
            if (model.boxList.length > 25) {
                model.boxList.shift();
            }
            return { boxList: [...model.boxList] };
        default:
            return model;
    }
}


export default { view, update, init, afterViewRender };
