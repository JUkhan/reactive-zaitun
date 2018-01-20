import { ViewObj, Action, h, Router } from '../../src/index';


import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/let';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import { animationFrame } from 'rxjs/scheduler/animationFrame';
import { Scheduler } from 'rxjs/Scheduler';

//https://github.com/mattdesl/eases

function init() {
    return {}
}
function msElapsed(scheduler = animationFrame) {
    const start = Scheduler.now();
    return Observable.defer(() => {
        return Observable.interval(0, scheduler)
            .map((t: any) => Scheduler.now() - start)
    })
}
function elasticOut(t) {
    return Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0
}
function pixelsPerSecond(v) {
    return ms => v * ms / 1000;
}
function distance(pixels) {
    return t => t * pixels;
}
function duration(ms) {
    return msElapsed()
        .map(t => t / ms)
        .takeWhile(t => t < 1);
    //.concat(Observable.of(1));
}
function moveBall(duration$: Observable<any>) {
    const elm: any = document.querySelector('#box');
    return duration$
        .map(elasticOut)
        .map(distance(430))
        .do(frame => {
            elm.style.transform = `translate3d(0, ${frame}px, 0)`;
        })
}
function moveDown(elm, pixels) {
    return (duration$: Observable<any>) => duration$.map(elasticOut)
        .map(distance(pixels))
        .do(frame => {
            elm.style.transform = `translate3d(0, ${frame}px, 0)`;
        })
}
function afterViewRender(router:Router) {
    //const elm:any=document.querySelector('#box');
    //moveBall(duration(1500)).subscribe();
    //moveDown(elm)(duration(1500)).subscribe();
    //duration(2000).let(moveDown(elm)).subscribe();
    
    const balls = document.querySelectorAll('.ball');
    Observable.from(balls)
        .concatMap((ball, i) =>
            duration((i + 1) * 500).let(moveDown(ball, 430))
        )
        .subscribe();
}
function getStyle(left) {
    return {
        width: '70px',
        height: '70px',
        backgroundColor: 'cyan',
        position: 'relative',
        left: left + 'px',
        display: 'inline-block'
    }
}
function getSvg(){
    return h('svg', {attrs: {width: 100, height: 100}}, [
        h('circle', {attrs: {cx: 50, cy: 50, r: 40, stroke: 'green', 'stroke-width': 4, fill: 'yellow'}})
      ]);
}
function view({ model, dispatch }: ViewObj) {
    return h('div.asde',{style:{height: '500px', border: 'solid 1px gray' }},[
        h('div.ball',{style:getStyle(100)}),
        h('div.ball',{style:getStyle(200)}),
        h('div.ball',{style:getStyle(300)})
    ])
    
}

function update(model, action: Action) {

}
function onDestroy(){
    console.log('on--destroy');
}
export default { init, view, update, afterViewRender,onDestroy };
