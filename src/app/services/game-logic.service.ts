import { Injectable } from '@angular/core';
import { Game } from 'src/models/game';

@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    constructor() {}

    /**
     * Handles the card-taking process and related game logic.
     */
    takeCard(game: Game): void {
        // Ensures a card is taken only once every 1.5 seconds.
        if (!game.pickCardAnimation) {
            // this.updateCurrentCard(game);
            // this.updateStack(game);
            // this.updateCurrentPlayer(game);
            // this.updateCurrentPlayer();
            // this.firebaseService.updateGameDoc(this.game);
            // this.handleCardAnimation();
        }
    }

    /**
     * Updates the current card by taking the top card from the stack.
     */
    private updateCurrentCard(): void {
        // this.game.currentCard = this.game.stack.pop()!;
    }
}
