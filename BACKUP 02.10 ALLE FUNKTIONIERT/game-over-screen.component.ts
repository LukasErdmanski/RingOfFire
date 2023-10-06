// import { Component, Input, OnChanges } from '@angular/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { Observable, Subscription, filter, map } from 'rxjs';
import { Game } from 'src/models/game';

@Component({
    selector: 'app-game-over-screen',
    templateUrl: './game-over-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class GameOverScreenComponent implements OnInit, AfterViewInit {
    constructor(private gameService: GameService, private router: Router) {
        // this.subscribeToGameUpdates();
        debugger;
    }

    ngOnInit() {
        debugger;
        this.subscribeNewGameIdInLastGame();
    }

    viewInitFinished = false;

    ngAfterViewInit() {
        debugger;
        this.viewInitFinished = true;
    }

    private newGameIdInLastGameSub!: Subscription;

    private newGame$!: Observable<Game>;
    private gameOverInNewGameSub!: Subscription;

    subscribeNewGameIdInLastGame() {
        debugger;
        this.newGameIdInLastGameSub = this.gameService.game$
            .pipe(
                map((lastGame) => lastGame.newGameId) // Extrahiere das newGameId Property
            )
            .subscribe((newGameId) => {
                debugger;
                console.log('newGameId:', newGameId); // Hier kannst du den Wert von newGameId verwenden

                if (newGameId && this.viewInitFinished) {
                    debugger;
                    this.unsubscribe_newGameIdInLastGameSub();
                    this.gameService.unsubscribeGameDoc();

                    this.gameService.resetGame();
                    this.gameService.game.id = newGameId;

                    debugger;
                    this.newGame$ = this.gameService.getGameDocData(this.gameService.game);
                    this.gameOverInNewGameSub = this.newGame$.pipe(map((newGame) => newGame.gameOver)).subscribe((gameOver) => {
                        debugger;
                        // Man könnte hier updateGameToGameDoc machen, aber uns interessiert nur das empfangene gameOver von newGame direkt aus Firebase.
                        // Es muss nicht, glaube ich, lokal das Game Model für die askToJoinGame Abfrage aktualisiert werden.
                        this.unsubscribe_gameOverInNewGameSub();

                        if (!gameOver) {
                            this.askToJoinNewGame();
                        }
                    });
                } else {
                }
            });
    }

    askToJoinNewGame() {
        if (confirm('Ein Spieler aus der letzten Runde hat bereits ein neues Spiel gestartet, mit denselben Mitspielern. Möchten Sie beitreten? Ja / Nein')) {
            // this.joinNewGame();
            debugger;

            this.router.navigate([`/game/${this.gameService.game.id}`]);
        } else {
            this.gameService.resetGame();
        }
    }

    async startNewGame() {
        debugger;
        this.unsubscribe_newGameIdInLastGameSub();
        this.gameService.unsubscribeGameDoc();

        // this.pressedStartNewGameButton = true;
        await this.gameService.startNewGame2();
    }

    ngOnDestroy() {
        // Vergiss nicht, das Subscription zu kündigen, wenn die Komponente zerstört wird
        this.gameOverInNewGameSub?.unsubscribe();
        this.newGameIdInLastGameSub?.unsubscribe();
        this.gameService?.unsubscribeGameDoc();
        debugger;
    }

    unsubscribe_newGameIdInLastGameSub() {
        debugger;
        if (this.newGameIdInLastGameSub && !this.newGameIdInLastGameSub.closed) {
            console.warn('GAME OVER COMPONENT / unsubscribe_newGameIdInLastGameSub: JA ES EXISITERT EINE SUBSCRIPTION und Die Subscription ist noch aktiv. ');
        } else {
            console.log('GAME OVER COMPONENT / unsubscribe_newGameIdInLastGameSub: Die Subscription ist geschlossen.');
        }

        this.newGameIdInLastGameSub?.unsubscribe();
    }

    unsubscribe_gameOverInNewGameSub() {
        debugger;
        if (this.gameOverInNewGameSub && !this.gameOverInNewGameSub.closed) {
            console.warn('GAME OVER COMPONENT / unsubscribe_gameOverInNewGameSub: JA ES EXISITERT EINE SUBSCRIPTION und Die Subscription ist noch aktiv. ');
        } else {
            console.log('GAME OVER COMPONENT / unsubscribe_gameOverInNewGameSub: Die Subscription ist geschlossen.');
        }

        this.gameOverInNewGameSub?.unsubscribe();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    startNewGameBACKUP() {
        this.gameService.startNewGame();
    }
}
