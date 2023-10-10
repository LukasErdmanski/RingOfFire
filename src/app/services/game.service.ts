import { Injectable, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { CollectionReference, DocumentData, DocumentReference, Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, runTransaction, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { TransactionStatus } from '../enums/transaction-status.enum';

/* Sie möchten nicht mehrere Instanzen desselben Service in Ihrer Anwendung haben. 
  Wenn Sie einen Service über den Konstruktor einer Komponente bereitstellen, 
  erstellt Angular keine neue Instanz des Services, sondern verwendet eine Singconston-Instanz, 
  die im Root-Injector der Anwendung vorhanden ist. Dies ist genau das Verhalten, das Sie wollen.

  In Angular, wenn ein Service mit dem @Injectable({ providedIn: 'root' }) Dekorator markiert ist (wie es üblich ist), 
  dann wird der Service als Singconston behandelt. Das bedeutet, dass Angular automatisch eine einzige Instanz des Service erstellt 
  und diese an alle Komponenten bereitstellt, die den Service benötigen. 
  Wenn Sie den Service in den Konstruktor einer Komponente injizieren, erhalten Sie Zugriff auf diese Singconston-Instanz.

  Also, obwohl es so aussieht, als würden Sie jedes Mal eine neue Instanz des Service erstellen, 
  wenn Sie den Service in den Konstruktor einer Komponente injizieren, ist das nicht der Fall. 
  Sie greifen tatsächlich auf die gleiche Singconston-Instanz des Service zu, egal in welcher Komponente Sie sich befinden.

  Daher ist Ihr ursprünglicher Ansatz, den Service im Konstruktor zu injizieren, korrekt und wird empfohlen: */
@Injectable({
    providedIn: 'root',
})
export class GameService {
    /* ================================================================================================================================= */
    /* ================================================================================================================================= */
    /* ==============================  AB 22.09.2023 NEU ANFANG  ======================================================================= */
    private firestore: Firestore = inject(Firestore);
    public firstDataReceived!: boolean;
    public game!: Game;


    constructor(private router: Router) {
        debugger;
        this.resetGame();
    }

    private gameOverSubject = new BehaviorSubject<boolean>(false);
    public gameOver$ = this.gameOverSubject.asObservable();

    /* Erstellt neues Game Objekt */
    resetGame(): void {
        console.log('GAME SERVICE__ / __ resetGame Anfang, firstDataReceived: ', this.firstDataReceived);
        // this.firstDataReceived = false;

        this.game = new Game();

        // this.game = new Game();
    }

    async createGameDoc(includeLastGamePlayers?: boolean): Promise<TransactionStatus> {
        return new Promise<TransactionStatus>(async (resolve, reject) => {
            try {
                const newGame = new Game();

                debugger;
                if (includeLastGamePlayers) {
                    debugger;
                    newGame.players = this.game.players;
                    newGame.player_images = this.game.player_images;
                }

                let transactionSuccessful = true;

                await runTransaction(this.firestore, async (transaction) => {
                    let lastGameSingleDocRef;
                    let lastGameSingleDoc;

                    if (this.game && this.game.id) {
                        lastGameSingleDocRef = this.getSingleGameDocRef(this.game);
                        lastGameSingleDoc = await transaction.get(lastGameSingleDocRef);

                        if (lastGameSingleDoc.exists() && lastGameSingleDoc.data()['newGameId']) {
                            // Aktualisieren Sie this.game mit dem neuen Game Objekt
                            const newGameId = lastGameSingleDoc.data()['newGameId'];

                            debugger;
                            this.game.id = newGameId;
                            reject(TransactionStatus.ALREADY_CREATED);
                            transactionSuccessful = false;
                            return;
                        }
                    }

                    debugger;

                    const gameColRef = this.getGameColRef();

                    const newGameAsJson = newGame.toJson();
                    const newGameDocRef = await addDoc(gameColRef, newGameAsJson);
                    const newGameId = newGameDocRef.id;
                    // ////////////////////////////////////////////
                    if (lastGameSingleDocRef) {
                        this.game.newGameId = newGameId;
                        transaction.update(lastGameSingleDocRef, { newGameId: newGameId });
                        console.log('Dokument aktualisiert');
                    }

                    debugger;

                    newGame.id = newGameId;
                    transaction.update(newGameDocRef, { id: newGameId });
                });

                if (transactionSuccessful) {
                    this.game = newGame;
                    resolve(TransactionStatus.SUCCES);
                }
            } catch (error) {
                console.error('Ein Fehler ist aufgetreten:', error);
                if (error === TransactionStatus.ALREADY_CREATED) {
                    // Wenn der Fehler TransactionStatus.ALREADY_CREATED ist, werfen Sie ihn erneut,
                    // sodass er im catch-Block von startNewGame abgefangen werden kann.
                    throw error;
                } else {
                    // Für alle anderen Fehler, lehnen Sie das Promise ab.
                    reject(error);
                }
            } finally {
                debugger;
                console.warn('GAME SERVICE / CREATE GAME DOC geht HIEEEEER ZU ENDE ');
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //#region READ / GET / SUB
    /* TODO: Vielleicht am Ende nach Oben schieben */
    game$!: Observable<Game>;
    gameSub!: Subscription;
    navigatedToGameOverScreen!: boolean;

    async subcribeGameDoc(): Promise<Game> {
        this.firstDataReceived = false;
        this.navigatedToGameOverScreen = false;

        return new Promise((resolve, reject) => {
            try {
                /* Es wird erstmal die aktuelle GameDoc Referenz mit der konkretten ID rausgelesen. 
                Dann wird aus der Collection das Dokument mit einer bestimmten ID geholt.
                Dann wird das konkrette Dokument, mit der konkretten ID, aboniert, also das eindeutige 'game'. 
                'docData' (genauso wie 'collectionData' nach 'collection') ist ein Obvervable, hier vom Typ DocumentData[] 
                (bei collectionData ist es vom Typ CollectionData[]) ausgeführt direkt nach 'doc'. 
                Es muss also zuerst z.B: mit 'subscribe' aufgelöst werden, 
                um auf den Wert davon zugreifen zu können. */
                /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
                debugger;
                this.game$ = this.getGameDocData(this.game);
                this.gameSub = this.game$.subscribe({
                    next: (game) => {
                        console.log('GAME SERVICE / Am Anfang von SUBCRIBE_GAME_DOC_IN_GAME_SERVICE____RECEIVED GAME: ', game);
                        this.updateGameToGameDoc(game);

                        // debugger;

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
                    },
                    error: (error) => {
                        console.error('Fehler beim Empfangen der Daten:', error);
                        reject(error); // Hier werden asynchrone Fehler abgefangen
                    },
                });
            } catch (error) {
                console.error('Unerwarteter Fehler:', error);
                reject(error); // Hier werden synchrone Fehler abgefangen
            }
        });
    }

    unsubscribeGameDoc() {
        debugger;
        if (this.gameSub && !this.gameSub.closed) {
            console.warn('GAME SERVICE / unsubscribeGameDoc:  JA ES EXISITERT EINE SUBSCRIPTION und Die Subscription ist noch aktiv.');
        } else {
            console.log('GAME SERVICE / unsubscribeGameDoc:  Die Subscription ist geschlossen.');
        }

        this.gameSub?.unsubscribe();
    }

    getGameDocData(game: Game): Observable<Game> {
        const gameSingleDocRef = this.getSingleGameDocRef(game);
        /* Angular, dieses Programm weißt nicht ob 'game' von Firebase DB dieses Properties wie game.players, game.stack, game.playedCars etc. hat. 
        Um diesen Fehler in strict mode umzugen, schreibt man game: any */
        return docData(gameSingleDocRef).pipe(map((gameDocData: DocumentData) => gameDocData as Game));
    }

    getGameColRef(): CollectionReference<DocumentData> {
        return collection(this.firestore, 'games');
    }

    getSingleGameDocRef(game: Game): DocumentReference<DocumentData> {
        // debugger;
        const gameColRef = this.getGameColRef();
        // const gameId = this.game.id;
        const gameId = game.id;
        return doc(gameColRef, gameId);
    }
    //#endregion READ / GET / SUB

    async updateGameDoc(game: Game) {
        // debugger;
        /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
        const gameSingleDocRef = this.getSingleGameDocRef(game);
        const gameAsJson = game.toJson();
        await updateDoc(gameSingleDocRef, gameAsJson).catch((err) => {
            // debugger;
            console.error(err);
        });
    }

    async deleteGameDoc(game: Game) {
        const gameSingleDocRef = this.getSingleGameDocRef(game);
        await deleteDoc(gameSingleDocRef).catch((err) => {
            console.error(err);
        });
    }
    //#endregion CRUD

    updateGameToGameDoc(game: Game) {
        // debugger;

        /* Updaten der App Variable game um die Werte aus der Firebase DB. */
        this.game.id = game.id;
        this.game.players = game.players;
        this.game.stack = game.stack;
        this.game.playedCards = game.playedCards;
        this.game.cardsRightToBottomStack = game.cardsRightToBottomStack;
        this.game.player_images = game.player_images;
        this.game.currentPlayer = game.currentPlayer;
        /* Ergänzen um diese Props (Animationsvariable und Variable der aktuellen Karte) für Synchronisierung dieser Reaktionen auf anderen Geräten. */
        this.game.pickCardAnimation = game.pickCardAnimation;
        this.game.currentCard = game.currentCard;
        this.game.gameOver = game.gameOver;

        this.game.newGameId = game.newGameId;

        // debugger;
    }
}
