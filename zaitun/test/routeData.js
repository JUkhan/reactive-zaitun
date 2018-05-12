var zaitun = require ('../index');
var h = zaitun.h;
var assert = require ('assert');

//require ('rxjs/add/operator/map');

//counter component
class Counter {
  init () {
    return {count: 0};
  }
  afterViewRender (dispatch, router) {
    /*router.effect$.addEffect (effect$ =>
      effect$.whenAction ('lazy').map (action => {
        action.type = 'inc';
        return action;
      })
    );*/
  }
  onDestroy () {}
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
        setTimeout (() => {
          action.dispatch ({type: 'inc'});
        }, 0);
        return {count: model.count, msg: 'loaading...'};
      default:
        return model;
    }
  }
}

//tree component
var treeCom = function () {
  function init (dispatch, params, router) {
    return {
      data: router.activeRoute.data,
    };
  }
  function view({model, dispatch}) {
    return h ('div', h ('div.treeView', treeView (model.data, dispatch)));
  }
  function treeView (model, dispatch) {
    return h ('ol', model.map (item => treeNode (item, dispatch)));
  }
  function treeNode (model, dispatch) {
    return h ('li', {key: model.id}, [
      h ('div', [
        h (
          'span',
          {
            on: {click: ev => dispatch ({type: 'toggle', payload: model})},
            class: {bold: isFolder (model), item: isFolder (model)},
          },
          [
            h ('span', model.name),
            isFolder (model) ? h ('span', `[${model.open ? '-' : '+'}]`) : null,
          ]
        ),
        h (
          'a',
          {
            props: {href: 'javascript:;'},
            on: {click: ev => dispatch ({type: 'addItem', payload: model})},
          },
          'Add Item'
        ),
      ]),
      model.open && isFolder (model)
        ? treeView (model.children, dispatch)
        : null,
    ]);
  }
  function update (model, action) {
    switch (action.type) {
      case 'toggle':
        const item = action.payload;
        item.open = !item.open;
        return model;
      case 'addItem':
        addFolder (model.data, action.payload);
        return model;
      default:
        return model;
    }
  }
  function isFolder (item) {
    return item.children && item.children.length;
  }
  var id = 7;
  function addFolder (model, item) {
    item.open = true;
    if (!isFolder (item)) {
      item.children = [{name: 'new item', id: id++}];
    } else {
      item.children.push ({name: 'new item', id: id++});
    }
  }
  return {init, view, update};
};
//end tree com

//root component
var rootCom = function () {
  const CHILD = 'CHILD';
  const PAERNT_ACTION = 'parent-action';

  function init () {
    return {
      msg: '',
      menu: [
        {path: 'counter', text: 'Counter'},
        {path: 'counterList/5/test', text: 'Counter List'},
        {path: 'todos', text: 'Todos'},
        {path: 'animation', text: 'Animation'},
        {path: 'orderAnimation', text: 'Order Animation'},
        {path: 'heroAnimation', text: 'Hero Animation'},
        {path: 'treeView', text: 'Tree View'},
      ],
    };
  }
  function afterViewRender (dispatch, router) {
    // router.effectInstance().addEffect(action$ =>
    //     action$.whenAction('inc')
    //         .mergeMap(act => {
    //             dispatch({ type: PAERNT_ACTION, payload: new Date() });
    //             return empty();
    //         })
    // )
  }
  function view({model, dispatch, router}) {
    return h ('div', [
      topMenu (model.menu, router),
      h ('b', model.msg && 'Last incremented at ' + model.msg),
      h (
        'div',
        router.viewChild ({
          model: model.child,
          router,
          dispatch: action => dispatch ({type: CHILD, childAction: action}),
        })
      ),
    ]);
  }
  function update (model, action, router) {
    switch (action.type) {
      case CHILD:
        return Object.assign (model, {
          child: router.updateChild (model.child, action.childAction),
        });

      case PAERNT_ACTION:
        return Object.assign (model, {msg: action.payload});
      default:
        return model;
    }
  }
  function topMenu (model, router) {
    return h (
      'nav.navbar.navbar-toggleable-md.navbar-inverse.fixed-top.bg-inverse',
      [
        h ('a.navbar-brand', {props: {href: '#/counter'}}, 'Zaitun'),
        h (
          'div.collapse.navbar-collapse#navbarCollapse',
          h (
            'ul.navbar-nav.mr-auto',
            model.map (nav =>
              h (
                'li.nav-item',
                {class: {active: router.activeRoute.navPath === nav.path}},
                [h ('a.nav-link', {props: {href: '#/' + nav.path}}, nav.text)]
              )
            )
          )
        ),
      ]
    );
  }
  return {init, view, update};
};
//end root component

function loadData (params) {
  return new Promise (accept => {
    accept ([
      {name: 'item1', id: 1},
      {
        name: 'item2',
        id: 2,
        children: [{name: 'item2.1', id: 3}, {name: 'item2.2', id: 5}],
      },
      {name: 'item3', id: 6},
    ]);
  });
}

const routes = [
  {path: '/counter', component: Counter},
  {path: '/treeView', data: loadData, component: treeCom ()},
];

describe ('route data test', function () {
  var elm, router;
  elm = document.createElement ('div');

  router = zaitun
    .bootstrap ({
      containerDom: elm,
      routes: routes,
      activePath: 'treeView',
      mainComponent: rootCom (),
    })
    .test ();

  describe ('navigate to tree component', function () {
    it ('it should have initial data coming from route data property(promise data)', function (
      done
    ) {
      router.whenAction ({type: 'fake action-just for data test'}, res => {
        assert.deepEqual (res.model.child.data, [
          {name: 'item1', id: 1},
          {
            name: 'item2',
            id: 2,
            children: [{name: 'item2.1', id: 3}, {name: 'item2.2', id: 5}],
          },
          {name: 'item3', id: 6},
        ]);
        done ();
      });
    });
  });
});
