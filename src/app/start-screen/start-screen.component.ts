import { Component, OnInit, inject } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
/* Router Libary für die Initialisierung im ctor hier erforderlich und die Verwendung in dieser App. */
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
})
export class StartScreenComponent implements OnInit {
  /* From https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md */
  private firestore: Firestore = inject(Firestore);

  /* Router gebraucht, um durch Click auf 'start-screen' zu 'game.component' zu routen */
  /* VisibilIty Parameter auf 'private' */
  constructor(private router: Router) {}

  ngOnInit(): void {}

  newGame() {
    /* Initialisieren eines neuen Games. */
    let game = new Game();

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
      console.log('Cread a new game with ID: ', gameId);
      this.router.navigate([`/game/${gameId}`]);
    });
  }
}
