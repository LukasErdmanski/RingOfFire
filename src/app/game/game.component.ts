/* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
import { Component, OnInit, Output, inject } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  /* Deklaration einer game Variable vom Typ 'Game', erstellt in 'src/models'. */
  /* TypeScript Compiler-Option strictPropertyInitialization zurückzuführen. Diese erfordert,
  dass jede Instanz-Eigenschaft im Konstruktor initialisiert wird, durch einen Eigenschafts-Initialisierer 
  oder durch ausdrückliche Angabe, dass die Eigenschaft undefined sein kann mit einer definitiven Zuweisung. 
  
  Eine definitive Zuweisung mit '!' wird verwendet, um TypeScript mitzuteilen, 
  dass game auf jeden Fall zu einem späteren Zeitpunkt initialisiert wird:*/
  game!: Game;
  gameId: string = '';

  /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
  private firestore: Firestore = inject(Firestore);

  /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
  games$!: Observable<any[]>;

  /* Es wird eine neuer Service, 'route' vom Typ 'ActivatedRoute' injectet und man man die game 'id' aus der Route rauslesen. */
  constructor(public dialog: MatDialog, private route: ActivatedRoute) {}

  /* Führt 'newGame' nach der Initialisierung von Game Objekt aus. */
  ngOnInit() {
    this.newGame();
    /* 'params' ist sn observable of the matrix parameters scoped to this route. Diese werden bei 'ngOnInit' aboniert und die arrow Fn von subscribe eingegeben. */
    this.route.params.subscribe((params) => {
      /* 'params' kann noch andere Paramter der Route beinhaltet, so fokussiert man sich nur auf die Property 'id' */
      console.log(params['id']);
      this.gameId = params['id'];

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
      /* Angular, dieses Programm weißt nicht ob 'game' von Firebase DB dieses Properties wie game.players, game.stack, game.playedCars etc. hat. 
      Um diesen Fehler in strict mode umzugen, schreibt man game: any */
      gameDocumentData$.subscribe((game: any) => {
        // console.log('Game update', game);
        /* Updaten der App Variable game um die Werte aus der Firebase DB. */
        this.game.players = game.players;
        this.game.stack = game.stack;
        this.game.playedCards = game.playedCards;
        this.game.currentPlayer = game.currentPlayer;
        /* Ergänzen um diese Props (Animationsvariable und Variable der aktuellen Karte) für Synchronisierung dieser Reaktionen auf anderen Geräten. */
        this.game.pickCardAnimation = game.pickCardAnimation;
        this.game.currentCard = game.currentCard;
      });
    });
  }

  /* Erstellt neues Game Objekt */
  newGame() {
    this.game = new Game();
  }

  takeCard() {
    // Die Prüfung erforderlich, damit nur alle 1,5 Sekunden auf die letzte Karte des Stappels gedrückt werden kann, nicht früher.
    if (!this.game.pickCardAnimation) {
      /* Mit pop() wird das letzte Element aus dem Array entfernt und returnt. Es wird unter 'currentCard' gespeichert. */
      this.game.currentCard = this.game.stack.pop()!;
      this.game.pickCardAnimation = true;

      /* Erhöhen / Ändern des aktuellen Spielers nach jedem Kartenzug.
      durch Zirkulation (durch Modulo-Division). 
      Aber erst wenn ein Pool an Spielern vorhanden ist, da wenn man vorher erst einige Karten ziehen würde
      und erst dann Spieler adden würde, würde die stylische Anzeige für aktuellen Spieler nicht funktionieren. */
      if (this.game.players.length > 0) {
        this.game.currentPlayer++;
        console.log(this.game.currentPlayer);
        this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      }

      /* Speichern des Game Zustandes / Aktualisieren der Firebase DB nach Kartenzug */
      this.saveGame();

      setTimeout(() => {
        // Hinzufügen der aktuell gezogenen Karte zum Stapel bereits gespielten Karten, erst nachdem die Animation zu Ende ist (also pickCardAnimation = false).
        this.game.playedCards.push(this.game.currentCard);
        // 'pickCardAnimation' wird auf 'false' resetet, damit die 'pick-card-animation' erneut abgespielt werden kann, bei jedem Kartenzugund nicht nur Einmal.
        this.game.pickCardAnimation = false;
        /* Speichern des Game Zustandes / Aktualisieren der Firebase DB des aktuellen Spielers und Hinzufügen der gezogenen Karte zum oberen Kartenstapel */
        this.saveGame();
      }, 1000);
    }
  }

  /* Angular Material Component from https://material.angular.io/components/dialog/overview */
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      /* Adden des Players nach dem Closen des Dialog Fensters,
      aber nur wenn wirklich eine Name exisitert und eingegebunen wurde,
      also 'name && name.length > 0', 
      damit nicht ein Avatat-Name-Konstrukt für ein nicht existierended und "leeres" 'name' aus Array gerendert wird. 
      Es wird automatisch gemäß CRUD automatisch in '<app-player>'
      mittels '*ngFor="let player of game.players' gemäß CRUD gerendert. */
      if (name && name.length > 0) {
        this.game.players.push(name);
        /* Speichern des Game Zustandes / Aktualisieren der Firebase DB nach Hinzufügen des Spielers */
        this.saveGame();
      }
    });
  }

  saveGame() {
    /* From https://betterprogramming.pub/angular-13-firebase-crud-tutorial-with-angularfire-7-2d6980dcc091 */
    const gameDocumentReference = doc(this.firestore, `games/${this.gameId}`);
    updateDoc(gameDocumentReference, this.game.toJson());
  }

  /**
   * Track by function for ngFor directive.
   *
   * This function takes the index and the item itself as parameters and returns
   * a unique identifier for the item. In this case, we are simply using the index
   * of the item as the unique identifier. This helps Angular to optimize the rendering
   * of items in a list by only re-rendering the items that have changed.
   *
   * @param {number} index - The index of the current item in the list.
   * @param {any} item - The item itself. We don't use it in this case, but it's included to conform with Angular's expected signature for trackBy functions.
   * @returns {number} - The unique identifier for the item. In this case, it's the index of the item in the list.
   */
  trackByFn(index: number, item: any): number {
    return index;
  }
}
