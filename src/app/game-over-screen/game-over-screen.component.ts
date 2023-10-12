import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { AsyncSubject, Observable, Subscription, catchError, combineLatest, filter, firstValueFrom, map, take } from 'rxjs';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { MatDialog } from '@angular/material/dialog';
import { DialogJoinGameComponent } from '../dialog-join-game/dialog-join-game.component';
import { DialogIncludeLastGamePlayersComponent } from '../dialog-include-last-game-players/dialog-include-last-game-players.component';
import { Game } from 'src/models/game';

/**
 * Error message displayed when there's an issue creating a game within the context of the game over screen.
 */
const ERROR_MESSAGE = 'An error occurred while creating the game. The app will be reloaded.';

/**
 * Represents the game over screen component.
 */
@Component({
    selector: 'app-game-over-screen',
    templateUrl: './game-over-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class GameOverScreenComponent implements OnInit, AfterViewInit {
    /* Properties related to the game over screen's state and behavior. */
    /**
     * Überblick über die verschiedenen Arten von Subjects in RxJS:
     *
     * - **Subject**:
     *   - Ein einfacher Event-Emitter.
     *   - Hat keinen aktuellen Wert.
     *   - Sendet Werte nur an Abonnenten, die nach dem Senden des Wertes abonniert haben.
     *   - **In diesem Kontext**: Nicht ideal. Wenn Sie Subject verwenden und das Rendering abgeschlossen ist,
     * bevor Sie den Wert gameOver erhalten, wird der Dialog nicht angezeigt, da der Subject den Wert nicht
     * an nachträglich hinzugefügte Abonnenten sendet.
     *
     * - **BehaviorSubject**:
     *   - Hat einen Anfangswert oder den letzten Wert, der an alle neuen Abonnenten gesendet wird.
     *   - **In diesem Kontext**: Wenn Sie BehaviorSubject mit einem Anfangswert verwenden, wird dieser Wert an alle
     *  neuen Abonnenten gesendet, auch wenn das Rendering oder gameOver bereits abgeschlossen ist. Das könnte nützlich
     * sein, aber Sie müssen sicherstellen, dass Sie einen sinnvollen Anfangswert setzen.
     *
     * - **ReplaySubject**:
     *   - Kann mehrere Werte "speichern" und diese an neue Abonnenten senden.
     *   - **In diesem Kontext**: ReplaySubject mit einer Konfiguration von 1 wäre eine Möglichkeit,
     * da es sicherstellt, dass der letzte Wert (z.B. das Ende des Renderings) an alle neuen Abonnenten gesendet wird,
     * unabhängig davon, wann sie abonnieren.
     *
     * - **AsyncSubject**:
     *   - Sendet nur den letzten Wert und nur, wenn der Subject abgeschlossen wurde.
     *   - **In diesem Kontext**: AsyncSubject könnte tatsächlich ideal sein, da er genau das Verhalten bietet,
     * das Sie wünschen: Er sendet den Wert nur, wenn das Rendering abgeschlossen ist und der Wert nur einmal
     * gesendet wird. Sie würden den Wert in ngAfterViewInit setzen und dann complete() aufrufen, um zu signalisieren,
     * dass das Rendering abgeschlossen ist.
     *
     * **Empfehlung**: Basierend auf Anforderungen, insbesondere der Notwendigkeit, sicherzustellen, dass das Rendering
     * wirklich abgeschlossen ist und dieser Zustand nur einmal gesendet wird, wäre AsyncSubject die beste Wahl.
     * Es bietet eine einfache und klare Lösung für Ihr spezifisches Problem, ohne Overengineering.
     */
    private viewInit$ = new AsyncSubject<boolean>();
    private joinGameDecision!: boolean;
    private subscriptions!: Subscription[];

    /**
     * Creates an instance of the GameOverScreenComponent.
     *
     * @param gameService - Service to manage game-related operations and data.
     * @param router - Angular's router to navigate between components.
     * @param dialog - Service to open Material Design modal dialogs.
     */
    constructor(private gameService: GameService, private router: Router, private dialog: MatDialog) {}

    /**
     * Lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
     * Here, it adds the active game subscription from the game service to the subscription list and
     * starts observing the new game ID from the last game, if the subscription in game service exist.
     */
    ngOnInit(): void {
        if (this.gameService.game$) {
            this.subscriptions = [];
            this.addActiveGameSubInGameServiceInSubList();
            this.observeNewGameIdFromLastGame();
        }
    }

    /**
     * Lifecycle hook that is called after Angular has fully initialized a component's view.
     * Here, it signals that the view has been initialized by emitting a value to the `viewInit$` AsyncSubject.
     */
    ngAfterViewInit(): void {
        this.viewInit$.next(true);
        this.viewInit$.complete();
    }

    /**
     * Lifecycle hook that is called just before Angular destroys the directive/component.
     * In the context of the game over screen, this method ensures that all active subscriptions
     * are unsubscribed to prevent memory leaks and unwanted behavior.
     */
    ngOnDestroy(): void {
        this.unsubscribeAll();
    }

    /**
     * Adds the active game subscription from the game service to the subscription list.
     */
    addActiveGameSubInGameServiceInSubList(): void {
        const activeGameSubInGameService: Subscription = this.gameService.gameSub;
        this.subscriptions.push(activeGameSubInGameService);
    }

    /**
     * Observes the new game ID from the last game and initiates the next steps if a valid new game ID is received.
     */
    private observeNewGameIdFromLastGame(): void {
        const newGameSub: Subscription = this.gameService.game$
            .pipe(
                map((lastGame) => lastGame.newGameId), // Extract the newGameId from the last game
                filter((newGameId) => typeof newGameId === 'string' && newGameId.trim() !== ''), // Ensure the newGameId is not empty
                take(1), // Only process the first valid newGameId
                catchError(this.handleObservationError('newGameId')) // Handle any errors that occur during the observation
            )
            .subscribe((newGameId) => {
                // Handle the received newGameId
                this.unsubscribeAll();
                this.resetGameWithNewGameId(newGameId);
                this.observeGameOverInNewGame();
            });

        this.subscriptions.push(newGameSub);
    }

    /**
     * Handles errors during observation.
     * @param field - The field being observed.
     */
    private handleObservationError(field: string) {
        return (error: any) => {
            console.error(`An error occurred receiving "${field}" data:`, error);
            alert(`An error occurred while receiving "${field}" data. Error: ${error}`);
            throw `Error observing "${field}". Details: ` + error;
        };
    }

    /**
     * Resets the game with a new game ID.
     * @param newGameId - The new game ID.
     */
    private resetGameWithNewGameId(newGameId: string): void {
        this.gameService.resetGame();
        this.gameService.game.id = newGameId;
    }

    /**
     * Observes the status of the new game to determine if it is over.
     */
    private observeGameOverInNewGame(): void {
        // Retrieve the observable for the new game from the service
        const gameOver$: Observable<Game> = this.gameService.getGameDocData(this.gameService.game);

        // Process the observable to determine if the game is over
        gameOver$.pipe(
            map((newGame) => newGame.gameOver), // Extract the gameOver status from the new game
            filter((gameOver) => !gameOver), // Only proceed if the game is not over
            take(1), // Only process the first emitted value
            catchError(this.handleObservationError('gameOver')) // Handle any errors that occur during the observation
        );

        // Combine the gameOver observable with the view initialization observable
        const gameOverSub: Subscription = combineLatest([gameOver$, this.viewInit$])
            .pipe(take(1))
            .subscribe(() => {
                // Prompt the user to join the new game once the game is not over and the view has been initialized
                this.promptJoinNewGame();
            });

        this.subscriptions.push(gameOverSub);
    }

    /**
     * Prompts the user to join the new game.
     */
    private async promptJoinNewGame(): Promise<void> {
        this.joinGameDecision = await this.openJoinGameDialog();
        this.handleJoinGameDecision();
    }

    /**
     * Opens a dialog to ask the user if they want to join the new game.
     */
    private async openJoinGameDialog(): Promise<boolean> {
        const dialogRef = this.dialog.open(DialogJoinGameComponent, { disableClose: true });
        return await firstValueFrom(dialogRef.afterClosed());
    }

    /**
     * Handles the user's decision to join the new game.
     */
    private handleJoinGameDecision(): void {
        if (this.joinGameDecision) {
            this.navigateToGame();
        } else {
            this.gameService.resetGame();
        }
    }

    /**
     * Navigates to the game component.
     */
    private navigateToGame(): void {
        this.router.navigate([`/game/${this.gameService.game.id}`]);
    }

    /**
     * Unsubscribes from all active subscriptions.
     */
    private unsubscribeAll(): void {
        if (this.subscriptions) {
            this.subscriptions.forEach((sub) => sub.unsubscribe());
            this.subscriptions = [];
        }
    }

    /**
     * Initiates the process to start a new game.
     */
    public async startNewGame(): Promise<void> {
        this.unsubscribeAll();
        let includeLastGamePlayers = false;
        if (this.gameService.game.players.length > 0) {
            includeLastGamePlayers = this.joinGameDecision === undefined ? await this.promptIncludeLastGamePlayers() : false;
        }
        const creationSuccess = await this.createGame(includeLastGamePlayers);
        if (creationSuccess) {
            this.navigateToGame();
        }
    }

    /**
     * Attempts to create a new game.
     */
    private async createGame(includeLastGamePlayers: boolean): Promise<boolean> {
        try {
            await this.gameService.createGameDoc(includeLastGamePlayers);
            return true;
        } catch (error) {
            this.handleGameCreationError(error);
            return false;
        }
    }

    /**
     * Handles errors that occur during game creation.
     * @param error - The error that occurred.
     * @throws {string} Throws an error message if the game creation fails.
     */
    private handleGameCreationError(error: any): void {
        if (error === TransactionStatus.ALREADY_CREATED) {
            this.promptJoinNewGame();
        } else {
            alert(ERROR_MESSAGE);
            this.navigateToGame();
        }
    }

    /**
     * Prompts the user to decide whether to include players from the last game in the new game.
     */
    private async promptIncludeLastGamePlayers(): Promise<boolean> {
        const dialogRef = this.dialog.open(DialogIncludeLastGamePlayersComponent, { disableClose: true });
        return await firstValueFrom(dialogRef.afterClosed());
    }
}
