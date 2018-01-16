
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {filter} from 'rxjs/operator/filter';
import { Action } from './models';

export class Effect extends BehaviorSubject<Action>{
    constructor(){
        super({type:'initZaitun'});
    }
    dispatch(action){       
        this.next(action);
    }
    whenAction(...types):Observable<Action>{        
        return filter.call(this,((action)=>Boolean(types.find(type=>type===action.type))));
    }
}
export class EffectSubscription extends Subscription{
    private effect$:Effect;
    constructor(effect:Effect){
        super();  
        this.effect$=effect;      
    }    
    addEffect(streamCallback:(effect$:Effect)=>Observable<Action>){
        const effectStream=streamCallback(this.effect$);
        this.add(effectStream.subscribe(ac=>{
            if(typeof ac.dispatch==='function'){
                ac.dispatch(ac);
                this.effect$.dispatch(ac);
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
