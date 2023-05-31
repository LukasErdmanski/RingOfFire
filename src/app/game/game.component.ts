import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  /* Deklaration einer game Variable vom Typ 'Game', erstellt in 'src/models'. */
  /* TypeScript Compiler-Option strictPropertyInitialization zurückzuführen. Diese erfordert,
  dass jede Instanz-Eigenschaft im Konstruktor initialisiert wird, durch einen Eigenschafts-Initialisierer 
  oder durch ausdrückliche Angabe, dass die Eigenschaft undefined sein kann mit einer definitiven Zuweisung. 
  
  Eine definitive Zuweisung mit '!' wird verwendet, um TypeScript mitzuteilen, 
  dass game auf jeden Fall zu einem späteren Zeitpunkt initialisiert wird:*/
  game!: Game;
  currentCard: string = '';

  constructor(public dialog: MatDialog) {}

  /* Führt 'newGame' nach der Initialisierung von Game Objekt aus. */
  ngOnInit() {
    this.newGame();
  }

  /* Erstellt neues Game Objekt */
  newGame() {
    this.game = new Game();
  }

  takeCard() {
    // Die Prüfung erforderlich, damit nur alle 1,5 Sekunden auf die letzte Karte des Stappels gedrückt werden kann, nicht früher.
    if (!this.pickCardAnimation) {
      /* Mit pop() wird das letzte Element aus dem Array entfernt und returnt. Es wird unter 'currentCard' gespeichert. */
      this.currentCard = this.game.stack.pop()!;
      this.pickCardAnimation = true;

      /* Erhöhen / Ändern des aktuellen Spielers nach jedem Kartenzug.
      durch Zirkulation (durch Modulo-Division) */
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      setTimeout(() => {
        // Hinzufügen der aktuell gezogenen Karte zum Stapel bereits gespielten Karten, erst nachdem die Animation zu Ende ist (also pickCardAnimation = false).
        this.game.playedCards.push(this.currentCard);
        // 'pickCardAnimation' wird auf 'false' resetet, damit die 'pick-card-animation' erneut abgespielt werden kann, bei jedem Kartenzugund nicht nur Einmal.
        this.pickCardAnimation = false;
      }, 1005);
    }
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
      }
    });
  }
}
