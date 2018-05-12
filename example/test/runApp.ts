import { bootstrap, RouteOptions } from 'zaitun';
import {EffectManager} from 'zaitun-effect';

import rootCom from '../src/rootComponent';
import page1 from '../src/page1';
import page2 from '../src/page2';
import page3 from '../src/page3';
import counterEffect from '../src/counterEffect';
import counter from '../src/counter';
import parent from '../src/parent';

function getData(routeParams: any) {
    console.log(routeParams);
    return new Promise(accept => {
        setTimeout(() => {
            accept(
                new Array(routeParams.times)
                    .fill('fruit-')
                    .map((fruit, i) => fruit + i)
            );
        }, 1000);
    });
}

const routes: RouteOptions[] = [
    { path: 'page1', component: page1 },
    {
       path: 'page2',       
       component:page2
    },
    {
        path: 'page3/:times/:title',
        data: getData,
        component:page3
    },
    {
        path: 'counter',               
        effects: [counterEffect],
        component:counter
    },
    {
        path: 'parent',       
        effects: [counterEffect],
        component: parent
    }
];

var run=(navName)=>{    
    return bootstrap({
        containerDom: document.createElement('div'),
        mainComponent: rootCom,
        routes: routes,
        activePath: navName,
        locationStrategy:'memory',
        devTool: false,
        effectManager:EffectManager
    }).test();
}

export default run;

