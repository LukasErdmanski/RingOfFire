import { Injectable, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { CollectionReference, DocumentData, DocumentReference, Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';

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
        this.resetGame();
    }

    async startNewGame() {
        this.resetGame();
        await this.createGameDoc();
        debugger;
        this.router.navigate([`/game/${this.game.id}`]);
    }

    /* Erstellt neues Game Objekt */
    resetGame(): void {
        this.firstDataReceived = false;
        this.game = new Game();
    }

    //#region CRUD
    async createGameDoc() {
        console.log('IN CREATEGAMEDOC ist the firstDataReceived___: ', this.firstDataReceived);
        debugger;
        const gameColRef = this.getGameColRef();
        const gameAsJson = this.game.toJson();
        await addDoc(gameColRef, gameAsJson)
            .then(async (gameDocRef: DocumentReference<DocumentData>) => {
                debugger;
                this.game.id = gameDocRef.id;
                await this.updateGameDoc();
                console.log('Created game doc with ID: ', gameDocRef?.id);
                debugger;
            })
            .catch((err) => {
                debugger;
                console.log(err);
                debugger;
            });
    }

    //#region READ / GET / SUB
    /* TODO: Vielleicht am Ende nach Oben schieben */
    game$!: Observable<Game>;
    gameSub!: Subscription;

    async subGame(): Promise<Game> {
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
                this.game$ = this.getGameDocData();
                this.gameSub = this.game$.subscribe({
                    next: (game) => {
                        console.log('____RECEIVED GAME: ', game);
                        this.updateGameToGameDoc(game);

                        debugger;

                        console.log('IN subGame VOR IF ist the firstDataReceived___: ', this.firstDataReceived);
                        if (!this.firstDataReceived) {
                            this.firstDataReceived = true;
                            resolve(game);
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

    unsubGame() {
        this.gameSub?.unsubscribe();
    }

    getGameDocData(): Observable<Game> {
        const gameSingleDocRef = this.getSingleGameDocRef();
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

    getSingleGameDocRef(): DocumentReference<DocumentData> {
        const gameColRef = this.getGameColRef();
        const gameId = this.game.id;
        return doc(gameColRef, gameId);
    }
    //#endregion READ / GET / SUB

    async updateGameDoc() {
        debugger;
        /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
        const gameSingleDocRef = this.getSingleGameDocRef();
        const gameAsJson = this.game.toJson();
        await updateDoc(gameSingleDocRef, gameAsJson).catch((err) => {
            debugger;
            console.error(err);
        });
    }

    async deleteGameDoc() {
        const gameSingleDocRef = this.getSingleGameDocRef();
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

        // debugger;
    }

    ///////////////////////////////////////////////////// TO CHECK 29.09.2023 OB NOCH WEITER BENÖTIGT ///////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    startNewGameOLD(): void {
        debugger;
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
            this.updateGameDoc();
            // Start game navigating to '/game/:gameId 'route ('game.component') by the router.
            console.log('Created a new game with ID: ', this.game.id);

            this.router.navigate([`/game/${this.game.id}`]);
        });
    }

    informOtherPlayersAboutNewGame(): void {}
}
