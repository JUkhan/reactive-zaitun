
var zaitun = require ('../index');
var h = zaitun.h;

require('rxjs/add/operator/delay');
require('rxjs/add/operator/map');

function init() {
  
      return { count: 0, msg: ''}
  }
  
  function afterViewRender(dispatch, router) {
      router.effect$
          .addEffect(effect$ =>
              effect$.whenAction('lazy')
                  .delay(1000)
                  .map(action => Object.assign(action, {type: 'inc' }))
          );        
  }
  function onDestroy() {
  
  }
  function view({ model, dispatch }) {
  
      return h('span', [
          h('button', { on: { click: e => dispatch({ type: 'inc' }) } }, '+'),
          h('button', { on: { click: e => dispatch({ type: 'lazy' }) } }, '+ (Async)'),
          h('button', { on: { click: e => dispatch({ type: 'dec' }) } }, '-'),
          h('span', model.msg || model.count)
      ]
      );
  }
  function update(model, action) {
  
      switch (action.type) {
          case 'inc': return { count: model.count + 1, msg: '' };
          case 'dec': return { count: model.count - 1, msg: '' };
          case 'lazy':return { count: model.count, msg: 'loaading...' };         
          default:return model;
      }
  }

zaitun.bootstrap ({
  containerDom: '#app',
  mainComponent: {init, view, update, afterViewRender},
  devTool:true
});

