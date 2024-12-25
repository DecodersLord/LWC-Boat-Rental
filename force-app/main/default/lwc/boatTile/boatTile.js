// boatTile.js
import { LightningElement, api, wire } from 'lwc';

// Define constants for CSS classes
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    @api boat; // Boat record passed from parent component
    @api selectedBoatId; // ID of the currently selected boat


    // Getter to dynamically determine the CSS class based on selection
    get tileClass() {
        return this.selectedBoatId === this.boat.Id
            ? TILE_WRAPPER_SELECTED_CLASS
            : TILE_WRAPPER_UNSELECTED_CLASS;
    }

    // Getter to determine the background style for the tile
    get backgroundStyle() {
        return `background-image:url(${this.boat.Picture__c})`;
    }

    // Event handler for selecting a boat
    selectBoat() {
        this.selectedBoatId = !this.selectedBoatId;
        const boatselect = new CustomEvent("boatselect", {
        detail: {
        boatId: this.boat.Id
        }
        });
        this.dispatchEvent(boatselect);
    }
    
}
