import { Component, Input, OnChanges } from '@angular/core';
/**
 * Imports all exports from the 'cardActionsData.json' file and makes them accessible
 * under the `cardActionsData` namespace.
 *
 * The use of '*' indicates a wildcard import, meaning everything exported from the
 * module is imported.
 *
 * The `as` keyword is used to create an alias (`cardActionsData`) for these imports. This allows
 * for convenient access to the module's exports without having to reference them individually.
 */
import * as cardActionsData from '../../../assets/cardActionsData/cardActionsData.json';
import { CardAction } from 'src/app/interfaces/cardAction.interface';

/**
 * A component that displays information related to the current card in the game.
 * It fetches card actions from a JSON data source and presents the corresponding
 * action for the currently active card.
 *
 * This component listens to changes in its input properties, specifically the `card` property,
 * and updates its display based on the card's action data.
 */
@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnChanges {
    /**
     * Array of card actions imported from a JSON data source.
     */
    private cardActions: CardAction[] = cardActionsData;

    /**
     * Title of the current card action.
     */
    public title: string = '';

    /**
     * Description of the current card action.
     */
    public description: string = '';

    /**
     * Represents the current card, used to determine the corresponding card action.
     * It is provided in 'game.component.ts'.
     */
    @Input() public card!: string;

    /**
     * Indicates if the game info is currently hidden or visible.
     */
    public hidden: boolean = false;

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
            this.setCardAction();
        }
    }

    /**
     * Sets the card action details based on the current card value.
     */
    private setCardAction(): void {
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
    public moveDownTop(): void {
        this.hidden = !this.hidden;
    }
}
