import { Component, OnInit } from '@angular/core';
/* Router Libary für die Initialisierung im ctor hier erforderlich und die Verwendung in dieser App. */
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
})
export class StartScreenComponent implements OnInit {
  /* Router gebraucht, um durch Click auf 'start-screen' zu 'game.component' zu routen */
  /* VisibilIty Parameter auf 'private' */
  constructor(private router: Router) {}

  ngOnInit(): void {}

  newGame() {
    // Start game navigating to '/game 'route ('game.component') by the router.
    this.router.navigate(['/game']);
  }
}
