export interface IGame {
    /** Unique identifier for the game. */
    id: string;
    /** Array of player names participating in the game. */
    players: string[];
    /** Array of images associated with each player. */
    playerImages: string[];
    /** Stack of unplayed cards. */
    stack: string[];
    /** Stack of cards that have already been played. */
    playedCards: string[];
    /** Array indicating the mapping of cards from right to bottom stack. */
    cardsRightToBottomStack: number[];
    /** Index of the player who currently has the turn. */
    currentPlayer: number;
    /** Indicates if the game has concluded. */
    gameOver: boolean;
    /** ID for a new game. Used when the current game concludes. */
    newGameId: string;
    /**
     * Properties like pickCardAnimation variables and the current card
     * are included for synchronizing animations and reactions across devices.
     */
    /** Indicates if the pick card animation is currently active. */
    pickCardAnimation: boolean;
    /** Represents the current card in play. */
    currentCard: string;
}
