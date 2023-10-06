import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-edit-player',
    templateUrl: './dialog-edit-player.component.html',
    styleUrls: ['./dialog-edit-player.component.scss'],
})
export class DialogEditPlayerComponent {
    allProfilesPictures: string[] = ['1.webp', '2.png', 'monkey.png', 'pinguin.svg', 'serious-woman.svg', 'winkboy.svg'];

    constructor(public dialogRef: MatDialogRef<DialogEditPlayerComponent>) {}

    /* Schliessen des Dialogsfensters */
    onNoClick(): void {
        this.dialogRef.close();
    }
}