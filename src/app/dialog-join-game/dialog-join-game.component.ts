import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * Component for the dialog to join a game.
 */
@Component({
    selector: 'app-dialog-join-game',
    templateUrl: './dialog-join-game.component.html',
    styleUrls: ['./dialog-join-game.component.scss'],
})
export class DialogJoinGameComponent {
    /**
     * Initializes a new instance of the `DialogJoinGameComponent`.
     *
     * @param dialogRef - Reference to the opened dialog.
     */
    constructor(public dialogRef: MatDialogRef<DialogJoinGameComponent>) {}
}
