import { Injectable, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { Firestore, addDoc, collection, doc, docData, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

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
  gameDocSubscription: any;
  
  firstGameStateUpdate: boolean = false;
  initialDelayGameOverStartBtn: any = undefined;
  
  game!: Game;
  gameId: string = '';
  lastGameId: string = '';

  private gameSubject: BehaviorSubject<Game> = new BehaviorSubject(null);
  game$: Observable<Game> = this.gameSubject.asObservable();

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.setNewGame();
    this.sub();
  }

  sub(): void {
    this.paramsSubscription = this.route.params.subscribe((params) => {
      /* 'params' kann noch andere Paramter der Route beinhaltet, so fokussiert man sich nur auf die Property 'id' */
      console.log(params['id']);
      this.gameId = params['id'];

      if (this.gameId != this.lastGameId) {
        // debugger;
        this.firstGameStateUpdate = false;
        this.initialDelayGameOverStartBtn = undefined;
        this.lastGameId = this.gameId;
      }

      // debugger;

      /* Es wird erstmal das aktuelle Game mit der konkretten ID rausgelesen. 
    Dann wird aus der Collection das Dokument mit einer bestimmten ID geholt.
    Dann wurd das konkrette Dokument, mit der konkretten ID, aboniert, also das eindeutige 'game'. 
    'docData' (genauso wie 'collectionData' nach 'collection') ist ein Obvervable, hier vom Typ DocumentData[] 
    (bei collectionData ist es vom Typ CollectionData[]) ausgeführt direkt nach 'doc'. 
    Es muss also zuerst z.B: mit 'subscribe' aufgelöst werden, 
    um auf die letzten Werte davon zugreifen zu können. /
    /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
      const gameDocumentReference = doc(this.firestore, `games/${this.gameId}`);
      const gameDocumentData$ = docData(gameDocumentReference, { idField: 'id' });
      // debugger;
      /* Angular, dieses Programm weißt nicht ob 'game' von Firebase DB dieses Properties wie game.players, game.stack, game.playedCars etc. hat. 
    Um diesen Fehler in strict mode umzugen, schreibt man game: any */
      this.gameDocSubscription = gameDocumentData$.subscribe((game: any) => {
        // debugger;
        /* Updaten der App Variable game um die Werte aus der Firebase DB. */
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

        if (!this.firstGameStateUpdate) {
          // debugger;
          this.firstGameStateUpdate = true;
          if (this.game.gameOver) {
            this.initialDelayGameOverStartBtn = false;
          } else {
            this.initialDelayGameOverStartBtn = true;
          }
        }
      });
    });
  }

  /* Erstellt neues Game Objekt */
  setNewGame() {
    this.game = new Game();
  }

  saveGame(game: Game, gameId: string) {
    /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
    const gameDocumentReference = doc(this.firestore, `games/${gameId}`);
    updateDoc(gameDocumentReference, game.toJson());
  }

  newGame(game: Game, gameId: string) {
    let samePlayersConfirmation = window.confirm(
      "One of the players on another device started a new game round. Would you like to join it? If yes, press 'OK'. Otherwise, press 'NO' to close this window. You can start a new game round with new players by pressing 'Start Game'."
    );

    let newGame = new Game();

    if (samePlayersConfirmation) {
      // Wenn der Benutzer 'OK' drückt, wird dieser Code ausgeführt
      console.log('A: OK!/YES! YOU JOINED THE NEW GAME ROUND WITH SAME PLAYERS.');

      newGame.players = game.players;
      newGame.player_images = game.player_images;
      if (game.currentPlayer == game.players.length - 1) {
        newGame.currentPlayer = 0;
      } else {
        newGame.currentPlayer = game.currentPlayer + 1;
      }

      this.createNewGame(newGame);
      this.informOtherPlayersAboutNewGame();
    } else {
      // Wenn der Benutzer 'Abbrechen' (oder 'Nein') drückt, wird dieser Code ausgeführt
      console.log('B: NO! YOU CAN START YOUR OWN NEW GAME ROUND WITH NEW PLAYERS.');

      this.createNewGame(newGame);
    }

    let userConfirmation = window.confirm(
      "One of the players on another device started a new game round. Would you like to join it? If yes, press 'OK'. Otherwise, press 'NO' to close this window. You can start a new game round with new players by pressing 'Start Game'."
    );

    if (userConfirmation) {
      // Wenn der Benutzer 'OK' drückt, wird dieser Code ausgeführt
      console.log('A: OK!/YES! YOU JOINED THE NEW GAME ROUND WITH SAME PLAYERS.');

      let newGame = new Game();

      newGame.players = game.players;
      newGame.player_images = game.player_images;
      if (game.currentPlayer == game.players.length - 1) newGame.currentPlayer = 0;
      else newGame.currentPlayer = game.currentPlayer + 1;
    } else {
      // Wenn der Benutzer 'Abbrechen' (oder 'Nein') drückt, wird dieser Code ausgeführt
      console.log('B: NO! YOU CAN START YOUR OWN NEW GAME ROUND WITH NEW PLAYERS.');
    }

    /* Initialisieren eines neuen Games. */
    let game = new Game();

    // addDoc(gamesCollectionReference, game.toJson()).then((docRef) => {
    //   let gameId = docRef.id;
    //   // Start game navigating to '/game/:gameId 'route ('game.component') by the router.
    //   console.log('Created a new game with ID: ', gameId);

    //   this.router.navigate([`/game/${gameId}`]);
    // });
  }

  createNewGame(game: Game): void {
    /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
    // Holen der collection 'games'
    const gamesCollectionReference = collection(this.firestore, 'games');

    /* Adden eines neuen document in 'games' collection mit dem Value 'this.game' konvertiert davor to JSON durch eigene Methode 'toJson()'.
     Firestore bieter uns eine weitere Methode ähnlich wie 'subscribe', um aus addDoc resultierende Promise aufzulösen, nämlich 'then'.
     UNTERSCHIED: 'Then' wird nur EINMAL aufgerufen, 'subscribe' MEHRMALS'. Für Spielstart um ein neues Game anzulegen, nur ein Dokument in die Collection. braucht man es nur EINMAL!
     Nach 'then' mit der Eingabe des 'DocumentReference' Objekts können wir anschließende Aktionen, wie 'navigate' zu '/game' machen. */
    addDoc(gamesCollectionReference, game.toJson()).then((docRef) => {
      let gameId = docRef.id;
      // Start game navigating to '/game/:gameId 'route ('game.component') by the router.
      console.log('Created a new game with ID: ', gameId);

      this.router.navigate([`/game/${gameId}`]);
    });
  }

  informOtherPlayersAboutNewGame(): void {}
}
