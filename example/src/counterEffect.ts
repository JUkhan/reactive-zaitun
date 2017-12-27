import { EffectSubscription } from '../../src/index';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';


import counter from './counter';


export class CounterEffect {
    constructor(es: EffectSubscription) {
        es.addEffect(effect$ =>
            effect$
                .whenAction(counter.actions.LAZY)
                .delay(1000)
                .map(action => ({ ...action, type: counter.actions.INCREMENT }))
        );
    }
}

export default CounterEffect;
