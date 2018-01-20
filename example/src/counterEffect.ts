import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';


import counter from './counter';
import { Router } from '../../src/router';


export class CounterEffect {
    constructor(router:Router) {
        router.addEffect(effect$ =>
            effect$
                .whenAction(counter.actions.LAZY)
                .delay(1000)
                .map(action => ({ ...action, type: counter.actions.INCREMENT }))
        );

        
    }
}

export default CounterEffect;
