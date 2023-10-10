import { Component, Inject, OnInit } from '@angular/core';
/* Erforderlich laut Angular Dialog Doku für 'onNoClick()' Methode. */
import { MatDialogRef } from '@angular/material/dialog';
import { Game } from 'src/models/game';
import { GameService } from '../services/game.service';

@Component({
    selector: 'app-dialog-add-player',
    templateUrl: './dialog-add-player.component.html',
    styleUrls: ['./dialog-add-player.component.scss'],
})
export class DialogAddPlayerComponent implements OnInit {
    /* Bidirektionales Binding mittles [(ngModel)] mit einem matInput Feld, 
    siehe in 'dialog-add-player.component.html', <input matInput [(ngModel)]="name" />,  
     d.h. wenn sich etwas in Variable ändert, ändert sich auch das InputFeld, und genauso andersrum. */
    name: string = '';

    selectedAvatar: string = '1.webp';

    /* ' public dialogRef: MatDialogRef<DialogAddPlayerComponent> ' erforderlich laut Angular Dialog Doku für 'onNoClick()' Methode. */
    constructor(public dialogRef: MatDialogRef<DialogAddPlayerComponent>, private gameService: GameService) {}

    ngOnInit(): void {}

    public get game():Game {
        return this.gameService.game;
    }

    selectAvatar(avatar: string): void {
        if (this.selectedAvatar != avatar) {
            this.selectedAvatar = avatar;
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
