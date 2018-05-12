import { Dispatch, Router, h, Action } from 'zaitun';
import { guid } from './utils';
import { FormOptions, Field } from './uimodel'



declare const $: any;
const TAB_CLICK = Symbol('TAB_CLICK');
const OPTIONS_CHANGED = Symbol('OPTIONS_CHANGED');
const FORM_VALUE_CHANGED = Symbol('form-value-change');
const SELECT_DATA_ACTION = Symbol('Select-action');

function map_select_data_Action(dispatch: Dispatch, fieldName: string, data: any[]): Action {
    return {
        type: SELECT_DATA_ACTION,
        payload: { fieldName, data },
        dispatch: dispatch
    }

}

class juForm {
    protected dispatch: Dispatch;
    protected options: FormOptions;
    protected modalId: string;
    public model: any;
    protected router: Router;
    protected FILES: { [key: string]: File[] } = {};
    protected validation_followup = {};
    constructor() {
        this.dispatch = undefined;
        this.options = undefined;
        this.modalId = guid();
    }
    init() {
        return {};
    }
    view({ model, dispatch, router }) {
        this.dispatch = dispatch;
        this.options = model.options;
        this.model = model;
        this.router = router;
        this.validation_followup = {};
        if (!model.data) {
            model.data = {};
        }
        if (!this.options) {
            return h('div', 'juForm options is not defined');
        }
        if (typeof this.options.validationMode === 'undefined') {
            this.options.validationMode = 'normal';
        }
        const vnodes = h('div.juForm', { key: this.modalId }, this._createElements(this.options));
        return this.options.viewMode === 'form' ? vnodes : this._createModal(vnodes, this.modalId);
    }
    update(model, action: Action) {
        switch (action.type) {
            case FORM_VALUE_CHANGED:
                let data = { ...model.data };
                this._setValueToObj(data, action.payload.field.field, action.payload.value);
                return { ...model, data };
            case TAB_CLICK:
                return model;
            case SELECT_DATA_ACTION:
                this.setSelectData(action.payload.fieldName, action.payload.data);
                return model;
            default:
                return model;
        }

    }
    protected _createElements(options) {
        const vnodes = [];
        if (options.inputs) {
            options.inputs.forEach((item, index) => {
                this._transformElement(item, index, vnodes);
            });
        }
        return vnodes
    }
    public modalClose() {
        if (typeof this.options.modalClose === 'function') {
            this.options.modalClose() && this.showModal({ show: false });
        } else {
            this.showModal({ show: false });
        }
    }
    protected _createModal(vnodes, id) {
        return h('div.modal.fade', { key: id, attrs: { id: id, tabindex: "-1", role: "dialog", 'aria-labelledby': "mySmallModalLabel", 'aria-hidden': "true" } }, [
            h('div.modal-dialog.modal-' + this.options.modalSize, { attrs: { role: 'document' } }, [
                h('div.modal-content', [
                    h('div.modal-header', [
                        h('div.modal-title', this.options.title || ''),
                        h('button.close', {
                            data: { dismiss: 'modal' },
                            aria: { label: 'Close' }, on: { click: e => this.modalClose() }
                        }, [
                                h('span', { aria: { hidden: 'true' } }, '×')
                            ])
                    ]),
                    h('div.modal-body', [vnodes]),
                    h('div.modal-footer', this._getModalButtons(this.options.buttons))
                ])
            ])
        ]);
    }
    protected _getModalButtons(buttons) {
        if (!buttons) return '';
        if (typeof buttons === 'function') {
            return buttons(this.model)
        }
        else if (Array.isArray(buttons)) {
            return buttons.map(btn => this._createButtonElm(btn));
        }
        return this._getVNode(buttons);
    }
    protected _transformElement(item, index, vnodes) {

        if (Array.isArray(item)) {
            const velms = [];
            item.forEach((elm, index) => {
                switch (elm.type) {
                    case 'fieldset':
                        velms.push(this._createFieldSet(elm));
                        break;
                    case 'tabs':
                        velms.push(h(`div.col-md-${elm.size || 6}`, this._createTabs(elm)));
                        break;
                    case 'button':
                        velms.push(this._createButton(elm, index));
                        break;
                    case 'checkbox': case 'radio':
                        velms.push(this._createCheckbox(elm, index));
                        break;
                    case 'label':
                        velms.push(this._createLabel(elm, index));
                        break;
                    case 'component':
                        velms.push(h(`div.col-md-${elm.size || 6}`, [elm.component.view({
                            model: elm.field ? this.model[elm.field] : this.model,
                            dispatch: this.router.bindEffect(action => this.dispatch({ type: elm.actionType, payload: action }))
                        })]));
                        break;
                    case 'vnode':
                        vnodes.push(h(`div.col-md-${elm.size || 6}`, [this._getVNode(elm.vnode)]));
                        break;
                    default:
                        velms.push(...this._createElement(elm, index));
                        break;
                }
            });
            vnodes.push(h(`div.form-group.row`, velms));
            return;
        }
        switch (item.type) {
            case 'fieldset':
                vnodes.push(this._createFieldSet(item));
                break;
            case 'tabs':
                vnodes.push(...this._createTabs(item));
                break;
            case 'button':
                vnodes.push(h(`div.form-group.row`, this._createButton(item, index)));
                break;
            case 'checkbox': case 'radio':
                vnodes.push(h(`div.form-group.row`, this._createCheckbox(item, index)));
                break;
            case 'label':
                vnodes.push(h(`div.form-group.row`, this._createLabel(item, index)));
                break;
            case 'vnode':
                vnodes.push(this._getVNode(item.vnode));
                break;
            case 'component':
                vnodes.push(item.component.view({
                    model: item.field ? this.model[item.field] : this.model,
                    dispatch: this.router.bindEffect(action => this.dispatch({ type: item.actionType, payload: action }))
                }));

                break;
            default:

                vnodes.push(h(`div.form-group.row`, this._createElement(item, index)));
                break;
        }
    }

    protected _createFieldSet(item) {
        if (this._getBoolVal(item.hide)) {
            return h('span', { style: { display: 'none' } }, 'hide');
        }
        const velms = [];
        if (item.legend) {
            velms.push(h('legend', item.legend));
        }
        velms.push(...this._createElements(item));
        return h(`fieldset.col-md-${item.size || 12}`, {
            attrs: { disabled: this._getBoolVal(item.disabled) }
        }, velms);
    }
    protected _createTabs(item: Field) {
        const elms = [], lies = [], tabcontents = [], tabNames = Object.keys(item.tabs);

        tabNames.forEach(tabName => {
            let tabId = '#' + tabName.replace(/\s+/, '_###_'),
                disabled = this._getBoolVal(item.tabs[tabName].disabled),
                hide = this._getBoolVal(item.tabs[tabName].hide);
            if (!hide) {
                lies.push(h(`li.nav-item`, [
                    h(`a.nav-link`, {
                        attrs: { href: tabId },
                        class: { active: item.activeTab === tabName, disabled: disabled },
                        on: {
                            click: e => {
                                e.preventDefault();
                                if (disabled) { return; }
                                if (item.activeTab === tabName) { return; }
                                this.selectTab(tabName, item);
                            }
                        }
                    }, tabName)

                ]));
                //tab contents 
                if (tabName === item.activeTab) {
                    tabcontents.push(h(`div.tab-item`, {
                        key: tabName,
                        hook: {
                            insert: (node) => {
                                if (typeof item.tabs[tabName].onInit === 'function')
                                    item.tabs[tabName].onInit(this.dispatch);
                            },
                            destroy: (node) => {
                                if (typeof item.tabs[tabName].onDestroy === 'function')
                                    item.tabs[tabName].onDestroy(this.dispatch, this.model);
                            }
                        }
                    },
                        this._createElements(item.tabs[tabName])));
                }
            }
        });
        elms.push(h('div.card' + (item.tabsCssClass || ''), [
            h('div.card-header', [h(`ul.nav nav-tabs card-header-tabs pull-xs-left`, lies)]),
            h('div.card-block' + (item.tabsBodyCssClass || ''), tabcontents),
            item.footer ? h('div.card-footer',
                this._getModalButtons(item.footer)) : ''
        ]))
        return elms;
    }
    protected _getVNode(footer) {
        if (typeof footer === 'function') {
            return footer(this.model);
        }
        return footer;
    }
    protected _setFiles(item: Field, e): string {
        let fileList: FileList = e.target.files;
        if (fileList.length == 0) {
            return '';
        }
        let filesName: Array<string> = [];
        let files: Array<File> = [];
        for (var index = 0; index < fileList.length; index++) {
            if (this._hasValidExt(fileList.item(index).name, item.fileExt)) {
                filesName.push(fileList.item(index).name);
                files.push(fileList.item(index));
            }
        }
        this.FILES[item.field] = files;
        return filesName.join(';');
    }
    protected _hasValidExt(name: string, ext: string[]) {
        if (Array.isArray(ext) && ext.length > 0) {
            let res = ext.filter(ex => name.endsWith(ex));
            return res && res.length > 0;
        }
        return true;
    }
    protected _getListener(item: Field) {
        let events = {},
            hasChange = null,
            modelUpdateEvent = 'input';
        if (item.type === 'checkbox' || item.type === 'radio') {
            modelUpdateEvent = 'click';
        }
        else if (item.type === 'file') {
            modelUpdateEvent = 'change';
        }
        if (typeof item.on === 'object') {
            for (let eventName in item.on) {
                if (eventName === modelUpdateEvent) {
                    hasChange = item.on[modelUpdateEvent];
                } else {
                    events[eventName] = e => item.on[eventName](e);
                }
            }
        }
        events[modelUpdateEvent] = e => {
            let val = $(e.target).val();
            if (item.type === 'checkbox' || item.type === 'radio') {
                if (!e.target.checked) {
                    val = '';
                }
            }
            else if (item.type === 'file') {
                val = this._setFiles(item, e);
            }
            if (hasChange) {
                hasChange(val, e);
            }
            this.dispatch({
                type: FORM_VALUE_CHANGED,
                payload: { field: item, value: val }
            }, true);

        };
        events['blur']=e=>{
           item['appear_validation_message']=true;
           this.dispatch({type: 'juForm-blur'});
        };
        return events
    }
    protected _getStyles(data: any) {
        return typeof data === 'function' ? data(this.model) : undefined;
    }
    protected _getBoolVal(data: any) {
        return typeof data === 'function' ? data(this.model) : false;
    }
    protected _getLabel(field: Field) {
        return typeof field.label === 'function' ? field.label(this.model) : field.label;
    }
    protected _createLabel(item: Field, index) {
        if (this._getBoolVal(item.hide)) return [];
        return h(`div.col-md-${item.size || 4}`, [h(`label`, {
            style: this._getStyles(item.style),
            class: this._getStyles(item.class)
        }, this._getLabel(item))]);
    }
    protected _createButton(item, index) {
        if (this._getBoolVal(item.hide)) return [];
        const buttons = [];
        if (item.inline) {
            item.inline.forEach((el, inx) =>
                buttons.push(this._createButtonElm(el, inx + index)));
        } else {
            buttons.push(this._createButtonElm(item));
        }
        return h(`div.col-md-${item.size || 4}`, buttons);
    }
    protected _createButtonElm(item: Field, index = 0) {
        return h(`button${item.classNames || ''}${item.elmSize ? '.btn-' + item.elmSize : ''}`,
            {
                on: this._getListener(item),
                style: this._getStyles(item.style),
                class: this._getStyles(item.class),
                attrs: {
                    type: item.type,
                    disabled: this._getBoolVal(item.disabled),
                    ...this._bindProps(item)
                }
            },
            this._getLabel(item)
        );
    }
    protected _createCheckbox(item: Field, index, inline = false) {
        if (this._getBoolVal(item.hide)) return [];
        const elms = [];
        let value;
        const labelSize = item.labelSize || this.options.labelSize || 2;
        if (item.radioList) {
            if (item.type === 'radio') {
                value = this._getValueFromData(item);
                item.isValid = this._applyFieldValidation(item, value);
            }
            elms.push(h(`div.col-md-${labelSize}`, [this._getLabel(item) as any,h('span.required',this.options.validationMode==='normal'&&item.required?'*':'')]));
            elms.push(h(`div.col-md-${item.size || 4}`, item.radioList.map((el, index) => {
                el.type = item.type;
                el.required = item.required;

                if (item.type === 'radio') {
                    el.name = item.name;
                    el.field = item.field;
                    el.isValid = item.isValid;
                } else {
                    value = this._getValueFromData(el);
                    el.isValid = this._applyFieldValidation(el, value);
                }
                return this._createCheckboxElm(el, index, item.inline, el.isValid, value);
            })));
            return elms;
        } else {
            value = this._getValueFromData(item);
            item.isValid = this._applyFieldValidation(item, value);
            elms.push(h(`div.col-md-${labelSize}`, ''));
            elms.push(h(`div.col-md-${item.size || 4}`,
                this._createCheckboxElm(item, index, false, item.isValid, value)));
            return elms;
        }


    }
    protected _createCheckboxElm(item: Field, index, inline, isValid, value) {
        let css ='';
        if(item.type==='checkbox')
            css=item.required ? isValid ? '.is-valid' : '.is-invalid' : '';
        else css=this.options.validationMode==='fancy'? item.required ? isValid ? '.is-valid' : '.is-invalid' : '':'';
        return h(`div.custom-control.custom-` + item.type,
            {
                class: { 'custom-control-inline': inline }
            }, [
                h('input.custom-control-input' + css,
                    {
                        on: this._getListener(item),
                        style: this._getStyles(item.style),
                        class: this._getStyles(item.class),
                        key: item.field + index,
                        props: {
                            autofocus: item.autofocus
                        },
                        attrs: {
                            type: item.type,
                            disabled: this._getBoolVal(item.disabled),
                            name: item.name || 'oo7',
                            id: item.field + index + 0,
                            value: item.value,
                            checked: item.value === value,
                            ...this._bindProps(item)
                        }
                    }),
                h('label.custom-control-label', {
                    key: item.field + index + 1,
                    attrs: {
                        for: item.field + index + 0
                    }
                }, this._getLabel(item))
            ]
        );
    }

    protected _getValueFromData(item: Field) {
        let props = item.field.split('.');
        if (props.length > 1) {
            let obj = this.model.data;
            props.forEach(prop => obj = obj[prop]);
            return obj;
        }
        return this.model.data[item.field];
    }

    protected _setValueToObj(obj: any, prop: string, val: any) {
        let props = prop.split('.');
        if (props.length > 1) {
            let len = props.length - 1, index;
            for (index = 0; index < len; index++) {
                obj = obj[props[index]];
            }
            obj[props[index]] = val;
        }
        else { obj[prop] = val; }
    }
    protected _bindProps(item) {
        if (typeof item.props === 'function') {
            return item.props(this.model);
        }
        return typeof item.props === 'object' ? item.props : {}
    }
    protected _createFileElm(item: Field, value) {

        return h('div.custom-file', {
            on: this._getListener(item),
            style: this._getStyles(item.style),
            class: this._getStyles(item.class),
            props: {
                autofocus: item.autofocus,
            },
            attrs: {
                disabled: this._getBoolVal(item.disabled),
                multiple: item.multiSelect,
                required: item.required,
                ...this._bindProps(item)
            }
        },
            [
                h(`input.custom-file-input.form-control${this._getConCssClass(item)}`, {
                    attrs: {
                        id: item.field,
                        type: 'file'
                    }
                }),
                h('label.custom-file-label', {
                    attrs: { for: item.field }
                }, value || item.filePlaceholder || 'Choose file'),
                h('div.invalid-feedback', item.invalidFeedback)

            ]
        );
    }
    protected _createElement(item: Field, index) {
        if (this._getBoolVal(item.hide)) return [];
        const children = [];
        const labelPos = item.labelPos || this.options.labelPos || 'left';
        const childrenWithLabel = [];
        const field_value = this._getValueFromData(item);
        item.isValid = this._applyFieldValidation(item, field_value);
        if (labelPos === 'top' && item.label) {
            children.push(h(`label.col-form-label${item.elmSize ?
                '.col-form-label-' + item.elmSize : ''}`,
                { attrs: { for: item.field } },
                [this._getLabel(item) as any,h('span.required',this.options.validationMode==='normal'&&item.required?'*':'')]));
        }
        if (item.type === 'select') {
            children.push(this._createSelect(item, field_value));
        }
        else if (item.type === 'file') {
            children.push(this._createFileElm(item, field_value));
        }
        else {
            children.push(h(`input.form-control${this._getConCssClass(item)}`,
                {
                    key: item.field,
                    on: this._getListener(item),
                    style: this._getStyles(item.style),
                    class: this._getStyles(item.class),
                    props: {
                        type: item.type,
                        id: item.field,
                        name: item.field,
                        autofocus: item.autofocus,
                        required: item.required,
                        value: field_value,
                        disabled: this._getBoolVal(item.disabled),
                        ...this._bindProps(item)
                    }
                }));
        }

        if (item.info) {
            children.push(h('small.form-text.text-muted', item.info));
        }
        if (!item.isValid && item.invalidFeedback && item.type !== 'file' && this.options.validationMode==='fancy') {
            children.push(h('div.invalid-feedback',item.invalidFeedback));
        }
        else if(item['appear_validation_message'] && !item.isValid && item.invalidFeedback ){
            children.push(h('small.form-text..alert.alert-danger', item.invalidFeedback));
        }      
        if (labelPos === 'left' && item.label) {
            const labelSize = item.labelSize || this.options.labelSize || 2;

            childrenWithLabel.push(h(`label.col-form-label${item.elmSize ?
                '.col-form-label-' + item.elmSize : ''}${'.col-md-' + labelSize}`,
                { attrs: { for: item.field } },
                [this._getLabel(item) as any,h('span.required',this.options.validationMode==='normal'&&item.required?'*':'')]));
        }
        childrenWithLabel.push(h(`div.col-md-${item.size || 4}`, children));
        return childrenWithLabel;
    }
    protected _applyFieldValidation(field: Field, field_value: any) {

        if (!(this._getBoolVal(field.disabled) || this._getBoolVal(field.hide))
            && Array.isArray(field.validators) && field.validators.length) {
            this.validation_followup[field.field] = field.validators.find(fx => !fx(field_value, field)) === undefined;
            return this.validation_followup[field.field];
        }
        return true;

    }
    protected _getConCssClass(item: Field) {
        if (this.options.validationMode === 'fancy') {
            var css = item.isValid ? '.is-valid' : '.is-invalid';
            return css;
        }
        return '';
    }
    protected _createSelect(item: Field, field_value) {
        if (!item.data) item.data = [];
        if (!item.multiSelect && (item.data.length == 0 || item.data[0].value !== '0')) {
            item.data = [{ text: item.selectTitle || 'Select item', value: '0' }, ...item.data];
        }
        if (item.multiSelect) {
            if (!Array.isArray(field_value)) {
                field_value = [];
            }
            field_value = field_value.map(_ => _.toString());
        } else {
            if (!field_value) {
                field_value = '0';
            } else {
                field_value = field_value.toString();
            }
        }

        return h(`select.custom-select.form-control${this._getConCssClass(item)}`,
            {
                on: this._getListener(item),
                style: this._getStyles(item.style),
                class: this._getStyles(item.class),
                props: {
                    autofocus: item.autofocus,
                },
                attrs: {
                    disabled: this._getBoolVal(item.disabled),
                    multiple: item.multiSelect,
                    required: item.required,
                    id: item.field,
                    name: item.field,
                    ...this._bindProps(item)
                }
            },
            item.data.map((it, index) => {
                if (Array.isArray(it.options) && it.options.length > 0) {
                    return h('optgroup', {
                        key: item.field + index,
                        attrs: {
                            label: it.text
                        }
                    },
                        it.options.map(groupOption => h('option', {
                            key: groupOption.value,
                            attrs: {
                                selected: item.multiSelect ?
                                    field_value.indexOf(groupOption.value.toString()) !== -1 :
                                    field_value === groupOption.value.toString(),
                                value: groupOption.value,

                            }
                        }, groupOption.text)))
                }
                return h('option',
                    {
                        key: item.field + index,
                        attrs: {
                            selected: item.multiSelect ? field_value.indexOf(it.value.toString()) !== -1 : field_value === it.value.toString(),
                            value: it.value,

                        }
                    }, it.text);
            })
        );

    }
    protected _findTab(items, tabName) {
        for (let item of items) {
            if (item.type === 'tabs' && typeof item.tabs === 'object') {
                const find = item.tabs[tabName];
                if (find) { return [find, item]; }
            }
            else if (Array.isArray(item)) {
                const res = this._findTab(item, tabName);
                if (res) { return res; }
            }
            else if (Array.isArray(item.inputs)) {
                const res = this._findTab(item.inputs, tabName);
                if (res) { return res; }
            }

        }
        return null;
    }
    protected _findField(items, fieldName) {
        for (let item of items) {

            if (item.field === fieldName) {
                return item;
            }
            else if (Array.isArray(item)) {
                const res = this._findField(item, fieldName);
                if (res) { return res; }
            }
            else if (item.type === 'tabs' && typeof item.tabs === 'object') {
                Object.keys(item.tabs).forEach(key => {

                    if (item.tabs[key].field === fieldName) {
                        return item.tabs[key];
                    }
                    else if (Array.isArray(item.tabs[key])) {
                        const res = this._findField(item.tabs[key], fieldName);
                        if (res) { return res; }
                    }
                    else if (Array.isArray(item.tabs[key].inputs)) {
                        const res = this._findField(item.tabs[key].inputs, fieldName);
                        if (res) { return res; }
                    }

                });
            }
            else if (Array.isArray(item.inputs)) {
                const res = this._findField(item.inputs, fieldName);
                if (res) { return res; }
            }
        }
        return null;
    }
    public findTab(tabName) {
        if (this.options.inputs) {
            return this._findTab(this.options.inputs, tabName);
        }
        return null;
    }
    public findField(fiendName) {
        if (this.options.inputs) {
            return this._findField(this.options.inputs, fiendName);
        }
        return null;
    }
    public selectTab(tabName, item: Field = null) {
        if (!item) {
            item = this.findTab(tabName);
            if (item) { item = item[1]; }
        }
        if (item) {
            let prevTab = item.activeTab;
            const res = typeof item.tabClick === 'function' ?
                item.tabClick(this.model, tabName, item.activeTab) : true;
            if (typeof res === 'boolean') {
                if (res) {
                    item.activeTab = tabName;
                    this.dispatch({
                        type: TAB_CLICK,
                        payload: {
                            activeTab: tabName,
                            prevTab: prevTab,
                            data: this.model,
                            formName: this.options.name || 'form007'
                        }
                    }, true);
                }
            }
            else if (typeof res === 'object' && res.then) {
                res.then(isTrue => {
                    if (isTrue) {
                        item.activeTab = tabName;
                        this.dispatch({
                            type: TAB_CLICK,
                            payload: {
                                activeTab: tabName,
                                prevTab: prevTab,
                                data: this.model,
                                formName: this.options.name || 'form007'
                            }
                        }, true);
                    }
                })
            }
        }
        return this;
    }
    public refresh() {
        this.dispatch({ type: OPTIONS_CHANGED });
    }
    public showModal(options: { [key: string]: any } = { show: true }) {
        options = { backdrop: false, ...options }
        if (options.show) $('#' + this.modalId).modal(options);
        else $('#' + this.modalId).modal('hide');
    }
    public setSelectData(fieldName, data) {
        const item = this.findField(fieldName);
        if (item) {
            item.data = data;
        }
        return this;
    }
    public setFormData(data) {
        this.model.data = data;
        return this;
    }
    public getFormData() {
        return Object.assign({}, this.model.data, this.FILES);
    }
    public get isValid(): boolean {
        return Object.keys(this.validation_followup)
            .find(key => !this.validation_followup[key]) === undefined;
    }
    public onDestroy() {
        if (this.options.viewMode === 'modal') {
            $('#' + this.modalId).modal('dispose');
        }
    }
}

export { juForm, TAB_CLICK, FORM_VALUE_CHANGED, SELECT_DATA_ACTION, map_select_data_Action }
