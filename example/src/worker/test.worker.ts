const ctx: Worker = self as any;

ctx.onmessage=(e:any)=>{

    let action=e.data;
    
    switch (action.type) {
        case 'test':           
            var e1 = performance.now() + 0.8, i=0;
            while (performance.now() < e1) {
                // Artificially long execution time.
               i++;
            }
            ctx.postMessage({type:'test', payload:action.payload+' res: '+i});
          return;
        
        default:
            break;
    }
}