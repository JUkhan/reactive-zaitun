import { ViewObj, Dispatch, Action } from 'zaitun';
//import { div } from 'zaitun/dom';
import { html } from 'snabbdom-jsx';
import {
    initId,
    initTriangle,
    triangleDestroy,
    SierpinskiTriangle,
    shouldComponentUpdate,
    MOUSE_ENTER,
    MOUSE_LEAVE
} from './triangle';


var containerStyle = {
    position: 'absolute',
    transformOrigin: '0 0',
    left: '50%',
    top: '50%',
    width: '10px',
    height: '10px',
    background: '#eee',
    transform:''
};

const INTERVAL = 'interval';
const ELAPSED = 'elapsed';
var intervalID, animId;

function init(dispatch) {
    initTriangle();
    return { seconds: 0, elapsed: 0, id: 0, hover: false }
}
function afterViewRender(dispatch: Dispatch) {
    intervalID = setInterval(() => { dispatch({ type: INTERVAL }) }, 1000);
    var start = new Date().getTime();
    function animate() {
        dispatch({ type: ELAPSED, payload: new Date().getTime() - start });
        animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);
}
function onDestroy() {
    triangleVDom = null;
    clearInterval(intervalID);
    cancelAnimationFrame(animId);
    triangleDestroy();
}
var pm: any = {}, triangleVDom = <div>loading...</div>;
function OptimizeTriangle(model) {   
    initId();    
    if (shouldComponentUpdate(pm, model)) {       
        triangleVDom = SierpinskiTriangle(model);
    }
    pm = model;
    return triangleVDom;
}

function view({ model, dispatch }: ViewObj) {

    const t = (model.elapsed / 1000) % 10;
    const scale = 1 + (t > 5 ? 10 - t : t) / 10;
    const transform = 'scaleX(' + (scale / 2.1) + ') scaleY(0.7) translateZ(0.1px)';
    return <div style={{ ...containerStyle, transform }}>
        <div>
            {OptimizeTriangle({
                 x: 0, y: 0, s: 1000,
                 text: model.seconds, id: model.id,
                 hover: model.hover,
                 dispatch}) }
        </div>
    </div>
    
}
function update(model, action: Action) {
    switch (action.type) {
        case INTERVAL:
            return { ...model, seconds: (model.seconds % 10) + 1 }
        case ELAPSED:
            return { ...model, elapsed: action.payload }
        case MOUSE_ENTER:
        case MOUSE_LEAVE:
            return { ...model, id: action.payload.id, hover: action.payload.hover }
        default:
            return model;
    }
}

export default { init, view, update, afterViewRender, onDestroy }
