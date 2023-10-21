import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';

/**
 * Component for the start screen of the game.
 */
@Component({
    selector: 'app-start-screen',
    templateUrl: './start-screen.component.html',
    styleUrls: ['../../assets/scss/screen.scss'],
})
export class StartScreenComponent {
    /**
     * Initializes a new instance of the `StartScreenComponent`.
     *
     * @param gameService - Service to manage the game.
     * @param router - Angular router for navigation.
     */
    constructor(private gameService: GameService, private router: Router) {}

    /**
     * Starts a new game by creating a game document and navigating to the game screen.
     *
     * @throws Will throw an error if the game document creation fails.
     */
    public async startNewGame(): Promise<void> {
        try {
            await this.gameService.createGameDoc();
            // Here you navigate to the new game
            this.router.navigate([`/game/${this.gameService.game.id}`]);
        } catch (error) {
            console.error('An error occurred while creating the game. Error:', error);
            alert(`An error occurred while creating the game. 
            Error: ${error}
            The app will be reloaded.`);
            // Back to the start screen
            this.router.navigate(['/start']);
        }
    }
}