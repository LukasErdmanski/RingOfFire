import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as cardActionsData from '../../assets/cardActionsData/cardActionsData.json';

interface CardAction {
  title: string;
  description: string;
}
@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnChanges {
  /* Card actions from https://github.com/JunusErgin/ringoffire/blob/master/src/app/game-info/game-info.component.ts */
  cardActions: CardAction[] = cardActionsData;

  /* Variablen mit welchen die korrespondieren 'title' und 'description' gemäß 'card' (aktuelle Karte) eingestellt
  und in game-info.component.html gesetzt werden. */
  title: string = '';
  description: string = '';

  /* Es wird eine aktuelle Karte ('card') gebruacht um durch entsprechende Element in cardActions Array zu finden.
  Wird in 'game.component.ts' eingegeben. */
  @Input() card!: string;
  hidden: boolean = false;

  /* Es wird eine andere Methode als 'ngOnInit' erforderlich, damit 'card' Variable nicht nur bei 'ngOnInit' verarbeitet wird,
  nur bei jeder Änderung, z.B. bei jedem Kartenzug. Muss genauso wie 'ngOnInit' mit 'implement OnChanges'hinter Klassensignatur
  und oben bei 'import' berücksichtigt werden. */
  ngOnChanges(): void {
    /* Dies soll nur ausgeführt werden, wenn card bereits initialisiert wurde. 
    Vor allem nicht am Anfang wenn es 'undefined' ist zum JS-Script-Fehler führt */
    if (this.card) {
      console.log('Current card is ', this.card);
      /* Mit +Array[IndexDesArrayElements] wird ein das ArrayElement in Number gewandelt. */

      this.setCardAction();
    }
  }

  setCardAction(): void {
    // debugger;
    let cardNumber = +this.card.split('_')[1];

    /* Weil currentCard zw. 1 und 13 ist und card diesen Wert zugewiesen bekommt, muss cardNummber um 1 reduziert werden,
    um korrespondierend im 'cardActions' zu interrieren. */
    this.title = this.cardActions[cardNumber - 1].title;
    this.description = this.cardActions[cardNumber - 1].description;
  }

  moveDownTop() {
    this.hidden = !this.hidden;
  }
}
