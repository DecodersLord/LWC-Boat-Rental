import { LightningElement, wire, api, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import LENGTH_FIELD from '@salesforce/schema/Boat__c.Length__c';
import PRICE_FIELD from '@salesforce/schema/Boat__c.Price__c';
import DESC_FIELD from '@salesforce/schema/Boat__c.Description__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import BOTMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

const COLUMNS = [
    { label: 'Name', fieldName: NAME_FIELD.fieldApiName, type: 'text', editable: true},
    { label: 'Length', fieldName: LENGTH_FIELD.fieldApiName, type: 'text', editable: true},
    { label: 'Price', fieldName: PRICE_FIELD.fieldApiName, type: 'text', editable: true},
    { label: 'Description', fieldName: DESC_FIELD.fieldApiName, type: 'text', editable: true}
];

export default class BoatSearchResults extends LightningElement {
    selectedBoatId;
    columns = COLUMNS;
    boatTypeId = '';
    @track boats;
    @track draftValues = [];
    isLoading = false;

    // wired message context
    @wire(MessageContext)
    messageContext;
    // wired getBoats method 
    @wire(getBoats, {boatTypeId: '$boatTypeId'})
    wiredBoats({ errors, data }) {
        if (data) {
            let cloneData = [...data];
            this.boats = cloneData;
        } else if (errors) {
            this.boats = undefined;
            this.errors = error;
            }
    }

    // public function that updates the existing boatTypeId property
    // uses notifyLoading
    @api
    searchBoats(boatTypeId) { 
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        this.boatTypeId = boatTypeId;
    }

    // this public function must refresh the boats asynchronously
    // uses notifyLoading
    async refresh() { 
        this.isLoading = true;
        this.notifyLoading(this.isLoading);
        await refreshApex(this.boats);
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
    }

    // this function must update selectedBoatId and call sendMessageService
    updateSelectedTile(event) { 
        this.selectedBoatId = event.detail.boatId;
        this.sendMessageService(this.selectedBoatId);
    }

    // Publishes the selected boat Id on the BoatMC.
    sendMessageService(boatId) { 
        const payload = {
            recordId: boatId
        };
        publish(this.messageContext, BOTMC, payload);
    // explicitly pass boatId to the parameter recordId
    }

    // The handleSave method must save the changes in the Boat Editor
    // passing the updated fields from draftValues to the 
    // Apex method updateBoatList(Object data).
    // Show a toast message with the title
    // clear lightning-datatable draft values
    async handleSave(event) {
    // Convert datatable draft values into record objects
        this.notifyLoading(true);
        const updatedFields = event.detail.draftValues;

        // Prepare the record IDs for notifyRecordUpdateAvailable()
        const notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });

        try {
            // Pass edited fields to the updateBoatList Apex controller
            const result = await updateBoatList({data: updatedFields});
            console.log(JSON.stringify("Apex update result: "+ result));
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );

            // Display fresh data in the datatable
            this.draftValues = [];
            return this.refresh();
            
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.getMessage(),
                    variant: ERROR_VARIANT
                })
            );
            this.notifyLoading(false);
        } finally {
            // Clear the datatable draft values
            this.draftValues = [];
        }
        
    }
    // Check the current value of isLoading before dispatching the doneloading or loading custom event
    notifyLoading(isLoading) { 
        if(isLoading){
            this.dispatchEvent(
                new CustomEvent('loading')
            );
        } else {
            this.dispatchEvent(
                new CustomEvent('doneloading')
            );
        }
    }
}
