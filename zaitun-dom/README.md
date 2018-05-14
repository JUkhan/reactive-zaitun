# zaitun/dom

snabbdom modules and dom helper functions 

## uses

```javascript
import {div, h3, svg} from 'zaitun/dom';

function view(){
    div([
        h3('Hello world!!'),
        svg({attrs:{width:100, height:100}},
             svg.circle({attrs:{cx:50, cy:50,r:40, stroke:'orange', 'stroke-width':3, fill:'red'  }})
        )
    ])
}

```
