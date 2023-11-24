/**
 * Represents the state and mechanics of a card game.
 * This class holds properties related to the game, players, cards, and their states.
 *
 * Properties are validated using typing.
 * The 'export' keyword before 'class' makes it accessible elsewhere.
 * Each property of the class should have its visibility modifier set.
 */
export class Game {
    /** Unique identifier for the game. */
    public id: string = '';

    /** Array of player names participating in the game. */
    public players: string[] = [];

    /** Array of images associated with each player. */
    public playerImages: string[] = [];

    /** Stack of unplayed cards. */
    public stack: string[] = [];

    /** Stack of cards that have already been played. */
    public playedCards: string[] = [];

    /** Array indicating the mapping of cards from right to bottom stack. */
    public cardsRightToBottomStack: number[] = [0, 1, 2, 3];

    /** Index of the player who currently has the turn. */
    public currentPlayer: number = 0;

    /** Indicates if the game has concluded. */
    public gameOver: boolean = false;

    /** ID for a new game. Used when the current game concludes. */
    public newGameId: string = '';

    /**
     * Properties like pickCardAnimation variables and the current card
     * are included for synchronizing animations and reactions across devices.
     */
    /** Indicates if the pick card animation is currently active. */
    public pickCardAnimation: boolean = false;
    /** Represents the current card in play. */
    public currentCard: string = '';

    /** Predefined profile pictures available for players. */
    public allProfilesPictures: string[] = ['1.webp', '2.png', 'monkey.png', 'pinguin.svg', 'serious-woman.svg', 'winkboy.svg'];

    /**
     * Constructs a new instance of the `Game` class.
     * Initializes the card stack and shuffles it.
     */
    constructor() {
        this.initializeStack();
        this.shuffle(this.stack);
    }

    /**
     * Initializes the card stack with 52 cards from 4 card suits.
     * @private
     */
    private initializeStack(): void {
        // Comment the line below out and comment this line in to make tests and reach a fast game over after only three card draws.
        for (let i = 1; i < 2; i++) {
        // for (let i = 1; i < 14; i++) {
            this.stack.push('spade_' + i);
            this.stack.push('hearts_' + i);
            this.stack.push('clubs_' + i);
            //  Comment the line below out to make tests and reach a fast game over after only three card draws.
            // this.stack.push('diamonds_' + i); // Currently commented out.
        }
    }

    /**
     * Shuffles the provided array of strings in place.
     *
     * @param array - The array to shuffle.
     * @returns The shuffled array.
     *
     * @remarks
     * This method was adapted from a solution provided on StackOverflow.
     * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    shuffle(array: string[]) {
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

    /**
     * Converts the current state of the `Game` object into a plain JavaScript object.
     *
     * @returns The JSON representation of the game.
     */
    public toJson() {
        return {
            id: this.id,
            players: this.players,
            playerImages: this.playerImages,
            stack: this.stack,
            playedCards: this.playedCards,
            cardsRightToBottomStack: this.cardsRightToBottomStack,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            newGameId: this.newGameId,
            /**
             * Properties like pickCardAnimation variables and the current card
             * are included for synchronizing animations and reactions across devices.
             */
            pickCardAnimation: this.pickCardAnimation,
            currentCard: this.currentCard,
        };
    }
}
