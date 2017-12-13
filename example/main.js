var zaitun = require ('../index');
var h = zaitun.h;

require ('rxjs/add/operator/map');
require ('rxjs/add/operator/delay');
class Counter {
  constructor () {}
  init () {
    return {count: 0};
  }
  afterViewRender (dispatch, router) {
    router.effect$
      .addEffect (effect$ =>
        effect$.whenAction ('lazy').delay (1000).map (action => {
          action.type = 'inc';
          return action;
        })
      )
      .addEffect (action$ =>
        action$.whenAction ('inc').delay (500).map (action => {
          action.type = 'dec';
          return action;
        })
      );
  }
  onDestroy () {}
  view({model, dispatch}) {
    return h ('div', [
      h ('button', {on: {click: e => dispatch ({type: 'inc'})}}, '+'),
      h ('button', {on: {click: e => dispatch ({type: 'lazy'})}}, '+ (async)'),
      h ('button', {on: {click: e => dispatch ({type: 'dec'})}}, '-'),
      h ('span', model.msg || model.count),
    ]);
  }
  update (model, action) {
    switch (action.type) {
      case 'inc':
        return {count: model.count + 1, msg: ''};
      case 'dec':
        return {count: model.count - 1, msg: ''};
      case 'lazy':
        return {count: model.count, msg: 'loaading...'};
      default:
        return model;
    }
  }
}

zaitun.bootstrap ({
  containerDom: '#app',
  mainComponent: Counter,
  devTool:true
});
