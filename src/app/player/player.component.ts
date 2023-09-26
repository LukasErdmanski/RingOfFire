import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
  /* Für die Eingabe des Playernamen und ob der Player gerade aktiv (dran) (= true) ist aus dem 'game.component.html '*/
  @Input() name!: string;
  /* Am Anfang ist ein Spieler nicht aktiv. Diese Variable steuert auch die Aktivität/Vorhandensein 
  der SCCS Klasse 'player-active' für aktiven Spieler in 'player.component.html' */
  @Input() playerActive: boolean = false;
  @Input() image: string = '1.webp';
  @Input() playersSlideContainerHidden: boolean = false;
}
