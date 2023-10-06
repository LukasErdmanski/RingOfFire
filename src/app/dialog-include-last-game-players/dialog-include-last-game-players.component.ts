import { Component } from '@angular/core';
import { GameService } from '../services/game.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-include-last-game-players',
    templateUrl: './dialog-include-last-game-players.component.html',
    styleUrls: ['./dialog-include-last-game-players.component.scss'],
})
export class DialogIncludeLastGamePlayersComponent {
    playerSelections: boolean[] = [];
    constructor(public dialogRef: MatDialogRef<DialogIncludeLastGamePlayersComponent>, public gameService: GameService) {}

    ngOnInit() {
        this.playerSelections = new Array(this.gameService.game.players.length).fill(true);
    }

    get game() {
        return this.gameService.game;
    }

    togglePlayerSelection(index: number) {
        this.playerSelections[index] = !this.playerSelections[index];
    }

    closeDialog(includeLastGamePlayers: boolean) {
        if (includeLastGamePlayers) this.updateSelectedPlayers();
        else if (!includeLastGamePlayers) this.gameService.resetGame();
        this.dialogRef.close(includeLastGamePlayers);
    }

    updateSelectedPlayers() {
        const selectedPlayers = this.game.players.filter((_, i) => this.playerSelections[i]);
        this.gameService.game.players = selectedPlayers;
        console.log(selectedPlayers);

        const selectedPlayerImages = this.game.player_images.filter((_, i) => this.playerSelections[i]);
        this.gameService.game.player_images = selectedPlayerImages;
        console.log(selectedPlayerImages);
    }
}
