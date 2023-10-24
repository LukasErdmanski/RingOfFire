import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { AsyncSubject, Observable, Subscription, catchError, combineLatest, filter, firstValueFrom, map, take } from 'rxjs';
import { TransactionStatus } from '../../enums/transaction-status.enum';
import { MatDialog } from '@angular/material/dialog';
import { DialogJoinGameComponent } from '../dialog-join-game/dialog-join-game.component';
import { DialogIncludeLastGamePlayersComponent } from '../dialog-include-last-game-players/dialog-include-last-game-players.component';
import { Game } from 'src/models/game';
import { ERROR_MESSAGE } from 'src/app/constants/error-message.contants';

/**
 * Represents the game over screen component.
 */
@Component({
    selector: 'app-game-over-screen',
    templateUrl: './game-over-screen.component.html',
    styleUrls: ['../../../assets/scss/screen.scss'],
})
export class GameOverScreenComponent implements OnInit, AfterViewInit, OnDestroy {
    // Properties related to the game over screen's state and behavior.
    /**
     * Overview of the different types of Subjects in RxJS:
     *
     * - **Subject**:
     *   - A simple event emitter.
     *   - Does not have a current value.
     *   - Sends values only to subscribers who subscribed after the value was emitted.
     *   - **In this context**: Not ideal. If you use Subject and rendering completes before you receive
     *     the gameOver value, the dialog won't be displayed since the Subject doesn't send the value to
     *     subsequently added subscribers.
     *
     * - **BehaviorSubject**:
     *   - Has an initial value or the last value, which is sent to all new subscribers.
     *   - **In this context**: If you use BehaviorSubject with an initial value, that value is sent to all
     *     new subscribers, even if rendering or gameOver has already completed. This could be useful, but
     *     you need to ensure you set a meaningful initial value.
     *
     * - **ReplaySubject**:
     *   - Can "store" multiple values and send them to new subscribers.
     *   - **In this context**: ReplaySubject with a configuration of 1 would be an option, as it ensures
     *     the last value (e.g., end of rendering) is sent to all new subscribers, regardless of when they
     *     subscribe.
     *
     * - **AsyncSubject**:
     *   - Sends only the last value and only when the Subject has completed.
     *   - **In this context**: AsyncSubject might actually be ideal as it provides exactly the behavior
     *     you want: It sends the value only when rendering is complete and the value is sent only once.
     *     You'd set the value in ngAfterViewInit and then call complete() to signal that rendering is done.
     *
     * **Recommendation**: Based on requirements, especially the need to ensure rendering is truly complete
     * and this state is sent only once, AsyncSubject would be the best choice. It offers a simple and clear
     * solution to your specific problem without overengineering.
     */

    private viewInit$ = new AsyncSubject<boolean>();
    private joinGameDecision!: boolean;
    private subscriptions!: Subscription[];

    /**
     * Initializes a new instance of the GameOverScreenComponent.
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
     * @throws {string} Throws an error message if an error occurs during observation.
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
     * @returns A promise that resolves when the user has made a decision.
     */
    private async promptJoinNewGame(): Promise<void> {
        this.joinGameDecision = await this.openJoinGameDialog();
        this.handleJoinGameDecision();
    }

    /**
     * Opens a dialog to ask the user if they want to join the new game.
     * @returns A promise that resolves to a boolean indicating the user's decision.
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
     * @returns A promise that resolves when the new game has started.
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
     * @param includeLastGamePlayers - A boolean indicating whether to include players from the last game.
     * @returns A promise that resolves to a boolean indicating the success of the game creation.
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
     * Handles errors that occ ur during game creation.
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
     * @returns A promise that resolves to a boolean indicating the user's decision.
     */
    private async promptIncludeLastGamePlayers(): Promise<boolean> {
        const dialogRef = this.dialog.open(DialogIncludeLastGamePlayersComponent, { disableClose: true });
        return await firstValueFrom(dialogRef.afterClosed());
    }
}
