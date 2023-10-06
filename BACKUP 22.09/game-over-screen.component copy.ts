// import { Component, Input, OnChanges } from '@angular/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-over-screen',
    templateUrl: './game-over-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class GameOverScreenComponent implements AfterViewInit {
    constructor(private gameService: GameService, private router: Router) {
        // this.subscribeToGameUpdates();
    }

    private pressedStartNewGameButton: boolean = false;

    resetPressedStartNewGameButton(): void {
        this.pressedStartNewGameButton = false;
    }

    ngOnInit() {
        this.subscribeToNewGameId();
    }

    viewInitFinished = false;

    ngAfterViewInit() {
        this.viewInitFinished = true;
    }

    async startNewGame() {
        this.pressedStartNewGameButton = true;
        await this.gameService.startNewGame2();
    }

    private oldGameSub!: Subscription;

    private subscribeToNewGameId() {
        this.oldGameSub = this.gameService.game$.subscribe((game) => {
            debugger;
            console.log('GAME OVER COMPONENT Am Anfang von subscribeToNewGameId____RECEIVED GAME:', game);
            if (game.newGameId != '' && game.gameOver) {
                debugger;
                this.gameService.unsubscribeGameDoc();
                this.gameService.firstDataReceived = false;
                this.oldGameSub.unsubscribe();
                this.checkForNewGame();
            }
        });
    }

    checkForNewGame() {
        debugger;
        console.log('Checking for new game...');
        if (this.pressedStartNewGameButton) {
            this.joinNewGame();
        } else {
            this.askToJoinNewGame();
        }
    }

    joinNewGame() {
        // this.gameService.newGame.players.push(/* current player info */);
        debugger;
        this.resetPressedStartNewGameButton();
        this.router.navigate([`/game/${this.gameService.game.newGameId}`]);
    }

    askToJoinNewGame() {
        if (confirm('Ein Spieler aus der letzten Runde hat bereits ein neues Spiel gestartet, mit denselben Mitspielern. Möchten Sie beitreten? Ja / Nein')) {
            this.joinNewGame();
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    startNewGameBACKUP() {
        this.gameService.startNewGame();
    }
}