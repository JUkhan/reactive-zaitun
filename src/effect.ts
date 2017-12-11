import {Router} from './router';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {filter} from 'rxjs/operator/filter';
import { Action } from './componentManager';

export class Effect extends Subject<Action>{
    dispatch(action){       
        this.next(action);
    }
    whenAction(...types):Observable<Action>{        
        return filter.call(this,((action)=>Boolean(types.find(type=>type===action.type))));
    }
}
export class EffectSubscription extends Subscription{
    constructor(){
        super();        
    }    
    addEffect(streamCallback:(effect$:Effect)=>Observable<Action>){
        const effectStream=streamCallback(Router.effect$);
        this.add(effectStream.subscribe(ac=>{
            if(typeof ac.dispatch==='function'){
                ac.dispatch(ac);
                Router.effect$.dispatch(ac);
            }
        }));
        return this;
    }    
    dispose(){
        if(!this.closed){            
            this.unsubscribe();
        }
    }
}
