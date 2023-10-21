import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Game } from 'src/models/game';

/**
 * Component to include players from the last game.
 */
@Component({
    selector: 'app-dialog-include-last-game-players',
    templateUrl: './dialog-include-last-game-players.component.html',
    styleUrls: ['./dialog-include-last-game-players.component.scss'],
})
export class DialogIncludeLastGamePlayersComponent implements OnInit {
    public playerSelections: boolean[] = [];

    /**
     * Initializes a new instance of the `DialogIncludeLastGamePlayersComponent`.
     *
     * @param dialogRef - Reference to the opened dialog.
     * @param gameService - Service to handle game operations.
     */
    constructor(public dialogRef: MatDialogRef<DialogIncludeLastGamePlayersComponent>, public gameService: GameService) {}

    /**
     * Lifecycle method called after the component's view (and child views) are initialized.
     * Initializes player selections for the component.
     */
    public ngOnInit(): void {
        this.initializePlayerSelections();
    }

    /**
     * Initialize player selections based on the number of players in the game.
     */
    private initializePlayerSelections(): void {
        this.playerSelections = new Array(this.gameService.game.players.length).fill(true);
    }

    /**
     * Returns the current game from the game service.
     */
    public get game(): Game {
        return this.gameService.game;
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
        this.gameService.game.players = selectedPlayers;
        console.log(selectedPlayers);

        const selectedPlayerImages = this.getSelectedPlayerImages();
        this.gameService.game.playerImages = selectedPlayerImages;
        console.log(selectedPlayerImages);
    }

    /**
     * Get an array of selected players.
     */
    private getSelectedPlayers(): any[] {
        return this.game.players.filter((_, i) => this.playerSelections[i]);
    }

    /**
     * Get an array of selected player images.
     */
    private getSelectedPlayerImages(): string[] {
        return this.game.playerImages.filter((_, i) => this.playerSelections[i]);
    }
}
