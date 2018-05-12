# zaitun-effect
rxjs middleware for zaitun

## Install
```sh
npm install --save zaitun-effect

```

## Uses

```javascript
import {EffectManager, Effect} from 'zaitun-effect';

bootstrap({
    containerDom: '#app',    
    effectManager:EffectManager
});

function afterChildRender(dispatch: Dispatch, router: Router) {
    router
        .addEffect((eff:Effect) =>
            eff.whenAction(counter.actions.INCREMENT)
                .pipe(
                    mergeMap(action => {
                        dispatch({ type: INC_AT, payload: new Date().toString() });
                        return empty();
                    }))
        )
        .addEffect((eff:Effect) =>
            eff.whenAction(counter.actions.DECREMENT)
                .pipe(
                    mergeMap(action => {
                        dispatch({ type: DEC_AT, payload: new Date().toString() });
                        return empty();
                    }))
        );
    
}

```
