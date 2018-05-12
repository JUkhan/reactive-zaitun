import { Router } from 'zaitun';

import { delay, map } from 'rxjs/operators';
import { Effect } from 'zaitun-effect';

import counter from './counter';


export class CounterEffect {
    constructor(router: Router) {
        router.addEffect((effect: Effect) =>
            effect.whenAction(counter.actions.LAZY)
                .pipe(
                    delay(1000),
                    map(action => ({ ...action, type: counter.actions.INCREMENT }))
                ));
    }
}

export default CounterEffect;
