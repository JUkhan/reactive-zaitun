import { ViewObj} from 'zaitun';
import { html } from 'snabbdom-jsx';

import {Thread} from '../worker/Thread';
import worker from 'worker-loader!../worker/test.worker';

var idCounter = 0;
var targetSize = 25, thread:Thread;
export const MOUSE_ENTER = 'enter';
export const MOUSE_LEAVE = 'leave';
export const TRIANGLE= 'triangle';

var dotStyle = {
    position: 'absolute',
    background: '#61dafb',
    font: 'normal 15px sans-serif',
    textAlign: 'center',
    cursor: 'pointer',
};

export function initId(){    
    idCounter=0;   
}
export function initTriangle() {
    thread=new Thread(worker, 'test');
}
export function triangleDestroy() {
    thread.terminate();
}
function Dot({ model, dispatch }: ViewObj) {   
    var s = model.size * 1.3;
    var style = {
        ...dotStyle,
        width: s + 'px',
        height: s + 'px',
        left: (model.x) + 'px',
        top: (model.y) + 'px',
        borderRadius: (s / 2) + 'px',
        lineHeight: (s) + 'px',
        background: model.hover ? '#ff0' : dotStyle.background
    };
    return (
        <div style={style}
            on-mouseenter={[dispatch,{ type: MOUSE_ENTER, payload: { id: model.id, hover: true }}]}
            on-mouseleave={[dispatch, { type: MOUSE_LEAVE, payload: { id: model.id, hover: false } }]}>
            {model.hover ? '*' + model.text + '*' : model.text}
        </div>
    );

}

export function SierpinskiTriangle({ x, y, s, text, id, hover ,dispatch}) {
    
    if (s <= targetSize) {
        idCounter += 1;
        var model = {
            x: x - (targetSize / 2),
            y: y - (targetSize / 2),
            size: targetSize,
            hover: id === idCounter ? hover : false,
            text: text,
            id: idCounter
        };

        return <Dot model={model} dispatch={dispatch} />
    }  
     
    /*var slowDown = !true;
    if (slowDown) {
        var e = performance.now() + 0.8, i=0;
        while (performance.now() < e) {
            // Artificially long execution time.
           i++;
        }    
     }*/
    thread.run('long run input').then(console.log);
    s /= 2;

    return [
        <SierpinskiTriangle x={x} y={y - (s / 2)} s={s} text={text} id={id} hover={hover} dispatch={dispatch} />,

        <SierpinskiTriangle x={x - s} y={y + (s / 2)} s={s} text={text} id={id} hover={hover} dispatch={dispatch} />,

        <SierpinskiTriangle x={x + s} y={y + (s / 2)} s={s} text={text} id={id} hover={hover} dispatch={dispatch} />

    ];
}

export function shouldComponentUpdate(oldModel, newModel){
    var o=oldModel;
    var n=newModel;
    return o.text !== n.text || o.id !== n.id || o.hover !== n.hover;
}