// import { Component, Input, OnChanges } from '@angular/core';
import { Component } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
    selector: 'app-game-over-screen',
    templateUrl: './game-over-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class GameOverScreenComponent {
    constructor(private gameService: GameService) {}

    startNewGame() {
        this.gameService.startNewGame()
    }
}
