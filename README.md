# reactive-zaitun
Zaitun is a functional reactive framework for front-end application development either in JavaScript or a language like TypeScript that compiles to JavaScript.

Zaitun uses [Elm Architecture](https://guide.elm-lang.org/architecture/) for component development and [Rxjs](http://reactivex.io/rxjs/) to make the component reactive and [Snabbdom](https://github.com/snabbdom/snabbdom) to render the view of a component

## Quick start
```sh
git clone https://github.com/JUkhan/zaitun-starter-kit-typescript.git quickstart
cd quickstart
npm install
npm start
npm run build:prod
Browse http://localhost:8080

npm run test
```

## The Basic Pattern
The logic of every Zaitun component will break up into three cleanly separated parts:

- `init` - the state of your component(to create a state from scratch)
- `view` - a way to view your state as HTML
- `update` - a way to update your state

Zaitun allows a functional way or an Object-oriented way to develop a component.

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

import {Action, ViewObj} from 'zaitun';
import { span, button } from 'zaitun/dom';

const INCREMENT='inc';
const DECREMENT='dec';

function init() {
    return { count: 0}
}
function view({ model, dispatch }:ViewObj) {

    return span([
        button({
            on: {
                click: e => dispatch({ type: INCREMENT })
            }
        }, '+'),        
        button({
            on: {
                click: e => dispatch({ type: DECREMENT })
            }
        },'-'),
        span(model.count)
    ]);
}
function update(model: any, action: Action) {

    switch (action.type) {
        case INCREMENT: return { count: model.count + 1};
        case DECREMENT: return { count: model.count - 1};            
        default:return model;
    }
}
export default { init, view, update, actions:{INCREMENT, DECREMENT } }


```

The counter component is defined by the following properties
- Model : initial state coming from init function {count:0}
- View : provides the user with 2 buttons in order to increment/decrement a counter , and a text that shows the current count.
- Update : sensible to 2 actions : INCREMENT and DECREMENT that increments or decrements the counter value 

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

What's happen when we call the bootstrap method - passing `Counter` as a main component ?

Ans: Zaitun first call the `init` function of `Counter` componet with 3 params(dispatch, routeParams, router). Please keep going on - ignore the params for this time being.

Then the `view` function should be called with a single param. The param's type is `ViewObj` and it has three props`{model, dispatch, router}`. Here `model` is exactly what came from calling `init` function:`{count:0}`. When the `view` function return - it should be rendered into the browser and waiting for whether any `action` is being dispatch. 

If you click on the `+` button, it calls the `dispatch` function with `action` param: `dispatch({type:INCREMENT})`. After calling `dispatch` the `update` function should be called with 2 params `model` and `action`.The `action` param should be exactly what you passed into the `dispatch:{type:INCREMENT}` function and the model should be `{count:0}`, Now the `update` function will return a brand new model:`{count:1}`.

After that the `view` function should be called with the updated `model:{count:1}` and the component should be re-render

We can explain this in a short way like bellow:

### click on the `+` button:

>dispatch({type:INCREMENT}) `=={count:0}==>` update(model, action) `=={count:1}==>` view({model, dispatch, router})

### click on the `+` button:

>dispatch({type:INCREMENT}) `=={count:1}==>` update(model, action) `=={count:2}==>` view({model, dispatch, router})

### click on the `-` button:

>dispatch({type:DECREMENT}) `=={count:2}==>` update(model, action) `=={count:1}==>` view({model, dispatch, router})

## Note
The view/update are both pure functions, they have no dependency on any external environment besides their input. The counter component itself doesn’t hold any state or variable, it just describes how to construct a view from a given state, and how to update a given state with a given action. Thanks to its purity, the counter component can be easily plugged into any environment that is able to supply it with its dependencies : a state  and an action.

## Adding side effects to the dispatched actions

There are several of ways to integrate effects in our application. One of them is to add effects into the `afterViewRender` life cycle hook method

```javascript
function afterViewRender(dispatch:Dispatch, router: Router, model) {
   
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
function view({ model, dispatch }:ViewObj) {

   return span([
        button({
            on: {
                click: e => dispatch({ type: INCREMENT })
            }
        }, '+'),
        button({
            on: {
                click: e => dispatch({ type: LAZY }, true)
            }
        }, '+ (Async)'),
        button({
            on: {
                click: e => dispatch({ type: DECREMENT })
            }
        },'-'),
        span(model.msg || model.count)
    ]);
}

```
added a new button `h('button', { on: { click: e => dispatch({ type: LAZY }, true) } }, '+ (Async)')` and also updated the result span by a conditional msg: `h('span', model.msg || model.count)`

Please look at here `dispatch({ type: LAZY }, true)`. We are passing 2 params to call the `dispatch` function. Second param is optional(`by default false`). You must set `true` if you need an action to work with effects. If you call the `dispatch` function passing the second param as `true`, the `action` should be broadcast through out the application to work with effects where ever found

We are going to render the `loading...` message when user click on `+(Async)` button. So we need to change the `update` function accordingly

```javascript
function update(model: any, action: Action) {

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

import {Action, Router, ViewObj} from 'zaitun';
import { span, button } from 'zaitun/dom';

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

function view({ model, dispatch }:ViewObj) {

   return span([
        button({
            on: {
                click: e => dispatch({ type: INCREMENT })
            }
        }, '+'),
        button({
            on: {
                click: e => dispatch({ type: LAZY }, true)
            }
        }, '+ (Async)'),
        button({
            on: {
                click: e => dispatch({ type: DECREMENT })
            }
        },'-'),
        span(model.msg || model.count)
    ]);
}
function update(model: any, action: Action) {

    switch (action.type) {
        case INCREMENT: return { count: model.count + 1, msg: ''};
        case DECREMENT: return { count: model.count - 1, msg: ''};
        case LAZY:return { ...model, msg: 'loaading...' };       
        default:return model;
    }
}
export default { init, view, update, afterViewRender, actions:{INCREMENT, DECREMENT, LAZY } }

```
When we click on the `+(async)` button it will display 'loading...' message for a while and then a incremented counter value should be displayed.

Also we can define a separate effect file (eg. `counterEffect.ts`)

```javascript

import { Router, EffectSubscription } from 'zaitun';
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
Or we can add this `counterEffect` into the `main.ts` file. 
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

The `Parent` component is defined in its own module `parent.ts`
```javascript

import { Router,Action, ViewObj } from 'zaitun';
import {div, h3} from 'zaitun/dom';

import Counter from './counter';

const COUNTER_UPDATE='counterUpdate';
const INC_AT='incAt';
const DEC_AT='decAt';

function init(){
    return {counter:Counter.init(), incAt:null, decAt:null}
}

function view({model, dispatch, router}:ViewObj){   
    return div([
        h3('Parent Component'),
        div(model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        div(model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        Counter.view({
            model: model.counter,
            dispatch: action =>
                dispatch({ type: COUNTER_UPDATE, payload: action })
            
        })
    ]);
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

Now question is how to make the effects workable?

Ans: Please look at the `Parent` component's `view` function bellow --where we called the `Counter.view()` function with `model` and `dispatch`. Our problem will be resolved if we pass the counter `dispatch` through out the `router.bindEffect(dispatch)` function
```javascript

function view({model, dispatch, router}:ViewObj){   
    return div([
        h3('Parent Component'),
        div(model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        div(model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        Counter.view({
            model: model.counter,
            dispatch: action =>
                dispatch({ type: COUNTER_UPDATE, payload: action })
            
        })
    ]);
}

```
This is the resolved version of the `Parent` component't view function

```javascript

function view({model, dispatch, router}:ViewObj){   
    return div([
        h3('Parent Component'),
        div(model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        div(model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        Counter.view({
            model: model.counter,
            dispatch: router.bindEffect(action =>
                dispatch({ type: COUNTER_UPDATE, payload: action })
            )
        })
    ]);
}

```
now the `+(async)` function is working as expected

`Last incremented at:` and `Last decremented at` times are still remained


May be you are thinking that we need to add two more effects one for `INCREMENT` and another for `DECREMENT` actions.

Yep, your thinking is right.You are awesome:)

Let's go to the `counterEffect.ts` and add the effects:

```javascript

import { Router, EffectSubscription } from 'zaitun';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import {empty} from 'rxjs/observable/empty';

import counter from './counter';
import parent from './parent';

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
                router.dispatch({type:parent.actions.INC_AT, payload:new Date().toString()});
                return empty();
             })
        ).addEffect(eff=>
            eff.whenAction(counter.actions.DECREMENT)
             .mergeMap(action=>{
                router.dispatch({type:parent.actions.DEC_AT, payload:new Date().toString()});
                return empty();
             })
        )  
    }
}

export default CounterEffect;

```
click on the `+(async)` button:wow cool! `Last incremented at:...` has been shown afet 1000ms

Click on the `+` button: oops! `Last incremented at:...` not showing

Click on the `-` button: oops! `Last decremented at:...` not showing - `could you think what is the reasoning behind this!!`

Yes of course we need to set the the second params of the `dispathch` function as `true`. So that these actions(`INCREMENT`,`DECREMENT`) should be exposed to work with effects 

```javascript
function view({ model, dispatch }:ViewObj) {

    return span([
        button({
            on: {
                click: e => dispatch({ type: INCREMENT }, true)
            }
        }, '+'),
        button({
            on: {
                click: e => dispatch({ type: LAZY }, true)
            }
        }, '+ (Async)'),
        button({
            on: {
                click: e => dispatch({ type: DECREMENT }, true)
            }
        },'-'),
        span(model.msg || model.count)
    ]);
}

```
Now everything is going on well:)


## ROUTING - learn to navigate among the views(components)

Zaitun provides a `Router` service. We can dynamiclly add/remove routes and navigate to the views(components).

This is just like parent child relation that we have been learned before. Here child would come form the `Router` after clicking on the navigation or calling router.navigate(path) function.

From the parent child relation we learned two things:

1. call the child `view` function from the parent `view` function
2. call the child `update` function from the parent `update` function ` and the job is done`
here child `view` coming from `router.viewChild(...)` and child `update` coming from `router.updateChild(...)` functions and we are going to develop a `RootComponent` that will act as a parent



The RootComponent is defined in its own module `rootComponent.ts`

```javascript

import {Router, ViewObj} from 'zaitun';
import {div, h3, nav, a, ul, li} from 'zaitun/dom';
const CHILD = Symbol('CHILD');

function init() {
    return {      
        menu: [
            { path: 'page1', text: 'Page1' },
            { path: 'page2', text: 'page2' },
            { path:'page3/5/My favourite fruits', text:'page3'},
            { path: 'counter', text: 'Counter' }, 
            { path: 'parent', text: 'Parent' },           
        ]
    };
}

function view({ model, dispatch, router }:ViewObj) {
    return div( [
        topMenu(model.menu, router),
        h3( 'Root Component'),        
        div(
            router.viewChild({
                model: model.child,
                router,
                dispatch: action => dispatch({ type: CHILD, payload: action })
            })
        )
    ]);
}

function update(model, action, router:Router) {

    switch (action.type) {
        //note: here router.updateChild(...) must set with 'child' property of the model
        case CHILD: return { ...model,  child: router.updateChild(model.child, action.payload) };       
        default:return model;
    }
}

function topMenu(model, router) {
    return nav('.navbar.navbar-expand-sm.bg-dark navbar-dark',
        [ 
            a('.navbar-brand', { props: { href: '/counter' } }, 'Zaitun'),
            ul('.navbar-nav',model.map(nav =>li('.nav-item',{
                                class: {active:router.activeRoute.navPath === nav.path }
                            },
                            a('.nav-link',{ props: { href:  nav.path } }, nav.text )                            
                        )
                    )
                )
        ]);  
}

export default { init, view, update}

```
Now our `RootComponent` is ready - here a dynamic menu would be generated. So that we can easily navigate to pages/components. Please look at the `RootComponent` component's `init` function. you will find five menu items. Now our job should be to develop some components based on this menu items. Two of them (`counter`and `parent` components) already has been developed in the pervious section - rest of three we will develop one after another and be familier about verious features of router service

First one is `page1` component is defined in its own module `page1.ts`
```javascript

import { h } from 'zaitun';

function view(){
    return h('h3', 'Page-1')
}

export default {view}
```
`page1` component just display the 'Page-1' text

Now update the `main.ts` file like bellow:

```javascript
import {bootstrap, RouteOptions} from 'zaitun';

import rootCom  from './rootComponent';
import page1 from './page1'; 

const routes:RouteOptions[]=[
    {path:"page1", component:page1}
  ];
  
  bootstrap({
      containerDom:'#app',
      mainComponent:rootCom,  
      routes:routes,
      activePath:'page1'
    });
```
Our app is running and showing a menu bar, 'Root Component' text and also the `page1` component's content because we set the `activePath:'page1'`.

Now we develop `page2` component as:

```javascript

import {h3} from 'zaitun/dom';

function view(){
    return h3('Page-2')
}

export default {view}
```
As our application is growing up - we are developing many many pages. If we import everything in `main.ts` file, file size should be bigger and the application takes times to load the bigger file.

Webpack is awesome. It has lazy loading feature `System.import('path')`, So we will apply this function into out route option loadComponent as : `loadComponent:()=>System.import('./page2')`

Now update the `main.ts` file like bellow:

```javascript
import {bootstrap, RouteOptions} from 'zaitun';

import rootCom  from './rootComponent';
import page1 from './page1'; 
declare const System:any;

const routes:RouteOptions[]=[
    {path:"page1", component:page1},
    {path:"page2", loadComponent:()=>System.import('./page2')}
  ];
  
  bootstrap({
      containerDom:'#app',
      mainComponent:rootCom,  
      routes:routes,
      activePath:'page1'
    });
```
If you click on the 'page2' menu item, should see the page2 content

For page 3 we will define out route options path like: `path:'page3/:times/:title'`

Now look at the `rootComponent.ts` file's `init` function 3rd menu item defined as `{ path:'page3/5/My favourite fruits', text:'page3'}`.So if we click on the `page 3` a routeParams object like `{times:5, title:'My favourite fruits'}` should be provided as a second param of the `init` function of the `page3` component.

Although, we can pass data through the route config. This `data` option accepts two types of data `object|promise`. Navigation should be applied after the data resolved,

OK, update the `main.ts` file like bellow:

```javascript
import {bootstrap, RouteOptions} from 'zaitun';
declare const System:any;
import rootCom  from './rootComponent';
import page1 from './page1'; 

function getData(routeParams){
    return new Promise(accept=>{
        setTimeout(()=>{
            accept((new Array(routeParams.times))
                .fill('fruit-')
                .map((fruit,i)=>fruit+i)
            )
        }, 1000);
    })
}

const routes:RouteOptions[]=[
    {path:"page1", component:page1},
    {path:"page2", loadComponent:()=>System.import('./page2')},
    {path:"page3/:times/:title", data:getData, loadComponent:()=>System.import('./page3')}
  ];
  
  bootstrap({
      containerDom:'#app',
      mainComponent:rootCom,  
      routes:routes,
      activePath:'page1'
    });
```

and develop the `page3` component like bellow:

```javascript
import {Router} from 'zaitun';
import {div, ol, li} from 'zaitun/dom';

function init(dispatch, routeParams, router:Router) {   
    return {
        title:routeParams.title ,     
        data:router.activeRoute.data
    };
}

function view({ model, dispatch, router }) {

    return div([
        div(model.title),
        ol(model.data.map(fruit=>li(fruit)))
    ])
}

export default { init, view}


```
If you click in the `page3` menu item- you can see the title and fruits list after 1 second. because we set the timeout function 1 sec delay to resolve the data.

Now remaining `counter` and `parent`.

Let's add the routes into the `main.ts` file like:
```javascript

const routes:RouteOptions[]=[
    {path:"page1", component:page1},
    {path:"page2", loadComponent:()=>System.import('./page2')},
    {path:"page3/:times/:title", data:getData, loadComponent:()=>System.import('./page3')},
    {path:"counter", loadComponent:()=>System.import('./counter')},
    {path:"parent", loadComponent:()=>System.import('./parent')}
  ];

```
So far I can remember, we have been developed effects into the `counterEffect.ts` file and we configured the effects into the `main.ts` file - this is the latest status what we done  in the effect section.

If we do the same thing in this scenaio when our application has multiple pages, it would not work properly.

`One thing we need to remember that effect instance recreated when we change the navigation`

No problems! There are convenient ways to resolve this issue.

1. writing effects/attach the effect file into `afterViewInit` life cycle hook function

2. resolve the effect service into the route configaration. We have two options for this(effects:[]|loadEffects:[]) just like (component|loadComponent)

Please have look at the following example:

```javascript
const routes:RouteOptions[]=[
    {path:"page1", component:page1},
    {path:"page2", loadComponent:()=>System.import('./page2')},
    {path:"page3/:times/:title", data:getData, loadComponent:()=>System.import('./page3')},
    {path:"counter", loadEffects:[()=>System.import('./counterEffect')], loadComponent:()=>System.import('./counter')},
    {path:"parent", loadEffects:[()=>System.import('./counterEffect')],  loadComponent:()=>System.import('./parent')}
  ];

```
Now effects should work properly

As we have `RootComponent` and multiple pages. We can move the `last incremented at:` and `last decremented at:` messages from the `parent` component to the `RootComponent` and also move the related effects from `counterEffect` service to the `afterChildRender` life cycle hook function of the `RootComponent`

 `Rootcomponent`  should look like:
```javascript
import {Router, ViewObj, Dispatch} from 'zaitun';
import {div, h3, nav, a, ul, li} from 'zaitun/dom';

import 'rxjs/add/operator/mergeMap';
import {empty} from 'rxjs/observable/empty';
import counter from './counter';

const CHILD = Symbol('CHILD');
const INC_AT='incAt';
const DEC_AT='decAt';

function init() {
    return { 
        incAt:null, decAt:null,     
        menu: [
            { path: 'page1', text: 'Page1' },
            { path: 'page2', text: 'page2' },
            { path:'page3/5/My favourite fruits', text:'page3'},
            { path: 'counter', text: 'Counter' }, 
            { path: 'parent', text: 'Parent' },           
        ]
    };
}
function afterChildRender(dispatch:Dispatch, router:Router){
    router.effect$.addEffect(eff=>
            eff.whenAction(counter.actions.INCREMENT)
             .mergeMap(action=>{
                dispatch({type:INC_AT, payload:new Date().toString()});
                return empty();
             })
        ).addEffect(eff=>
            eff.whenAction(counter.actions.DECREMENT)
             .mergeMap(action=>{
                dispatch({type:DEC_AT, payload:new Date().toString()});
                return empty();
             })
        )  
}
function view({ model, dispatch, router }:ViewObj) {
    return div( [
        topMenu(model.menu, router),
        h3( 'Root Component'),
        div(model.incAt ? 'Last incremented at: ' + model.incAt : ''),
        div( model.decAt ? 'Last decremented at: ' + model.decAt : ''),
        div(
            router.viewChild({
                model: model.child,
                router,
                dispatch: action => dispatch({ type: CHILD, payload: action })
            })
        )
    ]);
}

function update(model, action:Action, router:Router) {

    switch (action.type) {
        case CHILD: return { ...model,  child: router.updateChild(model.child, action.payload) };  
        case INC_AT: return {...model, incAt:action.payload}
        case DEC_AT: return {...model, decAt:action.payload}     
        default:return model;
    }
}

function topMenu(model, router) {
    return nav('.navbar.navbar-expand-sm.bg-dark navbar-dark',
        [ 
            a('.navbar-brand', { props: { href: '/counter' } }, 'Zaitun'),
            ul('.navbar-nav',model.map(nav =>li('.nav-item',{
                                class: {active:router.activeRoute.navPath === nav.path }
                            },
                            a('.nav-link',{ props: { href:  nav.path } }, nav.text )                            
                        )
                    )
                )
        ]);
}

export default { init, view, update, afterChildRender}

```
Now these two messages should be appear every page.Cool! 

## Navigation Guards 
Route configuration also have `canActivate` and `canDeactivate` options - apply the following example

- `canActivate`  - Decides if a route can be activated
- `canDeactivate` - Decides if a route can be deactivated

>These two methods return `boolen` | `Promise<boolean>`

```javascript 
class AuthService{
  canActivate(router){ 
    //return new Promise(accept=>accept(true));
    return confirm('are your 18+ ?')  
  }
  canDeactivate(component, router){ 
    //return component.canDeactivate();
    return confirm('Do you realy want to leave ?')
  }
}

const routes=[
  {path:'/page2',canActivate:AuthService, loadComponent:()=>System.import('./page2')}, 
  {path:'/parent', canDeactivate:AuthService, loadComponent:()=>System.import('./parent')}
  
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
});

```
### `hash` / `history` type Examples


&lt;a class="nav-link" href="counter"&gt;Counter&lt;/a&gt;

&lt;a class="nav-link" href="/counter/12"&gt;Counter&lt;/a&gt;

&lt;a class="nav-link" href="/counter?foo=bar"&gt;Counter&lt;/a&gt;



```javascript
// begining slash is optional
    router.navigate('count/12') 
    router.navigate('/count') 
    router.navigate('/count?foo=bar')
```
### Cache
Zaitun provides convenient way to cache your application/page/component

You may set the cacheStrategy:'local'|'session'|'default' into the bootstrap configuration options

Caching should not be applied if you set the cache proerty true of the route configuration. Route configuration also has `cacheStrategy` property.

Component should have a `onCache(model:any):model` life cycle hook method that should be fired if the component configuard as cacheable, thats provides convinient way to update the model in your cases.

## onDestroy

Component should have a `onDestroy` life cycle hook method that should be fired on the time of navigation changing 




