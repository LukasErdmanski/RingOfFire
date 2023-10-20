import { Injectable, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, Firestore, Transaction, addDoc, collection, deleteDoc, doc, docData, runTransaction, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';
import { TransactionStatus } from '../enums/transaction-status.enum';

/**
 * `GameService` is responsible for managing all CRUD operations related to the game,
 * specifically in the context of Firebase communication. This includes creating, reading,
 * (subscribing to) updating, and deleting game data.
 *
 * The service acts as a central repository for the game's state, ensuring that components
 * such as the game, game over screen, and dialog components can access and modify the game's
 * state in a consistent manner. Any reads or updates originating from these components are
 * channeled through this service, ensuring a unified communication flow with Firebase for
 * a specific collection/document ID.
 *
 * By encapsulating these operations within the service, it provides a centralized and
 * consistent mechanism for components to interact with the game's data, while also abstracting
 * the underlying Firebase operations.
 *
 * When a service is decorated with `@Injectable({ providedIn: 'root' })`, Angular treats the service
 * as a singleton. This means Angular automatically creates a single instance of the service
 * and provides it to all components that require it. Injecting the service into a component's
 * constructor doesn't create a new instance but provides access to the singleton instance.
 * This ensures consistent data and behavior across components.
 */
@Injectable({
    providedIn: 'root',
})
export class GameService {
    /**
     * Firestore instance with specific settings related to the Firebase account and database.
     * Used for CRUD operations within this service.
     */
    private firestore: Firestore = inject(Firestore);

    /**
     * Represents the current game's state.
     * This property is used to track and manage the game's data throughout its lifecycle.
     */
    public game!: Game;
    /**
     * An observable representing the game data stream.
     * This allows components to reactively listen to changes in the game's state.
     */
    public game$!: Observable<Game>;
    /**
     * Subscription to the game data stream.
     * This is used to manage the subscription lifecycle and prevent memory leaks.
     */
    public gameSub!: Subscription;
    /**
     * Indicates if the service has received data at least once during the initial fetch.
     * This helps in managing the initial state and subsequent updates.
     */
    public firstDataReceived!: boolean;

    /**
     * Indicates if the service has received data at least once during the initial fetch.
     * This helps in managing the initial state and subsequent updates.
     */
    private navigatedToGameOverScreen!: boolean;

    /**
     * Initializes a new instance of the GameService.
     * Sets up the initial game state.
     * @param router - The Angular router service.
     */
    constructor(private router: Router) {
        this.resetGame();
    }

    /**
     * Resets the game to its initial state with an empty property `gameId` (""),
     * which is based on the Firebase collection document ID.
     * The actual assignment of a specific `gameId` will be ensured later,
     * either when creating a new game from the start screen or game over screen,
     * or when opening a game directly from an open game read from the route of the game component.
     */
    public resetGame(): void {
        this.game = new Game();
    }

    //#region CRUD
    /**
     * Initiates the process of creating a new game document.
     * This method orchestrates the steps required to ensure a new game is correctly initialized,
     * potentially linked to a previous game, and then stored in Firebase.
     *
     * @param includeLastGamePlayers - Optional flag to determine if players from last game should be included in new game.
     * @returns A promise that resolves with the transaction status, indicating success or the reason for failure.
     * @throws Will throw an error if there's an issue during the game document creation process.
     */
    public async createGameDoc(includeLastGamePlayers?: boolean): Promise<TransactionStatus> {
        debugger;
        return new Promise<TransactionStatus>(async (resolve, reject) => {
            try {
                const initialNewGame = this.initializeNewGame(includeLastGamePlayers);
                const updatedNewGame = await this.tryCreateNewGameInTransaction(initialNewGame);
                this.setUpdatedNewGameAsCurrentGame(updatedNewGame);
                resolve(TransactionStatus.SUCCESS);
            } catch (error) {
                this.handleCreateGameDocError(error, reject);
            } finally {
                console.warn('GAME SERVICE / CREATE GAME DOC geht HIEEEEER ZU ENDE ');
            }
        });
    }
    /**
     * Initializes a new game instance with optional players from the last game.
     * @param includeLastGamePlayers - Flag to determine if the last game's players should be included.
     * @returns A new game instance.
     */
    private initializeNewGame(includeLastGamePlayers?: boolean): Game {
        const newGame = new Game();
        if (includeLastGamePlayers) {
            newGame.players = this.game.players;
            newGame.playerImages = this.game.playerImages;
        }
        return newGame;
    }

    /**
     * Attempts to create a new game within a transaction.
     * This ensures atomicity and consistency when creating a new game.
     * @param newGame - The initial game instance to be created.
     * @returns The updated game instance after the transaction.
     */
    private async tryCreateNewGameInTransaction(newGame: Game): Promise<Game> {
        return new Promise<Game>(async (resolve, reject) => {
            await runTransaction(this.firestore, async (transaction) => {
                let lastGameDocRef = this.existsLastEndedGameWithIdOnDevice() ? this.getGameDocRef(this.game) : null;
                if (lastGameDocRef) await this.evaluateNewGameIdInLastGameInTransaction(transaction, lastGameDocRef, reject);
                const newGameDocRef = await this.addNewGameDoc(newGame);
                if (lastGameDocRef) this.updateLastGameWithNewGameIdInTransaction(transaction, newGameDocRef, lastGameDocRef);
                const updatedNewGame = this.updateNewGameWithIdInTransaction(transaction, newGameDocRef, newGame);
                resolve(updatedNewGame);
            });
        });
    }

    /**
     * Checks if there exists a last ended game with an ID on the device.
     * This helps in determining if a new game should be linked to a previous game.
     * @returns True if a last ended game with an ID exists, false otherwise.
     */
    private existsLastEndedGameWithIdOnDevice(): boolean {
        return this.game && this.game.id.trim() !== '' && this.game.gameOver === true;
    }

    /**
     * Evaluates the new game ID in the last game within a transaction.
     * This ensures that the new game is correctly linked to the last game.
     * @param transaction - The current transaction instance.
     * @param lastGameDocRef - The document reference of the last game.
     * @param reject - The reject function of the promise.
     */
    private async evaluateNewGameIdInLastGameInTransaction(transaction: Transaction, lastGameDocRef: DocumentReference<DocumentData>, reject: (reason?: any) => void): Promise<void> {
        try {
            const lastGameDocumentSnapshot = await this.getLastGameDocSnapshotInTransaction(transaction, lastGameDocRef);
            if (this.IsNewGameIdAlreadySetInLastEndedGameOnFirebase(lastGameDocumentSnapshot)) {
                this.handleExistingNewGameId(lastGameDocumentSnapshot, reject);
            }
        } catch (error) {
            reject(error);
        }
    }

    /**
     * Fetches the last game's document snapshot within a transaction.
     * @param transaction - The current transaction instance.
     * @param lastGameDocRef - The document reference of the last game.
     * @returns The document snapshot of the last game.
     */
    private async getLastGameDocSnapshotInTransaction(transaction: Transaction, lastGameDocRef: DocumentReference<DocumentData>): Promise<DocumentSnapshot<DocumentData>> {
        let lastGameDocumentSnapshot: DocumentSnapshot<DocumentData>;
        return (lastGameDocumentSnapshot = await transaction.get(lastGameDocRef));
    }

    /**
     * Checks if a new game ID is already set in the last ended game on Firebase.
     * This ensures that games are not duplicated or incorrectly linked.
     * @param lastGameDoc - The document snapshot of the last game.
     * @returns True if a new game ID is already set, false otherwise.
     */
    private IsNewGameIdAlreadySetInLastEndedGameOnFirebase(lastGameDoc: DocumentSnapshot<DocumentData>): boolean {
        return lastGameDoc.exists() && lastGameDoc.data()['newGameId'];
    }
    /**
     * Handles the scenario where a new game ID already exists in the last ended game.
     * This ensures that the game's state is correctly updated and prevents duplication.
     * @param lastGameDoc - The document snapshot of the last game.
     * @param reject - The reject function of the promise.
     */
    private handleExistingNewGameId(lastGameDoc: DocumentSnapshot<DocumentData>, reject: (reason?: any) => void): void {
        const newGameIdValue = lastGameDoc.data()?.['newGameId'];
        this.setCurrentGameIdWithNewGameId(newGameIdValue);
        debugger;
        reject(TransactionStatus.ALREADY_CREATED);
    }

    /**
     * Updates the current game's ID with the provided new game ID value.
     * This method is typically used when linking the current game to a new game, ensuring continuity and reference.
     *
     * @param newGameIdValue - The new game ID value to set for the current game.
     */
    private setCurrentGameIdWithNewGameId(newGameIdValue: string): void {
        this.game.id = newGameIdValue;
    }

    /**
     * Adds a new game document to the Firebase collection.
     * @param newGame - The game instance to be added.
     * @returns The document reference of the newly added game.
     */
    private async addNewGameDoc(newGame: Game): Promise<DocumentReference<DocumentData>> {
        const gameColRef = this.getGameColRef();
        const newGameAsJson = newGame.toJson();
        return await addDoc(gameColRef, newGameAsJson);
    }

    /**
     * Updates the last game with the new game's ID within a transaction.
     * This links the new game to the last game for continuity.
     * @param transaction - The current transaction instance.
     * @param newGameDocRef - The document reference of the new game.
     * @param lastGameDocRef - The document reference of the last game.
     */
    private updateLastGameWithNewGameIdInTransaction(transaction: Transaction, newGameDocRef: DocumentReference<DocumentData>, lastGameDocRef: DocumentReference<DocumentData>): void {
        const newGameIdValue: string = newGameDocRef.id;
        // Update locally the last game with the new game id on device.
        this.game.newGameId = newGameIdValue;
        // Update the last game with the new game id on Firebase.
        transaction.update(lastGameDocRef, { newGameId: newGameIdValue });
    }

    /**
     * Updates the new game with its ID within a transaction.
     * This ensures that the game's ID is consistent across the application and Firebase.
     * @param transaction - The current transaction instance.
     * @param newGameDocRef - The document reference of the new game.
     * @param newGame - The game instance to be updated.
     * @returns The updated game instance.
     */
    private updateNewGameWithIdInTransaction(transaction: Transaction, newGameDocRef: DocumentReference<DocumentData>, newGame: Game): Game {
        debugger;
        const newGameIdValue: string = newGameDocRef.id;
        // Update locally the new game with the new game id on device .
        newGame.id = newGameIdValue;
        // Update the new game with the new game id on Firebase.
        transaction.update(newGameDocRef, { id: newGameIdValue });
        return newGame;
    }

    /**
     * Sets the updated game as the current game.
     * This ensures that the game's state is consistent across the application.
     * @param updatedNewGame - The updated game instance.
     */
    private setUpdatedNewGameAsCurrentGame(updatedNewGame: Game): void {
        this.game = updatedNewGame;
    }

    /**
     * Handles errors that occur during the game document creation process.
     * This provides a mechanism for error reporting and recovery.
     * @param error - The error that occurred.
     * @param reject - The reject function of the promise.
     */
    private handleCreateGameDocError(error: any, reject: (reason?: any) => void): void {
        console.error('Ein Fehler ist aufgetreten:', error);
        if (error === TransactionStatus.ALREADY_CREATED) {
            console.error('Game document already created. Another player from the last round started a new game before you:', error);
            reject(error);
        } else {
            console.error('An error occurred during game document creation:', error);
            reject(error);
        }
    }

    //#region READ / GET / SUB
    /**
     * Subscribes to the game document.
     * @returns A promise that resolves with the game data.
     * @throws Will throw an error if there's an issue subscribing to the game document.
     */
    public async subscribeGameDoc(): Promise<Game> {
        this.initializeSubscriptionState();
        return new Promise((resolve, reject) => {
            try {
                /**
                 * Initially, the collection reference is obtained using the collection name and Firestore settings.
                 * Then, using the document ID from the collection reference, a unique document reference is fetched.
                 * The data from the document is then subscribed to using this unique reference. Before subscribing,
                 * optional pipe operations like map, filter, take, catchError, etc., can be applied to refine the data
                 * stream. 'docData' returns an Observable of type DocumentData. To access its content, it must be resolved,
                 * for instance, using 'subscribe'. Within the subscription, the data can either be typed as 'any' (not optimal)
                 * or assigned a specific data type. Inside the subscription, methods like 'next', 'error', and 'complete'
                 * can be used for further data processing.
                 *
                 * Reference: https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md
                 * Reference: https://rxjs.dev/guide/observable#observable
                 */
                this.setupGameSubscription(resolve, reject);
            } catch (error) {
                this.handleGameSubscriptionSyncError(error, reject);
            }
        });
    }

    /**
     * Initializes the state variables related to subscription.
     */
    private initializeSubscriptionState(): void {
        debugger;
        this.firstDataReceived = false;
        this.navigatedToGameOverScreen = false;
    }

    /**
     * Sets up the game subscription.
     * @param resolve - The resolve function from the promise.
     * @param reject - The reject function from the promise.
     */
    private setupGameSubscription(resolve: (value: Game) => void, reject: (reason?: any) => void): void {
        this.game$ = this.getGameDocData(this.game);
        this.gameSub = this.game$.subscribe({
            next: (game) => this.handleGameSubscription(game, resolve),
            error: (error) => this.handleGameSubscriptionAsyncError(error, reject),
        });
    }

    /**
     * Handles the game subscription logic.
     * @param game - The current game instance.
     * @param resolve - The resolve function of the promise.
     */
    private handleGameSubscription(game: Game, resolve: (value: Game) => void): void {
        console.log('GAME SERVICE / Am Anfang von SUBCRIBE_GAME_DOC_IN_GAME_SERVICE____RECEIVED GAME: ', game);
        this.updateGameBasedOnReceivedGameDoc(game);

        console.log('GAME SERVICE / firstDataReceived___ IN subGame VOR IF ist the : ', this.firstDataReceived);
        if (!this.firstDataReceived) {
            console.warn('GAME SERVICE / firstDataReceived___ IN subGame IST FALSE WIRD GLEICH TRUE : ', this.firstDataReceived);
            this.firstDataReceived = true;
            console.warn('GAME SERVICE / firstDataReceived___ IN subGame TRUE AB JETZT!!! : ', this.firstDataReceived);
            resolve(game);
        }

        console.warn('GAME SERVICE / VOR IF ÜBERPRÜFUNG OB GAME OVER TRUE UND NAVIGATE TO GO-COMPONENT FALSE IST, GAME OVER UND NAVIGATED IST: ', game.gameOver, this.navigatedToGameOverScreen);
        if (game && game.gameOver && !this.navigatedToGameOverScreen) {
            this.navigatedToGameOverScreen = true;
            console.warn('GAME SERVICE / NAVIGIERE ZU GAME OVER SCREEN');
            this.router.navigate(['/game-over-screen']);
        }
    }

    /**
     * Handles asynchronous errors that occur while subscribing to the game document.
     * @param error - The error that occurred.
     * @param reject - The reject function from the promise.
     */
    private handleGameSubscriptionAsyncError(error: any, reject: (reason?: any) => void): void {
        console.error('Asynchronous error while subscribing to game document:', error);
        reject(error);
    }

    /**
     * Handles synchronous errors that occur while setting up the game document subscription.
     * @param error - The error that occurred.
     * @param reject - The reject function from the promise.
     */
    private handleGameSubscriptionSyncError(error: any, reject: (reason?: any) => void): void {
        console.error('Synchronous error while setting up game document subscription:', error);
        reject(error);
    }

    /**
     * Returns the game document data as an observable.
     * @param game - The game instance.
     * @returns An observable of the game data.
     */
    public getGameDocData(game: Game): Observable<Game> {
        try {
            const gameDocRef = this.getGameDocRef(game);
            /**
             * It is not known if 'gameDocData' from Firebase DB has properties like
             * game.players, game.stack, etc. To address this in strict mode, type as
             * 'any' or assign a specific data type, e.g., Game.
             */
            return docData(gameDocRef).pipe(map((gameDocData: DocumentData) => gameDocData as Game));
        } catch (error) {
            console.error('Error getting game document data:', error);
            throw error;
        }
    }

    /**
     * Returns the single game document reference based on the game ID.
     * @param game - The game instance.
     * @returns The game document reference.
     */
    private getGameDocRef(game: Game): DocumentReference<DocumentData> {
        try {
            const gameColRef = this.getGameColRef();
            const gameId = game.id;
            return doc(gameColRef, gameId);
        } catch (error) {
            console.error('Error getting game document reference:', error);
            throw error;
        }
    }

    /**
     * Returns the game collection reference.
     * @returns The game collection reference.
     */
    private getGameColRef(): CollectionReference<DocumentData> {
        try {
            return collection(this.firestore, 'games');
        } catch (error) {
            console.error('Error getting game collection reference:', error);
            throw error;
        }
    }
    //#endregion READ / GET / SUB

    /**
     * Updates the game document.
     * @param game - The game to update.
     * @throws Will throw an error if the update fails.
     */
    public async updateGameDoc(game: Game): Promise<void> {
        try {
            const gameDocRef = this.getGameDocRef(game);
            const gameAsJson = game.toJson();
            await updateDoc(gameDocRef, gameAsJson);
        } catch (error) {
            console.error('Error updating game document:', error);
            throw error;
        }
    }

    /**
     * Deletes the game document.
     * @param game - The game to delete.
     * @throws Will throw an error if the deletion fails.
     */
    private async deleteGameDoc(game: Game): Promise<void> {
        try {
            const gameDocRef = this.getGameDocRef(game);
            await deleteDoc(gameDocRef);
        } catch (error) {
            console.error('Error deleting game document:', error);
            throw error;
        }
    }
    //#endregion CRUD

    /**
     * Updates the game state based on the received game document.
     * @param game - The received game data.
     */
    private updateGameBasedOnReceivedGameDoc(game: Game): void {
        this.game.id = game.id;
        this.game.players = game.players;
        this.game.stack = game.stack;
        this.game.playedCards = game.playedCards;
        this.game.cardsRightToBottomStack = game.cardsRightToBottomStack;
        this.game.playerImages = game.playerImages;
        this.game.currentPlayer = game.currentPlayer;
        this.game.gameOver = game.gameOver;
        this.game.newGameId = game.newGameId;
        /**
         * Properties like pickCardAnimation variables and the current card
         * are included for synchronizing animations and reactions across devices.
         */
        this.game.pickCardAnimation = game.pickCardAnimation;
        this.game.currentCard = game.currentCard;
    }
}