import { Component } from '@angular/core';
/**
 * Required according to Angular Dialog documentation for the 'onNoClick()' method.
 */
import { MatDialogRef } from '@angular/material/dialog';
import { Game } from 'src/models/game';
import { GameService } from '../services/game.service';

/**
 * Component for the dialog to add a player.
 */
@Component({
    selector: 'app-dialog-add-player',
    templateUrl: './dialog-add-player.component.html',
    styleUrls: ['./dialog-add-player.component.scss'],
})
export class DialogAddPlayerComponent {
    /**
     * Bidirectional binding using [(ngModel)] with a matInput field.
     * Refer to 'dialog-add-player.component.html', <input matInput [(ngModel)]="name" />.
     * When the variable changes, the input field reflects this change and vice versa.
     *
     * Name bound with the matInput field
     */
    public name: string = '';

    /**
     * Currently selected avatar
     */
    public selectedAvatar: string = '1.webp';

    /**
     * Initializes a new instance of the `DialogAddPlayerComponent`.
     *
     * @param dialogRef - Reference to the opened dialog.
     * @param gameService - Service to manage the game.
     */
    constructor(
        /**
         * 'public dialogRef: MatDialogRef<DialogAddPlayerComponent>' is required according to
         * Angular Dialog documentation for the 'onNoClick()' method.
         */
        public dialogRef: MatDialogRef<DialogAddPlayerComponent>,
        private gameService: GameService
    ) {}

    /**
     * Retrieves the current game.
     */
    public get game(): Game {
        return this.gameService.game;
    }

    /**
     * Selects an avatar based on the given avatar string.
     *
     * @param avatar - The avatar string to be selected.
     */
    public selectAvatar(avatar: string): void {
        if (this.selectedAvatar !== avatar) {
            this.selectedAvatar = avatar;
        }
    }

    /**
     * Closes the dialog without any action.
     */
    public onNoClick(): void {
        this.dialogRef.close();
    }
}
