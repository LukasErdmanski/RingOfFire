import { Injectable } from '@angular/core';
import { IGame } from 'src/app/interfaces/game';
import { FirebaseService } from './firebase.service';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, takeLast } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    game: IGame = this.initGame();

    constructor(private route: ActivatedRoute, private firebaseService: FirebaseService) {
        // this.getGame();
        // this.testNewStructure();
    }

    async testNewStructure() {
        await this.firebaseService.createGame(this.game);

        this.game.id = this.firebaseService.gameId;
        this.game.players.push('Lukas');
        await this.firebaseService.updateGame(this.game);

        this.firebaseService.readGame(this.firebaseService.gameId).subscribe();
    }

    /**
     * Creates a new instance of the Game with the initial values.
     * Fills initially the stack with game cards and shuffles it.
     * Adds the game on the Firebase.
     */
    createGame(): void {
        const newGame: IGame = this.initGame();
        this.fillCardStack(newGame);
        this.shuffleGameStack(newGame.stack);
        // return this.firebaseService.addGame(newGame);

        // TODO: Decide where to assing the returned id of the firebase document als result of the addDoc method. Here at the end of method or in firebase service at the of the the addGame method.
    }

    private initGame(): IGame {
        return {
            id: '',
            players: [],
            playerImages: [],
            stack: [],
            playedCards: [],
            cardsRightToBottomStack: [0, 1, 2, 3],
            currentPlayer: 0,
            gameOver: false,
            newGameId: '',
            pickCardAnimation: false,
            currentCard: '',
            allProfilesPictures: ['1.webp', '2.png', 'monkey.png', 'pinguin.svg', 'serious-woman.svg', 'winkboy.svg'],
        };
    }

    /**
     * Fill initially the card stack with 52 cards from 4 card suits.
     * @private
     */
    private fillCardStack(game: IGame) {
        // Comment the line below out and comment this line in to make tests and reach a fast game over after only three card draws.
        // for (let i = 1; i < 2; i++) {
        for (let i = 1; i < 14; i++) {
            game.stack.push('spade_' + i);
            game.stack.push('hearts_' + i);
            game.stack.push('clubs_' + i);
            //  Comment the line below out to make tests and reach a fast game.stack over after only three card draws.
            game.stack.push('diamonds_' + i); // Currently commented out.
        }
    }

    /**
     * Shuffles the provided array of strings (here game stack) in place.
     *
     * @param array - The array (here game stack) to shuffle.
     * @returns The shuffled array (here game stack).
     *
     * @remarks
     * This method was adapted from a solution provided on StackOverflow.
     * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    private shuffleGameStack(array: string[]) {
        let currentIndex = array.length,
            randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    getGame() {
        const id = String(this.route.snapshot.paramMap.get('id'));
        this.firebaseService.readGame(id).subscribe((game) => {
            this.game = game;
            console.log('IN GAME LOGIC: Type of game is:', typeof game);
            console.log('IN GAME LOGIC: ______GAME:', game);
        });
    }

    save() {
        if (this.game) {
            // this.firebaseService.updateGame();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Handles the card-taking process and related game logic.
     */
    takeCard(game: IGame): void {
        // Ensures a card is taken only once every 1.5 seconds.
        if (!game.pickCardAnimation) {
            // this.updateCurrentCard(game);
            // this.updateStack(game);
            // this.updateCurrentPlayer(game);
            // this.updateCurrentPlayer();
            // this.firebaseService.updateGameDoc(this.game);
            // this.handleCardAnimation();
        }
    }

    /**
     * Updates the current card by taking the top card from the stack.
     */
    private updateCurrentCard(): void {
        // this.game.currentCard = this.game.stack.pop()!;
    }
}
