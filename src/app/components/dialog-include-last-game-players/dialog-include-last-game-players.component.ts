import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { MatDialogRef } from '@angular/material/dialog';
import { GameLogicService } from 'src/app/services/game-logic.service';
import { IGame } from 'src/app/interfaces/game';
import { Subscription } from 'rxjs';

/**
 * Component to include players from the last game.
 */
@Component({
    selector: 'app-dialog-include-last-game-players',
    templateUrl: './dialog-include-last-game-players.component.html',
    styleUrls: ['./dialog-include-last-game-players.component.scss'],
})
export class DialogIncludeLastGamePlayersComponent implements OnInit, OnDestroy {
    public playerSelections: boolean[] = [];

    // TODO: To comment.
    private gameSubjectSubscription!: Subscription;

    //TODO: Comment later with TSDoc
    public game!: IGame;

    /**
     * Initializes a new instance of the `DialogIncludeLastGamePlayersComponent`.
     *
     * @param dialogRef - Reference to the opened dialog.
     * @param gameService - Service to handle game operations.
     */
    constructor(public dialogRef: MatDialogRef<DialogIncludeLastGamePlayersComponent>, public gameService: GameService, private gameLogicService: GameLogicService) {}

    /**
     * Lifecycle method called after the component's view (and child views) are initialized.
     * Initializes player selections for the component.
     */
    public ngOnInit(): void {
        this.getGame();
        this.initializePlayerSelections();
    }

    /**
     * Lifecycle method to clean up name control subscription.
     */
    public ngOnDestroy(): void {
        this.gameSubjectSubscription.unsubscribe;
    }

    // TODO: To comments.
    public getGame(): void {
        this.gameSubjectSubscription = this.gameLogicService.gameSubject.subscribe((game) => {
            this.game = game;
        });
    }

    /**
     * Initialize player selections based on the number of players in the game.
     */
    private initializePlayerSelections(): void {
        this.playerSelections = new Array(this.game.players.length).fill(true);
    }

    /**
     * Toggle player selection at a given index.
     * @param index - Index of the player to toggle.
     */
    public togglePlayerSelection(index: number): void {
        this.playerSelections[index] = !this.playerSelections[index];
    }

    /**
     * Close the dialog and handle player selection based on user input.
     * @param includeLastGamePlayers - Flag to indicate if players from the last game should be included.
     */
    public closeDialog(includeLastGamePlayers: boolean): void {
        if (includeLastGamePlayers) {
            this.updateSelectedPlayers();
        } else {
            this.gameService.resetGame();
        }

        this.dialogRef.close(includeLastGamePlayers);
    }

    /**
     * Update the game's player and player images arrays based on current player selections.
     */
    private updateSelectedPlayers(): void {
        const selectedPlayers = this.getSelectedPlayers();
        /**
         * TODO: To change later after implementing update in gameLogicService und fb service.
         * Update this game first
         * this.game.players = selectedPlayers;
         * Then update with this updated game by selectedPlayers.
         * this.gameLogicService.update(this.game)
         *
         */
        this.gameService.game.players = selectedPlayers;

        const selectedPlayerImages = this.getSelectedPlayerImages();
        /**
         * TODO: To change later after implementing update in gameLogicService und fb service.
         * Update this game first
         * this.game.playerImages = selectedPlayerImages;
         * Then update with this updated game by selectedPlayerImages.
         * this.gameLogicService.update(this.game)
         *
         */
        this.gameService.game.playerImages = selectedPlayerImages;
    }

    /**
     * Get an array of selected players.
     * @returns {string[]} An array containing the names of the selected players.
     */
    private getSelectedPlayers(): string[] {
        return this.game.players.filter((_, i) => this.playerSelections[i]);
    }

    /**
     * Get an array of selected player images.
     * @returns {string[]} An array containing the image URLs of the selected players.
     */
    private getSelectedPlayerImages(): string[] {
        return this.game.playerImages.filter((_, i) => this.playerSelections[i]);
    }
}
