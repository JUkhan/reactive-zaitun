
import { ViewObj, Action } from 'zaitun';
import { div, button , hr} from 'zaitun/dom';

const SEGMENT_CHANGE = Symbol('segment-change');


function view({ model, dispatch }: ViewObj) {
    return div([
        div('.juSegment.row', model.items.map(item=>
            div('.col',{key:item.name},
            button('.btn.btn-block'+(model.size?'.btn-'+model.size:''),
            {
                class:{
                    ['btn-'+model.color]:item.active,
                    ['btn-outline-'+model.color]:!item.active
                },
                on:{click:()=>!item.active&&dispatch({type:SEGMENT_CHANGE, payload:item})}
            },
            item.title)))
        ),
        hr()
    ])
    
}

function update(model, action: Action) {
    switch (action.type) {
        case SEGMENT_CHANGE:
            let items=model.items.map(item=>{
                if(item.name===action.payload.name){
                    return {...item, active:true};
                }
                return {...item, active:false};
            });
            return {...model, items};

        default:
            return model;
    }
}

export default { view, update, SEGMENT_CHANGE } 