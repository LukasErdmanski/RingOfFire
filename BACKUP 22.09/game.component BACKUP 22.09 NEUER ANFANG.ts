/* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
import { Component, Input, OnInit, SimpleChanges, inject } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { filter, take } from 'rxjs/operators';
import { Event } from '@angular/router'; // Importiere den korrekten Event-Typ

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
  // gameId: string = '';
  routeGameId: string = '';
  // gameOver: boolean = false;
  firstGameUpdate: boolean = false;
  // initialDelayGameOverStartBtn: any = undefined;
  lastGameId: string = '';

  /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
  private firestore: Firestore = inject(Firestore);

  /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
  // games$!: Observable<any[]>;

  private routeParamsSubscription?: Subscription;
  private gameDocSubscription?: Subscription;
  private dialogRefSubscription?: Subscription;
  gameSubscription!: Subscription;

  // @Input() navigationParameter: any;

  // cardsRightToBottomStack: any[] = [0, 1, 2, 3];

  /* Es wird eine neuer Service, 'route' vom Typ 'ActivatedRoute' injectet und man man die game 'id' aus der Route rauslesen. */
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  /* Führt 'newGame' nach der Initialisierung von Game Objekt aus. */
  ngOnInit() {
    debugger;
    this.subscribeToRouteParams();
    console.log('_____________THIS IS CURRNE GAME________ ', this.game);
    debugger;
    this.subscribeToGameFromGameService();
  }

  subscribeToRouteParams(): void {
    this.routeParamsSubscription = this.route.params.subscribe((params) => {
      // debugger;
      /* 'params' kann noch andere Paramter der Route beinhaltet, so fokussiert man sich nur auf die Property 'id' */
      console.log(params['id']);
      this.routeGameId = params['id'];

      // debugger;
      // Überprüfen, ob routeGameId gesetzt ist, bevor subscribeGame aufgerufen wird.
      if (this.routeGameId) {
        // debugger;
        this.gameService.subscribeToGameFromFirebase(this.routeGameId);
      }
    });
  }

  firstFetch: boolean = false; // startet als false

  // ...

  subscribeToGameFromGameService(): void {
    this.gameSubscription = this.gameService.game$.subscribe((game: Game) => {
      if (game) {
        this.game = game;
        if (game.gameOver) {
          if (!this.firstFetch) {
            // Überprüfung hier hinzufügen
            debugger;
            const currentNavigation = this.router.getCurrentNavigation();
            console.log(currentNavigation?.extras?.state);

            if (this.gameSubscription) {
              this.gameSubscription.unsubscribe();
            }

            this.router.navigate(['/game-over-screen'], {
              state: { initialDelayGameOverStartBtn: false },
            });
          } else {
            // Überprüfung hier hinzufügen
            debugger;
            const currentNavigation = this.router.getCurrentNavigation();
            console.log(currentNavigation?.extras?.state);

            if (this.gameSubscription) {
              this.gameSubscription.unsubscribe();
            }

            this.router.navigate(['/game-over-screen'], {
              state: { initialDelayGameOverStartBtn: true },
            });
          }
        }
        this.firstFetch = true;
      }
    });
  }

  subscribeToGameFromGameService6(): void {
    this.gameSubscription = this.gameService.game$.subscribe((game: Game) => {
      if (game) {
        this.game = game;
        if (game.gameOver) {
          if (!this.firstFetch) {
            debugger;
            this.router
              .navigate(['/game-over-screen'], {
                state: {
                  initialDelayGameOverStartBtn: false,
                },
              })
              .then(() => {
                // Nach der Navigation, prüfe den aktuellen State
                const currentNavigation = this.router.getCurrentNavigation();
                console.log(currentNavigation?.extras?.state);
              });
          } else {
            alert('HIER ENTSTEHT FADE OUT FADE IN');
            this.router
              .navigate(['/game-over-screen'], {
                state: {
                  initialDelayGameOverStartBtn: true,
                },
              })
              .then(() => {
                // Nach der Navigation, prüfe den aktuellen State
                const currentNavigation = this.router.getCurrentNavigation();
                console.log(currentNavigation?.extras?.state);
              });
            // Navigation mit Fade-In
            // Hier müsstest du die Logik für die Navigation mit Fade-In implementieren
          }
        }
        this.firstFetch = true;
      }
    });
  }

  subscribeToGameFromGameService4(): void {
    this.gameSubscription = this.gameService.game$.subscribe((game: Game) => {
      debugger;
      if (game) {
        debugger;

        this.game = game;

        if (this.game.id != this.lastGameId) this.resetGameState();
        if (!this.firstGameUpdate) this.initializeGameState();
      }
    });
  }

  resetGameState(): void {
    this.firstGameUpdate = false;
    // this.initialDelayGameOverStartBtn = undefined;
    this.lastGameId = this.game.id;
  }

  initializeGameState() {
    if (!this.firstGameUpdate) {
      this.firstGameUpdate = true;
      if (this.game.gameOver) {
        // this.initialDelayGameOverStartBtn = false;
      } else {
        // this.initialDelayGameOverStartBtn = true;
      }
    }
  }

  ngOnDestroy() {
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }

  /* Erstellt neues Game Objekt */
  // newGame() {
  //   this.game = new Game();
  // }

  takeCard() {
    // Die Prüfung erforderlich, damit nur alle 1,5 Sekunden auf die letzte Karte des Stappels gedrückt werden kann, nicht früher.
    if (!this.game.pickCardAnimation) {
      /* Mit pop() wird das letzte Element aus dem Array entfernt und returnt. Es wird unter 'currentCard' gespeichert. */
      this.game.currentCard = this.game.stack.pop()!;

      /* Reduziert das Array 'cardsRightToBottomStack' wenn nur <= 4 Karten übrig sind, 
      damit diese reduziert richtig nach jedem Zug dargestellt sind, 
      wenn 48 Karten von unterem Stapel bereits gezogen wurden. */
      if (this.game.stack.length <= 3)
        this.game.cardsRightToBottomStack.splice(this.game.cardsRightToBottomStack.length - 1, 1);

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
      this.gameService.saveGame(this.game);

      setTimeout(() => {
        // Hinzufügen der aktuell gezogenen Karte zum Stapel bereits gespielten Karten, erst nachdem die Animation zu Ende ist (also pickCardAnimation = false).
        this.game.playedCards.push(this.game.currentCard);
        // 'pickCardAnimation' wird auf 'false' resetet, damit die 'pick-card-animation' erneut abgespielt werden kann, bei jedem Kartenzugund nicht nur Einmal.
        this.game.pickCardAnimation = false;
        /* Speichern des Game Zustandes / Aktualisieren der Firebase DB des aktuellen Spielers und Hinzufügen der gezogenen Karte zum oberen Kartenstapel */

        if (this.game.stack.length == 0) {
          // debugger;
          this.game.gameOver = true;
        }

        this.gameService.saveGame(this.game);
      }, 1000);
    }

    console.log('GAME UPDATE: ', this.game);
  }

  /* Angular Material Component from https://material.angular.io/components/dialog/overview */
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    this.dialogRefSubscription = dialogRef.afterClosed().subscribe((name: string) => {
      /* Adden des Players nach dem Closen des Dialog Fensters,
      aber nur wenn wirklich eine Name exisitert und eingegebunen wurde,
      also 'name && name.length > 0', 
      damit nicht ein Avatar-Name-Konstrukt für ein nicht existierended und "leeres" 'name' aus Array gerendert wird. 
      Es wird automatisch gemäß CRUD automatisch in '<app-player>'
      mittels '*ngFor="let player of game.players' gemäß CRUD gerendert. */
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.game.player_images.push('1.webp');
        /* Speichern des Game Zustandes / Aktualisieren der Firebase DB nach Hinzufügen des Spielers */
        this.gameService.saveGame(this.game);
      }
    });
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
