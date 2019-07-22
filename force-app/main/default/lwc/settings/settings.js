import { LightningElement,track,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Settings extends LightningElement {

@track activeSections=['settings','rulesets'];
@track defaultMatchResult ='1000';

@api objectName;
@api rule='m003i000000PRjTAAW';

@track ObjectSelected='Contact';

handleToggleActive(){
}

handleToggleSection(){}

get objectMatchSelectoptions() {
    return [
        { label: 'Contact', value: 'contact'},
        { label: 'Account', value: 'account'},
        { label: 'Opportunity', value: 'opportunity'},
    ];
}

}