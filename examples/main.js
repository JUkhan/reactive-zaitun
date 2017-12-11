var zaitun=require('../index');
var h=zaitun.h;

import 'rxjs/add/operator/map';

class Counter {
  
  constructor() {
    this.es = new zaitun.EffectSubscription();
  }
  init() {
    return { count: 0 };
  }
  afterViewRender() {
    this.es.addEffect(effect$ =>
      effect$
        .whenAction('lazy')
        //.delay (1000)
        .map(action => {
          action.type = 'inc';
          return action;
        })
    );
  }
  onDestroy() {
    this.es.dispose();
  }
  view({ model, dispatch }) {
    return h('div', 'count: ' + model.count);
  }
  update(model, action) {
    switch (action.type) {
      case 'inc':
        return { count: model.count + 1, msg: '' };
      case 'dec':
        return { count: model.count - 1, msg: '' };
      case 'lazy':
        return { count: model.count, msg: 'loaading...' };
      default:
        return model;
    }
  }
}

zaitun.bootstrap ({
  containerDom: '#app',
  mainComponent: Counter,
});