# reactive-zaitun
Zaitun is a functional reactive framework for front-end application development either in JavaScript or a language like TypeScript that compiles to JavaScript.

Zaitun uses [Elm Architecture](https://guide.elm-lang.org/architecture/) for component development and [Rxjs](http://reactivex.io/rxjs/) to make the component reactive and [Snabbdom](https://github.com/snabbdom/snabbdom) to render the view of a component



## The Basic Pattern
The logic of every Zaitun component will break up into three cleanly separated parts:

- `init` - the state of your component(to create a state from scratch)
- `view` - a way to view your state as HTML
- `update` - a way to update your state

Zaitun allows a functional way or a Object-oriented way to develop a component.

Functional way

```javascript
function init(){

}
function view({model, dispatch}){

}
function update(model, action){

}

```
Object-oriented way

```javascript
class Component{
    init(){

    }
    view({model, dispatch}){

    }
    update(model, action){

    }
}

```
`All the examples here in this tutorial goes through functional way`

## A basic counter component
The counter component is defined in its own module ‘counter.ts’
```javascript

import {h, Action} from 'zaitun';

const INCREMENT='inc';
const DECREMENT='dec';

function init() {
    return { count: 0}
}
function view({ model, dispatch }) {

    return h('span', [
        h('button', { on: { click: e => dispatch({ type: INCREMENT }) } }, '+'),       
        h('button', { on: { click: e => dispatch({ type: DECREMENT }) } }, '-'),
        h('span', model.msg || model.count)
    ]);
}
function update(model?: any, action?: Action) {

    switch (action.type) {
        case INCREMENT: return { count: model.count + 1, msg: ''};
        case DECREMENT: return { count: model.count - 1, msg: ''};            
        default:return model;
    }
}
export default { init, view, update, afterViewRender, actions:{INCREMENT, DECREMENT } }


```

The counter component is defined by the following properties
- Model : initial state coming from init function {count:0}
- View : provides the user with 2 buttons in order to increment/decrement a counter , and a text that shows the current count.
- Update : sensible to 2 actions : INC and DEC that increments or decrements the counter value 

## Run the Counter component -  'main.ts'
```javascript

import {bootstrap} from 'zaitun';
import Counter from './counter';

 bootstrap({
  containerDom:'#app',
  mainComponent:Counter,
  devTool:true
});

```
## Component life cycle

What's happen when we call the bootstrap method - passing `Counter` as a main component ?

Ans: Zaitun first call the `init` function of `Counter` componet with 3 params(dispatch, routeParams, router). Please keep going on - ignore the params for this time being.

Then the `view` function should be called with a single param. The param's type is `object` and it has three props`{model, dispatch, router}`. Here `model` is exactly what came from calling `init` function:`{count:0}`. When the `view` function return - it should be rendered into the browser and waiting for whether any `action` is being dispatched. 

If you click on the `+` button, it calls the `dispatch` function with `action` param: `dispatch({type:INCREMENT})`. After calling `dispatch` the `update` function should be called with 2 params `model` and `action`.The `action` param should be exactly what you passed into the `dispatch:{type:INCREMENT}` function and the model should be `{count:0}`, Now the `update` function will return a brand new model:`{count:1}`.

After that the `view` function should called whth the updated `model:{count:1}` and the component should be re-render

### click on the `+` button:

>dispatch({type:INCREMENT}) `=={count:0}==>` update(model, action) `=={count:1}==>` view({model, dispatch, router})

### click on the `+` button:

>dispatch({type:INCREMENT}) `=={count:1}==>` update(model, action) `=={count:2}==>` view({model, dispatch, router})

### click on the `-` button:

>dispatch({type:DECREMENT}) `=={count:2}==>` update(model, action) `=={count:1}==>` view({model, dispatch, router})

## Note
The view/update are both pure functions, they have no dependency on any external environment besides their input. The counter component itself doesn’t hold any state or variable, it just describes how to construct a view from a given state, and how to update a given state with a given action. Thanks to its purity, the counter component can be easily plugged into any environment that is able to supply it with its dependencies : a state  and an action.

## How to make your application more reactive adding side effects against a dispatched action

There are several ways to intigrate effects in your application. One of them is to add effects into the `afterViewRender` life cycle hook method

```javascript
function afterViewRender(dispatch, router: Router, model) {
   
        router.effect$
        .addEffect(effect$ =>
            effect$.whenAction(LAZY)
                .delay(1000)
                .map(action => ({ ...action, type: INCREMENT }))
        ); 
        
        /*
        you can make chain call of addEffect
            router.effect$
            .addEffect(...)
            .addEffect(...)
        */
}

```
Now see, what's happening after adding this effect - when `counter` component `dispatch` an action whose type is LAZY, that `action` should be caught by this effect and make `1000ms` delay and then `dispatch` a new `action` whose type is INCREMENT.

Here we go, change the `counter` component's `view` a bit
```javascript
function view({ model, dispatch }) {

    return h('div', [
        h('button', { on: { click: e => dispatch({ type: INCREMENT }) } }, '+'),
        h('button', { on: { click: e => dispatch({ type: LAZY }, true) } }, '+ (Async)'),
        h('button', { on: { click: e => dispatch({ type: DECREMENT }) } }, '-'),
        h('span', model.msg || model.count)
    ]);
}

```
added a new button `h('button', { on: { click: e => dispatch({ type: LAZY }, true) } }, '+ (Async)')` and also updated the result span by a conditional msg: `h('span', model.msg || model.count)`

Please look at here `dispatch({ type: LAZY }, true)`. We are passing 2 params to call the `dispatch` function. Second param is optional(`by default false`). You must set `true` if you need an action to work with effects. If you call the `dispatch` function passing the second param as `true`, the `action` should be broadcast through out the application to work with effects where ever found

We want that when user click on `+(Async)` button it will show `loading...` message. So we need to change the `update` function accordingly

```javascript
function update(model?: any, action?: Action) {

    switch (action.type) {
        case INCREMENT: return { count: model.count + 1, msg: ''};
        case DECREMENT: return { count: model.count - 1, msg: ''};
        case LAZY:return { ...model, msg: 'loaading...' };       
        default:return model;
    }
}

```
If we bring all the updates together our `counter` component looks like:

```javascript

import {h, Action, Router} from 'zaitun';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';

const INCREMENT='inc';
const DECREMENT='dec';
const LAZY='lazy';

function init() {
    return { count: 0, msg: '' }
}

function afterViewRender(dispatch, router: Router, model?) {
   router.effect$
        .addEffect(effect$ =>
            effect$.whenAction(LAZY)
                .delay(1000)
                .map(action => ({ ...action, type: INCREMENT }))
        ); 
              
}

function view({ model, dispatch }) {

    return h('span', [
        h('button', { on: { click: e => dispatch({ type: INCREMENT }) } }, '+'),
        h('button', { on: { click: e => dispatch({ type: LAZY }, true) } }, '+ (Async)'),
        h('button', { on: { click: e => dispatch({ type: DECREMENT }) } }, '-'),
        h('span', model.msg || model.count)
    ]);
}
function update(model?: any, action?: Action) {

    switch (action.type) {
        case INCREMENT: return { count: model.count + 1, msg: ''};
        case DECREMENT: return { count: model.count - 1, msg: ''};
        case LAZY:return { ...model, msg: 'loaading...' };       
        default:return model;
    }
}
export default { init, view, update, afterViewRender, actions:{INCREMENT, DECREMENT, LAZY } }

```
Also we can define a separate effect file (eg. `counterEffect.ts`)

```javascript

import { Router, EffectSubscription } from './lib';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import counter from './counter';

export class CounterEffect{
    constructor(es:EffectSubscription, router:Router){       
        es.addEffect(effect$ =>
            effect$.whenAction(counter.actions.LAZY)
                .delay(1000)
                .map(action => ({ ...action, type: counter.actions.INCREMENT }))
        )
    }
}

export default CounterEffect;

```

You may add the `counterEffect` into the `Counter` component like:

```javascript
import {CounterEffect} from './counterEffect';

function afterViewRender(dispatch, router: Router) {

   router.addEffectService(CounterEffect);
              
}

```
Or we can add this `counterEffect` into the `main.ts` file
In the `main.ts` file we call the `bootstrap` function.
And the `bootstrap` function return the `Router` object

```javascript
import {bootstrap} from 'zaitun';
import Counter from './counter';
import {CounterEffect} from './counterEffect';

 bootstrap({
  containerDom:'#app',
  mainComponent:Counter,
  devTool:true
}).addEffectService(CounterEffect);

```

There is another option to add the effect service, you may find into the routing discussion

> Zaitun uses [snabbdom](https://github.com/snabbdom/snabbdom)  to render view. So you can use markup function h(..) or [jsx](https://github.com/yelouafi/snabbdom-jsx) for view



 To see how our component can be tested; here is an example using the ‘tape’ testing library
 ```javascript

import test from 'tape';
import counter from './counter';

test('counter update function', (assert) => {
    
  var state = counter.init();
  state = counter.update(state, {type: 'inc'});
  assert.equal(state.count, 1);

  state = counter.update(state.count, {type: 'dec'});
  assert.equal(state.count, 0);

  assert.end();
});
 ```
## Nested Components(parent child relation)

May be you are thinking `oh come on -- this is easy job` - just do the two things:
1. call the child `view` function from the parent `view` function
2. call the child `update` function from the parent `update` function ` and the job is done`

If you are realy in this thinking, your thinking is right :)

Now we will develop a parent component such a way where our `Counter` component render as a `child` and also showing two messages:
1. `Last incremented at: date value`
2. `Last decremented at: date value`

The `Parent` component is defined in its own module ‘parent.ts’
```javascript

import { Router, h, Action } from 'zaitun';
import Counter from './counter';

const COUNTER_UPDATE='counterUpdate';
const INC_AT='incAt';
const DEC_AT='decAt';

function init(){
    return {counter:Counter.init(), incAt:null, decAt:null}
}

function view({model, dispatch, router}){   
    return h('div',[
        h('div', model.incAt?'Last incremented at: '+model.incAt:''),
        h('div', model.decAt?'Last decremented at: '+model.decAt:''),
        Counter.view({
                model:model.counter,
                dispatch: action=>dispatch({type:COUNTER_UPDATE, payload:action})
            })
    ])
}

function update(model, action:Action){
    switch (action.type) {
        case COUNTER_UPDATE: return {...model, counter:Counter.update(model.counter, action.payload)}            
        case INC_AT: return {...model, incAt:action.payload}
        case DEC_AT: return {...model, decAt:action.payload}
        default: return model;
        }
}

export default { init, view, update, actions:{COUNTER_UPDATE, INC_AT, DEC_AT} }
```
Update the `main.ts` file like bellow and save the file:

```javascript
import {bootstrap} from 'zaitun';
import parentComponent from './parent';
import {CounterEffect} from './counterEffect';

 bootstrap({
  containerDom:'#app',
  mainComponent:parentComponent,
  devTool:true
}).addEffectService(CounterEffect);

```
Nice, our app is showing the `counter` component and click on the `+` and `-` buttons - working fine.

Click on the `+(async)` button- it's only showing `loading...` text(effect is not working)

Now our question is how to make the effects workable?

Ans: Please look at the `Parent` component's `view` function bellow --where we called the `Counter.view()` function with `model` and `dispatch`. Our problem will be solved if we pass the counter `dispatch` through out the `router.bindEffect(dispatch)` function
```javascript

function view({model, dispatch, router}){   
    return h('div',[
        h('div', model.incAt?'Last incremented at: '+model.incAt:''),
        h('div', model.decAt?'Last decremented at: '+model.decAt:''),
        Counter.view({
                model:model.counter,
                dispatch: action=>dispatch({type:COUNTER_UPDATE, payload:action})
            })
    ])
}

```
This is the solved version of the `Parent` component't view function

```javascript

function view({model, dispatch, router}){   
    return h('div',[
        h('div', model.incAt?'Last incremented at: '+model.incAt:''),
        h('div', model.decAt?'Last decremented at: '+model.decAt:''),
        Counter.view({
                model:model.counter,
                dispatch: router.bindEffect(action=>dispatch({type:COUNTER_UPDATE, payload:action}))
            })
    ])
}

```
now the `+(async)` function is working as expected

`Last incremented at:` and `Last decremented at` times are still remained

Can you think how to get these times ?
May be you thought that we need to add two more effects one for `INCREMENT` and another for `DECREMENT` actions.

Yep, your thinking is right.You are awesome:)

Let's go to the `counterEffect.ts` and write our thought there:

```javascript

import { Router, EffectSubscription } from './lib';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {empty} from 'rxjs/observable/empty';

import counter from './counter';
import counterList from './counterList';

export class CounterEffect{
    constructor(es:EffectSubscription, router:Router){       
        es
        .addEffect(effect$ =>
            effect$.whenAction(counter.actions.LAZY)
                .delay(1000)
                .map(action => ({ ...action, type: counter.actions.INCREMENT }))
        ).addEffect(eff=>
            eff.whenAction(counter.actions.INCREMENT)
             .mergeMap(action=>{
                router.dispatch({type:counterList.actions.INC_AT, payload:new Date()});
                return empty();
             })
        ).addEffect(eff=>
            eff.whenAction(counter.actions.DECREMENT)
             .mergeMap(action=>{
                router.dispatch({type:counterList.actions.DEC_AT, payload:new Date()});
                return empty();
             })
        )  
    }
}

export default CounterEffect;

```
click on the `+(async)` button:wow cool! `Last incremented at:...` has been shown afet 1000ms

Click on the `+` button: oops! `Last incremented at:...` not showing

Click on the `-` button: oops! `Last decremented at:...` not showing - `could you think the reasoning behind of this!!`

Yes of course we need to set the the second params of the `dispathch` function as `true`. So that these actions(`INCREMENT`,`DECREMENT`) should be broad cast

```javascript
function view({ model, dispatch }) {

    return h('div', [
        h('button', { on: { click: e => dispatch({ type: INCREMENT },true) } }, '+'),
        h('button', { on: { click: e => dispatch({ type: LAZY }, true) } }, '+ (Async)'),
        h('button', { on: { click: e => dispatch({ type: DECREMENT }, true) } }, '-'),
        h('span', model.msg || model.count)
    ]);
}

```
Now everything is going on well:)

## ROUTING - learn to navigate among the views(components)

Zaitun provides a `Router` service. We can dynamiclly add/remove routes and navigate to the views(components).

This is just like parent child relation that we have been learned before. Here child would come form the `Router` after clicking on the navigation.

From the parent child relation we learned two things:

1. call the child `view` function from the parent `view` function
2. call the child `update` function from the parent `update` function ` and the job is done`
here child `view` coming from `router.viewChild(...)` and child `update` coming from `router.updateChild(...)` and we are going to develop a `RootComponent` that act as a parent



The RootComponent is defined in its own module `RootComponent.ts`

```javascript

import {Router} from 'zaitun';
const CHILD = Symbol('CHILD');

function init() {
    return {      
        menu: [
            { path: 'counter', text: 'Counter' },
            { path: 'counterList/5/test', text: 'Counter List' }            
        ]
    };
}

function view({ model, dispatch, router }) {
    return h('div', [
        topMenu(model.menu, router),       
        h('div', router.viewChild({ model: model.child, router, dispatch: action => dispatch({ type: CHILD, payload: action }) }))
    ])
}

function update(model, action, router) {

    switch (action.type) {
        case CHILD: return { ...model,  child: router.updateChild(model.child, action.payload) };       
        default:return model;
    }
}

function topMenu(model, router) {
    return h('nav.navbar.navbar-toggleable-md.navbar-inverse.fixed-top.bg-inverse', [
        h('a.navbar-brand', { props: { href: "#/counter" } }, 'Zaitun'),
        h('div.collapse.navbar-collapse#navbarCollapse',
            h('ul.navbar-nav.mr-auto',
                model.map(nav => h('li.nav-item', { class: { active: router.activeRoute.navPath === nav.path } }, [h('a.nav-link', { props: { href: '#/' + nav.path } }, nav.text)]))
            )
        )
    ])
}

export default { init, view, update, afterViewRender }

```
### Set mainCom and Configure routes
```javascript
import {bootstrap} from 'zaitun';

import {MainCom}  from './mainCom';
import Counter from './Counter'; 

const routes=[
    {path:"counter", component:Counter},
    {path:'counterList/:times/:msg',loadComponent:()=>System.import('./CounterList')},
    {path:'todos', loadComponent:()=>System.import('./todos/todos')},
    {path:'formExample', loadComponent:()=>System.import('./FormExample'), cache:true}
  ];
  
  bootstrap({
      containerDom:'#app',
      mainComponent:MainCom,  
      routes:routes,
      activePath:'counter'
});
```
The routes are an array of route definitions. This route definition has the following parts:

- `path` : the router matches this route's path to the URL in the browser address bar
- `component` :  the component that the component manager should create when navigating to this route
- `loadComponent` : the component dynamically loaded when navigating to this route
- `cache` : Component should be cached if it set to true

> `loadComponent` only workes in webpack when the component export as default

### Component Life cycle hook methods
```javascript    
    init(dispatch, routeParams){}
    afterViewRender(model, dispatch){}
    canDeactivate(){
        return bool|Promise
    }
    onDestroy(){}
```    
### `bootstrap` options

```javascript
    containerDom: string | any;
    mainComponent: any;
    routes?: Array<any>;
    activePath?: string;
    devTool?: any;
    locationStrategy?: 'hash' | 'history';
    baseUrl?: string;
    cacheStrategy?: 'session' | 'local' | 'default';
```

### `Route` options

```javascript
    path:string;    
    component?:any;
    loadComponent?:any;
    canActivate?:Function;
    canDeactivate?:Function;
    cache?:boolean;
    cacheUpdate_perStateChange?:boolean;
    cacheStrategy?: 'session' | 'local' | 'default';
```
### `Router` methods

```javascript
    navigate: (path: string) => void;
    add: (route: any) => void;
    remove: (path: string) => void;
    activeRoute: {
        routeParams: { },
        path: string,
        navPath: string,
        data: { }
    };
    CM: ref of ComponentManager;
```
### `ComponentManager(CM)` methods

```javascript
    child: {view, update};
    action$: any;
    json_parse:(data:any)=>any;
    json_stringify:(data:any)=>any;
    updateCache:()=>any;
```

### v1.6.3
Remove the `canDeactivate` life cycle hook method. Zaitun’s router provides a feature called Navigation Guards.

- `canActivate`  - Decides if a route can be activated
- `canDeactivate` - Decides if a route can be deactivated
>These two methods return `boolen` | `Promise<boolean>`
```javascript 
class AuthService{
    canActivate(router){ 
      return new Promise(accept=>accept(true));

    }
    canDeactivate(component, router){ 
      return component.canDeactivate();

    }
}

const routes=[
  {path:'/counter', component:counterCom},
  {path:'/counterList/:times/:msg', canDeactivate:AuthService, loadComponent:()=>System.import('./counterList')},
  {path:'/todos',canActivate:AuthService, loadComponent:()=>System.import('./todos/todos')}, 
  {path:'/animation', loadComponent:()=>System.import('./Animation')}, 
  {path:'/orderAnimation',loadComponent:()=>System.import('./OrderAnimation')},
  {path:'/heroAnimation',loadComponent:()=>System.import('./Hero')}
];


```   
Zaitun provides two types of `locationStrategy` 
- `hash` (default)
- `history`

```javascript
bootstrap({
  containerDom:'#app',
  mainComponent:Counter,
  locationStrategy:'history'//default is hash
  devTool:devTool
});

```
### `hash` type Example
&lt;a class="nav-link" href="#/counter"&gt;Counter&lt;/a&gt;

### `history` type Example
&lt;a class="nav-link" href="/counter"&gt;Counter&lt;/a&gt;

But For javascript it is same for both
```javascript
    Router.navigate('count')
```
### v1.6.5
update cache strategy. Please have a look at the `bootstrap` and `route` options and also the `ComponentManager(CM)` methods. Find the example from  [zaitun-starter-kit-typescript](https://github.com/JUkhan/zaitun-starter-kit-typescript)


