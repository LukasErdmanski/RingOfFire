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

    // TODO: Vielleicht wird es gebraucth für den Vergleich alte Game ID / neue Game Id bei Starten New Game in gleichem Browser Tab
    gameId!: string;

    constructor(private router: Router) {
        debugger;
        this.resetGame();
    }

    private gameOverSubject = new BehaviorSubject<boolean>(false);
    public gameOver$ = this.gameOverSubject.asObservable();

    async startNewGameFromStartScreen() {}

    async startNewGame2() {
        console.log('GAME SERVICE__ / __ startNewGame2, firstDataReceived: ', this.firstDataReceived);
        // debugger;

        // this.resetGame(); // Reset the current game
        await this.createGameDoc2(); // Create a new game document
        console.log('GAME SERVICE__ / __ VOR NAVIGIEIRE ZU GAME ID, firstDataReceived: ', this.firstDataReceived);
        this.router.navigate([`/game/${this.game.id}`]); // Navigate to the new game
    }

    /* Erstellt neues Game Objekt */
    resetGame(): void {
        console.log('GAME SERVICE__ / __ resetGame Anfang, firstDataReceived: ', this.firstDataReceived);
        // this.firstDataReceived = false;

        this.game = new Game();

        // this.game = new Game();
    }

    async createGameDoc2(): Promise<TransactionStatus> {
        return new Promise<TransactionStatus>(async (resolve, reject) => {
            try {
                const newGame = new Game();
                await runTransaction(this.firestore, async (transaction) => {
                    let lastGameSingleDocRef;
                    let lastGameSingleDoc;

                    if (this.game && this.game.id) {
                        lastGameSingleDocRef = this.getSingleGameDocRef(this.game);
                        lastGameSingleDoc = await transaction.get(lastGameSingleDocRef);

                        if (lastGameSingleDoc.exists() && lastGameSingleDoc.data()['newGameId']) {
                            // Aktualisieren Sie this.game mit dem neuen Game Objekt
                            const newGameId = lastGameSingleDoc.data()['newGameId'];

                            this.game.id = newGameId;

                            reject(TransactionStatus.ALREADY_CREATED);
                            return;
                        }
                    }

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

                    newGame.id = newGameId;
                    transaction.update(newGameDocRef, { id: newGameId });
                });
                // Wenn die Transaktion erfolgreich ist, führen Sie die folgenden Anweisungen aus:
                this.game = newGame;
                resolve(TransactionStatus.SUCCES);
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
                console.warn('GAME SERVICE / CREATE GAME DOC geht HIEEEEER ZU ENDE ');
            }
        });
    }

    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////

    async createGameDoc3() {
        console.log('GAME SERVICE__ / __ createGameDoc2 Anfang, firstDataReceived: ', this.firstDataReceived);
        const gameColRef = this.getGameColRef();
        const newGame = new Game();
        const newGameAsJson = newGame.toJson();
        await addDoc(gameColRef, newGameAsJson)
            .then(async (newGameDocRef: DocumentReference<DocumentData>) => {
                // debugger;
                console.warn('Created game doc with ID: ', newGameDocRef?.id);
                const newGameId = newGameDocRef.id;
                this.game = await this.getNewGameAfterUpdatedIds(newGame, newGameId);
                console.warn('GAME SERVICE / !!!!!UPDATEN DER IDs zu ENDE ');
                // debugger;
                // debugger;
            })
            .catch((err) => {
                // debugger;
                console.log(err);
                // debugger;
            });
        console.warn('GAME SERVICE / CREATE 2 geht HIEEEEER ZU ENDE ');
    }

    async getNewGameAfterUpdatedIds(newGame: Game, newGameId: string) {
        // debugger;

        newGame.id = newGameId;
        await this.updateGameDoc(newGame);

        const oldGame = this.game;
        if (oldGame.id) {
            oldGame.newGameId = newGameId;
            await this.updateGameDoc(oldGame);
        }

        return newGame;
    }

    // in old game Obj newGame id speichern
    // firbase old game aktualisieren
    // immer noch old game subscriben
    // wenn new Game id kommt, checken das new Game gefüllt
    // info zum mitspiel zeigen
    // entscheidung von info zu mitspiel auswerten
    // sich entschiedene spieler zum container wieder hinzufügen
    // erst unsubscriben wenn
    // a confirm mitzuspielen
    // cancel mitzuspielen
    // selbst auf start gedrückt
    // selbst auf start nach cancel gedrückt hat

    lastGameId!: string;

    setnewGameId(newGameId: string) {
        this.game.newGameId = newGameId;
    }

    /*     async createGameDoc3() {
        console.log('IN CREATEGAMEDOC ist the firstDataReceived___: ', this.firstDataReceived);
        debugger;
        const gameColRef = this.getGameColRef();

        var oldGame;
        if(this.game) var oldGame = this.game;

        const newGame = new Game();   
        const newGameAsJson = newGame.toJson();

        var currentGameToUpdate = this.newGame;
        if(oldGame) currentGameToUpdate = oldGame;

        await addDoc(gameColRef, newGameAsJson)
            .then(async (newGameDocRef: DocumentReference<DocumentData>) => {
                debugger;

                newGame.id = newGameDocRef.id;
                if(oldGame) oldGame.newGameId = newGameDocRef.id;

                this.game.id = newGameDocRef.id;
                await this.updateGameDoc();
                console.log('Created game doc with ID: ', newGameDocRef?.id);
                debugger;
            })
            .catch((err) => {
                debugger;
                console.log(err);
                debugger;
            });
    } */

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async startNewGame() {
        console.log('GAME SERVICE__ / __ startNeGame__, firstDataReceived: ', this.firstDataReceived);
        this.resetGame();
        await this.createGameDoc();
        // debugger;
        console.log('GAME SERVICE__ / __ VOR NAVIGIEIRE ZU GAME ID, firstDataReceived: ', this.firstDataReceived);

        this.router.navigate([`/game/${this.game.id}`]);
    }

    //#region CRUD
    async createGameDoc() {
        console.log('GAME SERVICE__ / __ createGameDoc Anfang, firstDataReceived: ', this.firstDataReceived);

        // debugger;
        const gameColRef = this.getGameColRef();
        const gameAsJson = this.game.toJson();
        await addDoc(gameColRef, gameAsJson)
            .then(async (gameDocRef: DocumentReference<DocumentData>) => {
                // debugger;
                this.game.id = gameDocRef.id;
                await this.updateGameDoc(this.game);
                console.log('Created game doc with ID: ', gameDocRef?.id);
                // debugger;
            })
            .catch((err) => {
                // debugger;
                console.log(err);
                // debugger;
            });
    }

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

    /* TODO: WAHRSCHEINLICH UNNÖTIG WEIL WIR HIER DIREKT AUF DOKUMENT(GAME) ZUGREIFEN UND NICHT WIE BEI NOTES AUF EINE LISTE (SAMMLUNG) VON DOKUMENTEN */
    getGameColData(): Observable<Game> {
        return collectionData(this.getGameColRef()).pipe(map((gameDocData: DocumentData) => gameDocData as Game));
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

    ///////////////////////////////////////////////////// TO CHECK 29.09.2023 OB NOCH WEITER BENÖTIGT ///////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    startNewGameOLD(): void {
        // debugger;
        /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
        // Holen der collection 'games'
        const gamesCollectionReference = collection(this.firestore, 'games');

        this.resetGame();

        const gameAsJson = this.game.toJson();

        /* Adden eines neuen document in 'games' collection mit dem Value 'this.game' konvertiert davor to JSON durch eigene Methode 'toJson()'.
        Firestore bieter uns eine weitere Methode ähnlich wie 'subscribe', um aus addDoc resultierende Promise aufzulösen, nämlich 'then'.
        UNTERSCHIED: 'Then' wird nur EINMAL aufgerufen, 'subscribe' MEHRMALS'. Für Spielstart um ein neues Game anzulegen, nur ein Dokument in die Collection. braucht man es nur EINMAL!
        Nach 'then' mit der Eingabe des 'DocumentReference' Objekts können wir anschließende Aktionen, wie 'navigate' zu '/game' machen. */
        addDoc(gamesCollectionReference, gameAsJson).then((docRef) => {
            // debugger;
            this.game.id = docRef.id;
            // this.gameSubject.next(this.game);
            this.updateGameDoc(this.game);
            // Start game navigating to '/game/:gameId 'route ('game.component') by the router.
            console.log('Created a new game with ID: ', this.game.id);

            this.router.navigate([`/game/${this.game.id}`]);
        });
    }

    informOtherPlayersAboutNewGame(): void {}
}
