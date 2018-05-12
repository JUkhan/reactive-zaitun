
import { ViewObj, Action, Router, Dispatch } from 'zaitun';
import { div } from 'zaitun/dom';

import { FormOptions } from './ui/uimodel';
import {
    juForm,
    TAB_CLICK,
    FORM_VALUE_CHANGED,
    map_select_data_Action,
    SELECT_DATA_ACTION
} from './ui/juForm'
import Counter from './counter';

import { from } from 'rxjs';
//import 'rxjs/add/observable/from';
import { switchMap, filter, map } from 'rxjs/operators';
//import 'rxjs/add/operator/switchMap';
//import 'rxjs/add/operator/filter';
//import 'rxjs/add/operator/map';
//import 'rxjs/add/operator/do';
import { Validators } from './ui/Validators';
import { Effect } from 'zaitun-effect';
const COUNTER_UPDATE = 'counterUpdate';
const MY_FORM_UPDATE = 'my-form-update';

const myForm = new juForm();

function init() {
    return {
        form1: {
            data: { name: 'zaitun', age: '', address: '', address2: '' },
            options: getFormOptions(), counter: Counter.init()
        },

    }
}

function onCache(model: any) {
    model.form1.options = init().form1.options;
    return model;
}

function view({ model, dispatch, router }: ViewObj) {

    return myForm.view({
        model: model.form1,
        router,
        dispatch: router.bindEffect(action => dispatch({ type: MY_FORM_UPDATE, payload: action }))
    });

}

function update(model, action: Action) {

    switch (action.type) {
        case MY_FORM_UPDATE:
            switch (action.payload.type) {
                case FORM_VALUE_CHANGED:
                case TAB_CLICK:
                case SELECT_DATA_ACTION:
                    return { form1: myForm.update(model.form1, action.payload) };
                case COUNTER_UPDATE:
                    let counter = Counter.update(model.form1.counter, action.payload.payload);
                    return { form1: { ...model.form1, counter } };
            }
        default: return model;
    }

}
function loadCountryInfo(countryName) {
    return from(
        fetch(`https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=${countryName}&limit=5`)
            .then(res => res.json()))
        .pipe(
            map(res => res[1].map(_ => ({ text: _, value: _ }))))
}
function afterViewRender(dispatch, router: Router) {
    router.addEffect((eff: Effect) =>
        eff.whenAction(FORM_VALUE_CHANGED)
            .pipe(
                filter(action => action.payload.field.field === 'country'),
                switchMap(action => loadCountryInfo(action.payload.value)
                    .pipe(map(data => map_select_data_Action(action.dispatch, 'countryInfo', data)))
                ))
    );

    const fdata = myForm.getFormData();
    if (fdata.country) {
        loadCountryInfo(fdata.country)
            .subscribe(data => {
                myForm.setSelectData('countryInfo', data);
                dispatch({ type: 'data-load' });
            });
    }
}
function getFormOptions(): FormOptions {
    return {
        viewMode: 'form',
        name: 'form1',
        labelSize: 2,
        labelPos: 'left',
        title: 'Form Title',
        inputs: [
            [{
                field: 'name', autofocus: true,
                label: model => `Name( ${model.data.name} )`,
                validators: [
                    Validators.required(),
                    Validators.minLength(5),
                    Validators.maxLength(7)
                ],
                type: 'text', size: 4, info: 'zaitun is awesome'
            },
            {
                field: 'date',
                label: 'Date of birth',
                disabled: (model) => !model.data.email,
                validators: [Validators.required()],
                props: { maxLength: 10, placeholder: '00/00/0000' },
                type: 'date',
                size: 4
            }],

            [{
                field: 'country',
                label: 'Country',
                validators: [Validators.required()],
                type: 'select', size: 4,
                data: [
                    { text: 'Bangladesh', value: 'bangladesh' },
                    { text: 'Pakistan', value: 'pakistan' },
                    { text: 'Saudi Arabia', value: 'saudi arabia' },
                    { text: 'India', value: 'india' },
                ]
            },
            {
                field: 'countryInfo',
                label: 'Country Info',
                validators: [Validators.required()],
                type: 'select', size: 4,
            }],
            {
                field: 'email',
                label: 'Email',
                type: 'email',
                validators: [Validators.email()]
            },
            {
                type: 'file',
                field: 'dataFile',
                invalidFeedback: '.jpg & .jpeg files are only allowed',
                fileExt: ['.jpg', '.jpeg'],
                label: 'Select file',
                validators: [Validators.required()]
            },
            {
                type: 'radio',
                inline: !false,
                size: 6,
                validators: [Validators.required()],
                name: 'mata',
                label: 'Select',
                field: 'radioOption',
                radioList: [
                    {
                        value: 'hide',
                        label: 'Hide Tab3',
                        type: 'radio', size: 3, info: 'zaitun is awesome'
                    },
                    {
                        value: 'show',
                        label: 'Show Tab3',
                        type: 'radio', size: 3, info: 'zaitun is awesome'
                    },
                ]
            },
            {
                label: 'Choose',
                type: 'checkbox',
                radioList: [
                    {

                        field: 'f1',
                        value: 'leave',
                        label: 'I love javascript', validators: [Validators.required()],
                        type: 'checkbox', size: 3, info: 'zaitun is awesome'
                    },
                    {

                        field: 'f2',
                        value: 'continue',
                        label: 'I love kotlin',
                        type: 'checkbox', size: 3, info: 'zaitun is awesome'
                    }]
            },
            {
                field: 'gender',
                type: 'select',
                label: 'Gender', elmSize: 'sm', validators: [Validators.required()],
                info: 'Slect the for test!',
                data: [
                    { text: 'Male', value: 1 },
                    { text: 'Female', value: 2 },
                    { text: 'test', value: 3 },
                    { text: 'test2', value: 4 }
                ]
            },
            {
                field: 'gender2',
                type: 'select', invalidFeedback: 'This field is mandatory',
                label: 'Gender', elmSize: 'sm', multiSelect: true,
                validators: [Validators.required()],
                info: 'Slect the for test!', props: { size: 10 },
                data: [
                    {
                        text: 'Group1', options: [
                            { text: 'Male', value: 1 },
                            { text: 'Female', value: 2 }]
                    },
                    {
                        text: 'Group2', options: [
                            { text: 'test', value: 3 },
                            { text: 'test2', value: 4 }]
                    }
                ]
            },
            {
                type: 'tabs',
                tabsCssClass: '.mb-4',
                tabsBodyCssClass: '.p-4',
                field: '',
                footer: [
                    { label: 'ADD', type: 'button' },
                    { label: 'remove', type: 'button' }
                ],
                activeTab: 'Tab1',
                tabClick: (model, tabName, preTab) => {
                    if (tabName === 'Tab2' && model.data.age !== '7') {
                        alert('Please enter age value 7');
                        return false;
                    }
                    else if (tabName === 'Tab3' && model.data.address !== 'dhaka') {
                        alert("Please enter address value 'dhaka'");
                        return false;
                    }
                    return true;
                },
                tabs: {
                    'Tab1': {
                        onInit: (dispatch: Dispatch) => {
                            console.log('Tab1-init');
                        },
                        onDestroy: (dispatch: Dispatch, model) => {
                            console.log('Tab1-destroy', model);
                        },
                        inputs: [
                            {
                                field: 'age',
                                type: 'number',
                                label: 'Age',
                                info: 'Enter value for next tab enable',
                                validators: [
                                    Validators.minNumber(5),
                                    Validators.maxNumber(10)
                                ]
                            }
                            , {
                                field: 'counter',
                                type: 'component',
                                actionType: COUNTER_UPDATE,
                                component: Counter
                            }
                        ]
                    },
                    'Tab2': {
                        disabled: model => !model.data.age,
                        inputs: [
                            {
                                field: 'address',
                                type: 'text',
                                label: 'Address',
                                info: 'Enter value for next tab enable',
                            }
                        ]
                    },
                    'Tab3': {
                        disabled: model => !model.data.address,
                        hide: model => model.data.radioOption === 'hide',
                        inputs: [
                            {
                                field: 'address2',
                                type: 'text',
                                label: 'Address2',
                                info: 'test danger'
                            }
                        ]
                    }
                }
            },
            {
                type: 'button',
                label: 'Submit',
                props: (model: any) => ({ disabled: !myForm.isValid }),
                on: { click: ev => console.log(myForm.getFormData()) }
            },
            {
                type: 'vnode',
                vnode: model => div('.card', JSON.stringify(model.data))
            }

        ]

    };
}
export default { init, view, update, afterViewRender, onCache }
