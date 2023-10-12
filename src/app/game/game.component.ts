import { Component, OnInit } from '@angular/core';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { MatDialog } from '@angular/material/dialog';
import { map, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';

/**
 * Represents the main game component.
 */
@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
    private cardsRightToBottomStack: any[] = [0, 1, 2, 3];

    /**
     * Initializes a new instance of the GameComponent.
     * Injects the necessary services, including the 'route' of type 'ActivatedRoute'
     * to retrieve the game 'id' from the route.
     *
     * @param dialog - Service for opening dialog components.
     * @param route - Service for working with route parameters.
     * @param router - Service for navigating among routes.
     * @param gameService - Service for game-related operations.
     */
    constructor(private route: ActivatedRoute, private router: Router, private gameService: GameService, private dialog: MatDialog) {}

    /**
     * Angular's OnInit lifecycle hook.
     * Starts the necessary subscriptions related to the game component.
     */
    ngOnInit(): void {
        this.subscribeToRouteParams();
        this.startSubcribeToGameInGameService();
    }

    /**
     * Subscribes to route parameters.
     * Focuses specifically on the 'id' property from the route parameters.
     * and assigns it to the game property in the game service.
     */
    private subscribeToRouteParams(): void {
        this.route.params
            .pipe(
                take(1),
                map((params) => params['id'])
            )
            .subscribe((routeGameId) => {
                this.gameService.game.id = routeGameId;
            });
    }

    /**
     * Subscribes to game data in the service and navigates to game-over screen if the game is over.
     * @throws {Error} Throws an error if unable to subscribe to the game.
     */
    private async startSubcribeToGameInGameService(): Promise<void> {
        try {
            await this.gameService.subscribeGameDoc();
            if (this.game.gameOver) {
                this.router.navigate(['/game-over-screen']);
            }
        } catch (err) {
            console.error('Error subscribing to the game:', err);
        }
    }

    /**
     * Getter for the first data received flag from the game service.
     */
    get firstDataReceived(): boolean {
        return this.gameService.firstDataReceived;
    }

    /**
     * Getter for the game data from the game service.
     */
    get game() {
        return this.gameService.game;
    }

    /**
     * Handles the card-taking process and related game logic.
     */
    takeCard(): void {
        // Ensures a card is taken only once every 1.5 seconds.
        if (!this.game.pickCardAnimation) {
            this.updateCurrentCard();
            this.updateStack();
            this.updateCurrentPlayer();
            this.gameService.updateGameDoc(this.game);
            this.handleCardAnimation();
        }
    }

    /**
     * Updates the current card by taking the top card from the stack.
     */
    private updateCurrentCard(): void {
        this.game.currentCard = this.game.stack.pop()!;
    }

    /**
     * Updates the card stack and associated properties.
     */
    private updateStack(): void {
        /**
         * Adjusts the 'cardsRightToBottomStack' array when there are <= 4 cards left in the stack
         * to ensure they are displayed correctly after each move.
         */
        if (this.game.stack.length <= 4) {
            this.game.cardsRightToBottomStack.splice(this.game.cardsRightToBottomStack.length - 1, 1);
        }
        this.game.pickCardAnimation = true;
    }

    /**
     * Updates the current player's index.
     * Cycles to the next player using modulo division.
     * Only updates if there's a pool of players, ensuring the
     * stylish display for the current player functions correctly.
     */
    private updateCurrentPlayer(): void {
        if (this.game.players.length > 0) {
            this.game.currentPlayer = (this.game.currentPlayer + 1) % this.game.players.length;
        }
    }

    /**
     * Handles the card animation and related properties.
     */
    private handleCardAnimation(): void {
        setTimeout(() => {
            // Adds the taken card to the played cards stack after animation ends.
            this.game.playedCards.push(this.game.currentCard);
            // Resets animation flag for the next card pull.
            this.game.pickCardAnimation = false;
            // Checks if the game is over based on the remaining cards in the stack.
            if (this.game.stack.length == 0) {
                this.game.gameOver = true;
            }
            // Updates the game state in the Firebase database.
            this.gameService.updateGameDoc(this.game);
        }, 1000);
    }

    /**
     * Opens the dialog for adding players.
     *
     * Angular Material Component from
     * https://material.angular.io/components/dialog/overview
     */
    openDialog(): void {
        const dialogRef = this.dialog.open(DialogAddPlayerComponent);
        dialogRef.afterClosed().subscribe((data: { name: string; avatar: string }) => {
            if (data?.name && data?.name.trim().length > 0) {
                this.game.players.push(data.name);
                this.game.player_images.push(data.avatar);
                this.gameService.updateGameDoc(this.game);
            }
        });
    }

    /**
     * Track by function for ngFor directive.
     *
     * This function takes the index and the item itself as parameters and returns
     * a unique identifier for the item. In this case, we are simply using the index
     * of the item as the unique identifier. This helps Angular to optimize the rendering
     * of items in a list by only re-rendering the items that have changed.
     *
     */
    trackByFn(index: number, item: any): number {
        return index;
    }
}
