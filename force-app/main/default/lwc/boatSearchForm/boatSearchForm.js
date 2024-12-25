import { LightningElement,wire, track } from 'lwc';
import  getBoatTypes  from '@salesforce/apex/BoatDataService.getBoatTypes';


    // imports
    // import getBoatTypes from the BoatDataService => getBoatTypes method';
export default class BoatSearchForm extends LightningElement {
    selectedBoatTypeId = '';

    // Private
    error = undefined;

    searchOptions;

    @wire(getBoatTypes)
    boatTypes({ errors, data }) {
        if (data) {
            let cloneData = [...data];
        this.searchOptions = cloneData.map(type => {
            return { label: type.Name, value: type.Id };
        });
        this.searchOptions.unshift({ label: 'All Types', value: '' });
        } else if (errors) {
        this.searchOptions = undefined;
        this.errors = error;
        }
    }

    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        // Create the const searchEvent
        // searchEvent must be the new custom event search
        const searchEvent = new CustomEvent('search', {
            detail: this.selectedBoatTypeId
        });
        this.dispatchEvent(searchEvent);
    }
}
