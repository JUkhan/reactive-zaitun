import { Subscription, Observable, BehaviorSubject } from 'rxjs';
export declare class Effect extends BehaviorSubject<any> {
    constructor();
    dispatch(action: any): void;
    whenAction(...types: any[]): Observable<any>;
}
export declare class EffectSubscription extends Subscription {
    private effect$;
    constructor(effect: Effect);
    addEffect(streamCallback: (effect$: Effect) => Observable<any>): this;
    dispose(): void;
}
export declare class EffectManager {
    effect(): Effect;
    subscription(effect: any): EffectSubscription;
}
