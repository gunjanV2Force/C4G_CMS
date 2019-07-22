import { LightningElement, api, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getBaseObjInfo from '@salesforce/apex/RuleSetController.getBaseObjectInfo';
import getObjInfo from '@salesforce/apex/RuleSetController.getSobjectInfo';

export default class RulesComponent extends LightningElement {
    @api baseObject;
    @api activeRule;

    @track sobjectData;
    @track baseObjData;
    @track error;
    @track accordianLabel;

    @track ruleInfo;

  

    @track _rule;

    @track objectSelectOptions = [];
    @track fieldSelectOptions = [];
    @track operatorSelectOptions = [];
    @track objSelectedValue;
    @track fieldSelectedValue;
    @track operatorSelectedValue;
    @track dataType;
    @track matchingValuePrimary = ""; 
    @track matchingValueSecondary = "";
    //
    @track matchingPriorityOptions = [
    {label : '--None--' , value:''},
    {label : 'Required' , value:'Required'},
    {label : 'High' , value : 'High'},
    {label : 'Medium' , value : 'Medium'},
    {label : 'Low' , value : 'Low'}
    ];
    @track matchingPriorityValue='';
    @track IsBooleanField;
    
    @track typeWiseOperators = 
    {
        'DATE' : ['Equals', 'Does not equal', 'Greater than', 'Less than', 'Greater than and less than', 'Within dynamic date range'],
        'DATETIME' : ['Equals', 'Does not equal', 'Greater than', 'Less than', 'Greater than and less than', 'Within dynamic date/time range'],
        'REFERENCE' : ['Equals', 'Does not equal'],
        'ID' : ['Equals', 'Does not equal'],
        'PICKLIST' : ['Equals'],
        'MULTIPICKLIST' : ['Equals'],
        'BOOLEAN' : ['Equals'],
        'INTEGER' : ['Equals', 'Does not equal', 'Greater than', 'Less than', 'Greater than and less than'],
        'DOUBLE' : ['Equals', 'Does not equal', 'Greater than', 'Less than', 'Greater than and less than'],
        'CURRENCY' : ['Equals', 'Does not equal', 'Greater than', 'Less than', 'Greater than and less than'],
        'STRING' : ['Equals', 'Does not equal', 'Contains', 'Starts With'],
        'PHONE' : ['Equals', 'Does not equal', 'Contains', 'Starts With'],
        'EMAIL' : ['Equals', 'Does not equal', 'Contains', 'Starts With'],
        'TEXTAREA': ['Equals', 'Does not equal', 'Contains', 'Starts With'],
        'ADDRESS' : ['Match Radius In Miles'],
    }
 
    constructor()
    {
        super();
        this.fieldSelectedValue = "";
        this.operatorSelectedValue = "";
        this.fieldSelectOptions = [];
        this.objectSelectOptions = [];
        this.operatorSelectOptions = [];
        this.IsBooleanField=false;
        this.activeRule="True";
       // this.matchingPriorityOptions =[];
        this.fieldSelectOptions.push({label : "--None--", value: ""});
        this.operatorSelectOptions.push({label : "--None--", value: ""});
        //
        //this.matchingPriorityOptions.push({label : "--None--", value: ""});
    }


    @wire(getBaseObjInfo, { objName: '$baseObject' }) 
    wiredBaseObjData({ error, data }) {
        if (data) {
            console.log('==wiredBaseObjData==data=====',Object.keys(data));
            console.log('==data.fields=====',JSON.stringify(data.mapFields));
            console.log('==data.parentRelationships=====',JSON.stringify(data.mapParentRelationships));
            console.log('==data.childRelationships=====',JSON.stringify(data.mapChildRelationships));
            this.baseObjData = data;
            this.sobjectData = data;  
            this.objSelectedValue = data.objName;
            this.objectSelectOptions = [];
            
            Object.values(data.mapParentRelationships).forEach(reln => {
                this.objectSelectOptions.push({label : reln.objLabel + ' (' +  reln.fieldLabel + ')', value: reln.objName});
              });

              this.objectSelectOptions.push({label : data.objLabel, value: data.objName});

            Object.values(data.mapChildRelationships).forEach(reln => {
                this.objectSelectOptions.push({label : reln.objPluralLabel + ' (' +  reln.fieldLabel + ')', value: reln.objName});
            });
            this.fieldSelectOptions = [];
            this.fieldSelectedValue = "";
            this.fieldSelectOptions.push({label : "--None--", value: ""});
            Object.values(data.mapFields).forEach(fldInfo => {
                this.fieldSelectOptions.push({label : fldInfo.fieldLabel, value: fldInfo.fieldAPIName});
            });
            console.log('====objectSelectOptions====',JSON.stringify(this.objectSelectOptions));
            console.log('====fieldSelectOptions====',JSON.stringify(this.fieldSelectOptions));
            this.error = undefined;
           //this.sendRuleToParentOnEveryAction();
        } else if (error) {
            this.error = error; 
            this.baseObjData = undefined;
        }
    }

    handleObjSelection(e)
    {
        console.log('===e.detail.value==',e.detail.value);
        this.objSelectedValue = e.detail.value;
        this.fieldSelectedValue = "";
        this.dataType = "";
        getObjInfo({
            objName: e.detail.value,
            isGetRelationship: false
        })
        .then((result) => {
            console.log('==result=',result);
            this.fieldSelectOptions = []; 
            this.fieldSelectedValue = "";
            this.fieldSelectOptions.push({label : "--None--", value: ""});

            Object.values(result.mapFields).forEach(fldInfo => {
                this.fieldSelectOptions.push({label : fldInfo.fieldLabel, value: fldInfo.fieldAPIName});
            });

            this.sobjectData = result; 
            this.sendRuleToRuleSetOnEveryAction();
        })
        .catch((error) => {
            this.message = 'Error received: code' + error.errorCode + ', ' +
                'message ' + error.body.message;
        });
    }

    handleFieldSelection(e)
    {
        console.log('==HANDLE FIELDSELECTION START');
        this.resetValues();
        console.log('===e.detail.value==',e.detail.value);
        this.fieldSelectedValue = e.detail.value;
        var objApiName = this.objSelectedValue;
        console.log('===objApiName==',objApiName);
        console.log('===this.sobjectData==',this.sobjectData);
        this.dataType = this.sobjectData.mapFields[this.fieldSelectedValue].fieldType;
        console.log('===dataType==',this.dataType);
        var currentOperators = this.typeWiseOperators[this.dataType];
        this.operatorSelectedValue = "";
        this.operatorSelectOptions = [];
        this.operatorSelectOptions.push({label : "--None--", value: ""});
        this.IsBooleanField = this.dataType === 'BOOLEAN'? true : false;
        console.log("==BOOLEANFIELD"+this.IsBooleanField);
        currentOperators.forEach(operatorVal => {
            this.operatorSelectOptions.push({label : operatorVal, value: operatorVal});
        });
        this.sendRuleToRuleSetOnEveryAction();
        console.log('==HANDLE FIELDSELECTION END');
    }

    handleOperatorSelection(e)
    {
        console.log('===e.detail.value==',e.detail.value);
        console.log('===this.operatorSelectedValue==',this.operatorSelectedValue);
        this.operatorSelectedValue = e.detail.value;
        this.sendRuleToRuleSetOnEveryAction();
    } 
     //
     handleMatchingPriority(e)
     {
         /*console.log('===e.detail.value==',e.detail.value);
         this.matchingPriorityValue = e.detail.value;
         this.sendRuleToParentOnEveryAction();*/
     } 
 
    sendRuleToRuleSetOnEveryAction() 
    {
        // Creates the event with the contact ID data.
        var ruleCurrent = Object.assign({}, this._rule); 
        console.log('=sendRuleToRuleSetOnEveryAction==ruleCurrent=BEFORE==', JSON.stringify(ruleCurrent));
        ruleCurrent.objectApiName = this.objSelectedValue;
        ruleCurrent.fieldApiName = this.fieldSelectedValue;
        ruleCurrent.operator = this.operatorSelectedValue;
        ruleCurrent.primaryValue = this.matchingValuePrimary;
        ruleCurrent.secondaryValue = this.matchingValueSecondary;
        //
        ruleCurrent.matchPriority = this.matchingPriorityValue;
        console.log('=sendRuleToParentOnEveryAction==ruleCurrent=AFTER==', JSON.stringify(ruleCurrent));
        var ruleModifyEvent = new CustomEvent('rulemodify', { detail: ruleCurrent});
        
        // Dispatches the event.
        this.dispatchEvent(ruleModifyEvent);
    }

    handleRuleLabelChange(e)
    {     
        console.log('====handleRuleLabelChange=CALLED=',e.target.value);
        console.log('====Master Rule=',this._rule.masterLabel);
        var temp = e.target.value;
        var ruleCurrent = Object.assign({}, this._rule); 
        ruleCurrent.masterLabel = temp;
        console.log('====handleRuleLabelChange=11=',temp);
        //this._rule.masterLabel = e.target.value;
        console.log('====handleRuleLabelChange==',temp);
        ruleCurrent.developerName = temp.replace(/\s+/g, '_');
        this._rule = ruleCurrent; 
        var ruleIndexAcc = this.rule.index + 1;
        //this.accordianLabel='Rule'+ruleIndexAcc+'-'+temp;
        console.log('====this.accordianLabel==',this.accordianLabel);
        this.sendRuleToRuleSetOnEveryAction(); 
    } 

    handleMatchValueModify(event)
    {
        this.matchingValuePrimary = event.detail.matchingValuePrimary;
        this.matchingValueSecondary = event.detail.matchingValueSecondary;
        console.log('=IAM RULE=handleMatchValueModify===',JSON.stringify(event.detail));
        this.sendRuleToRuleSetOnEveryAction();
    }

    resetValues(){
        this.matchingValuePrimary = null;
        this.matchingValueSecondary = null;
    }
    refreshRule()
    {

    }

    @api
    get rule() {
        return this._rule;
    }
    set rule(value) {
        //this.setAttribute('fieldApiName', value);
        this._rule = value;
        var ruleIndexAcc = value.index + 1;
        if(value.masterLabel){
        this.accordianLabel='Rule'+ruleIndexAcc+'-'+value.masterLabel;
        console.log('==ACCORDIAN=='+this.accordianLabel);
        }
        else
        {
            this.accordianLabel='Rule'+ruleIndexAcc; 
        }
        this.refreshRule();
    }
}