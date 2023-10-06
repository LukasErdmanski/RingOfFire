// import { Component, Input, OnChanges } from '@angular/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { Observable, Subscription, filter, firstValueFrom, map } from 'rxjs';
import { Game } from 'src/models/game';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { DialogJoinGameComponent as DialogJoinGameComponent } from '../dialog-join-game/dialog-join-game.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogIncludeLastGamePlayersComponent } from '../dialog-include-last-game-players/dialog-include-last-game-players.component';

@Component({
    selector: 'app-game-over-screen',
    templateUrl: './game-over-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class GameOverScreenComponent implements OnInit, AfterViewInit {
    private decisionJoinGame: boolean = false;
    joinGame!: boolean;
    constructor(private gameService: GameService, private router: Router, public dialog: MatDialog) {
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
                            this.askWantToJoinNewGame();
                        }
                    });
                } else {
                }
            });
    }

    async askWantToJoinNewGame() {
        debugger;
        const dialogRef = this.dialog.open(DialogJoinGameComponent, {
            disableClose: true,
        });

        this.joinGame = await firstValueFrom(dialogRef.afterClosed());

        if (this.joinGame === true) {
            // Wenn "Ja" ausgewählt wurde
            this.router.navigate([`/game/${this.gameService.game.id}`]);
        } else if (this.joinGame === false) {
            debugger;
            // Wenn "Nein" ausgewählt wurde oder der Dialog abgebrochen wurde
            this.gameService.resetGame();
        }
    }

    async askShouldIncludeLastGamePlayers(): Promise<boolean> {
        const dialogRef = this.dialog.open(DialogIncludeLastGamePlayersComponent, {
            disableClose: true,
        });

        console.log('TO JEST PLAYERS IN GAME SERVICE GAME: ', this.gameService.game.players);

        const includeLastGamePlayers: boolean = await firstValueFrom(dialogRef.afterClosed());

        debugger;

        return includeLastGamePlayers;
    }

    async startNewGame() {
        debugger;
        this.unsubscribe_newGameIdInLastGameSub();
        this.gameService.unsubscribeGameDoc();

        let includeLastGamePlayers: boolean = false;

        if (this.joinGame === undefined) {
            includeLastGamePlayers = await this.askShouldIncludeLastGamePlayers();
        }

        try {
            await this.gameService.createGameDoc2(includeLastGamePlayers); // Hier wird die Methode aufgerufen

            // Wenn das Promise aufgelöst wird, navigieren Sie zum Spiel mit der neuen ID
            this.router.navigate([`/game/${this.gameService.game.id}`]); // Hier navigieren Sie zum neuen Spiel
        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);

            if (error === TransactionStatus.ALREADY_CREATED) {
                // Wenn das Spiel bereits existiert, rufen Sie die existierende Methode askToJoinNewGame auf
                this.askWantToJoinNewGame();
            } else {
                alert(`Es ist ein Fehler aufgetreten beim Erstellen oder Abrufen der Spielinformationen. 
                Jemand hat möglicherweise bereits ein Spiel gestartet.
                Fehler: ${error}
                Die App wird neu geladen.`);

                debugger;

                // Zurück zum vorherigen Spiel
                this.router.navigate([`/game/${this.gameService.game.id}`]);
            }
        }
    }

    async startNewGame33() {
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

    openDialogConfirmJoinGame() {
        /* Prüfen ob change != undefined ist, also wirklich eine Img-Änderung gemacht wurde beim Öffen/Schliessen von Dialog, 
      da ohne die ifAbfrage ein undefined in Array gelangen würde und kein Avatar dargestellt wird, wenn man das Dialog anders schliesst
      als ohne Click auf ein Avatar-Vorschlag */
        // if (change) {
        //     if (change == 'DELETE') {
        //         /* Löschen des Players und seines Avatars an der Stelle 'playerId', wenn Button mit ReturnValue 'DELETE' gedrückt wurde. */
        //         this.game.players.splice(playerId, 1);
        //         this.game.player_images.splice(playerId, 1);
        //     } else {
        //         /* Aktualisieren des Pictures Array an der Stelle 'playerId' um den Wert 'change. */
        //         this.game.player_images[playerId] = change;
        //     }
        //     this.gameService.updateGameDoc(this.game);
        // }

        // if (change == true) this.decisionJoinGame = true;
        // else if (change ===false) this.decisionJoinGame = false;
        debugger;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    startNewGameBACKUP() {
        this.gameService.startNewGame();
    }
}
