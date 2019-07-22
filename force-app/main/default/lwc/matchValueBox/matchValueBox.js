import { LightningElement, wire, api, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import getPickFieldValues from '@salesforce/apex/RuleSetController.getPicklistFieldValues';

export default class MatchValueBox extends LightningElement {
    @api ruleId;
    @api fieldType;
    @track _fieldApiName;
    @track _objApiName;
    @track _operator; 

    @track matchingValPrimaryCurrency;
    @track matchingValSecondaryCurrency;

    @track matchingValPrimaryDate;
    @track matchingValSecondaryDate;

    @track matchingValPrimaryDateTime;
    @track matchingValSecondaryDateTime;
    @track withinRange;
    get withinRangeOptions (){ 
        return [{label : 'Today' , value:'Today'},
    {label : 'Yesterday' , value:'Yesterday'},
    {label : 'Next Month' , value:'Next Month'},
    {label : 'This Month' , value:'This Month'},
    {label : 'Last Month' , value:'Last Month'},
    {label : 'Next Fiscal Year' , value:'Next Fiscal Month'},
    {label : 'This Fiscal Year' , value:'This Fiscal Year'},
    {label : 'Last Fiscal Year' , value:'Last Fiscal Year'},
              ];
    }

    //Text is used for Id,ReferenceID and Text
    @track matchingValPrimaryText; 
    
    //Variables used for picklist and multiselect picklist
    @track multiPickSelectedValues;
    @track picklistSelectOptions;
    @track pickSelectedValue;

    @track checkBoxValue;
    @track checkBoxChoices = [
        {label:'--None--', value:''},
        {label:'True', value:'True'},
        {label:'False', value:'False'}];

    @track matchingAddress;

    @track matchingValPrimaryNum;
    @track matchingValSecondaryNum;

    @track matchingTextArea;

    @api matchingValuePrimary;
    @api matchingValueSecondary;
    @api matchingMultiSelect;
    
    //Decision based on operators
    @track isSingleInput;
    @track isTwoInputs;
    @track isRangePicklist;
 
    //Decides the data Types of fields
    @track isNumber; 
    @track isCurrency;
    @track isDate;
    @track isDateTime; 
    @track isText;
    @track isID;
    @track isReference; 
    @track isPicklist;
    @track isMultiPicklist;
    @track isBoolean;
    @track isAddress;
    @track isTextArea;

    @track resetValidation;

    


    constructor()
    { 
        super();
        console.log('==> CONSTRUCTOR START');
        this.refreshRule();
        if(this.ruleId)
        {
            this.renderOnLoadIfExistingRule();
        }
        console.log('==> CONSTRUCTOR END');
    }

    /*@api 
    get isPicklist(){
        return this.fieldType == 'PICKLIST' ? true : false;    
    }
    set isPicklist(value){
        
    }*/
    /*@wire (getPickFieldValues, {objectName: '$objApiName' ,pickListFieldName: '$fieldApiName'})
    getPickList({error,options}){
        if(options){
            var pickOptions = [];
                
                console.log('===options===',options);
                pickOptions.push({label : "--None--", value: ""});
                
                options.forEach(pickVal => {
                    pickOptions.push({label : pickVal, value: pickVal});
                });
                console.log('===pickOptions===',JSON.stringify(pickOptions));
                this.picklistSelectOptions = pickOptions;
        }
        else{
            console.log('error'+JSON.stringify(error));
        }
    }*/
    // GET OBJECT INFO
    /*@wire (getObjectInfo, {objectApiName: '$_objApiName'})
    setObjInfo({error, data}) {
        if (data) {
        // Apparently combobox doesn't like it if you dont supply any options at all.
        // Even though selectedOption was assigned in step 1, it wont "select" it unless it also has options
        this._recordTypeId = data.defaultRecordTypeId;
        console.log('this._recordTypeId ====',this._recordTypeId );
        } else if (error) {
        console.log('setObjInfo====',error);
        }
    }
        // Step 2, determined by when the reactive bind is changed
    @wire(getPicklistValues, { recordTypeId: '$_recordTypeId', fieldApiName: '$_picklistFieldApiName' })
    setPicklistOptions({error, data}) {
        if (data) {
        // Apparently combobox doesn't like it if you dont supply any options at all.
        // Even though selectedOption was assigned in step 1, it wont "select" it unless it also has options
        console.log('===Options====',data.values);
        } else if (error) {
            console.log('setPicklistOptions====',error);
        }
    }*/

    decideDataType()
    {
        //this.pickSelectedValue = "";
        //this.picklistSelectOptions = [{label : "--None--", value: ""}];
        this.isNumber = this.fieldType === 'DOUBLE' || this.fieldType === 'INTEGER' ? true : false;
        this.isCurrency = this.fieldType === 'CURRENCY' ? true : false;
        this.isDate = this.fieldType === 'DATE' ? true : false;
        this.isDateTime = this.fieldType === 'DATETIME' ? true : false;
        this.isText = this.fieldType === 'STRING' || this.fieldType === 'PHONE' ? true : false;
        this.isReference = this.fieldType === 'REFERENCE' ? true : false;
        this.isPicklist = this.fieldType === 'PICKLIST' ? true : false;
        this.isMultiPicklist = this.fieldType === 'MULTIPICKLIST' ? true : false;
        this.isBoolean = this.fieldType === 'BOOLEAN' ? true : false;
        this.isAddress = this.fieldType === 'ADDRESS' ? true : false;
        this.isTextArea = this.fieldType === 'TEXTAREA' ? true : false;
        this.isID = this.fieldType === 'ID' ? true : false;
    }
    

    renderOnLoadIfExistingRule()
    {
        if(this.isNumber)
        {
            if(this.matchingValuePrimary)
            {
                this.matchingValPrimaryNum = this.matchingValuePrimary;
            }
            if(this.matchingValSecondaryNum)
            {
                this.matchingValSecondaryNum = this.matchingValSecondaryNum;
            }
        }

        if(this.isPicklist) 
        {
            if(this.matchingValuePrimary)
            {
                console.log('==>IsPickList is true');
                this.pickSelectedValue = this.matchingValuePrimary;
            }
        } 
    }

    renderIfUpsertRule()
    {
        if(!this.isNumber) 
        {
            this.matchingValPrimaryNum = null;
            this.matchingValSecondaryNum = null;
        }

        if(!this.isCurrency) 
        {
            this.matchingValPrimaryCurrency = null;
            this.matchingValSecondaryCurrency = null;
        }

        if(this.isDate) 
        {
            this.matchingValPrimaryDate = null;
            this.matchingValSecondaryDate = null;
        }

        if(this.isDateTime) 
        {
            this.matchingValPrimaryDateTime = null;
            this.matchingValSecondaryDateTime = null;
        } 
        if(this.isMultiPicklist)
        {
            getPickFieldValues({
                objectName: this.objApiName,
                pickListFieldName: this.fieldApiName
            })
            .then((options) => {
                var pickOptions = [];
                options.forEach(pickVal => {
                    pickOptions.push({label : pickVal, value: pickVal});
                });
                this.picklistSelectOptions = pickOptions;
            })
            .catch((error) => {
                this.message = 'Error received: code' + error.errorCode + ', ' +
                    'message ' + error.body.message;
            });
        }
        
        if(this.isPicklist)
        {
            console.log('checking if the field is picklist'+this.isPicklist);
            console.log('objectName'+this.objApiName+'fieldName'+this.fieldApiName);
            getPickFieldValues({
                objectName: this.objApiName,
                pickListFieldName: this.fieldApiName
            })
            .then((options) => {
                var pickOptions = [];
                
                console.log('===options===',options);
                pickOptions.push({label : "--None--", value: ""});
                
                options.forEach(pickVal => {
                    pickOptions.push({label : pickVal, value: pickVal});
                });
                console.log('===pickOptions===',JSON.stringify(pickOptions));
                this.picklistSelectOptions = pickOptions;
            })
            .catch((error) => {
                this.message = 'Error received: code' + error.errorCode + ', ' +
                    'message ' + error.body.message;
            });
            console.log('end if the field is picklist'+this.isPicklist); 
        }
        else
        {
            this.pickSelectedValue = ""; 
        }
    }

    decideTypeFilterBasedOnDataType()
    {
        this.decideDataType();
        console.log('===objApiName==',this.objApiName, '==',this._objApiName);
        console.log('===fieldApiName==',this.fieldApiName, '==',this._fieldApiName);
        this.renderIfUpsertRule();
        
    }
   

    handlePrimaryCurrencyChange(e)
    {
        //this.resetValues();
        console.log('====handlePrimaryCurrencyChange==',e.target.value);
        this.matchingValPrimaryCurrency = e.target.value;
        this.matchingValuePrimary = this.matchingValPrimaryCurrency;

        if(this.isTwoInputs == true){
            var validOnCurrency1 = this.template.querySelector(".currency1");
            var validOnCurrency2 = this.template.querySelector(".currency2");
            //this.resetValues();

            console.log('====handlePrimaryCurrency==',e.target.value);
            

            validOnCurrency2.setCustomValidity('');
            if(this.matchingValueSecondary == "" || e.target.value == "" || this.matchingValueSecondary==null ||e.target.value == null){
                    console.log('Inside Primary Validatin');
                    validOnCurrency1.setCustomValidity('Both From and To Currencies must be entered');
                    
            }
                    
                else{
                    console.log("Number INVALID CASE");
                    validOnCurrency1.setCustomValidity('');
                }  
            
                validOnCurrency1.reportValidity(); 
                validOnCurrency2.reportValidity();
        }
        this.sendMatchValueToRuleOnEveryAction();
    }
    handleSecondaryCurrencyChange(e){
        //this.resetValues();
        console.log('====handleSecondaryCurrencyChange==',e.target.value);
        this.matchingValSecondaryCurrency = e.detail.value;
        this.matchingValueSecondary = this.matchingValSecondaryCurrency;

        if(this.isTwoInputs == true){
            var validOnCurrency1 = this.template.querySelector(".currency1");
            var validOnCurrency2 = this.template.querySelector(".currency2");
            //this.resetValues();

            console.log('====handlePrimaryDateTimeChange==',e.target.value);
            

            validOnCurrency1.setCustomValidity('');
            if(this.matchingValuePrimary == "" || e.target.value == ""){
                    console.log('Inside Primary Validatin');
                    validOnCurrency2.setCustomValidity('Both From and To Currencies must be entered');
                    
            }
                    
                else{
                    console.log("Number INVALID CASE");
                    validOnCurrency2.setCustomValidity('');
                }  
            
                validOnCurrency1.reportValidity(); 
                validOnCurrency2.reportValidity();
        }
        this.sendMatchValueToRuleOnEveryAction();
    }

    handlePrimaryDateChange(e)
    {

        this.matchingValPrimaryDate = e.detail.value;
        this.matchingValuePrimary = this.matchingValPrimaryDate;

        if(this.isTwoInputs == true){
            var primaryDate = new Date(e.target.value);
            var secondaryDate = new Date(this.matchingValueSecondary);
            var validOnDate1 = this.template.querySelector(".date1");
            var validOnDate2 = this.template.querySelector(".date2");
            console.log('====secondaryDateINPrimaru==',secondaryDate);

            //this.resetValues();
            console.log('====handlePrimaryDateChange==',e.target.value);
            console.log('====HandleSECONDARYInPrimary==',this.matchingValueSecondary);
            

            validOnDate2.setCustomValidity('');
            if(this.matchingValueSecondary != null && e.target.value != null){
                if( primaryDate < secondaryDate ){
                    console.log('Inside Primary Validatin');
                    validOnDate1.setCustomValidity('');
                    
                }
                else{
                    console.log("DATE INVALID CASE");
                    validOnDate1.setCustomValidity('From Date should be less than To');
                }  
            }
            validOnDate1.reportValidity(); 
            validOnDate2.reportValidity();
        }
        

        /*if(this.matchingValueSecondary !== null){
        this.matchingValSecondaryDate = this.matchingValueSecondary;
        }*/
        this.sendMatchValueToRuleOnEveryAction();
    }


    handleSecondaryDateChange(e){
        //this.resetValues();

        var primaryDate = new Date(this.matchingValuePrimary);
        var secondaryDate = new Date(e.target.value);
        var validOnDate1 = this.template.querySelector(".date1");
        var validOnDate2 = this.template.querySelector(".date2");

        this.matchingValSecondaryDate = e.detail.value;
        this.matchingValueSecondary = this.matchingValSecondaryDate;

        console.log('==primaryDate=',primaryDate);
        console.log('==secondaryDate=',secondaryDate);

        console.log('==inputCmp=',validOnDate2);
        console .log('====handleSecondaryDateChange==',e.target.value);

        validOnDate1.setCustomValidity('');
        if(this.matchingValuePrimary != null && e.target.value != null){
            if( secondaryDate > primaryDate) {
            console.log('====HandlePrimaryINSECONDARY==',this.matchingValuePrimary);
            validOnDate2.setCustomValidity("");
            }

            else{
                console.log("DATE INVALID CASE");
                validOnDate2.setCustomValidity('To Date should be greater than From');
            }  // if there was a custom error before, reset it
        }
        validOnDate2.reportValidity(); 
        validOnDate1.reportValidity(); //
        this.sendMatchValueToRuleOnEveryAction();
    }

    handleDateWithinRangeChange(e){
        //this.resetValues();
        console.log('====handleDateWithinRangeChange==',e.target.value);
        this.withinRange = e.detail.value;
        this.matchingValuePrimary = this.withinRange;
        this.sendMatchValueToRuleOnEveryAction();

    }

    handlePrimaryDateTimeChange(e){

        this.matchingValPrimaryDateTime = e.target.value;
        this.matchingValuePrimary = this.matchingValPrimaryDateTime;

        if(this.isTwoInputs == true){
            var primaryDate = new Date(e.target.value);
            var secondaryDate = new Date(this.matchingValueSecondary);

            var validOnDate1 = this.template.querySelector(".dateTime1");
            var validOnDate2 = this.template.querySelector(".dateTime2");
            //this.resetValues();

            console.log('====handlePrimaryDateTimeChange==',e.target.value);
            

            validOnDate2.setCustomValidity('');
            if(this.matchingValueSecondary != null && e.target.value != null){
                if( primaryDate < secondaryDate ){
                    console.log('Inside Primary Validatin');
                    validOnDate1.setCustomValidity('');
                    
                }
                else{
                    console.log("DATE INVALID CASE");
                    validOnDate1.setCustomValidity('From Date should be less than To');
                }  
            }
            validOnDate1.reportValidity(); 
            validOnDate2.reportValidity();
        }
        this.sendMatchValueToRuleOnEveryAction();
    }

    handleSecondaryDateTimeChange(e){
         var primaryDate = new Date(this.matchingValuePrimary);
        var secondaryDate = new Date(e.target.value);

        var validOnDate1 = this.template.querySelector(".dateTime1");
        var validOnDate2 = this.template.querySelector(".dateTime2");
        

        //this.resetValues();
        console.log('====handleSecondaryDateTimeChange==',e.target.value);
        this.matchingValSecondaryDateTime = e.target.value;
        this.matchingValueSecondary = this.matchingValSecondaryDateTime;


        validOnDate1.setCustomValidity('');
        if(this.matchingValuePrimary != null && e.target.value != null){
            if( secondaryDate > primaryDate ){
                console.log('Inside Primary Validatin');
                validOnDate2.setCustomValidity('');
                
            }
            else{
                console.log("DATE INVALID CASE");
                validOnDate2.setCustomValidity('To Date should be greater than From');
           }  
        }
        validOnDate1.reportValidity(); 
        validOnDate2.reportValidity();


        this.sendMatchValueToRuleOnEveryAction();
    }

    handlePrimaryTextChange(e){
        //this.resetValues();
        console.log('====handlePrimaryTextChange==',e.target.value);
        this.matchingValPrimaryText = e.target.value;
        this.matchingValuePrimary = this.matchingValPrimaryText;
        this.sendMatchValueToRuleOnEveryAction();
    }

    handleMultiSChange(e){
        //this.resetValues();
        console.log('====handleMultiSChange==',e.detail.value);
        this.multiPickSelectedValues = e.detail.value;
        this.matchingValuePrimary = this.multiPickSelectedValues;
        this.sendMatchValueToRuleOnEveryAction();
    }

    handlePicklistChange(e){
        //this.resetValues();
        console.log('====handlePicklistChange==',e.detail.value);
        this.pickSelectedValue = e.detail.value;
        this.matchingValuePrimary = this.pickSelectedValue;
        this.sendMatchValueToRuleOnEveryAction();
    }

    handleCheckBoxChange(e){
        //this.resetValues();
        console.log('====handleCheckBoxChange==',e.detail.value);
        this.checkBoxValue = e.detail.value;
        this.matchingValuePrimary = this.checkBoxValue;
        this.sendMatchValueToRuleOnEveryAction();
    }

    handleAddressChange(e){}

    handleTextAreaChange(e){
        //this.resetValues();
        console.log('====handleTextAreaChange==',e.target.value);
        this.matchingTextArea = e.target.value;
        this.matchingValuePrimary = this.matchingTextArea;
        this.sendMatchValueToRuleOnEveryAction();
    }

    handlePrimaryNumChange(e){

        console.log('====handlePrimaryNumChange==',e.target.value);
        this.matchingValPrimaryNum = e.target.value;
        this.matchingValuePrimary = this.matchingValPrimaryNum;

        if(this.isTwoInputs == true){
            var validOnNumber1 = this.template.querySelector(".number1");
            var validOnNumber2 = this.template.querySelector(".number2");
            //this.resetValues();

            console.log('====handlePrimaryDateTimeChange==',e.target.value);
            

            validOnNumber2.setCustomValidity('');
            if(this.matchingValueSecondary == "" || e.target.value == "" || this.matchingValueSecondary==null ||e.target.value == null){
                    console.log('Inside Primary Validatin');
                    validOnNumber1.setCustomValidity('Both From and To Numbers must be entered');
                    
            }
                    
                else{
                    console.log("Number INVALID CASE");
                    validOnNumber1.setCustomValidity('');
                }  
            
            validOnNumber1.reportValidity(); 
            validOnNumber2.reportValidity();
        }
        this.sendMatchValueToRuleOnEveryAction();
    }

    handleSecondaryNumChange(e){
        
        console.log('====handleSecondaryNumChange==',e.target.value);
        this.matchingValSecondaryNum = e.target.value;
        this.matchingValueSecondary = this.matchingValSecondaryNum;

        if(this.isTwoInputs == true){  
            var validOnNumber1 = this.template.querySelector(".number1");
            var validOnNumber2 = this.template.querySelector(".number2");
            //this.resetValues();

            console.log('====handlePrimaryDateTimeChange==',e.target.value);
            

            validOnNumber1.setCustomValidity('');
            if(this.matchingValuePrimary == "" || e.target.value == "" ){
                    console.log('Inside seocndary number Validatin');
                    validOnNumber2.setCustomValidity('Both From and To Numbers must be entered');
                    
            }
                    
                else{
                    console.log("Number INVALID CASE");
                    validOnNumber2.setCustomValidity('');
                }  
            
            validOnNumber1.reportValidity(); 
            validOnNumber2.reportValidity();
        }

        this.sendMatchValueToRuleOnEveryAction();
    }

    resetValues(){
        //this.matchingValuePrimary =null;
        //this.matchingValueSecondary=null;

        this.matchingValPrimaryText=null;
        this.matchingValPrimaryCurrency=null;
        this.matchingValSecondaryCurrency=null;

        this.matchingValPrimaryDate=null;
        this.matchingValSecondaryDate=null;
    }

    /*get picklistSelectOptions()
    {

        console.log('===get picklistSelectOptions=',this._picklistSelectOptions);
        return this._picklistSelectOptions;
    }*/
    
    //https://salesforce.stackexchange.com/questions/253588/how-do-i-invoke-a-value-change-handler-in-lwc

    @api
    get fieldApiName() {
        return this._fieldApiName;
    }
    set fieldApiName(value) {
        this.resetValues();
        console.log('==> START FIELD API NAME SET');
        //this.setAttribute('fieldApiName', value);
        this._fieldApiName = value;
        this.refreshRule();
        console.log('==> END FIELD API NAME SET');
    }

    @api
    get objApiName() {
        return this._objApiName;
    } 
    set objApiName(value) {
        console.log('==> START OBJECT API NAME START');
        //this.setAttribute('objApiName', value);
        this._objApiName = value;
        //this.refreshRule();
        console.log('==> START OBJECT API NAME END ');
    }

    @api
    get operator() {
        return this._operator;
    }
    set operator(value) {
        console.log('==> START OPERATRO  NAME END ');
        this.setAttribute('operator', value);
        this._operator = value;
        console.log('this._operator-->'+this._operator);

        // Logic to display 1 or 2 input fields
        this.isSingleInput = this._operator === ''|| this._operator === 'Starts With' ||this._operator === null || this._operator === 'Equals' || this._operator ==='Contains' || this._operator ==='Greater than' || this._operator ==='Less than' || this._operator === 'Does not equal'? true : false;
        this.isRangePicklist = this._operator === 'Within dynamic date range' ||  this._operator === 'Within dynamic date/time range'? true : false;
        this.isTwoInputs = this.isSingleInput === true  ||  this.isRangePicklist === true ? false : true;
        
        console.log('this.isRangePicklist-->'+this.isRangePicklist);
        console.log('==> START OPERATRO  NAME END ');
    }

    refreshRule()
    {
        this.decideTypeFilterBasedOnDataType();
    } 

    sendMatchValueToRuleOnEveryAction() 
    {
        // Creates the event with the contact ID data.
        var matchValueCurrent = {};
        matchValueCurrent.matchingValuePrimary = this.matchingValuePrimary;
        matchValueCurrent.matchingValueSecondary = this.matchingValueSecondary; 
        
        var matchValueModifyEvent = new CustomEvent('matchvaluemodify', { detail: matchValueCurrent});

        // Dispatches the event.
        this.dispatchEvent(matchValueModifyEvent);
    }
}