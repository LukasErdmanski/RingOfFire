// import { Component, Input, OnChanges } from '@angular/core';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
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
    private viewInitFinished = false;
    private newGameIdInLastGameSub!: Subscription;
    private newGame$!: Observable<Game>;
    private gameOverInNewGameSub!: Subscription;
    private joinGame!: boolean;

    public constructor(private gameService: GameService, private router: Router, public dialog: MatDialog) {
        debugger;
    }

    public ngOnInit(): void {
        debugger;
        this.subscribeNewGameIdInLastGame();
    }

    public ngAfterViewInit(): void {
        debugger;
        this.viewInitFinished = true;
    }

    public ngOnDestroy(): void {
        // Vergiss nicht, das Subscription zu kündigen, wenn die Komponente zerstört wird
        this.gameOverInNewGameSub?.unsubscribe();
        this.newGameIdInLastGameSub?.unsubscribe();
        this.gameService?.unsubscribeGameDoc();
        debugger;
    }

    private subscribeNewGameIdInLastGame(): void {
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
                    this.newGameIdInLastGameSub.unsubscribe();
                    this.gameService.unsubscribeGameDoc();

                    this.gameService.resetGame();
                    this.gameService.game.id = newGameId;

                    debugger;
                    this.newGame$ = this.gameService.getGameDocData(this.gameService.game);
                    this.gameOverInNewGameSub = this.newGame$.pipe(map((newGame) => newGame.gameOver)).subscribe((gameOver) => {
                        debugger;
                        // Man könnte hier updateGameToGameDoc machen, aber uns interessiert nur das empfangene gameOver von newGame direkt aus Firebase.
                        // Es muss nicht, glaube ich, lokal das Game Model für die askToJoinGame Abfrage aktualisiert werden.
                        this.gameOverInNewGameSub.unsubscribe();

                        if (!gameOver) {
                            this.askWantToJoinNewGame();
                        }
                    });
                } else {
                }
            });
    }

    private async askWantToJoinNewGame(): Promise<void> {
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

    public async startNewGame(): Promise<void> {
        debugger;
        this.newGameIdInLastGameSub?.unsubscribe();
        this.gameService.unsubscribeGameDoc();

        let includeLastGamePlayers: boolean = false;

        if (this.joinGame === undefined) {
            includeLastGamePlayers = await this.askShouldIncludeLastGamePlayers();
        }

        try {
            await this.gameService.createGameDoc(includeLastGamePlayers); // Hier wird die Methode aufgerufen

            // Wenn das Promise aufgelöst wird, navigieren Sie zum Spiel mit der neuen ID
            this.router.navigate([`/game/${this.gameService.game.id}`]); // Hier navigieren Sie zum neuen Spiel
        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);

            if (error === TransactionStatus.ALREADY_CREATED) {
                // Wenn das Spiel bereits existiert, rufen Sie die existierende Methode askToJoinNewGame auf
                this.askWantToJoinNewGame();
            } else {
                console.error('An error occurred:', error);
                alert(`An error occurred while creating the game. 
                Error: ${error}
                The app will be reloaded.`);

                debugger;

                // Zurück zum vorherigen Spiel
                this.router.navigate([`/game/${this.gameService.game.id}`]);
            }
        }
    }

    private async askShouldIncludeLastGamePlayers(): Promise<boolean> {
        const dialogRef = this.dialog.open(DialogIncludeLastGamePlayersComponent, {
            disableClose: true,
        });

        console.log('TO JEST PLAYERS IN GAME SERVICE GAME: ', this.gameService.game.players);

        const includeLastGamePlayers: boolean = await firstValueFrom(dialogRef.afterClosed());

        debugger;

        return includeLastGamePlayers;
    }
}
