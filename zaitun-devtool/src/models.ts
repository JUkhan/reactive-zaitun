export interface Action {
    type: any;
    payload?: any;
    dispatch?: Dispatch;
}

export interface IComponentManager {
    
    devTool: any;    
    reset: () => void;
    updateByModel: (model: any) => void;
   
}


export type Dispatch = (action: Action, broadcast?: boolean) => void;




