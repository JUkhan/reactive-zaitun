import { VNode } from 'zaitun/dom';
import {Dispatch} from 'zaitun';

export declare type dic = { [key: string]: any };
declare type elmFn = (model: any) => VNode;
declare type propsFn = (model: any) => dic;
declare type boolFn = (model: any) => boolean;
declare type stringFn = (model: any) => string;
declare type rowFn = (row, i) => dic;

export interface FormModel {
    data: { [key: string]: any };
    options: FormOptions;
}

export interface FormOptions {
    viewMode: 'form' | 'modal';
    validationMode?:'normal'|'fancy'; // 'normal' is default
    name: string;
    labelSize?: number;
    labelPos?: 'left' | 'top';
    elmSize?: 'sm' | 'lg';
    title?: string;
    inputs: Array<Field | Array<Field>>;
    modalClose?: Function;
    buttons?: Array<Field> | elmFn;
    /** popup size */
    modalSize?: 'sm' | 'lg';
}

export interface Field {
    field?: string;
    label?: string | stringFn;
    type: 'select' | 'text' | 'password' | 'datetime-local' |
    'date' | 'month' | 'tabs' | 'time' | 'week' |
    'number' | 'email' | 'url' | 'checkbox' | 'radio' | 'search' | 'tel' | 'color' |
    'vnode' | 'component' | 'button' | 'label' | 'file' | 'fieldset';
    size?: number;
    elmSize?: 'sm' | 'lg';
    data?: Array<any>;
    activeTab?: string;
    tabsCssClass?: string;
    tabsBodyCssClass?: string;
    tabClick?: (model: any, tabName: string, preTab: string) => boolean | Promise<boolean>;
    vnode?: (model: any) => VNode;
    actionType?: string;
    component?: any;
    tabs?: { [key: string]: Tab };
    classNames?: string;
    on?: { [key: string]: Function };
    props?: { [key: string]: any } | propsFn;
    hide?: boolFn;
    legend?: string;
    disabled?: boolFn;
    inputs?: Array<Field | Array<Field>>;
    labelPos?: 'left' | 'top';
    labelSize?: number;
    style?: propsFn;
    class?: propsFn;
    multiSelect?: boolean;
    radioList?: Array<Field>;
    inline?: boolean;
    footer?: Field[] | elmFn;
    info?: string;
    required?: boolean;
    validators?: Function[];
    invalidFeedback?: string;
    name?: string;
    value?: any;
    isValid?: boolean;
    selectTitle?: string;
    autofocus?: boolean;
    filePlaceholder?: string;
    fileExt?: string[];
}

export interface Tab {
    disabled?: boolFn;
    hide?: boolFn;
    onInit?:(dispatch:Dispatch)=>void;
    onDestroy?:(dispatch:Dispatch, model:any)=>void;
    inputs?: Array<Field | Array<Field>>;
}


export interface Column {
    id?: any;
    header: string;
    field: string;
    hClass?: string,
    sort?: boolean
    iopts?: { class?: dic | propsFn, style?: dic | propsFn, on?: { [key: string]: Function }, [key: string]: any },
    focus?: boolean;
    type?: 'select' | 'text' | 'password' | 'datetime-local' |
    'date' | 'month' | 'time' | 'week' |
    'number' | 'email' | 'url' | 'checkbox' | 'radio' | 'search' | 'tel' | 'color';
    editPer?: (row: any, rowIndex: number) => boolean;
    tnsValue?: (value: any) => any;
    cellRenderer?: (row, ri) => VNode;
    hide?: boolean;
    comparator?: (a: any, b: any) => number;
    props?: { [key: string]: string }
    valueProp?: string; //select value prop
    textProp?: string; //select text prop
    style?: dic | propsFn;
    class?: dic | propsFn;
}
export interface Pager {
    pageSize?: number;
    linkPages?: number;
    enablePowerPage?: boolean;
    nav?: boolean;
    search?: boolean;
    pagerInfo?: boolean;
    elmSize?: 'sm' | 'lg';

}
export interface GridOptions {
    serverSidePagingFn?: (params: any) => Promise<{ totalRecords: number, data: any[] }>;
    searchFn?: (data: any[], val: any) => any[];
    keyProp?: string;
    dataNotFound?: string;
    dataNotFoundCssClass?: string;
    onLoad?: Function;
    tableClass?: string,
    headerClass?: string;
    footerClass?: string;
    pager?: Pager;
    hideHeader?: boolean;
    hideFooter?: boolean;
    hidePager?: boolean;
    allowEmptySelection?: boolean; // --default false
    pagerPos?: 'top' | 'bottom' | 'both', // --default both
    pageChange?: (data: any) => void;
    singleSelect?: boolean;
    multiSelect?: boolean;
    selectedRows?: (rows: any, ri: number, ev: any) => void;
    editPer?: boolean; // - default true 
    recordChange?: (row: any, col: any, ri: number, ev: any) => void;
    on?: { [key: string]: Function };
    style?: rowFn | dic;
    class?: rowFn | dic;
    columns: Column[];
    headers?: Array<Array<Footer>>;
    footers?: Array<Array<Footer>>;
}
export interface Footer {
    id?: any;
    text?: string;
    props?: { [key: string]: any }
    cellRenderer?: (...args: any[]) => VNode;
    style?: propsFn;
    on?: { [key: string]: Function };
    class?: (row, i) => { [key: string]: any };
    hide?: boolean;
}

export interface PlotModel {
    key: string;
    data?: any;
    layout: any,
    config?: any,
    style?:{traceStyle:dic, index?:number|Array<number>};
    onLoad?:(key:string, elm:HTMLElement)=>void;
}

export interface SegmentItem{
    name:string;
    title:string;
    active:boolean;
}
export interface SegmentModel{
    size?:'lg'|'sm';
    color:'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark';
    items:Array<SegmentItem>
}