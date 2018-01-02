var zaitun = require ('../index');
var h = zaitun.h;
var assert = require ('assert');

require("rxjs/add/operator/map");

class Counter {  
  init () {
    return {count: 0};
  }
  afterViewRender (dispatch, router) {  
    
    router.effect$.addEffect (effect$ =>
      effect$
        .whenAction ('lazy')        
        .map (action =>{
          action.type= 'inc';
          return action;
        })
    );
  }
  onDestroy () {
   
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
  }).test();

  beforeEach (function () {});

  it ('increment', function (done) {
    router.whenAction ({type: 'inc'}, res => {
        assert.equal (res.model.count, 1);
        done ();
      });   
  });

  it ('decrement', function (done) {
    router.whenAction ({type: 'dec'}, res => {
      
        assert.equal (res.model.count, 0);
        done ();
      });    
  });

  it ('lazy loading(effect)', function (done) {
    router.whenAction ({type: 'lazy'}, res => {  console.log('asd: ',res);      
        if(res.action.type==='lazy'){
          assert.deepEqual (res.model, {count:0, msg:'loaading...'});
        }
        else if(res.action.type==='inc'){
          assert.deepEqual (res.model, {count:1, msg:''});
          done ();
        }
         
      },true);
    });  

});
