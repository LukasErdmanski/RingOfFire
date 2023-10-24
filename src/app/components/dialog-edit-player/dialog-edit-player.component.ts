import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameService } from '../../services/game.service';
import { FormControl } from '@angular/forms';
import { DialogData } from '../../../interfaces/dialog-data.interface';
import { Subscription } from 'rxjs';
import { Game } from 'src/models/game';

/**
 * Component to edit player details.
 */
@Component({
    selector: 'app-dialog-edit-player',
    templateUrl: './dialog-edit-player.component.html',
    styleUrls: ['./dialog-edit-player.component.scss'],
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
export class DialogEditPlayerComponent implements OnInit, OnDestroy {
    /** Selected avatar for the player. */
    public selectedAvatar!: string;

    /** Form control instance for the player's name. */
    public nameControl = new FormControl('');

    /** Indicates if the submit button should be enabled based on input validity. */
    public buttonEnabled: boolean = false;

    /** Subscription to changes in the `nameControl`. */
    private nameControlSub!: Subscription;

    /**
     * Initializes a new instance of the `DialogEditPlayerComponent`.
     *
     * @param dialogRef - Reference to the opened dialog.
     * @param gameService - Service to handle game operations.
     * @param data - Dialog data interface instance.
     */
    public constructor(private dialogRef: MatDialogRef<DialogEditPlayerComponent>, public gameService: GameService, @Inject(MAT_DIALOG_DATA) private data: DialogData) {}

    /**
     * Lifecycle method for initialization.
     * Initialize dialog data after opening.
     */
    public ngOnInit(): void {
        this.setAvatarNameAfterForOpenedDialog();
        this.subscribeName();
    }

    /**
     * Lifecycle method to clean up name control subscription.
     */
    public ngOnDestroy(): void {
        this.nameControlSub?.unsubscribe();
    }

    /**
     * Returns the current game from the game service.
     */
    public get game(): Game {
        return this.gameService.game;
    }

    /**
     * Set avatar and name for the opened dialog.
     */
    private setAvatarNameAfterForOpenedDialog(): void {
        this.selectedAvatar = this.gameService.game.playerImages[this.data.playerId];
        this.nameControl.setValue(this.gameService.game.players[this.data.playerId]);
    }

    /**
     * Subscribe to name changes and update button state.
     */
    private subscribeName(): void {
        this.nameControlSub = this.nameControl.valueChanges.subscribe((value) => {
            if (value && typeof value === 'string' && value.trim().length > 0) {
                this.buttonEnabled = true;
            } else {
                this.buttonEnabled = false;
            }
        });
    }

    /**
     * Update the selected avatar and enable the button if a new avatar is selected.
     * @param avatar - The avatar string to select.
     */
    public selectAvatar(avatar: string): void {
        if (this.selectedAvatar != avatar) {
            this.buttonEnabled = true;
        }

        this.selectedAvatar = avatar;
    }

    /**
     * Close the dialog without saving changes.
     */
    public onNoClick(): void {
        this.dialogRef.close();
    }

    /**
     * Event handler for the keyup event on the document.
     * If the 'Enter' key is pressed and changes have been made (either the avatar or the name),
     * the dialog is closed and the current values for 'name' and 'selectedAvatar' are returned.
     * Without changes, pressing 'Enter' will have no effect.
     *
     * @param event - The keyboard event object containing details about the key press.
     */
    public onEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.buttonEnabled) {
            this.dialogRef.close({ name: this.nameControl.value, avatar: this.selectedAvatar });
        }
    }
}
