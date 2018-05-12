
import {assert} from 'chai';
import {Router, TestResult} from 'zaitun';
import counter from '../src/counter';
import navigate from './runApp';

describe('counter test',()=>{
    const router:Router=navigate('counter');    
    it('increment', ()=>{
        const model=router.getAppState().child;
        router.whenAction({type:counter.actions.INCREMENT}, (res:TestResult)=>{
            assert.equal(model.count+1,res.model.child.count);            
        })
       
    })

    it('decrement', ()=>{
        const model=router.getAppState().child;
        router.whenAction({type:counter.actions.DECREMENT}, (res:TestResult)=>{
            assert.equal(model.count-1,res.model.child.count);            
        })
       
    })

    it('increment effect(registered in rootComponent)', (done)=>{
        const model=router.getAppState();
        router.whenAction({type:counter.actions.INCREMENT}, (res:TestResult)=>{
            
            if(res.action.payload.type===counter.actions.INCREMENT){
                assert.equal(model.child.count+1,res.model.child.count); 
            }
            else if(res.action.type==='incAt'){
                assert.notEqual(model.incAt,res.model.incAt);
                done(); 
            }
                      
        }, true)
       
    })

    it('decrement effect(registered in rootComponent)', (done)=>{
        const model=router.getAppState();
        router.whenAction({type:counter.actions.DECREMENT}, (res:TestResult)=>{
            
            if(res.action.payload.type===counter.actions.DECREMENT){
                assert.equal(model.child.count-1,res.model.child.count); 
            }
            else if(res.action.type==='decAt'){
                assert.notEqual(model.decAt,res.model.decAt);
                done(); 
            }
                      
        }, true)
       
    })

    it('lazy increment effect(registered in rootComponent and CounterEffect service)', (done)=>{
        let model=router.getAppState();
        
        router.whenAction({type:counter.actions.LAZY}, (res:TestResult)=>{          
            if(res.action.payload.type===counter.actions.LAZY){
                assert.equal(res.model.child.msg,'loading...');  
            }
            else if(res.action.payload.type===counter.actions.INCREMENT){
                assert.equal(model.child.count+1,res.model.child.count); 
            }           
            else if(res.action.type==='incAt'){
                assert.notEqual(model.incAt,res.model.incAt);
                done(); 
            }
                      
        }, true)
       
    })
})