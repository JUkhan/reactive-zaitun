import { ViewObj } from 'zaitun';
import { div, VNode } from 'zaitun/dom';
import { guid } from './utils';
import { PlotModel, dic } from './uimodel';
 
declare const Plotly: any;

function init() {
    return { key: guid(), data: [], layout: { ...DefaultLayout }, config: { displayModeBar: false } }
}
function view({ model, dispatch }: ViewObj) {

    return div({
        key: model.key, diff: model,
        hook: {
            insert: (node: VNode) => {
                //console.log('insert', node);                
                draw(node.elm, model);
                if (typeof node.data.diff.onLoad === 'function')
                    node.data.diff.onLoad(node.elm);
               
            },
            update: (oldnode: VNode, node: VNode) => {
                //console.log('update', node);
                let oldModel: PlotModel = oldnode.data.diff;
                if (oldModel.data !== node.data.diff.data && oldModel.layout !== node.data.diff.layout) {
                    //updateGraph(node.elm, node.data.diff.data, node.data.diff.layout);
                    draw(node.elm,  node.data.diff);
                }
                else if (oldModel.data !== node.data.diff.data) {
                    node.elm['data'] = node.data.diff.data;
                    redraw(node.elm);
                }
                else if (oldModel.style !== node.data.diff.style) {
                    restyle(node.elm, node.data.diff.style.traceStyle, node.data.diff.style.index);
                }
                else if (oldModel.layout !== node.data.diff.layout) {
                    relayout(node.elm, node.data.diff.style.layout);
                }
            },
            destroy: (node: VNode) => {
                purge(node.elm);
                //console.log('destroy', node);
            }
        }
    });
}

function purge(elm: Node) {
    Plotly.purge(elm);
}
function draw(elm: Node, model: PlotModel) {
    Plotly.newPlot(elm, model.data, model.layout, model.config);
}
function resize(elm: Node) {
    Plotly.Plots.resize(elm);
}
//trace/s styles
function restyle(elm: Node, traceStyle: dic, index?: number | number[]) {
    Plotly.restyle(elm, traceStyle, index);
}
function relayout(elm: Node, layout: dic) {
    Plotly.relayout(elm, layout);
}
function updateGraph(elm: Node, data: any[], layout: dic) {
    Plotly.update(elm, data, layout);
}
function addTraces(elm: Node, trace: dic | Array<dic>, index?: number | number[]) {
    Plotly.addTraces(elm, trace, index);
}
function deleteTraces(elm: Node, index: number[]) {
    Plotly.deleteTraces(elm, index);
}
function moveTraces(elm: Node, index: number | number[], index2?: number | number[]) {
    if (index2)
        Plotly.moveTraces(elm, index, index2);
    else
        Plotly.moveTraces(elm, index);
}
function plotEvents(elm: any, eventName, handlerFunction) {
    elm.on(eventName, handlerFunction);
}
function redraw(elm: Node) {
    Plotly.redraw(elm);
}
var DefaultLayout = {
    height: 500,
    margin: { t: 25, l: 35, r: 35 },
    showlegend: true,
    legend: {
        //x: 0,
        //y: 1.2,
        orientation: 'h',
        traceorder: 'reversed',
        font: {
            size: 16
        }
    },
    xaxis: {
        showline: true,
        showgrid: true,
        showticklabels: true,
        zeroline: false,
        linecolor: 'rgb(204,204,204)',
        linewidth: 0.5,
        fixedrange: true,
        autorange: true,
        type: 'date',
        tickformat: '%Y-%m-%d',
        ticks: 'inside',
        tickwidth: 1,
        ticklen: 5,
    },
    yaxis: {
        showline: true,
        showgrid: true,
        showticklabels: true,
        zeroline: false,
        linecolor: 'rgb(204,204,204)',
        linewidth: 0.5,
        autorange: true,
        fixedrange: true,
        ticks: 'inside',
        tickwidth: 1,
        ticklen: 5
    }
};
export default {
    init, view, DefaultLayout, plotEvents, restyle, resize, draw, purge,
    relayout, updateGraph, addTraces, deleteTraces, moveTraces
} 