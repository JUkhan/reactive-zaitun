var zaitun = require ('../index');
var h = zaitun.h;
var assert = require ('assert');

require("rxjs/add/operator/map");
class Counter {
  constructor () {
    this.es = new zaitun.EffectSubscription ();    
  }
  init () {
    return {count: 0};
  }
  afterViewRender () {    
    this.es.addEffect (effect$ =>
      effect$
        .whenAction ('lazy')
        //.delay (1000)
        .map (action =>{
          action.type= 'inc';
          return action;
        })
    );
  }
  onDestroy () {
    this.es.dispose ();
  }
  view({model, dispatch}) {
    return h ('div', 'count: ' + model.count);
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

describe ('counter component', function () {
  var elm, router;
  elm = document.createElement ('div');
  
  router = zaitun.bootstrap ({
    containerDom: elm,
    mainComponent: Counter,
  });

  beforeEach (function () {});

  it ('increment', function (done) {
    router.test ().then (res => {
      res.whenAction ({type: 'inc'}, res => {
        assert.equal (res.model.count, 1);
        done ();
      });
    });
  });

  it ('decrement', function (done) {
    router.test ().then (res => {
      res.whenAction ({type: 'dec'}, res => {
        assert.equal (res.model.count, 0);
        done ();
      });
    });
  });

  it ('lazy loading(effect)', function (done) {
    router.test ().then (res => {
      res.whenAction ({type: 'lazy'}, res => {        
        if(res.action.type==='lazy'){
          assert.deepEqual (res.model, {count:0, msg:'loaading...'});
        }
        if(res.action.type==='inc'){
          assert.deepEqual (res.model, {count:1, msg:''});
        }
        done ();
      });
    });
  });

});
