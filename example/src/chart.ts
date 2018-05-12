
import { ViewObj, Action, Dispatch } from 'zaitun';
import { div } from 'zaitun/dom';
import { SegmentModel, PlotModel } from './ui/uimodel'
import Segment from './ui/juSegment';
import Ploat from './ui/juPlotly';
const SEGMENT = Symbol('segment');

function init() {
    return {
        segment: {
            color: 'danger',
            items: [
                { name: 'disease', title: 'Disease', active: true },
                { name: 'crp', title: 'CRP' },
                { name: 'joint', title: 'JOINT' },
                { name: 'haq', title: 'HAQ' }
            ]
        } as SegmentModel,
        graph: Ploat.init()
    }
}
function view({ model, dispatch }: ViewObj) {
    return div([
        Segment.view({ model: model.segment, dispatch: segmentAction => dispatch({ type: SEGMENT, payload: segmentAction }) }),
        Ploat.view({ model: model.graph, dispatch })
    ])

}

function update(model, action: Action) {
    switch (action.type) {
        case SEGMENT:
            let graph:PlotModel=graphData(action.payload) as any;
            graph.key=model.graph.key;
            return {
                graph, segment: Segment.update(model.segment, action.payload)
            };
        default:
            return model;
    }
}
function afterViewRender(dispatch: Dispatch) {
    dispatch({ type: SEGMENT, payload: { payload: {} } })
}
function graphData(action: Action) {

    switch (action.payload.name) {
        case 'disease': return disease();
        case 'crp': return crp();
        default: return disease();

    }
}
function crp() {
    let layout = { ...Ploat.DefaultLayout }
    var trace1 = {
        x: ['2000-02-23', '2000-03-21', '2000-04-12', '2000-05-24'],
        y: [10, 15, 13, 17],
        mode: 'markers'
    };

    var trace2 = {
        x: ['2000-02-23', '2000-03-21', '2000-04-12', '2000-05-24'],
        y: [16, 5, 11, 9],
        mode: 'lines'
    };

    var trace3 = {
        x: ['2000-02-23', '2000-03-21', '2000-04-12', '2000-05-24'],
        y: [12, 9, 15, 12],
        mode: 'lines+markers'
    };
    var data = [trace1, trace2, trace3];
    return { data, layout }
}
function disease() {
    var layout = {
        height: 500,
        xaxis: {
            ...Ploat.DefaultLayout.xaxis,
            autorange: false
        },
        yaxis: {
            ...Ploat.DefaultLayout.yaxis,
            range: [0, 10]
        },
        legend: { orientation: "h" },
        shapes: [
            {
                type: "rect",
                xref: "paper",
                x0: 0,
                y0: 0,
                x1: 1,
                y1: 3.2,
                line: {
                    width: 0.5
                },
                fillcolor: "rgb(144, 238, 144)",
                opacity: 0.2
            },
            {
                type: "rect",
                xref: "paper",
                x0: 0,
                y0: 3.2,
                x1: 1,
                y1: 5,
                line: {
                    width: 0.5
                },
                fillcolor: "rgb(255,255,224)",
                opacity: 0.2
            },
            {
                type: "rect",
                xref: "paper",
                x0: 0,
                y0: 5,
                x1: 1,
                y1: 10,
                line: {
                    width: 0.5
                },
                fillcolor: "rgb(255, 153, 153)",
                opacity: 0.2
            }
        ]
    };
    var trace1 = {
        y: [1, 2, 3, 4],
        x: ['2000-02-23', '2000-03-21', '2000-04-12', '2000-05-24'],
        type: 'scatter'
    };

    var trace2 = {
        y: [4, 2, 1, 7],
        x: ['2000-02-23', '2000-03-21', '2000-04-12', '2000-05-24'],
        type: 'scatter'
    };

    var data = [trace1, trace2];
    return { data, layout}
}
export default { init, view, update, afterViewRender } 