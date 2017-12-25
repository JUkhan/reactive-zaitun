import {BootstrapOptions} from './models';
import { Router} from './router';
import {ComponentManager} from './componentManager';

export function bootstrap(options:BootstrapOptions):Router{
    
    if (!options.containerDom) {
        throw new Error('mountNode must be a css selector or a dom object');
    }
    if (typeof options.containerDom === 'string') {
        options.containerDom = <any>document.querySelector(options.containerDom);
    }
    if (!(typeof options.mainComponent === 'object' || typeof options.mainComponent === 'function')) {
        throw new Error('bootstrap options: mainComponent missing.');
    }    
    return new Router(options, new ComponentManager(options))
}
export default bootstrap;