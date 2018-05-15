import {Injectable} from 'zaitun';

@Injectable('page')
export  class DisputeService{
    ch:any[];
    hccd:any;
    constructor(){
        this.ch=['','a','b','c','d','e','f','g','h','i','f','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        this._hcfaCode();
    }
    getPermission(){
        return Promise.resolve({ editable:true});
    }
    getRpr(params){
        const data=[];
        for (var index = 0; index < params.pageSize; index++) {
            data.push({shortDes:this._charByLimit(5), auto:false, des:this._charByLimit(25), hcfaCd:this._getHccd(), active:this._boolValue()})
        }
        return Promise.resolve({data,totalRecords:150});
    }
    getHcfa(){
        const data=[];
        for (var index = 1; index < 45; index++) {
            data.push({hcfaCd:this.hccd[index], type:index%2==0?'PDC':'MCSD', des:this._charByLimit(25)})
        }
        return Promise.resolve({data});
    }
    getType(){
        const data=[];
        data.push({text:'PDC', value:'PDC'});
        data.push({text:'MCSD', value:'MCSD'})
        return Promise.resolve({data});
    }
    _getHccd(){
         return this.hccd[Math.ceil(Math.random()*50)];
    }
    _hcfaCode(){
        this.hccd=[''];
        for (var index = 0; index < 50; index++) {
            this.hccd.push(this._charByLimit(2));            
        }
    }
    _boolValue(){
        return Math.ceil(Math.random()*2)===1
    }
    _randChar(){       
        return this.ch[Math.ceil(Math.random()*26)];
    }
    _charByLimit(limit){
        const res=[];
        for (var index = 0; index < limit; index++) {
            res.push(this._randChar());
        }
        return res.join('');
    }
}
