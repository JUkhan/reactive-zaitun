
import Worker from 'worker-loader!./test.worker';

const w=new Worker();
w.onmessage=(e:any)=>{
    const action=e.data;
    switch (action.type) {
        case 'test-res':
            console.log(action.payload);
            break;        
        default:
            break;
    }
};
w.postMessage({type:'test', payload:'data x'});
