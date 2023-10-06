import { Component } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-start-screen',
    templateUrl: './start-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class StartScreenComponent {
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
    // Der GameService wird hier injiziert
    constructor(private gameService: GameService, private router: Router) {}

    async startNewGame() {
        try {
            const status = await this.gameService.createGameDoc2(); // Hier wird die Methode aufgerufen

            // Wenn das Promise aufgelöst wird, navigieren Sie zum Spiel mit der neuen ID
            console.log('Transaction Status:', status);
            this.router.navigate([`/game/${this.gameService.game.id}`]); // Hier navigieren Sie zum neuen Spiel
        } catch (error) {
            console.error('Ein Fehler ist aufgetreten:', error);
            alert(`Es ist ein Fehler beim Erstellen des Spiels aufgetreten. 
            Fehler: ${error}
            Die App wird neu geladen.`);
            
         // Zurück zum Startbildschirm
         this.router.navigate(['/start']);
        }
    }
}
