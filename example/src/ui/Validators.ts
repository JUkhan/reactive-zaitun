import {Field} from './uimodel';
export class Validators {

    static required(message?: string): any {
        return function (val: any, field:Field): boolean {
            field.required=true;   
            field.invalidFeedback=message||'Please fill out this field';         
            if (field.type === 'select') {
                val = val || '0';
                return val == '0' ? false : true;
            }            
            return !!val ;           
        }
    }

    static minNumber(limit: number, message?: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback=message || `Enter a value greater than or equal to ${limit}`;
            val = isNaN(val)?0:Number(val);
            return !(val< limit);
        }
    }
    static maxNumber(limit: number, message?: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback=message || `Enter a value less than or equal to ${limit}`
            val = isNaN(val)?0:Number(val);
           return !(val > limit);
        }
    }
    static minLength(limit: number, message?: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback= message || `Minimum length is ${limit} characters.`;
            val = (val || '').toString();
            return !(val.length < limit);
        }
    }
    static maxLength(limit: number, message?: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback= message || `Maximum length is ${limit} characters.`;
            val = (val || '').toString();
            return !(val.length > limit) ;
        }
    }
    static email(message?: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback= message || 'Invalid email ID';
            val = (val || '').toString();
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(val);
        }
    }
    static regex(exp: RegExp, message: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback= message ;
            val = (val || '').toString();
            return exp.test(val);
        }
    }
    static validate(fx: (val: any) => boolean, message: string): Function {
        return function (val: any, field:Field): boolean {
            if(!val){return true;}
            field.invalidFeedback= message 
            return fx(val);
        }
    }
}