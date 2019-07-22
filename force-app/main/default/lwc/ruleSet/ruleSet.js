import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRuleSetInfo from '@salesforce/apex/RuleSetController.getRuleSetInfo';
import resourceContainer from '@salesforce/resourceUrl/C4G_Assets';
import { loadStyle } from 'lightning/platformResourceLoader';


export default class RuleSetComponent extends LightningElement {
    @track error 
    @track ruleIndex;

    @track NameValid='First';
    @track NameField;
    @track activeSectionMessage = '';
    @track ruleName;
    @track ruleList = [];
    @track baseObject = 'Contact'; 

    @track _ruleSetId ;
    @track ruleSet = {lstRule:[]}; 
    @track rules = [];


 
    
    //@track activeSections = ['settings', 'rulesets'];
    styleCss = resourceContainer + '/css/customstyle.css';

    /*@wire(getRuleSetInfo, { ruleSetId : '$ruleSetId' }) 
    wiredRuleSetGet({ error, ruleSetData }) {
        console.log('==wiredRuleSetGet='+JSON.stringify(ruleSetData));
        if (ruleSetData) {
            console.log('==wiredBaseObjData==data=====',JSON.stringify(ruleSetData));
            this.ruleSet = ruleSetData; 
            console.log('==this.ruleSet==data=====',JSON.stringify(this.ruleSet));
            this.error = undefined; 
            
        } else if (error) {
            this.error = error;
            console.log('--Inside error rulesetInfo--'+JSON.stringify(this.error));
            this.ruleSet = undefined; 
        }
    }*/

    constructor()
    {
        console.log('inside rulesetInfor const');
        super();

        console.log('end rulesetInfor const');
    }
    showToast() {
        const evt = new ShowToastEvent({
            title: 'Rule Set Name Field Is Invalid',
            message: ' Please put something else other than ABC in Name field',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }

 

    connectedCallback(){
        this.handleNewRule();
    }

    handleChangeNName(e){
        console.log('==>Inside  NameValid');
        this.NameValid = e.detail.value;
        console.log('==> NameValid'+NameValid);
    }
    handleToggleSection(event) { 
        this.activeSectionMessage =
            'Open section name:  ' + event.detail.openSections;
    }
    
    CheckValidation(){
        var lpElement = this.template.querySelector('.RuleSetName');
        if(lpElement.value === 'ABC'){
            lpElement.setCustomValidity("John Doe is already registered");
        }
        else {
            lpElement.setCustomValidity("");
        }
        lpElement.reportValidity();
    }

    handleNewRule(e) 
    {
        
        var rulesLength = this.ruleSet.lstRule.length;
        console.log('=rulesLength===',rulesLength); 
        this.ruleSet.lstRule.push({index: rulesLength, objectApiName : this.baseObject});   
        console.log('this.ruleSetlstRule'+JSON.stringify(this.ruleSet.lstRule));
    }

    ruleModificationHandle(event)
    {
        console.log('=ruleModificationHandle FIRED==',JSON.stringify(event.detail));
        var indexOfModify = event.detail.index;
        this.ruleSet.lstRule[indexOfModify] = event.detail;
        console.log('=ruleModificationHandle FIRED==this.ruleSet.lstRule==',JSON.stringify(this.ruleSet.lstRule));
    } 

    refreshRuleSet()
    {

    }

    @api
    get ruleSetId() {
    return this._ruleSetId;
    }
    set ruleSetId(value) {
        //this.setAttribute('fieldApiName', value);
        this._ruleSetId = value;
        if(this._ruleSetId=null){
            this.ruleSet.lstRule.push({index: 0, objectApiName : this.baseObject});
        }
        else{
                this.getRuleSetInfo(value);
            }
        this.refreshRuleSet();
    }

    getRuleSetInfo(value){
        console.log('inside RuleSetInfo');
        getRuleSetInfo({
            ruleSetId: value
        })
        .then((ruleSetData) => {
            console.log('==wiredBaseObjData==data=====',JSON.stringify(ruleSetData));
                this.ruleSet = ruleSetData; 
                console.log('==this.ruleSet==data=====',JSON.stringify(this.ruleSet));
                this.error = undefined;
        })
        .catch((error) => {
            this.message = 'Error received: code' + error.errorCode + ', ' +
                'message ' + error.body.message;
        });

    }
    renderedCallback() {    
          console.log('selectjs loading');
    Promise.all([
        loadStyle(this, this.styleCss),
        
    ]).then(() => {})
    .catch(error => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error loading selectJs',
                message: error.message,
                variant: 'error'
            })
        );
    });

}
}


/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-console */