import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameService } from '../services/game.service';
import { FormControl } from '@angular/forms';
import { DialogData } from './dialog-data.interface';
import { Subscription } from 'rxjs';
import { Game } from 'src/models/game';

@Component({
    selector: 'app-dialog-edit-player',
    templateUrl: './dialog-edit-player.component.html',
    styleUrls: ['./dialog-edit-player.component.scss'],
})
export class DialogEditPlayerComponent implements OnInit, OnDestroy {
    public selectedAvatar!: string;
    public nameControl = new FormControl('');
    public buttonEnabled: boolean = false;
    public nameControlSub!: Subscription;

    public constructor(private dialogRef: MatDialogRef<DialogEditPlayerComponent>, public gameService: GameService, @Inject(MAT_DIALOG_DATA) private data: DialogData) {}

    public ngOnInit(): void {
        this.setAvatarNameAfterForOpenedDialog();
        this.subscribeName();
    }

    public get game(): Game {
        return this.gameService.game;
    }

    private setAvatarNameAfterForOpenedDialog(): void {
        this.selectedAvatar = this.gameService.game.playerImages[this.data.playerId];
        this.nameControl.setValue(this.gameService.game.players[this.data.playerId]);
    }

    private subscribeName(): void {
        this.nameControlSub = this.nameControl.valueChanges.subscribe((value) => {
            if (value && typeof value === 'string' && value.trim().length > 0) {
                this.buttonEnabled = true;
            } else {
                this.buttonEnabled = false;
            }
        });
    }

    public selectAvatar(avatar: string): void {
        if (this.selectedAvatar != avatar) {
            this.buttonEnabled = true;
        }

        this.selectedAvatar = avatar;
    }

    public onNoClick(): void {
        this.dialogRef.close();
    }

    public ngOnDestroy(): void {
        this.nameControlSub?.unsubscribe();
    }
}
