import { Component, Input, OnChanges } from '@angular/core';
import * as cardActionsData from '../../assets/cardActionsData/cardActionsData.json';

/** Represents the action associated with a card. */
interface CardAction {
    title: string;
    description: string;
}

@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnChanges {
    /** Array of card actions imported from a JSON data source. */
    private readonly cardActions: CardAction[] = cardActionsData;

    /** Title of the current card action. */
    public title: string = '';

    /** Description of the current card action. */
    public description: string = '';

    /**
     * Represents the current card, used to determine the corresponding card action.
     * It is provided in 'game.component.ts'.
     */
    @Input() card!: string;

    /** Indicates if the game info is currently hidden or visible. */
    hidden: boolean = false;

    /**
     * Angular lifecycle hook method that is called whenever the data-bound input properties of the component change.
     * Here, it checks if the `card` property has been initialized and, if so, updates the card action details.
     *
     * A method alternative to 'ngOnInit' ensures that the 'card' variable is processed not just during 'ngOnInit',
     * but on every change, such as drawing a card from the top of the deck. This also requires implementing
     * 'OnChanges' in the class signature.
     */
    ngOnChanges(): void {
        /**
         * This should only execute when 'card' has been initialized.
         * It's particularly crucial to avoid execution at the beginning when it's 'undefined',
         * to prevent a JS script error.
         */
        this.handleCardChange();
    }

    /**
     * Checks if the `card` property is set and updates the card action details accordingly.
     */
    private handleCardChange(): void {
        if (this.card) {
            console.log('Current card is ', this.card);
            this.setCardAction();
        }
    }

    /**
     * Sets the card action details based on the current card value.
     */
    setCardAction(): void {
        // Update the title and description based on the parsed card number.
        let cardNumber = +this.card.split('_')[1];

        /**
         * Update the title and description based on the parsed card number.
         * As 'currentCard' is between 1 and 13 and 'card' gets this value, 'cardNumber' must be decremented by 1
         * to correctly index the 'cardActions'.
         */
        this.title = this.cardActions[cardNumber - 1].title;
        this.description = this.cardActions[cardNumber - 1].description;
    }

    /**
     * Toggles the visibility state of the game info.
     */
    moveDownTop() {
        this.hidden = !this.hidden;
    }
}
