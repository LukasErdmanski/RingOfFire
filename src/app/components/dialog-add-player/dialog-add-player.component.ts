import { Component, OnInit } from '@angular/core';
/**
 * Required according to Angular Dialog documentation for the 'onNoClick()' method.
 */
import { MatDialogRef } from '@angular/material/dialog';
import { GameLogicService } from 'src/app/services/game-logic.service';

/**
 * Component for the dialog to add a player.
 */
@Component({
    selector: 'app-dialog-add-player',
    templateUrl: './dialog-add-player.component.html',
    styleUrls: ['./dialog-add-player.component.scss'],
    /**
     * The 'host' property allows for binding to properties, attributes, and events
     * of the host element that the directive/component is attached to.
     * Here, we're using it to bind a global (document) keyup event to the onEnter method.
     * Whenever a key is released (keyup event) anywhere in the document, the onEnter method will be invoked.
     */
    host: {
        '(document:keyup)': 'onEnter($event)',
    },
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
        public gameLogicService: GameLogicService
    ) {}

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

    /**
     * Event handler for the keyup event on the document.
     * If the 'Enter' key is pressed and the player name is not empty,
     * the dialog is closed and the current values for 'name' and 'selectedAvatar' are returned.
     * Without a valid name, pressing 'Enter' will have no effect.
     *
     * @param event - The keyboard event object containing details about the key press.
     */
    public onEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.name.trim().length > 0) {
            this.dialogRef.close({ name: this.name, avatar: this.selectedAvatar });
        }
    }
}
