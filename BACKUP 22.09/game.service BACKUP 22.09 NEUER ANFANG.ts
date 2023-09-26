import { Injectable, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { DocumentData, Firestore, addDoc, collection, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';

/* Sie möchten nicht mehrere Instanzen desselben Service in Ihrer Anwendung haben. 
  Wenn Sie einen Service über den Konstruktor einer Komponente bereitstellen, 
  erstellt Angular keine neue Instanz des Services, sondern verwendet eine Singleton-Instanz, 
  die im Root-Injector der Anwendung vorhanden ist. Dies ist genau das Verhalten, das Sie wollen.

  In Angular, wenn ein Service mit dem @Injectable({ providedIn: 'root' }) Dekorator markiert ist (wie es üblich ist), 
  dann wird der Service als Singleton behandelt. Das bedeutet, dass Angular automatisch eine einzige Instanz des Service erstellt 
  und diese an alle Komponenten bereitstellt, die den Service benötigen. 
  Wenn Sie den Service in den Konstruktor einer Komponente injizieren, erhalten Sie Zugriff auf diese Singleton-Instanz.

  Also, obwohl es so aussieht, als würden Sie jedes Mal eine neue Instanz des Service erstellen, 
  wenn Sie den Service in den Konstruktor einer Komponente injizieren, ist das nicht der Fall. 
  Sie greifen tatsächlich auf die gleiche Singleton-Instanz des Service zu, egal in welcher Komponente Sie sich befinden.

  Daher ist Ihr ursprünglicher Ansatz, den Service im Konstruktor zu injizieren, korrekt und wird empfohlen: */
@Injectable({
    providedIn: 'root',
})
export class GameService {
    private firestore: Firestore = inject(Firestore);

    paramsSubscription: any;
    gameDocumentSubscription: any;

    game!: Game;
    routeGameId: string = '';

    // private gameSubject: BehaviorSubject<Game | null> = new BehaviorSubject<Game | null>(null);
    gameSubject: BehaviorSubject<Game> = new BehaviorSubject<Game>(this.game);
    game$: Observable<Game> = this.gameSubject.asObservable();

    constructor(private router: Router) {}

    /* Erstellt neues Game Objekt */
    resetGame(): void {
        this.game = new Game();

        // this.game.gameOver = false;
    }

    subscribeToGameFromFirebase(gameId: string): void {
        debugger;
        this.resetGame();

        /* Es wird erstmal das aktuelle Game mit der konkretten ID rausgelesen. 
    Dann wird aus der Collection das Dokument mit einer bestimmten ID geholt.
    Dann wurd das konkrette Dokument, mit der konkretten ID, aboniert, also das eindeutige 'game'. 
    'docData' (genauso wie 'collectionData' nach 'collection') ist ein Obvervable, hier vom Typ DocumentData[] 
    (bei collectionData ist es vom Typ CollectionData[]) ausgeführt direkt nach 'doc'. 
    Es muss also zuerst z.B: mit 'subscribe' aufgelöst werden, 
    um auf die letzten Werte davon zugreifen zu können. /
    /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
        const gameDocumentReference = doc(this.firestore, `games/${gameId}`);
        const gameDocumentData$ = docData(gameDocumentReference, { idField: 'id' });
        // debugger;
        /* Angular, dieses Programm weißt nicht ob 'game' von Firebase DB dieses Properties wie game.players, game.stack, game.playedCars etc. hat. 
  Um diesen Fehler in strict mode umzugen, schreibt man game: any */
        this.gameDocumentSubscription = gameDocumentData$.pipe(map((gameDocumentData: DocumentData) => gameDocumentData as Game)).subscribe((game) => {
            this.updateGame(game);
        });
    }

    ngOnDestroy() {
        if (this.gameDocumentSubscription) {
            this.gameDocumentSubscription.unsubscribe();
        }
    }

    updateGame(game: Game) {
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
        this.gameSubject.next(this.game); // Update the game observable
    }

    saveGame(game: Game) {
        /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
        const gameDocumentReference = doc(this.firestore, `games/${game.id}`);
        const gameAsJson = game.toJson();
        updateDoc(gameDocumentReference, gameAsJson);
    }

    startNewGame(): void {
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
            this.saveGame(this.game);
            // Start game navigating to '/game/:gameId 'route ('game.component') by the router.
            console.log('Created a new game with ID: ', this.game.id);

            this.router.navigate([`/game/${this.game.id}`]);
        });
    }

    informOtherPlayersAboutNewGame(): void {}
}
