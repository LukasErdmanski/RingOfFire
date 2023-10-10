import { Component, Inject } from '@angular/core';
/* Erforderlich laut Angular Dialog Doku für 'onNoClick()' Methode. */
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameService } from '../services/game.service';
import { DialogData } from './dialog-data.interface';



@Component({
    selector: 'app-dialog-add-edit-player',
    templateUrl: './dialog-add-edit-player.component.html',
    styleUrls: ['./dialog-add-edit-player.component.scss'],
})
export class DialogAddEditPlayerComponent {
    mode!: string;

    /* Bidirektionales Binding mittles [(ngModel)] mit einem matInput Feld, 
  siehe in 'dialog-add-edit-player.component.html', <input matInput [(ngModel)]="name" />,  
  d.h. wenn sich etwas in Variable ändert, ändert sich auch das InputFeld, und genauso andersrum. */
    enteredName: string = '';

    allProfilesPictures: string[] = ['1.webp', '2.png', 'monkey.png', 'pinguin.svg', 'serious-woman.svg', 'winkboy.svg'];

    selectedAvatar: string = '1.webp'; // Standardmäßig ist der erste Avatar ausgewählt
    playerId!: number;

    hasChanges: boolean = false;

    /* ' public dialogRef: MatDialogRef<DialogAddEditPlayerComponent> ' erforderlich laut Angular Dialog Doku für 'onNoClick()' Methode. */
    constructor(public dialogRef: MatDialogRef<DialogAddEditPlayerComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData, public gameService: GameService) {
        this.mode = data.mode;
        if (this.mode === 'edit') {
            this.playerId = data.playerId!;
        }
    }

    selectAvatar(avatar: string): void {
        if (this.mode === 'edit') {
            this.hasChanges = true;
        }
        this.selectedAvatar = avatar;
    }

    onNameChange(): void {
        if (this.mode === 'edit') {
            this.hasChanges = true;
        }
    }

    canButtonBeEnabled(): boolean {
        if (this.mode === 'add') {
            return this.enteredName.length > 0;
        } else if (this.mode === 'edit') {
            return this.hasChanges;
        }
        return false;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}