
import {Subscription, Observable, BehaviorSubject} from 'rxjs';
import {filter} from 'rxjs/operators';


export class Effect extends BehaviorSubject<any>{
    constructor(){
        super({type:'initZaitun'});
    }
    dispatch(action){       
        this.next(action);
    }
    whenAction(...types):Observable<any>{        
        return this.pipe(filter(((action)=>Boolean(types.find(type=>type===action.type)))));
    }
}
export class EffectSubscription extends Subscription{
    private effect$:Effect;
    constructor(effect:Effect){
        super();  
        this.effect$=effect;      
    }    
    addEffect(streamCallback:(effect$:Effect)=>Observable<any>){
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

export class EffectManager{
    effect():Effect{
        return new Effect();
    }
    subscription(effect:any):EffectSubscription{
        return new EffectSubscription(effect);
    }
}