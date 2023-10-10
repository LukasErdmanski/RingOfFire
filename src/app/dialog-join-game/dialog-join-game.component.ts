import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-join-game',
    templateUrl: './dialog-join-game.component.html',
    styleUrls: ['./dialog-join-game.component.scss'],
})
export class DialogJoinGameComponent {
    constructor(public dialogRef: MatDialogRef<DialogJoinGameComponent>) {}
}
