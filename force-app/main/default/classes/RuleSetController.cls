public without sharing class RuleSetController {
    public RuleSetController() {

    }


    @AuraEnabled(cacheable=true) 
    public static ObjectInfo getBaseObjectInfo(String objName)
    {
        return getSobjectInfo(objName, true);
    }
    

    @AuraEnabled
    public static ObjectInfo getSobjectInfo(String objName, Boolean isGetRelationship)
    {
        ObjectInfo objInfo = new ObjectInfo();
        Map<String, Schema.SObjectType> global_describe = Schema.getGlobalDescribe();
        DescribeSObjectResult objResult = global_describe.get(objName).getDescribe();
        objInfo.objName = objResult.getName();
        objInfo.objLabel = objResult.getLabel();
        RelationShipInfo objRelnInfo;
        objInfo.mapParentRelationships = new Map<String, RelationShipInfo>();
        Map<String, Schema.SObjectField> fields = objResult.fields.getMap();
        Map<String, FieldInfo> mapFieldsInfo = new Map<String, FieldInfo>();
        //if(isGetRelationship)
            {
                objInfo.mapChildRelationships = new Map<String, RelationShipInfo>();
                List<Schema.ChildRelationship>   lstchildrelationships = objResult.getChildRelationships();
                for(Schema.ChildRelationship reln:lstchildrelationships)
                {
                    objRelnInfo = new RelationShipInfo();
                    objRelnInfo.relationshipName = reln.getRelationshipName();
                    // reln.getRelationshipName() will be blank in case of ChangeEvent object. We dont have ChangeEvent objects.Hence, below check.
                    if(String.isNotBlank(objRelnInfo.relationshipName))
                    {
                        objRelnInfo.objName = reln.getChildSobject().getDescribe().getName();
                        objRelnInfo.fieldAPIName = reln.getField().getDescribe().getName();
                        objRelnInfo.fieldLabel = reln.getField().getDescribe().getLabel();
                        objRelnInfo.objLabel = reln.getChildSobject().getDescribe().getLabel();
                        objRelnInfo.objPluralLabel = reln.getChildSobject().getDescribe().getLabelPlural();
                        
                        
                        objInfo.mapChildRelationships.put(objRelnInfo.relationshipName, objRelnInfo);
                    }
                }
            }

        for(String f: fields.keyset())
        {
            FieldInfo objFieldInfo = new FieldInfo();
            Schema.DescribeFieldResult desribeResult = fields.get(f).getDescribe();
            
            objFieldInfo.fieldAPIName = desribeResult.getName();
            objFieldInfo.fieldLabel = desribeResult.getLabel();
            objFieldInfo.fieldType = String.valueOf(desribeResult.getType());

            if(objFieldInfo.fieldType == 'REFERENCE' ){  // this will true for lookup and master detail both. 
                objRelnInfo = new RelationShipInfo();
                objRelnInfo.fieldLabel = objFieldInfo.fieldLabel;
                objRelnInfo.fieldAPIName = objFieldInfo.fieldAPIName;
                objRelnInfo.relationshipName = desribeResult.getRelationshipName();
                objRelnInfo.relationshipOrder = desribeResult.getRelationshipOrder();
                for(Schema.SObjectType reference : desribeResult.getReferenceTo()) {
                    System.debug('Lookup reference object name: ' + reference.getDescribe().getName());
                    System.debug('Lookup reference object label: ' + reference.getDescribe().getLabel());
                    objRelnInfo.objName = reference.getDescribe().getName();
                    objRelnInfo.objLabel = reference.getDescribe().getLabel();
                        objRelnInfo.objPluralLabel = reference.getDescribe().getLabelPlural();
                }
                objInfo.mapParentRelationships.put(objRelnInfo.relationshipName, objRelnInfo);
            } 
            mapFieldsInfo.put(objFieldInfo.fieldAPIName, objFieldInfo);
        }
        objInfo.mapFields = mapFieldsInfo;
        
        
        system.debug('==objInfo==='+objInfo);
        return objInfo;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistFieldValues(String objectName, String pickListFieldName)
    {
        system.debug('ObjectName'+objectName+'FieldName'+pickListFieldName);
        List<String> picklistValues = new List<String>();
        SObjectType objectType = Schema.getGlobalDescribe().get(objectName);
        List<Schema.PicklistEntry> pick_list_values = objectType.getDescribe()
                                                       .fields.getMap()
                                                       .get(pickListFieldName)
                                                       .getDescribe().getPickListValues();
        for (Schema.PicklistEntry aPickListValue : pick_list_values) {                   
            picklistValues.add(aPickListValue.getValue()); 
        }
        System.debug('==>PickListValue'+picklistValues);
        return picklistValues;
    }

   /* @AuraEnabled(cacheable=true)
    public static List<Rule_mdt> getRuleInfo(String RuleId){
        Rule objRuleWrap =  new Rule();
        List<Rule_mdt> ruleLst = [Select Id, DeveloperName, MasterLabel, Active__c,
                                    Field__c, Match_Priority__c, Object__c, Operator__c, 
                                    Primary_Value__c, Rule_Set__c, Secondary_Value__c,
                                    Relationship_Name__c from Rule__mdt where Rule_Set__c = : RuleId];
        return ruleLst
    }*/

    @AuraEnabled(cacheable=true)  
    public static RuleSet getRuleSetInfo(String ruleSetId)
    {
        System.debug('Inside getRule'+ruleSetId);
        RuleSet objRuleSetWrap = new RuleSet();
        if(String.isNotBlank(ruleSetId))
        {
            Rule_Set__mdt objRuleSet = [SELECT Id, DeveloperName, MasterLabel, Description__c,
                            (SELECT Id, DeveloperName, MasterLabel, Active__c,
                                    Field__c, Match_Priority__c, Object__c, Operator__c, 
                                    Primary_Value__c, Rule_Set__c, Secondary_Value__c,
                                    Relationship_Name__c, Relation__c
                            FROM Rules__r
                            ) 
                        FROM Rule_Set__mdt 
                        WHERE Id =: ruleSetId 
                        LIMIT 1];
            objRuleSetWrap.masterLabel = objRuleSet.MasterLabel;
            objRuleSetWrap.id = objRuleSet.Id;
            objRuleSetWrap.developerName = objRuleSet.MasterLabel;
            objRuleSetWrap.description = objRuleSet.Description__c;
            objRuleSetWrap.lstRule = new List<Rule>();
            Rule objRuleTemp;
            Integer i=0;
            for(Rule__mdt objRule : objRuleSet.Rules__r)
            {
                objRuleTemp = new Rule();
                objRuleTemp.index = i;
                objRuleTemp.id = objRule.Id;
                objRuleTemp.developerName = objRule.DeveloperName;
                objRuleTemp.masterLabel = objRule.MasterLabel;
                objRuleTemp.active = objRule.Active__c;
                objRuleTemp.fieldApiName = objRule.Field__c;
                objRuleTemp.matchPriority = objRule.Match_Priority__c;
                objRuleTemp.objectApiName = objRule.Object__c;
                objRuleTemp.operator = objRule.Operator__c;
                objRuleTemp.primaryValue = objRule.Primary_Value__c;
                objRuleTemp.ruleSet = objRule.Rule_Set__c;
                objRuleTemp.secondaryValue = objRule.Secondary_Value__c;
                objRuleTemp.relationshipName = objRule.Relationship_Name__c;
                objRuleTemp.relation = objRule.Relation__c;
                objRuleSetWrap.lstRule.add(objRuleTemp);
                i++;
            }
        }
        System.debug('--objRuleSetWrap--' + objRuleSetWrap);
        return objRuleSetWrap;
    }
    public class RuleSet
    {
        @AuraEnabled 
        public String id {get;set;}
        @AuraEnabled 
        public String masterLabel {get;set;}
        @AuraEnabled 
        public String developerName {get;set;}
        @AuraEnabled 
        public String description {get;set;}
        @AuraEnabled 
        public List<Rule> lstRule {get;set;}
    }

    public class Rule
    {
        @AuraEnabled 
        public Integer index {get;set;}
        @AuraEnabled 
        public String id {get;set;}
        @AuraEnabled 
        public String masterLabel {get;set;}
        @AuraEnabled 
        public String developerName {get;set;}
        @AuraEnabled 
        public Boolean active {get;set;}
        @AuraEnabled 
        public String fieldApiName {get;set;}
        @AuraEnabled 
        public String matchPriority {get;set;}
        @AuraEnabled 
        public String objectApiName {get;set;}
        @AuraEnabled 
        public String operator {get;set;}
        @AuraEnabled 
        public String primaryValue {get;set;}
        @AuraEnabled 
        public String ruleSet {get;set;}
        @AuraEnabled 
        public String secondaryValue {get;set;}
        @AuraEnabled 
        public String relationshipName {get;set;}
        @AuraEnabled
        public string relation{get;set;}
    }

    public class ObjectInfo
    {
        @AuraEnabled
        public Map<String, FieldInfo> mapFields {get;set;}
        @AuraEnabled
        public String objName {get;set;}
        @AuraEnabled
        public String objLabel {get;set;}
        @AuraEnabled
        public Map<String, RelationShipInfo> mapParentRelationships {get;set;}
        @AuraEnabled
        public Map<String, RelationShipInfo> mapChildRelationships {get;set;}
    }

    public class FieldInfo
    {
        @AuraEnabled
        public String fieldAPIName {get;set;}
        @AuraEnabled
        public String fieldLabel {get;set;}
        @AuraEnabled
        public String fieldType   {get;set;}
    }

    public class RelationShipInfo
    {
        @AuraEnabled
        public String fieldAPIName {get;set;} 
        @AuraEnabled
        public String fieldLabel {get;set;}
        @AuraEnabled
        public String objName {get;set;}
        @AuraEnabled
        public String objLabel {get;set;}
        @AuraEnabled
        public String objPluralLabel {get;set;}
        @AuraEnabled
        public String relationshipName {get;set;}
        @AuraEnabled
        public Integer relationshipOrder {get;set;}
    }
}