import './devTool.css';
import { IComponentManager, Action } from './models';
export declare class DevTool {
    private CM;
    height: number;
    toolHandler: any;
    constructor(CM: IComponentManager);
    elm: any;
    isCollapsed: boolean;
    initialize(): void;
    setSize(): void;
    reset(): void;
    setAction(action: any, model: any): void;
    init(): {
        height: number;
        hide: boolean;
        states: any[];
    };
    view({model, handler}: {
        model: any;
        handler: any;
    }): any;
    DebugStates(item: any, handler: any, index: any): any;
    update(model: any, action: Action): any;
    getType(action: any, typeArr: any): void;
}
export default DevTool;
