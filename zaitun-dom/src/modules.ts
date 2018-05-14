import {Module} from 'snabbdom/modules/module';
import ClassModule from 'snabbdom/modules/class';
import PropsModule from 'snabbdom/modules/props';
import AttrsModule from 'snabbdom/modules/attributes';
import StyleModule from 'snabbdom/modules/style';
import DatasetModule from 'snabbdom/modules/dataset';
import Eventlisteners from 'snabbdom/modules/eventlisteners';

export const Modules: Array<Module> = [
  StyleModule,
  ClassModule,
  PropsModule,
  AttrsModule,
  DatasetModule,
  Eventlisteners
];

export {StyleModule, ClassModule, PropsModule, AttrsModule, DatasetModule, Eventlisteners};


